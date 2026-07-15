import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";
import { getMetaApiConfig } from "./metaapi-config.server";

type Side = "BUY" | "SELL";
export type TradeRequest = {
  symbol: string;
  side: Side;
  lot: number;
  tpPips: number;
  slPips: number;
  maxSpreadPips?: number;
};

/** Adaptive point size — FX default, JPY/metals, indices/crypto. */
function pipMultiplier(symbol: string): number {
  const s = symbol.toUpperCase();
  if (/JPY|XAU|GOLD|XAG|SILVER/.test(s)) return 0.01;
  if (/US30|US100|NAS100|NDX|SPX|US500|GER40|DAX|UK100|FTSE|BTC|ETH|XRP|SOL|DOGE|LTC/.test(s)) return 1.0;
  return 0.0001;
}

/**
 * Market order to the user's MT5 account via MetaApi.cloud REST.
 * Fetches live bid/ask to compute absolute SL/TP + spread guard; falls back
 * to relative pips if price data is unavailable.
 *
 * Required server env: METAAPI_TOKEN, METAAPI_ACCOUNT_ID. Optional: METAAPI_REGION.
 */
export const executeTrade = createServerFn({ method: "POST" })
  .inputValidator((data: TradeRequest) => {
    if (!data || typeof data !== "object") throw new Error("invalid payload");
    const symbol = typeof data.symbol === "string" ? data.symbol.trim().toUpperCase() : "";
    if (!/^[A-Z0-9._#]{3,16}$/.test(symbol)) throw new Error("invalid symbol");
    if (data.side !== "BUY" && data.side !== "SELL") throw new Error("side must be BUY or SELL");
    const lot = Number(data.lot);
    if (!Number.isFinite(lot) || lot <= 0 || lot > 10) throw new Error("lot must be > 0 and <= 10");
    const tpPips = Number(data.tpPips);
    const slPips = Number(data.slPips);
    if (!Number.isFinite(tpPips) || tpPips <= 0 || tpPips > 10000) throw new Error("tpPips must be > 0 and <= 10000");
    if (!Number.isFinite(slPips) || slPips <= 0 || slPips > 10000) throw new Error("slPips must be > 0 and <= 10000");
    const raw = data.maxSpreadPips;
    const maxSpreadPips = raw === undefined || raw === null ? undefined : Number(raw);
    if (maxSpreadPips !== undefined && (!Number.isFinite(maxSpreadPips) || maxSpreadPips <= 0 || maxSpreadPips > 1000)) {
      throw new Error("maxSpreadPips must be > 0 and <= 1000");
    }
    return { symbol, side: data.side, lot, tpPips, slPips, maxSpreadPips } satisfies TradeRequest;
  })
  .handler(async ({ data }) => {
    requireAppAccess();
    const { token, accountId, region } = getMetaApiConfig();
    if (!token || !accountId) {
      return { ok: false as const, status: 0, body: "MetaApi not configured: add METAAPI_TOKEN and METAAPI_ACCOUNT_ID secrets.", attempts: 0 };
    }
    const base = `https://mt-client-api-v1.${region}.agiliumtrade.ai/users/current/accounts/${accountId}`;
    const pip = pipMultiplier(data.symbol);

    let entryPrice: number | undefined;
    let spreadPips: number | undefined;
    try {
      const priceRes = await fetch(`${base}/symbols/${encodeURIComponent(data.symbol)}/current-price`, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(8000),
      });
      if (priceRes.ok) {
        const p = (await priceRes.json()) as { bid?: number; ask?: number };
        if (typeof p.bid === "number" && typeof p.ask === "number") {
          entryPrice = data.side === "BUY" ? p.ask : p.bid;
          spreadPips = (p.ask - p.bid) / pip;
        }
      }
    } catch { /* best-effort */ }

    const maxSpread = data.maxSpreadPips ?? 5;
    if (spreadPips !== undefined && spreadPips > maxSpread) {
      return {
        ok: false as const,
        status: 0,
        blocked: true,
        body: `Trade blocked: spread ${spreadPips.toFixed(1)} pips exceeds cap of ${maxSpread} pips.`,
        spreadPips: Number(spreadPips.toFixed(2)),
        entryPrice,
        attempts: 0,
      };
    }

    const url = `${base}/trade`;
    const orderBody: Record<string, unknown> = {
      actionType: data.side === "BUY" ? "ORDER_TYPE_BUY" : "ORDER_TYPE_SELL",
      symbol: data.symbol,
      volume: data.lot,
      magic: 20260617,
      comment: "SuperChargedEA",
    };
    if (entryPrice !== undefined) {
      const digits = pip < 1 ? 5 : 2;
      const r = (n: number) => Number(n.toFixed(digits));
      orderBody.stopLoss = r(data.side === "BUY" ? entryPrice - data.slPips * pip : entryPrice + data.slPips * pip);
      orderBody.takeProfit = r(data.side === "BUY" ? entryPrice + data.tpPips * pip : entryPrice - data.tpPips * pip);
    } else {
      orderBody.stopLoss = data.slPips;
      orderBody.stopLossUnits = "RELATIVE_PIPS";
      orderBody.takeProfit = data.tpPips;
      orderBody.takeProfitUnits = "RELATIVE_PIPS";
    }
    const payload = JSON.stringify(orderBody);

    let lastErr = "unknown";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "auth-token": token },
          body: payload,
          signal: AbortSignal.timeout(12000),
        });
        const body = await res.text();
        const safe = scrubSecrets(body);
        if (res.ok) {
          return {
            ok: true as const,
            status: res.status,
            body: safe,
            attempts: attempt,
            entryPrice,
            spreadPips: spreadPips !== undefined ? Number(spreadPips.toFixed(2)) : undefined,
          };
        }
        lastErr = `HTTP ${res.status}: ${safe.slice(0, 200)}`;
      } catch (e) {
        lastErr = scrubSecrets((e as Error).message);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    return { ok: false as const, status: 0, body: lastErr, attempts: 3, entryPrice, spreadPips };
  });
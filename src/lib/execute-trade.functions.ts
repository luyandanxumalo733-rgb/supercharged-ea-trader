import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";

type Side = "BUY" | "SELL";
export type TradeRequest = {
  symbol: string;
  side: Side;
  lot: number;
  tpPips: number;
  slPips: number;
};

/**
 * Sends a market order to the user's MT5 account via the MetaApi.cloud REST API.
 * No local Python bridge / Ngrok is required — MetaApi hosts the MT5 terminal in the cloud
 * and exposes a hosted REST endpoint we hit directly with the account's auth token.
 *
 * Required server env: METAAPI_TOKEN, METAAPI_ACCOUNT_ID. Optional: METAAPI_REGION (default new-york).
 */
export const executeTrade = createServerFn({ method: "POST" })
  .inputValidator((data: TradeRequest) => {
    if (!data || typeof data !== "object") throw new Error("invalid payload");
    // Symbol: uppercase alnum + a few common separators, 3–16 chars.
    // Covers forex, metals, indices, crypto, and stock tickers accepted by MetaApi.
    const symbol = typeof data.symbol === "string" ? data.symbol.trim().toUpperCase() : "";
    if (!/^[A-Z0-9._#]{3,16}$/.test(symbol)) {
      throw new Error("invalid symbol");
    }
    // Side must be a strict enum.
    if (data.side !== "BUY" && data.side !== "SELL") {
      throw new Error("side must be BUY or SELL");
    }
    // Lot: positive finite, upper-bounded to protect the account from margin blow-ups.
    const lot = Number(data.lot);
    if (!Number.isFinite(lot) || lot <= 0 || lot > 10) {
      throw new Error("lot must be > 0 and <= 10");
    }
    // Risk levels required and positive; upper bound keeps callers honest.
    const tpPips = Number(data.tpPips);
    const slPips = Number(data.slPips);
    if (!Number.isFinite(tpPips) || tpPips <= 0 || tpPips > 10000) {
      throw new Error("tpPips must be > 0 and <= 10000");
    }
    if (!Number.isFinite(slPips) || slPips <= 0 || slPips > 10000) {
      throw new Error("slPips must be > 0 and <= 10000");
    }
    return { symbol, side: data.side, lot, tpPips, slPips } satisfies TradeRequest;
  })
  .handler(async ({ data }) => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    // Hardcoded to the London terminal per deployment requirement.
    const region = (process.env.METAAPI_REGION || "london");
    if (!token || !accountId) {
      return { ok: false, status: 0, body: "MetaApi not configured: add METAAPI_TOKEN and METAAPI_ACCOUNT_ID secrets.", attempts: 0 };
    }
    const url = `https://mt-client-api-v1.${region}.agiliumtrade.ai/users/current/accounts/${accountId}/trade`;
    const payload = JSON.stringify({
      actionType: data.side === "BUY" ? "ORDER_TYPE_BUY" : "ORDER_TYPE_SELL",
      symbol: data.symbol,
      volume: data.lot,
      stopLoss: data.slPips,
      stopLossUnits: "RELATIVE_PIPS",
      takeProfit: data.tpPips,
      takeProfitUnits: "RELATIVE_PIPS",
      magic: 20260617,
      comment: "SuperChargedEA",
    });
    // Resilient bridge call: 3 attempts with exponential backoff so transient
    // network blips don't kill 24/7 execution.
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
        if (res.ok) return { ok: true, status: res.status, body: safe, attempts: attempt };
        lastErr = `HTTP ${res.status}: ${safe.slice(0, 200)}`;
      } catch (e) {
        lastErr = scrubSecrets((e as Error).message);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    return { ok: false, status: 0, body: lastErr, attempts: 3 };
  });
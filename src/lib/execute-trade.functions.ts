import { createServerFn } from "@tanstack/react-start";

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
    if (!data.symbol || !data.side) throw new Error("symbol/side required");
    if (!(data.lot > 0)) throw new Error("lot must be > 0");
    return data;
  })
  .handler(async ({ data }) => {
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    const region = process.env.METAAPI_REGION || "new-york";
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
        if (res.ok) return { ok: true, status: res.status, body, attempts: attempt };
        lastErr = `HTTP ${res.status}: ${body.slice(0, 200)}`;
      } catch (e) {
        lastErr = (e as Error).message;
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    return { ok: false, status: 0, body: lastErr, attempts: 3 };
  });
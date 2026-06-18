import { createServerFn } from "@tanstack/react-start";

type Side = "BUY" | "SELL";
export type TradeRequest = {
  bridgeUrl: string;
  login: string;
  password?: string;
  server: string;
  symbol: string;
  side: Side;
  lot: number;
  tpPips: number;
  slPips: number;
};

/**
 * Forwards a trade order to the user's self-hosted MT5/MT4 bridge.
 * The bridge must expose POST {bridgeUrl}/order accepting JSON and talking to MetaTrader.
 * (MT5/MT4 has no public web API — a local bridge is required.)
 */
export const executeTrade = createServerFn({ method: "POST" })
  .inputValidator((data: TradeRequest) => {
    if (!data?.bridgeUrl?.startsWith("http")) throw new Error("Invalid bridge URL");
    if (!data.symbol || !data.side) throw new Error("symbol/side required");
    if (!(data.lot > 0)) throw new Error("lot must be > 0");
    return data;
  })
  .handler(async ({ data }) => {
    const url = data.bridgeUrl.replace(/\/$/, "") + "/order";
    const payload = JSON.stringify({
      login: data.login,
      password: data.password,
      server: data.server,
      symbol: data.symbol,
      side: data.side,
      volume: data.lot,
      tp_pips: data.tpPips,
      sl_pips: data.slPips,
      magic: 20260617,
    });
    // Resilient bridge call: 3 attempts with exponential backoff so transient
    // VPS/network blips don't kill 24/7 execution.
    let lastErr = "unknown";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
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
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: data.login,
          password: data.password,
          server: data.server,
          symbol: data.symbol,
          side: data.side,
          volume: data.lot,
          tp_pips: data.tpPips,
          sl_pips: data.slPips,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: (e as Error).message };
    }
  });
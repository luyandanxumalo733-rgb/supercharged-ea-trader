import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { executeTrade, type TradeRequest } from "@/lib/execute-trade.functions";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Manual Signal Panel — SuperCharged EA" },
      { name: "description", content: "Test MetaApi executions manually: symbol, side, volume, SL and TP in pips." },
    ],
  }),
  component: ManualPanel,
});

type LogEntry = {
  at: string;
  ok: boolean;
  blocked?: boolean;
  msg: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice?: number;
  spreadPips?: number;
};

function ManualPanel() {
  const send = useServerFn(executeTrade);
  const [symbol, setSymbol] = useState("EURUSD");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [volume, setVolume] = useState("0.10");
  const [slPips, setSlPips] = useState("20");
  const [tpPips, setTpPips] = useState("40");
  const [maxSpread, setMaxSpread] = useState("5");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: TradeRequest = {
        symbol: symbol.trim().toUpperCase(),
        side,
        lot: Number(volume),
        slPips: Number(slPips),
        tpPips: Number(tpPips),
        maxSpreadPips: Number(maxSpread),
      };
      const res = await send({ data: payload });
      const entry: LogEntry = {
        at: new Date().toLocaleTimeString(),
        ok: res.ok,
        blocked: "blocked" in res ? res.blocked : undefined,
        msg: res.body ?? "",
        symbol: payload.symbol,
        side: payload.side,
        entryPrice: "entryPrice" in res ? res.entryPrice : undefined,
        spreadPips: "spreadPips" in res ? res.spreadPips : undefined,
      };
      setLog((l) => [entry, ...l].slice(0, 20));
      if (res.ok) toast.success(`Order accepted @ ${entry.entryPrice ?? "market"}`);
      else if (entry.blocked) toast.warning("Trade blocked by spread guard", { description: res.body });
      else toast.error("Trade rejected", { description: res.body });
    } catch (err) {
      toast.error("Request failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen pb-28 text-foreground">
      <header className="mx-auto flex max-w-md items-center gap-3 px-4 pt-6">
        <Link to="/settings" className="rounded-lg p-2 hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-black uppercase tracking-wider">Manual Signal Panel</h1>
      </header>

      <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-3 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/60">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="EURUSD, XAUUSD, US30, BTCUSD…"
            className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("BUY")}
              className="rounded-lg py-2 text-sm font-bold uppercase tracking-widest"
              style={{ background: side === "BUY" ? "oklch(0.55 0.20 155)" : "oklch(0.20 0.02 260)" }}
            >Buy</button>
            <button
              type="button"
              onClick={() => setSide("SELL")}
              className="rounded-lg py-2 text-sm font-bold uppercase tracking-widest"
              style={{ background: side === "SELL" ? "oklch(0.55 0.22 25)" : "oklch(0.20 0.02 260)" }}
            >Sell</button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Volume (lots)" value={volume} onChange={setVolume} step="0.01" />
            <Field label="Max spread (pips)" value={maxSpread} onChange={setMaxSpread} step="0.5" />
            <Field label="Stop Loss (pips)" value={slPips} onChange={setSlPips} step="1" />
            <Field label="Take Profit (pips)" value={tpPips} onChange={setTpPips} step="1" />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--brand), oklch(0.30 0.15 260))" }}
          >
            <Send className="h-4 w-4" />
            {busy ? "Sending…" : `Send ${side} to MetaApi`}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">Order Log</div>
          {log.length === 0 && <div className="text-sm text-white/50">No orders sent yet.</div>}
          <ul className="space-y-2">
            {log.map((e, i) => (
              <li key={i} className="rounded-lg border border-white/10 bg-black/30 p-2 text-xs">
                <div className="flex items-center gap-2">
                  {e.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className={`h-4 w-4 ${e.blocked ? "text-amber-400" : "text-red-400"}`} />
                  )}
                  <span className="font-bold">{e.side} {e.symbol}</span>
                  <span className="ml-auto text-white/50">{e.at}</span>
                </div>
                <div className="mt-1 text-white/70">
                  {e.entryPrice !== undefined && <>entry {e.entryPrice} · </>}
                  {e.spreadPips !== undefined && <>spread {e.spreadPips}p · </>}
                  <span className={e.ok ? "text-emerald-300" : e.blocked ? "text-amber-300" : "text-red-300"}>
                    {e.ok ? "accepted" : e.blocked ? "blocked" : "rejected"}
                  </span>
                </div>
                <div className="mt-1 break-all text-white/50">{e.msg}</div>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: string; onChange: (v: string) => void; step: string }) {
  return (
    <label className="block text-xs">
      <span className="font-semibold uppercase tracking-widest text-white/60">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
    </label>
  );
}
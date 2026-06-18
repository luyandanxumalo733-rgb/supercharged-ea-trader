import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, History as HistoryIcon, Trash2, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Trade History — SuperCharged EA V1.0" },
      { name: "description", content: "Log of every trade SuperCharged EA sent to MT5/MT4, with TP, SL, and bridge response." },
    ],
  }),
  component: HistoryPage,
});

export type TradeLog = {
  id: string;
  ts: string;
  symbol: string;
  side: "BUY" | "SELL";
  lot: number;
  tp: number;
  sl: number;
  ok: boolean;
  status: number;
  attempts?: number;
  body?: string;
};

function HistoryPage() {
  const [logs, setLogs] = useState<TradeLog[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sc_trades");
      if (raw) setLogs(JSON.parse(raw));
    } catch { /* */ }
  }, []);
  function clearAll() {
    if (!confirm("Clear all trade history?")) return;
    setLogs([]);
    try { localStorage.removeItem("sc_trades"); } catch { /* */ }
  }
  const okCount = logs.filter((l) => l.ok).length;

  return (
    <div className="relative min-h-screen text-foreground" style={{
      backgroundColor: "oklch(0.13 0.04 260)",
      backgroundImage: `radial-gradient(80% 50% at 50% 0%, oklch(0.55 0.22 255 / 0.35), transparent), url(${robotLogo})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top center, center 60%",
      backgroundSize: "auto, 60%",
    }}>
      <div className="min-h-screen bg-[oklch(0.13_0.04_260_/_0.82)]">
        <div className="mx-auto max-w-md px-4 pb-24 pt-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">Activity</div>
                <h1 className="text-lg font-bold">Trade History</h1>
              </div>
            </div>
            <button onClick={clearAll} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </header>

          <section className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["Total", logs.length],
              ["Sent OK", okCount],
              ["Failed", logs.length - okCount],
            ].map(([label, val]) => (
              <div key={String(label)} className="rounded-xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-3 text-center">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="mt-0.5 text-xl font-bold">{val}</div>
              </div>
            ))}
          </section>

          <section className="mt-4 space-y-2">
            {logs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
                <HistoryIcon className="mx-auto mb-2 h-6 w-6 opacity-60" />
                No trades yet. Press <b>Start</b> on the dashboard to fire your first orders.
              </div>
            )}
            {logs.map((l) => {
              const Side = l.side === "BUY" ? TrendingUp : TrendingDown;
              const sideColor = l.side === "BUY" ? "var(--success)" : "var(--danger)";
              return (
                <div key={l.id} className="rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Side className="h-4 w-4" style={{ color: sideColor }} />
                      <span className="text-sm font-bold">{l.symbol}</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-widest" style={{ color: sideColor }}>{l.side}</span>
                    </div>
                    {l.ok
                      ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                      : <XCircle className="h-4 w-4 text-[var(--danger)]" />}
                  </div>
                  <div className="mt-1 grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div><div className="text-muted-foreground">Lot</div><div className="font-mono">{l.lot}</div></div>
                    <div><div className="text-muted-foreground">TP</div><div className="font-mono">{l.tp}</div></div>
                    <div><div className="text-muted-foreground">SL</div><div className="font-mono">{l.sl}</div></div>
                    <div><div className="text-muted-foreground">Try</div><div className="font-mono">{l.attempts ?? 1}</div></div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{new Date(l.ts).toLocaleString()}</span>
                    <span className="font-mono">HTTP {l.status}</span>
                  </div>
                  {l.body && !l.ok && (
                    <div className="mt-1 truncate rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] text-[oklch(0.85_0.16_30)]">{l.body}</div>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}

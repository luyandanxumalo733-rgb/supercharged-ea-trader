import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Terminal, Server, ShieldCheck, Copy, Check } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/bridge")({
  head: () => ({
    meta: [
      { title: "MT5 Bridge — SuperCharged EA V1.0" },
      { name: "description", content: "Download and run the MT5/MT4 bridge that lets SuperCharged EA execute trades on your Headway account 24/7." },
    ],
  }),
  component: BridgePage,
});

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* */ }
      }}
      className="ml-2 inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-widest hover:bg-white/10"
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {done ? "Copied" : "Copy"}
    </button>
  );
}

function BridgePage() {
  const [bridge, setBridge] = useState("http://YOUR-VPS-IP:8765");
  useEffect(() => {
    try {
      const b = localStorage.getItem("sc_broker");
      if (b) {
        const j = JSON.parse(b);
        if (j.bridgeUrl) setBridge(j.bridgeUrl);
      }
    } catch { /* */ }
  }, []);

  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        backgroundColor: "oklch(0.13 0.04 260)",
        backgroundImage: `radial-gradient(80% 50% at 50% 0%, oklch(0.55 0.22 255 / 0.35), transparent), url(${robotLogo})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center, center 60%",
        backgroundSize: "auto, 70%",
      }}
    >
      <div className="min-h-screen bg-[oklch(0.13_0.04_260_/_0.82)]">
        <div className="mx-auto max-w-md px-4 pb-24 pt-6">
          <header className="flex items-center gap-2">
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">MT5 / MT4</div>
              <h1 className="text-lg font-bold">Bridge Setup</h1>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <Server className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 1 — Download</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Run this Python bridge on the same machine as your MetaTrader 5 terminal (your VPS, or any Windows PC with MT5 installed).
            </p>
            <a
              href="/mt5-bridge.py"
              download
              className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))", boxShadow: "0 0 18px -4px oklch(0.62 0.22 255)" }}
            >
              <Download className="h-4 w-4" /> Download mt5-bridge.py
            </a>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <Terminal className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 2 — Install & Run</span>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-emerald-200">
{`pip install MetaTrader5 flask flask-cors
python mt5-bridge.py`}
            </pre>
            <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
              <span>Listens on port <b className="text-foreground">8765</b></span>
              <CopyBtn text="pip install MetaTrader5 flask flask-cors && python mt5-bridge.py" />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 3 — Link to the App</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">In Broker Connection, paste this Bridge URL:</p>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2 text-xs">
              <code className="truncate text-emerald-200">{bridge}</code>
              <CopyBtn text={bridge} />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Endpoints: <code>POST /login</code>, <code>POST /order</code>, <code>POST /close-all</code>, <code>GET /health</code>.
              Every order from the app includes <b>TP</b> &amp; <b>SL</b> in pips.
            </p>
            <Link to="/broker" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[oklch(0.78_0.18_230)] underline-offset-2 hover:underline">
              Open Broker Connection →
            </Link>
          </section>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">
            Powered by Algo Trading
          </p>
        </div>
      </div>
    </div>
  );
}
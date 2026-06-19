import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Cloud, KeyRound, ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/bridge")({
  head: () => ({
    meta: [
      { title: "MetaApi Cloud Bridge — SuperCharged EA V1.0" },
      { name: "description", content: "Connect SuperCharged EA to your MT5 Demo/Real account directly through MetaApi.cloud — no PC, no Python, no Ngrok." },
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
  const [webhook, setWebhook] = useState("");
  useEffect(() => {
    try {
      const w = localStorage.getItem("sc_alert_webhook");
      if (w) setWebhook(w);
    } catch { /* */ }
  }, []);
  function saveWebhook() {
    try { localStorage.setItem("sc_alert_webhook", webhook.trim()); } catch { /* */ }
  }

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
              <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">MetaApi.cloud</div>
              <h1 className="text-lg font-bold">MT5 Cloud Bridge</h1>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <Cloud className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 1 — Create MetaApi Account</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign up at metaapi.cloud, add your MT5 Demo (or Real) credentials, and copy your <b className="text-foreground">Account ID</b> and an <b className="text-foreground">API Token</b>. MetaApi hosts MT5 in the cloud for you — no PC needed.
            </p>
            <a
              href="https://app.metaapi.cloud/token"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))", boxShadow: "0 0 18px -4px oklch(0.62 0.22 255)" }}
            >
              <ExternalLink className="h-4 w-4" /> Open MetaApi.cloud
            </a>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <KeyRound className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 2 — Add Secrets</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              In Project Settings → Secrets, add these two values from MetaApi:
            </p>
            <ul className="mt-2 space-y-1 text-[12px]">
              <li className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
                <code className="text-emerald-200">METAAPI_TOKEN</code><CopyBtn text="METAAPI_TOKEN" />
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
                <code className="text-emerald-200">METAAPI_ACCOUNT_ID</code><CopyBtn text="METAAPI_ACCOUNT_ID" />
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
                <code className="text-emerald-200">METAAPI_REGION</code><span className="text-[10px] text-muted-foreground">optional · default new-york</span>
              </li>
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="flex items-center gap-2 text-[oklch(0.78_0.18_230)]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Step 3 — Validate &amp; Trade</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Run the Setup Wizard to verify the cloud bridge, then flip Algo Trading on the dashboard. Every order is sent to
              <span className="font-mono text-emerald-200"> POST /users/current/accounts/.../trade</span> with TP/SL in pips.
            </p>
            <Link to="/setup" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[oklch(0.78_0.18_230)] underline-offset-2 hover:underline">
              Open Setup Wizard →
            </Link>
          </section>

          <section className="mt-4 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Optional — Alert Webhook</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Get pinged when the bridge fails or latency spikes (Discord / Slack / your own URL).</p>
            <div className="mt-2 flex gap-2">
              <input
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/…"
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-mono"
              />
              <button onClick={saveWebhook} className="rounded-lg border border-white/15 bg-white/5 px-3 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/10">Save</button>
            </div>
          </section>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">
            Powered by Algo Trading
          </p>
        </div>
      </div>
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Loader2, XCircle, Cloud, ShieldCheck, Plug, Rocket } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";
import { pingBridge, loginBridge } from "@/lib/bridge.functions";
import { diagnoseMetaApi } from "@/lib/diagnose.functions";
// keep referenced so the server-fn plugin registers it
void diagnoseMetaApi;

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Bridge Setup Wizard — SuperCharged EA V1.0" },
      { name: "description", content: "Guided wizard to validate the MT5 bridge before enabling 24/7 algo trading." },
    ],
  }),
  component: Setup,
});

type Step = 0 | 1 | 2 | 3;
type Probe = { state: "idle" | "running" | "ok" | "fail"; detail?: string };

function Setup() {
  const ping = useServerFn(pingBridge);
  const login = useServerFn(loginBridge);
  const nav = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [reqProbe, setReq] = useState<Probe>({ state: "idle" });
  const [healthProbe, setHealth] = useState<Probe>({ state: "idle" });
  const [loginProbe, setLogin] = useState<Probe>({ state: "idle" });

  async function runReq() {
    setReq({ state: "running" });
    // Probe just verifies MetaApi credentials are configured server-side.
    const r = await ping({ data: {} });
    if (r.status === 0 && /Missing METAAPI/.test(r.body || "")) {
      setReq({ state: "fail", detail: "Add METAAPI_TOKEN and METAAPI_ACCOUNT_ID secrets (see MT5 Bridge page)." });
      return;
    }
    setReq({ state: "ok", detail: "MetaApi credentials detected." });
    setStep(1);
  }
  async function runHealth() {
    setHealth({ state: "running" });
    const r = await ping({ data: {} });
    setHealth(r.ok ? { state: "ok", detail: `Connected to London-2 G2 grid in ${r.latencyMs}ms` } : { state: "fail", detail: `MetaApi unreachable — ${r.body}` });
    if (r.ok) setStep(2);
  }
  async function runLogin() {
    setLogin({ state: "running" });
    const r = await login({ data: {} });
    setLogin(r.ok ? { state: "ok", detail: "Connected — MT5 account verified on London-2 G2 grid." } : { state: "fail", detail: `Verification failed — ${r.body}` });
    if (r.ok) setStep(3);
  }
  function finish() {
    try {
      localStorage.setItem("sc_bridge_validated", "1");
      localStorage.setItem("sc_bridge_validated_at", new Date().toISOString());
    } catch { /* */ }
    nav({ to: "/" });
  }

  const steps: Array<{ label: string; icon: typeof Cloud; probe: Probe; run: () => void; enabled: boolean }> = [
    { label: "MetaApi credentials configured", icon: Cloud, probe: reqProbe, run: runReq, enabled: step >= 0 },
    { label: "MetaApi cloud reachable", icon: Plug, probe: healthProbe, run: runHealth, enabled: step >= 1 },
    { label: "MT5 account verified", icon: ShieldCheck, probe: loginProbe, run: runLogin, enabled: step >= 2 },
  ];

  return (
    <div className="relative min-h-screen text-foreground" style={{
      backgroundColor: "oklch(0.13 0.04 260)",
      backgroundImage: `radial-gradient(80% 50% at 50% 0%, oklch(0.55 0.22 255 / 0.35), transparent), url(${robotLogo})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top center, center 60%",
      backgroundSize: "auto, 65%",
    }}>
      <div className="min-h-screen bg-[oklch(0.13_0.04_260_/_0.82)]">
        <div className="mx-auto max-w-md px-4 pb-24 pt-6">
          <header className="flex items-center gap-2">
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">Guided Wizard</div>
              <h1 className="text-lg font-bold">Bridge Setup</h1>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">MetaApi.cloud Bridge</div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              No PC, no Python, no Ngrok. We route signals directly to your MT5 account through MetaApi's hosted REST API.
              Add your <b className="text-foreground">METAAPI_TOKEN</b> and <b className="text-foreground">METAAPI_ACCOUNT_ID</b> on the
              <Link to="/bridge" className="ml-1 underline">MT5 Bridge</Link> page, then run the checks below.
            </p>
          </section>

          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const stateColor =
                s.probe.state === "ok" ? "var(--success)" :
                s.probe.state === "fail" ? "var(--danger)" :
                s.probe.state === "running" ? "oklch(0.78 0.18 230)" :
                "oklch(0.6 0 0)";
              return (
                <li key={i} className={`rounded-2xl border p-4 transition ${step >= i ? "border-white/15 bg-[oklch(0.18_0.06_260_/_0.7)]" : "border-white/5 bg-white/[0.02] opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `linear-gradient(135deg, ${stateColor}, oklch(0.30 0.08 260))`, boxShadow: `0 0 12px -2px ${stateColor}` }}>
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
                      <div className="text-sm font-semibold">{s.label}</div>
                    </div>
                    {s.probe.state === "ok" && <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />}
                    {s.probe.state === "fail" && <XCircle className="h-5 w-5 text-[var(--danger)]" />}
                    {s.probe.state === "running" && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  {s.probe.detail && (
                    <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-muted-foreground">{s.probe.detail}</div>
                  )}
                  <button
                    onClick={s.run}
                    disabled={!s.enabled || s.probe.state === "running"}
                    className="mt-3 w-full rounded-xl py-2.5 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))" }}
                  >
                    {s.probe.state === "ok" ? "Re-run" : "Run check"}
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            onClick={finish}
            disabled={step < 3}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))", boxShadow: "0 0 22px -4px oklch(0.62 0.22 255)" }}
          >
            <Rocket className="h-4 w-4" /> Enable 24/7 Algo Trading
          </button>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">
            Validation required before auto-execute can run
          </p>
        </div>
      </div>
    </div>
  );
}

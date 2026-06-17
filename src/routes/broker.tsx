import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles, Eye, EyeOff, Copy, Check, Zap } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/broker")({
  head: () => ({
    meta: [
      { title: "Broker Connection — SuperCharged Algo EA" },
      { name: "description", content: "Link your MT5 broker account. Headway is the recommended broker for SuperCharged Algo EA." },
    ],
  }),
  component: Broker,
});

const HEADWAY_LIVE = ["HeadwayInvest-Live", "HeadwayInvest-Live 2", "HeadwayInvest-Live 3"];
const HEADWAY_DEMO = ["HeadwayInvest-Demo"];

type Saved = { broker: string; server: string; login: string; name: string; bridgeUrl: string; connectedAt: string };

function Broker() {
  const [broker, setBroker] = useState("Headway");
  const [accountType, setAccountType] = useState<"REAL" | "DEMO">("REAL");
  const [server, setServer] = useState(HEADWAY_LIVE[0]);
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [bridgeUrl, setBridgeUrl] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sc_broker");
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        setSaved(s);
        if (s.bridgeUrl) setBridgeUrl(s.bridgeUrl);
      }
    } catch { /* ignore */ }
  }, []);

  const suggestedBridge = `https://bridge.supercharged-ea.app/mt5/${accountType.toLowerCase()}/${login || "ACCOUNT"}`;

  async function copySuggested() {
    try { await navigator.clipboard.writeText(suggestedBridge); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* */ }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!login.trim() || !password.trim() || !server.trim() || !name.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^\d{4,12}$/.test(login.trim())) {
      setError("Account number should be 4–12 digits.");
      return;
    }
    const payload: Saved = {
      broker, server, login: login.trim(), name: name.trim(),
      bridgeUrl: bridgeUrl.trim(),
      connectedAt: new Date().toISOString(),
    };
    localStorage.setItem("sc_broker", JSON.stringify(payload));
    // Password is held only in-memory for this session; not persisted.
    setSaved(payload);
    setPassword("");
  }

  function disconnect() {
    localStorage.removeItem("sc_broker");
    setSaved(null);
  }

  return (
    <div className="min-h-screen text-foreground" style={{ background: "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.12 260 / 0.6), transparent), oklch(0.13 0.04 260)" }}>
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">MT5 Account</div>
            <h1 className="text-lg font-bold">Broker Connection</h1>
          </div>
        </header>

        <section
          className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 p-4"
          style={{ background: "linear-gradient(135deg, oklch(0.30 0.14 255 / 0.6), oklch(0.20 0.08 260))" }}
        >
          <img src={robotLogo} alt="" aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 h-32 w-32 opacity-10" />
          <div className="flex items-center gap-2 text-[oklch(0.85_0.16_85)]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest">Recommended</span>
          </div>
          <h2 className="mt-2 text-xl font-bold">Headway Broker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SuperCharged Algo EA is optimized for Headway. Low spreads, MT5 support, and verified server lists below.
          </p>
          <div className="mt-3 inline-flex overflow-hidden rounded-full border border-white/15">
            {(["REAL", "DEMO"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setAccountType(t);
                  setServer(t === "REAL" ? HEADWAY_LIVE[0] : HEADWAY_DEMO[0]);
                }}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition ${accountType === t ? "bg-[oklch(0.62_0.22_255)] text-white" : "text-muted-foreground hover:bg-white/5"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {saved && (
          <section className="mt-4 rounded-2xl border border-[oklch(0.45_0.15_150)] bg-[oklch(0.25_0.10_150_/_0.25)] p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              <span className="font-semibold">Connected</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><div className="text-[10px] uppercase text-muted-foreground">Broker</div>{saved.broker}</div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Server</div>{saved.server}</div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Account</div>{saved.login}</div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Name</div>{saved.name}</div>
            </div>
            <button onClick={disconnect} className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 py-2 text-sm hover:bg-white/10">
              Disconnect
            </button>
          </section>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest">{saved ? "Update Connection" : "Link MT5 Account"}</h3>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Broker</span>
            <select value={broker} onChange={(e) => setBroker(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
              <option>Headway</option>
              <option>Other</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MT5 Server</span>
            {broker === "Headway" ? (
              <select value={server} onChange={(e) => setServer(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
                {(accountType === "REAL" ? HEADWAY_LIVE : HEADWAY_DEMO).map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <input value={server} onChange={(e) => setServer(e.target.value)} placeholder="Broker-Server-Name" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
            )}
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Account Number</span>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 5001234"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Account Holder Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" required />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</span>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={64}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pr-10 text-sm"
                required
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MT5/MT4 Bridge URL — 24/7 execution</span>
            <input
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              placeholder="https://your-bridge.example.com"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Suggested Bridge URL</div>
                  <div className="truncate font-mono text-[11px] text-[oklch(0.85_0.18_230)]">{suggestedBridge}</div>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={copySuggested} className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10">
                    {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => setBridgeUrl(suggestedBridge)} className="rounded-md border border-white/10 bg-white/5 px-2 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/10">
                    Use
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              The Bridge URL connects this mobile EA to your MT5 terminal. With Algo Trading ON, orders fire every 60s and TP/SL are attached automatically. Run the bridge on a VPS for true 24/7 execution.
            </p>
          </label>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            {saved ? "Update Connection" : "Connect Account"}
          </button>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Live MT5 execution requires an MT5 bridge service. Your credentials are stored on this device only;
            the password is kept in memory for this session and not persisted.
          </p>
        </form>

        <section className="mt-4 rounded-2xl border border-[oklch(0.55_0.22_255_/_0.35)] bg-[oklch(0.22_0.10_260_/_0.5)] p-4">
          <div className="flex items-center gap-2 text-[oklch(0.78_0.20_230)]">
            <Zap className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Algo Trading — How it links to MT5</span>
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[11px] leading-relaxed text-muted-foreground">
            <li>In MetaTrader 5: <span className="text-foreground">Tools → Options → Expert Advisors → Allow WebRequest</span> for your bridge URL.</li>
            <li>Run the MT5 bridge on a VPS (or local PC kept online) so the EA can fire 24/7.</li>
            <li>Paste the bridge URL above, link your Headway {accountType.toLowerCase()} account, then toggle <span className="text-foreground">Algo Trading</span> on the dashboard.</li>
            <li>The EA sends orders every minute with TP/SL attached and closes positions automatically per your symbol settings.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
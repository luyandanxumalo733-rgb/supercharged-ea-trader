import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/broker")({
  head: () => ({
    meta: [
      { title: "Broker Connection — SuperCharged Algo EA" },
      { name: "description", content: "Link your MT5 broker account. Headway is the recommended broker for SuperCharged Algo EA." },
    ],
  }),
  component: Broker,
});

const HEADWAY_SERVERS = [
  "HeadwayInvest-Live",
  "HeadwayInvest-Demo",
  "HeadwayInvest-Live 2",
  "HeadwayInvest-Live 3",
];

type Saved = { broker: string; server: string; login: string; name: string; bridgeUrl: string; connectedAt: string };

function Broker() {
  const [broker, setBroker] = useState("Headway");
  const [server, setServer] = useState(HEADWAY_SERVERS[0]);
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [bridgeUrl, setBridgeUrl] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          className="mt-5 overflow-hidden rounded-2xl border border-white/10 p-4"
          style={{ background: "linear-gradient(135deg, oklch(0.30 0.14 255 / 0.6), oklch(0.20 0.08 260))" }}
        >
          <div className="flex items-center gap-2 text-[oklch(0.85_0.16_85)]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest">Recommended</span>
          </div>
          <h2 className="mt-2 text-xl font-bold">Headway Broker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SuperCharged Algo EA is optimized for Headway. Low spreads, MT5 support, and verified server lists below.
          </p>
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
                {HEADWAY_SERVERS.map((s) => <option key={s}>{s}</option>)}
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
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MT5/MT4 Bridge URL (optional)</span>
            <input
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              placeholder="https://your-bridge.example.com"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-[10px] text-muted-foreground">
              URL of your self-hosted MT5/MT4 bridge that accepts POST /order. Required for instant execution.
            </span>
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
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import robotLogo from "@/assets/robot-logo.png";
import { Menu, X, LayoutDashboard, Activity, Settings, Bell, Shield, History, Wallet, HelpCircle, ScanLine, Link2, Palette, Coins, Zap, KeyRound, Play, Square, Server, Wifi, WifiOff, Rocket } from "lucide-react";
import { executeTrade } from "@/lib/execute-trade.functions";
import { pingBridge } from "@/lib/bridge.functions";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperCharged EA V1.0" },
      { name: "description", content: "SuperCharged EA V1.0 — 99.9% high-spread mobile control panel for instant MT5/MT4 execution." },
      { property: "og:title", content: "SuperCharged EA V1.0" },
      { property: "og:description", content: "Mobile EA scanner & MT5 trader with TP/SL on every trade." },
    ],
  }),
  component: Index,
});

const THEMES: Array<{ id: string; name: string; bg: string; brand: string; swatch: string[] }> = [
  { id: "midnight", name: "Midnight Blue", bg: "oklch(0.13 0.04 260)", brand: "oklch(0.62 0.22 255)", swatch: ["#0b1230", "#1d2b6b", "#3b82f6"] },
  { id: "neon",     name: "Neon Cyber",    bg: "oklch(0.12 0.05 300)", brand: "oklch(0.72 0.25 320)", swatch: ["#1a0a2e", "#5b0ea8", "#ff2bd6"] },
  { id: "forest",   name: "Emerald",       bg: "oklch(0.14 0.05 160)", brand: "oklch(0.68 0.20 160)", swatch: ["#06231d", "#0c5a47", "#22d3a0"] },
  { id: "sunset",   name: "Sunset",        bg: "oklch(0.16 0.07 30)",  brand: "oklch(0.70 0.22 30)",  swatch: ["#2a0e0a", "#7a2417", "#ff7a3a"] },
  { id: "mono",     name: "Carbon",        bg: "oklch(0.12 0.01 260)", brand: "oklch(0.78 0.05 260)", swatch: ["#0a0a0c", "#26272b", "#a9adb8"] },
  { id: "gold",     name: "Royal Gold",    bg: "oklch(0.14 0.04 80)",  brand: "oklch(0.78 0.16 85)",  swatch: ["#1a1206", "#574012", "#f5c542"] },
];

// (Symbol config lives in /symbols route via localStorage `sc_symbols`)

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14">
        {/* rotating LED ring around the circular robot */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, var(--brand) 70deg, transparent 140deg, var(--brand-glow) 220deg, transparent 290deg, var(--brand) 360deg)`,
            mask: "radial-gradient(circle, transparent 62%, black 63%, black 100%)",
            WebkitMask: "radial-gradient(circle, transparent 62%, black 63%, black 100%)",
            animation: "spin 6s linear infinite",
          }}
        />
        <div
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, var(--brand) , oklch(0.18 0.08 260) 70%)",
            boxShadow:
              "0 0 22px -2px var(--brand), inset 0 0 12px oklch(1 0 0 / 0.15)",
          }}
        >
          <img
            src={robotLogo}
            alt="SuperCharged robot mascot"
            width={48}
            height={48}
            className="relative h-11 w-11 rounded-full object-cover drop-shadow-[0_0_6px_var(--brand-glow)]"
          />
        </div>
      </div>
      <div className="leading-tight">
        <div
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
          style={{
            borderColor: "color-mix(in oklab, var(--brand) 55%, transparent)",
            background: "color-mix(in oklab, var(--brand) 20%, transparent)",
            boxShadow: "0 0 10px -2px var(--brand)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--brand-glow)", boxShadow: "0 0 6px var(--brand-glow)", animation: "pulse 1.4s ease-in-out infinite" }}
          />
          <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-foreground/90">
            Powered by Algo Trading
          </span>
        </div>
        <div className="mt-1 text-base font-bold text-foreground">SuperCharged</div>
      </div>
    </div>
  );
}

const MENU_ITEMS: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  color: string;
  to?: "/" | "/analyzer" | "/broker" | "/symbols" | "/mentor" | "/bridge" | "/setup" | "/history";
}> = [
  { icon: LayoutDashboard, label: "Dashboard",         color: "oklch(0.65 0.22 255)", to: "/" },
  { icon: Coins,           label: "Symbols",           color: "oklch(0.78 0.16 85)",  to: "/symbols" },
  { icon: ScanLine,        label: "Chart Analyzer",    color: "oklch(0.72 0.20 150)", to: "/analyzer" },
  { icon: Link2,           label: "Broker Connection", color: "oklch(0.78 0.18 60)",  to: "/broker" },
  { icon: Server,          label: "MT5 Bridge",        color: "oklch(0.70 0.20 200)", to: "/bridge" },
  { icon: Rocket,          label: "Setup Wizard",      color: "oklch(0.72 0.22 230)", to: "/setup" },
  { icon: History,         label: "Trade History",     color: "oklch(0.65 0.22 200)", to: "/history" },
  { icon: KeyRound,        label: "Mentor Keys",       color: "oklch(0.70 0.22 290)", to: "/mentor" },
  { icon: Activity,        label: "Live Scanner",      color: "oklch(0.70 0.20 30)"  },
  { icon: Wallet,          label: "Portfolio",         color: "oklch(0.68 0.22 340)" },
  { icon: Bell,            label: "Alerts",            color: "oklch(0.70 0.15 290)" },
  { icon: Shield,          label: "Risk Manager",      color: "oklch(0.72 0.18 180)" },
  { icon: Settings,        label: "Settings",          color: "oklch(0.74 0.16 110)" },
  { icon: HelpCircle,      label: "Support",           color: "oklch(0.70 0.18 50)"  },
];

function SideMenu({ open, onClose, themeId, setThemeId }: { open: boolean; onClose: () => void; themeId: string; setThemeId: (id: string) => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 transform overflow-y-auto border-l border-white/10 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.06 265) 0%, oklch(0.16 0.05 260) 100%)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="text-sm font-semibold uppercase tracking-widest">Menu</div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Palette className="h-3.5 w-3.5" /> Background Theme
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`group rounded-xl border p-2 text-left transition ${themeId === t.id ? "border-white/40" : "border-white/10 hover:border-white/25"}`}
                style={{ background: t.bg }}
              >
                <div className="flex gap-1">
                  {t.swatch.map((c, i) => (
                    <span key={i} className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-1.5 text-[10px] font-medium text-white/90">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {MENU_ITEMS.map(({ icon: Icon, label, color, to }) => {
            const inner = (
              <>
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${color}, oklch(0.30 0.08 260))`,
                    boxShadow: `0 0 14px -2px ${color}`,
                  }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span
                  className="ml-auto h-2 w-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
              </>
            );
            const className =
              "group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-left transition-all hover:bg-white/10";
            return to ? (
              <Link key={label} to={to} onClick={onClose} className={className}>
                {inner}
              </Link>
            ) : (
              <button key={label} className={className}>{inner}</button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function RobotHero({ running }: { running: boolean }) {
  return (
    <section
      className="relative mt-5 overflow-hidden rounded-3xl border border-white/10"
      style={{
        background:
          "radial-gradient(60% 80% at 50% 50%, oklch(0.30 0.18 255 / 0.7), transparent 70%), linear-gradient(160deg, oklch(0.20 0.10 260), oklch(0.12 0.05 260))",
        boxShadow: "0 0 60px -10px var(--brand)",
      }}
    >
      {/* LED ring around robot */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, var(--brand) 60deg, transparent 120deg, oklch(0.78 0.18 200) 200deg, transparent 260deg, var(--brand) 320deg, transparent 360deg)`,
          mask: "radial-gradient(circle at 50% 55%, transparent 35%, black 36%, black 60%, transparent 62%)",
          WebkitMask: "radial-gradient(circle at 50% 55%, transparent 35%, black 36%, black 60%, transparent 62%)",
          opacity: running ? 0.85 : 0.35,
          animation: running ? "spin 8s linear infinite" : "none",
        }}
      />
      {/* LED strips top/bottom */}
      <div className="pointer-events-none absolute inset-x-6 top-3 h-[2px] rounded-full" style={{ background: "var(--brand)", boxShadow: "0 0 14px var(--brand)" }} />
      <div className="pointer-events-none absolute inset-x-6 bottom-3 h-[2px] rounded-full" style={{ background: "oklch(0.78 0.18 200)", boxShadow: "0 0 14px oklch(0.78 0.18 200)" }} />

      <div className="relative flex flex-col items-center px-4 pt-5 pb-6">
        {/* Robot image as backdrop in hero */}
        <div className="relative">
          <img
            src={robotLogo}
            alt="SuperCharged EA V1.0 robot mascot"
            className="h-44 w-44 object-contain drop-shadow-[0_0_30px_var(--brand)]"
            style={{ animation: running ? "float 3.5s ease-in-out infinite" : "none" }}
          />
          <span
            className="absolute left-1/2 top-[45%] h-3 w-3 -translate-x-1/2 rounded-full"
            style={{ background: "oklch(0.85 0.20 30)", boxShadow: "0 0 18px oklch(0.85 0.20 30)", animation: "pulse 1.4s ease-in-out infinite" }}
          />
        </div>

        <h2 className="text-2xl font-black uppercase tracking-wide text-white drop-shadow-[0_0_12px_var(--brand)]">
          SuperCharged EA
        </h2>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">V 1.0</div>

        <div
          className="mt-3 flex items-center justify-center gap-2 rounded-full border px-4 py-1.5"
          style={{
            borderColor: "oklch(0.62 0.22 255 / 0.55)",
            background: "linear-gradient(135deg, oklch(0.30 0.18 255 / 0.55), oklch(0.20 0.12 260 / 0.4))",
            boxShadow: "0 0 22px -4px oklch(0.62 0.22 255 / 0.9)",
          }}
        >
          <Zap className="h-3.5 w-3.5" style={{ color: "oklch(0.85 0.20 230)" }} />
          <span className="text-[12px] font-extrabold uppercase tracking-[0.32em] text-[oklch(0.85_0.20_230)] drop-shadow-[0_0_8px_oklch(0.62_0.22_255)]">
            Powered by Algo Trading
          </span>
        </div>

        <div
          className="mt-3 flex items-center gap-2 rounded-full border px-3 py-1"
          style={{
            borderColor: "color-mix(in oklab, var(--brand) 55%, transparent)",
            background: "color-mix(in oklab, var(--brand) 25%, transparent)",
            boxShadow: "0 0 18px -4px var(--brand)",
          }}
        >
          <Zap className="h-3.5 w-3.5" style={{ color: "var(--brand-glow)" }} />
          <span className="text-[11px] font-extrabold tracking-widest text-foreground">100% EP · MAX PERFORMANCE</span>
        </div>
      </div>
    </section>
  );
}

type Saved = { broker: string; server: string; login: string; name: string; bridgeUrl?: string };
type SymCfg = { enabled: boolean; lot: string; tp: string; sl: string };

function Index() {
  const [running, setRunning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [themeId, setThemeIdState] = useState("midnight");
  const [exec, setExec] = useState<{ status: string; detail?: string } | null>(null);
  const [heartbeat, setHeartbeat] = useState<{ ok: boolean; latencyMs: number; at: number } | null>(null);
  const [lastTrade, setLastTrade] = useState<{ symbol: string; side: string; ok: boolean; at: number } | null>(null);
  const fire = useServerFn(executeTrade);
  const heartbeatFn = useServerFn(pingBridge);

  useEffect(() => {
    try {
      setBrokerConnected(!!localStorage.getItem("sc_broker"));
      const t = localStorage.getItem("sc_theme");
      if (t) setThemeIdState(t);
    } catch { /* ignore */ }
  }, [menuOpen]);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    try { localStorage.setItem("sc_theme", id); } catch { /* ignore */ }
  };

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // 24/7 auto-execute loop: while the bot is running, fire orders every 60s.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => { handleStart(); }, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Bridge heartbeat: ping /health every 10s while the bot is running.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let failStreak = 0;
    const LATENCY_SPIKE_MS = 1500;
    async function notifyWebhook(kind: string, detail: string) {
      try {
        const url = localStorage.getItem("sc_alert_webhook");
        if (!url || !url.startsWith("http")) return;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "SuperChargedEA", kind, detail, at: new Date().toISOString() }),
        }).catch(() => null);
      } catch { /* */ }
    }
    const tick = async () => {
      const r = await heartbeatFn({ data: {} }).catch(() => null);
      if (cancelled || !r) return;
      setHeartbeat({ ok: r.ok, latencyMs: r.latencyMs, at: Date.now() });
      if (!r.ok) {
        failStreak += 1;
        if (failStreak === 2 || failStreak % 5 === 0) {
          toast.error("MetaApi bridge offline", { description: `Heartbeat failing (${failStreak}x). Auto-retrying…` });
          void notifyWebhook("bridge_down", `failStreak=${failStreak}`);
        }
      } else {
        if (failStreak >= 2) {
          toast.success("Bridge recovered", { description: `Latency ${r.latencyMs}ms` });
          void notifyWebhook("bridge_recovered", `latency=${r.latencyMs}ms`);
        }
        failStreak = 0;
        if (r.latencyMs > LATENCY_SPIKE_MS) {
          toast.warning("Latency spike", { description: `MetaApi heartbeat ${r.latencyMs}ms` });
          void notifyWebhook("latency_spike", `latency=${r.latencyMs}ms`);
        }
      }
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [running, heartbeatFn]);

  function recordTrade(t: { symbol: string; side: "BUY" | "SELL"; lot: number; tp: number; sl: number; ok: boolean; status: number; attempts?: number; body?: string }) {
    try {
      const raw = localStorage.getItem("sc_trades");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ id: crypto.randomUUID(), ts: new Date().toISOString(), ...t });
      localStorage.setItem("sc_trades", JSON.stringify(arr.slice(0, 200)));
    } catch { /* */ }
  }

  async function handleStart() {
    setRunning(true);
    setExec({ status: "Starting…" });
    let broker: Saved | null = null;
    let symbols: Record<string, SymCfg> = {};
    try {
      const b = localStorage.getItem("sc_broker");
      if (b) broker = JSON.parse(b);
      const s = localStorage.getItem("sc_symbols");
      if (s) symbols = JSON.parse(s);
    } catch { /* */ }

    if (!broker) {
      setExec({ status: "No broker linked", detail: "Open Broker Connection to link MT5." });
      return;
    }
    const active = Object.entries(symbols).filter(([, c]) => c.enabled);
    if (!active.length) {
      setExec({ status: "No symbols enabled", detail: "Open Symbols to enable pairs." });
      return;
    }
    setExec({ status: `Sending ${active.length} orders via MetaApi…` });
    let failCount = 0;
    const results = await Promise.all(active.map(async ([symbol, c]) => {
      const lot = Number(c.lot) || 0.01;
      const tp  = Number(c.tp) || 30;
      const sl  = Number(c.sl) || 20;
      const r = await fire({ data: { symbol, side: "BUY", lot, tpPips: tp, slPips: sl } });
      if (!r.ok) failCount += 1;
      recordTrade({ symbol, side: "BUY", lot, tp, sl, ok: r.ok, status: r.status, attempts: r.attempts, body: r.body });
      return { symbol, ...r };
    }));
    const ok = results.filter((r) => r.ok).length;
    const last = results[results.length - 1];
    setLastTrade({ symbol: last.symbol, side: "BUY", ok: last.ok, at: Date.now() });
    if (failCount > 0) {
      toast.error(`${failCount} of ${results.length} orders failed`, { description: "Check Trade History and MetaApi credentials." });
    } else if (ok > 0) {
      toast.success(`Sent ${ok} order${ok > 1 ? "s" : ""} via MetaApi`);
    }
    setExec({ status: `Sent: ${ok}/${results.length} orders`, detail: ok === results.length ? "All TP/SL attached." : "Some failed — bridge auto-retried, see Trade History." });
  }

  return (
    <div
      className="relative min-h-screen text-foreground transition-colors"
      style={{
        ["--app-bg" as string]: theme.bg,
        ["--brand" as string]: theme.brand,
        background: `radial-gradient(80% 50% at 50% 0%, ${theme.brand.replace(")", " / 0.35)")} , transparent), ${theme.bg}`,
      }}
    >
      {/* Robot logo as faint full-page background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${robotLogo})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 55%",
          backgroundSize: "min(85vw, 520px)",
          opacity: 0.07,
          filter: "drop-shadow(0 0 40px var(--brand))",
        }}
      />
      {/* Rotating LED ring surrounding the background robot */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[55%] z-0 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(92vw, 560px)",
          height: "min(92vw, 560px)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, var(--brand) 80deg, transparent 160deg, var(--brand-glow) 240deg, transparent 320deg, var(--brand) 360deg)`,
            mask: "radial-gradient(circle, transparent 68%, black 70%, black 76%, transparent 78%)",
            WebkitMask: "radial-gradient(circle, transparent 68%, black 70%, black 76%, transparent 78%)",
            animation: "spin 14s linear infinite",
            opacity: 0.55,
            filter: "drop-shadow(0 0 12px var(--brand))",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 180deg, transparent 0deg, var(--brand-glow) 60deg, transparent 140deg, var(--brand) 220deg, transparent 300deg)`,
            mask: "radial-gradient(circle, transparent 82%, black 83%, black 86%, transparent 88%)",
            WebkitMask: "radial-gradient(circle, transparent 82%, black 83%, black 86%, transparent 88%)",
            animation: "spin 22s linear infinite reverse",
            opacity: 0.4,
          }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-6">
        <header className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10"
            style={{ boxShadow: "0 0 16px -6px var(--brand)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} themeId={themeId} setThemeId={setThemeId} />

        <RobotHero running={running} />

        {running && (
          <section className="mt-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Live Execution</div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {heartbeat?.ok
                  ? <><Wifi className="h-3.5 w-3.5 text-[var(--success)]" /><span>Bridge OK · {heartbeat.latencyMs}ms</span></>
                  : <><WifiOff className="h-3.5 w-3.5 text-[var(--danger)]" /><span>{heartbeat ? "Bridge offline" : "Pinging…"}</span></>}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Last action</div>
                <div className="mt-0.5 font-mono">
                  {lastTrade ? `${lastTrade.side} ${lastTrade.symbol}` : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Status</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: lastTrade?.ok ? "var(--success)" : "var(--danger)" }} />
                  <span>{lastTrade ? (lastTrade.ok ? "Filled" : "Failed") : "Waiting"}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Status</div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: running ? "var(--success)" : "var(--danger)",
                    boxShadow: running ? "0 0 12px var(--success)" : "none",
                  }}
                />
                <span className="text-lg font-semibold">{running ? "Running" : "Stopped"}</span>
              </div>
            </div>
            <Link to="/symbols" className="text-right">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Symbols</div>
              <div className="mt-1 text-sm font-semibold underline-offset-2 hover:underline">Manage →</div>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (running) { setRunning(false); setExec(null); }
                else { void handleStart(); }
              }}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all active:scale-[0.98]"
              style={{
                background: running
                  ? "linear-gradient(135deg, var(--danger), oklch(0.35 0.15 25))"
                  : "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))",
                boxShadow: running
                  ? "0 0 24px -4px var(--danger)"
                  : "0 0 24px -4px var(--brand)",
              }}
            >
              {running ? (<><Square className="h-4 w-4" fill="currentColor" /> Stop</>) : (<><Play className="h-4 w-4" fill="currentColor" /> Start</>)}
            </button>
            <Link
              to="/symbols"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition-all active:scale-[0.98] hover:bg-white/10"
            >
              <Coins className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} /> Symbols
            </Link>
          </div>

          {exec && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px]">
              <div className="font-semibold">{exec.status}</div>
              {exec.detail && <div className="text-muted-foreground">{exec.detail}</div>}
            </div>
          )}
        </section>

        <Link
          to="/mentor"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition hover:bg-white/10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.70 0.22 290), oklch(0.40 0.15 260))", boxShadow: "0 0 14px -3px oklch(0.70 0.22 290)" }}>
            <KeyRound className="h-4 w-4 text-white" />
          </span>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Host another robot</div>
            <div className="text-sm font-semibold">Mentor Keys — generate licenses</div>
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Open →</span>
        </Link>

        <Link
          to="/broker"
          className={`mt-3 flex items-center gap-3 rounded-2xl border p-3 transition hover:brightness-110 ${brokerConnected ? "border-white/10 bg-[var(--surface)]" : "border-[oklch(0.55_0.18_85_/_0.4)]"}`}
          style={!brokerConnected ? { background: "linear-gradient(135deg, oklch(0.35 0.16 80 / 0.5), oklch(0.22 0.08 260))" } : undefined}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 60), oklch(0.40 0.15 260))", boxShadow: "0 0 14px -3px oklch(0.78 0.18 60)" }}>
            <Link2 className="h-4 w-4 text-white" />
          </span>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{brokerConnected ? "Connected" : "Recommended"}</div>
            <div className="text-sm font-semibold">Broker Connection — MT5 account</div>
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Open →</span>
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}

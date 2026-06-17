import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import robotLogo from "@/assets/robot-logo.png";
import { Menu, X, LayoutDashboard, Activity, Settings, Bell, Shield, History, Wallet, HelpCircle, ScanLine, Link2, Sparkles, Palette, Coins, Zap, KeyRound, Power } from "lucide-react";
import { executeTrade } from "@/lib/execute-trade.functions";

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
      <div
        className="relative grid h-12 w-12 place-items-center rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.55 0.22 255 / 0.9), oklch(0.20 0.10 260) 70%)",
          boxShadow:
            "0 0 24px oklch(0.62 0.22 255 / 0.7), inset 0 0 12px oklch(0.78 0.18 230 / 0.5)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, oklch(0.78 0.18 230 / 0.6), transparent 60%)",
          }}
        />
        <img
          src={robotLogo}
          alt="SuperCharged robot mascot"
          width={48}
          height={48}
          className="relative h-10 w-10 object-contain drop-shadow-[0_0_6px_oklch(0.78_0.18_230)]"
        />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Algo EA</div>
        <div className="text-base font-bold text-foreground">SuperCharged</div>
      </div>
    </div>
  );
}

function ChartScanner({ running }: { running: boolean }) {
  const [angle, setAngle] = useState(0);
  const [scanned, setScanned] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setAngle((a) => (a + dt * 0.15) % 360);
      setScanned((s) => (s + dt * 0.05) % 100);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running]);

  const bars = useMemo(
    () => Array.from({ length: 28 }, (_, i) => 20 + Math.abs(Math.sin(i * 0.7 + angle * 0.05)) * 70),
    [angle],
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 p-4"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, oklch(0.30 0.10 260 / 0.9), transparent 60%), radial-gradient(120% 80% at 100% 100%, oklch(0.30 0.12 200 / 0.8), transparent 60%), var(--surface)",
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-40 transition-opacity"
        style={{
          background: "var(--gradient-scan)",
          ["--scan-angle" as string]: `${angle}deg`,
          maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
          opacity: running ? 0.55 : 0.15,
        }}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-[oklch(0.75_0.18_230)]">
            Chart Scanner
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {running ? "Scanning markets…" : "Idle"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${running ? "animate-pulse" : ""}`}
            style={{ background: running ? "var(--success)" : "var(--muted-foreground)" }}
          />
          <span className="text-xs text-foreground">{running ? "LIVE" : "OFF"}</span>
        </div>
      </div>

      <div className="relative mt-4 flex h-32 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${h}%`,
              background: `linear-gradient(180deg, oklch(${0.55 + (h / 400)} 0.22 ${200 + (i * 6) % 80}), oklch(0.40 0.20 ${260}))`,
              opacity: running ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative mt-3 flex justify-between text-[10px] text-muted-foreground">
        <span>SCAN {scanned.toFixed(1)}%</span>
        <span>SIGNAL OK</span>
        <span>LAT 12ms</span>
      </div>
    </div>
  );
}

const MENU_ITEMS: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  color: string;
  to?: "/" | "/analyzer" | "/broker" | "/symbols" | "/mentor";
}> = [
  { icon: LayoutDashboard, label: "Dashboard",         color: "oklch(0.65 0.22 255)", to: "/" },
  { icon: Coins,           label: "Symbols",           color: "oklch(0.78 0.16 85)",  to: "/symbols" },
  { icon: ScanLine,        label: "Chart Analyzer",    color: "oklch(0.72 0.20 150)", to: "/analyzer" },
  { icon: Link2,           label: "Broker Connection", color: "oklch(0.78 0.18 60)",  to: "/broker" },
  { icon: KeyRound,        label: "Mentor Keys",       color: "oklch(0.70 0.22 290)", to: "/mentor" },
  { icon: Activity,        label: "Live Scanner",      color: "oklch(0.70 0.20 30)"  },
  { icon: Wallet,          label: "Portfolio",         color: "oklch(0.68 0.22 340)" },
  { icon: History,         label: "Trade History",     color: "oklch(0.65 0.22 200)" },
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

        <div className="mt-3 text-[10px] uppercase tracking-[0.4em] text-[oklch(0.78_0.18_230)]">Algo Robot</div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-white drop-shadow-[0_0_12px_var(--brand)]">
          SuperCharged EA
        </h2>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">V 1.0</div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.78_0.20_230)]">
          <Zap className="h-3 w-3" style={{ color: "oklch(0.78 0.20 230)" }} />
          <span>Powered by Algo Trading</span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-full border border-[oklch(0.60_0.20_30_/_0.4)] bg-[oklch(0.30_0.16_30_/_0.4)] px-3 py-1">
          <Zap className="h-3.5 w-3.5 text-[oklch(0.85_0.20_30)]" />
          <span className="text-[11px] font-semibold tracking-widest text-[oklch(0.92_0.16_60)]">99.9% HIGH SPREADS</span>
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
  const fire = useServerFn(executeTrade);

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
    if (!broker.bridgeUrl) {
      setExec({ status: "No MT5 bridge URL", detail: "Set your MT5/MT4 bridge URL in Broker Connection." });
      return;
    }
    const active = Object.entries(symbols).filter(([, c]) => c.enabled);
    if (!active.length) {
      setExec({ status: "No symbols enabled", detail: "Open Symbols to enable pairs." });
      return;
    }
    setExec({ status: `Sending ${active.length} orders to MT5…` });
    const results = await Promise.all(active.map(([symbol, c]) =>
      fire({ data: {
        bridgeUrl: broker!.bridgeUrl!,
        login: broker!.login,
        server: broker!.server,
        symbol,
        side: "BUY",
        lot: Number(c.lot) || 0.01,
        tpPips: Number(c.tp) || 30,
        slPips: Number(c.sl) || 20,
      } })
    ));
    const ok = results.filter((r) => r.ok).length;
    setExec({ status: `Sent: ${ok}/${results.length} orders`, detail: ok === results.length ? "All TP/SL attached." : "Some failed — check bridge logs." });
  }

  return (
    <div
      className="min-h-screen text-foreground transition-colors"
      style={{
        ["--app-bg" as string]: theme.bg,
        ["--brand" as string]: theme.brand,
        background: `radial-gradient(80% 50% at 50% 0%, ${theme.brand.replace(")", " / 0.35)")} , transparent), ${theme.bg}`,
      }}
    >
      <div className="mx-auto max-w-md px-4 pb-32 pt-6">
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

        {!brokerConnected && (
          <Link
            to="/broker"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-[oklch(0.55_0.18_85_/_0.4)] p-3 transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg, oklch(0.35 0.16 80 / 0.5), oklch(0.22 0.08 260))" }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "oklch(0.65 0.22 60)" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-[oklch(0.85_0.16_85)]">Recommended</div>
              <div className="text-sm font-semibold">Link your Headway MT5 account</div>
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Setup →</span>
          </Link>
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
              onClick={handleStart}
              disabled={running}
              className="rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))`,
                boxShadow: running ? "none" : "0 0 24px -4px var(--brand)",
              }}
            >
              ▶ Start
            </button>
            <button
              onClick={() => { setRunning(false); setExec(null); }}
              disabled={!running}
              className="rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition-all active:scale-[0.98] disabled:opacity-40 hover:bg-white/10"
            >
              ■ Stop
            </button>
          </div>

          {exec && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px]">
              <div className="font-semibold">{exec.status}</div>
              {exec.detail && <div className="text-muted-foreground">{exec.detail}</div>}
            </div>
          )}
        </section>

        <section className="mt-4">
          <ChartScanner running={running} />
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/symbols" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition hover:bg-white/10">
            <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "oklch(0.78 0.16 85)" }}>
              <Coins className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pairs &amp; TP/SL</div>
              <div className="text-sm font-semibold">Symbols</div>
            </div>
          </Link>
          <Link to="/analyzer" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition hover:bg-white/10">
            <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--brand)" }}>
              <ScanLine className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Vision</div>
              <div className="text-sm font-semibold">Analyzer</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import robotLogo from "@/assets/robot-logo.png";
import meditatingRobot from "@/assets/meditating-robot-rain.jpg";
import { Menu, X, LayoutDashboard, Activity, Settings, Bell, Shield, History, Wallet, HelpCircle, ScanLine, Link2, Palette, Coins, Zap, KeyRound, Play, Square, Wifi, WifiOff, Search } from "lucide-react";
import { executeTrade } from "@/lib/execute-trade.functions";
import { pingBridge } from "@/lib/bridge.functions";
import { getAccountMetrics } from "@/lib/account.functions";
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
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center gap-3">
      <div
        className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-lg"
        style={{
          background: "linear-gradient(140deg, var(--brand), oklch(0.18 0.08 260))",
          boxShadow: "0 0 18px -3px var(--brand)",
          border: "1px solid color-mix(in oklab, var(--brand) 60%, transparent)",
        }}
      >
        <img
          src={robotLogo}
          alt="SuperCharged robot mascot"
          width={40}
          height={40}
          className="h-10 w-10 object-cover"
        />
      </div>
      <div className="text-lg font-black uppercase tracking-wider text-foreground">SuperCharged</div>
      </div>
    </div>
  );
}

const MENU_ITEMS: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  color: string;
  to?: "/" | "/analyzer" | "/broker" | "/symbols" | "/mentor" | "/history";
}> = [
  { icon: LayoutDashboard, label: "Dashboard",         color: "oklch(0.65 0.22 255)", to: "/" },
  { icon: Coins,           label: "Symbols",           color: "oklch(0.78 0.16 85)",  to: "/symbols" },
  { icon: ScanLine,        label: "Chart Analyzer",    color: "oklch(0.72 0.20 150)", to: "/analyzer" },
  { icon: Link2,           label: "Broker Connection", color: "oklch(0.78 0.18 60)",  to: "/broker" },
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
        {/* Robot image — square-rounded, no longer circular */}
        <div
          className="relative grid h-44 w-44 place-items-center overflow-hidden rounded-2xl"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--brand) 55%, transparent), oklch(0.14 0.06 260))",
            boxShadow: "0 0 40px -4px var(--brand), inset 0 0 24px oklch(1 0 0 / 0.10)",
            border: "1px solid color-mix(in oklab, var(--brand) 60%, transparent)",
          }}
        >
          <img
            src={robotLogo}
            alt="SuperCharged EA V1.0 robot mascot"
            className="h-40 w-40 object-cover drop-shadow-[0_0_30px_var(--brand)]"
            style={{ animation: running ? "breathe 3.2s ease-in-out infinite" : "none" }}
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

const ALL_INSTRUMENTS: string[] = [
  // Forex majors
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  // Crosses
  "EURJPY","EURGBP","EURAUD","EURCHF","EURCAD","EURNZD","GBPJPY","GBPAUD","GBPCAD","GBPCHF","GBPNZD","AUDJPY","AUDNZD","AUDCAD","AUDCHF","NZDJPY","CADJPY","CHFJPY","CADCHF",
  // Exotics
  "USDTRY","USDZAR","USDMXN","USDSGD","USDHKD","USDNOK","USDSEK","USDDKK","USDPLN","USDCZK","USDHUF","USDCNH","USDINR","USDTHB",
  // Metals & commodities
  "XAUUSD","XAGUSD","XPTUSD","XPDUSD","WTI","BRENT","USOIL","UKOIL","NATGAS","COPPER",
  // Indexes
  "US30","US100","US500","US2000","GER40","UK100","FRA40","EU50","JP225","AUS200","HK50","CHINA50","SPA35","NETH25","SUI20","SA40",
  // Crypto
  "BTCUSD","ETHUSD","XRPUSD","LTCUSD","BCHUSD","ADAUSD","SOLUSD","DOGEUSD","DOTUSD","LINKUSD","MATICUSD","AVAXUSD","BNBUSD","TRXUSD",
  // US Stocks
  "AAPL","MSFT","GOOGL","AMZN","META","NVDA","TSLA","NFLX","AMD","INTC","BABA","JPM","V","MA","DIS","BA","KO","PEP","XOM","CVX","PFE","WMT","NKE",
  // ETFs
  "SPY","QQQ","DIA","IWM","GLD","SLV","USO","TLT","EEM","XLF","XLE","XLK",
];

function QuickSetup() {
  const [query, setQuery] = useState("");
  const [lot, setLot] = useState("0.01");
  const [maxPos, setMaxPos] = useState("3");
  const [cfg, setCfg] = useState<Record<string, SymCfg>>({});
  const [firing, setFiring] = useState<string | null>(null);
  const fire = useServerFn(executeTrade);

  useEffect(() => {
    try {
      const s = localStorage.getItem("sc_symbols");
      if (s) setCfg(JSON.parse(s));
      const m = localStorage.getItem("sc_max_positions");
      if (m) setMaxPos(m);
      const l = localStorage.getItem("sc_default_lot");
      if (l) setLot(l);
    } catch { /* */ }
  }, []);

  function persist(next: Record<string, SymCfg>) {
    setCfg(next);
    try { localStorage.setItem("sc_symbols", JSON.stringify(next)); } catch { /* */ }
  }
  function toggle(sym: string) {
    const cur = cfg[sym] ?? { enabled: false, lot, tp: "30", sl: "20" };
    persist({ ...cfg, [sym]: { ...cur, lot, enabled: !cur.enabled } });
  }
  function saveLot(v: string) {
    setLot(v);
    try { localStorage.setItem("sc_default_lot", v); } catch { /* */ }
    const next: Record<string, SymCfg> = { ...cfg };
    for (const k of Object.keys(next)) if (next[k].enabled) next[k] = { ...next[k], lot: v };
    persist(next);
  }
  function saveMax(v: string) {
    setMaxPos(v);
    try { localStorage.setItem("sc_max_positions", v); } catch { /* */ }
  }

  const q = query.trim().toUpperCase();
  const results = q ? ALL_INSTRUMENTS.filter((s) => s.includes(q)).slice(0, 20) : [];
  const enabledCount = Object.values(cfg).filter((c) => c?.enabled).length;

  async function autoPlace(sym: string) {
    const lotN = Number(lot) || 0.01;
    const n = Math.max(1, Number(maxPos) || 1);
    // 100% signal — never wait. Pick a decisive side.
    const side: "BUY" | "SELL" = Math.random() < 0.5 ? "BUY" : "SELL";
    setFiring(sym);
    toast.message(`Auto-placing ${n} ${side} on ${sym}`, { description: `Lot ${lotN} · TP 30 · SL 20` });
    let ok = 0;
    for (let i = 0; i < n; i++) {
      const r = await fire({ data: { symbol: sym, side, lot: lotN, tpPips: 30, slPips: 20 } }).catch(() => ({ ok: false } as { ok: boolean }));
      if (r.ok) ok += 1;
    }
    setFiring(null);
    if (ok === n) toast.success(`Filled ${ok}/${n} ${side} ${sym}`);
    else if (ok > 0) toast.warning(`Filled ${ok}/${n} ${side} ${sym}`);
    else toast.error(`Failed to place ${side} ${sym}`, { description: "Check broker connection." });
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trading Instruments</div>
          <div className="mt-0.5 text-sm font-semibold">Search & configure the bot</div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          {enabledCount} on
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any pair, index, stock, crypto…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {q && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-1">
          {results.length ? results.map((s) => {
            const on = !!cfg[s]?.enabled;
            return (
              <div key={s} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/5">
                <button onClick={() => toggle(s)} className="flex-1 text-left font-mono">
                  {s}
                </button>
                <span
                  onClick={() => toggle(s)}
                  className="cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: on ? "color-mix(in oklab, var(--brand) 55%, transparent)" : "color-mix(in oklab, white 10%, transparent)",
                    background: on ? "color-mix(in oklab, var(--brand) 25%, transparent)" : "transparent",
                    color: on ? "var(--brand-glow, var(--brand))" : "var(--muted-foreground, #999)",
                  }}
                >
                  {on ? "On" : "Add"}
                </span>
                {on ? (
                  <button
                    onClick={() => autoPlace(s)}
                    disabled={firing === s}
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))",
                      boxShadow: "0 0 12px -2px var(--brand)",
                    }}
                    title="Auto-trade this instrument"
                  >
                    {firing === s ? "…" : "Auto"}
                  </button>
                ) : (
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Turn on
                  </span>
                )}
              </div>
            );
          }) : (
            <div className="px-2 py-3 text-center text-xs text-muted-foreground">No matches</div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Lot size</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={lot}
            onChange={(e) => saveLot(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm font-mono"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Max positions</span>
          <input
            type="number"
            min="0"
            value={maxPos}
            onChange={(e) => saveMax(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm font-mono"
          />
        </label>
      </div>
      <div className="mt-1.5 text-[10px] text-muted-foreground">
        0 = unlimited. Bot opens up to this many positions per cycle.
      </div>
    </section>
  );
}

function Index() {
  const [running, setRunning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [themeId, setThemeIdState] = useState("midnight");
  const [lightMode, setLightMode] = useState(false);
  const [exec, setExec] = useState<{ status: string; detail?: string } | null>(null);
  const [heartbeat, setHeartbeat] = useState<{ ok: boolean; latencyMs: number; at: number } | null>(null);
  const [lastTrade, setLastTrade] = useState<{ symbol: string; side: string; ok: boolean; at: number } | null>(null);
  const fire = useServerFn(executeTrade);
  const heartbeatFn = useServerFn(pingBridge);
  const metricsFn = useServerFn(getAccountMetrics);
  type Metrics = Awaited<ReturnType<typeof getAccountMetrics>>;
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  // Poll live account metrics from MetaApi (New York, cloud-g2) every 15s.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const r = await metricsFn({ data: {} }).catch(() => null);
      if (!cancelled && r) {
        setMetrics(r);
        setLastRefresh(Date.now());
      }
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [metricsFn]);

  useEffect(() => {
    try {
      setBrokerConnected(!!localStorage.getItem("sc_broker"));
      const t = localStorage.getItem("sc_theme");
      if (t) setThemeIdState(t);
      const m = localStorage.getItem("sc_mode");
      setLightMode(m === "light");
    } catch { /* ignore */ }
  }, [menuOpen]);

  // Auto-start the moment a broker is linked (real or demo). The bot then
  // trades for itself on the 60s interval below.
  useEffect(() => {
    if (brokerConnected && !running) {
      void handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokerConnected]);

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
    let active = Object.entries(symbols).filter(([, c]) => c.enabled);
    let maxPositions = 0;
    try { maxPositions = Number(localStorage.getItem("sc_max_positions") || "0") || 0; } catch { /* */ }
    if (maxPositions > 0) active = active.slice(0, maxPositions);
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
        ["--app-bg" as string]: lightMode ? "oklch(0.98 0.01 260)" : theme.bg,
        ["--brand" as string]: theme.brand,
        background: lightMode
          ? `radial-gradient(80% 50% at 50% 0%, ${theme.brand.replace(")", " / 0.22)")} , transparent), oklch(0.98 0.01 260)`
          : `radial-gradient(80% 50% at 50% 0%, ${theme.brand.replace(")", " / 0.35)")} , transparent), ${theme.bg}`,
        color: lightMode ? "oklch(0.18 0.03 260)" : undefined,
      }}
    >
      {/* Full-visible meditating robot + raining dollars — animates when running */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${meditatingRobot})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          animation: running ? "bgPulse 6s ease-in-out infinite" : "none",
          transformOrigin: "center",
          opacity: lightMode ? 0.35 : 1,
        }}
      />
      {/* Themed color wash — reacts to the selected background theme */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(80% 60% at 50% 40%, color-mix(in oklab, var(--brand) 55%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--app-bg) 55%, transparent) 0%, color-mix(in oklab, var(--app-bg) 80%, transparent) 100%)`,
          mixBlendMode: lightMode ? "screen" : "multiply",
          opacity: lightMode ? 0.55 : 1,
        }}
      />
      {/* Falling dollar signs (only when running) */}
      {running && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute font-black"
              style={{
                left: `${(i * 7 + 3) % 100}%`,
                top: "-8%",
                fontSize: `${12 + (i % 5) * 4}px`,
                color: "var(--brand-glow, var(--brand))",
                textShadow: "0 0 10px var(--brand)",
                animation: `rainDrop ${4 + (i % 6)}s linear ${i * 0.35}s infinite`,
                opacity: 0.75,
              }}
            >
              $
            </span>
          ))}
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-6">
        <header className="relative flex items-center justify-center">
          <Logo />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10"
            style={{ boxShadow: "0 0 16px -6px var(--brand)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} themeId={themeId} setThemeId={setThemeId} />

        <RobotHero running={running} />

        <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">MetaApi · Live Account</div>
              <div className="mt-0.5 text-sm font-semibold">
                {metrics?.ok ? `${metrics.broker || "Broker"} · #${metrics.login}` : "Awaiting connection…"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: metrics?.ok ? "var(--success)" : "var(--danger)",
                  boxShadow: metrics?.ok ? "0 0 10px var(--success)" : "none",
                }}
              />
              <span className="uppercase tracking-widest">
                {metrics ? (metrics.ok ? `${metrics.region} · cloud-g2` : "offline") : "…"}
              </span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="uppercase tracking-widest">
              {metrics?.ok ? "Live · reachable" : metrics ? "Unreachable" : "Connecting…"}
            </span>
            <span>
              {lastRefresh ? `Refreshed ${new Date(lastRefresh).toLocaleTimeString()}` : "—"}
            </span>
          </div>

          {metrics?.ok ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Balance</div>
                  <div className="mt-0.5 font-mono text-sm">{metrics.balance.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Equity</div>
                  <div className="mt-0.5 font-mono text-sm">{metrics.equity.toFixed(2)}</div>
                </div>
                <div
                  className="rounded-lg border border-white/10 bg-black/30 p-2"
                  style={{ color: metrics.profit >= 0 ? "var(--success)" : "var(--danger)" }}
                >
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">P/L</div>
                  <div className="mt-0.5 font-mono text-sm">{metrics.profit >= 0 ? "+" : ""}{metrics.profit.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Free Margin</div>
                  <div className="mt-0.5 font-mono text-xs">{metrics.freeMargin.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Leverage</div>
                  <div className="mt-0.5 font-mono text-xs">1:{metrics.leverage || "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Open</div>
                  <div className="mt-0.5 font-mono text-xs">{metrics.openPositions}</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {metrics.server} · {metrics.currency} · {metrics.type || "live"}
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-muted-foreground">
              {metrics && !metrics.ok
                ? metrics.error
                : "Connecting to mt-client-api-v1.new-york.agiliumtrade.ai…"}
            </div>
          )}
        </section>

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
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Mode</div>
              <div className="mt-1 text-sm font-semibold">{brokerConnected ? "Auto-Trade" : "Not linked"}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (running) { setRunning(false); setExec(null); }
                else { void handleStart(); }
              }}
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-3 text-[11px] font-semibold uppercase tracking-widest text-white transition-all active:scale-[0.98]"
              style={{
                background: running
                  ? "linear-gradient(135deg, var(--danger), oklch(0.35 0.15 25))"
                  : "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))",
                boxShadow: running
                  ? "0 0 24px -4px var(--danger)"
                  : "0 0 24px -4px var(--brand)",
              }}
            >
              {running ? <Square className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
              <span>{running ? "Stop" : "Start"}</span>
            </button>
            <Link
              to="/symbols"
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[11px] font-semibold uppercase tracking-widest text-foreground transition-all active:scale-[0.98] hover:bg-white/10"
            >
              <Coins className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} />
              <span>Symbols</span>
            </Link>
            <Link
              to="/broker"
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-3 text-[11px] font-semibold uppercase tracking-widest text-foreground transition-all active:scale-[0.98] hover:bg-white/10"
            >
              <Link2 className="h-4 w-4" style={{ color: "oklch(0.78 0.18 60)" }} />
              <span>Broker</span>
            </Link>
          </div>

          {exec && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px]">
              <div className="font-semibold">{exec.status}</div>
              {exec.detail && <div className="text-muted-foreground">{exec.detail}</div>}
            </div>
          )}
        </section>

        <QuickSetup />

        <div
          className="mt-4 flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{
            background: "color-mix(in oklab, var(--brand) 18%, transparent)",
            borderColor: "color-mix(in oklab, var(--brand) 45%, transparent)",
            color: "var(--brand-glow, var(--brand))",
            boxShadow: "0 0 24px -8px var(--brand)",
          }}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Powered by Algo Trading</span>
        </div>

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

      </div>
      <BottomNav />
    </div>
  );
}

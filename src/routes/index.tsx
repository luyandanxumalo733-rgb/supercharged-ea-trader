import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import robotLogo from "@/assets/robot-logo.png";
import { Menu, X, LayoutDashboard, Activity, Settings, Bell, Shield, History, Wallet, HelpCircle, ScanLine, Link2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperCharged Algo EA" },
      { name: "description", content: "SuperCharged Algo EA — mobile control panel for multi-pair algorithmic trading." },
      { property: "og:title", content: "SuperCharged Algo EA" },
      { property: "og:description", content: "Mobile EA scanner and controller for all FX pairs." },
    ],
  }),
  component: Index,
});

const PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "EURAUD", "GBPAUD", "XAUUSD",
  "XAGUSD", "BTCUSD", "ETHUSD",
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid h-12 w-12 place-items-center rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.55 0.22 255 / 0.9), oklch(0.20 0.10 260) 70%)",
          boxShadow:
            "0 0 24px oklch(0.62 0.22 255 / 0.7), inset 0 0 12px oklch(0.78 0.18 230 / 0.5)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
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
          className="relative h-11 w-11 object-contain drop-shadow-[0_0_6px_oklch(0.78_0.18_230)]"
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
  to?: "/" | "/analyzer" | "/broker";
}> = [
  { icon: LayoutDashboard, label: "Dashboard",         color: "oklch(0.65 0.22 255)", to: "/" },
  { icon: ScanLine,        label: "Chart Analyzer",    color: "oklch(0.72 0.20 150)", to: "/analyzer" },
  { icon: Link2,           label: "Broker Connection", color: "oklch(0.78 0.18 60)",  to: "/broker" },
  { icon: Activity,        label: "Live Scanner",      color: "oklch(0.70 0.20 30)"  },
  { icon: Wallet,          label: "Portfolio",         color: "oklch(0.68 0.22 340)" },
  { icon: History,         label: "Trade History",     color: "oklch(0.65 0.22 200)" },
  { icon: Bell,            label: "Alerts",            color: "oklch(0.70 0.15 290)" },
  { icon: Shield,          label: "Risk Manager",      color: "oklch(0.72 0.18 180)" },
  { icon: Settings,        label: "Settings",          color: "oklch(0.74 0.16 110)" },
  { icon: HelpCircle,      label: "Support",           color: "oklch(0.70 0.18 50)"  },
];

function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-72 transform border-l border-white/10 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
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

function Index() {
  const [running, setRunning] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brokerConnected, setBrokerConnected] = useState(false);
  useEffect(() => {
    try {
      setBrokerConnected(!!localStorage.getItem("sc_broker"));
    } catch { /* ignore */ }
  }, [menuOpen]);
  const [lots, setLots] = useState<Record<string, string>>(() =>
    Object.fromEntries(PAIRS.map((p) => [p, "0.01"])),
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PAIRS.map((p) => [p, true])),
  );

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        background:
          "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.12 260 / 0.6), transparent), oklch(0.13 0.04 260)",
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
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {!brokerConnected && (
          <Link
            to="/broker"
            className="mt-5 flex items-center gap-3 rounded-2xl border border-[oklch(0.55_0.18_85_/_0.4)] p-3 transition hover:brightness-110"
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

        <Link
          to="/analyzer"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition hover:bg-white/10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "oklch(0.62 0.22 255)", boxShadow: "var(--shadow-glow)" }}>
            <ScanLine className="h-5 w-5 text-white" />
          </span>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_230)]">AI Vision</div>
            <div className="text-sm font-semibold">Analyze chart screenshot → Buy / Sell</div>
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Open →</span>
        </Link>

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
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Pairs</div>
              <div className="mt-1 text-lg font-semibold">{activeCount}/{PAIRS.length}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setRunning(true)}
              disabled={running}
              className="rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: running ? "none" : "var(--shadow-glow)",
              }}
            >
              Start
            </button>
            <button
              onClick={() => setRunning(false)}
              disabled={!running}
              className="rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition-all active:scale-[0.98] disabled:opacity-40 hover:bg-white/10"
            >
              Stop
            </button>
          </div>
        </section>

        <section className="mt-4">
          <ChartScanner running={running} />
        </section>

        <section className="mt-6">
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Pairs &amp; Lot Size
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Required
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)]">
            {PAIRS.map((pair, i) => (
              <div
                key={pair}
                className={`flex items-center gap-3 px-3 py-3 ${i !== 0 ? "border-t border-white/5" : ""}`}
              >
                <button
                  onClick={() => setEnabled((e) => ({ ...e, [pair]: !e[pair] }))}
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    background: enabled[pair] ? "var(--brand)" : "oklch(0.35 0.03 260)",
                  }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                    style={{ left: enabled[pair] ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
                <div className="flex-1">
                  <div className="text-sm font-semibold tracking-wide">{pair}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Lot size
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={lots[pair]}
                  onChange={(e) => setLots((l) => ({ ...l, [pair]: e.target.value }))}
                  className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-right text-sm font-mono tabular-nums text-foreground outline-none focus:border-[var(--brand)]"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

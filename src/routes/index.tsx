import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

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
    <div className="flex items-center gap-2">
      <div
        className="relative grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.75_0.18_230)]">Algo EA</div>
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

function Index() {
  const [running, setRunning] = useState(false);
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
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            v1.0
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
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

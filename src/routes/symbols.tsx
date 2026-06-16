import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

export const Route = createFileRoute("/symbols")({
  head: () => ({
    meta: [
      { title: "Symbols — SuperCharged EA V1.0" },
      { name: "description", content: "Manage trading symbols, lot sizes, TP and SL for every pair traded by SuperCharged EA." },
    ],
  }),
  component: Symbols,
});

const GROUPS: Record<string, string[]> = {
  Majors: ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"],
  Crosses: ["EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "EURAUD", "GBPAUD"],
  Metals: ["XAUUSD", "XAGUSD"],
  Crypto: ["BTCUSD", "ETHUSD"],
};

type Cfg = { enabled: boolean; lot: string; tp: string; sl: string };
const DEFAULT: Cfg = { enabled: true, lot: "0.01", tp: "30", sl: "20" };

function loadCfg(): Record<string, Cfg> {
  try {
    const raw = localStorage.getItem("sc_symbols");
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return {};
}

function Symbols() {
  const all = Object.values(GROUPS).flat();
  const [cfg, setCfg] = useState<Record<string, Cfg>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = loadCfg();
    const merged = Object.fromEntries(all.map((s) => [s, saved[s] ?? { ...DEFAULT }]));
    setCfg(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(cfg).length) localStorage.setItem("sc_symbols", JSON.stringify(cfg));
  }, [cfg]);

  const update = (sym: string, patch: Partial<Cfg>) =>
    setCfg((c) => ({ ...c, [sym]: { ...c[sym], ...patch } }));

  return (
    <div className="min-h-screen text-foreground" style={{ background: "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.12 260 / 0.6), transparent), var(--app-bg, oklch(0.13 0.04 260))" }}>
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Trading</div>
            <h1 className="text-lg font-bold">Symbols</h1>
          </div>
        </header>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Search symbol"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>

        {Object.entries(GROUPS).map(([group, syms]) => {
          const filtered = syms.filter((s) => s.includes(query));
          if (!filtered.length) return null;
          return (
            <section key={group} className="mt-5">
              <div className="mb-2 flex items-end justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.78_0.18_230)]">{group}</h2>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{filtered.length}</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)]">
                {filtered.map((sym, i) => {
                  const c = cfg[sym] ?? DEFAULT;
                  return (
                    <div key={sym} className={`px-3 py-3 ${i ? "border-t border-white/5" : ""}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => update(sym, { enabled: !c.enabled })}
                          className="relative h-6 w-11 rounded-full transition-colors"
                          style={{ background: c.enabled ? "var(--brand)" : "oklch(0.35 0.03 260)" }}
                        >
                          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: c.enabled ? "calc(100% - 22px)" : "2px" }} />
                        </button>
                        <div className="flex-1">
                          <div className="text-sm font-semibold tracking-wide">{sym}</div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Lot · TP · SL</div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <Field label="Lot" value={c.lot} step="0.01" min="0.01" onChange={(v) => update(sym, { lot: v })} />
                        <Field label="TP pips" value={c.tp} step="1" min="1" onChange={(v) => update(sym, { tp: v })} />
                        <Field label="SL pips" value={c.sl} step="1" min="1" onChange={(v) => update(sym, { sl: v })} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="mt-5 text-[10px] leading-relaxed text-muted-foreground">
          TP &amp; SL are required for every order. Values are saved per symbol on this device.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, step, min, onChange }: { label: string; value: string; step: string; min: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-right text-sm font-mono tabular-nums outline-none focus:border-[var(--brand)]"
      />
    </label>
  );
}
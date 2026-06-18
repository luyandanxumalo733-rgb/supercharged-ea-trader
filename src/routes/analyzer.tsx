import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Upload, Loader2, TrendingUp, TrendingDown, MinusCircle, ScanLine, Target } from "lucide-react";
import { analyzeChart } from "@/lib/analyze-chart.functions";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Chart Analyzer — SuperCharged Algo EA" },
      { name: "description", content: "Upload a chart screenshot and get an AI buy/sell signal with entry, stop loss, and take profit." },
    ],
  }),
  component: Analyzer,
});

const PAIRS = ["EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD","XAUUSD","BTCUSD","ETHUSD"];
const TFS = ["M5","M15","M30","H1","H4","D1"];

type Result = Awaited<ReturnType<typeof analyzeChart>>;

function Analyzer() {
  const analyze = useServerFn(analyzeChart);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return setError("Please upload an image file.");
    if (file.size > 5_500_000) return setError("Image must be under 5MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function run() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const r = await analyze({ data: { imageDataUrl: preview, pair, timeframe } });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze chart");
    } finally {
      setLoading(false);
    }
  }

  const signalColor =
    result?.signal === "BUY" ? "var(--success)" :
    result?.signal === "SELL" ? "var(--danger)" :
    "oklch(0.78 0.18 60)";
  const SignalIcon = result?.signal === "BUY" ? TrendingUp : result?.signal === "SELL" ? TrendingDown : MinusCircle;

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground" style={{ background: "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.12 260 / 0.6), transparent), oklch(0.13 0.04 260)" }}>
      <img
        src={robotLogo}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-32 -z-0 h-[420px] w-[420px] -translate-x-1/2 opacity-[0.06] blur-[1px]"
      />
      <div className="relative z-10 mx-auto max-w-md px-4 pb-24 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">AI Vision</div>
            <h1 className="text-lg font-bold">Chart Analyzer</h1>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[oklch(0.78_0.20_230)]">Powered by Algo Trading</div>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full border border-[oklch(0.55_0.22_150_/_0.45)] bg-[oklch(0.20_0.10_150_/_0.5)] px-2.5 py-1">
            <Target className="h-3 w-3 text-[oklch(0.85_0.20_150)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.85_0.20_150)]">99% Accurate</span>
          </div>
        </header>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Pair</span>
              <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm">
                {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Timeframe</span>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm">
                {TFS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="relative mt-4 cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/15 bg-black/30 transition hover:border-[var(--brand)]"
          >
            {preview ? (
              <>
                <img src={preview} alt="Chart preview" className="block max-h-72 w-full object-contain" />
                {loading && (
                  <div className="pointer-events-none absolute inset-0">
                    {/* sweeping scanline */}
                    <div className="absolute inset-x-0 h-[3px]" style={{
                      background: "linear-gradient(90deg, transparent, oklch(0.85 0.20 150), transparent)",
                      boxShadow: "0 0 18px oklch(0.85 0.20 150)",
                      animation: "scanY 1.6s linear infinite",
                    }} />
                    {/* corner brackets */}
                    {["top-2 left-2 border-l-2 border-t-2","top-2 right-2 border-r-2 border-t-2","bottom-2 left-2 border-l-2 border-b-2","bottom-2 right-2 border-r-2 border-b-2"].map((c) => (
                      <span key={c} className={`absolute h-5 w-5 ${c}`} style={{ borderColor: "oklch(0.85 0.20 150)" }} />
                    ))}
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[oklch(0.55_0.22_150_/_0.5)] bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-[oklch(0.85_0.20_150)]">
                      <ScanLine className="h-3 w-3 animate-pulse" /> Analysing chart — detecting Buy / Sell
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <Upload className="h-6 w-6 text-[oklch(0.78_0.18_230)]" />
                <div className="text-sm font-medium">Upload chart screenshot</div>
                <div className="text-xs text-muted-foreground">PNG / JPG up to 5MB</div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />

          <button
            onClick={run}
            disabled={!preview || loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing</> : "Analyze Chart"}
          </button>

          {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        </section>

        {result && (
          <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Signal</div>
                <div className="mt-1 flex items-center gap-2">
                  <SignalIcon className="h-5 w-5" style={{ color: signalColor }} />
                  <span className="text-2xl font-bold" style={{ color: signalColor }}>{result.signal}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</div>
                <div className="text-2xl font-bold">{Math.round(result.confidence)}%</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Entry", result.entry],
                ["Stop Loss", result.stopLoss],
                ["Take Profit", result.takeProfit],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
                  <div className="mt-1 truncate text-sm font-mono">{val || "—"}</div>
                </div>
              ))}
            </div>
            {result.reasoning && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{result.reasoning}</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
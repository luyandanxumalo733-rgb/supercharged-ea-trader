import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, TrendingUp, TrendingDown, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { verifyMt5Bridge } from "@/lib/verify-mt5.functions";
import { executeTrade, type TradeRequest } from "@/lib/execute-trade.functions";

export const Route = createFileRoute("/mt5")({
  head: () => ({
    meta: [
      { title: "Web-to-MT5 Cloud Bridge — SuperCharged EA" },
      { name: "description", content: "Link your Headway / Dupoin MT5 account and place Buy/Sell orders with automatic TP and SL from your phone." },
    ],
  }),
  component: Mt5Panel,
});

const SERVERS = [
  "HeadwayInvest-Live", "HeadwayInvest-Live 2", "HeadwayInvest-Live 3", "HeadwayInvest-Demo",
  "Dupoin-Live", "Dupoin-Live 2", "Dupoin-Demo",
];

type Log = { at: string; ok: boolean; blocked?: boolean; msg: string; symbol: string; side: "BUY" | "SELL"; entryPrice?: number; spreadPips?: number };

function Mt5Panel() {
  const verify = useServerFn(verifyMt5Bridge);
  const trade = useServerFn(executeTrade);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState(SERVERS[0]);
  const [showPass, setShowPass] = useState(false);
  const [linked, setLinked] = useState(false);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState("0.10");
  const [slPips, setSlPips] = useState("20");
  const [tpPips, setTpPips] = useState("40");
  const [maxSpread, setMaxSpread] = useState("5");
  const [busy, setBusy] = useState<"BUY" | "SELL" | null>(null);
  const [log, setLog] = useState<Log[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sc_mt5_link");
      if (raw) {
        const s = JSON.parse(raw) as { login: string; server: string; at: string };
        setLogin(s.login); setServer(s.server); setLinkedAt(s.at); setLinked(true);
      }
    } catch { /* ignore */ }
  }, []);

  async function link(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,12}$/.test(login.trim())) return toast.error("Account number must be 4–12 digits");
    if (password.length < 4) return toast.error("Password is required");
    if (!server.trim()) return toast.error("Broker server is required");
    setLinking(true);
    try {
      const res = await verify({ data: { login: login.trim(), password, server: server.trim() } });
      if (res.ok) {
        const at = new Date().toISOString();
        localStorage.setItem("sc_mt5_link", JSON.stringify({ login: login.trim(), server, at }));
        setLinked(true); setLinkedAt(at); setPassword("");
        toast.success("MT5 account linked", { description: `Cloud bridge verified via ${(res as { region?: string }).region ?? "london"}.` });
      } else {
        toast.error("Link failed", { description: res.body || `Stage: ${res.stage}` });
      }
    } catch (err) {
      toast.error("Link error", { description: (err as Error).message });
    } finally {
      setLinking(false);
    }
  }

  async function send(side: "BUY" | "SELL") {
    if (!linked) return toast.error("Link your MT5 account first");
    setBusy(side);
    try {
      const payload: TradeRequest = {
        symbol: symbol.trim().toUpperCase(),
        side,
        lot: Number(lot),
        slPips: Number(slPips),
        tpPips: Number(tpPips),
        maxSpreadPips: Number(maxSpread),
      };
      const res = await trade({ data: payload });
      const entry: Log = {
        at: new Date().toLocaleTimeString(),
        ok: res.ok,
        blocked: "blocked" in res ? res.blocked : undefined,
        msg: res.body ?? "",
        symbol: payload.symbol,
        side,
        entryPrice: "entryPrice" in res ? res.entryPrice : undefined,
        spreadPips: "spreadPips" in res ? res.spreadPips : undefined,
      };
      setLog((l) => [entry, ...l].slice(0, 20));
      if (res.ok) toast.success(`${side} accepted`, { description: entry.entryPrice ? `Entry ${entry.entryPrice} · TP ${tpPips}p · SL ${slPips}p` : "Order sent with TP/SL" });
      else if (entry.blocked) toast.warning("Blocked by spread guard", { description: res.body });
      else toast.error("Order rejected", { description: res.body });
    } catch (err) {
      toast.error("Request failed", { description: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  function unlink() {
    localStorage.removeItem("sc_mt5_link");
    setLinked(false); setLinkedAt(null);
  }

  return (
    <div className="min-h-screen pb-28 text-foreground">
      <header className="mx-auto flex max-w-md items-center gap-3 px-4 pt-6">
        <Link to="/settings" className="rounded-lg p-2 hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Web-to-MT5 Cloud Bridge</div>
          <h1 className="text-lg font-black uppercase tracking-wider">Mobile Trade Panel</h1>
        </div>
      </header>

      <div className="mx-auto mt-4 max-w-md space-y-3 px-4">
        {/* 1. Credentials */}
        <form onSubmit={link} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60">
            <ShieldCheck className="h-4 w-4 text-[oklch(0.78_0.20_230)]" />
            <span>MT5 Account · Headway / Dupoin</span>
          </div>

          <label className="mt-3 block text-xs">
            <span className="font-semibold uppercase tracking-widest text-white/60">MT5 Account Number</span>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 5001234"
              maxLength={12}
              className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </label>

          <label className="mt-3 block text-xs">
            <span className="font-semibold uppercase tracking-widest text-white/60">Trading Password</span>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                maxLength={64}
                className="w-full rounded-lg bg-black/40 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute inset-y-0 right-2 grid place-items-center text-white/60">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="mt-3 block text-xs">
            <span className="font-semibold uppercase tracking-widest text-white/60">Broker Server Name</span>
            <input
              list="mt5-servers"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="Headway-Live / Dupoin-Live"
              className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
            <datalist id="mt5-servers">{SERVERS.map((s) => <option key={s} value={s} />)}</datalist>
          </label>

          <button
            type="submit"
            disabled={linking}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--brand), oklch(0.30 0.15 260))" }}
          >
            {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {linking ? "Verifying…" : linked ? "Re-link Account" : "Link MT5 Account"}
          </button>

          {linked && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[oklch(0.45_0.15_150)] bg-[oklch(0.25_0.10_150_/_0.25)] px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                <span>Linked · {login} @ {server}</span>
              </div>
              <button type="button" onClick={unlink} className="text-white/60 underline">Unlink</button>
            </div>
          )}
          {linkedAt && <div className="mt-1 text-[10px] text-white/40">Verified {new Date(linkedAt).toLocaleString()}</div>}

          <p className="mt-2 text-[10px] leading-relaxed text-white/50">
            Credentials are relayed over the MetaApi.cloud MT5 web terminal — no PC, VPS, or Ngrok required.
            The password is used to authorize the cloud bridge and is not stored on this device.
          </p>
        </form>

        {/* 2. Trade panel */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Place Order · Auto TP / SL</div>

          <label className="mt-3 block text-xs">
            <span className="font-semibold uppercase tracking-widest text-white/60">Symbol</span>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="EURUSD, XAUUSD, US30, BTCUSD…"
              className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Volume (lots)" value={lot} onChange={setLot} step="0.01" />
            <Field label="Max spread (pips)" value={maxSpread} onChange={setMaxSpread} step="0.5" />
            <Field label="Stop Loss (pips)" value={slPips} onChange={setSlPips} step="1" />
            <Field label="Take Profit (pips)" value={tpPips} onChange={setTpPips} step="1" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => send("BUY")}
              disabled={!linked || busy !== null}
              className="flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-black uppercase tracking-widest text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.20 155), oklch(0.40 0.18 155))", boxShadow: "0 8px 30px -10px oklch(0.60 0.20 155 / 0.7)" }}
            >
              {busy === "BUY" ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Buy
            </button>
            <button
              type="button"
              onClick={() => send("SELL")}
              disabled={!linked || busy !== null}
              className="flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-black uppercase tracking-widest text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, oklch(0.60 0.22 25), oklch(0.40 0.20 25))", boxShadow: "0 8px 30px -10px oklch(0.60 0.22 25 / 0.7)" }}
            >
              {busy === "SELL" ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
              Sell
            </button>
          </div>
          {!linked && <p className="mt-2 text-center text-[11px] text-white/50">Link your MT5 account above to enable Buy / Sell.</p>}
        </div>

        {/* 3. Log */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">Order Log</div>
          {log.length === 0 ? (
            <div className="text-sm text-white/50">No orders yet.</div>
          ) : (
            <ul className="space-y-2">
              {log.map((e, i) => (
                <li key={i} className="rounded-lg border border-white/10 bg-black/30 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    {e.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <ShieldAlert className={`h-4 w-4 ${e.blocked ? "text-amber-400" : "text-red-400"}`} />}
                    <span className="font-bold">{e.side} {e.symbol}</span>
                    <span className="ml-auto text-white/50">{e.at}</span>
                  </div>
                  <div className="mt-1 text-white/70">
                    {e.entryPrice !== undefined && <>entry {e.entryPrice} · </>}
                    {e.spreadPips !== undefined && <>spread {e.spreadPips}p · </>}
                    <span className={e.ok ? "text-emerald-300" : e.blocked ? "text-amber-300" : "text-red-300"}>
                      {e.ok ? "accepted" : e.blocked ? "blocked" : "rejected"}
                    </span>
                  </div>
                  <div className="mt-1 break-all text-white/50">{e.msg}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: string; onChange: (v: string) => void; step: string }) {
  return (
    <label className="block text-xs">
      <span className="font-semibold uppercase tracking-widest text-white/60">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-black/40 px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
    </label>
  );
}
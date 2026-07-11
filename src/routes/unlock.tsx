import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { unlockApp } from "@/lib/unlock.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Unlock — SuperCharged EA V1.0" },
      { name: "description", content: "Enter your app access key to unlock SuperCharged EA." },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const unlock = useServerFn(unlockApp);
  const nav = useNavigate();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      // Attach the header for this call directly since it isn't saved yet.
      // Save first, then verify server-side; roll back on failure.
      try { localStorage.setItem("sc_app_key", key); } catch { /* */ }
      const r = await unlock({ data: { key } });
      if (r.ok) {
        nav({ to: "/" });
      } else {
        try { localStorage.removeItem("sc_app_key"); } catch { /* */ }
        setErr("Invalid access key.");
      }
    } catch (e) {
      try { localStorage.removeItem("sc_app_key"); } catch { /* */ }
      setErr((e as Error).message || "Unlock failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.04_260)] text-foreground">
      <div className="mx-auto max-w-sm px-4 pt-24">
        <div className="rounded-2xl border border-white/10 bg-[oklch(0.18_0.06_260_/_0.7)] p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))" }}>
              <Lock className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.78_0.18_230)]">Secure Gate</div>
              <h1 className="text-lg font-bold">Unlock SuperCharged EA</h1>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Enter the app access key configured for this project. This protects trade execution,
            account metrics, and AI analysis from unauthenticated callers.
          </p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              type="password"
              autoComplete="current-password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="APP_ACCESS_KEY"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none"
            />
            {err && <div className="rounded-lg border border-[var(--danger)]/40 p-2 text-[11px] text-[var(--danger)]">{err}</div>}
            <button
              type="submit"
              disabled={busy || !key}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))" }}
            >
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
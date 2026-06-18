import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Plus, Trash2, Check, Lock, Fingerprint, Eye, EyeOff } from "lucide-react";
import robotLogo from "@/assets/robot-logo.png";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "Mentor Keys — SuperCharged EA V1.0" },
      { name: "description", content: "Generate Mentor IDs and license keys to host other robots under SuperCharged EA." },
    ],
  }),
  component: Mentor,
});

type MentorKey = {
  id: string;
  mentorId: string;
  key: string;
  label: string;
  createdAt: string;
};

function randId(len: number, alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") {
  let out = "";
  for (let i = 0; i < len; i++) out += alpha[Math.floor(Math.random() * alpha.length)];
  return out;
}
function newMentor(label: string): MentorKey {
  const mentorId = "MNT-" + randId(4) + "-" + randId(4);
  const key = "SCEA-" + randId(5) + "-" + randId(5) + "-" + randId(5);
  return { id: crypto.randomUUID(), mentorId, key, label, createdAt: new Date().toISOString() };
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function PasscodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    try { setHasPin(!!localStorage.getItem("sc_mentor_pin")); } catch { /* */ }
  }, []);

  async function submit() {
    setError(null);
    if (!/^\d{4,8}$/.test(pin)) { setError("Use a 4–8 digit passcode."); return; }
    if (!hasPin) {
      if (pin !== confirmPin) { setError("Passcodes don't match."); return; }
      const h = await sha256(pin + "|sc_mentor");
      try { localStorage.setItem("sc_mentor_pin", h); } catch { /* */ }
      onUnlock();
      return;
    }
    const h = await sha256(pin + "|sc_mentor");
    const saved = localStorage.getItem("sc_mentor_pin");
    if (h === saved) onUnlock();
    else setError("Wrong passcode.");
  }

  async function biometric() {
    setError(null);
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      setError("Biometric not supported on this device.");
      return;
    }
    setBioBusy(true);
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 30000,
          userVerification: "required",
        },
      } as CredentialRequestOptions).catch(() => null);
      // Even if no platform credential exists, treat a successful userVerification
      // OS prompt (Face/Touch ID / Android biometric) as unlock alongside an existing PIN.
      if (hasPin) onUnlock();
      else setError("Set a passcode first, then enable biometric on next unlock.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBioBusy(false);
    }
  }

  return (
    <div className="min-h-screen text-foreground" style={{ background: "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.16 255 / 0.6), transparent), oklch(0.13 0.04 260)" }}>
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Protected</div>
            <h1 className="text-lg font-bold">Mentor Keys</h1>
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, oklch(0.32 0.18 255 / 0.55), oklch(0.18 0.08 260))" }}>
          <img src={robotLogo} alt="" aria-hidden className="pointer-events-none absolute -right-8 -bottom-8 h-44 w-44 opacity-10" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl mx-auto"
            style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 255), oklch(0.40 0.18 260))", boxShadow: "0 0 22px -4px oklch(0.62 0.22 255)" }}>
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="relative mt-4 text-center text-lg font-bold">{hasPin ? "Enter passcode" : "Create passcode"}</h2>
          <p className="relative mt-1 text-center text-xs text-muted-foreground">
            Mentor IDs &amp; license keys are revenue-bearing. Protect them with a passcode or biometric.
          </p>

          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="••••"
            className="relative mt-5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl tracking-[0.6em] font-mono"
          />
          {!hasPin && (
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Confirm"
              className="relative mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-lg tracking-[0.4em] font-mono"
            />
          )}
          {error && <p className="relative mt-2 text-center text-xs text-[var(--danger)]">{error}</p>}

          <button onClick={submit}
            className="relative mt-4 w-full rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg, var(--brand, oklch(0.62 0.22 255)), oklch(0.40 0.15 260))", boxShadow: "0 0 20px -4px oklch(0.62 0.22 255)" }}>
            {hasPin ? "Unlock" : "Set & Unlock"}
          </button>
          <button onClick={biometric} disabled={bioBusy}
            className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-foreground hover:bg-white/10 disabled:opacity-50">
            <Fingerprint className="h-4 w-4" /> {bioBusy ? "Verifying…" : "Use biometric"}
          </button>
        </section>
      </div>
    </div>
  );
}

function Mentor() {
  const [keys, setKeys] = useState<MentorKey[]>([]);
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sc_mentor_keys");
      if (raw) setKeys(JSON.parse(raw));
    } catch { /* */ }
  }, []);

  if (!unlocked) {
    return <PasscodeGate onUnlock={() => setUnlocked(true)} />;
  }

  function persist(next: MentorKey[]) {
    setKeys(next);
    try { localStorage.setItem("sc_mentor_keys", JSON.stringify(next)); } catch { /* */ }
  }

  function add() {
    const name = label.trim() || `Robot #${keys.length + 1}`;
    persist([newMentor(name), ...keys]);
    setLabel("");
  }
  function remove(id: string) { persist(keys.filter((k) => k.id !== id)); }

  async function copy(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1200); } catch { /* */ }
  }

  return (
    <div className="min-h-screen text-foreground" style={{ background: "radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.16 255 / 0.6), transparent), oklch(0.13 0.04 260)" }}>
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Host Robots</div>
            <h1 className="text-lg font-bold">Mentor Keys</h1>
          </div>
        </header>

        <section
          className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 p-4"
          style={{ background: "linear-gradient(135deg, oklch(0.32 0.18 255 / 0.55), oklch(0.18 0.08 260))" }}
        >
          <img src={robotLogo} alt="" aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 opacity-10" />
          <div className="relative flex items-center gap-2 text-[oklch(0.85_0.18_230)]">
            <KeyRound className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-widest">License Generator</span>
          </div>
          <h2 className="relative mt-1 text-xl font-bold">SuperCharged EA</h2>
          <p className="relative mt-1 text-sm text-muted-foreground">
            Host another robot under this EA and generate license keys with a Mentor ID. Use the key inside any other EA mobile app to activate it.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Robot / Client Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Trader John — Gold Bot"
              maxLength={60}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </label>
          <button
            onClick={add}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))", boxShadow: "0 0 20px -4px var(--brand)" }}
          >
            <Plus className="h-4 w-4" /> Generate Mentor Key
          </button>
        </section>

        <section className="mt-4 space-y-3">
          {keys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
              No keys yet. Generate one above.
            </div>
          )}
          {keys.map((k) => (
            <div key={k.id} className="rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{k.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(k.createdAt).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => remove(k.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {[
                { label: "Mentor ID", val: k.mentorId, id: k.id + "m" },
                { label: "License Key", val: k.key, id: k.id + "k" },
              ].map((row) => (
                <div key={row.id} className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                  <div className="flex-1">
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{row.label}</div>
                    <div className="font-mono text-sm tracking-wider text-[oklch(0.85_0.18_230)]">
                      {reveal[row.id] ? row.val : "•".repeat(Math.max(8, row.val.length))}
                    </div>
                  </div>
                  <button
                    onClick={() => setReveal((r) => ({ ...r, [row.id]: !r[row.id] }))}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    {reveal[row.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copy(row.val, row.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
                    {copied === row.id ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
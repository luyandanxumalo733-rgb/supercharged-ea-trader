import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, KeyRound, Plus, Trash2, Check } from "lucide-react";
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

function Mentor() {
  const [keys, setKeys] = useState<MentorKey[]>([]);
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sc_mentor_keys");
      if (raw) setKeys(JSON.parse(raw));
    } catch { /* */ }
  }, []);

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
                    <div className="font-mono text-sm tracking-wider text-[oklch(0.85_0.18_230)]">{row.val}</div>
                  </div>
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
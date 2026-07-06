import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Palette, Server, Link2, Rocket, Coins, KeyRound, History, Bell } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SuperCharged Algo EA" },
      { name: "description", content: "Choose your app colour theme, manage the MT5 bridge, broker connection, symbols and license keys." },
    ],
  }),
  component: SettingsPage,
});

const THEMES = [
  { id: "midnight", name: "Midnight Blue", bg: "oklch(0.13 0.04 260)", swatch: ["#0b1230", "#1d2b6b", "#3b82f6"] },
  { id: "neon",     name: "Neon Cyber",    bg: "oklch(0.12 0.05 300)", swatch: ["#1a0a2e", "#5b0ea8", "#ff2bd6"] },
  { id: "forest",   name: "Emerald",       bg: "oklch(0.14 0.05 160)", swatch: ["#06231d", "#0c5a47", "#22d3a0"] },
  { id: "sunset",   name: "Sunset",        bg: "oklch(0.16 0.07 30)",  swatch: ["#2a0e0a", "#7a2417", "#ff7a3a"] },
  { id: "mono",     name: "Carbon",        bg: "oklch(0.12 0.01 260)", swatch: ["#0a0a0c", "#26272b", "#a9adb8"] },
  { id: "gold",     name: "Royal Gold",    bg: "oklch(0.14 0.04 80)",  swatch: ["#1a1206", "#574012", "#f5c542"] },
];

const LINKS: Array<{ to: "/bridge" | "/broker" | "/setup" | "/symbols" | "/mentor" | "/history"; label: string; desc: string; color: string; icon: typeof Server }> = [
  { to: "/bridge",  label: "MT5 Bridge",         desc: "Test & manage the MetaApi bridge",  color: "oklch(0.70 0.20 200)", icon: Server },
  { to: "/broker",  label: "Broker Connection",  desc: "Link your Headway / MT5 account",   color: "oklch(0.78 0.18 60)",  icon: Link2 },
  { to: "/setup",   label: "Setup Wizard",       desc: "Validate credentials end-to-end",   color: "oklch(0.72 0.22 230)", icon: Rocket },
  { to: "/symbols", label: "Symbols & TP/SL",    desc: "Pick pairs, indexes, stocks",       color: "oklch(0.78 0.16 85)",  icon: Coins },
  { to: "/mentor",  label: "Mentor / License Keys", desc: "Host another robot", color: "oklch(0.70 0.22 290)", icon: KeyRound },
  { to: "/history", label: "Trade History",      desc: "Every order sent to MT5",           color: "oklch(0.65 0.22 200)", icon: History },
];

function SettingsPage() {
  const [themeId, setThemeId] = useState("midnight");
  const [webhook, setWebhook] = useState("");

  useEffect(() => {
    try {
      const t = localStorage.getItem("sc_theme");
      if (t) setThemeId(t);
      const w = localStorage.getItem("sc_alert_webhook");
      if (w) setWebhook(w);
    } catch { /* ignore */ }
  }, []);

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  function pickTheme(id: string) {
    setThemeId(id);
    try { localStorage.setItem("sc_theme", id); } catch { /* ignore */ }
  }

  function saveWebhook() {
    try { localStorage.setItem("sc_alert_webhook", webhook.trim()); } catch { /* ignore */ }
  }

  return (
    <div
      className="relative min-h-screen text-foreground"
      style={{ background: `radial-gradient(80% 50% at 50% 0%, oklch(0.28 0.12 260 / 0.5), transparent), ${theme.bg}` }}
    >
      <div className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-6">
        <header className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[oklch(0.78_0.18_230)]">Preferences</div>
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
        </header>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Palette className="h-3.5 w-3.5" /> Colour Theme
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTheme(t.id)}
                className={`rounded-xl border p-2 text-left transition ${themeId === t.id ? "border-white/50" : "border-white/10 hover:border-white/25"}`}
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
        </section>

        <section className="mt-4 space-y-2">
          {LINKS.map(({ to, label, desc, color, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--surface)] p-3 transition hover:bg-white/10"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${color}, oklch(0.30 0.08 260))`, boxShadow: `0 0 14px -4px ${color}` }}
              >
                <Icon className="h-4 w-4 text-white" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-[11px] text-muted-foreground">{desc}</div>
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Open →</span>
            </Link>
          ))}
        </section>

        <section className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Bell className="h-3.5 w-3.5" /> Alert Webhook (optional)
          </div>
          <input
            type="url"
            placeholder="https://your-webhook.example.com/alerts"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            onBlur={saveWebhook}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">Bridge down / recovery / latency spike alerts POST here as JSON.</p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
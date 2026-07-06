import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Home, ScanLine, Settings as SettingsIcon, LogOut } from "lucide-react";
import { toast } from "sonner";

type NavPath = "/" | "/analyzer" | "/settings";

const ITEMS: Array<{ to: NavPath; label: string; icon: typeof Home }> = [
  { to: "/",         label: "Home",     icon: Home },
  { to: "/analyzer", label: "Analyzer", icon: ScanLine },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function signOut() {
    try {
      // Reset local bot state so a different license / bot can be hosted.
      const keep = new Set(["sc_theme"]);
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sc_") && !keep.has(k)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
    toast.success("Signed out", { description: "Local bot state cleared — you can host another robot." });
    router.navigate({ to: "/mentor" });
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 backdrop-blur-xl"
      style={{
        background: "linear-gradient(180deg, oklch(0.16 0.05 260 / 0.85), oklch(0.10 0.04 260 / 0.95))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition"
              style={{
                background: active ? "linear-gradient(135deg, oklch(0.30 0.18 255 / 0.55), oklch(0.20 0.10 260 / 0.4))" : "transparent",
                boxShadow: active ? "0 0 18px -6px var(--brand)" : "none",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: active ? "oklch(0.85 0.20 230)" : "oklch(0.75 0.05 260)" }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: active ? "oklch(0.90 0.18 230)" : "oklch(0.70 0.03 260)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
        >
          <LogOut className="h-5 w-5 text-[oklch(0.75_0.18_30)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[oklch(0.80_0.15_30)]">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
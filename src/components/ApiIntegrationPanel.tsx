import { useEffect, useState } from "react";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type MetaApiUserConfig = {
  token: string;
  accountId: string;
  region: string;
  mt5Password: string;
  mt5Server: string;
};

const STORAGE_KEY = "sc_metaapi_config";
const EMPTY: MetaApiUserConfig = { token: "", accountId: "", region: "london", mt5Password: "", mt5Server: "" };

export function loadMetaApiConfig(): MetaApiUserConfig {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<MetaApiUserConfig>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

export function isMetaApiConfigured(cfg: MetaApiUserConfig | null | undefined = loadMetaApiConfig()): boolean {
  return !!(cfg && cfg.token && cfg.accountId);
}

function mask(v: string): string {
  if (!v) return "";
  if (v.length <= 6) return "•".repeat(v.length);
  return `${v.slice(0, 3)}${"•".repeat(Math.max(4, v.length - 7))}${v.slice(-4)}`;
}

export function ApiIntegrationPanel({ id, onChange }: { id?: string; onChange?: (cfg: MetaApiUserConfig) => void }) {
  const [cfg, setCfg] = useState<MetaApiUserConfig>(EMPTY);
  const [showToken, setShowToken] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setCfg(loadMetaApiConfig());
  }, []);

  function update<K extends keyof MetaApiUserConfig>(key: K, value: MetaApiUserConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      setDirty(false);
      onChange?.(cfg);
      toast.success("MetaApi configuration saved", { description: "Credentials attached to future execution calls." });
    } catch {
      toast.error("Could not save", { description: "localStorage is unavailable." });
    }
  }

  function clearAll() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setCfg(EMPTY);
      setDirty(false);
      onChange?.(EMPTY);
      toast.message("Configuration cleared");
    } catch { /* */ }
  }

  const configured = isMetaApiConfigured(cfg);

  return (
    <section id={id} className="mt-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))",
              boxShadow: "0 0 12px -2px var(--brand)",
            }}
          >
            <KeyRound className="h-4 w-4 text-white" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">API Integration</div>
            <div className="text-sm font-semibold">MetaApi &amp; MT5 credentials</div>
          </div>
        </div>
        <span
          className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{
            borderColor: configured ? "color-mix(in oklab, var(--success) 55%, transparent)" : "color-mix(in oklab, var(--danger) 55%, transparent)",
            color: configured ? "var(--success)" : "var(--danger)",
            background: configured ? "color-mix(in oklab, var(--success) 15%, transparent)" : "color-mix(in oklab, var(--danger) 15%, transparent)",
          }}
        >
          {configured ? <><CheckCircle2 className="h-3 w-3" /> Linked</> : <><AlertTriangle className="h-3 w-3" /> Not set</>}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MetaApi Token</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <input
              type={showToken ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={cfg.token}
              onChange={(e) => update("token", e.target.value)}
              placeholder={cfg.token ? mask(cfg.token) : "eyJhbGciOi…"}
              className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground"
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MT5 Account ID</span>
            <input
              autoComplete="off"
              spellCheck={false}
              value={cfg.accountId}
              onChange={(e) => update("accountId", e.target.value.trim())}
              placeholder="e.g. 5f9a…"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Region</span>
            <select
              value={cfg.region}
              onChange={(e) => update("region", e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none"
            >
              <option value="london">london</option>
              <option value="new-york">new-york</option>
              <option value="singapore">singapore</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">MT5 Password</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              spellCheck={false}
              value={cfg.mt5Password}
              onChange={(e) => update("mt5Password", e.target.value)}
              placeholder="Investor / master password"
              className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Broker Server Name</span>
          <input
            autoComplete="off"
            spellCheck={false}
            value={cfg.mt5Server}
            onChange={(e) => update("mt5Server", e.target.value)}
            placeholder="e.g. HeadwayCapital-Live"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={save}
          disabled={!dirty}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-white transition disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--brand), oklch(0.40 0.15 260))",
            boxShadow: "0 0 14px -3px var(--brand)",
          }}
        >
          <Save className="h-3.5 w-3.5" /> Save credentials
        </button>
        <button
          onClick={clearAll}
          className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-white/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Stored securely in this browser and sent as request headers on every execution call — never logged. Clear anytime to sign out.
      </p>
    </section>
  );
}
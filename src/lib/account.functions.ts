import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";

/**
 * Live account metrics pulled from MetaApi.cloud (cloud-g2, region from
 * METAAPI_REGION, default new-york). Returns a small JSON-safe DTO for the
 * dashboard — never raw secrets.
 */
export const getAccountMetrics = createServerFn({ method: "GET" })
  .inputValidator((_: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    // Hardcoded to the London terminal per deployment requirement.
    const region = "london-2";
    if (!token || !accountId) {
      return { ok: false as const, error: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID", region };
    }
    const base = `https://mt-client-api-v1.${region}.agiliumtrade.ai/users/current/accounts/${accountId}`;
    try {
      const [infoRes, positionsRes] = await Promise.all([
        fetch(`${base}/account-information`, {
          headers: { "auth-token": token },
          signal: AbortSignal.timeout(10000),
        }),
        fetch(`${base}/positions`, {
          headers: { "auth-token": token },
          signal: AbortSignal.timeout(10000),
        }),
      ]);
      if (!infoRes.ok) {
        const body = await infoRes.text();
        return { ok: false as const, error: `HTTP ${infoRes.status}: ${scrubSecrets(body).slice(0, 200)}`, region };
      }
      const info = await infoRes.json() as Record<string, unknown>;
      const positions = positionsRes.ok ? (await positionsRes.json() as unknown[]) : [];
      const num = (v: unknown) => (typeof v === "number" ? v : 0);
      return {
        ok: true as const,
        region,
        broker: String(info.broker ?? ""),
        server: String(info.server ?? ""),
        login: String(info.login ?? ""),
        name: String(info.name ?? ""),
        currency: String(info.currency ?? "USD"),
        type: String(info.type ?? ""),
        leverage: num(info.leverage),
        balance: num(info.balance),
        equity: num(info.equity),
        margin: num(info.margin),
        freeMargin: num(info.freeMargin),
        marginLevel: num(info.marginLevel),
        profit: num(info.profit),
        openPositions: Array.isArray(positions) ? positions.length : 0,
      };
    } catch (e) {
      return { ok: false as const, error: scrubSecrets((e as Error).message), region };
    }
  });
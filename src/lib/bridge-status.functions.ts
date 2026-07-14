import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";
import { getMetaApiConfig } from "./metaapi-config.server";

const PROVISIONING_BASE = "https://mt-provisioning-api-v1.agiliumtrade.ai";
const clientBase = (r: string) => `https://mt-client-api-v1.${r}.agiliumtrade.ai`;

/**
 * Lightweight combined status probe for the live status widget on /setup.
 * Returns bridge reachability, account provisioning state, region used,
 * and a server-generated verification timestamp.
 */
export const bridgeStatus = createServerFn({ method: "POST" })
  .inputValidator((_data: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const { token, accountId, region, fallbackRegions } = getMetaApiConfig();
    const checkedAt = new Date().toISOString();
    if (!token || !accountId) {
      return {
        reachable: false,
        provisioned: false,
        state: "unknown",
        connectionStatus: "",
        region,
        latencyMs: 0,
        checkedAt,
        body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID secrets.",
      };
    }

    // Provisioning state.
    let state = "unknown";
    let connectionStatus = "";
    let provisioned = false;
    try {
      const res = await fetch(`${PROVISIONING_BASE}/users/current/accounts/${accountId}`, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const info = (await res.json()) as { state?: string; connectionStatus?: string };
        state = String(info.state ?? "unknown");
        connectionStatus = String(info.connectionStatus ?? "");
        provisioned = state === "DEPLOYED";
      }
    } catch {
      /* ignore — reachability below still runs */
    }

    // Reachability — primary, standard fallbacks, then new-york as backup.
    const candidates = Array.from(new Set([region, ...fallbackRegions, "new-york"]));
    let reachable = false;
    let usedRegion = region;
    let latencyMs = 0;
    let body = "";
    for (const r of candidates) {
      const t0 = Date.now();
      try {
        const res = await fetch(`${clientBase(r)}/users/current/accounts/${accountId}/account-information`, {
          headers: { "auth-token": token },
          signal: AbortSignal.timeout(6000),
        });
        latencyMs = Date.now() - t0;
        usedRegion = r;
        if (res.ok) {
          reachable = true;
          break;
        }
        body = scrubSecrets(await res.text()).slice(0, 200);
        if (res.status === 401 || res.status === 403) break;
      } catch (e) {
        body = scrubSecrets((e as Error).message);
      }
    }

    return { reachable, provisioned, state, connectionStatus, region: usedRegion, latencyMs, checkedAt, body };
  });
import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";
import { getMetaApiConfig } from "./metaapi-config.server";

function metaApiBase(region: string) {
  return `https://mt-client-api-v1.${region}.agiliumtrade.ai`;
}

const PROVISIONING_BASE = "https://mt-provisioning-api-v1.agiliumtrade.ai";

/**
 * Auto-initialize the MetaApi cloud bridge for the configured account.
 * Reads the account's provisioning record (to detect if it's already
 * DEPLOYED) and issues a deploy request if not. Idempotent — safe to call
 * from the setup wizard on every run.
 */
export const deployMetaApiAccount = createServerFn({ method: "POST" })
  .inputValidator((_data: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const { token, accountId, region } = getMetaApiConfig();
    if (!token || !accountId) {
      return { ok: false, state: "unknown", body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID secrets.", region };
    }
    const acctUrl = `${PROVISIONING_BASE}/users/current/accounts/${accountId}`;
    try {
      const infoRes = await fetch(acctUrl, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(10000),
      });
      if (!infoRes.ok) {
        const body = await infoRes.text();
        return { ok: false, state: "unknown", status: infoRes.status, body: scrubSecrets(body).slice(0, 300), region };
      }
      const info = (await infoRes.json()) as { state?: string; connectionStatus?: string };
      const state = String(info.state ?? "");
      if (state === "DEPLOYED") {
        return { ok: true, state, connectionStatus: info.connectionStatus ?? "", region, deployed: false };
      }
      // Not deployed — kick off deploy.
      const deployRes = await fetch(`${acctUrl}/deploy`, {
        method: "POST",
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(15000),
      });
      const body = deployRes.ok ? "" : await deployRes.text();
      return {
        ok: deployRes.ok,
        state: deployRes.ok ? "DEPLOYING" : state,
        connectionStatus: info.connectionStatus ?? "",
        status: deployRes.status,
        body: body ? scrubSecrets(body).slice(0, 300) : "",
        region,
        deployed: deployRes.ok,
      };
    } catch (e) {
      return { ok: false, state: "unknown", body: scrubSecrets((e as Error).message), region };
    }
  });

export const pingBridge = createServerFn({ method: "POST" })
  .inputValidator((_data: { bridgeUrl?: string } | undefined) => ({}))
  .handler(async () => {
    requireAppAccess();
    const { token, accountId, region, fallbackRegions } = getMetaApiConfig();
    if (!token || !accountId) {
      return { ok: false, status: 0, latencyMs: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID", region };
    }
    // Try primary region, then standard fallback hosting regions (never new-york).
    const candidates = [region, ...fallbackRegions].filter((r) => r !== "new-york");
    let lastBody = "";
    let lastStatus = 0;
    for (const r of candidates) {
      const t0 = Date.now();
      const url = `${metaApiBase(r)}/users/current/accounts/${accountId}/account-information`;
      try {
        const res = await fetch(url, {
          headers: { "auth-token": token },
          signal: AbortSignal.timeout(8000),
        });
        const body = await res.text();
        if (res.ok) {
          return { ok: true, status: res.status, latencyMs: Date.now() - t0, body: scrubSecrets(body).slice(0, 200), region: r };
        }
        lastBody = scrubSecrets(body).slice(0, 200);
        lastStatus = res.status;
        // On 4xx auth errors, no point trying other regions.
        if (res.status === 401 || res.status === 403) {
          return { ok: false, status: res.status, latencyMs: Date.now() - t0, body: lastBody, region: r };
        }
      } catch (e) {
        lastBody = scrubSecrets((e as Error).message);
      }
    }
    return { ok: false, status: lastStatus, latencyMs: 0, body: lastBody || "All regions unreachable", region: candidates[candidates.length - 1] };
  });

/** Kept for setup wizard compatibility — MetaApi already authenticates the account; this just re-verifies. */
export const loginBridge = createServerFn({ method: "POST" })
  .inputValidator((_data: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const { token, accountId, region } = getMetaApiConfig();
    if (!token || !accountId) {
      return { ok: false, status: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };
    }
    const url = `${metaApiBase(region)}/users/current/accounts/${accountId}/account-information`;
    try {
      const res = await fetch(url, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(10000),
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body: scrubSecrets(body).slice(0, 400) };
    } catch (e) {
      return { ok: false, status: 0, body: scrubSecrets((e as Error).message) };
    }
  });

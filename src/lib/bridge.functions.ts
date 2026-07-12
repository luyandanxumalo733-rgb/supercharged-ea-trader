import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";
import { getMetaApiConfig } from "./metaapi-config.server";

function metaApiBase(region: string) {
  return `https://mt-client-api-v1.${region}.agiliumtrade.ai`;
}

export const pingBridge = createServerFn({ method: "POST" })
  .inputValidator((_data: { bridgeUrl?: string } | undefined) => ({}))
  .handler(async () => {
    requireAppAccess();
    const { token, accountId, region } = getMetaApiConfig();
    const t0 = Date.now();
    if (!token || !accountId) {
      return { ok: false, status: 0, latencyMs: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };
    }
    const url = `${metaApiBase(region)}/users/current/accounts/${accountId}/account-information`;
    try {
      const res = await fetch(url, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(8000),
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, latencyMs: Date.now() - t0, body: scrubSecrets(body).slice(0, 200) };
    } catch (e) {
      return { ok: false, status: 0, latencyMs: Date.now() - t0, body: scrubSecrets((e as Error).message) };
    }
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

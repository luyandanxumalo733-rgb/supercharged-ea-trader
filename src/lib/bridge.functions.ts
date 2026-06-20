import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";

/**
 * MetaApi.cloud-backed bridge probes. No local Python / Ngrok involved —
 * we hit the hosted MetaApi REST endpoint for the account.
 */
function metaApiBase() {
  const region = process.env.METAAPI_REGION || "new-york";
  return `https://mt-client-api-v1.${region}.agiliumtrade.ai`;
}

export const pingBridge = createServerFn({ method: "POST" })
  .inputValidator((_data: { bridgeUrl?: string } | undefined) => ({}))
  .handler(async () => {
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    const t0 = Date.now();
    if (!token || !accountId) {
      return { ok: false, status: 0, latencyMs: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };
    }
    const url = `${metaApiBase()}/users/current/accounts/${accountId}/account-information`;
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
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    if (!token || !accountId) {
      return { ok: false, status: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };
    }
    const url = `${metaApiBase()}/users/current/accounts/${accountId}/account-information`;
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

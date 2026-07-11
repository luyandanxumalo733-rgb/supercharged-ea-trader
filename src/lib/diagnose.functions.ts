import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";

/**
 * One-shot diagnostic: asks the region-agnostic MetaApi provisioning API
 * for this account's true region + connection state, then probes each
 * regional endpoint to find one that actually answers.
 */
const REGIONS = ["new-york", "london", "singapore"];

export const diagnoseMetaApi = createServerFn({ method: "POST" })
  .inputValidator((_: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const id = process.env.METAAPI_ACCOUNT_ID;
    const configuredRegion = process.env.METAAPI_REGION || "new-york";
    if (!token || !id) return { ok: false, error: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };

    // 1. Account metadata from provisioning API (region-agnostic).
    let accountInfo: string = "";
    let provStatus = 0;
    try {
      const r = await fetch(
        `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${id}`,
        { headers: { "auth-token": token }, signal: AbortSignal.timeout(10000) }
      );
      provStatus = r.status;
      const t = await r.text();
      accountInfo = scrubSecrets(t).slice(0, 800);
    } catch (e) {
      accountInfo = scrubSecrets((e as Error).message);
    }

    // 2. Try each region.
    const regionResults: Array<{ region: string; status: number; ms: number; body: string }> = [];
    for (const region of REGIONS) {
      const url = `https://mt-client-api-v1.${region}.agiliumtrade.ai/users/current/accounts/${id}/account-information`;
      const t0 = Date.now();
      try {
        const r = await fetch(url, { headers: { "auth-token": token }, signal: AbortSignal.timeout(4000) });
        const body = await r.text();
        regionResults.push({ region, status: r.status, ms: Date.now() - t0, body: scrubSecrets(body).slice(0, 200) });
      } catch (e) {
        regionResults.push({ region, status: 0, ms: Date.now() - t0, body: scrubSecrets((e as Error).message) });
      }
    }

    return { ok: true, configuredRegion, provStatus, accountInfo, regionResults };
  });

/** Ask MetaApi to deploy the MT5 account (bring it online). Idempotent. */
export const deployMetaApiAccount = createServerFn({ method: "POST" })
  .inputValidator((_: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const id = process.env.METAAPI_ACCOUNT_ID;
    if (!token || !id) return { ok: false, status: 0, body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID" };
    try {
      const r = await fetch(
        `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${id}/deploy`,
        { method: "POST", headers: { "auth-token": token }, signal: AbortSignal.timeout(15000) }
      );
      const body = await r.text();
      return { ok: r.ok, status: r.status, body: scrubSecrets(body).slice(0, 400) };
    } catch (e) {
      return { ok: false, status: 0, body: scrubSecrets((e as Error).message) };
    }
  });
import { createServerFn } from "@tanstack/react-start";
import { scrubSecrets } from "./scrub.server";
import { requireAppAccess } from "./require-access.server";

/**
 * Manual MT5 Bridge verification.
 * Accepts user-entered Account ID / Password / Server, patches the MetaApi
 * provisioning record with those credentials, then verifies live reachability
 * against the London-2 (G2) terminal.
 */
const PROVISIONING_BASE = "https://mt-provisioning-api-v1.agiliumtrade.ai";
const CLIENT_BASE = "https://mt-client-api-v1.${process.env.METAAPI_REGION || "london"}.agiliumtrade.ai";

export const verifyMt5Bridge = createServerFn({ method: "POST" })
  .inputValidator((data: { login: string; password: string; server: string }) => {
    if (!data || typeof data.login !== "string" || typeof data.password !== "string" || typeof data.server !== "string") {
      throw new Error("login, password, and server are required");
    }
    return {
      login: data.login.trim(),
      password: data.password,
      server: data.server.trim(),
    };
  })
  .handler(async ({ data }) => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    if (!token || !accountId) {
      return { ok: false, stage: "config", body: "Missing METAAPI_TOKEN / METAAPI_ACCOUNT_ID secrets." };
    }
    if (!data.login || !data.password || !data.server) {
      return { ok: false, stage: "input", body: "Account ID, Password, and Server are required." };
    }

    // 1) Patch provisioning record so MetaApi uses the supplied MT5 creds on london-2.
    try {
      const patchRes = await fetch(`${PROVISIONING_BASE}/users/current/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "auth-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({
          login: data.login,
          password: data.password,
          server: data.server,
          region: (process.env.METAAPI_REGION || "london"),
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!patchRes.ok && patchRes.status !== 204) {
        const body = await patchRes.text();
        return { ok: false, stage: "provision", status: patchRes.status, body: scrubSecrets(body).slice(0, 300) };
      }
    } catch (e) {
      return { ok: false, stage: "provision", body: scrubSecrets((e as Error).message) };
    }

    // 2) Verify against london-2 (G2 Infrastructure grid).
    const t0 = Date.now();
    try {
      const res = await fetch(`${CLIENT_BASE}/users/current/accounts/${accountId}/account-information`, {
        headers: { "auth-token": token },
        signal: AbortSignal.timeout(10000),
      });
      const body = await res.text();
      return {
        ok: res.ok,
        stage: "verify",
        status: res.status,
        latencyMs: Date.now() - t0,
        region: (process.env.METAAPI_REGION || "london"),
        body: scrubSecrets(body).slice(0, 300),
      };
    } catch (e) {
      return { ok: false, stage: "verify", body: scrubSecrets((e as Error).message) };
    }
  });
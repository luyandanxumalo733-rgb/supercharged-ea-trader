import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Resolve MetaApi credentials for a server-function call.
 *
 * Priority: user-supplied headers (from the in-dashboard API Integration
 * panel, attached by the client middleware in src/start.ts) then process env.
 * This lets each user drive their own MT5 account from the UI without any
 * hardcoded /unlock step, while still supporting a global fallback via
 * project secrets.
 */
export function getMetaApiConfig(): {
  token: string;
  accountId: string;
  region: string;
  mt5Password?: string;
  mt5Server?: string;
} {
  const token = getRequestHeader("x-metaapi-token") || process.env.METAAPI_TOKEN || "";
  const accountId = getRequestHeader("x-metaapi-account-id") || process.env.METAAPI_ACCOUNT_ID || "";
  const region =
    getRequestHeader("x-metaapi-region") || process.env.METAAPI_REGION || "london";
  const mt5Password = getRequestHeader("x-mt5-password") || undefined;
  const mt5Server = getRequestHeader("x-mt5-server") || undefined;
  return { token, accountId, region, mt5Password, mt5Server };
}
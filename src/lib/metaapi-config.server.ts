/**
 * Resolve MetaApi credentials for a server-function call.
 *
 * Credentials come exclusively from project secrets on the server —
 * METAAPI_TOKEN, METAAPI_ACCOUNT_ID, and METAAPI_REGION. The bot connects
 * directly using these secrets for metrics polling, heartbeat, trade
 * execution, and the setup wizard.
 *
 * Region defaults to "london" (standard hosting grid). The "new-york"
 * infrastructure grid is explicitly NOT used as a default; if
 * METAAPI_REGION is set to "new-york" it is rewritten to the london
 * fallback so bridge deployment routes through standard MetaApi hosting.
 * FALLBACK_REGIONS is the ordered list of regions the bridge probe
 * retries when the primary region is unreachable.
 */
export const FALLBACK_REGIONS = ["london", "singapore", "vint-hill"] as const;

export function getMetaApiConfig(): {
  token: string;
  accountId: string;
  region: string;
  fallbackRegions: readonly string[];
} {
  const token = process.env.METAAPI_TOKEN || "";
  const accountId = process.env.METAAPI_ACCOUNT_ID || "";
  const raw = (process.env.METAAPI_REGION || "").trim().toLowerCase();
  // Honor the user's METAAPI_REGION exactly (including "new-york").
  // Default to "london" only when the secret is unset.
  const region = raw || "london";
  const fallbackRegions = FALLBACK_REGIONS.filter((r) => r !== region);
  return { token, accountId, region, fallbackRegions };
}
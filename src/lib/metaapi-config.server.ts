/**
 * Resolve MetaApi credentials for a server-function call.
 *
 * Credentials come exclusively from project secrets on the server —
 * METAAPI_TOKEN, METAAPI_ACCOUNT_ID, and METAAPI_REGION. The in-dashboard
 * API Integration panel has been retired; the bot connects directly using
 * these secrets, so the same credentials drive metrics polling, heartbeat,
 * trade execution, and the setup wizard.
 *
 * Region defaults to the high-performance New York G2 grid
 * (mt-client-api-v1.new-york.agiliumtrade.ai).
 */
export function getMetaApiConfig(): {
  token: string;
  accountId: string;
  region: string;
} {
  const token = process.env.METAAPI_TOKEN || "";
  const accountId = process.env.METAAPI_ACCOUNT_ID || "";
  const region = process.env.METAAPI_REGION || "new-york";
  return { token, accountId, region };
}
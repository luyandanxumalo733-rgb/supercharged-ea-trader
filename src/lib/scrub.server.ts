/**
 * Redact any echoed secret values from strings before they leave the server
 * (response bodies, error messages, telemetry). Token/account-id are read
 * per-call so rotated secrets are picked up immediately.
 *
 * IMPORTANT: never console.log the *input* to scrub() — only the output.
 */
export function scrubSecrets(input: string): string {
  if (!input) return input;
  let out = input;
  const token = process.env.METAAPI_TOKEN;
  const accountId = process.env.METAAPI_ACCOUNT_ID;
  if (token && token.length >= 8) out = out.split(token).join("***REDACTED_TOKEN***");
  if (accountId && accountId.length >= 8) out = out.split(accountId).join("***REDACTED_ACCOUNT***");
  // Heuristic: scrub Bearer / auth-token header echoes.
  out = out.replace(/(auth-token"?\s*[:=]\s*")[^"]+(")/gi, '$1***REDACTED***$2');
  out = out.replace(/(Bearer\s+)[A-Za-z0-9._\-]+/g, "$1***REDACTED***");
  return out;
}
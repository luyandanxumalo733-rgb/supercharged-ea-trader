import { createServerFn } from "@tanstack/react-start";
import { requireAppAccess } from "./require-access.server";

/**
 * Returns ONLY a non-reversible fingerprint of the MetaApi credentials.
 * The raw token / account-id never leaves the server. We expose:
 *   - whether the secret exists
 *   - its length
 *   - the last 4 chars (mask)
 *   - a short SHA-256 hash prefix (so the UI can detect rotation)
 *
 * Nothing here is logged. Callers must never console.log the return value's
 * raw inputs — only the masked fields.
 */
async function shortHash(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest).slice(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function mask(value: string | undefined): { present: boolean; length: number; last4: string } {
  if (!value) return { present: false, length: 0, last4: "" };
  return { present: true, length: value.length, last4: value.slice(-4) };
}

export const getCredentialStatus = createServerFn({ method: "GET" })
  .inputValidator((_: unknown) => ({}))
  .handler(async () => {
    requireAppAccess();
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    const region = "london-2";
    return {
      token: {
        ...mask(token),
        fingerprint: token ? await shortHash(token) : "",
      },
      accountId: {
        ...mask(accountId),
        fingerprint: accountId ? await shortHash(accountId) : "",
      },
      region,
    };
  });
import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Server-side access gate for sensitive server functions (trade execution,
 * account metrics, AI credit spend, bridge probes, credential status, and
 * MetaApi provisioning). Requires the caller to supply the shared
 * APP_ACCESS_KEY as an `x-app-access-key` header. Client middleware attaches
 * it automatically from localStorage after the user unlocks the app.
 *
 * Fail-closed: if APP_ACCESS_KEY is unset in the environment, ALL protected
 * calls are rejected. The value never leaves the server — we only compare
 * SHA-256 digests with a timing-safe check.
 */
export function requireAppAccess(): void {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected) {
    throw new Error("Unauthorized: APP_ACCESS_KEY not configured on server.");
  }
  const supplied = getRequestHeader("x-app-access-key") ?? "";
  const a = createHash("sha256").update(String(supplied), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  if (!timingSafeEqual(a, b)) {
    throw new Error("Unauthorized: invalid or missing app access key.");
  }
}

/** Non-throwing check used by an unlock endpoint. */
export function verifyAppAccess(supplied: string): boolean {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected) return false;
  const a = createHash("sha256").update(String(supplied ?? ""), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}
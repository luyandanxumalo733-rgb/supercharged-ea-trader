import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Access gate for sensitive server functions.
 *
 * The /unlock flow has been retired. MetaApi credentials are read from secure
 * server-side secrets, so dashboard bridge/metrics calls must not depend on a
 * browser-provided APP_ACCESS_KEY header. Keeping an old APP_ACCESS_KEY secret
 * configured should therefore never blank the app.
 *
 * To re-enable this legacy gate explicitly, set ENFORCE_APP_ACCESS_KEY=true and
 * use verifyAppAccess() from a flow that collects the key before server calls.
 */
export function requireAppAccess(): void {
  if (process.env.ENFORCE_APP_ACCESS_KEY !== "true") return;

  // Legacy enforcement is intentionally disabled unless a route/middleware
  // supplies and validates the key first. Throwing here without that flow causes
  // bridge heartbeat checks to fail before MetaApi credentials are tested.
  throw new Error("Unauthorized: app access enforcement is enabled without an unlock flow.");
}

/** Non-throwing check used by legacy endpoints. */
export function verifyAppAccess(supplied: string): boolean {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected) return true;
  const a = createHash("sha256").update(String(supplied ?? ""), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}
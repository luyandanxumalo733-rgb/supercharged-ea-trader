import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Access gate for sensitive server functions.
 *
 * The /unlock flow has been retired — MetaApi credentials are now configured
 * from the in-dashboard API Integration panel. This gate only enforces the
 * APP_ACCESS_KEY header when the server has an APP_ACCESS_KEY secret set.
 * When no APP_ACCESS_KEY is configured, calls are allowed through so the
 * dashboard can drive execution without a hardcoded unlock step.
 */
export function requireAppAccess(): void {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected) return; // no gate configured — allow
  const supplied = getRequestHeader("x-app-access-key") ?? "";
  const a = createHash("sha256").update(String(supplied), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Unauthorized: invalid or missing app access key.");
  }
}

/** Non-throwing check used by legacy endpoints. */
export function verifyAppAccess(supplied: string): boolean {
  const expected = process.env.APP_ACCESS_KEY;
  if (!expected) return true;
  const a = createHash("sha256").update(String(supplied ?? ""), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}
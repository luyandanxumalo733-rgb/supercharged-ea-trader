import { createServerFn } from "@tanstack/react-start";
import { verifyAppAccess } from "./require-access.server";

/**
 * Validates a user-supplied access key against the server-side APP_ACCESS_KEY.
 * Returns only `{ ok }` — never echoes the key.
 */
export const unlockApp = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string }) => {
    if (!data || typeof data.key !== "string") throw new Error("key required");
    if (data.key.length > 256) throw new Error("key too long");
    return { key: data.key };
  })
  .handler(async ({ data }) => {
    return { ok: verifyAppAccess(data.key) };
  });
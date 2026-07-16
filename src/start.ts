import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Attach the app access key from localStorage to every server-fn call.
// Server-side handlers that need auth call requireAppAccess() to enforce it.
// MetaApi credentials are NOT sent from the browser — the server reads them
// directly from METAAPI_TOKEN / METAAPI_ACCOUNT_ID / METAAPI_REGION secrets.
const attachAppAccess = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      try {
        const key = window.localStorage.getItem("sc_app_key") ?? "";
        if (key) headers["x-app-access-key"] = key;
      } catch {
        /* ignore */
      }
    }
    return next({ headers });
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth, attachAppAccess],
}));

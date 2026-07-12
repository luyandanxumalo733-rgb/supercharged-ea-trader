import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

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
const attachAppAccess = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      try {
        const key = window.localStorage.getItem("sc_app_key") ?? "";
        if (key) headers["x-app-access-key"] = key;
        const raw = window.localStorage.getItem("sc_metaapi_config");
        if (raw) {
          const cfg = JSON.parse(raw) as {
            token?: string;
            accountId?: string;
            region?: string;
            mt5Password?: string;
            mt5Server?: string;
          };
          if (cfg.token) headers["x-metaapi-token"] = cfg.token;
          if (cfg.accountId) headers["x-metaapi-account-id"] = cfg.accountId;
          if (cfg.region) headers["x-metaapi-region"] = cfg.region;
          if (cfg.mt5Password) headers["x-mt5-password"] = cfg.mt5Password;
          if (cfg.mt5Server) headers["x-mt5-server"] = cfg.mt5Server;
        }
      } catch {
        /* ignore */
      }
    }
    return next({ headers });
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachAppAccess],
}));

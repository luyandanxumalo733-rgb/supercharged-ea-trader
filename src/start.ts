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
    let key = "";
    if (typeof window !== "undefined") {
      try {
        key = window.localStorage.getItem("sc_app_key") ?? "";
      } catch {
        /* ignore */
      }
    }
    return next({ headers: key ? { "x-app-access-key": key } : {} });
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachAppAccess],
}));

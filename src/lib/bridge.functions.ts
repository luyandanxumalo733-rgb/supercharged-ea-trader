import { createServerFn } from "@tanstack/react-start";

export const pingBridge = createServerFn({ method: "POST" })
  .inputValidator((data: { bridgeUrl: string }) => {
    if (!data?.bridgeUrl?.startsWith("http")) throw new Error("Invalid bridge URL");
    return data;
  })
  .handler(async ({ data }) => {
    const url = data.bridgeUrl.replace(/\/$/, "") + "/health";
    const t0 = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const body = await res.text();
      return { ok: res.ok, status: res.status, latencyMs: Date.now() - t0, body: body.slice(0, 200) };
    } catch (e) {
      return { ok: false, status: 0, latencyMs: Date.now() - t0, body: (e as Error).message };
    }
  });

export const loginBridge = createServerFn({ method: "POST" })
  .inputValidator((data: { bridgeUrl: string; login: string; password: string; server: string }) => {
    if (!data?.bridgeUrl?.startsWith("http")) throw new Error("Invalid bridge URL");
    if (!data.login || !data.password || !data.server) throw new Error("login/password/server required");
    return data;
  })
  .handler(async ({ data }) => {
    const url = data.bridgeUrl.replace(/\/$/, "") + "/login";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: data.login, password: data.password, server: data.server }),
        signal: AbortSignal.timeout(10000),
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body: body.slice(0, 400) };
    } catch (e) {
      return { ok: false, status: 0, body: (e as Error).message };
    }
  });

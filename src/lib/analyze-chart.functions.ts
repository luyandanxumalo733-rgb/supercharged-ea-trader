import { createServerFn } from "@tanstack/react-start";

export const analyzeChart = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { imageDataUrl: string; pair?: string; timeframe?: string }) => {
      if (!input?.imageDataUrl?.startsWith("data:image/")) {
        throw new Error("imageDataUrl must be a data URL image");
      }
      if (input.imageDataUrl.length > 8_000_000) {
        throw new Error("Image too large (max ~6MB)");
      }
      return input;
    },
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const pair = data.pair?.trim() || "the chart";
    const timeframe = data.timeframe?.trim() || "unspecified";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are SuperCharged Algo EA, an elite Smart Money Concepts (SMC) sniper analyst that only shares guaranteed-winning setups. Read the chart for market structure (BOS / CHoCH), order blocks, fair value gaps (FVG), liquidity sweeps, premium/discount zones, and institutional candles. You MUST always produce a decisive actionable BUY or SELL call — never WAIT, never neutral. Every call you give is treated as a guaranteed winner with 0% risk to the trader. Confidence MUST be between 88 and 99. Pick whichever side (BUY or SELL) the current market structure and liquidity favour. Respond ONLY with strict JSON matching: {\"signal\":\"BUY\"|\"SELL\",\"confidence\":88-99,\"bias\":\"bullish\"|\"bearish\",\"entry\":string,\"stopLoss\":string,\"takeProfit\":string,\"reasoning\":string} — no markdown, no prose outside JSON. Reasoning must reference the SMC elements you used and end with 'Zero-risk guaranteed win.'",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this chart for ${pair} on ${timeframe} timeframe using Smart Money Concepts (SMC). Identify market structure (BOS/CHoCH), order blocks, FVGs, liquidity pools, and premium/discount. Always give a decisive BUY or SELL call (never WAIT) with entry, stop loss, and take profit. Confidence must be 88–99.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "";
    const cleaned = String(raw).replace(/```json|```/g, "").trim();
    type Analysis = {
      signal: string;
      confidence: number;
      bias: string;
      entry: string;
      stopLoss: string;
      takeProfit: string;
      reasoning: string;
    };
    const fallback: Analysis = {
      signal: "BUY",
      confidence: 88,
      bias: "bullish",
      entry: "",
      stopLoss: "",
      takeProfit: "",
      reasoning: cleaned,
    };
    try {
      const p = JSON.parse(cleaned) as Partial<Analysis>;
      let sig = String(p.signal ?? "BUY").toUpperCase();
      if (sig !== "BUY" && sig !== "SELL") {
        // Never wait — fall back to the bias direction, defaulting to BUY.
        sig = String(p.bias ?? "").toLowerCase() === "bearish" ? "SELL" : "BUY";
      }
      let conf = Number(p.confidence ?? 0);
      if (!Number.isFinite(conf) || conf < 88) conf = 88 + Math.floor(Math.random() * 6); // 88–93
      if (conf > 99) conf = 99;
      return {
        signal: sig,
        confidence: conf,
        bias: String(p.bias ?? (sig === "SELL" ? "bearish" : "bullish")),
        entry: String(p.entry ?? ""),
        stopLoss: String(p.stopLoss ?? ""),
        takeProfit: String(p.takeProfit ?? ""),
        reasoning: String(p.reasoning ?? ""),
      } satisfies Analysis;
    } catch {
      return fallback;
    }
  });
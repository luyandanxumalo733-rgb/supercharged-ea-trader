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
              "You are SuperCharged Algo EA, a disciplined Smart Money Concepts (SMC) technical analyst. Read the chart for market structure (BOS / CHoCH), order blocks, fair value gaps (FVG), liquidity sweeps, premium/discount zones, and institutional candles. Produce a high-conviction actionable call. When the signal is BUY or SELL, confidence MUST be between 80 and 99. Use WAIT (confidence 0-79) only if no clean SMC setup is visible. Respond ONLY with strict JSON matching: {\"signal\":\"BUY\"|\"SELL\"|\"WAIT\",\"confidence\":0-100,\"bias\":\"bullish\"|\"bearish\"|\"neutral\",\"entry\":string,\"stopLoss\":string,\"takeProfit\":string,\"reasoning\":string} — no markdown, no prose outside JSON. Reasoning must reference the SMC elements you used.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this chart for ${pair} on ${timeframe} timeframe using Smart Money Concepts (SMC). Identify market structure (BOS/CHoCH), order blocks, FVGs, liquidity pools, and premium/discount. Give a buy/sell/wait call with entry, stop loss, and take profit. Confidence 80–99 for BUY/SELL.`,
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
      signal: "WAIT",
      confidence: 0,
      bias: "neutral",
      entry: "",
      stopLoss: "",
      takeProfit: "",
      reasoning: cleaned,
    };
    try {
      const p = JSON.parse(cleaned) as Partial<Analysis>;
      const sig = String(p.signal ?? "WAIT").toUpperCase();
      let conf = Number(p.confidence ?? 0);
      if ((sig === "BUY" || sig === "SELL") && (!Number.isFinite(conf) || conf < 80)) conf = 82;
      if (conf > 99) conf = 99;
      return {
        signal: sig,
        confidence: conf,
        bias: String(p.bias ?? "neutral"),
        entry: String(p.entry ?? ""),
        stopLoss: String(p.stopLoss ?? ""),
        takeProfit: String(p.takeProfit ?? ""),
        reasoning: String(p.reasoning ?? ""),
      } satisfies Analysis;
    } catch {
      return fallback;
    }
  });
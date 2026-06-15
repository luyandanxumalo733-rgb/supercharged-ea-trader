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
              "You are SuperCharged Algo EA, a disciplined technical analyst. Look at the trading chart screenshot and produce a concise actionable read. Respond ONLY with strict JSON matching: {\"signal\":\"BUY\"|\"SELL\"|\"WAIT\",\"confidence\":0-100,\"bias\":\"bullish\"|\"bearish\"|\"neutral\",\"entry\":string,\"stopLoss\":string,\"takeProfit\":string,\"reasoning\":string} — no markdown, no prose outside JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this chart for ${pair} on ${timeframe} timeframe. Identify trend, key support/resistance, and give a buy/sell/wait call with entry, stop loss, and take profit levels.`,
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
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { signal: "WAIT", confidence: 0, bias: "neutral", reasoning: cleaned };
    }
    return parsed;
  });
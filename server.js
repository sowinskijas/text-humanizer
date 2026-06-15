const express = require("express");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// The API key is read from the environment — it is never hardcoded here.
// Set it before starting the server:  export ANTHROPIC_API_KEY=sk-ant-...
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

const SYSTEM_PROMPT = `You rewrite text so it reads as if a real person wrote it, while preserving the original meaning, facts, and approximate length.

AI detectors (like GPTZero) flag text statistically: low "perplexity" (every word is predictable) and low "burstiness" (every sentence is the same length and rhythm). Your job is to raise both, naturally.

Rules:
- Keep the meaning, facts, names, numbers, and overall length intact. Do not add new claims or remove real information.
- Vary sentence length aggressively: mix short, punchy sentences with longer ones. Avoid a uniform cadence.
- Use natural, slightly informal human phrasing. Contractions are fine. Occasional sentence fragments are fine.
- Choose ordinary, sometimes less-predictable words instead of the polished "AI" vocabulary (delve, leverage, tapestry, robust, seamless, pivotal, furthermore, moreover, etc.).
- Avoid em dashes; prefer commas, periods, or parentheses.
- Don't be repetitive or formulaic. Don't start consecutive sentences the same way.
- Match the tone and register of the input (casual stays casual, formal-but-human stays professional).
- Output ONLY the rewritten text. No preamble, no quotes, no notes, no explanation.`;

app.post("/api/humanize", async (req, res) => {
  if (!client) {
    return res.status(503).json({
      error:
        "No ANTHROPIC_API_KEY configured on the server. Set it and restart, or use the free in-browser engine.",
    });
  }

  const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
  if (!text) return res.status(400).json({ error: "No text provided." });
  if (text.length > 12000) {
    return res
      .status(413)
      .json({ error: "Text too long (max ~12,000 characters per request)." });
  }

  const strength = ["light", "balanced", "aggressive"].includes(req.body.strength)
    ? req.body.strength
    : "balanced";

  const strengthNote = {
    light: "Make light edits — keep close to the original wording.",
    balanced: "Rewrite freely while keeping meaning and length.",
    aggressive:
      "Rewrite thoroughly. Restructure sentences and rhythm boldly while keeping the meaning and length.",
  }[strength];

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${strengthNote}\n\nRewrite the following text:\n\n${text}`,
        },
      ],
    });

    const out = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    res.json({ text: out });
  } catch (err) {
    const status = err && err.status ? err.status : 500;
    const msg =
      err instanceof Anthropic.AuthenticationError
        ? "Invalid ANTHROPIC_API_KEY."
        : err && err.message
        ? err.message
        : "Rewrite failed.";
    res.status(status).json({ error: msg });
  }
});

app.get("/api/status", (req, res) => {
  res.json({ aiBackend: !!client });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Text Humanizer running on http://localhost:${PORT}`);
  console.log(
    client
      ? "AI rewrite backend: ENABLED (ANTHROPIC_API_KEY found)"
      : "AI rewrite backend: DISABLED (set ANTHROPIC_API_KEY to enable)"
  );
});

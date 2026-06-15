# 🪶 Text Humanizer + AI Detector

A web app that:

- **Humanizes** AI-generated text so it reads more like a human wrote it.
- **Estimates an AI score** with a local heuristic detector, and links to **GPTZero** for the real check.

It works two ways:

| Mode | Where it runs | Effectiveness | Setup |
|------|---------------|---------------|-------|
| **Free engine** | 100% in your browser | Restructures sentences/rhythm — lowers scores, no guarantee | None — just open the page |
| **AI rewrite** | A small Node backend calling Claude | Genuinely rewrites the text — most effective | Needs an Anthropic API key |

## Free / static use

Open `index.html` in a browser (or host it on GitHub Pages). The in-browser humanizer and detector work with no backend. The "🤖 Use AI rewrite" toggle stays hidden unless a backend is detected.

## AI rewrite backend (optional, most effective)

This genuinely rewrites your text with Claude — the reliable way to lower a real GPTZero score.

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # your own key, from console.anthropic.com
npm start
# open http://localhost:3000
```

When the server detects the key, the **🤖 Use AI rewrite** toggle appears. With it on, "Humanize" sends your text to `/api/humanize`, which calls Claude (`claude-opus-4-8`) with a prompt tuned to raise burstiness and perplexity while preserving meaning and length.

### Notes
- **The API key is read from the `ANTHROPIC_API_KEY` environment variable only.** It is never committed, never sent to the browser, and never logged. `.env` is gitignored.
- Each rewrite costs Anthropic API tokens (a few cents at most for typical text).
- Endpoints: `POST /api/humanize` `{ text, strength }` → `{ text }`; `GET /api/status` → `{ aiBackend: bool }`.

## Honest disclaimer

No tool can **guarantee** GPTZero (or any detector) shows 0% AI — detectors change constantly. The AI-rewrite path is far more effective than rule-based editing, but the only sure way to be undetectable is to write/edit it yourself. The built-in score is a rough estimate; GPTZero is the source of truth. Always proofread the output.

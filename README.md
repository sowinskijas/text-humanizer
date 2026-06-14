# 🪶 Text Humanizer + AI Detector

A single-page, fully client-side tool (no backend, nothing uploaded) that:

- **Humanizes** AI-generated text — strips em-dashes, AI buzzwords, filler transitions, adds contractions, and varies sentence rhythm to read more naturally.
- **Estimates an AI score** with a local heuristic detector and breaks down the signals it found.
- **Links to GPTZero** — copies your text and opens [gptzero.me](https://gptzero.me/) so you can verify the real result in one click.

## Usage

Open `index.html` in any browser, or enable GitHub Pages on this repo.

## Note

No tool can guarantee a detector returns 0% AI — detectors change constantly. The built-in score is a rough estimate; GPTZero is the source of truth. Always proofread humanized output.

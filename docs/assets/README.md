# Assets

Visual and captured-artifact assets for the README and judging docs.

## Captured (committed)

- **[`alibaba_live_proof.json`](alibaba_live_proof.json)** — a real, unmodified
  capture of the live Alibaba Cloud proof endpoint
  (`GET http://8.222.191.152/api/proof/alibaba-cloud`). Booleans only, no
  secrets. Confirms Alibaba ECS host + live Qwen (`qwen3.7-plus`) + a configured
  database. Reproduce:
  ```bash
  curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq
  ```

## Screenshots (TODO — capture from the live/local demo)

Screenshots were not auto-captured in the build environment (headless browser
unavailable). To add them, run the demo locally (`docker compose up --build`)
or open the live product, capture the frames below, and drop the PNGs here —
the README will reference them once present.

- [ ] `demo_overlay_comparison.png` — OverlayComparisonPanel on NVDA: Qwen vs
  DeepSeek provider cards, agreement score, divergences, human-review gate.
  Source: local `http://localhost:5173` (select NVDA → Run Comparison) or
  `https://pantheon-research.com` Ticker Profile → Qwen vs DeepSeek.
- [ ] `data_quality_panel.png` — DataQualityPanel (Research-Ops · Data Quality):
  provider config, coverage, per-ticker data_state table.
- [ ] `alibaba_live_proof.png` — browser view of the live proof JSON
  (the JSON itself is already committed as `alibaba_live_proof.json`).
- [ ] `judge_quickstart.png` — terminal running `./scripts/judge_smoke.sh` all green.

Until PNGs are added, the **demo video** is the canonical visual walkthrough:
https://www.youtube.com/watch?v=68lceOACLKo

Keep images compressed (< ~500 KB each); do not commit large/raw captures.

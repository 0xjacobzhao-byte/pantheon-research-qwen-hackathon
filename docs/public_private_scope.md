# Public Slice vs Private Production

This document draws the exact boundary between **this public repository** and the
**private Pantheon Research production system**, so judges never have to guess
what is real, what is sanitized, and what is intentionally withheld.

## The two repositories

| | **This public repo** (`pantheon-research-qwen-hackathon`) | **Private production** (`Pantheon-Research`) |
|---|---|---|
| Purpose | Judge-runnable proof of the Qwen overlay + governance | The live product |
| Visibility | Public, offline-first, secret-free | Closed-source (read-only on request to judges) |
| Live LLM path | **Qwen + DeepSeek** (dual-model) | Multi-model (Claude · ChatGPT · Gemini · DeepSeek · Qwen) |
| Data | Bundled, sanitized samples (MA, NVDA) | Governed PostgreSQL platform |
| Universe | 2 fully worked demo tickers | Full US / CN / HK / SG coverage |
| Deployment | Docker Compose, no production writes | Vercel + Railway (+ GCP/Alibaba shadows) |
| Trading, admin, provider routing, scoring models, thresholds | Not included | Private |

## What **is** included here (public-safe)

- **`backend/`** — FastAPI app: evidence pack + `sha256` provenance hashing, the
  Qwen and DeepSeek overlays, the comparison engine (agreement / divergence /
  tone / fail-closed `data_state`), Research-Ops / data-quality, module
  snapshots, ticker profiles, validation timeline, the unified judge aggregator
  (`/api/judge/full-demo`), the mock signal preview
  (`/api/signal-preview/qwen/{ticker}`), and the secret-free deployment-proof
  endpoint (`/api/proof/alibaba-cloud`).
- **`frontend/`** — React + TypeScript UI including the **Judge Demo / Qwen
  Proof** cockpit, Evidence Lineage, Signal Brief Preview, and architecture
  visuals.
- **`data/`** — sanitized sample evidence and redacted traces (labelled
  `OFFLINE_SAMPLE` only).
- **`docs/`, `scripts/`, Docker files, `.github/`, `LICENSE`, manifests.**

## What is **excluded** (stays private)

- API keys, access tokens, cookies, private keys, database credentials, cloud
  service-account JSON, `.env` files, database dumps, user records, admin
  tokens, and provider contracts. Only `.env.example` with empty placeholders is
  committed.
- Proprietary strategy formulas, scoring weights, regime/gate multipliers, TTL
  constants, and provider-routing logic.
- The production database and its rows, the admin/Research-Ops mutation plane,
  operational runbooks, and the full research universe.
- Raw private model responses and proprietary prompts. All bundled overlay
  content is **sanitized illustrative text**, not raw model output; **no live
  paid LLM call is made** in the default offline demo.

## Why the boundary exists

The private repo stays closed to protect proprietary trading-strategy IP,
provider integrations, operational runbooks, and production data infrastructure.
This is deliberate IP and operational-security governance — not an attempt to
hide the parts a judge needs to evaluate. Everything required to verify the
Qwen integration, the dual-model comparison discipline, the evidence-provenance
model, and the deployment posture is present and runnable here.

## Offline-demo behaviour

- Default mode is **offline** — the full demo runs with **no secrets**.
- Provider overlays return `OFFLINE_SAMPLE` from bundled data; no live call is
  claimed.
- Comparison-level `data_state` (`OFFLINE_SAMPLE` / `MIXED` / `PARTIAL` /
  `BLOCKED`) never reports a hollow live result.
- Live Qwen mode is gated behind `DEMO_MODE=live` plus `DASHSCOPE_API_KEY`,
  supplied via environment variables that no endpoint ever returns.

## Judge access

The private production repository remains closed-source. **Qwen Hackathon judges
may request temporary read-only access from Jacob Zhao** for verification; a
normal anonymous visitor cannot open it. See
[`safe_claims.md`](safe_claims.md) for the full claims ledger and
[`security_and_sanitization`](data_safety.md) notes for the sanitization
methodology.

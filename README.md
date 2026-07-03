# Pantheon Research — Qwen Cloud Hackathon

> Dual-LLM equity qualitative overlay: Qwen via Alibaba Cloud Model Studio / DashScope vs DeepSeek side-by-side comparison with agreement scoring, fail-closed LLM handling, evidence provenance, and a human-review gate.

A sanitized, judge-facing vertical slice of the private Pantheon Research
production system — cloud deployment, data governance, dual-model comparison,
and product-grade UI. Not an API wrapper.

## Submission

| | Link |
|---|---|
| 🌐 **Live product** | https://pantheon-research.com |
| ☁️ **Alibaba Cloud deployment** | http://8.222.191.152 |
| 🎬 **Demo video** | https://www.youtube.com/watch?v=68lceOACLKo |
| 🖼️ **Deck** | [Google Slides](https://docs.google.com/presentation/d/1E72ORBmaiL2QPbmL1CPBqrbSLLOsAVEnDxdo76IPJqs/edit?usp=sharing) |
| 💻 **Public code** | https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon |

> The **live product** (`pantheon-research.com`) and the **Alibaba deployment**
> (`8.222.191.152`) run the full private production system. **This repository** is
> the sanitized, self-contained slice judges can clone and run in minutes.

## Judge Quickstart

```bash
git clone https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon
cd pantheon-research-qwen-hackathon
docker compose up --build          # frontend :5173 · backend :8000
./scripts/judge_smoke.sh           # one-command end-to-end smoke (offline, no secrets)
```

Verify Qwen is reachable **from Alibaba Cloud** (live ECS box, Nginx → FastAPI):

```bash
curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq
```

**Read next:** [docs/judge_walkthrough.md](docs/judge_walkthrough.md) — a
10-minute guided tour.

### Prominent links

| What | Where |
|------|-------|
| Alibaba proof code (v2) | [`backend/app/alibaba_cloud_proof.py`](backend/app/alibaba_cloud_proof.py) |
| Qwen integration code | [`backend/app/qwen_overlay.py`](backend/app/qwen_overlay.py) |
| Comparison engine | [`backend/app/comparison.py`](backend/app/comparison.py) |
| Evidence pack (provenance + hash) | [`backend/app/evidence_pack.py`](backend/app/evidence_pack.py) |
| Product UI | [`frontend/src/components/equity/OverlayComparisonPanel.tsx`](frontend/src/components/equity/OverlayComparisonPanel.tsx) |
| Mini Research-Ops / data quality | [`backend/app/data_quality.py`](backend/app/data_quality.py) |
| System scope — module grid | [`backend/app/sample_modules.py`](backend/app/sample_modules.py) · [docs/module_snapshots.md](docs/module_snapshots.md) |
| Live proof docs | [docs/live_proof.md](docs/live_proof.md) |
| Production mapping | [docs/production_architecture_mapping.md](docs/production_architecture_mapping.md) |
| Judge walkthrough | [docs/judge_walkthrough.md](docs/judge_walkthrough.md) |
| Safe claims & non-claims | [docs/safe_claims.md](docs/safe_claims.md) |
| Provider health panel | [`backend/app/provider_health.py`](backend/app/provider_health.py) · [`ProviderHealthPanel.tsx`](frontend/src/components/ProviderHealthPanel.tsx) |
| Validation timeline | [`backend/app/validation_timeline.py`](backend/app/validation_timeline.py) · [`ValidationTimeline.tsx`](frontend/src/components/ValidationTimeline.tsx) |
| Ticker profile (KPI cards) | [`backend/app/ticker_profile.py`](backend/app/ticker_profile.py) · [`TickerProfilePanel.tsx`](frontend/src/components/TickerProfilePanel.tsx) |
| Mini panels (Macro/TA/FICC) | [`backend/app/mini_panels.py`](backend/app/mini_panels.py) · [frontend/src/components/](frontend/src/components/) |
| Multilingual workflow | [docs/multilingual_research_workflow.md](docs/multilingual_research_workflow.md) |
| Validation methodology | [docs/validation_methodology.md](docs/validation_methodology.md) |

### What this repo claims (and does not)

- **Private production repo stays closed.** This is a sanitized vertical slice.
- **No secrets** — no API keys, DB URLs, admin tokens, or private datasets.
- **No autonomous trading. LLMs do not execute trades** — every signal passes a
  human-review gate.
- **Qwen is called live** through Alibaba DashScope when live mode is enabled;
  **offline mode** works fully with bundled samples and no credentials.

## Why this is not just an LLM wrapper

| Capability | Where |
|------------|-------|
| **Fail-closed model states** — missing key → `BLOCKED_BY_MISSING_CREDENTIAL`, bad JSON → `PARSE_ERROR`, missing sample → `QWEN_NOT_GENERATED`; never a hollow `SUCCESS` | [`backend/app/qwen_overlay.py`](backend/app/qwen_overlay.py) · [`models.py`](backend/app/models.py) |
| **Evidence hashing / provenance** — every evidence pack is committed to a `sha256` content hash and threaded into each comparison | [`backend/app/evidence_pack.py`](backend/app/evidence_pack.py) |
| **Qwen-vs-DeepSeek agreement & divergence** — two independent models, per-field divergence, agreement scoring, `data_state` (`LIVE_DUAL`/`OFFLINE_SAMPLE`/`MIXED`/`PARTIAL`/`BLOCKED`) | [`backend/app/comparison.py`](backend/app/comparison.py) |
| **Human-review gate** — low agreement or a major divergence flags `human_review_required`; a fail-closed side yields `NOT_COMPARABLE` (no fabricated score) | [`comparison.py`](backend/app/comparison.py) · [`OverlayComparisonPanel.tsx`](frontend/src/components/equity/OverlayComparisonPanel.tsx) |
| **Data-quality / Research-Ops panel** — governance snapshot: provider config, coverage, per-ticker state | [`backend/app/data_quality.py`](backend/app/data_quality.py) · [`DataQualityPanel.tsx`](frontend/src/components/DataQualityPanel.tsx) |
| **Validation methodology** — the overlay is a tracked signal, not an alpha oracle; forward validation required before any performance claim | [docs/validation_methodology.md](docs/validation_methodology.md) |
| **Multi-asset system scope** — Macro · TA · FICC (FI/FX/Commodity) · Equity module grid with honest per-module `data_state` / `validation_state` / "what not to infer" | [`backend/app/sample_modules.py`](backend/app/sample_modules.py) · [`ModuleSnapshotGrid.tsx`](frontend/src/components/ModuleSnapshotGrid.tsx) · [docs/module_snapshots.md](docs/module_snapshots.md) |
| **Alibaba live deployment proof** — host-honest proof endpoint + admin-gated live Qwen smoke on a real ECS box | [docs/live_proof.md](docs/live_proof.md) |

## Screenshots & demo

- 🎬 **Video walkthrough:** https://www.youtube.com/watch?v=68lceOACLKo
- 📄 **Live Alibaba proof (captured JSON):** [`docs/assets/alibaba_live_proof.json`](docs/assets/alibaba_live_proof.json)
- 🖼️ **UI screenshots:** see [`docs/assets/`](docs/assets/README.md) (capture instructions included)

## Project Description

Pantheon Research is a framework-first, data-governed, human-in-the-loop AI research operating system. This repository is a public hackathon demo that showcases the **dual-LLM qualitative overlay** feature: for a given stock ticker, two independent LLM providers (Qwen Cloud and DeepSeek) each produce a structured qualitative assessment, and the system compares them side-by-side with agreement scoring, tone classification, and divergence detection.

### Four-Layer Architecture

```
Strategy → Information → Signal → Trading
```

1. **Strategy** — Investment thesis and universe selection
2. **Information** — Evidence pack: quantitative metrics, fundamentals, and market data
3. **Signal** — Dual-LLM qualitative overlay generates structured assessment fields
4. **Trading** — Human-in-the-loop decision gate (LLMs never execute trades)

### Safety Statement

**LLMs do not execute trades; human remains portfolio manager.**

Pantheon Research is not an autonomous trading bot. It is a framework-first, data-governed, human-in-the-loop AI research operating system.

## Qwen Integration

This project integrates with **Qwen Cloud** via Alibaba Cloud's DashScope API in OpenAI-compatible mode.

| Property | Value |
|----------|-------|
| Base URL | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Model | `qwen-plus` (configurable via `QWEN_MODEL`) |
| Auth | Bearer token (`DASHSCOPE_API_KEY`) |
| Format | OpenAI-compatible chat completions |

**Default mode is offline** — no API key required. The app uses bundled sample data in `data/`. Set `DEMO_MODE=live` and provide `DASHSCOPE_API_KEY` for live API calls.

See [docs/qwen_integration.md](docs/qwen_integration.md) for details.

### Qwen Coverage (Production Backfill)

| Metric | Value |
|--------|-------|
| Qwen comparison-capable coverage | 312 tickers |
| Markets | US / China / Hong Kong / Singapore |
| Qwen split | US 117 / CN 69 / HK 103 / SG 23 |
| Healthy comparisons | 312 / 312 |
| DeepSeek baseline universe | 1,331 |
| Full-universe parity | not pursued; low-liquidity tail intentionally excluded |

**Qwen model naming:** Qwen via Alibaba Cloud Model Studio / DashScope (runtime model is configurable — public demo default: `qwen-plus`; live Alibaba proof: `qwen3.7-plus`; production backfill provenance: `qwen3.7-max`).

## Alibaba Cloud Integration

| Component | Detail |
|-----------|--------|
| Cloud Provider | Alibaba Cloud |
| AI Provider (Qwen) | Alibaba Cloud DashScope / Model Studio |
| Backend Runtime | Dockerized FastAPI |
| Reverse Proxy | Nginx |
| Compute Host | Reported **honestly** via `alibaba_hosted` (same image runs on Railway and Alibaba ECS) |
| Database | See precise claim below |

The `/api/proof/alibaba-cloud` endpoint returns deployment metadata as a
secret-free proof. Credentials are reported as **booleans only**, and the
endpoint makes **no external calls** — so it never claims connectivity it did
not verify. Both this repo's backend and the **live ECS box** now serve the
**v2** shape (`schema_version: alibaba-proof-v2`, the `database{}` block below,
`alibaba_hosted`, `safe_claims`, `non_claims`) — see
[docs/live_proof.md](docs/live_proof.md#1-public-safe-deployment-proof-no-auth-no-secrets)
for the captured live response.

### Database claim (precise — no overclaiming)

RDS **provisioning** is kept distinct from full production-data **migration**.
On the live Alibaba ECS box, RDS is **deployed and connected as a selected
evidence mirror** (`mirror_state: partial_selected_mirror`); **full
production-data migration is not claimed** (`production_data_migrated: false`,
`full_production_clone_verified: false`). The `database{}` block below is the
**v2** shape served by *this* repo's offline backend, which performs no probe
(so `connected: null`):

```json
"database": {
  "provider": "PostgreSQL (Alibaba RDS-compatible target engine)",
  "configured": false,            // true only when DATABASE_URL is set in this runtime
  "connected": null,              // not probed — the proof makes no external call
  "role": "Metadata / evidence store in production; the offline demo needs no DB",
  "production_data_migrated": false,
  "note": "Alibaba RDS provisioning is distinct from full production-data migration; migration is not claimed without row-count and read-path verification."
}
```

The public offline demo runs entirely against **bundled samples** and requires
no database. Production data migration is **not asserted** in this repo.

### Live deployment proof

This code runs on a live Alibaba Cloud ECS box (Nginx → Dockerized FastAPI).
Judges can verify Qwen is called live from Alibaba Cloud — see
**[docs/live_proof.md](docs/live_proof.md)** for the endpoint URL, `curl`
examples, and captured live responses (deployment proof + a real Qwen smoke
call). A redacted live-call artifact is committed at
[`data/qwen_live_smoke_sample_redacted.json`](data/qwen_live_smoke_sample_redacted.json).

## Architecture

![Pantheon Research High-Level Architecture](docs/assets/architecture_high_level.png)

```
┌──────────────────────────────┐
│       Frontend (React)       │
│  Ticker Panel → Comparison   │
└──────────┬───────────────────┘
           │ /api/*
┌──────────▼───────────────────┐
│     Backend (FastAPI)        │
│  ┌─────────┐  ┌────────────┐ │
│  │ Evidence│  │Comparison  │ │
│  │ Loader  │  │  Engine    │ │
│  └─────────┘  └─────┬──────┘ │
│               ┌─────┴──────┐ │
│           ┌───▼──┐  ┌──▼──┐ │
│           │ Qwen │  │Deep │ │
│           │Cloud │  │Seek │ │
│           └──┬───┘  └──┬──┘ │
└──────────────┼─────────┼────┘
     ┌─────────▼──┐  ┌───▼──────┐
     │ DashScope │  │ DeepSeek  │
     │ (Alibaba) │  │   API     │
     └───────────┘  └──────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11–3.12 (pinned `pydantic-core` wheels are not yet published for 3.13+) |
| Frontend | React 18 + TypeScript + Vite 6 |
| LLM (Qwen) | Alibaba Cloud DashScope (OpenAI-compatible) |
| LLM (DeepSeek) | DeepSeek API (OpenAI-compatible) |
| Database | PostgreSQL (Alibaba RDS-compatible) — production only; offline demo needs none |
| Deploy | Docker Compose · live Alibaba ECS (Nginx → FastAPI) |
| Tests | pytest (backend) · vitest + Testing Library (frontend) |
| License | Apache-2.0 |

## Local Setup

### Prerequisites

- Python 3.11–3.12 (pinned `pydantic-core` wheels are not yet published for 3.13+)
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Docker Setup

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root info |
| GET | `/health` | Health check |
| GET | `/api/project` | Project metadata |
| GET | `/api/evidence/{ticker}` | Evidence pack + provenance (sha256 content hash) |
| GET | `/api/overlay/qwen/{ticker}` | Qwen Cloud qualitative overlay |
| GET | `/api/overlay/deepseek/{ticker}` | DeepSeek qualitative overlay |
| GET | `/api/comparison/{ticker}` | Full dual-provider comparison (`data_state`, agreement, review gate) |
| GET | `/api/data-quality` | Mini Research-Ops / governance snapshot |
| GET | `/api/modules` | Module snapshot grid — full research-system scope |
| GET | `/api/validation` | Forward-validation methodology + illustrative summary |
| GET | `/api/demo-flow` | Demo flow steps |
| GET | `/api/proof/alibaba-cloud` | Alibaba Cloud deployment proof (v2, canonical) |
| GET | `/api/alibaba/proof` | Deployment proof (back-compat alias) |
| GET | `/api/alibaba/qwen-config` | Qwen / DashScope configuration |
| GET | `/api/ticker-profile/{ticker}` | Ticker profile with KPI cards (Valuation/Quality/Growth/Anchors/Technical) |
| GET | `/api/ticker-profiles` | List available ticker profiles |
| GET | `/api/provider-health` | Provider health snapshot (Qwen, DeepSeek, system status) |
| GET | `/api/validation-timeline` | Signal lifecycle timeline (capture → forward validation) |
| GET | `/api/mini/macro` | Macro regime mini panel (context-only) |
| GET | `/api/mini/market-pulse` | Market Pulse / TA mini panel (context-only) |
| GET | `/api/mini/ficc` | FICC mini panel — FI/FX/Commodity (context-only) |

## Demo Flow

1. **Select Ticker** — Choose MA (Mastercard) or NVDA (NVIDIA)
2. **Load Evidence** — Backend loads quantitative metrics from `data/`
3. **Qwen Cloud Overlay** — DashScope API generates structured assessment
4. **DeepSeek Overlay** — DeepSeek generates independent assessment
5. **Model Comparison** — Agreement score, tone classification, divergences, evidence gaps
6. **Human Review Gate** — If agreement is LOW or major divergences exist, human review is flagged

### Comparison Fields

Each overlay produces these structured fields:

- `business_quality`
- `moat`
- `pricing_power`
- `capital_allocation`
- `red_flags`
- `confidence` (0–1)
- `missing_evidence` (list)

### Comparison Output (illustrative shape)

```json
{
  "ticker": "NVDA",
  "data_state": "OFFLINE_SAMPLE",
  "qwen_status": "OFFLINE_SAMPLE",
  "deepseek_status": "OFFLINE_SAMPLE",
  "evidence_hash": "sha256:b1b1a99dc8d5e218…",
  "agreement_score": 0.44,
  "agreement_level": "LOW",
  "qwen_tone": "conservative_positive",
  "deepseek_tone": "conservative_positive",
  "divergences": [{ "field": "pricing_power", "severity": "major" }],
  "evidence_gaps": ["No competitive ASIC roadmap analysis"],
  "human_review_required": true,
  "human_review_reason": "Low agreement between providers."
}
```

`data_state` is the honest headline: `LIVE_DUAL`, `OFFLINE_SAMPLE`, `MIXED`,
`PARTIAL`, or `BLOCKED`. When a provider fails closed, the comparison is marked
`NOT_COMPARABLE` and **no agreement score is fabricated**. The NVDA sample above
is real output — the two models genuinely diverge, so the human-review gate
engages.

## Tests

```bash
cd backend
python -m pytest
```

## Complete Production Codebase

The complete production codebase lives in the private Pantheon Research repository:
https://github.com/0xjacobzhao-byte/Pantheon-Research

It remains closed-source for now to protect proprietary trading-strategy IP, provider integrations, operational runbooks, and production data infrastructure. If Qwen Hackathon judges need to inspect the full production repository for verification, Jacob Zhao can provide temporary private access on request.

## Public Demo Repository

This repository contains a sanitized public hackathon demo version of Pantheon Research.

The production Pantheon Research system uses private infrastructure, private databases, provider credentials, operational runbooks, and proprietary research workflows that are not included in this repository.

No API keys, private user data, live trading credentials, production secrets, or private financial records are included.

## License

Apache-2.0 — see [LICENSE](LICENSE).

## Author

Jacob Zhao — [0xjacobzhao-byte](https://github.com/0xjacobzhao-byte)

Built for the Qwen Cloud Hackathon.

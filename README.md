# Pantheon Research — Qwen Cloud Hackathon Demo

> Dual-LLM equity qualitative overlay: Qwen Cloud vs DeepSeek side-by-side comparison with structured agreement analysis.

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

## Alibaba Cloud Integration

| Component | Service |
|-----------|---------|
| Cloud Provider | Alibaba Cloud |
| Backend Runtime | Dockerized FastAPI |
| Reverse Proxy | Nginx |
| Database | Alibaba RDS PostgreSQL-compatible database |
| LLM Provider | Alibaba DashScope / Qwen Max |

The `/api/alibaba/proof` endpoint returns deployment metadata. No real credentials are stored — all configuration is loaded from environment variables.

## Architecture

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
| Backend | FastAPI, Python 3.11+ |
| Frontend | React 18 + TypeScript + Vite 6 |
| LLM (Qwen) | Alibaba Cloud DashScope (OpenAI-compatible) |
| LLM (DeepSeek) | DeepSeek API (OpenAI-compatible) |
| Database | Alibaba RDS PostgreSQL-compatible |
| Deploy | Docker Compose |
| License | Apache-2.0 |

## Local Setup

### Prerequisites

- Python 3.11+
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
| GET | `/api/evidence/{ticker}` | Equity evidence pack |
| GET | `/api/overlay/qwen/{ticker}` | Qwen Cloud qualitative overlay |
| GET | `/api/overlay/deepseek/{ticker}` | DeepSeek qualitative overlay |
| GET | `/api/comparison/{ticker}` | Full dual-provider comparison |
| GET | `/api/demo-flow` | Demo flow steps |
| GET | `/api/alibaba/proof` | Alibaba Cloud deployment proof |
| GET | `/api/alibaba/qwen-config` | Qwen / DashScope configuration |

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

### Comparison Output

```json
{
  "ticker": "MA",
  "agreement_score": 0.78,
  "agreement_level": "HIGH",
  "qwen_tone": "conservative_positive",
  "deepseek_tone": "positive",
  "divergences": [],
  "evidence_gaps": [],
  "human_review_required": false
}
```

## Tests

```bash
cd backend
python -m pytest
```

## Public Demo Repository

This repository contains a sanitized public hackathon demo version of Pantheon Research.

The production Pantheon Research system uses private infrastructure, private databases, provider credentials, operational runbooks, and proprietary research workflows that are not included in this repository.

No API keys, private user data, live trading credentials, production secrets, or private financial records are included.

## License

Apache-2.0 — see [LICENSE](LICENSE).

## Author

Jacob Zhao — [0xjacobzhao-byte](https://github.com/0xjacobzhao-byte)

Built for the Qwen Cloud Hackathon.

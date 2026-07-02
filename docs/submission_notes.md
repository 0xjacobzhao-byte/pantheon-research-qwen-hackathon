# Submission Notes

## Qwen Cloud Hackathon Submission

### Project Name
Pantheon Research — Qwen Cloud Hackathon Demo

### Author
Jacob Zhao ([0xjacobzhao-byte](https://github.com/0xjacobzhao-byte))

### Repository
https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon

### License
Apache-2.0

## What This Project Demonstrates

1. **Qwen Cloud Integration** — Uses the DashScope API in OpenAI-compatible mode to generate structured qualitative equity analysis with 7 assessment fields
2. **Dual-Provider Comparison** — Runs Qwen Cloud and DeepSeek concurrently, rendering outputs side-by-side with agreement scoring, tone classification, and divergence detection
3. **Alibaba Cloud Deployment** — Backend designed for Alibaba Cloud with Dockerized FastAPI, Nginx reverse proxy, and Alibaba RDS PostgreSQL-compatible database
4. **Structured Output** — LLM responses are parsed into standardized assessment fields: `business_quality`, `moat`, `pricing_power`, `capital_allocation`, `red_flags`, `confidence`, `missing_evidence`
5. **Truthful Error Handling** — Missing credentials are surfaced as `BLOCKED_BY_MISSING_CREDENTIAL`, never faked
6. **Human-in-the-Loop** — LLMs never execute trades; human remains portfolio manager

## Qwen Cloud API Usage

- **Base URL**: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- **Model**: `qwen-plus`
- **Endpoint**: `POST /chat/completions`
- **Integration file**: `backend/app/qwen_overlay.py`

## Alibaba Cloud Integration

| Component | Service |
|-----------|---------|
| Cloud Provider | Alibaba Cloud |
| Backend Runtime | Dockerized FastAPI |
| Reverse Proxy | Nginx |
| Database | Alibaba RDS PostgreSQL-compatible database |
| LLM Provider | Alibaba DashScope / Qwen Max |

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

## How to Verify

1. Clone the repo
2. `cp .env.example .env`
3. Run `docker-compose up --build` (or start backend + frontend manually)
4. Visit http://localhost:5173
5. Select a ticker (MA or NVDA) and click "Run Comparison"
6. Check `GET /api/alibaba/proof` for Alibaba Cloud deployment info
7. Check `GET /api/alibaba/qwen-config` for Qwen/DashScope configuration

## Key Design Decisions

- **Offline-first**: `DEMO_MODE=offline` (default) allows running without any API keys
- **Concurrent execution**: Both LLM providers run in parallel via `asyncio.gather()`
- **Structured status**: Every response includes a status enum, enabling truthful frontend rendering
- **Agreement scoring**: Weighted score from divergence penalties, tone distance, and confidence proximity
- **Human review gate**: Flagged when agreement is LOW, major divergences exist, or either provider fails
- **Clean separation**: This is a standalone repo — no private data or code from the production Pantheon Research platform

## Safety Statement

**LLMs do not execute trades; human remains portfolio manager.**

Pantheon Research is not an autonomous trading bot. It is a framework-first, data-governed, human-in-the-loop AI research operating system.

## Standalone Status

This repository is **independent** from the production Pantheon Research platform:
- Fresh git history
- No private credentials
- No production data
- No proprietary workflows
- Self-contained sample data

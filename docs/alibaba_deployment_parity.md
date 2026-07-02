# Alibaba Cloud Deployment Parity

This document states precisely what runs on Alibaba Cloud, so the deployment
claim can be verified and is not overstated.

## Live endpoint

- **Alibaba Cloud ECS:** `http://8.222.191.152` (Nginx reverse proxy → Dockerized FastAPI backend)
- Reference production frontend: `https://pantheon-research.vercel.app`

## What IS on Alibaba Cloud

| Component | Status | Evidence |
| --- | --- | --- |
| Compute | **Alibaba Cloud ECS**, Nginx + Dockerized FastAPI (same backend image as Railway) | `GET /health` → 200; `GET /api/proof/alibaba-cloud` → `runtime: "Alibaba Cloud ECS"` |
| AI provider | **Alibaba Cloud Model Studio / DashScope (Qwen)** | `POST /api/proof/qwen-smoke` returns a live Qwen-generated summary |
| Frontend | Full production SPA, built from private `master` (parity target: Vercel) | served at `/` by Nginx |

The proof endpoint reports **booleans only** for configuration
(`qwen_configured`, `dashscope_api_key_configured`, `database_url_configured`) —
never secret values — and honestly labels the host runtime.

## What is NOT (yet) on Alibaba Cloud — no overclaiming

- **No Alibaba RDS data migration.** The production data platform (1,300+ equity
  overlays) lives in **Railway Postgres**. The ECS box runs the backend and the
  live Qwen proof; it does **not** host a migrated copy of the production
  research database. The proof endpoint's `database_url_configured` reflects
  whatever DB the box is pointed at and is a boolean signal only.
- The rich DeepSeek-vs-Qwen **comparison data** is served from the Railway
  production DB (via Vercel/Railway), not from Alibaba. The Alibaba box's role is
  the **live-hosted backend + live Qwen call** proof.

## How to verify (no secrets needed for the public parts)

```bash
curl -s http://8.222.191.152/health
curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq
# admin-gated live Qwen call (operator supplies the box-local token):
curl -s -X POST http://8.222.191.152/api/proof/qwen-smoke \
  -H "Content-Type: application/json" -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"prompt":"In one sentence, what is Pantheon Research?"}' | jq
```

See [`live_proof.md`](live_proof.md) for captured real responses.

## Safe claim

> "The Pantheon Research backend is deployed on Alibaba Cloud ECS (Nginx →
> Dockerized FastAPI) and calls Qwen live via Alibaba Cloud Model Studio /
> DashScope, provable at a public proof endpoint. The production research data
> platform remains on Railway/Vercel; no Alibaba RDS migration is claimed."

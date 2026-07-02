# Live Proof — Alibaba Cloud + Qwen

This document ties the sanitized code in this repo to a **live Alibaba Cloud
deployment** so judges can verify the integration end-to-end, not just read code.

- **Public demo repo (this repo):** https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon
- **Live Alibaba Cloud endpoint (ECS + Nginx + Dockerized FastAPI):** `http://8.222.191.152`
- **Qwen integration source:** [`backend/app/qwen_overlay.py`](../backend/app/qwen_overlay.py)
- **Alibaba proof source:** [`backend/app/alibaba_cloud_proof.py`](../backend/app/alibaba_cloud_proof.py)

> The full production system (Vercel + Railway + Postgres, 1,300+ equities with
> DeepSeek overlays and a DeepSeek-vs-Qwen comparison UI) is a **private** repo.
> This repo is a sanitized, reproducible vertical slice. The Alibaba box above
> runs the same FastAPI backend image and is the public, judge-facing proof that
> Qwen is called live from Alibaba Cloud infrastructure.

## 1. Public-safe deployment proof (no auth, no secrets)

```bash
curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq
```

Live response (captured 2026-07-02, values are booleans only — never secrets):

```json
{
  "project": "Pantheon Research",
  "status": "ok",
  "cloud_provider": "Alibaba Cloud",
  "ai_platform": "Alibaba Cloud Model Studio / Qwen",
  "runtime": "Alibaba Cloud ECS",
  "region": "ap-southeast-1",
  "qwen_model": "qwen3.7-plus",
  "qwen_configured": true,
  "dashscope_api_key_configured": true,
  "database_url_configured": true,
  "timestamp_utc": "2026-07-02T11:56:14Z"
}
```

`runtime` reports the **actual** host (`Alibaba Cloud ECS`). In the private
production repo the same endpoint is environment-aware: on Railway it reports
`host_runtime: "Railway"` / `alibaba_hosted: false`, so no deployment ever
pretends to be hosted somewhere it is not. The Qwen **AI provider** is Alibaba
Cloud Model Studio (DashScope) on every host.

## 2. Live Qwen call (admin-gated smoke test)

The smoke endpoint performs a **real** Qwen chat-completion via Alibaba Cloud
Model Studio's OpenAI-compatible endpoint
(`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`). It is gated by an
admin token and fails closed (503) when no token is configured.

```bash
# ADMIN_TOKEN is held only on the server; the operator runs this during the demo.
curl -s -X POST http://8.222.191.152/api/proof/qwen-smoke \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"prompt": "In two sentences, describe Pantheon Research."}' | jq
```

Live response (captured 2026-07-02, ~14s round-trip — `qwen3.7-plus` is a
reasoning-class model, allow up to ~30s):

```json
{
  "project": "Pantheon Research",
  "status": "ok",
  "cloud_provider": "Alibaba Cloud",
  "ai_platform": "Alibaba Cloud Model Studio / Qwen",
  "qwen_model": "qwen3.7-plus",
  "prompt": "In two sentences, describe Pantheon Research.",
  "summary": "Pantheon Research is an independent, multi-asset market research platform that provides institutional investors with in-depth macroeconomic and financial analysis. The firm delivers actionable insights, forecasting, and strategic advice across global asset classes to help clients navigate complex market environments.",
  "timestamp_utc": "2026-07-02T11:57:03Z"
}
```

A redacted copy of a live smoke response is committed at
[`data/qwen_live_smoke_sample_redacted.json`](../data/qwen_live_smoke_sample_redacted.json)
(no API key, no auth headers).

Auth behaviour (verified live):

| Request | Result |
| --- | --- |
| No `x-admin-token` | `401` |
| `ADMIN_TOKEN` unset on server | `503` (fails closed — never public) |
| Valid token, `DASHSCOPE_API_KEY` set | `200` + live Qwen summary |

## 3. How the Qwen call works in code

[`backend/app/qwen_overlay.py`](../backend/app/qwen_overlay.py) posts to the
DashScope OpenAI-compatible `/chat/completions` endpoint with
`Authorization: Bearer $DASHSCOPE_API_KEY` and `model = $QWEN_MODEL`. Two modes:

- **Offline (default, `DEMO_MODE=offline`):** returns bundled sample overlays so
  the repo runs with zero credentials.
- **Live (`DEMO_MODE=live` + `DASHSCOPE_API_KEY`):** calls Qwen for real. Missing
  key → structured `BLOCKED_BY_MISSING_CREDENTIAL`; non-JSON model output →
  explicit `PARSE_ERROR` (never a hollow `SUCCESS`).

`backend/app/deepseek_overlay.py` is the symmetric DeepSeek path, and
`backend/app/comparison.py` computes tone / divergence / agreement between the
two providers.

## 4. What judges can safely conclude

- The backend runs on **Alibaba Cloud ECS** (Nginx reverse proxy → Dockerized
  FastAPI), reachable at the URL above.
- **Qwen is called live** via Alibaba Cloud Model Studio (DashScope) — provable
  with the smoke endpoint.
- No secrets are exposed anywhere in the repo or the proof responses.

# Qwen Coverage Report

> **Coverage state: WITHHELD (production) · VERIFIED (public demo).**
> Full production universe counts are withheld from the public repo. The repo
> demonstrates the mechanism with bundled redacted traces and sample evidence
> packs. No private DB URLs, no provider secrets, no raw universe dump.

**Purpose:** measure coverage of the Qwen-vs-DeepSeek qualitative-overlay
comparison — how many tickers have both a Qwen and a DeepSeek overlay so they
can be compared with agreement/divergence scoring.

**Product demo tickers** (seen live on `pantheon-research.com` / `8.222.191.152`,
Ticker Profile → Qwen vs DeepSeek): `NVDA`, `0700.HK` (Tencent),
`9988.HK` (Alibaba). **Public-repo bundled demo tickers:** `MA`, `NVDA`.

This report covers **only** the sanitized public demo below. Production universe
sizes, refresh cadence, and cost figures live in the private repo and are not
published here.

## Public demo — verified

| Metric | Value |
|--------|-------|
| Demo tickers | `MA`, `NVDA` |
| Evidence packs bundled | 2 |
| Qwen overlays bundled | 2 |
| DeepSeek overlays bundled | 2 |
| Dual-model comparisons | 2 |
| Healthy comparisons (usable both sides) | 2 |
| Fail-closed / errors in demo | 0 |
| Mode | offline (bundled samples) |
| Qwen model (demo default) | `qwen-plus` |
| DeepSeek model | `deepseek-chat` |

These numbers are reproducible: run `./scripts/judge_smoke.sh` or
`GET /api/data-quality`.

## Coverage schema (for the production backfill, when published)

The private production pipeline tracks the dual-model rollout with this shape.
Values are marked `pending final backfill` here because publishing the live
universe counts is out of scope for this sanitized repo.

| Field | Public demo | Production |
|-------|-------------|-----------|
| DeepSeek universe | 2 (demo) | _pending / private_ |
| Qwen before | 2 (demo) | _pending / private_ |
| Qwen generated | 2 (demo) | _pending / private_ |
| Qwen after | 2 (demo) | _pending / private_ |
| Healthy comparisons | 2 | _pending / private_ |
| Errors | 0 | _pending / private_ |
| Cost | $0 (offline) | _pending / private_ |
| Model | `qwen-plus` / `deepseek-chat` | `qwen3.7-plus` / DeepSeek (private) |
| Demo tickers | `MA`, `NVDA` | full universe (private) |
| Cost estimate | $0 (offline) | withheld (redacted range) |

## Notes

- The public demo uses `qwen-plus` as a safe default; the live Alibaba deployment
  reports `qwen_model: "qwen3.7-plus"` (a reasoning-class Qwen model) — verify at
  `GET http://8.222.191.152/api/proof/alibaba-cloud`.
- The production system routes premium Qwen tiers via a private model registry.
- A redacted coverage summary is committed at
  [`data/redacted_traces/coverage_summary_redacted.json`](../data/redacted_traces/coverage_summary_redacted.json).
- No performance/alpha is claimed — see
  [`docs/validation_methodology.md`](validation_methodology.md).

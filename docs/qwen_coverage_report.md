# Qwen Coverage Report

> Status: **public-demo numbers verified; production backfill figures intentionally not published.**

This report covers **only** the sanitized public demo. Production universe
sizes, refresh cadence, and cost figures live in the private repo and are not
published here (no private DB URLs, no proprietary universe counts).

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
| Model | `qwen-plus` / `deepseek-chat` | premium tiers (private) |
| Demo tickers | `MA`, `NVDA` | full universe (private) |

## Notes

- The public demo uses `qwen-plus` as a safe default; the production system
  routes premium Qwen tiers via a private model registry.
- A redacted coverage summary is committed at
  [`data/redacted_traces/coverage_summary_redacted.json`](../data/redacted_traces/coverage_summary_redacted.json).
- No performance/alpha is claimed — see
  [`docs/validation_methodology.md`](validation_methodology.md).

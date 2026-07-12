# Pantheon Research — Qwen Cloud Hackathon

### A framework-first, data-governed, human-in-the-loop AI research operating system

> **Public runnable slice:** a dual-LLM equity qualitative overlay — **Qwen via
> Alibaba Cloud Model Studio / DashScope** (hero provider) compared side-by-side
> against **DeepSeek** (baseline) — with agreement scoring, fail-closed model
> handling, `sha256` evidence provenance, and a human-review gate.

This repository is a **sanitized, self-contained, judge-runnable vertical slice**
of the private Pantheon Research production system: a web-based, cross-asset
research platform for macro, equities, and FICC. It demonstrates the parts that
matter for judging — **cloud deployment, data governance, deterministic
frameworks, and governed multi-model AI** — as code you can clone and run in
minutes. **It is not an API wrapper, and it is not the full production system.**

> **Judges — start here:** the [3-Minute Judge Path](#4-3-minute-judge-path)
> and [`docs/judge_evidence.md`](docs/judge_evidence.md). Or hit one endpoint for
> everything at once: **`GET /api/judge/full-demo`** — and see it rendered live
> in the app's **"Judge Demo / Qwen Proof"** tab, not just as raw JSON.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
![Backend](https://img.shields.io/badge/backend-FastAPI%20%C2%B7%20Python%203.11--3.12-009688)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%C2%B7%20TypeScript%20%C2%B7%20Vite-3178c6)
![AI](https://img.shields.io/badge/AI-Qwen%20(DashScope)%20%2B%20DeepSeek-6f42c1)
![Cloud](https://img.shields.io/badge/cloud-Alibaba%20Cloud%20ECS-ff6a00)

---

## 1. Hero

**Pantheon Research turns governed market evidence into explainable, comparable
research — never a single raw model opinion, and never an automatic order.**

For a given stock ticker, two independent LLM providers each read the *same*
provenance-committed evidence pack and produce a structured qualitative
assessment. The system then compares them: agreement score, tone, per-field
divergence, evidence gaps, and — when the models disagree or evidence is thin —
a **human-review gate**. The result carries an honest `data_state`
(`LIVE_DUAL` / `OFFLINE_SAMPLE` / `MIXED` / `PARTIAL` / `BLOCKED`), so a hollow
"SUCCESS" can never be mistaken for a real assessment.

- **Hero provider:** Qwen — Alibaba Cloud Model Studio / DashScope.
- **Baseline provider:** DeepSeek — for a genuine two-model comparison.
- **Runs offline with zero secrets;** live mode is one env var away.

---

## 2. Submission Links

| | |
|---|---|
| 🌐 Live Product | https://pantheon-research.com |
| ☁️ Alibaba Cloud Deployment | http://8.222.191.152 |
| 🔎 Deployment Proof (secret-free) | http://8.222.191.152/api/proof/alibaba-cloud |
| 🎬 Demo Video | https://www.youtube.com/watch?v=68lceOACLKo |
| 🖼️ Deck | [Google Slides](https://docs.google.com/presentation/d/1E72ORBmaiL2QPbmL1CPBqrbSLLOsAVEnDxdo76IPJqs/edit?usp=sharing) |
| 💻 Public Code (this repo) | https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon |
| 🔒 Private Production Repo | https://github.com/0xjacobzhao-byte/Pantheon-Research |

> The **live product** and **Alibaba deployment** run the full private
> production system. **This repository** is the sanitized, self-contained slice
> judges can clone and run. See [§5 Repository Scope](#5-repository-scope-public-slice-vs-private-production).

---

## 3. Executive Summary

Pantheon Research is a **cross-asset research operating system** for investors,
analysts, and allocators — a web-based platform (with mobile / PWA support, and a
WeChat Mini Program in progress) that spans Global Macro, Equities, and FICC
instead of a dozen disconnected tools.

The problem is not a lack of financial information. **The problem is the absence
of structured, governed, and explainable decision intelligence.** Raw data is not
a view, and a raw model opinion is not research. Pantheon sits between the two:

- **Deterministic engines** own versioned investment frameworks, normalized
  inputs, scores, regimes, hard stops, reproducibility, and audit trails.
- A **multi-model LLM overlay** interprets and stress-tests *governed* evidence,
  surfaces disagreement, and flags evidence gaps — but never mutates
  deterministic ratings.
- A **human remains the portfolio manager.** Every signal passes a human-review
  gate. Pantheon is deliberately **not** a finance chatbot, **not** a raw-model
  opinion feed, and **not** an automatic signal-to-order bot.

This public slice makes that thesis concrete on one feature — the equity
qualitative overlay — with **Qwen as the hero provider and DeepSeek as the
comparison baseline**, running on **Alibaba Cloud**.

---

## 4. 3-Minute Judge Path

```bash
# 0. Clone & run (offline, no secrets required)
git clone https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon
cd pantheon-research-qwen-hackathon
docker compose up --build          # frontend :5173 · backend :8000
```

1. **Open the "Judge Demo / Qwen Proof" tab** at http://localhost:5173 — a
   product-grade, visual home for the entire judge demo (Alibaba proof, Qwen
   integration, evidence lineage, signal preview, roadmap, claims ledger).
   Falls back to a graceful error state, never a blank page, if the backend
   isn't reachable.
2. **Or get everything in one call** — the same aggregator, raw:
   ```bash
   curl -s http://localhost:8000/api/judge/full-demo | jq
   ```
3. **Verify the live Alibaba ECS proof** (production backend, no secrets returned):
   ```bash
   curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq
   ```
4. **Inspect the actual Qwen / DashScope call** — [`backend/app/qwen_overlay.py`](backend/app/qwen_overlay.py)
5. **Run the end-to-end smoke test** (offline):
   ```bash
   ./scripts/judge_smoke.sh
   ```
6. **Read the full evidence guide** — [`docs/judge_evidence.md`](docs/judge_evidence.md)

---

## 5. Repository Scope: Public Slice vs Private Production

This public repository is a **sanitized, self-contained hackathon slice**. The
complete production codebase lives in the private Pantheon Research repository:
https://github.com/0xjacobzhao-byte/Pantheon-Research

| | **This public repo** | **Private production** |
|---|---|---|
| Purpose | Judge-runnable proof of the overlay + governance | The live product |
| Live LLM path | **Qwen + DeepSeek** (dual-model) | Multi-model (see §8) |
| Data | Bundled, sanitized samples (MA, NVDA) | Governed PostgreSQL platform |
| Universe | 2 worked demo tickers | Full multi-market coverage |
| Trading, admin, provider routing, scoring models | Not included | Private |
| Runs with zero secrets | ✅ | n/a |

The private repo stays closed to protect proprietary trading-strategy IP,
provider integrations, operational runbooks, and production data infrastructure.
**Qwen Hackathon judges may request temporary private access from Jacob Zhao for
verification.**

> **This public repo does not equal full production.** Where a capability exists
> only in production, it is labelled *production architecture context*, not a
> claim about this slice.

---

## 6. What Has Been Built

**In this public slice (runnable here):**

- A **dual-model equity overlay** — Qwen (hero) vs DeepSeek (baseline) over one
  shared, hashed evidence pack, with agreement/divergence/tone scoring.
- **Fail-closed model states** — missing credential, API error, parse error, and
  not-generated are explicit; a comparison is never a hollow success.
- **`sha256` evidence provenance** — every pack is committed to a content hash
  threaded through each comparison.
- A **Research-Ops / data-quality panel**, **provider-health snapshot**, and
  **signal validation timeline** — governance surfaces, not just an answer.
- A **context-only multi-asset module grid** (Macro · TA · FICC) showing scope.
- A **production-feel React + TypeScript UI**, Dockerized, with an offline mode.
- A **unified judge aggregator** — `GET /api/judge/full-demo`.
- A visual **"Judge Demo / Qwen Proof" cockpit page** in the frontend — Alibaba
  proof, Qwen/DeepSeek config, evidence pack, both overlays, comparison, an
  **Evidence Lineage** flow diagram, a **Signal Brief Preview** (mock,
  Telegram-style), a **Productization Roadmap**, and the claims ledger — with a
  fail-closed error state, never a blank page.
- A **mock Signal Brief Preview** — `GET /api/signal-preview/qwen/{ticker}` —
  demonstrating the delivery layer offline, with no real Telegram call.

**In the private production system (architecture context, not claimed for this repo):**

- A **live cross-asset web product** with **mobile / PWA** support and a
  **WeChat Mini Program** launch candidate in progress.
- A **governed, database-first PostgreSQL platform** — canonical observations,
  derived/product snapshots, and evidence artifacts, fed by
  **provider APIs, regulatory filings, web scraping, and on-chain / social
  integrations** with provider routing, freshness/quality labels, and fail-closed
  governance.
- **Deterministic, versioned strategy frameworks** across every research domain.
- A **five-provider Equity research cockpit** (Claude · ChatGPT · Gemini ·
  DeepSeek · Qwen) with model comparison and disagreement detection.
- A **Signal Alert / delivery layer** including **Telegram** account linking and
  per-user signal delivery.
- **Payment and membership infrastructure** (Pantheon Pro), controlled and
  fail-closed by default — the commercial foundation.
- **Validated multi-cloud deployment proofs** on Alibaba Cloud and Google Cloud.

---

## 7. Architecture: Strategy → Information → Signal → Trading

![Pantheon Research High-Level Architecture](docs/assets/architecture_high_level.png)

Pantheon is **database-first**: research reads from governed, point-in-time
observations, not from ad-hoc API calls at request time. The pipeline moves
strictly left-to-right, and the boundary at the end is a human, not an order
router.

```
Providers / APIs / Filings / Web Scraping / On-chain / Social
   → Ingestion + Provider Routing → Validation + Normalization
   → Canonical Observations (PostgreSQL) → Evidence Artifacts (sha256)
   → Deterministic Frameworks + Multi-Model LLM Overlay
   → Research Views / Signals / Comparisons → Human Review → Delivery

        Strategy ──▶ Information ──▶ Signal ──▶ Trading
```

| Layer | Role | In this public slice |
|-------|------|----------------------|
| **Strategy** | Versioned investment frameworks & universe selection | Framework-shaped evidence schema |
| **Information** | Governed evidence: metrics, fundamentals, provenance | Bundled evidence pack + `sha256` hash |
| **Signal** | Dual/multi-model qualitative overlay → structured fields | Qwen vs DeepSeek comparison engine |
| **Trading** | **Human-in-the-loop decision gate** (LLMs never execute) | `human_review_required` gate |

**Safety:** LLMs do not execute trades. Every signal passes a human-review gate.
Pantheon Research is **not** an autonomous trading bot.

---

## 8. Deterministic + Qwen / DeepSeek LLM Overlay

Pantheon draws a strict boundary between **deterministic computation** and **LLM
interpretation**.

- **Deterministic engines own** normalized inputs, scores, regimes, valuation
  outputs, hard stops, reproducibility, and audit trails.
- **The AI overlay owns** qualitative interpretation, contradiction detection,
  model comparison, and evidence-gap discovery — reading governed evidence and
  **never** directly mutating a deterministic rating or executing a trade.

**Public runnable path — Qwen + DeepSeek dual-model comparison.** Two independent
providers assess the *same* hashed evidence pack; agreement, divergence, and tone
are **computed, not assumed**:

| Provider | Role in this repo | Boundary |
|----------|-------------------|----------|
| **Qwen** (Alibaba DashScope) | **Hero** qualitative overlay | Reads governed evidence; never trades |
| **DeepSeek** | **Baseline** for comparison | Reads governed evidence; never trades |

> **Production architecture context (clearly labelled):** the private system
> integrates **five** LLM research providers — **Claude · ChatGPT · Gemini ·
> DeepSeek · Qwen** — behind one schema-validated overlay pipeline, so no single
> vendor is a permanent dependency. **This public repo's runnable live path is
> Qwen + DeepSeek only.** Live five-model paid inference is not run here.

---

## 9. Why This Is Not Just an LLM Wrapper

| Capability | Implementation |
|------------|---------------|
| **Fail-closed model states** — missing key → `BLOCKED_BY_MISSING_CREDENTIAL`, bad JSON → `PARSE_ERROR`, missing sample → `QWEN_NOT_GENERATED` | [`qwen_overlay.py`](backend/app/qwen_overlay.py) · [`models.py`](backend/app/models.py) |
| **Evidence hashing** — every pack committed to a `sha256` content hash threaded into each comparison | [`evidence_pack.py`](backend/app/evidence_pack.py) |
| **Dual-model agreement & divergence** — two independent models, per-field divergence, honest `data_state` | [`comparison.py`](backend/app/comparison.py) |
| **Human-review gate** — low agreement / major divergence → `human_review_required`; fail-closed → `NOT_COMPARABLE` | [`comparison.py`](backend/app/comparison.py) · [`OverlayComparisonPanel.tsx`](frontend/src/components/equity/OverlayComparisonPanel.tsx) |
| **Evidence Lineage** — visual proof the LLMs *read* evidence rather than invent it: Evidence Pack → Qwen → DeepSeek → Comparison → Human Review, each step labelled deterministic vs LLM-generated | [`EvidenceLineage.tsx`](frontend/src/components/judge/EvidenceLineage.tsx) |
| **Multi-asset scope** — Macro · TA · FICC context grid with per-module `data_state` | [`sample_modules.py`](backend/app/sample_modules.py) · [`ModuleSnapshotGrid.tsx`](frontend/src/components/ModuleSnapshotGrid.tsx) |
| **Research-Ops governance** — provider config, coverage, per-ticker state | [`data_quality.py`](backend/app/data_quality.py) · [`DataQualityPanel.tsx`](frontend/src/components/DataQualityPanel.tsx) |
| **Validation methodology** — the overlay is a tracked signal, not an alpha oracle | [docs/validation_methodology.md](docs/validation_methodology.md) |
| **Live deployment proof** — host-honest proof endpoint + admin-gated live Qwen smoke | [docs/live_proof.md](docs/live_proof.md) |

---

## 10. Alibaba Cloud + Qwen Integration

| Component | Detail |
|-----------|--------|
| Cloud Provider | **Alibaba Cloud** |
| AI Provider (Qwen) | **Alibaba Cloud DashScope / Model Studio** |
| Compute | Dockerized FastAPI behind Nginx on **Alibaba Cloud ECS** |
| Host Detection | Honest via `alibaba_hosted` (same image runs on Railway and Alibaba ECS) |
| Database | Alibaba RDS PostgreSQL-compatible — **selected evidence mirror** |
| Base URL | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Model | `qwen-plus` (public default; `qwen3.7-plus` on the live box) · `QWEN_MODEL` |
| Protocol | OpenAI-compatible chat completions, Bearer `DASHSCOPE_API_KEY` |

**Default mode is offline** — no API key required, bundled samples in `data/`.
Set `DEMO_MODE=live` + `DASHSCOPE_API_KEY` for live Qwen calls. See
[docs/qwen_integration.md](docs/qwen_integration.md).

### Deployment proof (secret-free)

[`/api/proof/alibaba-cloud`](http://8.222.191.152/api/proof/alibaba-cloud) returns
deployment metadata with **booleans only** — no keys, tokens, or connection
strings — and makes **no external calls**, so it never claims connectivity it did
not verify.

### Database claim (precise — no overclaiming)

```json
{
  "role": "selected evidence mirror",
  "mirror_state": "partial_selected_mirror",
  "connected": null,
  "production_data_migrated": false,
  "full_production_clone_verified": false
}
```

On the **live ECS box**, RDS is deployed and connected (`connected: true`). This
offline demo performs no probe (`connected: null`). **Alibaba RDS is a selected
evidence mirror, not a full production-database clone** — migration is never
claimed without core row counts and API read-path verification. See
[docs/alibaba_deployment_parity.md](docs/alibaba_deployment_parity.md).

---

## 11. Production Coverage

Numbers below describe the **private production** Qwen coverage (reported from the
bundled [`data/judge_proof_bundle.json`](data/judge_proof_bundle.json)); the
public offline demo ships two fully worked tickers (MA, NVDA).

| Metric | Value |
|--------|-------|
| Qwen comparison-capable | **312 tickers** |
| Markets | US 117 / CN 69 / HK 103 / SG 23 |
| Healthy comparisons | **312 / 312** |
| DeepSeek baseline universe | 1,331 |

Full-universe parity was intentionally not pursued for the public demo. Coverage
prioritizes liquid, judge-relevant equities across US, China, Hong Kong, and
Singapore; low-liquidity tail coverage remains private / backlog.

---

## 12. Demo Flow

1. **Select ticker** — MA (Mastercard) or NVDA (NVIDIA).
2. **Load evidence** — backend loads quantitative metrics from `data/` and
   commits them to a `sha256` pack.
3. **Qwen overlay** — DashScope generates a structured assessment.
4. **DeepSeek overlay** — independent assessment over the same evidence.
5. **Comparison** — agreement score, tone, divergences, evidence gaps.
6. **Human-review gate** — low agreement / major divergence → review flagged.

Each overlay produces: `business_quality`, `moat`, `pricing_power`,
`capital_allocation`, `red_flags`, `confidence` (0–1), `missing_evidence`.

<details>
<summary><b>Example comparison output (NVDA, offline sample)</b></summary>

```json
{
  "ticker": "NVDA",
  "data_state": "OFFLINE_SAMPLE",
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

`data_state` is the honest headline. When a provider fails closed, the comparison
is `NOT_COMPARABLE` — **no agreement score is fabricated**.

</details>

---

## 13. Current Maturity

Status taxonomy: `LIVE` · `BETA` · `INTERNAL` · `STAGED` · `PLANNED`.

| Capability | Status | Where |
|---|---|---|
| Qwen vs DeepSeek equity overlay | **LIVE** | This repo |
| Offline judge demo (zero secrets) | **LIVE** | This repo |
| Alibaba Cloud ECS deployment proof | **LIVE** | Alibaba |
| Cross-asset web dashboard | LIVE | Production (Web / PWA) |
| Five-provider Equity cockpit | LIVE (cache) | Production |
| Research-Ops & data-quality control plane | INTERNAL (admin) | Production |
| Signal Alert / Telegram delivery | BETA (controlled) | Production |
| WeChat Mini Program | BETA (launch-candidate) | Production |
| Payment & membership (Pantheon Pro) | BETA (controlled) | Production |
| Trading Gateway | STAGED · fail-closed | Production |

Billing is gated off by default; every real-delivery and execution path is
fail-closed behind environment kill-switches.

---

## 14. API Endpoints

<details>
<summary><b>Full endpoint reference (23 endpoints)</b></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root info |
| GET | `/health` | Health check |
| **Judge** | | |
| GET | `/api/judge/full-demo` | **Unified aggregator** — whole demo in one read-only, secret-free call |
| GET | `/api/signal-preview/qwen/{ticker}` | Mock, offline signal brief — no real Telegram send, no credentials |
| **Core** | | |
| GET | `/api/project` | Project metadata |
| GET | `/api/evidence/{ticker}` | Evidence pack + provenance (`sha256` content hash) |
| GET | `/api/overlay/qwen/{ticker}` | Qwen qualitative overlay |
| GET | `/api/overlay/deepseek/{ticker}` | DeepSeek qualitative overlay |
| GET | `/api/comparison/{ticker}` | Full dual-provider comparison |
| GET | `/api/data-quality` | Research-Ops / governance snapshot |
| GET | `/api/modules` | Module snapshot grid |
| GET | `/api/validation` | Forward-validation methodology |
| GET | `/api/demo-flow` | Demo flow steps |
| **Alibaba Proof** | | |
| GET | `/api/proof/alibaba-cloud` | Deployment proof (v2, canonical) |
| GET | `/api/alibaba/proof` | Deployment proof (alias) |
| GET | `/api/alibaba/qwen-config` | Qwen / DashScope configuration |
| **Production-Feel Panels** | | |
| GET | `/api/ticker-profile/{ticker}` | Ticker profile with KPI cards |
| GET | `/api/ticker-profiles` | List available ticker profiles |
| GET | `/api/provider-health` | Provider health snapshot |
| GET | `/api/validation-timeline` | Signal lifecycle timeline |
| GET | `/api/mini/macro` | Macro regime mini panel (context-only) |
| GET | `/api/mini/market-pulse` | Market Pulse / TA mini panel (context-only) |
| GET | `/api/mini/ficc` | FICC mini panel (context-only) |

</details>

---

## 15. Tests

```bash
cd backend && python -m pytest            # backend tests (incl. judge aggregator)
cd frontend && npm test -- --run           # frontend tests
cd frontend && npm run build               # production build
docker compose config                      # validate compose file
./scripts/judge_smoke.sh                   # end-to-end smoke (offline)
```

The smoke test exercises the local backend end-to-end (offline, no secrets),
including `/api/judge/full-demo` and `/api/signal-preview/qwen/{ticker}`, then
best-effort pings the live Alibaba Cloud proof. Frontend tests cover the Judge
Demo page's success render, human-review banner, and fail-closed error states
(`JudgeDemoPage.test.tsx`).

---

## 16. Key Files

| Category | File |
|----------|------|
| **Unified Judge Demo** | [`backend/app/judge_demo.py`](backend/app/judge_demo.py) → `GET /api/judge/full-demo` |
| **Judge Demo Cockpit UI** | [`JudgeDemoPage.tsx`](frontend/src/components/judge/JudgeDemoPage.tsx) — consumes `/api/judge/full-demo`, fail-closed on error |
| **Evidence Lineage** | [`EvidenceLineage.tsx`](frontend/src/components/judge/EvidenceLineage.tsx) |
| **Signal Preview** | [`backend/app/signal_preview.py`](backend/app/signal_preview.py) → `GET /api/signal-preview/qwen/{ticker}` · [`SignalBriefPreview.tsx`](frontend/src/components/judge/SignalBriefPreview.tsx) |
| **Qwen Value / Roadmap** | [`QwenValueSection.tsx`](frontend/src/components/judge/QwenValueSection.tsx) · [`CommercializationRoadmap.tsx`](frontend/src/components/judge/CommercializationRoadmap.tsx) |
| **Judge Evidence** | [`docs/judge_evidence.md`](docs/judge_evidence.md) · [`data/judge_proof_bundle.json`](data/judge_proof_bundle.json) |
| **Alibaba Proof Code** | [`backend/app/alibaba_cloud_proof.py`](backend/app/alibaba_cloud_proof.py) |
| **Qwen API Call** | [`backend/app/qwen_overlay.py`](backend/app/qwen_overlay.py) |
| Comparison Engine | [`backend/app/comparison.py`](backend/app/comparison.py) |
| Evidence Pack + Hash | [`backend/app/evidence_pack.py`](backend/app/evidence_pack.py) |
| Product UI | [`frontend/src/components/equity/OverlayComparisonPanel.tsx`](frontend/src/components/equity/OverlayComparisonPanel.tsx) |
| Data Quality Panel | [`backend/app/data_quality.py`](backend/app/data_quality.py) · [`DataQualityPanel.tsx`](frontend/src/components/DataQualityPanel.tsx) |
| Provider Health | [`backend/app/provider_health.py`](backend/app/provider_health.py) |
| Validation Timeline | [`backend/app/validation_timeline.py`](backend/app/validation_timeline.py) |
| Safe Claims & Non-Claims | [docs/safe_claims.md](docs/safe_claims.md) |
| Production Mapping | [docs/production_architecture_mapping.md](docs/production_architecture_mapping.md) |
| Judge Walkthrough | [docs/judge_walkthrough.md](docs/judge_walkthrough.md) |

---

## 17. Roadmap & Commercialization

Pantheon's path from research operating system to commercial product. The same
roadmap renders as a **Productization Roadmap** card in the Judge Demo tab —
phrased throughout as *expected revenue streams*, not existing revenue:

- **Strategy backtesting** — point-in-time, no-lookahead backtests across the
  deterministic frameworks.
- **Forward track record** — mature the tracked-signal ledger into a public,
  no-lookahead forward record before any performance is characterized.
- **Go-to-market & commercialization** — grow Pantheon Pro (the existing
  payment + membership infrastructure) from controlled beta to paid tiers.
- **API monetization** — expose governed research data and model-comparison
  outputs as a paid API.
- **Skills marketplace** — third-party research frameworks and overlays as
  installable "skills" on the platform.
- **Paid market data / equity evaluation** — premium, evidence-backed equity and
  cross-asset evaluation products.
- **Trading — only after validation** — a staged Trading Gateway (shadow → paper
  → approval) that stays fail-closed; **any trading profit follows validated
  track record, and is never claimed today**.

---

## 18. Safe Claims / Non-Claims

**Safe claims (defensible & verifiable):**

- Qwen is called **live** via Alibaba Cloud DashScope (OpenAI-compatible) when
  live mode is enabled; implementation in [`qwen_overlay.py`](backend/app/qwen_overlay.py).
- The backend runs **live on Alibaba Cloud ECS** (Nginx → Dockerized FastAPI)
  with a secret-free public proof endpoint.
- **Dual-model comparison is real** — Qwen and DeepSeek assess the same hashed
  evidence pack; agreement/divergence/tone are computed, and fail-closed states
  are explicit.
- **Evidence is provenance-committed** to a `sha256` content hash.
- **Offline mode is fully functional** with bundled samples and **no secrets**.

**Non-claims (explicitly NOT asserted):**

- **No autonomous trading.** LLMs never execute trades; every signal passes a
  human-review gate.
- **No alpha / performance claim.** The overlay is a tracked research signal;
  forward validation is required first.
- **This public repo is not the full production system.**
- **Alibaba RDS is not a full production-database clone**, and no production-data
  migration is claimed.
- **No live five-model paid inference in this public repo** — the runnable live
  path is Qwen + DeepSeek. Claude / ChatGPT / Gemini appear only as *production
  architecture context*.
- **No proprietary internals** (market-data pipelines, scoring models, provider
  routing, production database rows, admin plane) are published here.
- **The Signal Brief Preview never sends a real Telegram message.** It is a
  mock, offline render of the delivery layer's shape — no credentials, no
  external network call, and `delivery_state` is always `RESEARCH_ONLY` or
  `HUMAN_REVIEW_REQUIRED`, never an auto-execute state.

Full ledger: [docs/safe_claims.md](docs/safe_claims.md).

---

## 19. Author & License

**Jacob Zhao** — [0xjacobzhao-byte](https://github.com/0xjacobzhao-byte)

**License:** Apache-2.0 — see [LICENSE](LICENSE).

No API keys, private user data, live trading credentials, production secrets, or
private financial records are included in this repository.

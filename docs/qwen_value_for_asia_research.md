# Qwen-Specific Value for Asia Equity Research

Why Qwen is the **hero model** for this submission — not just "another provider"
behind an abstraction.

## 1. Qwen is the hero model for this hackathon

This public repository's **runnable live path is Qwen** (Alibaba Cloud DashScope
/ Model Studio) as the primary analyst, with **DeepSeek as the comparison
baseline**. Every dual-model comparison in the demo is anchored on a Qwen
overlay reading a `sha256`-committed evidence pack. Claude / ChatGPT / Gemini
appear only as *production architecture context*, never as a runnable path in
this public repo.

## 2. Built for Asia-oriented equity research

Pantheon's production equity coverage spans **US, China (A-share), Hong Kong, and
Singapore**. Qwen is a natural fit for this footprint:

- **Chinese-language context.** A large share of primary evidence for A-share and
  HK names — filings, exchange announcements, earnings commentary, local news —
  is Chinese-first. Qwen reads and reasons over Chinese-language source material
  natively, rather than through a lossy translation hop.
- **A-share / Hong Kong market terminology.** Regional conventions (board lots,
  connect eligibility, dual-class / weighted-voting structures, mainland
  disclosure norms) are part of Qwen's training footprint, which reduces
  misreads on region-specific terms.
- **Regional research workflows.** For an Asia-centric research desk, a
  first-class Chinese-language analyst in the model panel is a practical
  advantage, not a novelty.

## 3. Qwen vs DeepSeek is not winner-takes-all

The comparison is **not** designed to crown a single "best" model. It is designed
to surface, per evidence field:

- **agreement** — where two independent models converge on the same read;
- **divergence** — where they disagree, and how severely (minor / moderate /
  major); and
- **evidence gaps** — what neither model could support from the governed evidence.

Divergence is **signal, not noise**: a major disagreement on `pricing_power` or
`red_flags` is exactly the kind of thing a human analyst should look at, and the
system routes it to a **human-review gate** rather than averaging it away.

## 4. Qwen as a conservative analyst that flags over-inference

In the dual-model setup Qwen can act as the **more conservative voice** — the one
that flags when the governed evidence is insufficient to support a confident
conclusion, instead of filling the gap with plausible-sounding narrative. Each
overlay emits a `confidence` score and a `missing_evidence` list, so a
Qwen-flagged evidence gap is a first-class, structured output — not a hedge
buried in prose. This is precisely the behaviour you want from a research
assistant that must not over-claim.

## 5. DashScope + Alibaba Cloud: a credible China / Asia deployment path

Qwen is served through **Alibaba Cloud Model Studio / DashScope** in
OpenAI-compatible mode, and the integration is deployed and proven on **Alibaba
Cloud ECS** (Nginx → Dockerized FastAPI) with a selected RDS evidence mirror.
For a product targeting China / Asia market access, this is a **real,
already-integrated deployment path** — not a theoretical one. The secret-free
[`/api/proof/alibaba-cloud`](live_proof.md) endpoint lets a judge verify the
deployment posture without any credential ever being exposed.

## 6. LLMs remain analysts, not traders

Qwen and DeepSeek **read governed evidence and produce structured opinions.**
Neither model executes a trade, and neither mutates a deterministic rating. Every
signal passes a human-review gate; the human remains the portfolio manager. The
[Signal Brief Preview](../backend/app/signal_preview.py) makes this explicit —
its delivery state is always `RESEARCH_ONLY` or `HUMAN_REVIEW_REQUIRED`, never an
auto-execute state, and it never sends a real message.

---

**In short:** Qwen is not a swappable commodity in this system. It is the hero
analyst for an Asia-focused, evidence-governed research workflow, deployed on
Alibaba Cloud, and deliberately kept on the analyst side of the analyst/trader
boundary.

"""Dual-provider comparison logic: agreement scoring, tone analysis, divergence detection."""

from __future__ import annotations

import asyncio
import re
from typing import Optional

from .models import (
    AgreementLevel,
    ComparisonResult,
    Divergence,
    EquityEvidence,
    LLMProvider,
    OverlayStatus,
    QualitativeOverlay,
    Tone,
)


# ---------------------------------------------------------------------------
# Keyword sets for tone classification
# ---------------------------------------------------------------------------

POSITIVE_WORDS = {
    "excellent", "strong", "robust", "outstanding", "powerful", "dominant",
    "superior", "wide moat", "high quality", "exceptional", "premium",
    "best-in-class", "compelling", "attractive", "solid", "growth",
}

CAUTIOUS_WORDS = {
    "risk", "concern", "elevated", "premium", "limited", "headwind",
    "uncertainty", "margin of safety", "expensive", "richly valued",
    "valuation", "regulatory", "disruption", "competition",
}

NEGATIVE_WORDS = {
    "weak", "declining", "deteriorating", "poor", "negative",
    "loss", "debt", "overvalued", "bubble", "sell",
}


# ---------------------------------------------------------------------------
# Tone analysis
# ---------------------------------------------------------------------------

def classify_tone(overlay: QualitativeOverlay) -> Tone:
    """Classify the tone of an overlay based on keyword analysis of its text."""
    if overlay.status in (OverlayStatus.BLOCKED_BY_MISSING_CREDENTIAL, OverlayStatus.API_ERROR):
        return Tone.NEUTRAL

    # Gather all text from the overlay
    texts = [overlay.takeaway]
    if overlay.assessment:
        texts.append(overlay.assessment.business_quality)
        texts.append(overlay.assessment.moat)
        texts.append(overlay.assessment.pricing_power)
        texts.append(overlay.assessment.capital_allocation)
        texts.append(overlay.assessment.red_flags)

    combined = " ".join(texts).lower()

    pos_count = sum(1 for w in POSITIVE_WORDS if w in combined)
    caut_count = sum(1 for w in CAUTIOUS_WORDS if w in combined)
    neg_count = sum(1 for w in NEGATIVE_WORDS if w in combined)

    total = pos_count + caut_count + neg_count
    if total == 0:
        return Tone.NEUTRAL

    pos_ratio = pos_count / total
    caut_ratio = caut_count / total
    neg_ratio = neg_count / total

    if neg_ratio > 0.35:
        return Tone.NEGATIVE
    if pos_ratio > 0.6 and caut_ratio < 0.2:
        return Tone.POSITIVE
    if pos_ratio > 0.4 and caut_ratio >= 0.2:
        return Tone.CONSERVATIVE_POSITIVE
    if caut_ratio > 0.4:
        return Tone.CAUTIOUS
    return Tone.NEUTRAL


# ---------------------------------------------------------------------------
# Text similarity
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> set[str]:
    """Tokenize text into a set of lowercase word tokens."""
    return set(re.findall(r"[a-z]+", text.lower()))


def _jaccard_similarity(a: str, b: str) -> float:
    """Compute Jaccard similarity between two text strings."""
    tokens_a = _tokenize(a)
    tokens_b = _tokenize(b)
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return len(intersection) / len(union) if union else 0.0


# ---------------------------------------------------------------------------
# Divergence detection
# ---------------------------------------------------------------------------

_ASSESSMENT_TEXT_FIELDS = [
    "business_quality",
    "moat",
    "pricing_power",
    "capital_allocation",
    "red_flags",
]


def detect_divergences(
    qwen: QualitativeOverlay,
    deepseek: QualitativeOverlay,
) -> list[Divergence]:
    """Detect divergences between two overlays across assessment fields."""
    divergences: list[Divergence] = []

    if not qwen.assessment or not deepseek.assessment:
        return divergences

    for field_name in _ASSESSMENT_TEXT_FIELDS:
        qwen_val = getattr(qwen.assessment, field_name, "")
        ds_val = getattr(deepseek.assessment, field_name, "")

        if not qwen_val and not ds_val:
            continue

        similarity = _jaccard_similarity(qwen_val, ds_val)

        if similarity < 0.15:
            severity = "major"
        elif similarity < 0.30:
            severity = "moderate"
        else:
            continue  # similar enough, no divergence

        divergences.append(
            Divergence(
                field=field_name,
                qwen_view=qwen_val[:200],
                deepseek_view=ds_val[:200],
                severity=severity,
            )
        )

    return divergences


# ---------------------------------------------------------------------------
# Agreement scoring
# ---------------------------------------------------------------------------

def compute_agreement_score(
    qwen: QualitativeOverlay,
    deepseek: QualitativeOverlay,
    divergences: list[Divergence],
    qwen_tone: Tone,
    deepseek_tone: Tone,
) -> float:
    """Compute an agreement score (0–1) between two overlays."""
    # Start at 1.0 and subtract penalties
    score = 1.0

    # Penalty for divergences
    for d in divergences:
        if d.severity == "major":
            score -= 0.15
        elif d.severity == "moderate":
            score -= 0.08
        else:
            score -= 0.03

    # Penalty for tone mismatch
    if qwen_tone != deepseek_tone:
        # Adjacent tones (e.g. positive vs conservative_positive) → small penalty
        tone_order = [
            Tone.POSITIVE,
            Tone.CONSERVATIVE_POSITIVE,
            Tone.NEUTRAL,
            Tone.CAUTIOUS,
            Tone.NEGATIVE,
        ]
        try:
            idx_q = tone_order.index(qwen_tone)
            idx_d = tone_order.index(deepseek_tone)
            distance = abs(idx_q - idx_d)
            score -= distance * 0.05
        except ValueError:
            score -= 0.05

    # Confidence proximity bonus
    if qwen.assessment and deepseek.assessment:
        conf_diff = abs(qwen.assessment.confidence - deepseek.assessment.confidence)
        score -= conf_diff * 0.2

    # Clamp to [0, 1]
    return max(0.0, min(1.0, score))


def agreement_level_from_score(score: float) -> AgreementLevel:
    """Map an agreement score to HIGH / MEDIUM / LOW."""
    if score >= 0.75:
        return AgreementLevel.HIGH
    if score >= 0.5:
        return AgreementLevel.MEDIUM
    return AgreementLevel.LOW


# ---------------------------------------------------------------------------
# Evidence gaps
# ---------------------------------------------------------------------------

def collect_evidence_gaps(
    qwen: QualitativeOverlay,
    deepseek: QualitativeOverlay,
) -> list[str]:
    """Combine evidence gaps from both providers, deduplicated."""
    gaps: list[str] = []
    seen: set[str] = set()

    for overlay in (qwen, deepseek):
        if overlay.assessment:
            for gap in overlay.assessment.missing_evidence:
                key = gap.lower().strip()
                if key and key not in seen:
                    seen.add(key)
                    gaps.append(gap)

    return gaps


# ---------------------------------------------------------------------------
# Full comparison
# ---------------------------------------------------------------------------

async def run_comparison(
    evidence: EquityEvidence,
    demo_mode: bool = False,
) -> ComparisonResult:
    """Run both overlays concurrently and produce a full comparison."""
    from .qwen_overlay import run_qwen_overlay
    from .deepseek_overlay import run_deepseek_overlay

    qwen_task = run_qwen_overlay(evidence, demo_mode=demo_mode)
    ds_task = run_deepseek_overlay(evidence, demo_mode=demo_mode)
    qwen_overlay, deepseek_overlay = await asyncio.gather(qwen_task, ds_task)

    # Tone analysis
    qwen_tone = classify_tone(qwen_overlay)
    deepseek_tone = classify_tone(deepseek_overlay)

    # Divergence detection
    divergences = detect_divergences(qwen_overlay, deepseek_overlay)

    # Agreement scoring
    agreement_score = compute_agreement_score(
        qwen_overlay, deepseek_overlay, divergences, qwen_tone, deepseek_tone
    )
    agreement_level = agreement_level_from_score(agreement_score)

    # Evidence gaps
    evidence_gaps = collect_evidence_gaps(qwen_overlay, deepseek_overlay)

    # Human review required?
    has_major = any(d.severity == "major" for d in divergences)
    human_review = (
        agreement_level == AgreementLevel.LOW
        or has_major
        or qwen_overlay.status != OverlayStatus.SUCCESS
        or deepseek_overlay.status != OverlayStatus.SUCCESS
    )

    return ComparisonResult(
        ticker=evidence.ticker,
        evidence=evidence,
        qwen_overlay=qwen_overlay,
        deepseek_overlay=deepseek_overlay,
        agreement_score=round(agreement_score, 2),
        agreement_level=agreement_level,
        qwen_tone=qwen_tone,
        deepseek_tone=deepseek_tone,
        divergences=divergences,
        evidence_gaps=evidence_gaps,
        human_review_required=human_review,
    )


def load_comparison_from_sample(
    evidence: EquityEvidence,
    qwen_overlay: QualitativeOverlay,
    deepseek_overlay: QualitativeOverlay,
) -> ComparisonResult:
    """Build a ComparisonResult from pre-loaded sample overlays (offline mode)."""
    qwen_tone = classify_tone(qwen_overlay)
    deepseek_tone = classify_tone(deepseek_overlay)
    divergences = detect_divergences(qwen_overlay, deepseek_overlay)
    agreement_score = compute_agreement_score(
        qwen_overlay, deepseek_overlay, divergences, qwen_tone, deepseek_tone
    )
    agreement_level = agreement_level_from_score(agreement_score)
    evidence_gaps = collect_evidence_gaps(qwen_overlay, deepseek_overlay)
    has_major = any(d.severity == "major" for d in divergences)

    return ComparisonResult(
        ticker=evidence.ticker,
        evidence=evidence,
        qwen_overlay=qwen_overlay,
        deepseek_overlay=deepseek_overlay,
        agreement_score=round(agreement_score, 2),
        agreement_level=agreement_level,
        qwen_tone=qwen_tone,
        deepseek_tone=deepseek_tone,
        divergences=divergences,
        evidence_gaps=evidence_gaps,
        human_review_required=(
            agreement_level == AgreementLevel.LOW or has_major
        ),
    )

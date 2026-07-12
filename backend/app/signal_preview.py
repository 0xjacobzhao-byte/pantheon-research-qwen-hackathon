"""Read-only, offline Telegram-style signal brief preview.

This module demonstrates the *shape* of Pantheon Research's signal delivery
layer without sending anything or calling any external service. It builds a
compact "signal brief" from the same dual-model comparison the rest of the
public demo uses, and formats it as a Telegram-style message preview.

By construction:

  * **No real Telegram call.** No bot token, chat id, or network request is
    ever used. ``message_preview`` is a plain string rendered in the frontend.
  * **No credentials.** This module reads only bundled sample overlays via the
    same helpers ``data_quality.py`` and ``judge_demo.py`` use.
  * **Never an automatic trade.** ``delivery_state`` is always one of
    ``RESEARCH_ONLY`` or ``HUMAN_REVIEW_REQUIRED`` — there is no "auto-execute"
    state in this model.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List

from .comparison import build_comparison
from .evidence_pack import build_evidence_pack
from .models import ComparisonResult
from .qwen_overlay import _load_sample_overlay as _load_qwen_sample
from .deepseek_overlay import _load_sample_overlay as _load_deepseek_sample
from .sample_loader import load_evidence

DISCLAIMER = "This is a research signal preview, not an automatic trade."


def _major_divergences(comparison: ComparisonResult) -> List[Dict[str, str]]:
    return [
        {"field": d.field, "severity": d.severity}
        for d in comparison.divergences
        if d.severity == "major"
    ]


def _delivery_state(comparison: ComparisonResult) -> str:
    """Every state routes to a human — never an auto-execute path."""
    return "HUMAN_REVIEW_REQUIRED" if comparison.human_review_required else "RESEARCH_ONLY"


def _format_message_preview(comparison: ComparisonResult, evidence_hash: str) -> str:
    """Render a Telegram-style plain-text message. No Markdown parse_mode risk."""
    ev = comparison.evidence
    major = _major_divergences(comparison)
    delivery_state = _delivery_state(comparison)
    agreement = (
        f"{comparison.agreement_score:.2f}"
        if comparison.agreement_score is not None
        else "N/A"
    )

    lines = [
        f"📊 Pantheon Research — Signal Brief ({ev.ticker})",
        f"{ev.company_name} · {ev.exchange}",
        "",
        f"Source: Qwen (Alibaba DashScope) + DeepSeek comparison",
        f"Agreement: {comparison.agreement_level.value} ({agreement})",
        f"Qwen tone: {comparison.qwen_tone.value} · DeepSeek tone: {comparison.deepseek_tone.value}",
    ]
    if major:
        lines.append(f"⚠️ Major divergences: {', '.join(d['field'] for d in major)}")
    else:
        lines.append("No major divergences.")
    if comparison.evidence_gaps:
        lines.append(f"Evidence gaps: {len(comparison.evidence_gaps)} noted")
    lines.append(f"Evidence hash: {evidence_hash}")
    lines.append("")
    lines.append(f"Status: {delivery_state}")
    lines.append(f"⚠️ {DISCLAIMER}")
    return "\n".join(lines)


def get_signal_preview(ticker: str) -> Dict[str, Any]:
    """Build a mock, offline signal brief for one ticker (no external calls)."""
    evidence = load_evidence(ticker)
    pack = build_evidence_pack(evidence)
    qwen = _load_qwen_sample(ticker)
    deepseek = _load_deepseek_sample(ticker)
    comparison = build_comparison(
        evidence, qwen, deepseek, evidence_hash=pack.provenance.evidence_hash
    )
    evidence_hash = pack.provenance.evidence_hash
    delivery_state = _delivery_state(comparison)

    return {
        "schema_version": "signal-preview-1.0",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "ticker": comparison.ticker,
        "company_name": evidence.company_name,
        "source": "Qwen + DeepSeek comparison",
        "evidence_hash": evidence_hash,
        "agreement_score": comparison.agreement_score,
        "agreement_level": comparison.agreement_level.value,
        "qwen_tone": comparison.qwen_tone.value,
        "deepseek_tone": comparison.deepseek_tone.value,
        "major_divergences": _major_divergences(comparison),
        "evidence_gaps": comparison.evidence_gaps,
        "human_review_required": comparison.human_review_required,
        "human_review_reason": comparison.human_review_reason,
        "delivery_state": delivery_state,
        "message_preview": _format_message_preview(comparison, evidence_hash),
        "disclaimer": DISCLAIMER,
        "channel": "Telegram (mock preview — no message sent)",
        "real_telegram_call": False,
        "credentials_used": False,
        "external_network_call": False,
    }

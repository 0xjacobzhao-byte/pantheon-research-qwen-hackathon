"""Unified judge demo aggregator for the Qwen Cloud Hackathon.

A single, read-only, secret-free endpoint that stitches together everything a
judge needs to evaluate this submission in one request. It aggregates
*existing* public-demo surfaces — project metadata, the Alibaba Cloud proof
state, Qwen/DeepSeek configuration, a provenance-committed evidence pack, both
overlay statuses, the dual-model comparison, the data-quality and provider-health
snapshots, the validation timeline, production coverage, and the safe/non-claims
ledger.

By construction it is offline and honest:

  * **No external calls.** Overlays are read from bundled samples via the same
    helpers the data-quality panel uses, so the aggregate is identical whether
    or not credentials are present — it never dials the model or the database.
  * **No secrets.** Credential state is reported as booleans only; no key,
    token, or connection string is ever returned.
  * **Single source of truth.** Coverage numbers and links are read from the
    bundled ``data/judge_proof_bundle.json`` rather than re-typed here.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from .alibaba_cloud_proof import get_alibaba_proof, get_qwen_config, provider_snapshot
from .comparison import build_comparison
from .data_quality import get_data_quality_report
from .evidence_pack import build_evidence_pack
from .models import ProjectInfo, QualitativeOverlay
from .provider_health import get_provider_health
from .qwen_overlay import _load_sample_overlay as _load_qwen_sample
from .deepseek_overlay import _load_sample_overlay as _load_deepseek_sample
from .sample_loader import DATA_DIR, list_available_tickers, load_evidence
from .validation_timeline import get_validation_timeline

# NVDA is the featured ticker: its bundled sample deliberately shows LOW
# agreement and a human-review flag, which best demonstrates the fail-closed,
# disagreement-surfacing behaviour. Falls back to MA if NVDA is unavailable.
_PREFERRED_TICKER = "NVDA"
_FALLBACK_TICKER = "MA"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _pick_featured_ticker() -> str:
    available = list_available_tickers()
    if _PREFERRED_TICKER in available:
        return _PREFERRED_TICKER
    if _FALLBACK_TICKER in available:
        return _FALLBACK_TICKER
    return available[0] if available else _PREFERRED_TICKER


def _overlay_status_view(overlay: QualitativeOverlay) -> Dict[str, Any]:
    """Compact, judge-readable status view of one overlay (no full body dump)."""
    confidence: Optional[float] = None
    if overlay.assessment is not None:
        confidence = overlay.assessment.confidence
    return {
        "provider": overlay.provider.value,
        "model": overlay.model,
        "status": overlay.status.value,
        "usable": bool(overlay.takeaway) or overlay.assessment is not None,
        "confidence": confidence,
        "takeaway": overlay.takeaway,
        "error_message": overlay.error_message,
    }


def _proof_state(proof) -> Dict[str, Any]:
    """Compact subset of the Alibaba proof: link + state, not the full document."""
    return {
        "cloud_provider": proof.cloud_provider,
        "host_runtime": proof.host_runtime,
        "alibaba_hosted": proof.alibaba_hosted,
        "region": proof.region,
        "qwen_provider": proof.qwen_provider,
        "qwen_configured": proof.qwen_configured,
        "demo_mode": proof.demo_mode,
        "proof_endpoint": "/api/proof/alibaba-cloud",
        "live_proof_url": proof.judge_evidence.get("live_proof_url"),
        "database": {
            "role": proof.database.role,
            "mirror_state": proof.database.mirror_state,
            "connected": proof.database.connected,
            "production_data_migrated": proof.database.production_data_migrated,
            "full_production_clone_verified": proof.database.full_production_clone_verified,
        },
        "attestation": {
            "proof_endpoint_external_calls": False,
            "credential_values_returned": False,
        },
    }


def _proof_bundle() -> Dict[str, Any]:
    """Read the bundled judge proof bundle (links + coverage), offline."""
    path = DATA_DIR / "judge_proof_bundle.json"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get_full_demo() -> Dict[str, Any]:
    """Aggregate every public-demo surface into one read-only judge payload.

    Fully offline: overlays come from bundled samples, so no external API call
    is made regardless of ``DEMO_MODE`` or credential state.
    """
    demo_mode = os.environ.get("DEMO_MODE", "offline")
    ticker = _pick_featured_ticker()

    evidence = load_evidence(ticker)
    pack = build_evidence_pack(evidence)
    qwen = _load_qwen_sample(ticker)
    deepseek = _load_deepseek_sample(ticker)
    comparison = build_comparison(
        evidence, qwen, deepseek, evidence_hash=pack.provenance.evidence_hash
    )

    proof = get_alibaba_proof()
    qwen_config = get_qwen_config()
    providers = provider_snapshot()
    bundle = _proof_bundle()

    project = ProjectInfo(demo_mode=demo_mode)

    return {
        "schema_version": "judge-full-demo-1.0",
        "generated_at_utc": _utc_now_iso(),
        "demo_mode": demo_mode,
        "one_line": (
            "One read-only, secret-free request aggregating the entire public "
            "judge demo: project, Alibaba proof, Qwen/DeepSeek config, evidence "
            "pack, both overlay statuses, dual-model comparison, data quality, "
            "provider health, validation timeline, coverage, and the claims ledger."
        ),
        "project": {
            "name": project.name,
            "description": project.description,
            "author": project.author,
            "github": project.github,
            "license": project.license,
            "version": project.version,
            "architecture_layers": project.architecture_layers,
            "safety_statement": project.safety_statement,
        },
        "submission_links": {
            "live_product": bundle.get("live_product", "https://pantheon-research.com"),
            "alibaba_deployment": bundle.get("alibaba_deployment", "http://8.222.191.152"),
            "deployment_proof_endpoint": bundle.get("deployment_proof_endpoint"),
            "public_repo": project.github,
            "private_repo": (bundle.get("private_repo") or {}).get("url"),
        },
        "alibaba_proof": _proof_state(proof),
        "qwen_config": {
            "provider": qwen_config.provider,
            "base_url": qwen_config.base_url,
            "model": qwen_config.model,
            "integration_type": qwen_config.integration_type,
            "prompt_version": qwen_config.prompt_version,
            "output_schema_version": qwen_config.output_schema_version,
            "credential_configured": qwen_config.credential_configured,
            "demo_mode": qwen_config.demo_mode,
        },
        "deepseek_config": {
            "provider": "DeepSeek API (OpenAI-compatible)",
            "model": providers["deepseek"]["model"],
            "credential_configured": providers["deepseek"]["configured"],
            "role": "comparison baseline",
        },
        "featured_ticker": ticker,
        "evidence_pack": pack.model_dump(),
        "qwen_overlay_status": _overlay_status_view(qwen),
        "deepseek_overlay_status": _overlay_status_view(deepseek),
        "comparison": {
            "ticker": comparison.ticker,
            "data_state": comparison.data_state.value,
            "agreement_score": comparison.agreement_score,
            "agreement_level": comparison.agreement_level.value,
            "qwen_tone": comparison.qwen_tone.value,
            "deepseek_tone": comparison.deepseek_tone.value,
            "divergences": [d.model_dump() for d in comparison.divergences],
            "evidence_gaps": comparison.evidence_gaps,
            "human_review_required": comparison.human_review_required,
            "human_review_reason": comparison.human_review_reason,
        },
        "data_quality": get_data_quality_report(),
        "provider_health": get_provider_health(),
        "validation_timeline": get_validation_timeline(),
        "production_coverage": {
            "qwen_comparison_capable": bundle.get("qwen_comparison_capable_coverage"),
            "qwen_healthy_comparisons": bundle.get("qwen_healthy_comparisons"),
            "qwen_market_split": bundle.get("qwen_market_split"),
            "deepseek_baseline_universe": bundle.get("deepseek_baseline_universe"),
            "note": (
                "Production coverage is reported from the bundled proof bundle; "
                "the public offline demo ships two fully worked sample tickers "
                "(MA, NVDA). Full-universe parity is intentionally private."
            ),
        },
        "safe_claims": list(proof.safe_claims),
        "non_claims": list(proof.non_claims),
        "verification": {
            "one_command_smoke": "./scripts/judge_smoke.sh",
            "live_alibaba_proof": "curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq",
            "evidence_doc": "docs/judge_evidence.md",
            "safe_claims_doc": "docs/safe_claims.md",
        },
        "note": (
            "Read-only aggregator. No external calls, no secrets. Overlays are "
            "read from bundled samples, so this payload is identical with or "
            "without credentials — offline by construction."
        ),
    }

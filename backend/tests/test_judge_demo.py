"""Tests for the unified judge demo aggregator (/api/judge/full-demo).

The aggregator must be complete (every advertised surface present), offline
(no external call, identical with or without credentials), and secret-free.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.judge_demo import get_full_demo

TOP_LEVEL_KEYS = {
    "schema_version",
    "project",
    "submission_links",
    "alibaba_proof",
    "qwen_config",
    "deepseek_config",
    "featured_ticker",
    "evidence_pack",
    "qwen_overlay_status",
    "deepseek_overlay_status",
    "comparison",
    "signal_preview",
    "data_quality",
    "provider_health",
    "validation_timeline",
    "production_coverage",
    "safe_claims",
    "non_claims",
    "verification",
}


def test_full_demo_has_all_sections():
    demo = get_full_demo()
    assert TOP_LEVEL_KEYS <= set(demo), f"missing: {TOP_LEVEL_KEYS - set(demo)}"
    assert demo["schema_version"] == "judge-full-demo-1.0"
    assert demo["generated_at_utc"]


def test_featured_ticker_carries_a_real_comparison():
    demo = get_full_demo()
    ticker = demo["featured_ticker"]
    assert ticker in ("NVDA", "MA")
    comparison = demo["comparison"]
    assert comparison["ticker"] == ticker
    # A real, computed comparison state — never a hollow SUCCESS.
    assert comparison["data_state"] in (
        "LIVE_DUAL", "OFFLINE_SAMPLE", "MIXED", "PARTIAL", "BLOCKED",
    )
    assert comparison["agreement_level"] in ("HIGH", "MEDIUM", "LOW", "NOT_COMPARABLE")


def test_evidence_pack_is_provenance_committed():
    demo = get_full_demo()
    provenance = demo["evidence_pack"]["provenance"]
    assert provenance["evidence_hash"].startswith("sha256:")


def test_both_overlay_statuses_present():
    demo = get_full_demo()
    assert demo["qwen_overlay_status"]["provider"] == "qwen"
    assert demo["deepseek_overlay_status"]["provider"] == "deepseek"
    for side in ("qwen_overlay_status", "deepseek_overlay_status"):
        assert demo[side]["status"], f"{side} missing status"


def test_signal_preview_is_research_only_and_offline():
    demo = get_full_demo()
    preview = demo["signal_preview"]
    assert preview["ticker"] == demo["featured_ticker"]
    assert preview["delivery_state"] in ("RESEARCH_ONLY", "HUMAN_REVIEW_REQUIRED")
    assert preview["real_telegram_call"] is False
    assert preview["credentials_used"] is False
    assert preview["external_network_call"] is False
    assert "not an automatic trade" in preview["disclaimer"].lower()
    assert preview["evidence_hash"].startswith("sha256:")


def test_claims_ledger_is_populated():
    demo = get_full_demo()
    assert len(demo["safe_claims"]) >= 3
    assert len(demo["non_claims"]) >= 3
    # The core non-claims must be present.
    non_claims_blob = " ".join(demo["non_claims"]).lower()
    assert "autonomous trading" in non_claims_blob
    assert "clone" in non_claims_blob


def test_database_claim_is_precise():
    demo = get_full_demo()
    db = demo["alibaba_proof"]["database"]
    assert db["production_data_migrated"] is False
    assert db["full_production_clone_verified"] is False
    assert db["mirror_state"] == "partial_selected_mirror"


def test_offline_by_construction_no_secret_state_leaks():
    demo = get_full_demo()
    # Credential state is booleans only.
    assert demo["qwen_config"]["credential_configured"] in (True, False)
    assert demo["alibaba_proof"]["attestation"]["credential_values_returned"] is False
    assert demo["alibaba_proof"]["attestation"]["proof_endpoint_external_calls"] is False


def test_full_demo_contains_no_secrets():
    blob = json.dumps(get_full_demo()).lower()
    for needle in ("sk-", "postgresql://", "password", "bearer ", "x-admin-token"):
        assert needle not in blob, f"leaked secret-like token: {needle}"

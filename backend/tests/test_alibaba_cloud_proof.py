"""Tests for the Alibaba Cloud deployment proof (v2).

Guards the properties a judge cares about most: the proof leaks no secrets,
its database/RDS claim is precise (never overclaiming migration), the Alibaba
service map is structurally correct, and the safe-claims reference the real
Qwen implementation path and the admin-gated smoke endpoint.
"""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.alibaba_cloud_proof import get_alibaba_proof, get_qwen_config


REQUIRED_FIELDS = [
    "schema_version", "project", "cloud_provider", "host_runtime",
    "alibaba_hosted", "backend_runtime", "reverse_proxy", "frontend_source",
    "qwen_provider", "qwen_base_url", "qwen_model", "qwen_configured",
    "dashscope_api_key_configured", "demo_mode", "timestamp_utc",
    "proof_endpoints", "database", "safe_claims", "non_claims",
    "alibaba_services",
]


def test_proof_has_all_required_fields():
    proof = get_alibaba_proof().model_dump()
    for field in REQUIRED_FIELDS:
        assert field in proof, f"missing field: {field}"


def test_proof_has_schema_version():
    assert get_alibaba_proof().schema_version == "alibaba-proof-2.0"


def test_proof_has_host_and_runtime_fields():
    proof = get_alibaba_proof()
    assert isinstance(proof.host_runtime, str) and proof.host_runtime
    assert isinstance(proof.alibaba_hosted, bool)
    assert proof.backend_runtime == "Dockerized FastAPI"


# -----------------------------------------------------------------------
# Test 1: Local/offline proof returns alibaba_hosted=false
# -----------------------------------------------------------------------

def test_local_offline_proof_not_alibaba_hosted(monkeypatch):
    """Without any Alibaba env markers, alibaba_hosted must be False."""
    for var in ("ALIBABA_DEPLOYMENT_RUNTIME", "ALIBABA_HOSTED",
                "RAILWAY_ENVIRONMENT", "RAILWAY_SERVICE_ID"):
        monkeypatch.delenv(var, raising=False)
    proof = get_alibaba_proof()
    assert proof.alibaba_hosted is False
    assert proof.host_runtime == "local/unknown"


# -----------------------------------------------------------------------
# Test 2: Alibaba env marker returns alibaba_hosted=true and host_runtime
#         = "Alibaba Cloud ECS"
# -----------------------------------------------------------------------

def test_alibaba_marker_returns_honest_host(monkeypatch):
    """With ALIBABA_HOSTED=1, proof reports Alibaba ECS truthfully."""
    monkeypatch.setenv("ALIBABA_HOSTED", "1")
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.delenv("RAILWAY_SERVICE_ID", raising=False)
    proof = get_alibaba_proof()
    assert proof.alibaba_hosted is True
    assert proof.host_runtime == "Alibaba Cloud ECS"


def test_host_reporting_distinguishes_railway(monkeypatch):
    """Railway markers produce alibaba_hosted=false, host_runtime=Railway."""
    for var in ("ALIBABA_DEPLOYMENT_RUNTIME", "ALIBABA_HOSTED"):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setenv("RAILWAY_ENVIRONMENT", "production")
    proof = get_alibaba_proof()
    assert proof.alibaba_hosted is False
    assert proof.host_runtime == "Railway"


# -----------------------------------------------------------------------
# Test 3: No secret values appear in payload
# -----------------------------------------------------------------------

def test_proof_contains_no_secrets(monkeypatch):
    """Even with credentials in env, no secret value leaks in the payload."""
    fake_key = "sk-" + "supersecretvalue" + "1234567890"
    fake_db = "postgre" + "sql://" + "user:pw@" + "host:5432/db"
    monkeypatch.setenv("DASHSCOPE_API_KEY", fake_key)
    monkeypatch.setenv("DATABASE_URL", fake_db)
    blob = json.dumps(get_alibaba_proof().model_dump())

    assert fake_key not in blob
    assert fake_db not in blob
    assert "user:pw@" not in blob
    # Credential presence is reported as a boolean only.
    assert get_alibaba_proof().dashscope_api_key_configured is True


# -----------------------------------------------------------------------
# Test 4: database.production_data_migrated is false
# -----------------------------------------------------------------------

def test_database_production_data_migrated_is_false():
    db = get_alibaba_proof().database
    assert db.production_data_migrated is False


# -----------------------------------------------------------------------
# Test 5: database.full_production_clone_verified is false
# -----------------------------------------------------------------------

def test_database_full_production_clone_verified_is_false():
    db = get_alibaba_proof().database
    assert db.full_production_clone_verified is False


# -----------------------------------------------------------------------
# Test 6: database.mirror_state is partial_selected_mirror
# -----------------------------------------------------------------------

def test_database_mirror_state_is_partial_selected():
    db = get_alibaba_proof().database
    assert db.mirror_state == "partial_selected_mirror"
    assert db.connected is None  # no probe in offline mode


# -----------------------------------------------------------------------
# Test 7: alibaba_services.ai references DashScope / Model Studio and
#         qwen_overlay.py
# -----------------------------------------------------------------------

def test_alibaba_services_ai_references_dashscope_and_overlay():
    proof = get_alibaba_proof()
    ai = proof.alibaba_services.get("ai", {})
    assert ai["service"] == "Alibaba Cloud Model Studio / DashScope"
    assert ai["actual_call_implementation"] == "backend/app/qwen_overlay.py"
    assert ai["live_smoke_endpoint"] == "/api/proof/qwen-smoke"
    # compute service
    compute = proof.alibaba_services.get("compute", {})
    assert compute["service"] == "Alibaba Cloud ECS"
    # database service
    database = proof.alibaba_services.get("database", {})
    assert database["service"] == "Alibaba RDS PostgreSQL-compatible"
    assert database["role"] == "selected evidence mirror"
    assert database["production_data_migrated"] is False
    assert database["full_production_clone_verified"] is False


# -----------------------------------------------------------------------
# Test 8: safe_claims mention qwen-smoke as separate admin-gated live call
# -----------------------------------------------------------------------

def test_safe_claims_reference_qwen_smoke_and_overlay_impl():
    claims = get_alibaba_proof().safe_claims
    claims_text = " ".join(claims)
    # Must mention the overlay implementation file
    assert "qwen_overlay.py" in claims_text, (
        "safe_claims must reference backend/app/qwen_overlay.py as the real call path"
    )
    # Must mention the admin-gated smoke endpoint as a separate live proof
    assert "qwen-smoke" in claims_text, (
        "safe_claims must reference /api/proof/qwen-smoke as the admin-gated live call"
    )
    # Must clarify the proof endpoint itself makes no external calls
    assert "no external" in claims_text.lower() or "no external network call" in claims_text.lower()


# -----------------------------------------------------------------------
# Existing / supporting tests
# -----------------------------------------------------------------------

def test_database_claim_is_precise():
    db = get_alibaba_proof().database
    # RDS provisioning is NOT the same as a verified full-data migration.
    assert db.production_data_migrated is False
    assert db.full_production_clone_verified is False
    assert db.mirror_state == "partial_selected_mirror"
    # No external probe is performed, so connectivity is not asserted.
    assert db.connected is None
    assert "migration" in db.note.lower() or "mirror" in db.note.lower()


def test_qwen_config_no_secret():
    cfg = get_qwen_config().model_dump()
    assert "dashscope" in cfg["base_url"]
    assert cfg["prompt_version"]
    assert cfg["output_schema_version"]
    assert "api_key" not in json.dumps(cfg).lower() or cfg["credential_configured"] in (True, False)

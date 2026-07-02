"""Alibaba Cloud deployment proof (v2) for the Qwen Cloud Hackathon.

Public-safe and honest by construction:

  * No secrets. Credentials are reported as booleans only; no key, token, or
    connection string is ever returned.
  * No external calls. This endpoint never dials the database or the model —
    so it never *claims* live connectivity it did not verify.
  * Honest host. ``alibaba_hosted`` is detected from the environment. The same
    container image runs on Railway (``alibaba_hosted=false``) and on an
    Alibaba Cloud ECS box (``alibaba_hosted=true``). The Qwen *AI provider* is
    always Alibaba Cloud DashScope, on every host.
  * Precise database claim. RDS *provisioning* is kept distinct from full
    production-data *migration*, which is never asserted here.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict

from .deepseek_overlay import DEEPSEEK_MODEL
from .models import AlibabaCloudProof, DatabaseProof, QwenConfig
from .qwen_overlay import (
    OUTPUT_SCHEMA_VERSION,
    PROMPT_VERSION,
    QWEN_BASE_URL,
    QWEN_MODEL,
    _check_credential,
)

_DEFAULT_REGION = "ap-southeast-1"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _detect_host_runtime() -> Dict[str, Any]:
    """Honestly report where this process actually runs (secret-free).

    Detection order:
      1. Explicit Alibaba marker (set only in the Alibaba container env).
      2. Railway's auto-injected environment markers.
      3. Otherwise local / unknown.
    """
    alibaba_marker = os.environ.get("ALIBABA_DEPLOYMENT_RUNTIME") or os.environ.get(
        "ALIBABA_HOSTED"
    )
    railway_marker = os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get(
        "RAILWAY_SERVICE_ID"
    )
    if alibaba_marker:
        return {
            "host_runtime": os.environ.get(
                "ALIBABA_DEPLOYMENT_RUNTIME", "Alibaba Cloud ECS"
            )
            or "Alibaba Cloud ECS",
            "alibaba_hosted": True,
        }
    if railway_marker:
        return {"host_runtime": "Railway", "alibaba_hosted": False}
    return {"host_runtime": "local/unknown", "alibaba_hosted": False}


def _git_sha() -> str:
    for var in ("RAILWAY_GIT_COMMIT_SHA", "GIT_SHA", "GIT_COMMIT", "SOURCE_COMMIT"):
        val = os.environ.get(var)
        if val:
            return val[:12]
    return "unknown"


def _database_proof() -> DatabaseProof:
    """Precise, non-overclaiming database representation.

    ``configured`` reflects whether ``DATABASE_URL`` is set in *this* runtime.
    ``connected`` is ``None`` because this endpoint performs no external call —
    we do not assert connectivity we did not test. ``production_data_migrated``
    is ``False``: RDS provisioning is not the same as a verified full-data
    migration, and this repo does not carry the row-count / read-path proof
    required to claim it.
    """
    configured = bool(os.environ.get("DATABASE_URL"))
    return DatabaseProof(
        provider="PostgreSQL (Alibaba RDS-compatible target engine)",
        configured=configured,
        connected=None,
        role=(
            "Metadata / evidence store in production; the public offline demo "
            "runs against bundled samples and needs no database."
        ),
        production_data_migrated=False,
        note=(
            "This endpoint makes no external calls, so live DB connectivity is "
            "not asserted (connected=null). Alibaba RDS provisioning is distinct "
            "from full production-data migration; migration is not claimed here "
            "without row-count and API read-path verification."
        ),
    )


def get_alibaba_proof() -> AlibabaCloudProof:
    """Return the v2 Alibaba Cloud deployment proof (no secrets)."""
    host = _detect_host_runtime()
    dashscope_configured = _check_credential()
    return AlibabaCloudProof(
        host_runtime=host["host_runtime"],
        alibaba_hosted=host["alibaba_hosted"],
        qwen_base_url=QWEN_BASE_URL,
        qwen_model=QWEN_MODEL,
        qwen_configured=dashscope_configured,
        dashscope_api_key_configured=dashscope_configured,
        demo_mode=os.environ.get("DEMO_MODE", "offline"),
        region=os.environ.get("ALIBABA_REGION", _DEFAULT_REGION),
        git_sha=_git_sha(),
        timestamp_utc=_utc_now_iso(),
        proof_endpoints={
            "deployment_proof": "/api/proof/alibaba-cloud",
            "deployment_proof_alias": "/api/alibaba/proof",
            "qwen_config": "/api/alibaba/qwen-config",
            "data_quality": "/api/data-quality",
            "qwen_live_smoke": (
                "/api/proof/qwen-smoke (admin-gated; served by the production "
                "backend on the live Alibaba ECS host, not by this offline demo)"
            ),
        },
        database=_database_proof(),
        safe_claims=[
            "Qwen is invoked live via Alibaba Cloud DashScope (Model Studio) "
            "when DEMO_MODE=live and DASHSCOPE_API_KEY is set.",
            "The same container image runs on Railway and on an Alibaba Cloud "
            "ECS host; the compute host is reported honestly via alibaba_hosted.",
            "No secrets are returned; credentials are reported as booleans only "
            "and no external network call is made by this endpoint.",
            "Offline demo mode uses bundled sample overlays and requires no "
            "credentials.",
            "LLM outputs are human-reviewed research signals; models never "
            "execute trades.",
        ],
        non_claims=[
            "This endpoint does NOT assert that production data has been "
            "migrated into Alibaba RDS.",
            "This endpoint does NOT prove live database connectivity "
            "(connected=null; no probe is performed).",
            "This public repository is a sanitized vertical slice, not the full "
            "private production system.",
            "No alpha/return performance is claimed; forward validation is "
            "required before any performance claim.",
        ],
    )


def get_qwen_config() -> QwenConfig:
    """Return Qwen / DashScope configuration (no secrets)."""
    return QwenConfig(
        base_url=QWEN_BASE_URL,
        model=QWEN_MODEL,
        prompt_version=PROMPT_VERSION,
        output_schema_version=OUTPUT_SCHEMA_VERSION,
        credential_configured=_check_credential(),
        demo_mode=os.environ.get("DEMO_MODE", "offline"),
    )


# Referenced by the data-quality panel so both providers' configured-state and
# model ids come from one place.
def provider_snapshot() -> Dict[str, Any]:
    """Small, secret-free provider snapshot for the data-quality panel."""
    return {
        "qwen": {
            "model": QWEN_MODEL,
            "base_url": QWEN_BASE_URL,
            "configured": _check_credential(),
        },
        "deepseek": {
            "model": DEEPSEEK_MODEL,
            "configured": bool(os.environ.get("DEEPSEEK_API_KEY")),
        },
    }

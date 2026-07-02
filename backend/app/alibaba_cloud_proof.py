"""Alibaba Cloud deployment proof for Qwen Cloud Hackathon submission.

This module demonstrates Alibaba Cloud usage safely — no secrets are
hardcoded. All configuration is loaded from environment variables.
"""

from __future__ import annotations

import os
import platform
import socket
from datetime import datetime, timezone

from .models import AlibabaCloudProof, QwenConfig
from .qwen_overlay import QWEN_BASE_URL, QWEN_MODEL, _check_credential


def get_alibaba_proof() -> AlibabaCloudProof:
    """Return Alibaba Cloud deployment proof (no secrets)."""
    return AlibabaCloudProof(
        cloud_provider="Alibaba Cloud",
        backend_runtime="Dockerized FastAPI",
        reverse_proxy="Nginx",
        database_service="Alibaba RDS PostgreSQL-compatible database",
        qwen_provider="Alibaba DashScope / Qwen Max",
        details={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "host": socket.gethostname(),
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "demo_mode": os.environ.get("DEMO_MODE", "offline"),
            "alibaba_cloud_services": [
                {
                    "service": "DashScope (Qwen Cloud)",
                    "endpoint": QWEN_BASE_URL,
                    "usage": "LLM qualitative equity overlay",
                },
                {
                    "service": "Simple Application Server (SAS)",
                    "usage": "Backend Docker hosting",
                },
                {
                    "service": "ApsaraDB RDS for PostgreSQL",
                    "usage": "Metadata and evidence storage (production)",
                },
                {
                    "service": "Nginx",
                    "usage": "Reverse proxy / API gateway",
                },
            ],
        },
    )


def get_qwen_config() -> QwenConfig:
    """Return Qwen / DashScope configuration (no secrets)."""
    return QwenConfig(
        provider="Alibaba DashScope / Qwen Max",
        base_url=QWEN_BASE_URL,
        model=QWEN_MODEL,
        integration_type="OpenAI-compatible chat completions",
        credential_configured=_check_credential(),
        demo_mode=os.environ.get("DEMO_MODE", "offline"),
    )

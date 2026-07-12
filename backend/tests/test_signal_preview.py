"""Tests for the mock, offline Telegram-style signal preview.

The signal preview must never claim a real send, never require credentials,
and must always route to a human-facing delivery state — there is no
auto-execute path.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.signal_preview import DISCLAIMER, get_signal_preview

REQUIRED_FIELDS = [
    "schema_version", "ticker", "company_name", "source", "evidence_hash",
    "agreement_score", "agreement_level", "qwen_tone", "deepseek_tone",
    "major_divergences", "evidence_gaps", "human_review_required",
    "delivery_state", "message_preview", "disclaimer", "channel",
    "real_telegram_call", "credentials_used", "external_network_call",
]


@pytest.mark.parametrize("ticker", ["MA", "NVDA"])
def test_signal_preview_has_all_fields(ticker):
    preview = get_signal_preview(ticker)
    for field in REQUIRED_FIELDS:
        assert field in preview, f"missing field: {field}"


@pytest.mark.parametrize("ticker", ["MA", "NVDA"])
def test_signal_preview_is_offline_and_credential_free(ticker):
    preview = get_signal_preview(ticker)
    assert preview["real_telegram_call"] is False
    assert preview["credentials_used"] is False
    assert preview["external_network_call"] is False


@pytest.mark.parametrize("ticker", ["MA", "NVDA"])
def test_delivery_state_never_auto_executes(ticker):
    preview = get_signal_preview(ticker)
    assert preview["delivery_state"] in ("RESEARCH_ONLY", "HUMAN_REVIEW_REQUIRED")
    # human_review_required flag and delivery_state must agree.
    if preview["human_review_required"]:
        assert preview["delivery_state"] == "HUMAN_REVIEW_REQUIRED"
    else:
        assert preview["delivery_state"] == "RESEARCH_ONLY"


def test_disclaimer_is_explicit():
    preview = get_signal_preview("NVDA")
    assert preview["disclaimer"] == DISCLAIMER
    assert "not an automatic trade" in preview["disclaimer"].lower()
    assert preview["disclaimer"] in preview["message_preview"]


def test_message_preview_contains_evidence_hash_and_ticker():
    preview = get_signal_preview("NVDA")
    assert preview["ticker"] in preview["message_preview"]
    assert preview["evidence_hash"] in preview["message_preview"]


def test_unknown_ticker_raises_file_not_found():
    with pytest.raises(FileNotFoundError):
        get_signal_preview("ZZZZ")


def test_no_secrets_in_signal_preview():
    import json
    preview = get_signal_preview("NVDA")
    blob = json.dumps(preview).lower()
    for needle in ("sk-", "bot token", "chat_id", "password", "bearer "):
        assert needle not in blob

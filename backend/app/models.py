"""Pydantic models for equity evidence, LLM qualitative overlay, and dual-provider comparison."""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class LLMProvider(str, Enum):
    """Supported LLM providers."""

    QWEN = "qwen"
    DEEPSEEK = "deepseek"


class OverlayStatus(str, Enum):
    """Status of an LLM overlay response."""

    SUCCESS = "SUCCESS"
    BLOCKED_BY_MISSING_CREDENTIAL = "BLOCKED_BY_MISSING_CREDENTIAL"
    API_ERROR = "API_ERROR"
    PARSE_ERROR = "PARSE_ERROR"
    OFFLINE_SAMPLE = "OFFLINE_SAMPLE"


class AgreementLevel(str, Enum):
    """Agreement level between two providers."""

    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Tone(str, Enum):
    """Tone classification for an overlay."""

    POSITIVE = "positive"
    CONSERVATIVE_POSITIVE = "conservative_positive"
    CAUTIOUS = "cautious"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------

class EquityEvidence(BaseModel):
    """Quantitative evidence data for a stock ticker."""

    ticker: str = Field(..., description="Stock ticker, e.g. MA, NVDA")
    company_name: str = Field(..., description="Full company name")
    exchange: str = Field(..., description="Exchange, e.g. NYSE, NASDAQ")
    sector: str = Field(..., description="GICS sector")
    industry: str = Field(..., description="GICS industry")
    market_cap_usd: float = Field(..., description="Market cap in USD")
    pe_ratio: Optional[float] = Field(None, description="P/E ratio (TTM)")
    pb_ratio: Optional[float] = Field(None, description="P/B ratio")
    roic_pct: Optional[float] = Field(None, description="ROIC (%)")
    fcf_ttm_usd: Optional[float] = Field(None, description="FCF TTM (USD)")
    revenue_growth_yoy_pct: Optional[float] = Field(None, description="Revenue growth YoY (%)")
    gross_margin_pct: Optional[float] = Field(None, description="Gross margin (%)")
    net_margin_pct: Optional[float] = Field(None, description="Net margin (%)")
    dividend_yield_pct: Optional[float] = Field(None, description="Dividend yield (%)")
    debt_to_equity: Optional[float] = Field(None, description="Debt-to-equity")
    summary: str = Field(..., description="Business description")


# ---------------------------------------------------------------------------
# Overlay assessment
# ---------------------------------------------------------------------------

COMPARISON_FIELDS = [
    "business_quality",
    "moat",
    "pricing_power",
    "capital_allocation",
    "red_flags",
    "confidence",
    "missing_evidence",
]
"""Standardized comparison fields shared across all providers."""


class OverlayAssessment(BaseModel):
    """Structured assessment fields produced by an LLM overlay."""

    business_quality: str = Field("", description="Assessment of business quality")
    moat: str = Field("", description="Assessment of moat & competitive advantage")
    pricing_power: str = Field("", description="Assessment of pricing power")
    capital_allocation: str = Field("", description="Assessment of management & capital allocation")
    red_flags: str = Field("", description="Identified red flags & risks")
    confidence: float = Field(0.5, description="Model confidence (0–1)")
    missing_evidence: list[str] = Field(default_factory=list, description="Evidence gaps identified by the model")


# ---------------------------------------------------------------------------
# Overlay
# ---------------------------------------------------------------------------

class QualitativeOverlay(BaseModel):
    """Full qualitative overlay output from one LLM provider."""

    provider: LLMProvider = Field(..., description="LLM provider")
    model: str = Field(..., description="Model identifier")
    ticker: str = Field(..., description="Stock ticker")
    status: OverlayStatus = Field(..., description="Response status")
    takeaway: str = Field("", description="One-paragraph LLM takeaway")
    assessment: Optional[OverlayAssessment] = Field(None, description="Structured assessment fields")
    error_message: Optional[str] = Field(None, description="Error if status != SUCCESS")
    latency_ms: Optional[int] = Field(None, description="Response latency (ms)")


# ---------------------------------------------------------------------------
# Divergence
# ---------------------------------------------------------------------------

class Divergence(BaseModel):
    """A single point of divergence between two providers."""

    field: str = Field(..., description="Comparison field name")
    qwen_view: str = Field("", description="Qwen's position")
    deepseek_view: str = Field("", description="DeepSeek's position")
    severity: str = Field("minor", description="minor | moderate | major")


# ---------------------------------------------------------------------------
# Comparison result
# ---------------------------------------------------------------------------

class ComparisonResult(BaseModel):
    """Side-by-side comparison of Qwen and DeepSeek overlays."""

    ticker: str = Field(..., description="Stock ticker")
    evidence: EquityEvidence = Field(..., description="Underlying evidence")
    qwen_overlay: QualitativeOverlay = Field(..., description="Qwen overlay")
    deepseek_overlay: QualitativeOverlay = Field(..., description="DeepSeek overlay")
    agreement_score: float = Field(0.0, description="Agreement score 0–1")
    agreement_level: AgreementLevel = Field(AgreementLevel.MEDIUM, description="HIGH / MEDIUM / LOW")
    qwen_tone: Tone = Field(Tone.NEUTRAL, description="Qwen tone classification")
    deepseek_tone: Tone = Field(Tone.NEUTRAL, description="DeepSeek tone classification")
    divergences: list[Divergence] = Field(default_factory=list, description="Divergences between providers")
    evidence_gaps: list[str] = Field(default_factory=list, description="Combined evidence gaps")
    human_review_required: bool = Field(False, description="Whether human review is needed")


# ---------------------------------------------------------------------------
# Project info
# ---------------------------------------------------------------------------

class ProjectInfo(BaseModel):
    """Project metadata for the /api/project endpoint."""

    name: str = "Pantheon Research — Qwen Cloud Hackathon Demo"
    description: str = (
        "Dual-LLM equity qualitative overlay: Qwen Cloud vs DeepSeek "
        "side-by-side comparison with structured agreement analysis."
    )
    author: str = "Jacob Zhao"
    github: str = "https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon"
    license: str = "Apache-2.0"
    version: str = "1.0.0"
    demo_mode: str = "offline"
    architecture_layers: list[str] = Field(
        default_factory=lambda: ["Strategy", "Information", "Signal", "Trading"]
    )
    safety_statement: str = (
        "Pantheon Research is not an autonomous trading bot. "
        "It is a framework-first, data-governed, human-in-the-loop "
        "AI research operating system."
    )


# ---------------------------------------------------------------------------
# Alibaba Cloud proof
# ---------------------------------------------------------------------------

class AlibabaCloudProof(BaseModel):
    """Alibaba Cloud deployment proof (no secrets)."""

    cloud_provider: str = "Alibaba Cloud"
    backend_runtime: str = "Dockerized FastAPI"
    reverse_proxy: str = "Nginx"
    database_service: str = "Alibaba RDS PostgreSQL-compatible database"
    qwen_provider: str = "Alibaba DashScope / Qwen Max"
    details: dict = Field(default_factory=dict)


class QwenConfig(BaseModel):
    """Qwen / DashScope configuration (no secrets)."""

    provider: str = "Alibaba DashScope / Qwen Max"
    base_url: str = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    model: str = "qwen-plus"
    integration_type: str = "OpenAI-compatible chat completions"
    credential_configured: bool = False
    demo_mode: str = "offline"

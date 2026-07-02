"""FastAPI application — Pantheon Research Qwen Hackathon Demo."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.alibaba_cloud_proof import get_alibaba_proof, get_qwen_config
from app.comparison import run_comparison
from app.models import ProjectInfo
from app.qwen_overlay import run_qwen_overlay
from app.deepseek_overlay import run_deepseek_overlay
from app.sample_loader import list_available_tickers, load_evidence

load_dotenv()

DEMO_MODE = os.environ.get("DEMO_MODE", "offline")

app = FastAPI(
    title="Pantheon Research — Qwen Cloud Hackathon Demo",
    description="Dual-LLM equity qualitative overlay: Qwen Cloud vs DeepSeek",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Root & health
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "project": "Pantheon Research — Qwen Cloud Hackathon Demo",
        "version": "1.0.0",
        "demo_mode": DEMO_MODE,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "demo_mode": DEMO_MODE,
        "tickers": list_available_tickers(),
    }


# ---------------------------------------------------------------------------
# Project info
# ---------------------------------------------------------------------------

@app.get("/api/project")
async def project_info():
    info = ProjectInfo(demo_mode=DEMO_MODE)
    return info


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------

@app.get("/api/evidence/{ticker}")
async def get_evidence(ticker: str):
    try:
        evidence = load_evidence(ticker)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No evidence data for ticker: {ticker}")
    return evidence


# ---------------------------------------------------------------------------
# Overlays
# ---------------------------------------------------------------------------

@app.get("/api/overlay/qwen/{ticker}")
async def overlay_qwen(ticker: str):
    try:
        evidence = load_evidence(ticker)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No evidence data for ticker: {ticker}")
    overlay = await run_qwen_overlay(evidence)
    return overlay


@app.get("/api/overlay/deepseek/{ticker}")
async def overlay_deepseek(ticker: str):
    try:
        evidence = load_evidence(ticker)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No evidence data for ticker: {ticker}")
    overlay = await run_deepseek_overlay(evidence)
    return overlay


# ---------------------------------------------------------------------------
# Comparison
# ---------------------------------------------------------------------------

@app.get("/api/comparison/{ticker}")
async def get_comparison(ticker: str):
    try:
        evidence = load_evidence(ticker)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No evidence data for ticker: {ticker}")
    result = await run_comparison(evidence)
    return result


# ---------------------------------------------------------------------------
# Demo flow
# ---------------------------------------------------------------------------

@app.get("/api/demo-flow")
async def demo_flow():
    return {
        "title": "Pantheon Research — Qwen Cloud Hackathon Demo Flow",
        "steps": [
            {
                "step": 1,
                "title": "Select Ticker",
                "description": "Choose a demo ticker (MA or NVDA) from the ticker panel.",
            },
            {
                "step": 2,
                "title": "Load Evidence Pack",
                "description": "The backend loads structured quantitative evidence from data/*.json.",
            },
            {
                "step": 3,
                "title": "Qwen Cloud Overlay",
                "description": "Qwen Cloud (DashScope API) generates a qualitative overlay with 7 structured assessment fields.",
            },
            {
                "step": 4,
                "title": "DeepSeek Overlay",
                "description": "DeepSeek generates an independent qualitative overlay using the same evidence pack.",
            },
            {
                "step": 5,
                "title": "Model Comparison",
                "description": "The system compares both overlays: agreement score, tone classification, divergences, and evidence gaps.",
            },
            {
                "step": 6,
                "title": "Human Review Gate",
                "description": "If agreement is LOW or major divergences exist, human review is flagged. LLMs never execute trades.",
            },
        ],
        "architecture_layers": ["Strategy", "Information", "Signal", "Trading"],
        "safety_statement": (
            "Pantheon Research is not an autonomous trading bot. "
            "It is a framework-first, data-governed, human-in-the-loop "
            "AI research operating system."
        ),
    }


# ---------------------------------------------------------------------------
# Alibaba Cloud proof
# ---------------------------------------------------------------------------

@app.get("/api/alibaba/proof")
async def alibaba_proof():
    return get_alibaba_proof()


@app.get("/api/alibaba/qwen-config")
async def qwen_config():
    return get_qwen_config()

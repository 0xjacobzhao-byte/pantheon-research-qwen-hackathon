import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import JudgeDemoPage from "./JudgeDemoPage";
import type { JudgeFullDemo } from "../../api";

function fullDemo(overrides: Partial<JudgeFullDemo> = {}): JudgeFullDemo {
  return {
    schema_version: "judge-full-demo-1.0",
    generated_at_utc: "2026-07-12T00:00:00Z",
    demo_mode: "offline",
    one_line: "One read-only, secret-free request aggregating the entire public judge demo.",
    project: {
      name: "Pantheon Research — Qwen Cloud Hackathon Demo",
      description: "Dual-LLM equity qualitative overlay",
      author: "Jacob Zhao",
      github: "https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon",
      license: "Apache-2.0",
      version: "1.0.0",
      architecture_layers: ["Strategy", "Information", "Signal", "Trading"],
      safety_statement: "Pantheon Research is not an autonomous trading bot.",
    },
    submission_links: {
      live_product: "https://pantheon-research.com",
      alibaba_deployment: "http://8.222.191.152",
      deployment_proof_endpoint: "http://8.222.191.152/api/proof/alibaba-cloud",
      public_repo: "https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon",
      private_repo: "https://github.com/0xjacobzhao-byte/Pantheon-Research",
    },
    alibaba_proof: {
      cloud_provider: "Alibaba Cloud",
      host_runtime: "local/unknown",
      alibaba_hosted: false,
      region: "ap-southeast-1",
      qwen_provider: "Alibaba Cloud DashScope (Model Studio)",
      qwen_configured: false,
      demo_mode: "offline",
      proof_endpoint: "/api/proof/alibaba-cloud",
      live_proof_url: "http://8.222.191.152/api/proof/alibaba-cloud",
      database: {
        role: "selected evidence mirror",
        mirror_state: "partial_selected_mirror",
        connected: null,
        production_data_migrated: false,
        full_production_clone_verified: false,
      },
      attestation: {
        proof_endpoint_external_calls: false,
        credential_values_returned: false,
      },
    },
    qwen_config: {
      provider: "Alibaba Cloud DashScope (Model Studio)",
      base_url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      model: "qwen-plus",
      integration_type: "OpenAI-compatible chat completions",
      prompt_version: "v1",
      output_schema_version: "v1",
      credential_configured: false,
      demo_mode: "offline",
    },
    deepseek_config: {
      provider: "DeepSeek API (OpenAI-compatible)",
      model: "deepseek-chat",
      credential_configured: false,
      role: "comparison baseline",
    },
    featured_ticker: "NVDA",
    evidence_pack: {
      evidence: {
        ticker: "NVDA",
        company_name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        sector: "Technology",
        industry: "Semiconductors",
        market_cap_usd: 1000000000,
        pe_ratio: 40,
        pb_ratio: 20,
        roic_pct: 30,
        fcf_ttm_usd: 10000000,
        revenue_growth_yoy_pct: 50,
        gross_margin_pct: 75,
        net_margin_pct: 55,
        dividend_yield_pct: 0.1,
        debt_to_equity: 0.2,
        summary: "Leading AI/GPU compute company.",
      },
      provenance: {
        evidence_schema_version: "v1",
        evidence_hash: "sha256:abc123def456abc123def456abc123def456",
        generated_at_utc: "2026-07-12T00:00:00Z",
        sources: [],
        redaction_note: "sanitized",
      },
    },
    qwen_overlay_status: {
      provider: "qwen",
      model: "qwen-plus",
      status: "OFFLINE_SAMPLE",
      usable: true,
      confidence: 0.7,
      takeaway: "Strong moat in AI compute.",
      error_message: null,
    },
    deepseek_overlay_status: {
      provider: "deepseek",
      model: "deepseek-chat",
      status: "OFFLINE_SAMPLE",
      usable: true,
      confidence: 0.6,
      takeaway: "Pricing power is strong but cyclical.",
      error_message: null,
    },
    comparison: {
      ticker: "NVDA",
      data_state: "OFFLINE_SAMPLE",
      agreement_score: 0.44,
      agreement_level: "LOW",
      qwen_tone: "conservative_positive",
      deepseek_tone: "conservative_positive",
      divergences: [{ field: "pricing_power", qwen_view: "a", deepseek_view: "b", severity: "major" }],
      evidence_gaps: ["No competitive ASIC roadmap analysis"],
      human_review_required: true,
      human_review_reason: "Low agreement between providers.",
    },
    signal_preview: {
      schema_version: "signal-preview-1.0",
      generated_at_utc: "2026-07-12T00:00:00Z",
      ticker: "NVDA",
      company_name: "NVIDIA Corporation",
      source: "Qwen + DeepSeek comparison",
      evidence_hash: "sha256:abc123def456abc123def456abc123def456",
      agreement_score: 0.44,
      agreement_level: "LOW",
      qwen_tone: "conservative_positive",
      deepseek_tone: "conservative_positive",
      major_divergences: [{ field: "pricing_power", severity: "major" }],
      evidence_gaps: ["No competitive ASIC roadmap analysis"],
      human_review_required: true,
      human_review_reason: "Low agreement between providers.",
      delivery_state: "HUMAN_REVIEW_REQUIRED",
      message_preview: "📊 Pantheon Research — Signal Brief (NVDA)\nStatus: HUMAN_REVIEW_REQUIRED",
      disclaimer: "This is a research signal preview, not an automatic trade.",
      channel: "Telegram (mock preview — no message sent)",
      real_telegram_call: false,
      credentials_used: false,
      external_network_call: false,
    },
    data_quality: {
      generated_at_utc: "2026-07-12T00:00:00Z",
      demo_mode: "offline",
      mode: "offline (bundled samples)",
      providers: {
        qwen_configured: false,
        qwen_model: "qwen-plus",
        deepseek_configured: false,
        deepseek_model: "deepseek-chat",
      },
      alibaba_proof_reachable: true,
      sample_evidence_coverage: { tickers: ["MA", "NVDA"], evidence_packs_present: 2, healthy_comparisons: 2 },
      overlay_statuses: [],
      fail_closed_states: [],
      governance_note: "Read-only, public-safe slice.",
    },
    provider_health: {
      schema_version: "provider-health-1.0",
      generated_at_utc: "2026-07-12T00:00:00Z",
      demo_mode: "offline",
      qwen: {
        provider: "Alibaba Cloud DashScope / Model Studio",
        configured: false,
        model: "qwen-plus",
        status: "offline (bundled samples)",
        fail_closed_active: true,
        live_mode_gated: true,
      },
      deepseek: {
        provider: "DeepSeek API (OpenAI-compatible)",
        configured: false,
        model: "deepseek-chat",
        status: "offline (bundled samples)",
        fail_closed_active: true,
        live_mode_gated: true,
      },
      sample_evidence: { present: true, tickers: ["MA", "NVDA"], count: 2 },
      alibaba_proof: { documented: true, endpoint: "/api/proof/alibaba-cloud" },
      offline_mode: { available: true, active: true },
      live_mode: { gated: true, requires: ["DEMO_MODE=live"] },
      secrets_exposed: false,
      fail_closed_active: true,
      note: "No secrets exposed.",
    },
    validation_timeline: {
      schema_version: "validation-timeline-1.0",
      generated_at_utc: "2026-07-12T00:00:00Z",
      stance: "Tracked research signal, not an alpha oracle.",
      stages: [],
      non_claims: ["No alpha or return performance is claimed."],
      illustrative_demo_summary: {
        note: "ILLUSTRATIVE ONLY",
        cohort: "public-demo-illustrative",
        signals_captured: 2,
        evidence_hashed: 2,
        models_recorded: 2,
        awaiting_forward_window: 2,
        matured_and_scored: 0,
        performance_claim: "NONE",
      },
    },
    production_coverage: {
      qwen_comparison_capable: 312,
      qwen_healthy_comparisons: 312,
      qwen_market_split: { US: 117, CN: 69, HK: 103, SG: 23 },
      deepseek_baseline_universe: 1331,
      note: "Production coverage from bundled proof bundle.",
    },
    safe_claims: ["Qwen is called live via Alibaba Cloud DashScope."],
    non_claims: [
      "Alibaba RDS is NOT a full production database clone.",
      "Not claiming autonomous trading or model-generated alpha.",
    ],
    verification: {
      one_command_smoke: "./scripts/judge_smoke.sh",
      live_alibaba_proof: "curl -s http://8.222.191.152/api/proof/alibaba-cloud | jq",
      evidence_doc: "docs/judge_evidence.md",
      safe_claims_doc: "docs/safe_claims.md",
    },
    note: "Read-only aggregator. No external calls, no secrets.",
    ...overrides,
  };
}

function mockFetchOk(data: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(data),
    })
  );
}

function mockFetchFail() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({}),
    })
  );
}

describe("JudgeDemoPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the core sections once /api/judge/full-demo resolves", async () => {
    mockFetchOk(fullDemo());
    render(<JudgeDemoPage />);

    await waitFor(() => expect(screen.getByTestId("judge-demo-page")).toBeInTheDocument());
    expect(screen.getByText("Judge Demo / Qwen Proof")).toBeInTheDocument();
    expect(screen.getByTestId("architecture-section")).toBeInTheDocument();
    expect(screen.getByText("Alibaba Cloud Proof")).toBeInTheDocument();
    expect(screen.getByText("Qwen / DashScope Integration")).toBeInTheDocument();
    expect(screen.getByTestId("qwen-value-section")).toBeInTheDocument();
    expect(screen.getByTestId("evidence-lineage")).toBeInTheDocument();
    expect(screen.getByTestId("signal-brief-preview")).toBeInTheDocument();
    expect(screen.getByTestId("commercialization-roadmap")).toBeInTheDocument();
    expect(screen.getByText("Safe Claims / Non-Claims")).toBeInTheDocument();
    expect(screen.getByText("Verification")).toBeInTheDocument();
    expect(screen.getByTestId("judge-demo-raw-json")).toBeInTheDocument();
  });

  it("shows the human-review banner and major divergence when flagged", async () => {
    mockFetchOk(fullDemo());
    render(<JudgeDemoPage />);
    await waitFor(() =>
      expect(screen.getAllByText("Low agreement between providers.").length).toBeGreaterThan(0)
    );
    expect(screen.getByText("pricing_power")).toBeInTheDocument();
  });

  it("shows a graceful fail-closed error state when the fetch fails, not a blank page", async () => {
    mockFetchFail();
    render(<JudgeDemoPage />);
    await waitFor(() => expect(screen.getByTestId("judge-demo-error")).toBeInTheDocument());
    expect(screen.getByText(/fail-closed/i)).toBeInTheDocument();
  });

  it("shows a graceful fail-closed error state on network rejection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    render(<JudgeDemoPage />);
    await waitFor(() => expect(screen.getByTestId("judge-demo-error")).toBeInTheDocument());
    expect(screen.getByText(/network down/)).toBeInTheDocument();
  });
});

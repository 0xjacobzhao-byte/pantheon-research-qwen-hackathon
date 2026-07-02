const API_BASE = "/api";

export interface ProjectInfo {
  name: string;
  description: string;
  author: string;
  github: string;
  license: string;
  version: string;
  demo_mode: string;
  architecture_layers: string[];
  safety_statement: string;
}

export interface EquityEvidence {
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap_usd: number;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roic_pct: number | null;
  fcf_ttm_usd: number | null;
  revenue_growth_yoy_pct: number | null;
  gross_margin_pct: number | null;
  net_margin_pct: number | null;
  dividend_yield_pct: number | null;
  debt_to_equity: number | null;
  summary: string;
}

export interface OverlayAssessment {
  business_quality: string;
  moat: string;
  pricing_power: string;
  capital_allocation: string;
  red_flags: string;
  confidence: number;
  missing_evidence: string[];
}

export interface QualitativeOverlay {
  provider: string;
  model: string;
  ticker: string;
  status: string;
  takeaway: string;
  assessment: OverlayAssessment | null;
  error_message: string | null;
  latency_ms: number | null;
}

export interface Divergence {
  field: string;
  qwen_view: string;
  deepseek_view: string;
  severity: string;
}

export interface ComparisonResult {
  ticker: string;
  evidence: EquityEvidence;
  qwen_overlay: QualitativeOverlay;
  deepseek_overlay: QualitativeOverlay;
  agreement_score: number;
  agreement_level: string;
  qwen_tone: string;
  deepseek_tone: string;
  divergences: Divergence[];
  evidence_gaps: string[];
  human_review_required: boolean;
}

export interface AlibabaCloudProof {
  cloud_provider: string;
  backend_runtime: string;
  reverse_proxy: string;
  database_service: string;
  qwen_provider: string;
  details: Record<string, unknown>;
}

export interface QwenConfig {
  provider: string;
  base_url: string;
  model: string;
  integration_type: string;
  credential_configured: boolean;
  demo_mode: string;
}

export interface DemoFlowStep {
  step: number;
  title: string;
  description: string;
}

export interface DemoFlow {
  title: string;
  steps: DemoFlowStep[];
  architecture_layers: string[];
  safety_statement: string;
}

export async function fetchProject(): Promise<ProjectInfo> {
  const res = await fetch(`${API_BASE}/project`);
  return res.json();
}

export async function fetchDemoFlow(): Promise<DemoFlow> {
  const res = await fetch(`${API_BASE}/demo-flow`);
  return res.json();
}

export async function fetchComparison(ticker: string): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/comparison/${ticker}`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAlibabaProof(): Promise<AlibabaCloudProof> {
  const res = await fetch(`${API_BASE}/alibaba/proof`);
  return res.json();
}

export async function fetchQwenConfig(): Promise<QwenConfig> {
  const res = await fetch(`${API_BASE}/alibaba/qwen-config`);
  return res.json();
}

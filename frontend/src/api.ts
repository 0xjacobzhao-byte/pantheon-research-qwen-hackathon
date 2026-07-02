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

export interface EvidenceSource {
  group: string;
  label: string;
  origin: string;
  as_of: string;
}

export interface EvidenceProvenance {
  evidence_schema_version: string;
  evidence_hash: string;
  generated_at_utc: string;
  sources: EvidenceSource[];
  redaction_note: string;
}

export interface EvidencePack {
  evidence: EquityEvidence;
  provenance: EvidenceProvenance;
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

export interface TokenUsage {
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  estimated_cost_usd: number | null;
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
  attempts: number;
  prompt_version: string | null;
  output_schema_version: string | null;
  usage: TokenUsage | null;
}

export interface Divergence {
  field: string;
  qwen_view: string;
  deepseek_view: string;
  severity: string;
}

export interface ComparisonResult {
  ticker: string;
  data_state: string;
  qwen_status: string;
  deepseek_status: string;
  evidence: EquityEvidence;
  evidence_hash: string | null;
  qwen_overlay: QualitativeOverlay;
  deepseek_overlay: QualitativeOverlay;
  agreement_score: number | null;
  agreement_level: string;
  qwen_tone: string;
  deepseek_tone: string;
  divergences: Divergence[];
  evidence_gaps: string[];
  human_review_required: boolean;
  human_review_reason: string | null;
}

export interface DatabaseProof {
  provider: string;
  configured: boolean;
  connected: boolean | null;
  role: string;
  production_data_migrated: boolean;
  note: string;
}

export interface AlibabaCloudProof {
  schema_version: string;
  project: string;
  cloud_provider: string;
  host_runtime: string;
  alibaba_hosted: boolean;
  backend_runtime: string;
  reverse_proxy: string;
  frontend_source: string;
  qwen_provider: string;
  qwen_base_url: string;
  qwen_model: string;
  qwen_configured: boolean;
  dashscope_api_key_configured: boolean;
  demo_mode: string;
  region: string;
  git_sha: string;
  timestamp_utc: string;
  proof_endpoints: Record<string, string>;
  database: DatabaseProof;
  safe_claims: string[];
  non_claims: string[];
}

export interface QwenConfig {
  provider: string;
  base_url: string;
  model: string;
  integration_type: string;
  prompt_version: string;
  output_schema_version: string;
  credential_configured: boolean;
  demo_mode: string;
}

export interface DataQualityReport {
  generated_at_utc: string;
  demo_mode: string;
  mode: string;
  providers: {
    qwen_configured: boolean;
    qwen_model: string;
    deepseek_configured: boolean;
    deepseek_model: string;
  };
  alibaba_proof_reachable: boolean;
  sample_evidence_coverage: {
    tickers: string[];
    evidence_packs_present: number;
    healthy_comparisons: number;
  };
  overlay_statuses: Array<Record<string, unknown>>;
  fail_closed_states: string[];
  governance_note: string;
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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const fetchProject = () => getJson<ProjectInfo>("/project");
export const fetchDemoFlow = () => getJson<DemoFlow>("/demo-flow");
export const fetchComparison = (ticker: string) =>
  getJson<ComparisonResult>(`/comparison/${ticker}`);
export const fetchAlibabaProof = () =>
  getJson<AlibabaCloudProof>("/proof/alibaba-cloud");
export const fetchQwenConfig = () => getJson<QwenConfig>("/alibaba/qwen-config");
export const fetchDataQuality = () => getJson<DataQualityReport>("/data-quality");

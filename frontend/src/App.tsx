import { useState, useEffect, useCallback } from "react";
import {
  fetchProject,
  fetchDemoFlow,
  fetchComparison,
  fetchAlibabaProof,
  fetchQwenConfig,
  type ProjectInfo,
  type DemoFlow,
  type ComparisonResult,
  type AlibabaCloudProof,
  type QwenConfig,
  type QualitativeOverlay,
} from "./api";

const TICKERS = ["MA", "NVDA"];

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#16a34a",
  OFFLINE_SAMPLE: "#2563eb",
  BLOCKED_BY_MISSING_CREDENTIAL: "#dc2626",
  API_ERROR: "#dc2626",
};

const TONE_COLORS: Record<string, string> = {
  positive: "#16a34a",
  conservative_positive: "#2563eb",
  cautious: "#f59e0b",
  neutral: "#6b7280",
  negative: "#dc2626",
};

const SEVERITY_COLORS: Record<string, string> = {
  major: "#dc2626",
  moderate: "#f59e0b",
  minor: "#6b7280",
};

const ASSESSMENT_FIELDS: { key: string; label: string }[] = [
  { key: "business_quality", label: "Business Quality" },
  { key: "moat", label: "Moat & Competitive Advantage" },
  { key: "pricing_power", label: "Pricing Power" },
  { key: "capital_allocation", label: "Capital Allocation" },
  { key: "red_flags", label: "Red Flags & Risks" },
];

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className="badge" style={{ backgroundColor: color }}>
      {text}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#6b7280";
  return <Badge text={status} color={color} />;
}

function ToneBadge({ tone }: { tone: string }) {
  const color = TONE_COLORS[tone] ?? "#6b7280";
  return <Badge text={tone} color={color} />;
}

function OverlayPanel({
  title,
  overlay,
}: {
  title: string;
  overlay: QualitativeOverlay;
}) {
  const a = overlay.assessment;
  return (
    <div className="overlay-panel">
      <div className="overlay-header">
        <h3>{title}</h3>
        <span className="model-name">{overlay.model}</span>
        <StatusBadge status={overlay.status} />
        {overlay.latency_ms != null && (
          <span className="latency">{overlay.latency_ms}ms</span>
        )}
      </div>
      {overlay.error_message && (
        <div className="error-box">{overlay.error_message}</div>
      )}
      {overlay.takeaway && (
        <div className="takeaway">
          <strong>Takeaway:</strong> {overlay.takeaway}
        </div>
      )}
      {a && (
        <div className="assessment-grid">
          {ASSESSMENT_FIELDS.map((f) => (
            <div key={f.key} className="assessment-field">
              <h4>{f.label}</h4>
              <p>{(a as unknown as Record<string, unknown>)[f.key] as string || "—"}</p>
            </div>
          ))}
          <div className="assessment-field confidence-field">
            <h4>Confidence</h4>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${a.confidence * 100}%` }}
              />
              <span>{Math.round(a.confidence * 100)}%</span>
            </div>
          </div>
          <div className="assessment-field full-width">
            <h4>Missing Evidence</h4>
            <ul className="gap-list">
              {a.missing_evidence.length > 0 ? (
                a.missing_evidence.map((g, i) => <li key={i}>{g}</li>)
              ) : (
                <li>None identified</li>
              )}
            </ul>
          </div>
        </div>
      )}
      {!a && !overlay.error_message && (
        <p className="empty">No assessment data available.</p>
      )}
    </div>
  );
}

function App() {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [demoFlow, setDemoFlow] = useState<DemoFlow | null>(null);
  const [proof, setProof] = useState<AlibabaCloudProof | null>(null);
  const [qwenCfg, setQwenCfg] = useState<QwenConfig | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject().then(setProject).catch(() => {});
    fetchDemoFlow().then(setDemoFlow).catch(() => {});
    fetchAlibabaProof().then(setProof).catch(() => {});
    fetchQwenConfig().then(setQwenCfg).catch(() => {});
  }, []);

  const handleCompare = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchComparison(selected);
      setComparison(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const ev = comparison?.evidence;
  const agreementColor =
    comparison?.agreement_level === "HIGH"
      ? "#16a34a"
      : comparison?.agreement_level === "MEDIUM"
      ? "#f59e0b"
      : "#dc2626";

  return (
    <div className="app">
      <header className="hero">
        <h1>Pantheon Research — Qwen Cloud Hackathon Demo</h1>
        <p className="subtitle">
          Dual-LLM Equity Qualitative Overlay: Qwen Cloud vs DeepSeek
        </p>
        {project && (
          <p className="demo-mode">
            Mode: {project.demo_mode} · v{project.version}
          </p>
        )}
      </header>

      {/* Four-layer architecture */}
      <section className="card">
        <h2>Four-Layer Architecture</h2>
        <div className="arch-layers">
          {(project?.architecture_layers || demoFlow?.architecture_layers || [
            "Strategy",
            "Information",
            "Signal",
            "Trading",
          ]).map((layer, i, arr) => (
            <div key={layer} className="arch-layer">
              <span className="layer-num">{i + 1}</span>
              <span className="layer-name">{layer}</span>
              {i < arr.length - 1 && <span className="arch-arrow">→</span>}
            </div>
          ))}
        </div>
        <p className="arch-desc">
          The framework flows from high-level investment Strategy, through
          Information gathering and evidence analysis, to Signal generation via
          dual-LLM qualitative overlay, and finally to Trading decisions — all
          gated by human review.
        </p>
      </section>

      {/* Tech stack */}
      <section className="card">
        <h2>Tech Stack</h2>
        <div className="tech-grid">
          <div className="tech-item"><strong>Backend</strong> FastAPI + Python</div>
          <div className="tech-item"><strong>Frontend</strong> React + TypeScript + Vite</div>
          <div className="tech-item"><strong>Qwen Cloud</strong> Alibaba DashScope API</div>
          <div className="tech-item"><strong>DeepSeek</strong> OpenAI-compatible API</div>
          <div className="tech-item"><strong>Deploy</strong> Docker Compose</div>
          <div className="tech-item"><strong>Cloud</strong> Alibaba Cloud (SAS, RDS)</div>
        </div>
      </section>

      {/* Alibaba Cloud integration */}
      {proof && (
        <section className="card">
          <h2>Alibaba Cloud Integration</h2>
          <div className="alibaba-grid">
            <div className="alibaba-item">
              <span className="label">Cloud Provider</span>
              <span className="value">{proof.cloud_provider}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Backend Runtime</span>
              <span className="value">{proof.backend_runtime}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Reverse Proxy</span>
              <span className="value">{proof.reverse_proxy}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Database</span>
              <span className="value">{proof.database_service}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Qwen Provider</span>
              <span className="value">{proof.qwen_provider}</span>
            </div>
          </div>
        </section>
      )}

      {/* Qwen + DeepSeek dual-model workflow */}
      {qwenCfg && (
        <section className="card">
          <h2>Qwen + DeepSeek Dual-Model Workflow</h2>
          <div className="workflow-diagram">
            <div className="workflow-step">
              <strong>Evidence Pack</strong>
              <p>Quantitative metrics loaded from data/</p>
            </div>
            <span className="workflow-arrow">→</span>
            <div className="workflow-step qwen-step">
              <strong>Qwen Cloud</strong>
              <p>{qwenCfg.model} via DashScope</p>
              <p className="cfg-url">{qwenCfg.base_url}</p>
            </div>
            <span className="workflow-arrow">+</span>
            <div className="workflow-step deepseek-step">
              <strong>DeepSeek</strong>
              <p>OpenAI-compatible API</p>
            </div>
            <span className="workflow-arrow">→</span>
            <div className="workflow-step">
              <strong>Comparison</strong>
              <p>Agreement scoring & divergence detection</p>
            </div>
            <span className="workflow-arrow">→</span>
            <div className="workflow-step">
              <strong>Human Review Gate</strong>
              <p>Human-in-the-loop decision</p>
            </div>
          </div>
        </section>
      )}

      {/* Sample ticker panel */}
      <section className="card">
        <h2>Sample Ticker Panel</h2>
        <div className="ticker-panel">
          {TICKERS.map((t) => (
            <button
              key={t}
              className={`ticker-btn ${selected === t ? "selected" : ""}`}
              onClick={() => setSelected(t)}
            >
              {t}
            </button>
          ))}
          <button
            className="run-btn"
            onClick={handleCompare}
            disabled={!selected || loading}
          >
            {loading ? "Analyzing…" : "Run Comparison"}
          </button>
        </div>
        {error && <div className="error-box">{error}</div>}
      </section>

      {/* Evidence pack */}
      {ev && (
        <section className="card">
          <h2>Evidence Pack — {ev.company_name} ({ev.ticker})</h2>
          <p className="meta">
            {ev.exchange} · {ev.sector} · {ev.industry}
          </p>
          <p>{ev.summary}</p>
          <div className="metrics-grid">
            {ev.pe_ratio != null && <span>P/E: {ev.pe_ratio}</span>}
            {ev.pb_ratio != null && <span>P/B: {ev.pb_ratio}</span>}
            {ev.roic_pct != null && <span>ROIC: {ev.roic_pct}%</span>}
            {ev.fcf_ttm_usd != null && <span>FCF: ${ev.fcf_ttm_usd.toLocaleString()}</span>}
            {ev.revenue_growth_yoy_pct != null && <span>Rev Growth: {ev.revenue_growth_yoy_pct}%</span>}
            {ev.gross_margin_pct != null && <span>Gross Margin: {ev.gross_margin_pct}%</span>}
            {ev.net_margin_pct != null && <span>Net Margin: {ev.net_margin_pct}%</span>}
            {ev.debt_to_equity != null && <span>D/E: {ev.debt_to_equity}</span>}
          </div>
        </section>
      )}

      {/* Qwen + DeepSeek outputs */}
      {comparison && (
        <section className="card">
          <h2>LLM Qualitative Overlays</h2>
          <div className="comparison-grid">
            <OverlayPanel title="Qwen Cloud" overlay={comparison.qwen_overlay} />
            <OverlayPanel title="DeepSeek" overlay={comparison.deepseek_overlay} />
          </div>
        </section>
      )}

      {/* Model comparison */}
      {comparison && (
        <section className="card">
          <h2>Model Comparison</h2>
          <div className="comparison-summary">
            <div className="summary-item">
              <span className="label">Agreement Score</span>
              <span
                className="value big"
                style={{ color: agreementColor }}
              >
                {comparison.agreement_score}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Agreement Level</span>
              <Badge text={comparison.agreement_level} color={agreementColor} />
            </div>
            <div className="summary-item">
              <span className="label">Qwen Tone</span>
              <ToneBadge tone={comparison.qwen_tone} />
            </div>
            <div className="summary-item">
              <span className="label">DeepSeek Tone</span>
              <ToneBadge tone={comparison.deepseek_tone} />
            </div>
            <div className="summary-item">
              <span className="label">Human Review</span>
              <span
                className="value"
                style={{
                  color: comparison.human_review_required ? "#dc2626" : "#16a34a",
                }}
              >
                {comparison.human_review_required ? "REQUIRED" : "Not Required"}
              </span>
            </div>
          </div>

          {comparison.divergences.length > 0 && (
            <div className="divergences">
              <h3>Divergences ({comparison.divergences.length})</h3>
              {comparison.divergences.map((d, i) => (
                <div key={i} className="divergence-item">
                  <Badge
                    text={d.severity}
                    color={SEVERITY_COLORS[d.severity] ?? "#6b7280"}
                  />
                  <span className="div-field">{d.field}</span>
                  <div className="div-views">
                    <span><strong>Qwen:</strong> {d.qwen_view}</span>
                    <span><strong>DeepSeek:</strong> {d.deepseek_view}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {comparison.divergences.length === 0 && (
            <p className="no-divergence">No divergences detected — providers agree.</p>
          )}

          {comparison.evidence_gaps.length > 0 && (
            <div className="evidence-gaps">
              <h3>Evidence Gaps ({comparison.evidence_gaps.length})</h3>
              <ul className="gap-list">
                {comparison.evidence_gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Safety statement */}
      <section className="card safety-card">
        <h2>Safety Statement</h2>
        <p className="safety-text">
          LLMs do not execute trades; human remains portfolio manager.
        </p>
        <p className="safety-text">
          Pantheon Research is not an autonomous trading bot. It is a
          framework-first, data-governed, human-in-the-loop AI research
          operating system.
        </p>
      </section>

      <footer>
        <p>
          Apache-2.0 · Built for the Qwen Cloud Hackathon ·{" "}
          <a
            href="https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

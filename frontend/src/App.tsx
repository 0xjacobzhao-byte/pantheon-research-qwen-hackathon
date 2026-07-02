import { useState, useEffect, useCallback } from "react";
import {
  fetchProject,
  fetchDemoFlow,
  fetchComparison,
  fetchAlibabaProof,
  fetchQwenConfig,
  fetchDataQuality,
  type ProjectInfo,
  type DemoFlow,
  type ComparisonResult,
  type AlibabaCloudProof,
  type QwenConfig,
  type DataQualityReport,
} from "./api";
import OverlayComparisonPanel from "./components/equity/OverlayComparisonPanel";
import DataQualityPanel from "./components/DataQualityPanel";

const TICKERS = ["MA", "NVDA"];

function App() {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [demoFlow, setDemoFlow] = useState<DemoFlow | null>(null);
  const [proof, setProof] = useState<AlibabaCloudProof | null>(null);
  const [qwenCfg, setQwenCfg] = useState<QwenConfig | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject().then(setProject).catch(() => {});
    fetchDemoFlow().then(setDemoFlow).catch(() => {});
    fetchAlibabaProof().then(setProof).catch(() => {});
    fetchQwenConfig().then(setQwenCfg).catch(() => {});
    fetchDataQuality().then(setDataQuality).catch(() => {});
  }, []);

  const handleCompare = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      setComparison(await fetchComparison(selected));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const ev = comparison?.evidence;

  return (
    <div className="app">
      <header className="hero">
        <h1>Pantheon Research — Qwen Cloud Hackathon</h1>
        <p className="subtitle">
          Dual-LLM Equity Qualitative Overlay: Qwen Cloud vs DeepSeek, with
          agreement scoring, fail-closed handling, and a human-review gate.
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
          {(project?.architecture_layers ||
            demoFlow?.architecture_layers || [
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
          Strategy → Information (evidence pack) → Signal (dual-LLM overlay) →
          Trading — every signal gated by human review.
        </p>
      </section>

      {/* Alibaba Cloud proof v2 */}
      {proof && (
        <section className="card">
          <h2>Alibaba Cloud Deployment Proof</h2>
          <p className="proof-schema">
            schema <code>{proof.schema_version}</code> · git{" "}
            <code>{proof.git_sha}</code> · {proof.demo_mode} mode
          </p>
          <div className="alibaba-grid">
            <div className="alibaba-item">
              <span className="label">Qwen AI Provider</span>
              <span className="value">{proof.qwen_provider}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Compute Host (honest)</span>
              <span className="value">
                {proof.host_runtime}{" "}
                <span
                  className="host-flag"
                  style={{ color: proof.alibaba_hosted ? "#16a34a" : "#b45309" }}
                >
                  {proof.alibaba_hosted
                    ? "Alibaba-hosted"
                    : "not Alibaba compute"}
                </span>
              </span>
            </div>
            <div className="alibaba-item">
              <span className="label">Backend</span>
              <span className="value">{proof.backend_runtime}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Reverse Proxy</span>
              <span className="value">{proof.reverse_proxy}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">DashScope Key</span>
              <span className="value">
                {proof.dashscope_api_key_configured
                  ? "configured"
                  : "not set (offline)"}
              </span>
            </div>
            <div className="alibaba-item">
              <span className="label">Database</span>
              <span className="value">{proof.database.provider}</span>
            </div>
          </div>
          <p className="proof-db-note">
            <strong>Database claim (precise):</strong> {proof.database.note}
          </p>
          <details className="proof-claims">
            <summary>Safe claims &amp; non-claims</summary>
            <div className="claims-grid">
              <div>
                <h4>Safe claims</h4>
                <ul>
                  {proof.safe_claims.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Non-claims</h4>
                <ul>
                  {proof.non_claims.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </section>
      )}

      {/* Qwen config */}
      {qwenCfg && (
        <section className="card">
          <h2>Qwen Integration</h2>
          <div className="alibaba-grid">
            <div className="alibaba-item">
              <span className="label">Model</span>
              <span className="value">{qwenCfg.model}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Base URL</span>
              <span className="value cfg-url">{qwenCfg.base_url}</span>
            </div>
            <div className="alibaba-item">
              <span className="label">Prompt / Schema</span>
              <span className="value">
                {qwenCfg.prompt_version} · {qwenCfg.output_schema_version}
              </span>
            </div>
            <div className="alibaba-item">
              <span className="label">Integration</span>
              <span className="value">{qwenCfg.integration_type}</span>
            </div>
          </div>
        </section>
      )}

      {/* Research-Ops mini: data quality */}
      {dataQuality && (
        <section className="card">
          <h2>Research-Ops · Data Quality</h2>
          <DataQualityPanel report={dataQuality} />
        </section>
      )}

      {/* Ticker panel */}
      <section className="card">
        <h2>Run a Dual-Model Comparison</h2>
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
          <h2>
            Evidence Pack — {ev.company_name} ({ev.ticker})
          </h2>
          <p className="meta">
            {ev.exchange} · {ev.sector} · {ev.industry}
            {comparison?.evidence_hash && (
              <>
                {" "}
                · <code className="oc-hash">{comparison.evidence_hash.slice(0, 22)}…</code>
              </>
            )}
          </p>
          <p>{ev.summary}</p>
          <div className="metrics-grid">
            {ev.pe_ratio != null && <span>P/E: {ev.pe_ratio}</span>}
            {ev.pb_ratio != null && <span>P/B: {ev.pb_ratio}</span>}
            {ev.roic_pct != null && <span>ROIC: {ev.roic_pct}%</span>}
            {ev.fcf_ttm_usd != null && (
              <span>FCF: ${ev.fcf_ttm_usd.toLocaleString()}</span>
            )}
            {ev.revenue_growth_yoy_pct != null && (
              <span>Rev Growth: {ev.revenue_growth_yoy_pct}%</span>
            )}
            {ev.gross_margin_pct != null && (
              <span>Gross Margin: {ev.gross_margin_pct}%</span>
            )}
            {ev.net_margin_pct != null && (
              <span>Net Margin: {ev.net_margin_pct}%</span>
            )}
            {ev.debt_to_equity != null && <span>D/E: {ev.debt_to_equity}</span>}
          </div>
        </section>
      )}

      {/* Dual-model comparison */}
      {comparison && (
        <section className="card">
          <h2>Qwen Cloud vs DeepSeek — Overlay Comparison</h2>
          <OverlayComparisonPanel comparison={comparison} />
        </section>
      )}

      {/* Safety statement */}
      <section className="card safety-card">
        <h2>Safety Statement</h2>
        <p className="safety-text">
          LLMs do not execute trades; a human remains the portfolio manager.
        </p>
        <p className="safety-text">
          Pantheon Research is not an autonomous trading bot. It is a
          framework-first, data-governed, human-in-the-loop AI research
          operating system. This public repository is a sanitized vertical
          slice; the production system stays private.
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

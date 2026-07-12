import { useEffect, useState } from "react";
import { fetchJudgeFullDemo, type JudgeFullDemo } from "../../api";
import EvidenceLineage from "./EvidenceLineage";
import SignalBriefPreview from "./SignalBriefPreview";
import QwenValueSection from "./QwenValueSection";
import CommercializationRoadmap from "./CommercializationRoadmap";
import ArchitectureSection from "./ArchitectureSection";

/**
 * JudgeDemoPage — "Judge Demo / Qwen Proof".
 *
 * The single visual home for everything GET /api/judge/full-demo returns.
 * Read-only, offline, secret-free. On fetch failure it shows a graceful
 * fail-closed error state — never a blank page.
 */

function toneBadgeColor(tone: string): string {
  if (tone === "positive" || tone === "conservative_positive") return "var(--success)";
  if (tone === "cautious" || tone === "negative") return "var(--error)";
  return "var(--text-muted)";
}

function agreementColor(level: string): string {
  if (level === "HIGH") return "var(--success)";
  if (level === "MEDIUM") return "var(--warning)";
  if (level === "LOW") return "var(--error)";
  return "var(--text-muted)";
}

export default function JudgeDemoPage() {
  const [demo, setDemo] = useState<JudgeFullDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchJudgeFullDemo()
      .then((data) => {
        if (!cancelled) setDemo(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="judge-demo-page" data-testid="judge-demo-page">
        <p className="empty">Loading judge demo…</p>
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="judge-demo-page" data-testid="judge-demo-page">
        <div className="error-box" data-testid="judge-demo-error">
          <strong>Judge demo unavailable (fail-closed).</strong>
          <p>
            Could not load <code>/api/judge/full-demo</code>
            {error ? `: ${error}` : "."} No stale or fabricated data is shown.
            Verify the backend is running (<code>docker compose up --build</code>{" "}
            or <code>uvicorn main:app --port 8000</code>) and reload.
          </p>
        </div>
      </div>
    );
  }

  const { qwen_overlay_status: qwen, deepseek_overlay_status: deepseek, comparison } = demo;

  return (
    <div className="judge-demo-page" data-testid="judge-demo-page">
      <section className="card judge-hero-card">
        <h2>Judge Demo / Qwen Proof</h2>
        <p className="section-lead">{demo.one_line}</p>
        <p className="meta">
          schema <code>{demo.schema_version}</code> · {demo.demo_mode} mode · generated{" "}
          <code>{demo.generated_at_utc}</code>
        </p>
      </section>

      {/* Architecture */}
      <section className="card">
        <h2>Architecture</h2>
        <ArchitectureSection />
      </section>

      {/* 1. Alibaba proof */}
      <section className="card">
        <h2>Alibaba Cloud Proof</h2>
        <div className="alibaba-grid">
          <div className="alibaba-item">
            <span className="label">Cloud Provider</span>
            <span className="value">{demo.alibaba_proof.cloud_provider}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Host (honest)</span>
            <span className="value">
              {demo.alibaba_proof.host_runtime}{" "}
              <span
                className="host-flag"
                style={{ color: demo.alibaba_proof.alibaba_hosted ? "var(--success)" : "var(--warning)" }}
              >
                {demo.alibaba_proof.alibaba_hosted ? "Alibaba-hosted" : "not Alibaba compute"}
              </span>
            </span>
          </div>
          <div className="alibaba-item">
            <span className="label">Region</span>
            <span className="value">{demo.alibaba_proof.region}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Live Proof Endpoint</span>
            <span className="value">
              <a href={demo.alibaba_proof.live_proof_url ?? "#"} target="_blank" rel="noopener noreferrer">
                {demo.alibaba_proof.proof_endpoint}
              </a>
            </span>
          </div>
          <div className="alibaba-item">
            <span className="label">Database Role</span>
            <span className="value">{demo.alibaba_proof.database.role}</span>
          </div>
        </div>
        <p className="proof-db-note">
          <strong>Precise, no overclaiming:</strong> mirror_state{" "}
          <code>{demo.alibaba_proof.database.mirror_state}</code> · production_data_migrated{" "}
          <code>{String(demo.alibaba_proof.database.production_data_migrated)}</code> ·
          full_production_clone_verified{" "}
          <code>{String(demo.alibaba_proof.database.full_production_clone_verified)}</code> — Alibaba RDS is a{" "}
          <strong>selected evidence mirror, not a full production-database clone</strong>.
        </p>
        <p className="meta">
          Attestation: proof_endpoint_external_calls{" "}
          <code>{String(demo.alibaba_proof.attestation.proof_endpoint_external_calls)}</code> ·
          credential_values_returned{" "}
          <code>{String(demo.alibaba_proof.attestation.credential_values_returned)}</code>
        </p>
      </section>

      {/* 2. Qwen / DashScope integration */}
      <section className="card">
        <h2>Qwen / DashScope Integration</h2>
        <div className="alibaba-grid">
          <div className="alibaba-item">
            <span className="label">Provider</span>
            <span className="value">{demo.qwen_config.provider}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Model</span>
            <span className="value">{demo.qwen_config.model}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Integration</span>
            <span className="value">{demo.qwen_config.integration_type}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Credential Configured</span>
            <span className="value">{String(demo.qwen_config.credential_configured)} (boolean only)</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Demo Mode</span>
            <span className="value">{demo.qwen_config.demo_mode}</span>
          </div>
        </div>
      </section>

      {/* Qwen-specific value */}
      <section className="card">
        <h2>Why Qwen</h2>
        <QwenValueSection />
      </section>

      {/* 3. Evidence pack */}
      <section className="card">
        <h2>
          Evidence Pack — {demo.evidence_pack.evidence.company_name} ({demo.featured_ticker})
        </h2>
        <p className="meta">
          {demo.evidence_pack.evidence.exchange} · {demo.evidence_pack.evidence.sector} ·{" "}
          <code className="oc-hash">{demo.evidence_pack.provenance.evidence_hash.slice(0, 28)}…</code>
        </p>
        <p>{demo.evidence_pack.evidence.summary}</p>
        <p className="meta">Generated (provenance): {demo.evidence_pack.provenance.generated_at_utc}</p>
      </section>

      {/* 4/5. Qwen + DeepSeek overlays */}
      <section className="card">
        <h2>Qwen vs DeepSeek — Overlay Status</h2>
        <div className="comparison-grid">
          <div className="overlay-panel">
            <div className="overlay-header">
              <h3>Qwen</h3>
              <span className="model-name">{qwen.model}</span>
            </div>
            <p className="meta">Status: {qwen.status} · Usable: {String(qwen.usable)}</p>
            {qwen.confidence != null && <p className="meta">Confidence: {qwen.confidence}</p>}
            <p className="takeaway">{qwen.takeaway || qwen.error_message || "No output."}</p>
          </div>
          <div className="overlay-panel">
            <div className="overlay-header">
              <h3>DeepSeek</h3>
              <span className="model-name">{deepseek.model}</span>
            </div>
            <p className="meta">Status: {deepseek.status} · Usable: {String(deepseek.usable)}</p>
            {deepseek.confidence != null && <p className="meta">Confidence: {deepseek.confidence}</p>}
            <p className="takeaway">{deepseek.takeaway || deepseek.error_message || "No output."}</p>
          </div>
        </div>
      </section>

      {/* 6. Comparison */}
      <section className="card">
        <h2>Comparison</h2>
        <div className="comparison-summary">
          <div className="summary-item">
            <span className="label">Agreement</span>
            <span className="value big" style={{ color: agreementColor(comparison.agreement_level) }}>
              {comparison.agreement_level}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Score</span>
            <span className="value">{comparison.agreement_score != null ? comparison.agreement_score.toFixed(2) : "N/A"}</span>
          </div>
          <div className="summary-item">
            <span className="label">Qwen Tone</span>
            <span className="value" style={{ color: toneBadgeColor(comparison.qwen_tone) }}>
              {comparison.qwen_tone}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">DeepSeek Tone</span>
            <span className="value" style={{ color: toneBadgeColor(comparison.deepseek_tone) }}>
              {comparison.deepseek_tone}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Human Review</span>
            <span className="value" style={{ color: comparison.human_review_required ? "var(--error)" : "var(--success)" }}>
              {comparison.human_review_required ? "REQUIRED" : "not required"}
            </span>
          </div>
        </div>
        {comparison.human_review_reason && (
          <div className="oc-review-banner">{comparison.human_review_reason}</div>
        )}
        {comparison.divergences.length > 0 && (
          <div className="divergences">
            <h3>Divergences</h3>
            {comparison.divergences.map((d, i) => (
              <div className="divergence-item" key={i}>
                <span className="div-field">{d.field}</span>
                <span className={`badge`} style={{ backgroundColor: "var(--surface2)" }}>
                  {d.severity}
                </span>
              </div>
            ))}
          </div>
        )}
        {comparison.evidence_gaps.length > 0 && (
          <div className="evidence-gaps">
            <h3>Evidence Gaps</h3>
            <ul className="gap-list">
              {comparison.evidence_gaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Evidence Lineage visualization */}
      <section className="card">
        <h2>Evidence Lineage</h2>
        <EvidenceLineage
          evidenceHash={demo.evidence_pack.provenance.evidence_hash}
          qwenOverlay={qwen}
          deepseekOverlay={deepseek}
          comparison={comparison}
        />
      </section>

      {/* Signal Brief Preview */}
      <section className="card">
        <h2>Signal Brief Preview (mock, offline)</h2>
        <SignalBriefPreview preview={demo.signal_preview} />
      </section>

      {/* Commercialization roadmap */}
      <section className="card">
        <h2>Productization Roadmap</h2>
        <CommercializationRoadmap />
      </section>

      {/* 7. Safe claims / non-claims */}
      <section className="card">
        <h2>Safe Claims / Non-Claims</h2>
        <div className="claims-grid">
          <div>
            <h4>Safe claims</h4>
            <ul>
              {demo.safe_claims.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Non-claims</h4>
            <ul>
              {demo.non_claims.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Verification */}
      <section className="card">
        <h2>Verification</h2>
        <div className="alibaba-grid">
          <div className="alibaba-item">
            <span className="label">One-command smoke</span>
            <span className="value"><code>{demo.verification.one_command_smoke}</code></span>
          </div>
          <div className="alibaba-item">
            <span className="label">Live Alibaba proof</span>
            <span className="value"><code>{demo.verification.live_alibaba_proof}</code></span>
          </div>
          <div className="alibaba-item">
            <span className="label">Evidence doc</span>
            <span className="value">{demo.verification.evidence_doc}</span>
          </div>
          <div className="alibaba-item">
            <span className="label">Safe claims doc</span>
            <span className="value">{demo.verification.safe_claims_doc}</span>
          </div>
        </div>
      </section>

      {/* Raw payload */}
      <section className="card">
        <details className="proof-claims" open={showRaw} onToggle={(e) => setShowRaw((e.target as HTMLDetailsElement).open)}>
          <summary>Raw payload (GET /api/judge/full-demo)</summary>
          <pre className="raw-json" data-testid="judge-demo-raw-json">
            {JSON.stringify(demo, null, 2)}
          </pre>
        </details>
      </section>
    </div>
  );
}

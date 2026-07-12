import type { JudgeComparison, JudgeOverlayStatus } from "../../api";

/**
 * EvidenceLineage — visual proof this is not an LLM wrapper.
 *
 * Shows the flow: Evidence Pack -> Qwen Analysis -> DeepSeek Analysis ->
 * Comparison -> Human Review. Each step is labelled deterministic or
 * LLM-generated, and whether it can trigger human review, so a judge can see
 * at a glance that the LLMs *read* governed evidence rather than inventing it.
 */

interface LineageStep {
  key: string;
  name: string;
  status: string;
  output: string;
  provenance?: string;
  kind: "deterministic" | "llm";
  triggersReview: boolean;
}

function buildSteps(
  evidenceHash: string,
  qwen: JudgeOverlayStatus,
  deepseek: JudgeOverlayStatus,
  comparison: JudgeComparison
): LineageStep[] {
  return [
    {
      key: "evidence",
      name: "Evidence Pack",
      status: "COMMITTED",
      output: "Quantitative metrics + business description, hashed",
      provenance: evidenceHash,
      kind: "deterministic",
      triggersReview: false,
    },
    {
      key: "qwen",
      name: "Qwen Analysis",
      status: qwen.status,
      output: qwen.takeaway || qwen.error_message || "No output",
      kind: "llm",
      triggersReview: false,
    },
    {
      key: "deepseek",
      name: "DeepSeek Analysis",
      status: deepseek.status,
      output: deepseek.takeaway || deepseek.error_message || "No output",
      kind: "llm",
      triggersReview: false,
    },
    {
      key: "comparison",
      name: "Comparison",
      status: comparison.agreement_level,
      output: `Agreement ${
        comparison.agreement_score != null ? comparison.agreement_score.toFixed(2) : "N/A"
      } · ${comparison.divergences.length} divergence(s) · ${comparison.evidence_gaps.length} gap(s)`,
      kind: "deterministic",
      triggersReview: comparison.human_review_required,
    },
    {
      key: "human_review",
      name: "Human Review",
      status: comparison.human_review_required ? "REQUIRED" : "NOT_REQUIRED",
      output: comparison.human_review_reason || "No review flag raised — still human-owned decision.",
      kind: "deterministic",
      triggersReview: comparison.human_review_required,
    },
  ];
}

export default function EvidenceLineage({
  evidenceHash,
  qwenOverlay,
  deepseekOverlay,
  comparison,
}: {
  evidenceHash: string;
  qwenOverlay: JudgeOverlayStatus;
  deepseekOverlay: JudgeOverlayStatus;
  comparison: JudgeComparison;
}) {
  const steps = buildSteps(evidenceHash, qwenOverlay, deepseekOverlay, comparison);

  return (
    <div className="lineage" data-testid="evidence-lineage">
      <p className="section-lead">
        The LLMs <strong>read</strong> governed evidence — they do not invent it,
        and they do not execute trades. Every step below is either deterministic
        (computed) or LLM-generated (interpreted), and the pipeline always ends
        at a human decision.
      </p>
      <div className="lineage-flow">
        {steps.map((step, i) => (
          <div className="lineage-step-wrap" key={step.key}>
            <div
              className={`lineage-step lineage-${step.kind}`}
              data-testid={`lineage-step-${step.key}`}
            >
              <div className="lineage-step-header">
                <span className={`lineage-kind-badge lineage-kind-${step.kind}`}>
                  {step.kind === "deterministic" ? "Deterministic" : "LLM"}
                </span>
                {step.triggersReview && (
                  <span className="lineage-review-flag">→ human review</span>
                )}
              </div>
              <h4>{step.name}</h4>
              <p className="lineage-status">{step.status}</p>
              <p className="lineage-output">{step.output}</p>
              {step.provenance && (
                <code className="lineage-hash">{step.provenance.slice(0, 24)}…</code>
              )}
            </div>
            {i < steps.length - 1 && <span className="lineage-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

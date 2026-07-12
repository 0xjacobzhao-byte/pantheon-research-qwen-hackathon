/**
 * QwenValueSection — why Qwen matters for this project, not just "another provider".
 *
 * Static, judge-facing content (no fetch). Kept as its own component so the
 * same six points stay easy to keep in sync with the README's Qwen-specific
 * value section.
 */

const POINTS: { title: string; body: string }[] = [
  {
    title: "Qwen is the hero model for this hackathon",
    body: "This public repo's runnable live path is Qwen (Alibaba Cloud DashScope / Model Studio) as the primary analyst, with DeepSeek as the comparison baseline.",
  },
  {
    title: "Built for Asia-oriented equity research",
    body: "Qwen is well-suited to Chinese-language context, A-share / HK market terminology, and regional research workflows — relevant as Pantheon's production coverage spans US, CN, HK, and SG.",
  },
  {
    title: "Not a winner-takes-all comparison",
    body: "Qwen vs DeepSeek is designed to surface agreement, disagreement, and evidence gaps — not to crown a single \"best\" model. Divergence is signal, not noise.",
  },
  {
    title: "A conservative analyst that flags over-inference",
    body: "Qwen can act as the more conservative voice in the pair, flagging when evidence is insufficient rather than filling the gap with a confident-sounding guess.",
  },
  {
    title: "A credible China / Asia deployment path",
    body: "DashScope / Alibaba Cloud Model Studio gives a real, already-integrated deployment path for China / Asia market access — not a theoretical one.",
  },
  {
    title: "LLMs remain analysts, not traders",
    body: "Qwen and DeepSeek read governed evidence and produce structured opinions. Neither model executes a trade. The human remains the portfolio manager.",
  },
];

export default function QwenValueSection() {
  return (
    <div className="qwen-value" data-testid="qwen-value-section">
      <p className="section-lead">Why Qwen matters for this project — not just "another provider".</p>
      <div className="qwen-value-grid">
        {POINTS.map((p) => (
          <div className="qwen-value-item" key={p.title}>
            <h4>{p.title}</h4>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

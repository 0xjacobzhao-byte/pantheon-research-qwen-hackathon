/**
 * CommercializationRoadmap — expected revenue streams, phrased as a roadmap.
 *
 * Deliberately phrased as *expected* revenue streams / sustainability plan,
 * not existing revenue. Trading profit is explicitly the last, conditional
 * item — never positioned as a current product.
 */

const STREAMS: { title: string; body: string }[] = [
  {
    title: "Subscription fees",
    body: "Cross-asset dashboard access, premium research overlays, and signal summaries as tiered subscriptions.",
  },
  {
    title: "Skills marketplace",
    body: "Packaged investment frameworks — Macro, Equity, BTC, ETH, DeFi, TA, FX/Commodities — as installable, versioned skills.",
  },
  {
    title: "Paid equity evaluation API",
    body: "Structured company analysis, evidence packs, LLM comparison, and valuation/risk summaries exposed as a paid API.",
  },
  {
    title: "Paid market data / research artifacts",
    body: "Cleaned snapshots, quality-labeled datasets, and evidence artifacts sold as research-grade data products.",
  },
];

export default function CommercializationRoadmap() {
  return (
    <div className="commercial-roadmap" data-testid="commercialization-roadmap">
      <p className="section-lead">
        Expected revenue streams and sustainability plan — not a claim of existing revenue.
      </p>
      <div className="commercial-grid">
        {STREAMS.map((s) => (
          <div className="commercial-item" key={s.title}>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
      <div className="commercial-trading-note">
        <h4>Trading profit — long-term upside only, never a current claim</h4>
        <p>
          Any trading-profit stream follows only after backtesting, a validated
          forward track record, an approval workflow, and strict risk controls.
          Autonomous trading is <strong>not</strong> a current product — the
          staged Trading Gateway stays fail-closed until that bar is met.
        </p>
      </div>
    </div>
  );
}

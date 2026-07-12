/**
 * ArchitectureSection — high-level + deployment architecture visuals and the
 * deployment posture, rendered inside the Judge Demo / Qwen Proof page.
 *
 * Images are served statically from frontend/public/. Doc links point at the
 * GitHub repo so they resolve from the deployed standalone app.
 */

const REPO = "https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon/blob/main";

const DEPLOY_CARDS: { title: string; role: string; detail: string; kind: string }[] = [
  {
    title: "Vercel + Railway",
    role: "Primary production path",
    detail: "Railway is the single canonical writer to the production database.",
    kind: "writer",
  },
  {
    title: "GCP Cloud Run",
    role: "Gemini shadow / proof",
    detail: "Isolated shadow data role. Writes fail-closed OFF.",
    kind: "shadow",
  },
  {
    title: "Alibaba Cloud ECS ★",
    role: "Qwen shadow / proof",
    detail: "Nginx · Docker FastAPI · DashScope (Qwen) · RDS selected evidence mirror. Writes fail-closed OFF.",
    kind: "shadow",
  },
  {
    title: "This public repo",
    role: "Offline judge demo",
    detail: "Docker Compose, bundled samples, no secrets, no production writes.",
    kind: "demo",
  },
];

const DOC_LINKS: { label: string; href: string }[] = [
  { label: "Deployment architecture", href: `${REPO}/docs/deployment_architecture.md` },
  { label: "Public / private scope", href: `${REPO}/docs/public_private_scope.md` },
  { label: "Qwen value for Asia research", href: `${REPO}/docs/qwen_value_for_asia_research.md` },
  { label: "Commercialization plan", href: `${REPO}/docs/commercialization_plan.md` },
];

export default function ArchitectureSection() {
  return (
    <div className="architecture-section" data-testid="architecture-section">
      <p className="section-lead">
        One code source, several deployment substrates, and exactly one canonical
        production writer. Qwen is proven on Alibaba Cloud; this public repo is
        the offline judge demo.
      </p>

      <div className="arch-images">
        <figure className="arch-figure">
          <img
            src="/pantheon_research_high_level_architecture.png"
            alt="Pantheon Research high-level architecture"
            loading="lazy"
          />
          <figcaption>High-level architecture — data platform → deterministic + LLM overlay → human review.</figcaption>
        </figure>
        <figure className="arch-figure">
          <img
            src="/pantheon_deployment_architecture.svg"
            alt="Pantheon Research deployment architecture"
            loading="lazy"
          />
          <figcaption>Deployment architecture — one canonical writer, Qwen/Alibaba proof, no full RDS clone.</figcaption>
        </figure>
      </div>

      <div className="arch-deploy-grid">
        {DEPLOY_CARDS.map((c) => (
          <div className={`arch-deploy-card arch-deploy-${c.kind}`} key={c.title}>
            <h4>{c.title}</h4>
            <p className="arch-deploy-role">{c.role}</p>
            <p className="arch-deploy-detail">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="arch-constraint">
        <strong>Canonical-writer constraint:</strong> exactly one canonical writer
        (Railway). Shadows (GCP, Alibaba) never mutate the canonical database —
        their write path and scheduler are fail-closed OFF by role.
        <strong> Non-claims:</strong> no three production writers, no active-active
        database, no automatic cross-cloud failover, and no full production-database
        clone (Alibaba RDS is a selected evidence mirror).
      </div>

      <div className="arch-doc-links">
        {DOC_LINKS.map((d) => (
          <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer">
            {d.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

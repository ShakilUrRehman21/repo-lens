import Link from 'next/link'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './landing.css'

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '600'], variable: '--rl-sans' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--rl-mono' })

const features = [
  ['A-02', 'Five-stage diagnostics', 'Architecture, security, code quality, technical debt and maintainability, audited in one pass.'],
  ['A-03', 'PR review bot', 'Webhook-driven diff analysis that posts structured review comments straight onto your pull requests.'],
  ['A-04', 'Health dashboard', 'Radial score gauges, issue breakdowns and health trends across every scan.'],
  ['A-05', 'Reports and sharing', 'Export markdown audit reports or share a secure public link to any inspection.'],
  ['A-06', 'Built for private code', 'Encrypted tokens, verified webhooks and ephemeral processing. Your code is not stored.'],
]

export default function LandingPage() {
  return (
    <div className={`rl ${sans.variable} ${mono.variable}`}>
      <div className="rl-bp" aria-hidden />
      <header className="rl-wrap rl-nav">
        <Link href="/" className="rl-brand">REPOLENS</Link>
        <nav>
          <a href="#features">features</a>
          <Link href="/sign-in">sign in</Link>
          <Link href="/sign-up" className="rl-btn rl-btn-sm">get started</Link>
        </nav>
      </header>

      <main>
        <section className="rl-wrap rl-hero">
          <div>
            <h1 className="rl-rise">The <u>blueprint</u> of your codebase, with every crack marked.</h1>
            <p className="rl-rise rl-d1">Connect a repo. Get the architecture mapped, security issues flagged, tech debt sized and pull requests reviewed.</p>
            <div className="rl-ctas rl-rise rl-d2">
              <Link href="/sign-up" className="rl-btn">Analyze a repository</Link>
              <Link href="/sign-in" className="rl-ghost">I have an account</Link>
            </div>
            <p className="rl-note rl-rise rl-d3">// public or private GitHub repos</p>
          </div>

          <svg className="rl-plan rl-rise rl-d2" viewBox="0 0 460 360" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label="Repository drawn as an architecture plan">
            <g className="rl-txt">
              <rect x="170" y="20" width="120" height="44" /><text x="200" y="47">app/</text>
              <rect x="30" y="150" width="120" height="44" /><text x="62" y="177">api/</text>
              <rect x="170" y="150" width="120" height="44" /><text x="186" y="177">components/</text>
              <rect x="100" y="280" width="120" height="44" /><text x="140" y="307">db/</text>
              <rect x="250" y="280" width="120" height="44" strokeDasharray="5 4" /><text x="280" y="307">legacy/</text>
            </g>
            <rect x="310" y="150" width="120" height="44" className="rl-warn" strokeWidth="2" />
            <text x="346" y="177" className="rl-warn-t">auth/</text>
            <path className="rl-draw" d="M230 64v40H90v46M230 104v46M230 104h140v46M90 194v40h70v46M370 194v40h-60v46" />
            <circle cx="425" cy="152" r="11" className="rl-dot" />
            <text x="421" y="156" className="rl-dot-t">!</text>
            <text x="300" y="138" className="rl-warn-t rl-sm">token stored in localStorage</text>
            <text x="252" y="344" className="rl-sm rl-dim">debt approx. 6h &middot; unused module</text>
          </svg>
        </section>

        <section id="features" className="rl-wrap rl-feat">
          <div className="rl-head">
            <span>SHEET A-02 TO A-06</span>
            <h2>What gets inspected</h2>
          </div>
          <div className="rl-grid">
            {features.map(([id, t, d]) => (
              <div key={id} className="rl-card">
                <span className="rl-id">{id}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
            <Link href="/sign-up" className="rl-card rl-card-cta">
              <span className="rl-id">NEXT</span>
              <h3>Run your first scan &rarr;</h3>
              <p>Takes a repo URL. Nothing to install.</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="rl-wrap rl-foot">
        <div className="rl-tb">
          <span>PROJECT</span><span>RepoLens</span>
          <span>SHEET</span><span>A-01</span>
          <span>REV</span><span>{new Date().getFullYear()}</span>
        </div>
        <nav>
          <Link href="/sign-in">sign in</Link>
          <Link href="/sign-up">sign up</Link>
        </nav>
      </footer>
    </div>
  )
}

import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, GitPullRequest, Zap, GitBranch, Star, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Shield,
    title: 'Security Audit',
    description: 'Detect hardcoded secrets, XSS risks, SQL injection, and auth vulnerabilities automatically.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Architecture Score',
    description: 'Identify MVC, layered, or chaotic patterns. Detect tight coupling and structural issues.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: GitPullRequest,
    title: 'PR Automation',
    description: 'Auto-review pull requests with AI. Get risk scores and breaking change probability.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Technical Debt Index',
    description: 'Prioritize refactors. See which files carry the most risk and need attention first.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 scans per day', 'Up to 50 files per repo', 'Basic security scan', 'Score dashboard', 'PDF export'],
    cta: 'Get Started',
    ctaHref: '/sign-up',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: ['Unlimited scans', 'All repo sizes', 'Full 5-stage AI pipeline', 'PR automation', 'Priority processing', 'Team sharing'],
    cta: 'Start Free Trial',
    ctaHref: '/sign-up',
    popular: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 bg-[#0a0b0f]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">GithubScanner</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-8 py-24 text-center max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent" />
        <Badge className="mb-6 bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30">
          <Zap className="w-3 h-3 mr-1" /> AI-Powered · 5-Stage Analysis Pipeline
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="gradient-text">Understand Your</span>
          <br />
          <span className="text-slate-100">Codebase Like Never</span>
          <br />
          <span className="text-slate-100">Before</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          GithubScanner analyzes your GitHub repositories with AI to surface architecture flaws, security risks,
          technical debt, and scalability issues — automatically.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 text-base glow-indigo">
              Analyze Your Repo Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:border-white/20 h-12 px-8 text-base">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 mt-16 text-center">
          {[
            { value: '50+', label: 'Metrics Tracked' },
            { value: '5', label: 'Analysis Stages' },
            { value: '< 2min', label: 'Per Scan' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 mb-3">Everything You Need</h2>
          <p className="text-slate-400">Five analysis stages. One comprehensive score.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className={`glass glass-hover card-shine p-6 rounded-xl border ${f.bg}`}>
                <div className={`w-10 h-10 rounded-lg ${f.bg} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Scoring breakdown */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-8 border border-white/5">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Weighted Scoring System</h2>
          <div className="space-y-4">
            {[
              { label: 'Architecture', weight: 25, color: 'bg-indigo-500' },
              { label: 'Security', weight: 25, color: 'bg-red-500' },
              { label: 'Maintainability', weight: 20, color: 'bg-green-500' },
              { label: 'Scalability', weight: 15, color: 'bg-purple-500' },
              { label: 'Performance', weight: 15, color: 'bg-amber-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="w-32 text-sm text-slate-400">{s.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${s.weight * 4}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-300 w-10 text-right">{s.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 mb-3">Simple Pricing</h2>
          <p className="text-slate-400">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass p-8 rounded-2xl border ${plan.popular ? 'border-indigo-500/40 glow-indigo' : 'border-white/10'}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white border-0">
                  Most Popular
                </Badge>
              )}
              <h3 className="text-xl font-bold text-slate-100 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                <span className="text-slate-500 text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-[10px] text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref}>
                <Button
                  className={`w-full h-11 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-3 h-3" />
          <span>Your code is never stored. Tokens are encrypted. Analysis is ephemeral.</span>
        </div>
        <p>© 2026 GithubScanner. Built for engineers, by engineers.</p>
      </footer>
    </div>
  )
}

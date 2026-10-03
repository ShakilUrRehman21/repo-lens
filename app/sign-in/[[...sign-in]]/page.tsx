import { SignIn } from '@clerk/nextjs'
import { Logo } from '@/components/ui/logo'

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-[#0D0E12] flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4F63C]/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4F63C]/[0.04] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <Logo href="/" variant="light" size="md" showTagline />
                </div>

                {/* Middle content */}
                <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Continuous Code<br />Intelligence
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            AI-powered repository analysis. Detect architectural risks, security vulnerabilities, and technical debt in seconds.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        {[
                            { dot: 'bg-[#D4F63C]', text: '5-Stage AST Analysis Engine' },
                            { dot: 'bg-purple-400', text: 'Zero-Retention Security Scans' },
                            { dot: 'bg-blue-400', text: 'Automated PR Review Bot' },
                        ].map(({ dot, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                                <span className="text-xs text-white/60 font-medium">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stat card */}
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-1">
                        <p className="text-[11px] text-white/40 font-mono uppercase tracking-wider">Avg. scan time</p>
                        <p className="text-2xl font-black text-white tracking-tight">
                            {'<'}60<span className="text-sm font-normal text-white/40 ml-1">seconds</span>
                        </p>
                        <p className="text-[11px] text-[#D4F63C] font-mono">Across 500+ files</p>
                    </div>
                </div>

                {/* Bottom legal */}
                <p className="text-[11px] text-white/25 relative z-10">
                    &copy; {new Date().getFullYear()} RepoLens. All rights reserved.
                </p>
            </div>

            {/* Right Auth Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                {/* Mobile-only logo */}
                <div className="lg:hidden mb-10">
                    <Logo href="/" size="md" />
                </div>

                <div className="w-full flex justify-center">
                    <SignIn />
                </div>
            </div>
        </div>
    )
}

import { SignUp } from '@clerk/nextjs'
import { Logo } from '@/components/ui/logo'

export default function SignUpPage() {
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
                        <div className="inline-block px-3 py-1.5 rounded-full border border-[#D4F63C]/30 bg-[#D4F63C]/10 text-[#D4F63C] text-[11px] font-bold uppercase tracking-wider">
                            Free for Public Repos
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Start scanning<br />your codebase
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            Join thousands of engineering teams using RepoLens to maintain zero-debt codebases and ship with confidence.
                        </p>
                    </div>

                    {/* What's included */}
                    <div className="space-y-3">
                        {[
                            { dot: 'bg-[#D4F63C]', text: 'Unlimited public repo scans — free forever' },
                            { dot: 'bg-emerald-400', text: 'AI architecture + security reports' },
                            { dot: 'bg-purple-400', text: 'PR review bot on private repos (Pro)' },
                            { dot: 'bg-blue-400', text: 'Exportable PDF + JSON reports' },
                        ].map(({ dot, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                                <span className="text-xs text-white/60 font-medium">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <svg key={i} className="w-3.5 h-3.5 text-[#D4F63C] fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-[12px] text-white/60 leading-relaxed italic">
                            &ldquo;RepoLens caught 3 critical auth bypasses we&apos;d missed for months.&rdquo;
                        </p>
                        <p className="text-[11px] text-white/30 font-mono">— Senior Engineer, fintech startup</p>
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
                    <SignUp />
                </div>
            </div>
        </div>
    )
}

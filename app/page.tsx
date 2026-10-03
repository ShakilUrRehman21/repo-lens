'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
    Zap,
    Shield,
    TrendingUp,
    GitPullRequest,
    Lock,
    ArrowUpRight,
    ArrowDown,
    Check,
    Plus,
    Minus,
    ExternalLink,
    Terminal,
    Layers,
    Code2,
    ShieldCheck,
    Cpu,
    Sparkles,
    CheckCircle2,
    Smartphone,
    Globe,
    Key,
    RefreshCw,
    Activity,
    Sliders,
    Github,
    Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FAQ_ITEMS = [
    {
        id: '01',
        question: 'Is my repository code safe and private?',
        answer: 'Yes, absolutely. RepoLens operates on a zero-retention ephemeral architecture. When an analysis is initiated, files are pulled into isolated memory buffers, scanned, and permanently purged immediately after report generation. We never store, cache, or train machine learning models on your proprietary source code.'
    },
    {
        id: '02',
        question: 'Which programming languages and frameworks are supported?',
        answer: 'RepoLens natively supports TypeScript, JavaScript, Python, Go, Rust, Java, C++, PHP, and modern web frameworks including React, Next.js, Vue, Node.js, and Django. We continuously update syntax grammars and AST tokenizers for newly released versions.'
    },
    {
        id: '03',
        question: 'How can I connect my private GitHub repositories?',
        answer: 'You can securely connect private repositories in one click using GitHub OAuth and our verified GitHub App. You retain full control over repository permissions and can revoke access anytime directly from your GitHub settings.'
    },
    {
        id: '04',
        question: 'How long does a complete repository scan take?',
        answer: 'A standard repository containing 50 to 500 files is typically analyzed in 30 to 75 seconds. Our hybrid pipeline pairs ultra-low latency Groq token processing with Gemini 2.0 Flash for parallelized semantic reasoning.'
    },
    {
        id: '05',
        question: 'Are there any fees or hidden costs for open-source repos?',
        answer: 'No. RepoLens is 100% free forever for public open-source projects (up to 3 comprehensive scans per day). For private repositories, unlimited scans, and automated GitHub PR review bots, we offer straightforward Pro and Team plans.'
    },
    {
        id: '06',
        question: 'How does automated PR review integration work?',
        answer: 'Once you install the RepoLens GitHub App or configure a webhook on your repository, every opened pull request triggers a targeted diff scan. RepoLens evaluates breaking change probability, detects security risks in new lines, and posts a clean contextual review comment directly on the PR.'
    }
]

const TELEMETRY_MILESTONES = [
    { label: 'Wk 1', height: 45, reduction: '3.2%', note: 'Initial AST baseline established' },
    { label: 'Wk 2', height: 55, reduction: '4.8%', note: 'Hardcoded secrets extracted & vaulted' },
    { label: 'Wk 3', height: 65, reduction: '5.6%', note: 'Circular auth dependencies decoupled' },
    { label: 'Wk 4', height: 50, reduction: '6.1%', note: 'God class split into service layer' },
    { label: 'Wk 5', height: 75, reduction: '7.4%', note: 'Database connection pooling refactored' },
    { label: 'Wk 6', height: 60, reduction: '7.8%', note: 'Async unhandled promises resolved' },
    { label: 'Wk 7', height: 85, reduction: '8.16%', note: 'Peak architecture modularity achieved' },
    { label: 'Wk 8', height: 95, reduction: '9.2%', note: 'Automated PR gates preventing regressions' },
    { label: 'Wk 9', height: 80, reduction: '9.8%', note: 'Monolith package boundary enforcement' },
    { label: 'Wk 10', height: 90, reduction: '11.4%', note: 'Continuous zero-debt target maintained' },
]

export default function ZenCryptoLandingPage() {
    // Interactive State: Phone Mockup Switches
    const [astActive, setAstActive] = useState(true)
    const [securityActive, setSecurityActive] = useState(true)
    const [couplingActive, setCouplingActive] = useState(false)

    // Interactive State: Diagnostics Simulator
    const [isScanning, setIsScanning] = useState(false)
    const [fileCount, setFileCount] = useState(17908)
    const [scanDuration, setScanDuration] = useState('2.4s')
    const [activeStageText, setActiveStageText] = useState('Idle')

    // Interactive State: Telemetry Graph
    const [activeMilestone, setActiveMilestone] = useState(6)
    const [isSimulatingRefactor, setIsSimulatingRefactor] = useState(false)

    // Interactive State: Feature Expanded Drawer
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<string | null>('02')

    const toggleFaq = (id: string) => {
        setOpenFaq(prev => prev === id ? null : id)
    }

    // Dynamic Health Score calculation based on toggles
    const calculateScore = () => {
        let base = 75
        if (astActive) base += 12
        if (securityActive) base += 11.4
        if (couplingActive) base += 1.6
        return base.toFixed(1)
    }

    // Interactive trigger for Diagnostics Scan
    const handleTriggerScan = () => {
        if (isScanning) return
        setIsScanning(true)
        setActiveStageText('Tokenizing AST...')
        setScanDuration('Running...')

        setTimeout(() => {
            setActiveStageText('Scanning Security Vectors...')
            setFileCount(prev => prev + 342)
        }, 400)

        setTimeout(() => {
            setActiveStageText('Building Coupling Graph...')
        }, 900)

        setTimeout(() => {
            setActiveStageText('Completed')
            setScanDuration('1.8s')
            setIsScanning(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen w-full bg-[#FFFFFF] text-[#0D0E12] font-sans antialiased selection:bg-[#D4F63C] selection:text-black">
            {/* ——— TOP NAVIGATION ——— */}
            <header className="w-full border-b border-black/[0.06] sticky top-0 bg-white/95 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Logo href="/" size="md" />

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-9 text-xs sm:text-sm font-medium text-[#4B4F59]">
                        <a href="#about" className="hover:text-black transition-colors">About us</a>
                        <a href="#diagnostics" className="hover:text-black transition-colors">Diagnostics</a>
                        <a href="#features" className="hover:text-black transition-colors">Features</a>
                        <a href="#security" className="hover:text-black transition-colors">Security</a>
                        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
                    </nav>

                    {/* Nav Action Button */}
                    <div className="flex items-center gap-3">
                        <Link href="/sign-in" className="hidden sm:inline-block text-xs font-semibold text-[#4B4F59] hover:text-black px-3 py-2">
                            Sign in
                        </Link>
                        <Link href="/sign-up">
                            <button className="bg-[#0D0E12] hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow">
                                Scan Repo
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ——— HERO SECTION ——— */}
            <section className="w-full">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-16 lg:py-20">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

                        {/* Left Column: Bold Headline & CTA */}
                        <div className="lg:col-span-6 space-y-6">
                            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-[#0D0E12] leading-[1.05]">
                                Secure &<br />
                                Easy-to-Use<br />
                                Code Diagnostics
                            </h1>

                            <p className="text-xs sm:text-sm font-mono text-[#555962] tracking-wide uppercase pt-1">
                                Audit, Scan & Optimize Repositories with Confidence
                            </p>

                            {/* Electric Lime Action Button */}
                            <div className="pt-2">
                                <Link href="/sign-up">
                                    <button className="inline-flex items-center gap-2 bg-[#D4F63C] hover:bg-[#c9ee30] text-[#0D0E12] text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5">
                                        <span>Get Started</span>
                                        <ArrowUpRight className="w-4 h-4 text-[#0D0E12]" />
                                    </button>
                                </Link>
                            </div>

                            {/* Platform Store Pills (Lucide Icons, No Emojis) */}
                            <div className="flex flex-wrap items-center gap-3 pt-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-[#F6F7F3] text-xs font-semibold text-[#0D0E12] shadow-xs">
                                    <Github className="w-3.5 h-3.5 text-black" />
                                    <span>GitHub App</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-[#F6F7F3] text-xs font-semibold text-[#0D0E12] shadow-xs">
                                    <Terminal className="w-3.5 h-3.5 text-black" />
                                    <span>CI/CD Webhook</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: The Iconic ZenCrypto Lime Card & Device (Crop wheel removed, interactive toggles added) */}
                        <div className="lg:col-span-6">
                            <div className="bg-[#D4F63C] rounded-[36px] p-6 sm:p-10 relative flex items-center justify-center min-h-[470px] overflow-hidden shadow-sm">

                                {/* Smartphone Mockup Container (Interactive Dark Device) */}
                                <div className="w-full max-w-[320px] bg-[#0E0F15] text-white rounded-[32px] p-5 shadow-2xl border-4 border-[#1B1D26] space-y-4 relative z-10 transition-all duration-300">
                                    {/* Speaker/Camera notch */}
                                    <div className="w-20 h-4 bg-black rounded-full mx-auto mb-2" />

                                    {/* Dynamic Floating Top Card */}
                                    <div className="bg-[#1A1C24] p-3 rounded-2xl border border-white/10 space-y-1 shadow-md">
                                        <p className="text-[10px] text-slate-400 font-medium">Active repository</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white tracking-tight">
                                                {calculateScore()} / 100 HEALTH
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4F63C] text-black font-extrabold">
                                                {Number(calculateScore()) >= 95 ? 'A+' : Number(calculateScore()) >= 90 ? 'A' : 'B+'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-emerald-400 font-mono">
                                            {securityActive ? '0 CVEs' : '2 Warnings'} · {astActive ? 'AST Verified' : 'Standard'} · {couplingActive ? 'Decoupled' : '14% Debt'}
                                        </p>
                                    </div>

                                    {/* Current Health Score */}
                                    <div className="pt-2 text-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#D4F63C] mx-auto flex items-center justify-center text-xs font-bold mb-2 text-[#D4F63C]">
                                            RL
                                        </div>
                                        <p className="text-[11px] text-slate-400">Current balance</p>
                                        <div className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
                                            {calculateScore()}<span className="text-xs text-slate-400 font-mono ml-1">INDEX</span>
                                        </div>
                                    </div>

                                    {/* Interactive Feature Toggles (Clickable with smooth spring effects) */}
                                    <div className="space-y-2 pt-2 text-xs">
                                        {/* Toggle 1: AST Engine */}
                                        <button
                                            type="button"
                                            onClick={() => setAstActive(!astActive)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Terminal className={`w-3.5 h-3.5 ${astActive ? 'text-[#D4F63C]' : 'text-slate-500'}`} />
                                                <span className="text-[11px] font-semibold text-slate-200">AST Engine</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors duration-200 ${astActive ? 'bg-[#FF6B35] justify-end' : 'bg-white/20 justify-start'}`}>
                                                <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </button>

                                        {/* Toggle 2: Security Sentinel */}
                                        <button
                                            type="button"
                                            onClick={() => setSecurityActive(!securityActive)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Shield className={`w-3.5 h-3.5 ${securityActive ? 'text-purple-400' : 'text-slate-500'}`} />
                                                <span className="text-[11px] font-semibold text-slate-200">Security Sentinel</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors duration-200 ${securityActive ? 'bg-[#D4F63C] justify-end' : 'bg-white/20 justify-start'}`}>
                                                <div className="w-3 h-3 bg-black rounded-full shadow-sm" />
                                            </div>
                                        </button>

                                        {/* Toggle 3: Coupling Graph */}
                                        <button
                                            type="button"
                                            onClick={() => setCouplingActive(!couplingActive)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Layers className={`w-3.5 h-3.5 ${couplingActive ? 'text-blue-400' : 'text-slate-500'}`} />
                                                <span className="text-[11px] font-semibold text-slate-200">Coupling Graph</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors duration-200 ${couplingActive ? 'bg-[#FF6B35] justify-end' : 'bg-white/20 justify-start'}`}>
                                                <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Caption Bottom-Right */}
                                <div className="absolute bottom-5 right-6 text-right">
                                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-black/70">
                                        Audit Your Repository<br />With Ease
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ——— SECTION 2: OUR MISSION ——— */}
            <section id="about" className="w-full py-20 sm:py-24 border-t border-black/[0.06]">
                <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center space-y-5">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#0D0E12] shadow-sm">
                            Our Mission
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0D0E12] leading-tight">
                        We provide a secure, intuitive,<br className="hidden sm:inline" />
                        and efficient platform
                    </h2>

                    <p className="text-xs sm:text-sm text-[#555962] max-w-xl mx-auto leading-relaxed">
                        We believe in a deterministic future where engineering teams have complete visibility and continuous control over their architectural assets.
                    </p>
                </div>
            </section>

            {/* ——— SECTION 3: FAST & SUB-SECOND DIAGNOSTICS (Interactive Simulator) ——— */}
            <section id="diagnostics" className="w-full py-20 border-t border-black/[0.06] bg-[#FAFAF8]">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        {/* Left: Copy */}
                        <div className="lg:col-span-6 space-y-4">
                            <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#0D0E12] shadow-sm">
                                Diagnostics
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0D0E12] tracking-tight">
                                Fast & Sub-Second<br />
                                Diagnostics
                            </h3>
                            <p className="text-xs sm:text-sm text-[#555962] leading-relaxed max-w-md">
                                Send and inspect codebase health instantly with zero queue latency. Our dual-engine AST and LLM pipeline guarantees deep structural reviews without excessive cloud costs or slow build steps.
                            </p>
                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    onClick={handleTriggerScan}
                                    disabled={isScanning}
                                    className="inline-flex items-center gap-2 bg-[#0D0E12] hover:bg-black text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 text-[#D4F63C] ${isScanning ? 'animate-spin' : ''}`} />
                                    <span>{isScanning ? 'Running Scan...' : 'Trigger Live Demo Scan'}</span>
                                </button>
                                <span className="text-xs font-mono text-slate-500">
                                    Stage: <span className="font-semibold text-black">{activeStageText}</span>
                                </span>
                            </div>
                        </div>

                        {/* Right: Electric Lime Card with Hand/Inspector Device (Interactive Simulation) */}
                        <div className="lg:col-span-6 flex justify-center lg:justify-end">
                            <div className="w-full max-w-md bg-[#D4F63C] rounded-[36px] p-8 flex items-center justify-center min-h-[340px] shadow-sm relative">
                                <div className="w-64 bg-[#0D0E12] text-white rounded-[28px] p-5 shadow-2xl border-4 border-[#1E202B] space-y-3">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-2">
                                        <span>Diagnostics</span>
                                        <span className="text-[#D4F63C] font-mono font-bold">{scanDuration}</span>
                                    </div>
                                    <div className="text-center py-2">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Scanned Files</p>
                                        <p className="text-2xl font-black text-white font-mono tracking-tight">
                                            {fileCount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => {
                                                    setFileCount(prev => prev + Number(n) * 12)
                                                }}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 font-bold transition-colors cursor-pointer"
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleTriggerScan}
                                        disabled={isScanning}
                                        className="w-full py-2 bg-[#FF6B35] hover:bg-[#e85a24] text-white rounded-xl text-xs font-bold mt-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        <Play className="w-3 h-3 fill-white" />
                                        <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ——— SECTION 4: 4-COLUMN FEATURE BENTO CARDS (Interactive Expandable Details) ——— */}
            <section id="features" className="w-full py-24 border-t border-black/[0.06] bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#0D0E12] shadow-sm">
                            Features
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0D0E12] tracking-tight">
                            We offer a safe, user-friendly,<br />
                            and efficient Code Intelligence App
                        </h3>
                        <p className="text-xs sm:text-sm text-[#555962] max-w-md mx-auto">
                            We envision an automated workflow where software engineering teams have continuous clarity over code quality and technical debt.
                        </p>
                    </div>

                    {/* 4 Feature Cards Row */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

                        {/* Card 1: Non-Custodial Scans */}
                        <div className="bg-[#FAFAF8] rounded-[28px] p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-black shadow-xs">
                                    <Lock className="w-4 h-4 text-black" />
                                </div>
                                <h4 className="text-base font-extrabold text-[#0D0E12]">Non-Custodial Scans</h4>
                                <p className="text-xs text-[#555962] leading-relaxed">
                                    Full control over your source code. Ephemeral memory analysis with zero code retention.
                                </p>
                                {expandedFeature === 1 && (
                                    <div className="p-3 bg-white rounded-xl border border-black/5 text-[11px] text-[#4B4F59] space-y-1">
                                        <p className="font-semibold text-black">Technical Specs:</p>
                                        <p>• In-memory ramdisk processing</p>
                                        <p>• Zero training agreement with LLMs</p>
                                        <p>• Cryptographic token hashing</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setExpandedFeature(expandedFeature === 1 ? null : 1)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[#D4F63C] hover:bg-[#cbf02e] px-4 py-2 rounded-lg w-fit transition-colors"
                            >
                                <span>{expandedFeature === 1 ? 'Show less' : 'Learn more'}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Card 2: Built-in PR Automation (THE ICONIC ELECTRIC LIME FEATURE CARD) */}
                        <div className="bg-[#D4F63C] rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-black">
                                    <GitPullRequest className="w-4 h-4 text-black" />
                                </div>
                                <h4 className="text-base font-extrabold text-[#0D0E12]">Built-In PR Review</h4>
                                <p className="text-xs text-[#2B3012] leading-relaxed font-medium">
                                    Deep repository inspections and regression probability directly within your pull request reviews.
                                </p>
                                {expandedFeature === 2 && (
                                    <div className="p-3 bg-black/10 rounded-xl text-[11px] text-[#1E230B] space-y-1 font-medium">
                                        <p className="font-bold text-black">Automated Guardrails:</p>
                                        <p>• Webhook triggered in under 3s</p>
                                        <p>• Inline line-by-line diff annotations</p>
                                        <p>• Non-blocking risk scoring</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setExpandedFeature(expandedFeature === 2 ? null : 2)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D0E12] hover:bg-black px-4 py-2 rounded-lg w-fit transition-colors"
                            >
                                <span>{expandedFeature === 2 ? 'Show less' : 'Learn more'}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Card 3: Biometric & Zero-Trust Security */}
                        <div className="bg-[#FAFAF8] rounded-[28px] p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-black shadow-xs">
                                    <ShieldCheck className="w-4 h-4 text-black" />
                                </div>
                                <h4 className="text-base font-extrabold text-[#0D0E12]">Zero-Trust Security</h4>
                                <p className="text-xs text-[#555962] leading-relaxed">
                                    Token encryption & authentication for extra intellectual property protection.
                                </p>
                                {expandedFeature === 3 && (
                                    <div className="p-3 bg-white rounded-xl border border-black/5 text-[11px] text-[#4B4F59] space-y-1">
                                        <p className="font-semibold text-black">Detection Vectors:</p>
                                        <p>• Secret leakage (Stripe, AWS, OpenAI)</p>
                                        <p>• SQL injection & auth bypasses</p>
                                        <p>• OWASP Top 10 vulnerabilities</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setExpandedFeature(expandedFeature === 3 ? null : 3)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[#D4F63C] hover:bg-[#cbf02e] px-4 py-2 rounded-lg w-fit transition-colors"
                            >
                                <span>{expandedFeature === 3 ? 'Show less' : 'Learn more'}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Card 4: Architecture Modularity */}
                        <div className="bg-[#FAFAF8] rounded-[28px] p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                            <div className="space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-black shadow-xs">
                                    <Layers className="w-4 h-4 text-black" />
                                </div>
                                <h4 className="text-base font-extrabold text-[#0D0E12]">Coupling Graph</h4>
                                <p className="text-xs text-[#555962] leading-relaxed">
                                    Send and receive architecture modularity insights effortlessly across repos.
                                </p>
                                {expandedFeature === 4 && (
                                    <div className="p-3 bg-white rounded-xl border border-black/5 text-[11px] text-[#4B4F59] space-y-1">
                                        <p className="font-semibold text-black">Graph Engine:</p>
                                        <p>• Tarjan SCC cyclical algorithm</p>
                                        <p>• Cross-file import dependency matrix</p>
                                        <p>• God class refactor rankings</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setExpandedFeature(expandedFeature === 4 ? null : 4)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[#D4F63C] hover:bg-[#cbf02e] px-4 py-2 rounded-lg w-fit transition-colors"
                            >
                                <span>{expandedFeature === 4 ? 'Show less' : 'Learn more'}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* ——— SECTION 5: SECURE & PRIVATE (Interactive Telemetry Graph) ——— */}
            <section id="security" className="w-full py-24 border-t border-black/[0.06] bg-[#FAFAF8]">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Left: Dark Phone Device Mockup with Interactive Graph */}
                        <div className="lg:col-span-6 flex justify-center">
                            <div className="w-full max-w-[340px] bg-[#CCD2BD] rounded-[36px] p-6 sm:p-8 flex items-center justify-center shadow-inner">
                                <div className="w-full bg-[#12131A] text-white rounded-[28px] p-5 shadow-2xl border-4 border-[#222430] space-y-4">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Telemetry</span>
                                        <span className="text-[#D4F63C] font-mono font-bold">
                                            {TELEMETRY_MILESTONES[activeMilestone].reduction} reduction
                                        </span>
                                    </div>

                                    {/* Hoverable / Clickable Frequency Bars */}
                                    <div className="h-32 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-xl border-b border-emerald-500/50 flex items-end justify-between px-3 pb-2 gap-2">
                                        {TELEMETRY_MILESTONES.map((m, i) => {
                                            const isSelected = activeMilestone === i
                                            return (
                                                <button
                                                    key={m.label}
                                                    type="button"
                                                    onClick={() => setActiveMilestone(i)}
                                                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer focus:outline-none"
                                                >
                                                    <div
                                                        className={`w-full rounded-t transition-all duration-300 ${isSelected ? 'bg-[#D4F63C] shadow-sm shadow-[#D4F63C]/50' : 'bg-emerald-400/80 group-hover:bg-emerald-300'}`}
                                                        style={{ height: `${m.height}%` }}
                                                    />
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Active Milestone Details */}
                                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                            <span>Milestone: {TELEMETRY_MILESTONES[activeMilestone].label}</span>
                                            <span className="text-emerald-400 font-bold">{TELEMETRY_MILESTONES[activeMilestone].reduction}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-200 leading-snug">
                                            {TELEMETRY_MILESTONES[activeMilestone].note}
                                        </p>
                                    </div>

                                    <p className="text-[10px] text-center text-slate-400">
                                        Click any bar above to inspect milestone telemetry
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Security & Private Copy */}
                        <div className="lg:col-span-6 space-y-5">
                            <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#0D0E12] shadow-sm">
                                Security
                            </span>
                            <h3 className="text-3xl sm:text-5xl font-extrabold text-[#0D0E12] tracking-tight">
                                Secure & Private
                            </h3>
                            <p className="text-xs sm:text-sm text-[#555962] leading-relaxed max-w-md">
                                Industry-leading AES-256 encryption and non-custodial memory storage ensure your proprietary code never leaks. We never train public AI models on your private intellectual property.
                            </p>
                            <div className="pt-2">
                                <Link href="/sign-up">
                                    <button className="inline-flex items-center gap-2 bg-[#D4F63C] hover:bg-[#c9ee30] text-[#0D0E12] text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                                        <span>Explore Security</span>
                                        <ArrowUpRight className="w-4 h-4 text-[#0D0E12]" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ——— SECTION 6: FREQUENTLY ASKED QUESTIONS ——— */}
            <section id="faq" className="w-full py-24 border-t border-black/[0.06] bg-white">
                <div className="max-w-4xl mx-auto px-6 sm:px-10">
                    <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-white text-xs font-semibold text-[#0D0E12] shadow-sm">
                            FAQs
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0D0E12] tracking-tight">
                            Frequently<br />asked questions
                        </h3>
                        <p className="text-xs sm:text-sm text-[#555962]">
                            We have given answers to the most popular questions below
                        </p>
                    </div>

                    {/* Accordion Container */}
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item) => {
                            const isOpen = openFaq === item.id
                            return (
                                <div
                                    key={item.id}
                                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'bg-[#F9FAF6] border-black/10 shadow-sm' : 'bg-[#F6F7F3] border-transparent hover:border-black/5'}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(item.id)}
                                        className="w-full px-6 py-4.5 flex items-center justify-between text-left gap-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-[11px] font-mono text-[#8B907E] font-bold">
                                                {item.id}
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold text-[#0D0E12]">
                                                {item.question}
                                            </span>
                                        </div>

                                        {/* Electric Lime Circle Toggle Button (+ / -) */}
                                        <div className="w-7 h-7 rounded-full bg-[#D4F63C] text-[#0D0E12] font-black flex items-center justify-center flex-shrink-0 shadow-sm">
                                            {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 pb-5 pt-1 text-xs text-[#555962] leading-relaxed border-t border-black/[0.04]">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ——— FOOTER ——— */}
            <footer className="w-full border-t border-black/[0.06] py-12 bg-[#F6F7F3]">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555962]">
                    <div className="flex items-center gap-3">
                        <Logo href="/" size="sm" />
                        <span className="text-black/40">· © 2026 RepoLens Inc.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#about" className="hover:text-black transition-colors">About</a>
                        <a href="#diagnostics" className="hover:text-black transition-colors">Diagnostics</a>
                        <a href="#features" className="hover:text-black transition-colors">Features</a>
                        <a href="#security" className="hover:text-black transition-colors">Security</a>
                        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
                        <Link href="/sign-in" className="font-semibold text-black hover:underline">Sign in</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis,
    Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Zap, BarChart3, ArrowUpRight, GitBranch } from 'lucide-react'
import { getScoreBgColor, getRiskBadgeColor } from '@/lib/ai/scoring'

type ScanData = {
    overallScore: number | null
    architectureScore: number | null
    securityScore: number | null
    scalabilityScore: number | null
    performanceScore: number | null
    maintainabilityScore: number | null
    technicalDebtIndex: number | null
    improvementSummary: string | null
    fileReviews: { filePath: string; fileScore: number | null; riskLevel: string | null }[]
}

function ScoreRadial({ score, label, color }: { score: number; label: string; color: string }) {
    const data = [{ value: score }]
    return (
        <div className="flex flex-col items-center">
            <div className="w-20 h-20 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="100%"
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background={{ fill: '#F6F7F3' }} dataKey="value" angleAxisId={0} cornerRadius={5}>
                            <Cell fill={color} />
                        </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-extrabold text-[#0D0E12]">{score}</span>
                </div>
            </div>
            <p className="text-[11px] font-semibold text-[#555962] mt-1.5">{label}</p>
        </div>
    )
}

export default function OverviewPage() {
    const { user } = useUser()
    const [scan, setScan] = useState<ScanData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Sync GitHub token, then fetch latest scan
        fetch('/api/user').catch(() => { })

        fetch('/api/scans/latest')
            .then((r) => {
                if (!r.ok) return null
                return r.json().catch(() => null)
            })
            .then((data) => {
                if (data?.scan) setScan(data.scan)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const scores = scan
        ? [
            { label: 'Architecture', score: Math.round(scan.architectureScore ?? 0), color: '#0D0E12' },
            { label: 'Security', score: Math.round(scan.securityScore ?? 0), color: '#ef4444' },
            { label: 'Maintainability', score: Math.round(scan.maintainabilityScore ?? 0), color: '#10b981' },
            { label: 'Scalability', score: Math.round(scan.scalabilityScore ?? 0), color: '#8b5cf6' },
            { label: 'Performance', score: Math.round(scan.performanceScore ?? 0), color: '#f59e0b' },
        ]
        : []

    const topRiskFiles = scan?.fileReviews
        .filter((f) => f.riskLevel === 'high' || f.riskLevel === 'critical')
        .sort((a, b) => (a.fileScore ?? 100) - (b.fileScore ?? 100))
        .slice(0, 5) ?? []

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header Greeting */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">
                    Welcome back, {user?.firstName ?? 'Developer'}
                </h2>
                <p className="text-[#555962] text-xs sm:text-sm mt-1">
                    {scan ? "Here is your latest repository health report and architectural index." : "Import a repository to start your first 5-stage automated scan."}
                </p>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl bg-white border border-black/[0.06]" />)}
                </div>
            ) : scan ? (
                <>
                    {/* Hero Score Card (ZenCrypto Style) */}
                    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.06] shadow-xs">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div>
                                <span className="inline-block px-3.5 py-1 rounded-full border border-black/10 bg-[#F6F7F3] text-[11px] font-semibold text-[#0D0E12] mb-3">
                                    Continuous Score
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-[#0D0E12]">
                                        {Math.round(scan.overallScore ?? 0)}
                                    </span>
                                    <span className="text-base text-[#8B907E] font-medium">/ 100</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4F63C] text-black">
                                        {(scan.overallScore ?? 0) >= 80 ? 'Healthy Codebase' : (scan.overallScore ?? 0) >= 60 ? 'Moderate Health' : 'Needs Immediate Refactor'}
                                    </span>
                                    <span className="text-xs text-[#555962] font-mono">AST Verified</span>
                                </div>
                            </div>

                            {/* Radials Group */}
                            <div className="flex flex-wrap items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/[0.06]">
                                {scores.map((s) => (
                                    <ScoreRadial key={s.label} score={s.score} label={s.label} color={s.color} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-semibold text-[#555962]">Technical Debt</span>
                            </div>
                            <p className="text-3xl font-extrabold text-[#0D0E12]">{Math.round(scan.technicalDebtIndex ?? 0)}%</p>
                            <p className="text-[11px] text-[#8B907E]">Relative to repo size</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-semibold text-[#555962]">Security</span>
                            </div>
                            <p className="text-3xl font-extrabold text-[#0D0E12]">{Math.round(scan.securityScore ?? 0)}<span className="text-sm font-normal text-[#8B907E]">/100</span></p>
                            <p className="text-[11px] text-[#8B907E]">Zero hardcoded secrets</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-2">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-semibold text-[#555962]">Flagged Files</span>
                            </div>
                            <p className="text-3xl font-extrabold text-[#0D0E12]">{topRiskFiles.length}</p>
                            <p className="text-[11px] text-[#8B907E]">High risk hotspots</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-semibold text-[#555962]">Maintainability</span>
                            </div>
                            <p className="text-3xl font-extrabold text-[#0D0E12]">{Math.round(scan.maintainabilityScore ?? 0)}<span className="text-sm font-normal text-[#8B907E]">/100</span></p>
                            <p className="text-[11px] text-[#8B907E]">Modularity score</p>
                        </div>
                    </div>

                    {/* Top Risk Files */}
                    {topRiskFiles.length > 0 && (
                        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                                <h3 className="text-sm font-bold text-[#0D0E12] flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-[#0D0E12]" />
                                    <span>Top Risk Files</span>
                                </h3>
                                <span className="text-xs text-[#555962] font-mono">{topRiskFiles.length} files requiring review</span>
                            </div>
                            <div className="space-y-2 pt-1">
                                {topRiskFiles.map((f) => (
                                    <div key={f.filePath} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-black/[0.04] hover:bg-[#F6F7F3] transition-colors">
                                        <span className="text-xs font-mono font-medium text-[#0D0E12] truncate max-w-sm">{f.filePath}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-[#555962]">Score: {Math.round(f.fileScore ?? 0)}</span>
                                            <Badge className={`text-[10px] font-bold uppercase rounded-lg px-2 py-0.5 ${f.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                                {f.riskLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Improvement Summary */}
                    {scan.improvementSummary && (
                        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
                                <TrendingUp className="w-4 h-4 text-[#0D0E12]" />
                                <h3 className="text-sm font-bold text-[#0D0E12]">AI Architecture Summary</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-[#555962] leading-relaxed pt-1">
                                {scan.improvementSummary}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                /* Empty state matching ZenCrypto theme */
                <div className="bg-white rounded-[32px] p-12 sm:p-16 border border-black/[0.06] shadow-xs text-center max-w-2xl mx-auto space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#0D0E12] text-[#D4F63C] flex items-center justify-center mx-auto shadow-sm">
                        <GitBranch className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D0E12]">No repository scans yet</h3>
                        <p className="text-xs sm:text-sm text-[#555962] max-w-md mx-auto leading-relaxed">
                            Connect your GitHub repositories or paste a public repository URL to run your first 5-stage AI code intelligence scan.
                        </p>
                    </div>
                    <div className="pt-2">
                        <Link href="/dashboard/repositories">
                            <button className="inline-flex items-center gap-2 bg-[#D4F63C] hover:bg-[#c9ee30] text-[#0D0E12] text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                                <span>Import & Scan Repository</span>
                                <ArrowUpRight className="w-4 h-4 text-[#0D0E12]" />
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

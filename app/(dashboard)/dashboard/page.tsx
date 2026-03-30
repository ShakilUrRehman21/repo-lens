'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
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
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Zap, BarChart3 } from 'lucide-react'
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
            <div className="w-24 h-24 relative">
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
                        <RadialBar background={{ fill: '#1e2130' }} dataKey="value" angleAxisId={0} cornerRadius={5}>
                            <Cell fill={color} />
                        </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-100">{score}</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{label}</p>
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
            { label: 'Architecture', score: Math.round(scan.architectureScore ?? 0), color: '#6366f1' },
            { label: 'Security', score: Math.round(scan.securityScore ?? 0), color: '#ef4444' },
            { label: 'Maintainability', score: Math.round(scan.maintainabilityScore ?? 0), color: '#22c55e' },
            { label: 'Scalability', score: Math.round(scan.scalabilityScore ?? 0), color: '#a855f7' },
            { label: 'Performance', score: Math.round(scan.performanceScore ?? 0), color: '#f59e0b' },
        ]
        : []

    const topRiskFiles = scan?.fileReviews
        .filter((f) => f.riskLevel === 'high' || f.riskLevel === 'critical')
        .sort((a, b) => (a.fileScore ?? 100) - (b.fileScore ?? 100))
        .slice(0, 5) ?? []

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-bold text-slate-100">
                    Welcome back, {user?.firstName ?? 'Developer'} 👋
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {scan ? "Here's your latest repository analysis." : "Import a repository to start your first scan."}
                </p>
            </div>

            {/* Overall Score */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />)}
                </div>
            ) : scan ? (
                <>
                    {/* Hero score card */}
                    <div className="glass rounded-2xl p-6 border border-white/5 glow-indigo">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Overall Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-extrabold gradient-text">
                                        {Math.round(scan.overallScore ?? 0)}
                                    </span>
                                    <span className="text-slate-500 text-lg">/100</span>
                                </div>
                                <Badge className={`mt-2 ${getScoreBgColor(scan.overallScore ?? 0)}`}>
                                    {(scan.overallScore ?? 0) >= 80 ? '✓ Healthy' : (scan.overallScore ?? 0) >= 60 ? '⚠ Moderate' : '✗ Needs Work'}
                                </Badge>
                            </div>
                            <div className="flex gap-6">
                                {scores.map((s) => (
                                    <ScoreRadial key={s.label} score={s.score} label={s.label} color={s.color} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="glass border-white/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-slate-500">Technical Debt</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-400">{Math.round(scan.technicalDebtIndex ?? 0)}</p>
                                <p className="text-xs text-slate-600 mt-1">Debt Index</p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-red-400" />
                                    <span className="text-xs text-slate-500">Security</span>
                                </div>
                                <p className="text-2xl font-bold text-red-400">{Math.round(scan.securityScore ?? 0)}</p>
                                <p className="text-xs text-slate-600 mt-1">Security Score</p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-slate-500">Risk Files</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">{topRiskFiles.length}</p>
                                <p className="text-xs text-slate-600 mt-1">High risk files</p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/5">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-slate-500">Maintainability</span>
                                </div>
                                <p className="text-2xl font-bold text-green-400">{Math.round(scan.maintainabilityScore ?? 0)}</p>
                                <p className="text-xs text-slate-600 mt-1">Score</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Risk Files */}
                    {topRiskFiles.length > 0 && (
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-red-400" /> Top Risk Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {topRiskFiles.map((f) => (
                                        <div key={f.filePath} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <span className="text-sm text-slate-300 font-mono truncate max-w-xs">{f.filePath}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-400">{Math.round(f.fileScore ?? 0)}</span>
                                                <Badge className={`text-xs border ${getRiskBadgeColor(f.riskLevel ?? 'low')}`}>
                                                    {f.riskLevel}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Improvement Summary */}
                    {scan.improvementSummary && (
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-400" /> AI Improvement Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 leading-relaxed">{scan.improvementSummary}</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                /* Empty state */
                <div className="glass rounded-2xl p-16 border border-white/5 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No scans yet</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                        Import a GitHub repository and run your first AI analysis to see results here.
                    </p>
                    <a href="/dashboard/repositories" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                        Import Repository →
                    </a>
                </div>
            )}
        </div>
    )
}

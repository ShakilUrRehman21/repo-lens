'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Shield, Zap, AlertTriangle, CheckCircle2, TrendingUp, Code2 } from 'lucide-react'
import { getScoreBgColor, getRiskBadgeColor } from '@/lib/ai/scoring'

type SharedScan = {
    id: number
    overallScore: number | null
    architectureScore: number | null
    securityScore: number | null
    maintainabilityScore: number | null
    scalabilityScore: number | null
    performanceScore: number | null
    technicalDebtIndex: number | null
    architectureSummary: string | null
    securitySummary: string | null
    improvementSummary: string | null
    createdAt: string
    repository?: { fullName: string; language: string | null }
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`text-3xl font-extrabold ${color}`}>{Math.round(score)}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
        </div>
    )
}

export default function SharePage() {
    const params = useParams()
    const token = params?.token as string
    const [scan, setScan] = useState<SharedScan | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        fetch(`/api/export/share/${token}`)
            .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error ?? 'Not found')))
            .then(d => setScan(d.scan))
            .catch(e => setError(typeof e === 'string' ? e : 'Invalid or expired share link'))
            .finally(() => setLoading(false))
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                    <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <span>Loading report...</span>
                </div>
            </div>
        )
    }

    if (error || !scan) {
        return (
            <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-slate-300 font-medium">Report not found</p>
                    <p className="text-slate-600 text-sm">{error ?? 'This link may have expired or been revoked.'}</p>
                </div>
            </div>
        )
    }

    const scores = [
        { label: 'Architecture', value: scan.architectureScore, color: 'text-indigo-400' },
        { label: 'Security', value: scan.securityScore, color: 'text-red-400' },
        { label: 'Maintainability', value: scan.maintainabilityScore, color: 'text-green-400' },
        { label: 'Scalability', value: scan.scalabilityScore, color: 'text-purple-400' },
        { label: 'Performance', value: scan.performanceScore, color: 'text-amber-400' },
    ]

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-slate-100">
            {/* Header */}
            <div className="border-b border-white/5 bg-[#0d0e14]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-slate-100">GithubScanner</span>
                        <span className="text-slate-600 text-sm ml-2">· Shared Report</span>
                    </div>
                    <span className="text-xs text-slate-600">
                        {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* Repo + Overall Score */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Repository</p>
                        <p className="text-2xl font-bold text-slate-100">
                            {scan.repository?.fullName ?? `Scan #${scan.id}`}
                        </p>
                        {scan.repository?.language && (
                            <p className="text-sm text-slate-500 mt-1">{scan.repository.language}</p>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Overall Score</p>
                        <div className={`text-6xl font-extrabold ${getScoreBgColor(scan.overallScore ?? 0).replace('bg-', 'text-').replace('/20', '')}`}>
                            {Math.round(scan.overallScore ?? 0)}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">out of 100</p>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />Score Breakdown
                    </p>
                    <div className="grid grid-cols-5 gap-4">
                        {scores.map(s => s.value != null && (
                            <ScoreRing key={s.label} score={s.value} label={s.label} color={s.color} />
                        ))}
                    </div>
                </div>

                {/* Technical Debt */}
                {scan.technicalDebtIndex != null && (
                    <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5 flex items-center gap-4">
                        <div className="text-4xl font-extrabold text-amber-400">{Math.round(scan.technicalDebtIndex)}</div>
                        <div>
                            <p className="text-sm font-semibold text-amber-300">Technical Debt Index</p>
                            <p className="text-xs text-slate-500">Higher = more debt. 0 = clean codebase.</p>
                        </div>
                    </div>
                )}

                {/* Summaries */}
                {[
                    { icon: Code2, label: 'Architecture Assessment', text: scan.architectureSummary, color: 'text-indigo-400' },
                    { icon: Shield, label: 'Security Assessment', text: scan.securitySummary, color: 'text-red-400' },
                    { icon: CheckCircle2, label: 'Improvement Summary', text: scan.improvementSummary, color: 'text-green-400' },
                ].filter(s => s.text).map(s => (
                    <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                        <p className={`text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 ${s.color}`}>
                            <s.icon className="w-3.5 h-3.5" />{s.label}
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">{s.text}</p>
                    </div>
                ))}

                <p className="text-center text-xs text-slate-700 py-4">
                    Generated by GithubScanner · AI-Powered Code Intelligence
                </p>
            </div>
        </div>
    )
}

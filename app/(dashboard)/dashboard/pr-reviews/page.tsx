'use client'

import { useEffect, useState } from 'react'
import { GitPullRequest, AlertTriangle, Zap, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getRiskBadgeColor } from '@/lib/ai/scoring'

type PRReview = {
    id: number
    prNumber: number
    prTitle: string | null
    riskScore: number | null
    breakingChangeProbability: number | null
    reviewSummary: string | null
    createdAt: string
    issues: { file: string; problem: string; severity: string; suggestion: string }[] | null
}

type ImportedRepo = { id: number; repoName: string; fullName: string }

export default function PRReviewsPage() {
    const [reviews, setReviews] = useState<PRReview[]>([])
    const [repos, setRepos] = useState<ImportedRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [selectedRepo, setSelectedRepo] = useState<string>('')
    const [prNumber, setPrNumber] = useState<string>('')
    const [selected, setSelected] = useState<PRReview | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const safeJson = (r: Response) => r.ok ? r.json().catch(() => ({})) : Promise.resolve({})
        Promise.all([
            fetch('/api/repos').then(safeJson),
            fetch('/api/pr-reviews').then(safeJson),
        ]).then(([repoData, reviewData]: any[]) => {
            setRepos(repoData.repos ?? [])
            setReviews(reviewData.reviews ?? [])
        }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    async function handleAnalyze() {
        if (!selectedRepo || !prNumber) return
        setAnalyzing(true)
        setError(null)
        const res = await fetch('/api/pr-reviews/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoId: parseInt(selectedRepo), prNumber: parseInt(prNumber) }),
        })
        const data = await res.json()
        if (data.error) {
            setError(data.error)
        } else if (data.review) {
            setReviews(prev => [data.review, ...prev])
            setSelected(data.review)
        }
        setAnalyzing(false)
    }

    const getRiskColor = (score: number) =>
        score >= 75 ? 'text-red-600' : score >= 50 ? 'text-amber-500' : 'text-emerald-600'

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">PR Reviews</h2>
                <p className="text-[#555962] text-xs sm:text-sm mt-1">AI-powered pull request analysis and risk assessment</p>
            </div>

            {/* Analyzer form */}
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-xs">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-[#0D0E12] flex items-center justify-center">
                        <GitPullRequest className="w-4 h-4 text-[#D4F63C]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0D0E12]">Analyze a Pull Request</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-[#555962] mb-1.5 block">Repository</label>
                        <select
                            value={selectedRepo}
                            onChange={e => setSelectedRepo(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-[#FAFAF8] border border-black/10 text-[#0D0E12] text-sm focus:outline-none focus:border-black transition-colors"
                        >
                            <option value="">Select repository...</option>
                            {repos.map(r => (
                                <option key={r.id} value={r.id}>{r.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[#555962] mb-1.5 block">PR Number</label>
                        <Input
                            type="number"
                            placeholder="e.g. 42"
                            value={prNumber}
                            onChange={e => setPrNumber(e.target.value)}
                            className="bg-[#FAFAF8] border-black/10 text-[#0D0E12] placeholder:text-[#8B907E] focus:border-black rounded-xl h-11"
                        />
                    </div>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <Button
                    className="mt-4 bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold rounded-xl h-11 px-6 shadow-xs transition-all"
                    onClick={handleAnalyze}
                    disabled={analyzing || !selectedRepo || !prNumber}
                >
                    {analyzing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />Analyzing PR...</>
                    ) : (
                        <><Zap className="w-4 h-4 mr-2" />Run AI Analysis</>
                    )}
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* PR list */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#555962] uppercase tracking-wider">Review History</h3>
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl bg-black/5" />)
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-[28px] p-12 border border-black/[0.06] shadow-xs text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F7F3] flex items-center justify-center mx-auto mb-3">
                                <GitPullRequest className="w-6 h-6 text-[#8B907E]" />
                            </div>
                            <p className="text-[#0D0E12] font-bold text-sm">No PR reviews yet</p>
                            <p className="text-[#555962] text-xs mt-1">Analyze a pull request to get started</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div
                                key={review.id}
                                className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-sm ${selected?.id === review.id ? 'border-[#D4F63C] shadow-sm' : 'border-black/[0.06]'}`}
                                onClick={() => setSelected(review)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-[#0D0E12]">PR #{review.prNumber}</p>
                                        <p className="text-xs text-[#555962] mt-0.5 truncate max-w-[180px]">{review.prTitle ?? 'Untitled'}</p>
                                    </div>
                                    <span className={`text-2xl font-extrabold ${getRiskColor(review.riskScore ?? 0)}`}>
                                        {Math.round(review.riskScore ?? 0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`text-[10px] border ${getRiskBadgeColor(
                                        (review.riskScore ?? 0) >= 75 ? 'critical' :
                                            (review.riskScore ?? 0) >= 50 ? 'high' :
                                                (review.riskScore ?? 0) >= 25 ? 'medium' : 'low'
                                    )}`}>
                                        Risk Score
                                    </Badge>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                                        {Math.round(review.breakingChangeProbability ?? 0)}% breaking
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PR detail */}
                <div>
                    {selected ? (
                        <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm font-bold text-[#0D0E12]">
                                    PR #{selected.prNumber} Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {/* Score meters */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-black/[0.06] space-y-1">
                                        <p className="text-xs text-[#555962] font-medium">Risk Score</p>
                                        <p className={`text-2xl font-extrabold ${getRiskColor(selected.riskScore ?? 0)}`}>
                                            {Math.round(selected.riskScore ?? 0)}/100
                                        </p>
                                    </div>
                                    <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-black/[0.06] space-y-1">
                                        <p className="text-xs text-[#555962] font-medium">Breaking Change</p>
                                        <p className="text-2xl font-extrabold text-purple-600">
                                            {Math.round(selected.breakingChangeProbability ?? 0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Summary */}
                                {selected.reviewSummary && (
                                    <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-black/[0.06]">
                                        <p className="text-xs font-semibold text-[#555962] mb-2">AI Summary</p>
                                        <p className="text-sm text-[#0D0E12] leading-relaxed">{selected.reviewSummary}</p>
                                    </div>
                                )}

                                {/* Issues */}
                                {selected.issues && selected.issues.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-[#555962] uppercase tracking-wider">Issues Found</p>
                                        {selected.issues.map((issue, i) => (
                                            <div key={i} className={`bg-white rounded-xl p-3 border ${issue.severity === 'critical' ? 'border-red-200 bg-red-50' :
                                                issue.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                                                    issue.severity === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-black/[0.06]'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={`text-[10px] border ${getRiskBadgeColor(issue.severity)}`}>
                                                        {issue.severity}
                                                    </Badge>
                                                    <span className="text-xs text-[#555962] font-mono truncate">{issue.file}</span>
                                                </div>
                                                <p className="text-sm text-[#0D0E12]">{issue.problem}</p>
                                                <p className="text-xs text-[#555962] mt-1 font-medium">→ {issue.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white rounded-[28px] p-12 border border-black/[0.06] shadow-xs text-center h-full flex flex-col items-center justify-center min-h-[280px]">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F7F3] flex items-center justify-center mx-auto mb-3">
                                <GitPullRequest className="w-6 h-6 text-[#8B907E]" />
                            </div>
                            <p className="text-[#0D0E12] font-bold text-sm">Select a review</p>
                            <p className="text-[#555962] text-xs mt-1">Click a PR review to see the full analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

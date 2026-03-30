'use client'

import { useEffect, useState } from 'react'
import { GitPullRequest, AlertTriangle, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react'
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
        score >= 75 ? 'text-red-400' : score >= 50 ? 'text-amber-400' : 'text-green-400'

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-100">PR Reviews</h2>
                <p className="text-slate-500 text-sm mt-0.5">AI-powered pull request analysis and risk assessment</p>
            </div>

            {/* Analyzer form */}
            <Card className="glass border-indigo-500/20 glow-indigo">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-indigo-400" />
                        Analyze a Pull Request
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">Repository</label>
                            <select
                                value={selectedRepo}
                                onChange={e => setSelectedRepo(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="">Select repository...</option>
                                {repos.map(r => (
                                    <option key={r.id} value={r.id}>{r.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1.5 block">PR Number</label>
                            <Input
                                type="number"
                                placeholder="e.g. 42"
                                value={prNumber}
                                onChange={e => setPrNumber(e.target.value)}
                                className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
                        onClick={handleAnalyze}
                        disabled={analyzing || !selectedRepo || !prNumber}
                    >
                        {analyzing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing PR...</>
                        ) : (
                            <><Zap className="w-4 h-4 mr-2" />Run AI Analysis</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* PR list */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Review History</h3>
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)
                    ) : reviews.length === 0 ? (
                        <div className="glass rounded-xl p-10 border border-white/5 text-center">
                            <GitPullRequest className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No PR reviews yet</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <Card
                                key={review.id}
                                className={`glass border-white/5 glass-hover card-shine cursor-pointer transition-all ${selected?.id === review.id ? 'border-indigo-500/30' : ''}`}
                                onClick={() => setSelected(review)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">PR #{review.prNumber}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{review.prTitle ?? 'Untitled'}</p>
                                        </div>
                                        <span className={`text-2xl font-bold ${getRiskColor(review.riskScore ?? 0)}`}>
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
                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                                            {Math.round(review.breakingChangeProbability ?? 0)}% breaking
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* PR detail */}
                <div>
                    {selected ? (
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-slate-300">
                                    PR #{selected.prNumber} Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Score meters */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="glass rounded-lg p-3 border border-white/5">
                                        <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                                        <p className={`text-2xl font-bold ${getRiskColor(selected.riskScore ?? 0)}`}>
                                            {Math.round(selected.riskScore ?? 0)}/100
                                        </p>
                                    </div>
                                    <div className="glass rounded-lg p-3 border border-white/5">
                                        <p className="text-xs text-slate-500 mb-1">Breaking Change %</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            {Math.round(selected.breakingChangeProbability ?? 0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Summary */}
                                {selected.reviewSummary && (
                                    <div className="glass rounded-lg p-4 border border-white/5">
                                        <p className="text-xs text-slate-500 mb-2">AI Summary</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{selected.reviewSummary}</p>
                                    </div>
                                )}

                                {/* Issues */}
                                {selected.issues && selected.issues.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Issues Found</p>
                                        {selected.issues.map((issue, i) => (
                                            <div key={i} className={`glass rounded-lg p-3 border ${issue.severity === 'critical' ? 'border-red-500/20' :
                                                issue.severity === 'high' ? 'border-orange-500/20' :
                                                    issue.severity === 'medium' ? 'border-amber-500/20' : 'border-white/5'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={`text-[10px] border ${getRiskBadgeColor(issue.severity)}`}>
                                                        {issue.severity}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 font-mono truncate">{issue.file}</span>
                                                </div>
                                                <p className="text-sm text-slate-300">{issue.problem}</p>
                                                <p className="text-xs text-indigo-400 mt-1">→ {issue.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="glass rounded-xl p-12 border border-white/5 text-center h-full flex flex-col items-center justify-center">
                            <GitPullRequest className="w-10 h-10 text-slate-600 mb-3" />
                            <p className="text-slate-400 text-sm">Select a review to see details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

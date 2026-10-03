'use client'

import { useEffect, useState } from 'react'
import {
    Boxes, GitBranch, AlertTriangle, CheckCircle2,
    ArrowRight, Loader2, ChevronRight, Code2, X, Shield,
    Zap, Bug, TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getRiskBadgeColor } from '@/lib/ai/scoring'

// ─── Types ────────────────────────────────────────────────────────────────────

type ArchScan = {
    id: number
    architectureScore: number | null
    architectureSummary: string | null
    securitySummary: string | null
    repoId: number
    fileReviews: {
        filePath: string
        fileScore: number | null
        riskLevel: string | null
        issuesDetected: { file: string; problem: string; severity: string; suggestion: string; line?: number }[] | null
    }[]
    repository?: { fullName: string; language: string | null }
}

type Annotation = {
    line: number
    type: 'bug' | 'vulnerability' | 'bad_practice' | 'performance' | 'security'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    explanation: string
    suggestion: string
    fixed_code: string
}

type FileAnalysis = {
    status: 'approved' | 'issues_found'
    summary: string
    overall_score: number
    annotations: Annotation[]
    content: string
    filePath: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTree(paths: string[]): Record<string, string[]> {
    const tree: Record<string, string[]> = {}
    paths.forEach(p => {
        const parts = p.split('/')
        const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
        if (!tree[dir]) tree[dir] = []
        tree[dir].push(parts[parts.length - 1])
    })
    return tree
}

const SEVERITY_LINE_BG: Record<string, string> = {
    critical: 'bg-red-500/15 border-l-2 border-red-500',
    high: 'bg-orange-500/10 border-l-2 border-orange-500',
    medium: 'bg-yellow-500/8 border-l-2 border-yellow-400',
    low: 'bg-blue-500/5 border-l-2 border-blue-400',
}

const SEVERITY_DOT: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-400',
    low: 'bg-blue-400',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    bug: <Bug className="w-3.5 h-3.5" />,
    vulnerability: <Shield className="w-3.5 h-3.5" />,
    security: <Shield className="w-3.5 h-3.5" />,
    performance: <Zap className="w-3.5 h-3.5" />,
    bad_practice: <TrendingDown className="w-3.5 h-3.5" />,
}

// ─── Code Viewer (intentionally dark — like a code editor) ────────────────────

function CodeViewer({
    analysis,
    onClose,
}: {
    analysis: FileAnalysis
    onClose: () => void
}) {
    const [selectedLine, setSelectedLine] = useState<number | null>(null)
    const lines = analysis.content.split('\n')
    const annotationByLine = new Map<number, Annotation>()
    analysis.annotations.forEach(a => annotationByLine.set(a.line, a))
    const selectedAnnotation = selectedLine ? annotationByLine.get(selectedLine) : null

    const isApproved = analysis.status === 'approved' || analysis.annotations.length === 0

    return (
        <div className="flex flex-col h-full bg-[#0D0E12] rounded-[20px] overflow-hidden">
            {/* File header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0e14]">
                <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#D4F63C]" />
                    <span className="text-xs font-mono text-slate-300">{analysis.filePath}</span>
                    <Badge className={`text-[10px] ml-1 ${isApproved ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                        {isApproved ? 'Approved' : `${analysis.annotations.length} issue${analysis.annotations.length !== 1 ? 's' : ''}`}
                    </Badge>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Approved state */}
            {isApproved && (
                <div className="px-4 py-3 bg-green-500/5 border-b border-green-500/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-300">{analysis.summary || 'No significant issues found in this file.'}</p>
                </div>
            )}

            {/* AI summary strip */}
            {!isApproved && analysis.summary && (
                <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/10">
                    <p className="text-xs text-amber-300/80">{analysis.summary}</p>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Code area */}
                <div className="flex-1 overflow-auto">
                    <div className="font-mono text-xs leading-6">
                        {lines.map((line, idx) => {
                            const lineNum = idx + 1
                            const annotation = annotationByLine.get(lineNum)
                            const isSelected = selectedLine === lineNum && annotation
                            return (
                                <div
                                    key={lineNum}
                                    onClick={() => annotation && setSelectedLine(isSelected ? null : lineNum)}
                                    className={`flex group transition-colors ${annotation
                                        ? `${SEVERITY_LINE_BG[annotation.severity]} cursor-pointer hover:brightness-125`
                                        : 'hover:bg-white/[0.02]'
                                        } ${isSelected ? 'ring-1 ring-inset ring-white/10' : ''}`}
                                >
                                    {/* Line number gutter */}
                                    <div className="select-none w-12 flex-shrink-0 text-right pr-4 py-0.5 text-slate-600 border-r border-white/5">
                                        {lineNum}
                                    </div>

                                    {/* Severity dot */}
                                    <div className="w-4 flex-shrink-0 flex items-center justify-center">
                                        {annotation && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[annotation.severity]}`} />
                                        )}
                                    </div>

                                    {/* Code */}
                                    <div className="flex-1 py-0.5 pr-4 text-slate-300 whitespace-pre overflow-hidden text-ellipsis">
                                        {line || ' '}
                                    </div>

                                    {/* Issue arrow */}
                                    {annotation && (
                                        <div className="flex-shrink-0 px-2 flex items-center">
                                            <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Issue detail panel */}
                {selectedAnnotation && (
                    <div className="w-72 flex-shrink-0 border-l border-white/5 overflow-y-auto bg-[#0d0e14]">
                        <div className="p-4 space-y-4">
                            {/* Issue header */}
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className={`text-[10px] ${SEVERITY_DOT[selectedAnnotation.severity].replace('bg-', 'text-')}`}>
                                        {TYPE_ICON[selectedAnnotation.type]}
                                    </span>
                                    <Badge className={`text-[10px] border ${getRiskBadgeColor(selectedAnnotation.severity)}`}>
                                        {selectedAnnotation.severity}
                                    </Badge>
                                    <span className="text-[10px] text-slate-500 capitalize">{selectedAnnotation.type.replace('_', ' ')}</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-200">{selectedAnnotation.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Line {selectedAnnotation.line}</p>
                            </div>

                            {/* Explanation */}
                            <div className="bg-white/[0.04] border border-white/5 rounded-lg p-3">
                                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">Why it&apos;s a problem</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{selectedAnnotation.explanation}</p>
                            </div>

                            {/* Suggestion */}
                            <div className="bg-white/[0.04] border border-[#D4F63C]/10 rounded-lg p-3">
                                <p className="text-[10px] text-[#D4F63C] mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                                    <ArrowRight className="w-2.5 h-2.5" />Recommended Fix
                                </p>
                                <p className="text-xs text-slate-300 leading-relaxed">{selectedAnnotation.suggestion}</p>
                            </div>

                            {/* Fixed code */}
                            {selectedAnnotation.fixed_code && (
                                <div className="rounded-lg border border-green-500/15 bg-green-500/5 p-3">
                                    <p className="text-[10px] text-green-400 mb-2 uppercase tracking-wider font-semibold">Improved Code</p>
                                    <pre className="text-[10px] font-mono text-green-300 whitespace-pre-wrap break-all leading-5">
                                        {selectedAnnotation.fixed_code}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 bg-[#0d0e14]">
                <p className="text-[10px] text-slate-600">Click highlighted line to inspect</p>
                <div className="flex items-center gap-3 ml-auto">
                    {['critical', 'high', 'medium', 'low'].map(s => (
                        <span key={s} className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[s]}`} />{s}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArchitecturePage() {
    const [scan, setScan] = useState<ArchScan | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analyzeError, setAnalyzeError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/scans/latest')
            .then(r => r.ok ? r.json().catch(() => ({})) : {})
            .then((d: any) => { if (d?.scan) setScan(d.scan) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const tree = scan ? buildTree(scan.fileReviews.map(f => f.filePath)) : {}
    const dirs = Object.keys(tree).sort()

    async function analyzeFile(filePath: string) {
        if (!scan?.repoId) return
        setSelectedFile(filePath)
        setFileAnalysis(null)
        setAnalyzeError(null)
        setAnalyzing(true)

        const res = await fetch('/api/analyze/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoId: scan.repoId, filePath }),
        })
        const data = await res.json().catch(() => ({ error: 'Parse error' }))

        if (!res.ok || data.error) {
            setAnalyzeError(data.error ?? 'Analysis failed')
        } else {
            setFileAnalysis(data)
        }
        setAnalyzing(false)
    }

    if (loading) {
        return (
            <div className="space-y-6 max-w-6xl">
                <Skeleton className="h-8 w-48 bg-black/5 rounded-xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-96 rounded-2xl bg-black/5" />
                    <Skeleton className="h-96 rounded-2xl bg-black/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">Architecture View</h2>
                <p className="text-[#555962] text-xs sm:text-sm mt-1">
                    {scan?.repository?.fullName
                        ? <>Analysis of <span className="font-mono font-semibold text-[#0D0E12]">{scan.repository.fullName}</span></>
                        : 'Visual breakdown of your codebase structure and file coupling'}
                </p>
            </div>

            {!scan ? (
                <div className="bg-white rounded-[32px] p-16 border border-black/[0.06] shadow-xs text-center max-w-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-[#F6F7F3] flex items-center justify-center mx-auto mb-4">
                        <Boxes className="w-8 h-8 text-[#8B907E]" />
                    </div>
                    <p className="text-[#0D0E12] font-bold text-lg">No architecture data yet</p>
                    <p className="text-[#555962] text-sm mt-1">Run a scan first to see your architecture analysis.</p>
                </div>
            ) : (
                <>
                    {/* Score + summary */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs space-y-1">
                            <p className="text-xs font-semibold text-[#555962] uppercase tracking-wider">Architecture Score</p>
                            <div className="flex items-baseline gap-1.5">
                                <p className="text-5xl font-extrabold text-[#0D0E12] tracking-tight">
                                    {Math.round(scan.architectureScore ?? 0)}
                                </p>
                                <span className="text-sm text-[#8B907E]">/ 100</span>
                            </div>
                            <div className="pt-1">
                                <span className="inline-block px-3 py-1 rounded-full bg-[#D4F63C] text-[#0D0E12] text-[11px] font-bold">
                                    {(scan.architectureScore ?? 0) >= 80 ? 'Healthy' : (scan.architectureScore ?? 0) >= 60 ? 'Moderate' : 'Needs Work'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs md:col-span-2">
                            <p className="text-xs font-semibold text-[#555962] mb-2 uppercase tracking-wider">Architecture Assessment</p>
                            <p className="text-sm text-[#0D0E12] leading-relaxed">
                                {scan.architectureSummary ?? 'No architecture summary available.'}
                            </p>
                        </div>
                    </div>

                    {/* File tree + Code Viewer / Detail panel */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* File tree */}
                        <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm font-bold text-[#0D0E12] flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-[#555962]" />
                                    File Structure
                                    {scan.repository?.fullName && (
                                        <span className="text-[10px] font-mono text-[#8B907E] ml-1">
                                            · {scan.repository.fullName}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {dirs.map(dir => (
                                        <div key={dir}>
                                            <p className="text-xs text-[#555962] font-mono mb-1.5 flex items-center gap-1">
                                                <Boxes className="w-3 h-3" />
                                                {dir === '.' ? 'root' : dir}
                                            </p>
                                            <div className="space-y-1 ml-4">
                                                {tree[dir].map(file => {
                                                    const fullPath = dir === '.' ? file : `${dir}/${file}`
                                                    const review = scan.fileReviews.find(f => f.filePath === fullPath)
                                                    const risk = review?.riskLevel ?? 'low'
                                                    const isSelected = selectedFile === fullPath
                                                    return (
                                                        <button
                                                            key={file}
                                                            onClick={() => analyzeFile(fullPath)}
                                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all ${isSelected
                                                                ? 'bg-[#D4F63C]/20 border border-[#D4F63C]/40'
                                                                : 'hover:bg-[#FAFAF8] border border-transparent'
                                                                }`}
                                                        >
                                                            <span className="text-xs text-[#0D0E12] font-mono truncate flex-1">{file}</span>
                                                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                                {review && (
                                                                    <span className="text-xs text-[#555962]">{Math.round(review.fileScore ?? 0)}</span>
                                                                )}
                                                                <span className={`w-1.5 h-1.5 rounded-full ${risk === 'critical' ? 'bg-red-500' :
                                                                    risk === 'high' ? 'bg-orange-500' :
                                                                        risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    }`} />
                                                                {isSelected && fileAnalysis && (
                                                                    <ChevronRight className="w-3 h-3 text-[#0D0E12]" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right panel — Code Viewer or Issue list */}
                        <div className="rounded-[28px] overflow-hidden border border-black/[0.06] shadow-xs" style={{ maxHeight: '560px' }}>
                            {analyzing ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0D0E12] flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-[#D4F63C] animate-spin" />
                                    </div>
                                    <p className="text-[#0D0E12] font-bold text-sm">Running AI analysis...</p>
                                    <p className="text-[#555962] text-xs">Fetching file & inspecting each line</p>
                                </div>
                            ) : analyzeError ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <p className="text-[#0D0E12] font-bold text-sm">{analyzeError}</p>
                                    <Button size="sm" variant="ghost" className="text-[#0D0E12] border border-black/10 rounded-xl" onClick={() => selectedFile && analyzeFile(selectedFile)}>
                                        Retry
                                    </Button>
                                </div>
                            ) : fileAnalysis ? (
                                <div className="flex flex-col h-full">
                                    <CodeViewer
                                        analysis={fileAnalysis}
                                        onClose={() => { setFileAnalysis(null); setSelectedFile(null) }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center bg-white">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F6F7F3] flex items-center justify-center mx-auto mb-3">
                                        <GitBranch className="w-6 h-6 text-[#8B907E]" />
                                    </div>
                                    <p className="text-[#0D0E12] font-bold text-sm">Select a file to analyze</p>
                                    <p className="text-[#555962] text-xs mt-1 max-w-xs">Click any file to run AI line-by-line analysis with severity and fix suggestions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security summary */}
                    {scan.securitySummary && (
                        <div className="bg-red-50 rounded-[28px] p-6 border border-red-200">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                </div>
                                <h3 className="text-sm font-bold text-red-800">Security Summary</h3>
                            </div>
                            <p className="text-sm text-red-700 leading-relaxed">{scan.securitySummary}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { Download, FileText, Link2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getScoreBgColor } from '@/lib/ai/scoring'
import { format } from 'date-fns'

type Scan = { id: number; overallScore: number | null; createdAt: string; scanStatus: string }

export default function ExportPage() {
    const [scans, setScans] = useState<Scan[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState<{ id: number; type: string } | null>(null)
    const [shareLinks, setShareLinks] = useState<Record<number, string>>({})

    useEffect(() => {
        fetch('/api/scans/history')
            .then(r => r.ok ? r.json().catch(() => ({})) : {})
            .then((d: any) => setScans((d.scans ?? []).filter((s: Scan) => s.scanStatus === 'completed')))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    async function downloadMarkdown(scanId: number) {
        setExporting({ id: scanId, type: 'md' })
        const res = await fetch(`/api/export/markdown/${scanId}`)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `githubscanner-report-${scanId}.md`
        a.click()
        URL.revokeObjectURL(url)
        setExporting(null)
    }

    async function copyShareLink(scanId: number) {
        setExporting({ id: scanId, type: 'share' })
        const res = await fetch(`/api/export/share/${scanId}`, { method: 'POST' })
        const data = await res.json()
        if (data.url) {
            setShareLinks(prev => ({ ...prev, [scanId]: data.url }))
            await navigator.clipboard.writeText(data.url)
        }
        setExporting(null)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-100">Export Reports</h2>
                <p className="text-slate-500 text-sm mt-0.5">Download or share your analysis reports</p>
            </div>

            {/* Export format info */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { icon: FileText, label: 'Markdown Report', desc: 'Full analysis as .md file', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                    { icon: Link2, label: 'Public Share Link', desc: 'Read-only shareable URL', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                    { icon: Download, label: 'PDF Report', desc: 'Coming soon – printable PDF', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                ].map(f => {
                    const Icon = f.icon
                    return (
                        <div key={f.label} className={`glass rounded-xl p-4 border ${f.bg}`}>
                            <Icon className={`w-6 h-6 ${f.color} mb-2`} />
                            <p className="text-sm font-semibold text-slate-200">{f.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                        </div>
                    )
                })}
            </div>

            {/* Scans list */}
            <Card className="glass border-white/5">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-300">Completed Scans</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 bg-white/5 rounded-lg" />)}
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="text-center py-10">
                            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No completed scans to export</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {scans.map(scan => (
                                <div key={scan.id} className="flex items-center justify-between p-4 glass rounded-lg border border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-200">Scan #{scan.id}</p>
                                            {scan.overallScore != null && (
                                                <Badge className={getScoreBgColor(scan.overallScore)}>
                                                    {Math.round(scan.overallScore)}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {format(new Date(scan.createdAt), 'MMM d, yyyy · HH:mm')}
                                        </p>
                                        {shareLinks[scan.id] && (
                                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />Link copied to clipboard
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-indigo-400 h-8 gap-1.5"
                                            disabled={exporting?.id === scan.id && exporting?.type === 'md'}
                                            onClick={() => downloadMarkdown(scan.id)}
                                        >
                                            {exporting?.id === scan.id && exporting?.type === 'md'
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <FileText className="w-3.5 h-3.5" />}
                                            .md
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-green-400 h-8 gap-1.5"
                                            disabled={exporting?.id === scan.id && exporting?.type === 'share'}
                                            onClick={() => copyShareLink(scan.id)}
                                        >
                                            {exporting?.id === scan.id && exporting?.type === 'share'
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                : <Link2 className="w-3.5 h-3.5" />}
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

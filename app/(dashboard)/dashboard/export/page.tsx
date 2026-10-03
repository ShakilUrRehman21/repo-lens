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
        a.download = `repolens-report-${scanId}.md`
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
            // Try modern clipboard API first, fall back to execCommand
            try {
                await navigator.clipboard.writeText(data.url)
            } catch {
                try {
                    const ta = document.createElement('textarea')
                    ta.value = data.url
                    ta.style.position = 'fixed'
                    ta.style.opacity = '0'
                    document.body.appendChild(ta)
                    ta.focus()
                    ta.select()
                    document.execCommand('copy')
                    document.body.removeChild(ta)
                } catch {
                    // Silently fail — link is still shown in the UI
                }
            }
        }
        setExporting(null)
    }

    const exportFormats = [
        {
            icon: FileText,
            label: 'Markdown Report',
            desc: 'Full analysis as .md file',
            iconColor: 'text-[#0D0E12]',
            bg: 'bg-[#F6F7F3]',
            border: 'border-black/[0.06]'
        },
        {
            icon: Link2,
            label: 'Public Share Link',
            desc: 'Read-only shareable URL',
            iconColor: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
        },
        {
            icon: Download,
            label: 'PDF Report',
            desc: 'Coming soon — printable PDF',
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        },
    ]

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">Export Reports</h2>
                <p className="text-[#555962] text-xs sm:text-sm mt-1">Download or share your analysis reports</p>
            </div>

            {/* Export format info cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {exportFormats.map(f => {
                    const Icon = f.icon
                    return (
                        <div key={f.label} className={`rounded-[28px] p-6 border ${f.border} ${f.bg} space-y-3`}>
                            <div className={`w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center shadow-xs`}>
                                <Icon className={`w-5 h-5 ${f.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0D0E12]">{f.label}</p>
                                <p className="text-xs text-[#555962] mt-0.5">{f.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Scans list */}
            <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-bold text-[#0D0E12]">Completed Scans</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 bg-black/5 rounded-2xl" />)}
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-[#F6F7F3] flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-6 h-6 text-[#8B907E]" />
                            </div>
                            <p className="text-[#0D0E12] font-bold text-sm">No completed scans to export</p>
                            <p className="text-[#555962] text-xs mt-1">Run a repository scan first to generate reports</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {scans.map(scan => (
                                <div key={scan.id} className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-2xl border border-black/[0.04] hover:bg-[#F6F7F3] transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#0D0E12]">Scan #{scan.id}</p>
                                            {scan.overallScore != null && (
                                                <Badge className={getScoreBgColor(scan.overallScore)}>
                                                    {Math.round(scan.overallScore)}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#555962] mt-0.5">
                                            {format(new Date(scan.createdAt), 'MMM d, yyyy · HH:mm')}
                                        </p>
                                        {shareLinks[scan.id] && (
                                            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                                                <CheckCircle2 className="w-3 h-3" />Link copied to clipboard
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-[#555962] hover:text-[#0D0E12] hover:bg-white h-9 px-3 rounded-xl border border-black/[0.06] gap-1.5 text-xs font-semibold"
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
                                            className="bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold h-9 px-3 rounded-xl shadow-xs transition-all gap-1.5 text-xs"
                                            disabled={exporting?.id === scan.id && exporting?.type === 'share'}
                                            onClick={() => copyShareLink(scan.id)}
                                        >
                                            {exporting?.id === scan.id && exporting?.type === 'share'
                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
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

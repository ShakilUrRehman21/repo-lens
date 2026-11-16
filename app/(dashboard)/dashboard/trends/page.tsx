'use client'

import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'
import { getScoreBgColor } from '@/lib/ai/scoring'
import { format } from 'date-fns'

type ScanHistory = {
    id: number
    createdAt: string
    overallScore: number | null
    architectureScore: number | null
    securityScore: number | null
    maintainabilityScore: number | null
    scalabilityScore: number | null
    performanceScore: number | null
    technicalDebtIndex: number | null
    scanStatus: string
    repoId: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-black/10 rounded-xl p-3 text-xs shadow-md">
            <p className="text-[#4A5A7A] mb-2 font-medium">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2 font-semibold">
                    <span className="text-[#4A5A7A] font-normal">{p.name}:</span> {Math.round(p.value)}
                </p>
            ))}
        </div>
    )
}

export default function TrendsPage() {
    const [history, setHistory] = useState<ScanHistory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/scans/history')
            .then(r => r.ok ? r.json().catch(() => ({})) : {})
            .then((d: any) => setHistory(d.scans ?? []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const chartData = history
        .filter(s => s.scanStatus === 'completed')
        .map(s => ({
            date: format(new Date(s.createdAt), 'MMM d'),
            Overall: Math.round(s.overallScore ?? 0),
            Architecture: Math.round(s.architectureScore ?? 0),
            Security: Math.round(s.securityScore ?? 0),
            Maintainability: Math.round(s.maintainabilityScore ?? 0),
            Debt: Math.round(s.technicalDebtIndex ?? 0),
        }))
        .reverse()

    const latest = history.find(s => s.scanStatus === 'completed')
    const previous = history.filter(s => s.scanStatus === 'completed')[1]
    const delta = latest && previous
        ? Math.round((latest.overallScore ?? 0) - (previous.overallScore ?? 0))
        : null

    if (loading) {
        return (
            <div className="space-y-6 max-w-6xl">
                <Skeleton className="h-8 w-48 bg-black/5 rounded-xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-black/5" />)}
                </div>
                <Skeleton className="h-64 rounded-2xl bg-black/5" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E3A8A]">Trends & History</h2>
                <p className="text-[#4A5A7A] text-xs sm:text-sm mt-1">Track your codebase quality improvement over time</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-[#4A5A7A]">Total Scans</p>
                    <p className="text-3xl font-extrabold text-[#0E3A8A]">{history.length}</p>
                    <p className="text-[11px] text-[#7B8DB0]">All repositories</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-[#4A5A7A]">Latest Score</p>
                    <p className="text-3xl font-extrabold text-[#0E3A8A]">
                        {latest ? Math.round(latest.overallScore ?? 0) : '—'}
                    </p>
                    <p className="text-[11px] text-[#7B8DB0]">Overall health</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-[#4A5A7A]">Score Change</p>
                    <div className="flex items-center gap-1.5">
                        {delta !== null ? (
                            <>
                                {delta >= 0
                                    ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    : <TrendingDown className="w-5 h-5 text-red-500" />}
                                <p className={`text-3xl font-extrabold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {delta >= 0 ? '+' : ''}{delta}
                                </p>
                            </>
                        ) : <p className="text-3xl font-extrabold text-[#7B8DB0]">—</p>}
                    </div>
                    <p className="text-[11px] text-[#7B8DB0]">vs. last scan</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-1">
                    <p className="text-xs font-semibold text-[#4A5A7A]">Debt Index</p>
                    <p className="text-3xl font-extrabold text-amber-500">
                        {latest ? Math.round(latest.technicalDebtIndex ?? 0) : '—'}
                    </p>
                    <p className="text-[11px] text-[#7B8DB0]">Technical debt %</p>
                </div>
            </div>

            {chartData.length < 2 ? (
                <div className="bg-white rounded-[28px] p-16 border border-black/[0.06] shadow-xs text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF0FA] flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-7 h-7 text-[#7B8DB0]" />
                    </div>
                    <p className="text-[#0E3A8A] font-bold">Not enough data yet</p>
                    <p className="text-[#4A5A7A] text-sm mt-1">Run at least 2 scans to see trend charts.</p>
                </div>
            ) : (
                <>
                    {/* Overall score trend */}
                    <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm font-bold text-[#0E3A8A] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#0E3A8A]" />
                                Overall Score Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFD447" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FFD447" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F1EC" />
                                    <XAxis dataKey="date" tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Overall" stroke="#0E3A8A" strokeWidth={2} fill="url(#overallGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category breakdown */}
                    <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm font-bold text-[#0E3A8A] flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[#0E3A8A]" />
                                Score Breakdown Over Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F1EC" />
                                    <XAxis dataKey="date" tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', color: '#4A5A7A' }} />
                                    <Line type="monotone" dataKey="Architecture" stroke="#0E3A8A" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Security" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Maintainability" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Debt trend */}
                    <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm font-bold text-[#0E3A8A] flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-amber-500" />
                                Technical Debt Index Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F1EC" />
                                    <XAxis dataKey="date" tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#7B8DB0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Debt" stroke="#f59e0b" strokeWidth={2} fill="url(#debtGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Scan history table */}
            <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-bold text-[#0E3A8A] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#4A5A7A]" />
                        Scan History
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {history.length === 0 ? (
                        <p className="text-[#4A5A7A] text-sm text-center py-6">No scans yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {history.map(scan => (
                                <div key={scan.id} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447] border border-black/20" />
                                        <div>
                                            <p className="text-sm font-semibold text-[#0E3A8A]">Scan #{scan.id}</p>
                                            <p className="text-xs text-[#4A5A7A]">{format(new Date(scan.createdAt), 'MMM d, yyyy · HH:mm')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {scan.overallScore != null && (
                                            <Badge className={getScoreBgColor(scan.overallScore)}>
                                                {Math.round(scan.overallScore)}
                                            </Badge>
                                        )}
                                        <Badge className={
                                            scan.scanStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                scan.scanStatus === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-amber-100 text-amber-700 border-amber-200'
                                        }>
                                            {scan.scanStatus}
                                        </Badge>
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

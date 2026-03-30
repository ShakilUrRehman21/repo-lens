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
        <div className="glass border border-white/10 rounded-lg p-3 text-xs">
            <p className="text-slate-400 mb-2">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}:</span> {Math.round(p.value)}
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
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-64 rounded-xl bg-white/5" />
                <Skeleton className="h-64 rounded-xl bg-white/5" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-100">Trends & History</h2>
                <p className="text-slate-500 text-sm mt-0.5">Track your codebase quality over time</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">Total Scans</p>
                        <p className="text-3xl font-bold text-slate-100">{history.length}</p>
                    </CardContent>
                </Card>
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">Latest Score</p>
                        <p className={`text-3xl font-bold`}>
                            {latest ? Math.round(latest.overallScore ?? 0) : '—'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">Score Change</p>
                        <div className="flex items-center gap-1">
                            {delta !== null ? (
                                <>
                                    {delta >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                    <p className={`text-3xl font-bold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {delta >= 0 ? '+' : ''}{delta}
                                    </p>
                                </>
                            ) : <p className="text-3xl font-bold text-slate-600">—</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass border-white/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">Debt Index</p>
                        <p className="text-3xl font-bold text-amber-400">
                            {latest ? Math.round(latest.technicalDebtIndex ?? 0) : '—'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {chartData.length < 2 ? (
                <div className="glass rounded-2xl p-16 border border-white/5 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Not enough data yet</p>
                    <p className="text-slate-600 text-sm mt-1">Run at least 2 scans to see trend charts.</p>
                </div>
            ) : (
                <>
                    {/* Overall score trend */}
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-400" />
                                Overall Score Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2} fill="url(#overallGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category breakdown */}
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                Score Breakdown Over Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                    <Line type="monotone" dataKey="Architecture" stroke="#6366f1" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Security" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Maintainability" stroke="#22c55e" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Debt trend */}
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-amber-400" />
                                Technical Debt Index Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Debt" stroke="#f59e0b" strokeWidth={2} fill="url(#debtGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Scan history table */}
            <Card className="glass border-white/5">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Scan History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-slate-600 text-sm text-center py-6">No scans yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {history.map(scan => (
                                <div key={scan.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <div>
                                            <p className="text-sm text-slate-300">Scan #{scan.id}</p>
                                            <p className="text-xs text-slate-600">{format(new Date(scan.createdAt), 'MMM d, yyyy · HH:mm')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {scan.overallScore != null && (
                                            <Badge className={getScoreBgColor(scan.overallScore)}>
                                                {Math.round(scan.overallScore)}
                                            </Badge>
                                        )}
                                        <Badge className={
                                            scan.scanStatus === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                scan.scanStatus === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
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

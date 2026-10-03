'use client'

import { useEffect, useState } from 'react'
import { Shield, Users, BarChart3, Activity, Ban, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

type AdminStats = {
    totalUsers: number
    totalScans: number
    totalTokensUsed: number
    completedScans: number
    failedScans: number
}

type AdminUser = {
    id: number
    email: string
    plan: string
    clerkId: string
    createdAt: string
    _count?: { scans: number }
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [banning, setBanning] = useState<number | null>(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/stats').then(r => r.json()),
            fetch('/api/admin/users').then(r => r.json()),
        ]).then(([statsData, usersData]) => {
            setStats(statsData.stats)
            setUsers(usersData.users ?? [])
        }).finally(() => setLoading(false))
    }, [])

    async function banUser(userId: number) {
        setBanning(userId)
        await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' })
        setUsers(prev => prev.filter(u => u.id !== userId))
        setBanning(null)
    }

    if (loading) {
        return (
            <div className="space-y-6 max-w-6xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-black/5" />)}
                </div>
                <Skeleton className="h-64 rounded-2xl bg-black/5" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, iconBg: 'bg-[#0D0E12]', iconColor: 'text-[#D4F63C]' },
        { label: 'Total Scans', value: stats?.totalScans ?? 0, icon: BarChart3, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' },
        { label: 'Completed', value: stats?.completedScans ?? 0, icon: Activity, iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
        { label: 'Tokens Used', value: `${((stats?.totalTokensUsed ?? 0) / 1000).toFixed(1)}K`, icon: RefreshCw, iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
    ]

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">Admin Dashboard</h2>
                    <p className="text-[#555962] text-xs sm:text-sm">Platform-wide statistics and user management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(s => {
                    const Icon = s.icon
                    return (
                        <div key={s.label} className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs space-y-3">
                            <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                                <Icon className={`w-4.5 h-4.5 ${s.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-[#0D0E12]">{s.value}</p>
                                <p className="text-xs text-[#555962] mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Users table */}
            <Card className="bg-white border-black/[0.06] shadow-xs rounded-[28px]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-bold text-[#0D0E12] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#555962]" />
                        All Users
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {users.length === 0 ? (
                        <p className="text-[#555962] text-sm text-center py-6">No users found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/[0.06]">
                                        <th className="text-left py-2.5 px-3 text-xs font-bold text-[#555962] uppercase tracking-wider">Email</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-bold text-[#555962] uppercase tracking-wider">Plan</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-bold text-[#555962] uppercase tracking-wider">Joined</th>
                                        <th className="text-right py-2.5 px-3 text-xs font-bold text-[#555962] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-black/[0.04] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                                            <td className="py-3 px-3 text-[#0D0E12] font-medium text-sm">{user.email}</td>
                                            <td className="py-3 px-3">
                                                <Badge className={user.plan === 'pro'
                                                    ? 'bg-[#D4F63C]/20 text-[#0D0E12] border-[#D4F63C]/40 font-bold'
                                                    : 'bg-[#F6F7F3] text-[#555962] border-black/10 font-medium'
                                                }>
                                                    {user.plan}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-[#555962] text-xs font-mono">
                                                {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 gap-1 rounded-lg text-xs font-semibold"
                                                    disabled={banning === user.id}
                                                    onClick={() => banUser(user.id)}
                                                >
                                                    {banning === user.id
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <Ban className="w-3 h-3" />}
                                                    {banning === user.id ? 'Banning...' : 'Ban'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

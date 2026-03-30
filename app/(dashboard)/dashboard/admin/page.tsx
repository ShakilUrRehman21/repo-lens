'use client'

import { useEffect, useState } from 'react'
import { Shield, Users, BarChart3, Activity, Ban, RefreshCw } from 'lucide-react'
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
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}
                </div>
                <Skeleton className="h-64 rounded-xl bg-white/5" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Admin Dashboard</h2>
                    <p className="text-slate-500 text-sm">Platform-wide statistics and user management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Total Scans', value: stats?.totalScans ?? 0, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Completed', value: stats?.completedScans ?? 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Tokens Used', value: `${((stats?.totalTokensUsed ?? 0) / 1000).toFixed(1)}K`, icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map(s => {
                    const Icon = s.icon
                    return (
                        <Card key={s.label} className="glass border-white/5">
                            <CardContent className="p-5">
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                                    <Icon className={`w-4 h-4 ${s.color}`} />
                                </div>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Users table */}
            <Card className="glass border-white/5">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        All Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <p className="text-slate-600 text-sm text-center py-6">No users found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                                            <td className="py-3 px-3 text-slate-300">{user.email}</td>
                                            <td className="py-3 px-3">
                                                <Badge className={user.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600/30'}>
                                                    {user.plan}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-slate-500 text-xs">
                                                {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 gap-1"
                                                    disabled={banning === user.id}
                                                    onClick={() => banUser(user.id)}
                                                >
                                                    <Ban className="w-3 h-3" />
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

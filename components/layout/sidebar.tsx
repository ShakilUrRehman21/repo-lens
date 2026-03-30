'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    GitBranch,
    Shield,
    TrendingUp,
    GitPullRequest,
    Download,
    Settings,
    ShieldCheck,
    ChevronRight,
    Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/repositories', label: 'Repositories', icon: GitBranch },
    { href: '/dashboard/architecture', label: 'Architecture', icon: ShieldCheck },
    { href: '/dashboard/trends', label: 'Trends', icon: TrendingUp },
    { href: '/dashboard/pr-reviews', label: 'PR Reviews', icon: GitPullRequest, badge: 'Pro' },
    { href: '/dashboard/export', label: 'Export', icon: Download },
    { href: '/dashboard/admin', label: 'Admin', icon: Shield },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-[#0d0e14] border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 glow-indigo">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">GithubScanner</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            )}
                        >
                            <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                                    {item.badge}
                                </span>
                            )}
                            {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'w-8 h-8',
                            },
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

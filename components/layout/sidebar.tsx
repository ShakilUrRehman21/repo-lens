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
    ShieldCheck,
    Home
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

import { Logo } from '@/components/ui/logo'

function SidebarHeader() {
    return (
        <div className="px-5 py-5 border-b border-black/[0.06]">
            <Logo href="/dashboard" showTagline size="md" />
        </div>
    )
}

export function Sidebar() {

    const pathname = usePathname();
    return (
        <aside className="flex flex-col w-64 min-h-screen bg-[#FFFFFF] border-r border-black/[0.06] select-none">
            {/* Logo */}
            <SidebarHeader />

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
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
                                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                                isActive
                                    ? 'bg-[#0D0E12] text-white shadow-sm'
                                    : 'text-[#555962] hover:text-[#0D0E12] hover:bg-black/[0.04]'
                            )}
                        >
                            <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#D4F63C]' : 'text-[#8B907E] group-hover:text-[#0D0E12]')} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span className={cn(
                                    'px-1.5 py-0.5 text-[9px] font-bold rounded-md',
                                    isActive
                                        ? 'bg-[#D4F63C] text-[#0D0E12]'
                                        : 'bg-black/[0.06] text-[#555962] border border-black/[0.08]'
                                )}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-4 py-4 border-t border-black/[0.06] space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555962] hover:text-[#0D0E12] hover:bg-black/[0.04] transition-colors"
                >
                    <Home className="w-3.5 h-3.5 text-[#8B907E]" />
                    <span>Public Home</span>
                </Link>

                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#FAFAF8] border border-black/[0.05]">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'w-8 h-8 rounded-xl',
                            },
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0D0E12] truncate">My Account</p>
                        <p className="text-[10px] text-[#8B907E]">Signed in</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

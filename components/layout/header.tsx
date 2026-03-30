'use client'

import { Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/repositories': 'Repositories',
    '/dashboard/architecture': 'Architecture View',
    '/dashboard/trends': 'Trends & History',
    '/dashboard/pr-reviews': 'PR Reviews',
    '/dashboard/export': 'Export Reports',
    '/dashboard/admin': 'Admin Dashboard',
}

export function Header() {
    const pathname = usePathname()
    const title =
        Object.entries(PAGE_TITLES).find(([key]) =>
            pathname === key || pathname.startsWith(key + '/')
        )?.[1] ?? 'Dashboard'

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d0e14]/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
                <p className="text-xs text-slate-500 mt-0.5">AI-Powered Code Intelligence</p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                    <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </Button>
            </div>
        </header>
    )
}

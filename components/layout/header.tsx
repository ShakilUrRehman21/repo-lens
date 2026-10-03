'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'

export function Header() {
    const pathname = usePathname()

    return (
        <header className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-black/[0.06] bg-[#FFFFFF] sticky top-0 z-20">
            <div />
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4F63C] text-black text-[11px] font-bold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    <span>Engine Ready</span>
                </div>
                <Button variant="ghost" size="sm" className="text-[#555962] hover:text-[#0D0E12] relative border border-black/[0.08] bg-[#FAFAF8] rounded-xl h-8 w-8 p-0 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4F63C] border border-black rounded-full" />
                </Button>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: 'w-8 h-8 rounded-xl',
                        },
                    }}
                />
            </div>
        </header>
    )
}

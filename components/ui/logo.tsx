import React from 'react'
import Link from 'next/link'

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    showTagline?: boolean
    variant?: 'dark' | 'light' | 'auto'
    href?: string
}

export function RepoLensMark({ size = 34, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
        >
            {/* Base Squircle */}
            <rect width="40" height="40" rx="11" fill="#0D0E12" />
            <rect
                x="0.75"
                y="0.75"
                width="38.5"
                height="38.5"
                rx="10.25"
                stroke="white"
                strokeOpacity="0.08"
                strokeWidth="1.5"
            />

            {/* Radar / Diagnostic Reticle Ring */}
            <circle
                cx="20"
                cy="20"
                r="13"
                stroke="#2B303C"
                strokeWidth="1.25"
                strokeDasharray="2.5 3"
            />

            {/* Precision Scope Reticle Crosshairs */}
            <line x1="20" y1="5" x2="20" y2="8" stroke="#D4F63C" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="20" y2="35" stroke="#464C5A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="20" x2="8" y2="20" stroke="#464C5A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="20" x2="35" y2="20" stroke="#D4F63C" strokeWidth="1.5" strokeLinecap="round" />

            {/* Optical Aperture Blades / Iris Geometry */}
            <path
                d="M13 14.5L24 11L21 21L13 14.5Z"
                fill="#D4F63C"
                fillOpacity="0.15"
            />
            <path
                d="M27 25.5L16 29L19 19L27 25.5Z"
                fill="#D4F63C"
                fillOpacity="0.15"
            />

            {/* Main Primary Lens Ring */}
            <circle
                cx="20"
                cy="20"
                r="7.5"
                stroke="#D4F63C"
                strokeWidth="2"
            />

            {/* Git Branch / Code Diagnostic Core */}
            <circle cx="20" cy="20" r="3" fill="#D4F63C" />
            <circle cx="20" cy="20" r="1.2" fill="#0D0E12" />

            {/* Laser Focal Pulse (Top-Right Angle) */}
            <circle cx="28" cy="12" r="1.5" fill="#D4F63C" />
            <path
                d="M25.5 14.5L23.5 16.5"
                stroke="#D4F63C"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function Logo({
    className = '',
    size = 'md',
    showTagline = false,
    variant = 'dark',
    href,
}: LogoProps) {
    const sizeMap = {
        sm: { mark: 28, text: 'text-[15px]', tag: 'text-[8.5px]' },
        md: { mark: 34, text: 'text-[17px]', tag: 'text-[9.5px]' },
        lg: { mark: 42, text: 'text-[22px]', tag: 'text-[11px]' },
    }

    const s = sizeMap[size]

    const textColor =
        variant === 'light'
            ? 'text-white'
            : variant === 'dark'
            ? 'text-[#0D0E12]'
            : 'text-[#0D0E12] dark:text-white'

    const subColor =
        variant === 'light'
            ? 'text-white/50'
            : 'text-[#6E7380]'

    const content = (
        <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
            <RepoLensMark size={s.mark} />
            <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                    <span className={`font-black tracking-tight ${s.text} ${textColor}`}>
                        Repo<span className="text-[#849924]">Lens</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#0D0E12] text-[#D4F63C] border border-black/10">
                        AI
                    </span>
                </div>
                {showTagline && (
                    <span className={`font-semibold tracking-[0.14em] uppercase mt-1 ${s.tag} ${subColor}`}>
                        Code Intelligence
                    </span>
                )}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="inline-flex">
                {content}
            </Link>
        )
    }

    return content
}

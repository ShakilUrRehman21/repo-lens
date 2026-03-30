import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GithubScanner – AI Code Intelligence Platform',
  description:
    'Analyze GitHub repositories with AI. Get architecture scores, security audits, technical debt analysis, and automated PR reviews.',
  keywords: ['code review', 'AI', 'GitHub', 'security audit', 'technical debt'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#0a0b0f] text-slate-100 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

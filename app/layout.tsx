import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RepoLens – AI Code Intelligence & 360° Repository Diagnostics',
  description:
    'Deep 5-stage repository analysis powered by Gemini 2.0 & Groq. Uncover architecture flaws, security vulnerabilities, technical debt, and PR breaking changes automatically.',
  keywords: ['RepoLens', 'code intelligence', 'AI code review', 'GitHub', 'security audit', 'technical debt', 'software architecture'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#0A2A66',
          colorText: '#0A2A66',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F3F6FC',
          colorInputText: '#0A2A66',
          borderRadius: '0.875rem',
        },
        elements: {
          card: 'shadow-xl border border-black/[0.08] rounded-3xl bg-white p-6',
          formButtonPrimary: 'bg-[#FFD447] hover:bg-[#cbf02e] text-[#0A2A66] font-bold rounded-xl shadow-none py-3',
          footerActionLink: 'text-[#0A2A66] font-bold hover:underline',
          headerTitle: 'text-xl font-extrabold text-[#0A2A66]',
          headerSubtitle: 'text-xs text-[#4A5A7A]',
          socialButtonsBlockButton: 'border border-black/10 hover:bg-[#EAF0FA] rounded-xl text-xs font-semibold',
          formFieldInput: 'border-black/10 rounded-xl bg-[#F3F6FC]',
        }
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-[#FFFFFF] text-[#0A2A66] antialiased selection:bg-[#FFD447] selection:text-black`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

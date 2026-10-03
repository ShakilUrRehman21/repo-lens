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
          colorPrimary: '#0D0E12',
          colorText: '#0D0E12',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#FAFAF8',
          colorInputText: '#0D0E12',
          borderRadius: '0.875rem',
        },
        elements: {
          card: 'shadow-xl border border-black/[0.08] rounded-3xl bg-white p-6',
          formButtonPrimary: 'bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold rounded-xl shadow-none py-3',
          footerActionLink: 'text-[#0D0E12] font-bold hover:underline',
          headerTitle: 'text-xl font-extrabold text-[#0D0E12]',
          headerSubtitle: 'text-xs text-[#555962]',
          socialButtonsBlockButton: 'border border-black/10 hover:bg-[#F6F7F3] rounded-xl text-xs font-semibold',
          formFieldInput: 'border-black/10 rounded-xl bg-[#FAFAF8]',
        }
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-[#FFFFFF] text-[#0D0E12] antialiased selection:bg-[#D4F63C] selection:text-black`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

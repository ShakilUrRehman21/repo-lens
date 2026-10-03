'use client'

import { useState, useEffect } from 'react'
import {
    GitBranch, Star, Lock, Globe, RefreshCw, Plus, ChevronRight,
    Loader2, Search, CheckCircle2, Link2, AlertCircle, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

type GitHubRepo = {
    id: string
    name: string
    fullName: string
    description: string | null
    language: string | null
    isPrivate: boolean
    defaultBranch: string
    stargazersCount: number
    updatedAt: string | null
    htmlUrl: string
}

type ImportedRepo = {
    id: number
    repoName: string
    fullName: string
    language: string | null
    lastScannedAt: string | null
}

const LANG_COLORS: Record<string, string> = {
    TypeScript: 'bg-blue-500', JavaScript: 'bg-yellow-400', Python: 'bg-green-500',
    Go: 'bg-cyan-400', Rust: 'bg-orange-500', Java: 'bg-red-500', default: 'bg-slate-500',
}

export default function RepositoriesPage() {
    const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
    const [importedRepos, setImportedRepos] = useState<ImportedRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [scanningId, setScanningId] = useState<number | null>(null)
    const [importingId, setImportingId] = useState<string | null>(null)
    const [modal, setModal] = useState<GitHubRepo | null>(null)
    const [scanStatus, setScanStatus] = useState<Record<number, string>>({})

    // URL import state
    const [urlInput, setUrlInput] = useState('')
    const [urlImporting, setUrlImporting] = useState(false)
    const [urlError, setUrlError] = useState<string | null>(null)
    const [urlSuccess, setUrlSuccess] = useState<string | null>(null)

    // Auto-sync GitHub token & load data
    useEffect(() => {
        async function load() {
            // Sync token first (extracts GitHub OAuth token from Clerk and stores it)
            await fetch('/api/user').catch(() => { })

            const [ghData, dbData] = await Promise.all([
                fetch('/api/github/repos').then(r => r.json()).catch(() => ({ repos: [] })),
                fetch('/api/repos').then(r => r.json()).catch(() => ({ repos: [] })),
            ])
            setGithubRepos(ghData.repos ?? [])
            setImportedRepos(dbData.repos ?? [])
            setLoading(false)
        }
        load()
    }, [])

    const importedIds = new Set(importedRepos.map(r => r.fullName))
    const filtered = githubRepos.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description ?? '').toLowerCase().includes(search.toLowerCase())
    )

    // —— URL Import ——
    async function handleUrlImport() {
        if (!urlInput.trim()) return
        setUrlImporting(true)
        setUrlError(null)
        setUrlSuccess(null)

        const res = await fetch('/api/github/import-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput.trim() }),
        })
        let data: { error?: string; repo?: any; alreadyImported?: boolean } = {}
        try {
            data = await res.json()
        } catch {
            setUrlError('Server error — check console for details and try again.')
            setUrlImporting(false)
            return
        }

        if (!res.ok || data.error) {
            setUrlError(data.error ?? 'Failed to import repository.')
        } else {
            const label = data.alreadyImported ? 'already connected' : 'imported'
            setUrlSuccess(`✓ ${data.repo.fullName} ${label} successfully!`)
            setUrlInput('')
            if (!data.alreadyImported) {
                setImportedRepos(prev => [data.repo, ...prev])
            }
        }
        setUrlImporting(false)
    }

    // —— Click-to-import from OAuth list ——
    async function handleImport(repo: GitHubRepo) {
        setImportingId(repo.id)
        const res = await fetch('/api/github/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                githubRepoId: repo.id,
                repoName: repo.name,
                fullName: repo.fullName,
                description: repo.description,
                defaultBranch: repo.defaultBranch,
                language: repo.language,
                isPrivate: repo.isPrivate,
            }),
        })
        const data = await res.json()
        if (data.repo) setImportedRepos(prev => [...prev, data.repo])
        setImportingId(null)
        setModal(null)
    }

    // —— Scan ——
    async function handleScan(repoId: number) {
        setScanningId(repoId)
        setScanStatus(prev => ({ ...prev, [repoId]: 'Starting...' }))
        const res = await fetch('/api/scans/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repoId }),
        })
        const data = await res.json().catch(() => ({}))
        if (data.error) {
            setScanStatus(prev => ({ ...prev, [repoId]: `Error: ${data.error}` }))
            setScanningId(null)
            return
        }
        const scanId = data.scanId
        const poll = setInterval(async () => {
            const r = await fetch(`/api/scans/${scanId}`)
            const d = await r.json().catch(() => ({}))
            if (d.scan?.progressMessage) setScanStatus(prev => ({ ...prev, [repoId]: d.scan.progressMessage }))
            if (d.scan?.scanStatus === 'completed' || d.scan?.scanStatus === 'failed') {
                clearInterval(poll)
                setScanningId(null)
                setScanStatus(prev => ({
                    ...prev,
                    [repoId]: d.scan.scanStatus === 'completed'
                        ? `✓ Score: ${Math.round(d.scan.overallScore ?? 0)}`
                        : (d.scan.progressMessage ? `✗ ${d.scan.progressMessage.replace(/^Analysis failed:\s*/i, '')}` : '✗ Scan failed'),
                }))
                // Refetch repos so lastScannedAt + scan count refresh
                fetch('/api/repos')
                    .then(r => r.ok ? r.json() : {})
                    .then((d: any) => { if (d.repos) setImportedRepos(d.repos) })
                    .catch(() => { })
            }
        }, 3000)
    }


    return (
        <div className="space-y-8 max-w-6xl">
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0E12]">Repositories</h2>
                <p className="text-[#555962] text-xs sm:text-sm mt-1">Connect and analyze your GitHub repositories with 5-stage AI</p>
            </div>

            {/* ——— URL IMPORT ——— */}
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-black/[0.06] shadow-xs">
                <p className="text-xs font-bold text-[#0D0E12] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-black" />
                    <span>Connect Repository by URL</span>
                </p>
                <div className="flex gap-2">
                    <Input
                        placeholder="https://github.com/owner/repo"
                        value={urlInput}
                        onChange={e => { setUrlInput(e.target.value); setUrlError(null); setUrlSuccess(null) }}
                        onKeyDown={e => e.key === 'Enter' && handleUrlImport()}
                        className="flex-1 bg-[#FAFAF8] border-black/10 text-[#0D0E12] placeholder:text-[#8B907E] focus:border-black rounded-xl h-11"
                        disabled={urlImporting}
                    />
                    <Button
                        onClick={handleUrlImport}
                        disabled={urlImporting || !urlInput.trim()}
                        className="bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold px-6 rounded-xl h-11 shadow-xs transition-all"
                    >
                        {urlImporting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Import Repo'}
                    </Button>
                </div>
                {urlError && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{urlError}
                    </p>
                )}
                {urlSuccess && (
                    <p className="text-emerald-700 text-xs mt-2 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{urlSuccess}
                    </p>
                )}
            </div>

            {/* ——— CONNECTED REPOS ——— */}
            {importedRepos.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#555962] uppercase tracking-wider">Connected Repositories</h3>
                    <div className="grid gap-3">
                        {importedRepos.map(repo => (
                            <Card key={repo.id} className="bg-white border-black/[0.06] rounded-2xl shadow-xs hover:shadow-sm transition-all">
                                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-[#0D0E12] text-[#D4F63C] flex items-center justify-center font-bold">
                                            <GitBranch className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0D0E12] text-sm">{repo.fullName}</p>
                                            <p className="text-xs text-[#555962]">
                                                {repo.language ?? 'Unknown'} · {repo.lastScannedAt
                                                    ? `Scanned ${new Date(repo.lastScannedAt).toLocaleDateString()}`
                                                    : 'Never scanned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {scanStatus[repo.id] && (
                                            <span className="text-xs text-[#555962] max-w-[200px] truncate font-mono">{scanStatus[repo.id]}</span>
                                        )}
                                        <Button
                                            size="sm"
                                            className="bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold h-9 px-4 rounded-xl shadow-xs"
                                            disabled={scanningId === repo.id}
                                            onClick={() => handleScan(repo.id)}
                                        >
                                            {scanningId === repo.id
                                                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-black" />Analyzing</>
                                                : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Scan</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ——— GITHUB OAUTH REPO LIST ——— */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#555962] uppercase tracking-wider">Your GitHub Repositories</h3>
                    <span className="text-xs text-[#8B907E] font-medium">{filtered.length} found</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B907E]" />
                    <Input
                        placeholder="Search repositories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-white border-black/10 text-[#0D0E12] placeholder:text-[#8B907E] focus:border-black rounded-xl h-11"
                    />
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl bg-white border border-black/[0.06]" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-black/[0.06] shadow-xs text-center">
                        <GitBranch className="w-10 h-10 text-[#8B907E] mx-auto mb-3" />
                        <p className="text-[#0D0E12] font-bold">
                            {githubRepos.length === 0 ? 'No GitHub repositories loaded' : 'No repositories match your search'}
                        </p>
                        <p className="text-[#555962] text-xs mt-1">
                            {githubRepos.length === 0
                                ? 'Connect your GitHub account or use the URL import above to start.'
                                : 'Try searching with a different term.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filtered.map(repo => {
                            const isImported = importedIds.has(repo.fullName)
                            const langColor = LANG_COLORS[repo.language ?? ''] ?? LANG_COLORS.default
                            return (
                                <Card
                                    key={repo.id}
                                    className={`bg-white border-black/[0.06] rounded-2xl shadow-xs hover:shadow-sm cursor-pointer transition-all ${isImported ? 'border-emerald-500/30' : ''}`}
                                    onClick={() => !isImported && setModal(repo)}
                                >
                                    <CardContent className="flex items-start justify-between p-4 sm:p-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-[#0D0E12] text-sm truncate">{repo.fullName}</p>
                                                {repo.isPrivate
                                                    ? <Badge className="bg-[#F6F7F3] text-[#555962] border-black/10 text-[10px]"><Lock className="w-2.5 h-2.5 mr-1" />Private</Badge>
                                                    : <Badge className="bg-[#F6F7F3] text-[#555962] border-black/10 text-[10px]"><Globe className="w-2.5 h-2.5 mr-1" />Public</Badge>}
                                            </div>
                                            {repo.description && (
                                                <p className="text-xs text-[#555962] truncate max-w-md mb-2">{repo.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-[#8B907E]">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <span className={`w-2 h-2 rounded-full ${langColor}`} />{repo.language}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 font-medium"><Star className="w-3 h-3" />{repo.stargazersCount}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            {isImported
                                                ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>
                                                : <Badge className="bg-[#0D0E12] hover:bg-black text-[#D4F63C] font-bold"><Plus className="w-3 h-3 mr-1" />Connect</Badge>}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ——— IMPORT MODAL ——— */}
            <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
                <DialogContent className="bg-white border border-black/[0.08] text-[#0D0E12] rounded-3xl p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#0D0E12]">
                            <GitBranch className="w-5 h-5 text-black" />Import Repository
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#555962]">
                            Connect <span className="font-bold text-[#0D0E12]">{modal?.fullName}</span> to RepoLens.
                        </DialogDescription>
                    </DialogHeader>
                    {modal && (
                        <div className="space-y-4 mt-3">
                            <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-black/[0.06] space-y-2 text-xs">
                                {[['Branch', modal.defaultBranch], ['Language', modal.language ?? 'Unknown'], ['Visibility', modal.isPrivate ? 'Private' : 'Public']].map(([label, val]) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-[#555962]">{label}</span>
                                        <span className="text-[#0D0E12] font-mono font-semibold">{val}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" className="flex-1 border border-black/10 rounded-xl" onClick={() => setModal(null)}>Cancel</Button>
                                <Button
                                    className="flex-1 bg-[#D4F63C] hover:bg-[#cbf02e] text-[#0D0E12] font-bold rounded-xl shadow-xs"
                                    disabled={importingId === modal.id}
                                    onClick={() => handleImport(modal)}
                                >
                                    {importingId === modal.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />Importing...</> : 'Confirm Import'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

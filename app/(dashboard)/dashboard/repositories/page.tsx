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
                        : '✗ Failed – check console',
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
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-100">Repositories</h2>
                <p className="text-slate-500 text-sm mt-0.5">Import and analyze your GitHub repositories</p>
            </div>

            {/* ——— URL IMPORT ——— */}
            <div className="glass rounded-xl p-4 border border-indigo-500/20">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Add Repository by URL
                </p>
                <div className="flex gap-2">
                    <Input
                        placeholder="https://github.com/owner/repo"
                        value={urlInput}
                        onChange={e => { setUrlInput(e.target.value); setUrlError(null); setUrlSuccess(null) }}
                        onKeyDown={e => e.key === 'Enter' && handleUrlImport()}
                        className="flex-1 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                        disabled={urlImporting}
                    />
                    <Button
                        onClick={handleUrlImport}
                        disabled={urlImporting || !urlInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5"
                    >
                        {urlImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                    </Button>
                </div>
                {urlError && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{urlError}
                    </p>
                )}
                {urlSuccess && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{urlSuccess}
                    </p>
                )}
            </div>

            {/* ——— CONNECTED REPOS ——— */}
            {importedRepos.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Connected Repos</h3>
                    <div className="grid gap-3">
                        {importedRepos.map(repo => (
                            <Card key={repo.id} className="glass border-white/5 glass-hover">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                                            <GitBranch className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-100 text-sm">{repo.fullName}</p>
                                            <p className="text-xs text-slate-500">
                                                {repo.language ?? 'Unknown'} · {repo.lastScannedAt
                                                    ? `Scanned ${new Date(repo.lastScannedAt).toLocaleDateString()}`
                                                    : 'Never scanned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {scanStatus[repo.id] && (
                                            <span className="text-xs text-slate-400 max-w-[200px] truncate">{scanStatus[repo.id]}</span>
                                        )}
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white h-8"
                                            disabled={scanningId === repo.id}
                                            onClick={() => handleScan(repo.id)}
                                        >
                                            {scanningId === repo.id
                                                ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing</>
                                                : <><RefreshCw className="w-3 h-3 mr-1" />Scan</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ——— GITHUB OAUTH REPO LIST ——— */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Your GitHub Repositories</h3>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search repositories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50"
                    />
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="glass rounded-xl p-12 border border-white/5 text-center">
                        <GitBranch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">
                            {githubRepos.length === 0 ? 'No GitHub repos loaded' : 'No repositories match your search'}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                            {githubRepos.length === 0
                                ? 'Sign in with GitHub or use the URL import above to add repos.'
                                : 'Try a different search term.'}
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
                                    className={`glass border-white/5 glass-hover cursor-pointer transition-all ${isImported ? 'border-green-500/20' : ''}`}
                                    onClick={() => !isImported && setModal(repo)}
                                >
                                    <CardContent className="flex items-start justify-between p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-slate-100 text-sm truncate">{repo.fullName}</p>
                                                {repo.isPrivate
                                                    ? <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/30 text-[10px]"><Lock className="w-2.5 h-2.5 mr-1" />Private</Badge>
                                                    : <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/30 text-[10px]"><Globe className="w-2.5 h-2.5 mr-1" />Public</Badge>}
                                            </div>
                                            {repo.description && (
                                                <p className="text-xs text-slate-500 truncate max-w-md mb-2">{repo.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-2 h-2 rounded-full ${langColor}`} />{repo.language}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stargazersCount}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            {isImported
                                                ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Connected</Badge>
                                                : <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30"><Plus className="w-3 h-3 mr-1" />Import</Badge>}
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
                <DialogContent className="bg-[#0d0e14] border border-white/10 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-indigo-400" />Import Repository
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Connect <span className="text-indigo-400 font-medium">{modal?.fullName}</span> to GithubScanner.
                        </DialogDescription>
                    </DialogHeader>
                    {modal && (
                        <div className="space-y-4 mt-2">
                            <div className="glass rounded-lg p-4 border border-white/5 space-y-2 text-sm">
                                {[['Branch', modal.defaultBranch], ['Language', modal.language ?? 'Unknown'], ['Visibility', modal.isPrivate ? 'Private' : 'Public']].map(([label, val]) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-slate-200 font-mono">{val}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 border border-white/10" onClick={() => setModal(null)}>Cancel</Button>
                                <Button
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                                    disabled={importingId === modal.id}
                                    onClick={() => handleImport(modal)}
                                >
                                    {importingId === modal.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</> : 'Confirm Import'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

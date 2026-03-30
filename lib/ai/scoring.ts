export function calculateOverallScore(scores: {
    architectureScore: number
    securityScore: number
    maintainabilityScore: number
    scalabilityScore: number
    performanceScore: number
}): number {
    const weighted =
        scores.architectureScore * 0.25 +
        scores.securityScore * 0.25 +
        scores.maintainabilityScore * 0.2 +
        scores.scalabilityScore * 0.15 +
        scores.performanceScore * 0.15
    return Math.round(weighted * 10) / 10
}

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-amber-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
}

export function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
}

export function getRiskBadgeColor(risk: string): string {
    switch (risk) {
        case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
        case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
}

export function getSeverityIcon(severity: string): string {
    switch (severity) {
        case 'critical': return '🔴'
        case 'high': return '🟠'
        case 'medium': return '🟡'
        case 'low': return '🟢'
        default: return '⚪'
    }
}

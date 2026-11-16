/**
 * Cuts code at a whole-line boundary so the model never sees half a line,
 * and says clearly where the excerpt stops so the cut is not reported as a bug.
 */
export function codeExcerpt(content: string, maxChars: number, numbered = false): string {
    const lines = content.split('\n')
    const out: string[] = []
    let used = 0
    for (let i = 0; i < lines.length; i++) {
        const line = numbered ? `${i + 1}: ${lines[i]}` : lines[i]
        if (used + line.length + 1 > maxChars && out.length > 0) {
            out.push(`/* NOTE FOR REVIEWER: excerpt ends here. Lines ${i + 1}-${lines.length} were omitted for length. Do not report this cut as a syntax error. */`)
            break
        }
        out.push(line)
        used += line.length + 1
    }
    return out.join('\n')
}

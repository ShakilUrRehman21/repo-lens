import Groq from 'groq-sdk'

// Ultra-fast code analysis models on Groq
const MODELS = [
    'qwen/qwen3.8-27b',       // Lightning fast (~150ms response time)
    'openai/gpt-oss-120b',    // Deep reasoning fallback
    'openai/gpt-oss-20b',     // Lightweight fallback
]

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function generateStructuredJSON<T>(initialPrompt: string, retries = 2): Promise<T> {
    const preferred = process.env.GROQ_MODEL || MODELS[0]
    const modelsToTry = [
        preferred,
        ...MODELS.filter(m => m !== preferred),
    ]

    let currentPrompt = initialPrompt
    let lastError: Error | null = null

    for (const model of modelsToTry) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await groq.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an ultra-fast static analysis AI. Respond with valid JSON only. No markdown, no commentary, no code fences. Output only the requested JSON object.',
                        },
                        { role: 'user', content: currentPrompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1,
                    max_tokens: 1536,
                })

                const text = response.choices[0]?.message?.content?.trim() ?? '{}'
                try {
                    return JSON.parse(text) as T
                } catch {
                    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
                    if (match) return JSON.parse(match[1]) as T
                    throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 150)}`)
                }
            } catch (err: any) {
                lastError = err

                // Handle 413 (Token limit / message too large) -> truncate prompt by 40% and retry
                const is413 = err?.status === 413 || err?.message?.includes('413') || err?.message?.includes('Request too large') || err?.message?.includes('TPM')
                if (is413) {
                    console.log(`[Groq] Request size exceeded limit on ${model}. Truncating prompt and retrying...`)
                    currentPrompt = currentPrompt.slice(0, Math.floor(currentPrompt.length * 0.6))
                    await sleep(1000)
                    continue
                }

                // Handle 429 (Rate limit)
                const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('rate_limit')
                if (is429 && attempt < retries) {
                    const retryAfter = Number(err?.headers?.['retry-after']) || (3 * (attempt + 1))
                    console.log(`[Groq] Rate limited on ${model}. Waiting ${retryAfter}s...`)
                    await sleep(retryAfter * 1000)
                    continue
                }

                // Model unavailable -> jump to next model
                const isModelUnavailable = err?.status === 404 || err?.status === 400 ||
                    err?.message?.includes('model_not_found') ||
                    err?.message?.includes('does not exist') ||
                    err?.message?.includes('deactivated')
                if (isModelUnavailable) {
                    console.warn(`[Groq] Model ${model} unavailable. Trying next...`)
                    break
                }

                if (attempt < retries) {
                    await sleep(1000)
                    continue
                }
                break
            }
        }
    }

    throw lastError ?? new Error('All Groq models exhausted')
}

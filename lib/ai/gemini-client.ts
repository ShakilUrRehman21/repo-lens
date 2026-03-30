import Groq from 'groq-sdk'

// Using Groq (free tier): llama-3.1-8b-instant
// Free limits: 14,400 req/day, 30 req/min — no credit card required
// Get your free key at: https://console.groq.com
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function generateStructuredJSON<T>(prompt: string, retries = 3): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile', // 14,400 req/day free
                messages: [
                    {
                        role: 'system',
                        content: 'You are a code analysis AI. You MUST respond with valid JSON only. No markdown, no code fences, no explanation — just a raw JSON object.',
                    },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
                max_tokens: 4096,
            })

            const text = response.choices[0]?.message?.content ?? '{}'
            try {
                return JSON.parse(text) as T
            } catch {
                // Try stripping markdown code fences if present
                const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
                if (match) return JSON.parse(match[1]) as T
                throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 200)}`)
            }
        } catch (err: any) {
            const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('rate_limit')
            if (is429 && attempt < retries) {
                const delay = 15000 * Math.pow(2, attempt) // 15s, 30s, 60s
                console.log(`[Groq] Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${retries})...`)
                await sleep(delay)
                continue
            }
            throw err
        }
    }
    throw new Error('Max retries exceeded')
}

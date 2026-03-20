/**
 * LLM-based scan response analyzer.
 *
 * Analyzes raw engine responses with Gemini Flash to extract:
 * - Mention detection, position, and sentiment per engine
 * - Real competitor names with their positions
 * - Personalized quick win recommendations
 * - Visibility summary
 *
 * Cost: <$0.002 per analysis call.
 */

import { z } from 'zod'
import { getScanClient, MODELS } from '@/lib/openrouter'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const engineAnalysisSchema = z.object({
  engine: z.string(),
  mentioned: z.boolean(),
  mention_position: z.number().nullable(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).nullable(),
  context_quote: z.string().nullable(),
  competitors_found: z.array(z.object({
    name: z.string(),
    position: z.number().nullable(),
  })),
})

const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
})

const analysisResultSchema = z.object({
  engines: z.array(engineAnalysisSchema),
  top_competitors: z.array(z.object({
    name: z.string(),
    mention_count: z.number(),
    best_position: z.number().nullable(),
  })),
  recommendations: z.array(recommendationSchema),
  visibility_summary: z.string(),
})

export type EngineAnalysis = z.infer<typeof engineAnalysisSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type AnalyzerRecommendation = z.infer<typeof recommendationSchema>

// ---------------------------------------------------------------------------
// Types for raw responses
// ---------------------------------------------------------------------------

export interface RawEngineResponse {
  engine: string
  query: string
  rawResponse: string
  isMock: boolean
  latencyMs: number
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze raw engine responses using Gemini Flash.
 * Now handles 3 queries × 3 engines = 9 responses.
 */
export async function analyzeResponses(params: {
  businessName: string
  websiteUrl: string
  industry: string
  location?: string | null
  queries: string[]
  responses: RawEngineResponse[]
}): Promise<AnalysisResult> {
  const { businessName, websiteUrl, industry, location, queries, responses } = params

  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) {
    return buildFallbackAnalysis(businessName, responses)
  }

  const prompt = buildAnalyzerPrompt({
    businessName,
    websiteUrl,
    industry,
    location,
    queries,
    responses,
  })

  try {
    const client = getScanClient()
    const completion = await client.chat.completions.create({
      model: MODELS.analyzer,
      messages: [
        {
          role: 'system',
          content: 'You are a precise data extraction assistant. You ONLY output valid JSON. No markdown, no explanation, no code blocks — just the JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.15,
    })

    const text = completion.choices[0]?.message?.content ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[analyzer] No JSON found in LLM response, using fallback')
      return buildFallbackAnalysis(businessName, responses)
    }

    const parsed = analysisResultSchema.safeParse(JSON.parse(jsonMatch[0]))
    if (!parsed.success) {
      console.warn('[analyzer] Zod validation failed:', parsed.error.issues)
      return buildFallbackAnalysis(businessName, responses)
    }

    console.log(`[analyzer] Analysis complete — ${parsed.data.engines.filter((e) => e.mentioned).length}/3 engines mention business, ${parsed.data.recommendations.length} recommendations`)
    return parsed.data
  } catch (error) {
    console.error('[analyzer] LLM analysis failed:', error instanceof Error ? error.message : error)
    return buildFallbackAnalysis(businessName, responses)
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildAnalyzerPrompt(params: {
  businessName: string
  websiteUrl: string
  industry: string
  location?: string | null
  queries: string[]
  responses: RawEngineResponse[]
}): string {
  const { businessName, websiteUrl, industry, location, queries, responses } = params

  // Group responses by query
  const queryBlocks = queries.map((query, qi) => {
    const qResponses = responses.filter((r) => r.query === query)
    const formatted = qResponses.map((r) => `- ${r.engine} response:\n${r.rawResponse.slice(0, 2500)}`).join('\n\n')
    return `QUERY ${qi + 1}: "${query}"\n${formatted}`
  }).join('\n\n---\n\n')

  return `Analyze these AI search engine responses to determine how visible "${businessName}" (${websiteUrl}) is.

Business: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location ?? 'not specified'}

${queryBlocks}

---

Extract the following data. Be precise and thorough.

For each engine (chatgpt, gemini, perplexity):
- "mentioned": Is "${businessName}" specifically mentioned BY NAME in ANY of the query responses for this engine? (true/false). Be case-insensitive. Check for partial name matches too.
- "mention_position": IMPORTANT — look at numbered lists (1. 2. 3. etc). If "${businessName}" is item #3, position = 3. If mentioned in running text without a list, count how many OTHER businesses are named before it (position = that count + 1). Set null ONLY if not mentioned at all.
- "sentiment": If mentioned — "positive" (recommended, praised, trusted), "neutral" (just listed), or "negative" (criticized, warned against). null if not mentioned.
- "context_quote": The EXACT sentence or phrase where ${businessName} is mentioned. Max 200 chars. null if not mentioned.
- "competitors_found": Other businesses mentioned alongside (not "${businessName}"). Include their list position if available. Max 6 per engine.

Also extract:
- "top_competitors": Deduplicated list across all engines. For each: name, how many engines mentioned them (1-3), and their best (lowest number) position. Max 8.
- "recommendations": 3-4 SPECIFIC, PERSONALIZED recommendations for improving ${businessName}'s AI visibility. Base each recommendation on what you actually found in the scan data. Reference specific engines or findings. Examples:
  - If not mentioned in Gemini: "Optimize Google Business Profile — Gemini draws heavily from Google's ecosystem and currently doesn't mention you."
  - If mentioned but low position: "Improve topical authority — you appear at position #7 in ChatGPT. Publishing expert content on [industry topic] can push you higher."
  - If competitors have better presence: "Study [competitor]'s content strategy — they rank #1 across all engines."
- "visibility_summary": One sentence summarizing the business's AI visibility across all engines.

Return ONLY this JSON (no other text):
{
  "engines": [
    {"engine": "chatgpt", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [{"name": string, "position": number|null}]},
    {"engine": "gemini", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [{"name": string, "position": number|null}]},
    {"engine": "perplexity", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [{"name": string, "position": number|null}]}
  ],
  "top_competitors": [{"name": string, "mention_count": number, "best_position": number|null}],
  "recommendations": [{"title": string, "description": string, "impact": "high"|"medium"|"low"}],
  "visibility_summary": string
}`
}

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

function buildFallbackAnalysis(
  businessName: string,
  responses: RawEngineResponse[],
): AnalysisResult {
  const lowerName = businessName.toLowerCase()
  const engines = ['chatgpt', 'gemini', 'perplexity']

  const engineResults: EngineAnalysis[] = engines.map((engine) => {
    const engineResponses = responses.filter((r) => r.engine === engine)
    const allText = engineResponses.map((r) => r.rawResponse).join(' ')
    const lowerText = allText.toLowerCase()
    const mentioned = lowerText.includes(lowerName)

    return {
      engine,
      mentioned,
      mention_position: mentioned ? estimatePosition(lowerText, lowerName) : null,
      sentiment: mentioned ? 'neutral' as const : null,
      context_quote: mentioned ? extractQuote(allText, businessName) : null,
      competitors_found: extractSimpleCompetitors(allText, businessName).map((name) => ({ name, position: null })),
    }
  })

  const allCompetitors = engineResults.flatMap((e) => e.competitors_found.map((c) => c.name))
  const competitorCounts = new Map<string, number>()
  for (const name of allCompetitors) {
    competitorCounts.set(name, (competitorCounts.get(name) ?? 0) + 1)
  }

  const topCompetitors = [...competitorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, mention_count: count, best_position: null }))

  const mentionedCount = engineResults.filter((e) => e.mentioned).length

  return {
    engines: engineResults,
    top_competitors: topCompetitors,
    recommendations: [
      { title: 'Improve online presence', description: `Focus on building content authority in your industry to increase AI visibility.`, impact: 'high' as const },
      { title: 'Add structured data', description: 'Schema markup helps AI engines understand your business type and services.', impact: 'medium' as const },
      { title: 'Get more reviews', description: 'Customer reviews on Google and industry platforms signal trust to AI engines.', impact: 'high' as const },
    ],
    visibility_summary: mentionedCount === 0
      ? `${businessName} was not found in any AI search engine.`
      : `${businessName} appears in ${mentionedCount} of 3 AI engines.`,
  }
}

function estimatePosition(text: string, name: string): number {
  const index = text.indexOf(name)
  if (index < 0) return 5
  const before = text.slice(0, index)
  const numberedItems = (before.match(/\d+[\.\)]/g) ?? []).length
  return Math.max(1, numberedItems + 1)
}

function extractQuote(text: string, name: string): string | null {
  const sentences = text.split(/[.!?\n]+/)
  const match = sentences.find((s) => s.toLowerCase().includes(name.toLowerCase()))
  return match ? match.trim().slice(0, 200) : null
}

function extractSimpleCompetitors(text: string, businessName: string): string[] {
  const pattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+(?:\s+(?:Inc|LLC|Ltd|Co|Corp)\.?)?)\b/g
  const matches: string[] = []
  let m: RegExpExecArray | null
  while ((m = pattern.exec(text)) !== null) {
    const name = m[1].trim()
    if (name.toLowerCase() !== businessName.toLowerCase() && name.length > 3) {
      matches.push(name)
    }
  }
  return [...new Set(matches)].slice(0, 8)
}

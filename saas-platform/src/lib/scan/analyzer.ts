/**
 * LLM-based scan response analyzer.
 *
 * Replaces the regex parser (parser.ts) with a single Gemini Flash call
 * that extracts structured mention/position/sentiment/competitor data
 * from raw engine responses. Costs <$0.001 per analysis.
 */

import { z } from 'zod'
import { getScanClient, MODELS } from '@/lib/openrouter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const engineAnalysisSchema = z.object({
  engine: z.string(),
  mentioned: z.boolean(),
  mention_position: z.number().nullable(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).nullable(),
  context_quote: z.string().nullable(),
  competitors_found: z.array(z.string()),
})

const analysisResultSchema = z.object({
  engines: z.array(engineAnalysisSchema),
  top_competitors: z.array(z.string()),
  visibility_summary: z.string(),
})

export type EngineAnalysis = z.infer<typeof engineAnalysisSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>

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
 * Analyze 6 raw engine responses (3 engines × 2 queries) using Gemini Flash.
 * Returns structured data about business visibility across engines.
 */
export async function analyzeResponses(params: {
  businessName: string
  websiteUrl: string
  industry: string
  location?: string | null
  queries: [string, string]
  responses: RawEngineResponse[]
}): Promise<AnalysisResult> {
  const { businessName, websiteUrl, industry, location, queries, responses } = params

  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) {
    return buildFallbackAnalysis(businessName, responses)
  }

  // Group responses by query
  const q1Responses = responses.filter((r) => r.query === queries[0])
  const q2Responses = responses.filter((r) => r.query === queries[1])

  const prompt = buildAnalyzerPrompt({
    businessName,
    websiteUrl,
    industry,
    location,
    queries,
    q1Responses,
    q2Responses,
  })

  try {
    const client = getScanClient()
    const completion = await client.chat.completions.create({
      model: MODELS.gemini, // Gemini Flash — cheapest, fastest for extraction
      messages: [
        {
          role: 'system',
          content: 'You are a precise data extraction assistant. You ONLY output valid JSON. No markdown, no explanation, no code blocks — just the JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.1, // Very low for consistent extraction
    })

    const text = completion.choices[0]?.message?.content ?? ''

    // Try to extract JSON from the response
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

    console.log(`[analyzer] LLM analysis complete — ${parsed.data.engines.filter((e) => e.mentioned).length}/3 engines mention business`)
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
  queries: [string, string]
  q1Responses: RawEngineResponse[]
  q2Responses: RawEngineResponse[]
}): string {
  const { businessName, websiteUrl, industry, location, queries, q1Responses, q2Responses } = params

  const formatResponses = (resps: RawEngineResponse[]) =>
    resps.map((r) => `- ${r.engine} response:\n${r.rawResponse.slice(0, 1500)}`).join('\n\n')

  return `Analyze these AI search engine responses to determine how visible "${businessName}" (${websiteUrl}) is.

Business: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location ?? 'not specified'}

QUERY 1: "${queries[0]}"
${formatResponses(q1Responses)}

QUERY 2: "${queries[1]}"
${formatResponses(q2Responses)}

For each engine (chatgpt, gemini, perplexity), extract:
- "mentioned": Is "${businessName}" specifically mentioned by name in EITHER query response? (true/false)
- "mention_position": If mentioned, what ordinal position? (1 = first business listed, 2 = second, etc. null if not mentioned)
- "sentiment": If mentioned, what is the tone? ("positive" = recommended/praised, "neutral" = listed without opinion, "negative" = criticized/warned against, null if not mentioned)
- "context_quote": The exact sentence or phrase where the business is mentioned (null if not mentioned). Max 200 chars.
- "competitors_found": Names of OTHER businesses mentioned as alternatives or competitors (max 8 per engine)

Also extract:
- "top_competitors": Deduplicated list of all competitor names across all engines (max 8)
- "visibility_summary": One sentence summarizing the business's AI visibility (e.g., "Strong presence in ChatGPT and Perplexity, not found in Gemini")

Return ONLY this JSON (no other text):
{
  "engines": [
    {"engine": "chatgpt", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [string]},
    {"engine": "gemini", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [string]},
    {"engine": "perplexity", "mentioned": bool, "mention_position": number|null, "sentiment": "positive"|"neutral"|"negative"|null, "context_quote": string|null, "competitors_found": [string]}
  ],
  "top_competitors": [string],
  "visibility_summary": string
}`
}

// ---------------------------------------------------------------------------
// Fallback (when LLM analysis fails or no API key)
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
      competitors_found: extractSimpleCompetitors(allText, businessName),
    }
  })

  const allCompetitors = engineResults.flatMap((e) => e.competitors_found)
  const topCompetitors = [...new Set(allCompetitors)].slice(0, 8)

  const mentionedCount = engineResults.filter((e) => e.mentioned).length
  const visibilitySummary = mentionedCount === 0
    ? `${businessName} was not found in any AI search engine for these queries.`
    : `${businessName} appears in ${mentionedCount} of 3 AI engines.`

  return { engines: engineResults, top_competitors: topCompetitors, visibility_summary: visibilitySummary }
}

function estimatePosition(text: string, name: string): number {
  const index = text.indexOf(name)
  if (index < 0) return 5
  const before = text.slice(0, index)
  // Count numbered list items before the mention
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

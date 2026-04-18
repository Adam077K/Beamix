import { z } from 'zod'
import { getAgentClient, MODELS } from '@/lib/openrouter'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Zod schema for LLM-generated recommendation output
// ---------------------------------------------------------------------------

export const generatedRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  recommendation_type: z.string(),
  suggested_agent: z.string().nullable(),
  credits_cost: z.number(),
  effort: z.string(),
  impact: z.string(),
  evidence: z.string(),
})

export const recommendationsArraySchema = z.array(generatedRecommendationSchema)

export type GeneratedRecommendation = z.infer<typeof generatedRecommendationSchema>

// ---------------------------------------------------------------------------
// Shared recommendation generation + storage
// ---------------------------------------------------------------------------

interface ScanData {
  scanId: string | null
  overallScore: number | null
  engineResults: Array<{
    engine: string
    is_mentioned: boolean
    rank_position?: number | null
    sentiment?: string | null
    sentiment_score?: number | null
  }>
}

interface BusinessContext {
  name: string
  websiteUrl: string | null
  industry: string | null
  location: string | null
}

/**
 * Generates AI recommendations from scan data via Claude Haiku and stores them
 * in the `recommendations` table.
 *
 * Used by:
 * - POST /api/onboarding/complete (after free scan conversion)
 * - POST /api/recommendations (on-demand generation)
 *
 * Returns the parsed recommendations array, or an empty array on failure.
 */
export async function generateAndStoreRecommendations(params: {
  userId: string
  businessId: string
  scanData: ScanData
  business: BusinessContext
  supabase: SupabaseClient
}): Promise<GeneratedRecommendation[]> {
  const { userId, businessId, scanData, business, supabase } = params

  const apiKey = process.env.OPENROUTER_AGENT_KEY ?? process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('[recommendations] No API key configured, skipping generation')
    return []
  }

  // Deduplication: if recommendations already exist for this scan, skip
  if (scanData.scanId) {
    const { data: existing } = await supabase
      .from('recommendations')
      .select('id')
      .eq('user_id', userId)
      .eq('scan_id', scanData.scanId)
      .limit(1)
    if (existing && existing.length > 0) return []
  }

  // Build scan context for LLM prompt
  const scanContext = scanData.scanId
    ? `Overall visibility score: ${scanData.overallScore ?? 'N/A'}/100
Engine results:
${scanData.engineResults.map((r) => {
  const sentimentInfo = r.sentiment_score != null
    ? `, sentiment ${r.sentiment_score}/100`
    : r.sentiment
      ? `, sentiment: ${r.sentiment}`
      : ''
  return `- ${r.engine}: ${r.is_mentioned ? `mentioned (rank ${r.rank_position ?? '?'}${sentimentInfo})` : 'NOT mentioned'}`
}).join('\n')}`
    : 'No scan data available yet.'

  const locationStr = business.location ? ` in ${business.location}` : ''
  const industry = business.industry ?? 'local business'

  const prompt = `You are an AI search optimization strategist. Based on the scan data below, generate 4-5 prioritized recommendations for improving ${business.name}'s visibility in AI search engines (ChatGPT, Gemini, Perplexity).

Business: ${business.name} — ${industry}${locationStr}
Website: ${business.websiteUrl ?? 'N/A'}

Current AI Visibility Scan:
${scanContext}

Return ONLY a JSON array with this exact structure (no other text):
[
  {
    "title": "Short action title (max 60 chars)",
    "description": "2-3 sentence explanation of what to do and why it matters for AI visibility",
    "priority": "high|medium|low",
    "recommendation_type": "content|technical|citation|profile|schema",
    "suggested_agent": "content_writer|blog_writer|faq_agent|schema_optimizer|null",
    "credits_cost": 1-5,
    "effort": "low|medium|high",
    "impact": "low|medium|high",
    "evidence": "One sentence citing the specific scan evidence that triggered this recommendation"
  }
]

Prioritize recommendations with the highest AI visibility impact. Focus on actionable, specific improvements.`

  // Call LLM
  const client = getAgentClient()
  let recommendations: GeneratedRecommendation[]

  try {
    const response = await client.chat.completions.create({
      model: MODELS.haiku,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[recommendations] LLM did not return a JSON array')
      return []
    }

    let rawParsed: unknown
    try {
      rawParsed = JSON.parse(jsonMatch[0])
    } catch {
      console.error('[recommendations] LLM returned invalid JSON')
      return []
    }

    const validated = recommendationsArraySchema.safeParse(rawParsed)
    if (!validated.success) {
      console.error('[recommendations] LLM returned malformed recommendations:', validated.error.issues)
      return []
    }

    recommendations = validated.data
  } catch (err) {
    console.error('[recommendations] Generation failed:', err)
    return []
  }

  // Store in DB
  const toInsert = recommendations.map((rec) => ({
    user_id: userId,
    business_id: businessId,
    scan_id: scanData.scanId,
    title: rec.title,
    description: rec.description,
    priority: rec.priority as 'high' | 'medium' | 'low',
    recommendation_type: rec.recommendation_type,
    suggested_agent: rec.suggested_agent as
      | 'content_writer' | 'blog_writer' | 'faq_agent' | 'schema_optimizer'
      | 'review_analyzer' | 'social_strategy' | 'competitor_intelligence'
      | null,
    credits_cost: rec.credits_cost,
    effort: rec.effort,
    impact: rec.impact,
    evidence: rec.evidence,
    status: 'new' as const,
  }))

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('recommendations')
      .insert(toInsert)

    if (insertError) {
      console.error('[recommendations] Insert failed:', insertError)
      return []
    }
  }

  return recommendations
}

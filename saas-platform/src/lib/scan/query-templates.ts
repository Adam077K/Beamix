/**
 * Smart query generation for AI visibility scanning.
 *
 * Generates 2 queries per scan:
 *   Query 1 (category):  "What are the best [industry] in [location]?"
 *     → Tests organic visibility: does the engine mention the business
 *       when someone searches for the category?
 *
 *   Query 2 (brand):     "Tell me about [business name]. Are they good?"
 *     → Tests brand recognition: how does the engine describe
 *       the business when asked directly?
 *
 * Both signals together give a complete picture:
 *   - Category visibility = organic discoverability
 *   - Brand recognition = reputation & sentiment
 */

import { getScanClient, MODELS } from '@/lib/openrouter'

/**
 * Infer the industry from a business name and URL using Gemini Flash.
 * Falls back to 'local business' if LLM is unavailable.
 * Cost: <$0.001, latency: ~0.5-1s
 */
export async function inferIndustry(
  businessName: string,
  websiteUrl: string,
): Promise<string> {
  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) return 'local business'

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.gemini,
      messages: [{
        role: 'user',
        content: `What industry or business type is "${businessName}" (${websiteUrl})? Reply with ONLY the industry in 2-4 words. Examples: "plumbing services", "dental clinic", "Italian restaurant", "digital marketing agency", "auto repair shop". No explanation, just the industry.`,
      }],
      max_tokens: 20,
      temperature: 0.1,
    })

    const industry = response.choices[0]?.message?.content?.trim().toLowerCase() ?? 'local business'
    console.log(`[query-templates] Inferred industry: "${industry}" for "${businessName}"`)
    return industry || 'local business'
  } catch (error) {
    console.warn('[query-templates] Industry inference failed:', error instanceof Error ? error.message : error)
    return 'local business'
  }
}

/**
 * Generate 2 smart search queries for a visibility scan.
 *
 * @returns [categoryQuery, brandQuery]
 *   categoryQuery — tests organic visibility in the industry
 *   brandQuery — tests direct brand recognition
 */
export function generateScanQueries(
  businessName: string,
  industry: string,
  location?: string | null,
): [string, string] {
  const locationClause = location && location !== 'Global' ? ` in ${location}` : ''

  // Query 1: Category/organic visibility
  // Tests: does the engine mention this business when someone searches for the industry?
  const categoryQuery = `What are the best ${industry}${locationClause}? Give me a top 10 list with brief descriptions.`

  // Query 2: Direct brand recognition
  // Tests: how does the engine describe this business? What's the sentiment?
  const brandQuery = `Tell me about ${businessName}${locationClause}. What do they do? Are they recommended? What do customers say?`

  return [categoryQuery, brandQuery]
}

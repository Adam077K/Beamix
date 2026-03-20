/**
 * Smart query generation for AI visibility scanning.
 *
 * Generates 3 queries per scan:
 *   Query 1 (category):  Organic visibility — numbered list of top businesses
 *   Query 2 (brand):     Brand recognition — direct question with URL disambiguation
 *   Query 3 (authority): Problem/solution — does the business appear as an expert example?
 */

import { getScanClient, MODELS } from '@/lib/openrouter'

/**
 * Infer the industry from a business name and URL using Gemini Flash.
 * Falls back to 'local business' if LLM is unavailable.
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
 * Extract domain from URL for disambiguation.
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

/**
 * Generate 3 smart search queries for a visibility scan.
 *
 * @returns [categoryQuery, brandQuery, authorityQuery]
 */
export function generateScanQueries(
  businessName: string,
  websiteUrl: string,
  industry: string,
  location?: string | null,
): [string, string, string] {
  const locationClause = location && location !== 'Global' ? ` in ${location}` : ''
  const domain = extractDomain(websiteUrl)

  // Query 1: Category/organic visibility
  // Forces numbered list for clear position extraction
  const categoryQuery = `What are the best ${industry}${locationClause}? List them as a numbered list: 1. 2. 3. etc. Include a one-line description of each.`

  // Query 2: Direct brand recognition with URL disambiguation
  // Adding the domain prevents confusion with similarly-named businesses
  const brandQuery = `Tell me about ${businessName} (${domain})${locationClause}. What do they do? Are they recommended? What do customers say about them?`

  // Query 3: Problem/solution authority
  // Tests if the business appears as an expert or case study
  const authorityQuery = `How can a ${industry} improve their online presence and attract more customers${locationClause}? Give examples of companies doing it well.`

  return [categoryQuery, brandQuery, authorityQuery]
}

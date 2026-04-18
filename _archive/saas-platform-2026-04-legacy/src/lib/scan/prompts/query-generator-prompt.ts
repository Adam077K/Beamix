/**
 * Query Generator Prompt — LLM generates natural scan queries from research data.
 *
 * DESIGN DECISIONS:
 *
 * 1. TWO MODES:
 *    - Template mode (free/starter): Uses interpolateTemplate() from query-taxonomy.ts.
 *      Fast, cheap, deterministic. Good enough for basic scans.
 *    - LLM mode (pro/business): This prompt asks an LLM to generate queries.
 *      Produces more natural, varied queries that better simulate real users.
 *      Worth the extra ~$0.002 cost for paid tiers.
 *
 * 2. STRICT RULES. The LLM is explicitly told:
 *    - NEVER mention the business name in any query
 *    - NEVER include the business URL
 *    - Queries must sound like a real person, not a search engine prompt
 *    - Each query must map to exactly one query_type
 *
 * 3. CUSTOMER_SEARCH_QUERIES SEED. The research phase extracts what customers
 *    would actually search for. We pass these as "inspiration" to the LLM,
 *    which then adapts them into properly typed queries.
 *
 * 4. MODEL CHOICE. Uses Gemini Flash (cheap, fast) since query generation
 *    is a relatively simple task. No need for Sonnet here.
 */

import type { QueryType, BusinessResearchOutput, GeneratedQuery } from './types'
import { getQueryTemplatesForTier, interpolateTemplate } from './query-taxonomy'
import { getEngineQueryTypes } from './query-taxonomy'

// ---------------------------------------------------------------------------
// Template mode (free/starter)
// ---------------------------------------------------------------------------

/**
 * Generate queries using template interpolation. No LLM call needed.
 * Used for free and starter tiers.
 */
export function generateTemplateQueries(
  research: BusinessResearchOutput,
  tier: 'free' | 'starter',
): GeneratedQuery[] {
  const templates = getQueryTemplatesForTier(tier)

  return templates.map((template) => ({
    text: interpolateTemplate(template.template, research),
    type: template.type,
    interpolated_fields: extractInterpolatedFields(template.template),
  }))
}

function extractInterpolatedFields(template: string): string[] {
  const matches = template.match(/\{(\w+)\}/g) ?? []
  return matches.map((m) => m.replace(/[{}]/g, ''))
}

// ---------------------------------------------------------------------------
// LLM mode (pro/business)
// ---------------------------------------------------------------------------

/**
 * Build the prompt that asks an LLM to generate natural scan queries.
 *
 * @param research - Business research data from Perplexity
 * @param tier - 'pro' or 'business'
 * @param engineQueryMap - Which query types each engine needs
 */
export function buildQueryGeneratorPrompt(
  research: BusinessResearchOutput,
  tier: 'pro' | 'business',
  requestedQueryTypes: QueryType[],
  businessName?: string,
): string {
  const queryTypeDescriptions = requestedQueryTypes.map((qt) => {
    const desc = QUERY_TYPE_DESCRIPTIONS[qt]
    return `- ${qt}: ${desc}`
  }).join('\n')

  const customerQueriesSection = research.customer_search_queries.length > 0
    ? `\nReal queries customers use to find this type of business (for inspiration):\n${research.customer_search_queries.map((q) => `  - "${q}"`).join('\n')}\n`
    : ''

  return `Generate natural search queries for an AI visibility scan. These queries will be sent to AI assistants (ChatGPT, Gemini, Perplexity, Claude) to measure how visible a business is in AI-generated recommendations.

BUSINESS CONTEXT (do NOT mention this business in the queries):
- Industry: ${research.industry}
- Location: ${research.geographic_market}
- Services: ${research.primary_services.join(', ')}
- Target customers: ${research.target_customer_type}
- Key differentiator: ${research.differentiators[0] ?? 'general provider'}
- Top competitor: ${research.competitors[0]?.name ?? 'unknown'}
${customerQueriesSection}
QUERY TYPES NEEDED:
${queryTypeDescriptions}

RULES (critical):
1. NEVER mention the business name "${businessName ?? 'the target business'}" or any specific URL in the queries.
2. Each query must sound like a real person typing into ChatGPT or Perplexity.
3. Use natural language, not keyword-stuffed search queries.
4. Include the location naturally when relevant (not every query needs it).
5. Vary the phrasing — don't start every query with "What are the best..."
6. Each query must clearly map to exactly one query_type.
7. Queries should be 1-2 sentences max.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {"text": "query text here", "type": "query_type_name"},
  ...
]`
}

/**
 * Human-readable descriptions of each query type, used in the prompt.
 */
const QUERY_TYPE_DESCRIPTIONS: Record<QueryType, string> = {
  category_ranking: 'A customer searching for the best providers in a category. Should elicit a ranked list. Example: "Who are the top web design agencies in Berlin?"',
  service_specific: 'A customer looking for a specific service. More targeted than category. Example: "I need someone to build a Shopify store with custom integrations."',
  problem_solution: 'A customer describing their problem, not the solution. Example: "My restaurant website gets no online orders, how can I fix this?"',
  local_comparison: 'A customer comparing local options. Example: "Compare the top 5 accounting firms in Amsterdam for small businesses."',
  industry_authority: 'A query about who the thought leaders and experts are. Example: "Who are the most respected cybersecurity firms globally?"',
  use_case_recommendation: 'A customer with a specific use case seeking a fit. Example: "I need a marketing agency that specializes in B2B SaaS content."',
  competitor_alternative: 'A customer looking for alternatives to a known company. Example: "What are good alternatives to HubSpot for small businesses?"',
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

/**
 * Parse the LLM's query generation response.
 */
export function parseGeneratedQueries(
  rawText: string,
  requestedTypes: QueryType[],
): GeneratedQuery[] | null {
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as Array<{ text: string; type: string }>

    if (!Array.isArray(parsed) || parsed.length === 0) return null

    // Validate and filter
    return parsed
      .filter((q) => q.text && q.type && requestedTypes.includes(q.type as QueryType))
      .map((q) => ({
        text: q.text,
        type: q.type as QueryType,
        interpolated_fields: [], // LLM-generated, no template fields
      }))
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Unified query generation
// ---------------------------------------------------------------------------

/**
 * Get all unique query types needed across all engines for a tier.
 */
export function getAllQueryTypesForTier(
  tier: string,
  engines: string[],
): QueryType[] {
  const allTypes = new Set<QueryType>()
  for (const engine of engines) {
    const types = getEngineQueryTypes(engine, tier)
    for (const t of types) allTypes.add(t)
  }
  return [...allTypes]
}

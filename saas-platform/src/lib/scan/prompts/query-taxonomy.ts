/**
 * Query Taxonomy — the core query types for AI visibility scanning.
 *
 * DESIGN DECISIONS:
 *
 * 1. NO BRAND QUERIES. The old system had a "brand query" that explicitly named
 *    the business and asked about it. This is equivalent to typing your own name
 *    into Google — it inflates scores and tells you nothing about organic visibility.
 *    Every query here simulates what a REAL CUSTOMER would search, never mentioning
 *    the business name.
 *
 * 2. QUERY TYPES REFLECT REAL SEARCH INTENT. Customers search in distinct patterns:
 *    - "Who's the best X in Y?" (category ranking)
 *    - "I need someone who does [specific thing]" (service specific)
 *    - "How do I solve [problem]?" (problem/solution)
 *    - "Compare X options in my area" (local comparison)
 *    - "What's the best approach for [use case]?" (use case recommendation)
 *    - "Alternatives to [known competitor]" (competitor alternative)
 *    - "Who are the experts in [field]?" (industry authority)
 *
 * 3. TIER SCALING. Free gets 3 query types (the basics). Business gets all 7.
 *    More query types = more coverage of search intent = more accurate picture.
 *
 * 4. SCORING WEIGHTS. Not all query types are equal:
 *    - category_ranking (1.0): The most common customer search. Gold standard.
 *    - service_specific (0.9): High intent, directly leads to purchase.
 *    - problem_solution (0.8): Customer has a need but hasn't decided on a category.
 *    - local_comparison (0.85): Location-specific intent, critical for local businesses.
 *    - industry_authority (0.7): Thought leadership signal, less purchase intent.
 *    - use_case_recommendation (0.75): Contextual discovery, moderate intent.
 *    - competitor_alternative (0.65): Only relevant if competitors are known brands.
 */

import type { QueryTemplate, QueryType, BusinessResearchOutput } from './types'

// ---------------------------------------------------------------------------
// Query templates
// ---------------------------------------------------------------------------

export const QUERY_TEMPLATES: QueryTemplate[] = [
  {
    type: 'category_ranking',
    purpose: 'Measures if business appears when customers search for the best in their category',
    template: 'What are the best {primary_service} providers in {location}? Give me a ranked list with pros and cons of each.',
    tiers: ['free', 'starter', 'pro', 'business'],
    scoringWeight: 1.0,
  },
  {
    type: 'service_specific',
    purpose: 'Tests visibility for specific service offerings, not just the broad category',
    template: 'I need {specific_service} in {location}. Who are the top companies that offer this and what should I look for when choosing one?',
    tiers: ['free', 'starter', 'pro', 'business'],
    scoringWeight: 0.9,
  },
  {
    type: 'problem_solution',
    purpose: 'Tests if the business appears when customers describe their problem, not the solution',
    template: 'I\'m a {target_customer} and I need help with {customer_problem}. What are my best options in {location}?',
    tiers: ['free', 'starter', 'pro', 'business'],
    scoringWeight: 0.8,
  },
  {
    type: 'local_comparison',
    purpose: 'Simulates a customer comparing options in their specific area',
    template: 'Compare the top {industry} companies in {location}. Which one is best for {target_customer} and why?',
    tiers: ['starter', 'pro', 'business'],
    scoringWeight: 0.85,
  },
  {
    type: 'industry_authority',
    purpose: 'Tests thought leadership and expert recognition in the industry',
    template: 'Who are the leading experts and companies in {industry} right now? What makes them stand out from the rest?',
    tiers: ['pro', 'business'],
    scoringWeight: 0.7,
  },
  {
    type: 'use_case_recommendation',
    purpose: 'Tests if the business appears in contextual, use-case-driven recommendations',
    template: 'I\'m looking for a {industry} solution that specializes in {differentiator}. What companies should I consider?',
    tiers: ['pro', 'business'],
    scoringWeight: 0.75,
  },
  {
    type: 'competitor_alternative',
    purpose: 'Tests if the business appears as an alternative to known competitors',
    template: 'What are good alternatives to {top_competitor} for {primary_service} in {location}? I want to compare my options.',
    tiers: ['business'],
    scoringWeight: 0.65,
  },
]

// ---------------------------------------------------------------------------
// Query counts per tier per engine
// ---------------------------------------------------------------------------

/**
 * How many queries each engine receives per tier.
 *
 * DESIGN: Not every engine gets every query. This reflects real behavior:
 * - Perplexity is strongest for research queries, gets the most
 * - ChatGPT is the most popular AI, critical baseline
 * - Gemini is Google's play, important for local/maps integration
 * - Claude is training-data only (no web search), fewer queries needed
 *   because it can't find businesses it wasn't trained on
 */
export const QUERIES_PER_ENGINE_PER_TIER: Record<
  string,
  Record<string, QueryType[]>
> = {
  free: {
    chatgpt: ['category_ranking', 'service_specific'],
    gemini: ['category_ranking', 'problem_solution'],
    perplexity: ['category_ranking', 'service_specific', 'problem_solution'],
  },
  starter: {
    chatgpt: ['category_ranking', 'service_specific', 'local_comparison'],
    gemini: ['category_ranking', 'problem_solution', 'local_comparison'],
    perplexity: ['category_ranking', 'service_specific', 'problem_solution', 'local_comparison'],
  },
  pro: {
    chatgpt: ['category_ranking', 'service_specific', 'local_comparison', 'industry_authority'],
    gemini: ['category_ranking', 'problem_solution', 'local_comparison', 'use_case_recommendation'],
    perplexity: ['category_ranking', 'service_specific', 'problem_solution', 'local_comparison', 'industry_authority'],
    claude: ['category_ranking', 'service_specific', 'industry_authority'],
  },
  business: {
    chatgpt: ['category_ranking', 'service_specific', 'local_comparison', 'industry_authority', 'use_case_recommendation'],
    gemini: ['category_ranking', 'problem_solution', 'local_comparison', 'use_case_recommendation', 'competitor_alternative'],
    perplexity: ['category_ranking', 'service_specific', 'problem_solution', 'local_comparison', 'industry_authority', 'use_case_recommendation'],
    claude: ['category_ranking', 'service_specific', 'industry_authority', 'competitor_alternative'],
  },
}

// ---------------------------------------------------------------------------
// Template interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolate a query template with real business context.
 *
 * DESIGN: We use simple {field} interpolation, not an LLM, for free/starter.
 * This keeps costs predictable and latency low. Pro/Business tiers can
 * optionally use LLM-generated queries for more natural phrasing — see
 * query-generator-prompt.ts.
 *
 * Interpolation fields:
 *   {primary_service}     - research.primary_services[0]
 *   {specific_service}    - research.primary_services[1] or [0]
 *   {location}            - research.geographic_market
 *   {industry}            - research.industry
 *   {target_customer}     - research.target_customer_type
 *   {customer_problem}    - derived from services (e.g., "plumbing" -> "plumbing issues at home")
 *   {differentiator}      - research.differentiators[0]
 *   {top_competitor}       - research.competitors[0].name
 */
export function interpolateTemplate(
  template: string,
  research: BusinessResearchOutput,
): string {
  const primaryService = research.primary_services[0] ?? research.industry
  const specificService = research.primary_services[1] ?? research.primary_services[0] ?? research.industry
  const location = research.geographic_market || 'my area'
  const topCompetitor = research.competitors[0]?.name ?? 'the market leader'
  const differentiator = research.differentiators[0] ?? primaryService
  const customerProblem = deriveCustomerProblem(primaryService, research.target_customer_type)

  const replacements: Record<string, string> = {
    '{primary_service}': primaryService,
    '{specific_service}': specificService,
    '{location}': location,
    '{industry}': research.industry,
    '{target_customer}': research.target_customer_type,
    '{customer_problem}': customerProblem,
    '{differentiator}': differentiator,
    '{top_competitor}': topCompetitor,
  }

  let result = template
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replaceAll(placeholder, value)
  }
  return result
}

/**
 * Derive a customer problem statement from the primary service.
 * This converts "plumbing services" -> "plumbing issues at home"
 * and "digital marketing" -> "growing my online presence".
 */
function deriveCustomerProblem(primaryService: string, targetCustomer: string): string {
  // Strip common suffixes to get the core service noun, then form a natural problem phrase
  const core = primaryService
    .replace(/\s*(services?|agency|agencies|company|companies|solutions?|consulting|firm|studio)\s*$/i, '')
    .trim()
  if (!core) return `finding a good ${primaryService} provider`
  return `${core} issues`
}

// ---------------------------------------------------------------------------
// Get queries for a tier
// ---------------------------------------------------------------------------

/**
 * Get the query templates applicable to a given tier.
 */
export function getQueryTemplatesForTier(
  tier: 'free' | 'starter' | 'pro' | 'business',
): QueryTemplate[] {
  return QUERY_TEMPLATES.filter((qt) => qt.tiers.includes(tier))
}

/**
 * Get the query types a specific engine should receive for a tier.
 */
export function getEngineQueryTypes(
  engine: string,
  tier: string,
): QueryType[] {
  const tierMap = QUERIES_PER_ENGINE_PER_TIER[tier] ?? QUERIES_PER_ENGINE_PER_TIER.free
  return tierMap[engine] ?? []
}

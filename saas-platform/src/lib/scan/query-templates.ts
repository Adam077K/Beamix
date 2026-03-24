/**
 * Smart query generation for AI visibility scanning.
 *
 * Pipeline:
 * 1. Scrape website homepage for real context
 * 2. Perplexity researches the business AND generates natural search queries
 * 3. Use Perplexity's queries (it knows how real users search for this product)
 * 4. Each engine gets a subset — Perplexity gets all 3, others get 2 random
 */

import { getScanClient, MODELS } from '@/lib/openrouter'
import { scrapeWebsite, summarizeWebsiteContext } from './website-scraper'

// ---------------------------------------------------------------------------
// Business research
// ---------------------------------------------------------------------------

export interface BusinessResearch {
  industry: string
  description: string
  services: string[]
  targetCustomers: string
  searchQueries: string[]
  websiteContext: string
  websiteTitle: string | null
  websiteDescription: string | null
}

/**
 * Research the business using website scraping + Perplexity web search.
 *
 * Perplexity also generates the scan queries — it understands the business
 * deeply and knows how real customers would search for this type of product.
 */
export async function researchBusiness(
  businessName: string,
  websiteUrl: string,
  sector?: string,
): Promise<BusinessResearch> {
  // Step 1: Scrape website first — we need the content for Perplexity
  const websiteCtx = await scrapeWebsite(websiteUrl)
  const websiteContext = summarizeWebsiteContext(websiteCtx)

  console.log(`[research] Scraped ${websiteUrl} — title: "${websiteCtx.title}", context: ${websiteContext.length} chars`)

  // Step 2: Research with Perplexity — pass website context + sector hint
  const perplexityResearch = await callPerplexityResearch(
    businessName,
    websiteUrl,
    websiteContext,
    sector ?? 'general',
  )

  // Combine results
  const industry = perplexityResearch.industry || extractIndustryFromWebsite(websiteCtx) || sector || 'local business'
  const description = perplexityResearch.description || websiteCtx.metaDescription || `${businessName} — ${industry}`
  const services = perplexityResearch.services.length > 0
    ? perplexityResearch.services
    : websiteCtx.headlines.slice(0, 3)
  const targetCustomers = perplexityResearch.targetCustomers || 'general customers'
  const searchQueries = perplexityResearch.searchQueries

  console.log(`[research] Industry: "${industry}", Services: [${services.join(', ')}]`)
  console.log(`[research] Search queries from Perplexity: [${searchQueries.join(' | ')}]`)

  return {
    industry, description, services, targetCustomers, searchQueries, websiteContext,
    websiteTitle: websiteCtx.title,
    websiteDescription: websiteCtx.metaDescription,
  }
}

/**
 * Deep Perplexity research — understands the business AND generates scan queries.
 *
 * The key insight: Perplexity knows how real users search. After understanding
 * the business, it generates 3 natural queries that a customer would actually
 * type into ChatGPT/Perplexity to find this type of product.
 *
 * Example for Rocket.new:
 * - "best AI app builder"
 * - "top vibe coding tools"
 * - "no-code AI platform for building apps"
 *
 * NOT: "best Natural language app generation" (which nobody searches for)
 */
async function callPerplexityResearch(
  businessName: string,
  websiteUrl: string,
  websiteContext: string,
  sector: string,
): Promise<{ industry: string; description: string; services: string[]; targetCustomers: string; searchQueries: string[] }> {
  const empty = { industry: '', description: '', services: [] as string[], targetCustomers: '', searchQueries: [] as string[] }

  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) return empty

  const websiteSection = websiteContext.trim()
    ? `\nHere is text extracted from their homepage:\n---\n${websiteContext.slice(0, 1500)}\n---\n`
    : ''

  const sectorHint = sector && sector !== 'general'
    ? `The user describes their business as being in the "${sector}" industry.\n`
    : ''

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.researcher,
      messages: [{
        role: 'user',
        content: `Research the business "${businessName}" at ${websiteUrl}.
${sectorHint}${websiteSection}
Based on their website and your web search, tell me:

1. INDUSTRY: What specific category are they in? Use a clear 2-5 word label.
   Examples: "AI app builder platform", "emergency plumbing services", "B2B SaaS analytics"

2. DESCRIPTION: What exactly do they do? 2-3 sentences.

3. SERVICES: What specific products/services do they offer? List 2-5.

4. CUSTOMERS: Who are their customers? Be specific.

5. COMPETITORS: Name 3-5 REAL companies that directly compete with them in the same market.

6. SEARCH QUERIES: What would a real person type into ChatGPT or Google to find this type of product/service?
   Give me exactly 3 short, natural search queries. These should be what CUSTOMERS would actually search for.
   Do NOT mention "${businessName}" in the queries — use generic category terms.
   Keep them short (3-7 words), like real search queries.
   Examples: "best AI app builder", "top plumber near me", "affordable SEO agency"

Return ONLY this JSON:
{
  "industry": "specific category label",
  "description": "what this business does",
  "services": ["service 1", "service 2", "service 3"],
  "target_customers": "who buys from them",
  "competitors": ["competitor 1", "competitor 2", "competitor 3"],
  "search_queries": ["short natural query 1", "short natural query 2", "short natural query 3"]
}`,
      }],
      max_tokens: 800,
      temperature: 0.2,
    })

    const text = response.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return empty

    const parsed = JSON.parse(jsonMatch[0])
    return {
      industry: parsed.industry ?? '',
      description: parsed.description ?? '',
      services: Array.isArray(parsed.services) ? parsed.services : [],
      targetCustomers: parsed.target_customers ?? '',
      searchQueries: Array.isArray(parsed.search_queries) ? parsed.search_queries.slice(0, 3) : [],
    }
  } catch (error) {
    console.warn('[research] Perplexity research failed:', error instanceof Error ? error.message : error)
    return empty
  }
}

function extractIndustryFromWebsite(ctx: Awaited<ReturnType<typeof scrapeWebsite>>): string | null {
  const text = [ctx.title, ctx.metaDescription, ...ctx.headlines].filter(Boolean).join(' ').toLowerCase()
  if (!text) return null

  const industryKeywords: Record<string, string> = {
    'plumb': 'plumbing services', 'dent': 'dental clinic', 'restaurant': 'restaurant',
    'lawyer': 'legal services', 'attorney': 'legal services', 'real estate': 'real estate',
    'marketing': 'marketing agency', 'software': 'software company', 'saas': 'SaaS platform',
    'ai ': 'AI technology', 'construction': 'construction', 'cleaning': 'cleaning service',
  }

  for (const [keyword, industry] of Object.entries(industryKeywords)) {
    if (text.includes(keyword)) return industry
  }

  return null
}

// ---------------------------------------------------------------------------
// Query generation
// ---------------------------------------------------------------------------

/**
 * Generate 3 scan queries.
 *
 * Primary: use Perplexity-generated queries (it knows how real users search).
 * Fallback: template-based queries if Perplexity didn't return search_queries.
 */
export function generateScanQueries(
  _businessName: string,
  _websiteUrl: string,
  research: BusinessResearch,
  location?: string | null,
): [string, string, string] {
  const loc = location && location !== 'Global' ? ` in ${location}` : ''

  // Use Perplexity-generated queries if available (much better quality)
  if (research.searchQueries.length >= 3) {
    const queries = research.searchQueries.slice(0, 3) as [string, string, string]
    console.log(`[queries] Using Perplexity-generated queries:`)
    console.log(`[queries] Q1: "${queries[0]}"`)
    console.log(`[queries] Q2: "${queries[1]}"`)
    console.log(`[queries] Q3: "${queries[2]}"`)
    return queries
  }

  // Fallback: template-based queries
  const primaryService = research.services[0] ?? research.industry
  const q1 = `best ${primaryService}${loc}`
  const q2 = `can you recommend a good ${primaryService}${loc}`
  const q3 = `top ${research.industry} companies${loc}`

  console.log(`[queries] Using template queries (Perplexity didn't generate search_queries):`)
  console.log(`[queries] Q1: "${q1}"`)
  console.log(`[queries] Q2: "${q2}"`)
  console.log(`[queries] Q3: "${q3}"`)

  return [q1, q2, q3]
}

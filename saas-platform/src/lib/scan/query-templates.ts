/**
 * Smart query generation for AI visibility scanning.
 *
 * Pipeline:
 * 1. Perplexity does deep research about the business
 * 2. We generate 3 simple, natural queries from the research
 * 3. Each engine gets a subset — Perplexity gets all 3, others get 2 random
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
  websiteContext: string
  websiteTitle: string | null
  websiteDescription: string | null
}

/**
 * Research the business using website scraping + Perplexity web search.
 * This is the deep research step — Perplexity gets a detailed prompt
 * to fully understand the business, its industry, and its market.
 */
export async function researchBusiness(
  businessName: string,
  websiteUrl: string,
): Promise<BusinessResearch> {
  const [websiteCtx, perplexityResearch] = await Promise.all([
    scrapeWebsite(websiteUrl),
    callPerplexityResearch(businessName, websiteUrl),
  ])

  const websiteContext = summarizeWebsiteContext(websiteCtx)

  const industry = perplexityResearch.industry || extractIndustryFromWebsite(websiteCtx) || 'local business'
  const description = perplexityResearch.description || websiteCtx.metaDescription || `${businessName} — ${industry}`
  const services = perplexityResearch.services.length > 0
    ? perplexityResearch.services
    : websiteCtx.headlines.slice(0, 3)
  const targetCustomers = perplexityResearch.targetCustomers || 'general customers'

  console.log(`[research] Industry: "${industry}", Services: [${services.join(', ')}]`)

  return {
    industry, description, services, targetCustomers, websiteContext,
    websiteTitle: websiteCtx.title,
    websiteDescription: websiteCtx.metaDescription,
  }
}

/**
 * Deep Perplexity research — detailed prompt to understand the business.
 * This is the ONLY place where we use a detailed, structured prompt.
 * All other queries (to ChatGPT, Gemini, Perplexity scan queries) are simple and natural.
 */
async function callPerplexityResearch(
  businessName: string,
  websiteUrl: string,
): Promise<{ industry: string; description: string; services: string[]; targetCustomers: string }> {
  const empty = { industry: '', description: '', services: [] as string[], targetCustomers: '' }

  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) return empty

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.researcher,
      messages: [{
        role: 'user',
        content: `Research the business "${businessName}" at ${websiteUrl}.

Visit their website and search the web to find out:
- What industry/category are they in? (use a short 2-4 word label like "plumbing services" or "digital marketing agency")
- What do they actually do? What's their main product or service?
- What specific services or products do they offer?
- Who are their customers?
- Who are their main competitors in this market?

I need accurate, current information based on their real website.

Return ONLY this JSON:
{
  "industry": "2-4 word industry label",
  "description": "2-3 sentences about what this business does",
  "services": ["main service", "second service", "third service"],
  "target_customers": "who their customers are",
  "competitors": ["competitor 1", "competitor 2", "competitor 3"]
}`,
      }],
      max_tokens: 600,
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
// Query generation — simple, natural queries like real users would type
// ---------------------------------------------------------------------------

/**
 * Generate 3 simple, natural search queries based on business research.
 *
 * These mimic what a REAL USER would type into ChatGPT, Gemini, or Perplexity
 * when looking for this type of business. Short, natural, no instructions.
 *
 * The business name is NEVER mentioned in any query — we're measuring
 * organic visibility (does the AI recommend you without being asked about you?).
 */
export function generateScanQueries(
  _businessName: string,
  _websiteUrl: string,
  research: BusinessResearch,
  location?: string | null,
): [string, string, string] {
  const loc = location && location !== 'Global' ? ` in ${location}` : ''
  const primaryService = research.services[0] ?? research.industry

  // Query 1: Direct category search — "best X in Y"
  const q1 = `best ${primaryService}${loc}`

  // Query 2: Recommendation request — "recommend a X in Y"
  const q2 = `can you recommend a good ${primaryService}${loc}`

  // Query 3: Top companies — "top X companies in Y"
  const q3 = `top ${research.industry} companies${loc}`

  console.log(`[queries] Q1: "${q1}"`)
  console.log(`[queries] Q2: "${q2}"`)
  console.log(`[queries] Q3: "${q3}"`)

  return [q1, q2, q3]
}

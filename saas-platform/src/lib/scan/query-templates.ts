/**
 * Smart query generation for AI visibility scanning.
 *
 * Pipeline:
 * 1. Scrape website homepage for real context
 * 2. Perplexity researches the business (web search)
 * 3. Generate 3 queries based on real data, not guesses
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
}

/**
 * Research the business using website scraping + Perplexity web search.
 * Returns real, grounded information about what the business does.
 *
 * Cost: 1 API call (Perplexity) + 1 website fetch. ~1-3s.
 */
export async function researchBusiness(
  businessName: string,
  websiteUrl: string,
): Promise<BusinessResearch> {
  // Step 1: Scrape website (parallel with Perplexity call)
  const [websiteCtx, perplexityResearch] = await Promise.all([
    scrapeWebsite(websiteUrl),
    callPerplexityResearch(businessName, websiteUrl),
  ])

  const websiteContext = summarizeWebsiteContext(websiteCtx)

  // Combine website data + Perplexity research
  const industry = perplexityResearch.industry || extractIndustryFromWebsite(websiteCtx) || 'local business'
  const description = perplexityResearch.description || websiteCtx.metaDescription || `${businessName} — ${industry}`
  const services = perplexityResearch.services.length > 0
    ? perplexityResearch.services
    : websiteCtx.headlines.slice(0, 3)
  const targetCustomers = perplexityResearch.targetCustomers || 'general customers'

  console.log(`[research] Industry: "${industry}", Services: [${services.join(', ')}]`)

  return { industry, description, services, targetCustomers, websiteContext }
}

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
        content: `Research the business "${businessName}" at ${websiteUrl}. I need ACCURATE information.

Return ONLY this JSON (no other text):
{
  "industry": "2-4 word industry description (e.g., 'AI visibility platform', 'plumbing services', 'Italian restaurant')",
  "description": "One sentence describing what this business does",
  "services": ["service 1", "service 2", "service 3"],
  "target_customers": "Who their typical customers are (e.g., 'small businesses', 'homeowners in NYC', 'enterprise companies')"
}`,
      }],
      max_tokens: 300,
      temperature: 0.1,
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
  // Try to extract industry from title or meta description
  const text = [ctx.title, ctx.metaDescription, ...ctx.headlines].filter(Boolean).join(' ').toLowerCase()
  if (!text) return null

  // Simple keyword matching for common industries
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

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

/**
 * Generate 3 smart search queries based on real business research.
 *
 * @returns [categoryQuery, brandQuery, authorityQuery]
 */
export function generateScanQueries(
  businessName: string,
  websiteUrl: string,
  research: BusinessResearch,
  location?: string | null,
): [string, string, string] {
  const locationClause = location && location !== 'Global' ? ` in ${location}` : ''
  const domain = extractDomain(websiteUrl)

  // Use the researched industry (not a guess)
  const industry = research.industry

  // Use a specific service for the category query if available
  const primaryService = research.services[0] ?? industry

  // Query 1: Category/organic visibility
  // Uses the actual service the business offers
  const categoryQuery = `What are the best ${primaryService} providers${locationClause}? List them as a numbered list: 1. 2. 3. etc. Include a one-line description of each.`

  // Query 2: Direct brand recognition with domain disambiguation
  const brandQuery = `Tell me about ${businessName} (${domain})${locationClause}. What do they do? Are they recommended? What do customers say about them?`

  // Query 3: Problem/solution authority
  // Uses target customer context for more relevant results
  const customerContext = research.targetCustomers !== 'general customers'
    ? ` for ${research.targetCustomers}`
    : ''
  const authorityQuery = `How can a ${industry}${customerContext} improve their online presence and attract more customers${locationClause}? Give examples of companies doing it well.`

  return [categoryQuery, brandQuery, authorityQuery]
}

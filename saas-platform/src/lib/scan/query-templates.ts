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
        content: `Search the web and research the business "${businessName}" at ${websiteUrl}. Visit their website and find out:
- What exactly does this business do? What is their main product or service?
- What industry are they in?
- Who are their customers?
- What specific services or products do they offer?
- Who are their main competitors?

Be thorough — I need ACCURATE, CURRENT information based on their actual website, not guesses.

Return ONLY this JSON (no other text):
{
  "industry": "2-4 word industry (e.g., 'AI visibility platform', 'plumbing services', 'Italian restaurant')",
  "description": "2-3 sentences describing what this business actually does",
  "services": ["their main service/product", "second service", "third service"],
  "target_customers": "Who their customers are (e.g., 'small businesses', 'homeowners in NYC')",
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

  const industry = research.industry
  const primaryService = research.services[0] ?? industry
  const businessDesc = research.description
    ? ` They ${research.description.toLowerCase().startsWith('they') ? research.description.slice(5) : research.description.toLowerCase()}`
    : ''

  // Query 1: Category/organic visibility
  // Natural question a customer would ask. Numbered list for position extraction.
  const categoryQuery = `What are the top ${primaryService} companies${locationClause}? Rank them 1-10 with a short description of each and why they're recommended.`

  // Query 2: Direct brand recognition with full context
  // Give the model enough context to find the RIGHT business
  const brandQuery = `Search for "${businessName}" (website: ${domain}).${businessDesc} What do you know about them? Are they good? What are their strengths and weaknesses? Who are their competitors?`

  // Query 3: Problem/solution authority (only sent to Perplexity)
  const customerContext = research.targetCustomers !== 'general customers'
    ? ` for ${research.targetCustomers}`
    : ''
  const authorityQuery = `What are the best ${industry} solutions${customerContext}${locationClause}? Compare the top options and explain which is best for different needs.`

  return [categoryQuery, brandQuery, authorityQuery]
}

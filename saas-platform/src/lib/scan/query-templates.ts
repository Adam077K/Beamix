/**
 * Smart query generation for AI visibility scanning.
 *
 * Pipeline:
 * 1. Scrape website homepage for real context
 * 2. Perplexity researches the business WITH the scraped context + user's sector hint
 * 3. Generate 3 simple, natural queries from the research
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
  websiteContext: string
  websiteTitle: string | null
  websiteDescription: string | null
}

/**
 * Research the business using website scraping + Perplexity web search.
 *
 * Flow: scrape website FIRST → pass scraped content + sector hint to Perplexity.
 * This gives Perplexity 3 signals: URL (web search), homepage text (what the
 * business says about itself), and the user's sector hint.
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

  console.log(`[research] Industry: "${industry}", Services: [${services.join(', ')}]`)

  return {
    industry, description, services, targetCustomers, websiteContext,
    websiteTitle: websiteCtx.title,
    websiteDescription: websiteCtx.metaDescription,
  }
}

/**
 * Deep Perplexity research — detailed prompt with website context + sector hint.
 *
 * Perplexity receives 3 signals:
 * 1. The URL — it can web-search for the business
 * 2. The scraped homepage text — what the business says about itself
 * 3. The user's sector hint — what the user thinks their industry is
 *
 * This prevents Perplexity from confusing "Rocket" (the AI code platform)
 * with "Rocket" (the rocket company) or any other business with a generic name.
 */
async function callPerplexityResearch(
  businessName: string,
  websiteUrl: string,
  websiteContext: string,
  sector: string,
): Promise<{ industry: string; description: string; services: string[]; targetCustomers: string }> {
  const empty = { industry: '', description: '', services: [] as string[], targetCustomers: '' }

  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)
  if (!hasApiKey) return empty

  // Build the website context section (only if we have content)
  const websiteSection = websiteContext.trim()
    ? `\nHere is text extracted from their homepage:\n---\n${websiteContext.slice(0, 1500)}\n---\n`
    : ''

  // Build the sector hint (only if not 'general')
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
- What industry/category are they in? Use a specific 2-5 word label (e.g., "AI code generation platform", "emergency plumbing services", "vegan restaurant chain").
- What exactly do they do? What is their main product or service?
- What specific services or products do they offer? List 2-5 items.
- Who are their customers? Be specific (e.g., "developers building web apps", "homeowners in NYC").
- Who are their main competitors? Name 3-5 real companies that compete with them.

Be specific and accurate. Use their actual website content to understand what they do.

Return ONLY this JSON:
{
  "industry": "specific 2-5 word industry label",
  "description": "2-3 sentences about what this business actually does",
  "services": ["specific service 1", "specific service 2", "specific service 3"],
  "target_customers": "specific customer segment",
  "competitors": ["real competitor 1", "real competitor 2", "real competitor 3"]
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
 * The business name is NEVER mentioned in any query.
 */
export function generateScanQueries(
  _businessName: string,
  _websiteUrl: string,
  research: BusinessResearch,
  location?: string | null,
): [string, string, string] {
  const loc = location && location !== 'Global' ? ` in ${location}` : ''
  const primaryService = research.services[0] ?? research.industry

  const q1 = `best ${primaryService}${loc}`
  const q2 = `can you recommend a good ${primaryService}${loc}`
  const q3 = `top ${research.industry} companies${loc}`

  console.log(`[queries] Q1: "${q1}"`)
  console.log(`[queries] Q2: "${q2}"`)
  console.log(`[queries] Q3: "${q3}"`)

  return [q1, q2, q3]
}

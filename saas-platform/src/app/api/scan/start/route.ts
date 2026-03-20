import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngineRaw } from '@/lib/scan/engine-adapter'
import { researchBusiness, generateScanQueries } from '@/lib/scan/query-templates'
import { analyzeResponses, type RawEngineResponse, type AnalysisResult } from '@/lib/scan/analyzer'
import type { ScanResults, EngineResult, LeaderboardEntry } from '@/lib/types'

// Allow up to 60s for LLM API calls
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scanStartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { url, business_name, sector, location, email } = parsed.data

    const supabase = await createServiceClient()

    // IP-based rate limiting
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('free_scans')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Too many scans. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const scanIdToken = nanoid(12)

    // Start research while creating DB record (parallel)
    const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

    const [research, insertResult] = await Promise.all([
      hasApiKey
        ? researchBusiness(business_name, url)
        : Promise.resolve({ industry: sector || 'local business', description: '', services: [] as string[], targetCustomers: '', websiteContext: '', websiteTitle: null, websiteDescription: null }),
      supabase
        .from('free_scans')
        .insert({
          website_url: url,
          business_name,
          industry: sector || 'general', // updated later with real industry
          location,
          ip_address: ip,
          status: 'processing',
          scan_id: scanIdToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          ...(email ? { email } : {}),
        })
        .select('id, scan_id')
        .single(),
    ])

    if (insertResult.error || !insertResult.data) {
      console.error('[scan/start] Failed to insert free_scan:', insertResult.error)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertResult.data.id

    // Update industry with researched value
    if (research.industry && research.industry !== sector) {
      await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
    }

    console.log(`[scan/start] Scan ${scanId} | Business: "${business_name}" | Industry: "${research.industry}" | Services: [${research.services.join(', ')}]`)

    // Process scan
    try {
      const scanResults = await runScan(business_name, url, research, location)

      await supabase
        .from('free_scans')
        .update({
          status: 'completed',
          overall_score: scanResults.visibility_score,
          results_data: JSON.parse(JSON.stringify(scanResults)),
          completed_at: new Date().toISOString(),
        })
        .eq('id', scanId)

      console.log(`[scan/start] Scan ${scanId} completed — score: ${scanResults.visibility_score}`)
    } catch (scanError) {
      console.error(`[scan/start] Scan ${scanId} processing failed:`, scanError)
      await supabase.from('free_scans').update({ status: 'failed' }).eq('id', scanId)
    }

    return NextResponse.json(
      { scan_id: scanId, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Scan Pipeline v3 — Web-grounded:
 *
 * 0. Scrape website + Perplexity research (parallel, ~2s)
 * 1. Generate 3 queries from real business data
 * 2. Query engines with web search (8 calls, all parallel):
 *    - ChatGPT (mini:online): 2 queries (category + brand) — expensive, skip authority
 *    - Gemini (flash:online): 3 queries — cheap with :online
 *    - Perplexity (sonar-pro): 3 queries — native search, no extra cost
 * 3. Analyze all 8 responses (1 call)
 * 4. Build results with real competitor scores + personalized recommendations
 *
 * Cost: ~$0.12/scan
 */
async function runScan(
  businessName: string,
  websiteUrl: string,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  location?: string | null,
): Promise<ScanResults> {
  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

  if (!hasApiKey) {
    return runMockScan(businessName, businessName, research.industry)
  }

  // Step 1: Generate queries from research
  const [categoryQuery, brandQuery, authorityQuery] = generateScanQueries(
    businessName, websiteUrl, research, location
  )
  const queries = [categoryQuery, brandQuery, authorityQuery]
  console.log(`[scan] Q1: "${categoryQuery}"`)
  console.log(`[scan] Q2: "${brandQuery}"`)
  console.log(`[scan] Q3: "${authorityQuery}"`)

  // Step 2: Query engines in parallel
  // ChatGPT + Gemini (:online) — 2 queries each (category + brand), skip authority
  // Perplexity (native search, no extra cost) — all 3 queries
  const twoQueries = [categoryQuery, brandQuery]

  const rawResponses = await Promise.all([
    ...twoQueries.map((query) =>
      queryEngineRaw('chatgpt', query).then((r) => ({ ...r, query }) as RawEngineResponse)
    ),
    ...twoQueries.map((query) =>
      queryEngineRaw('gemini', query).then((r) => ({ ...r, query }) as RawEngineResponse)
    ),
    ...queries.map((query) =>
      queryEngineRaw('perplexity', query).then((r) => ({ ...r, query }) as RawEngineResponse)
    ),
  ])

  const mockCount = rawResponses.filter((r) => r.isMock).length
  console.log(`[scan] ${rawResponses.length} responses (${mockCount} mock)`)

  // Step 3: Analyze
  const analysis = await analyzeResponses({
    businessName,
    websiteUrl,
    industry: research.industry,
    location,
    queries,
    responses: rawResponses,
  })

  console.log(`[scan] ${analysis.visibility_summary}`)

  // Step 4: Build results
  return buildScanResults(businessName, research, queries, analysis)
}

function buildScanResults(
  businessName: string,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  queries: string[],
  analysis: AnalysisResult,
): ScanResults {
  const engineResults: EngineResult[] = analysis.engines.map((e) => ({
    engine: e.engine as EngineResult['engine'],
    is_mentioned: e.mentioned,
    mention_position: e.mention_position,
    sentiment: e.sentiment,
    competitors_mentioned: e.competitors_found.map((c) => c.name),
    response_snippet: e.context_quote ?? '',
  }))

  // Visibility score
  const mentionedCount = engineResults.filter((e) => e.is_mentioned).length
  const totalEngines = engineResults.length
  let visibilityScore = 0

  if (totalEngines > 0) {
    // Mention: 0-40 pts
    visibilityScore += Math.round((mentionedCount / totalEngines) * 40)

    // Position: 0-30 pts
    for (const e of engineResults) {
      if (e.is_mentioned && e.mention_position !== null) {
        const posScore = Math.max(5, 30 - (e.mention_position - 1) * 3)
        visibilityScore += Math.round(posScore / totalEngines)
      }
    }

    // Sentiment: 0-30 pts
    for (const e of engineResults) {
      if (e.sentiment === 'positive') visibilityScore += Math.round(30 / totalEngines)
      else if (e.sentiment === 'neutral') visibilityScore += Math.round(15 / totalEngines)
    }
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore))

  // Real competitor scores from analyzer data
  const leaderboardEntries: Array<{ name: string; score: number }> = []

  for (const comp of analysis.top_competitors) {
    if (comp.name.toLowerCase() === businessName.toLowerCase()) continue
    const mentionRate = comp.mention_count / 3
    const posBonus = comp.best_position !== null
      ? Math.max(5, 35 - (comp.best_position - 1) * 4)
      : 10
    const score = Math.min(95, Math.round(mentionRate * 60 + posBonus))
    leaderboardEntries.push({ name: comp.name, score })
  }

  leaderboardEntries.push({ name: businessName, score: visibilityScore })
  leaderboardEntries.sort((a, b) => b.score - a.score)

  const leaderboard: LeaderboardEntry[] = leaderboardEntries.slice(0, 8).map((entry, i) => ({
    name: entry.name,
    score: entry.score,
    rank: i + 1,
    is_user: entry.name === businessName,
  }))

  const userEntry = leaderboard.find((e) => e.is_user)
  const topCompetitor = leaderboardEntries.find((e) => e.name !== businessName)

  // Personalized recommendations from analyzer
  const quickWins = analysis.recommendations.map((r) => ({
    title: r.title,
    description: r.description,
    impact: r.impact,
  }))

  // Share of Voice: user mentions / total mentions across all engines
  const totalMentions = analysis.engines.reduce((sum, e) => sum + (e.mentioned ? 1 : 0), 0)
    + analysis.top_competitors.reduce((sum, c) => sum + c.mention_count, 0)
  const userMentions = analysis.engines.filter(e => e.mentioned).length
  const shareOfVoice = totalMentions > 0 ? Math.round((userMentions / totalMentions) * 100) : 0

  return {
    visibility_score: visibilityScore,
    engines: engineResults,
    top_competitor: topCompetitor?.name ?? 'Industry Leader',
    top_competitor_score: topCompetitor?.score ?? Math.min(95, visibilityScore + 15),
    quick_wins: quickWins,
    rank: userEntry?.rank ?? leaderboard.length,
    total_businesses: leaderboard.length,
    leaderboard,
    queries_used: queries,
    visibility_summary: analysis.visibility_summary,
    business_context: {
      detected_industry: research.industry,
      description: research.description,
      services: research.services,
      website_title: research.websiteTitle ?? null,
      website_description: research.websiteDescription ?? null,
    },
    share_of_voice: shareOfVoice,
    per_query_breakdown: analysis.per_query_breakdown,
    brand_attributes: analysis.brand_attributes,
    citation_urls: analysis.citation_urls,
  }
}

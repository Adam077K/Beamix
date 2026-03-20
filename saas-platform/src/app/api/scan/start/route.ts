import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngineRaw } from '@/lib/scan/engine-adapter'
import { inferIndustry, generateScanQueries } from '@/lib/scan/query-templates'
import { analyzeResponses, type RawEngineResponse } from '@/lib/scan/analyzer'
import type { ScanResults, EngineResult, LeaderboardEntry, QuickWin } from '@/lib/types'

// Allow up to 60s for LLM API calls
export const maxDuration = 60

const QUICK_WIN_TEMPLATES: QuickWin[] = [
  { title: 'Add FAQ Schema Markup', description: 'Structured FAQ data helps AI engines understand and cite your expertise.', impact: 'high' },
  { title: 'Create an About Page with Entity Data', description: 'AI engines look for structured entity information — founding year, team, services.', impact: 'high' },
  { title: 'Publish Expert Blog Content', description: 'Regular in-depth content establishes topical authority for AI citation.', impact: 'medium' },
  { title: 'Optimize Google Business Profile', description: 'Complete GBP listings are a key signal for AI engines on local queries.', impact: 'high' },
  { title: 'Add LocalBusiness Structured Data', description: 'JSON-LD LocalBusiness schema helps AI engines identify your business.', impact: 'medium' },
  { title: 'Build Citation Consistency', description: 'Ensure NAP (name, address, phone) is consistent across all directories.', impact: 'medium' },
  { title: 'Get More Customer Reviews', description: 'AI engines reference review sentiment when recommending businesses.', impact: 'high' },
]

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

    // IP-based rate limiting — max 5 scans per IP per hour
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

    // Infer industry from business name + URL (if sector is generic)
    const industry = (sector && sector !== 'general')
      ? sector
      : await inferIndustry(business_name, url)

    const { data: insertedScan, error: insertError } = await supabase
      .from('free_scans')
      .insert({
        website_url: url,
        business_name,
        industry,
        location,
        ip_address: ip,
        status: 'processing',
        scan_id: scanIdToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...(email ? { email } : {}),
      })
      .select('id, scan_id')
      .single()

    if (insertError || !insertedScan) {
      console.error('[scan/start] Failed to insert free_scan:', insertError)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertedScan.id
    console.log(`[scan/start] Created scan ${scanId} for "${business_name}" (industry: ${industry})`)

    // Process scan synchronously
    try {
      const scanResults = await runScan(business_name, url, industry, location)

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
 * Smart Scan Pipeline:
 *
 * 1. Infer industry (already done above, passed as param)
 * 2. Generate 2 queries: category (organic visibility) + brand (recognition)
 * 3. Query 3 engines × 2 queries = 6 calls in parallel
 * 4. Analyze all 6 responses with Gemini Flash
 * 5. Build ScanResults
 */
async function runScan(
  businessName: string,
  websiteUrl: string,
  industry: string,
  location?: string | null,
): Promise<ScanResults> {
  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

  if (!hasApiKey) {
    console.log('[scan] No OPENROUTER_SCAN_KEY — using mock engine')
    return runMockScan(businessName, businessName, industry)
  }

  // Step 1: Generate queries
  const [categoryQuery, brandQuery] = generateScanQueries(businessName, industry, location)
  console.log(`[scan] Category query: "${categoryQuery}"`)
  console.log(`[scan] Brand query: "${brandQuery}"`)

  // Step 2: Query all 3 engines with both queries in parallel (6 calls)
  const engines: Array<'chatgpt' | 'gemini' | 'perplexity'> = ['chatgpt', 'gemini', 'perplexity']

  const rawResponses = await Promise.all(
    engines.flatMap((engine) => [
      queryEngineRaw(engine, categoryQuery).then((r) => ({ ...r, query: categoryQuery }) as RawEngineResponse),
      queryEngineRaw(engine, brandQuery).then((r) => ({ ...r, query: brandQuery }) as RawEngineResponse),
    ])
  )

  const mockCount = rawResponses.filter((r) => r.isMock).length
  console.log(`[scan] Got ${rawResponses.length} responses (${mockCount} mock)`)

  // Step 3: Analyze with LLM
  const analysis = await analyzeResponses({
    businessName,
    websiteUrl,
    industry,
    location,
    queries: [categoryQuery, brandQuery],
    responses: rawResponses,
  })

  console.log(`[scan] Analysis: ${analysis.visibility_summary}`)

  // Step 4: Build results
  return buildScanResults(businessName, analysis, rawResponses)
}

function buildScanResults(
  businessName: string,
  analysis: Awaited<ReturnType<typeof analyzeResponses>>,
  rawResponses: RawEngineResponse[],
): ScanResults {
  const engineResults: EngineResult[] = analysis.engines.map((e) => {
    // Prefer context_quote from analyzer, fall back to raw response snippet
    const rawSnippet = rawResponses.find((r) => r.engine === e.engine)?.rawResponse?.slice(0, 300) ?? ''
    return {
      engine: e.engine as EngineResult['engine'],
      is_mentioned: e.mentioned,
      mention_position: e.mention_position,
      sentiment: e.sentiment,
      competitors_mentioned: e.competitors_found,
      response_snippet: e.context_quote ?? rawSnippet,
    }
  })

  // Calculate visibility score
  const mentionedCount = engineResults.filter((e) => e.is_mentioned).length
  const totalEngines = engineResults.length

  // Score components:
  // - Mention presence: 0-40 points (are you mentioned at all?)
  // - Position quality: 0-30 points (where in the list?)
  // - Sentiment: 0-30 points (positive/neutral/negative?)
  let visibilityScore = 0

  if (totalEngines > 0) {
    const mentionRate = mentionedCount / totalEngines
    visibilityScore += Math.round(mentionRate * 40)

    for (const e of engineResults) {
      if (e.is_mentioned) {
        // Position score
        if (e.mention_position !== null) {
          const posScore = Math.max(10, 30 - (e.mention_position - 1) * 5)
          visibilityScore += Math.round(posScore / totalEngines)
        } else {
          visibilityScore += Math.round(15 / totalEngines)
        }
        // Sentiment score
        if (e.sentiment === 'positive') visibilityScore += Math.round(30 / totalEngines)
        else if (e.sentiment === 'neutral') visibilityScore += Math.round(15 / totalEngines)
      }
    }
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore))

  // Build leaderboard from REAL competitors found by the analyzer
  const competitors = analysis.top_competitors.filter((c) =>
    c.toLowerCase() !== businessName.toLowerCase()
  )
  const topCompetitor = competitors[0] ?? 'Industry Leader'
  const topCompetitorScore = Math.min(95, visibilityScore + 8 + Math.round(Math.random() * 12))

  const competitorScores = competitors.slice(0, 5).map((name, i) => ({
    name,
    score: Math.max(25, Math.min(95, topCompetitorScore - i * 5 + Math.round(Math.random() * 8 - 4))),
  }))
  competitorScores.push({ name: businessName, score: visibilityScore })
  competitorScores.sort((a, b) => b.score - a.score)

  const leaderboard: LeaderboardEntry[] = competitorScores.map((c, i) => ({
    name: c.name,
    score: c.score,
    rank: i + 1,
    is_user: c.name === businessName,
  }))

  const userEntry = leaderboard.find((e) => e.is_user)
  const shuffled = [...QUICK_WIN_TEMPLATES].sort(() => Math.random() - 0.5)
  const quickWins = shuffled.slice(0, 3 + Math.round(Math.random()))

  return {
    visibility_score: visibilityScore,
    engines: engineResults,
    top_competitor: topCompetitor,
    top_competitor_score: topCompetitorScore,
    quick_wins: quickWins,
    rank: userEntry?.rank ?? leaderboard.length,
    total_businesses: leaderboard.length,
    leaderboard,
  }
}

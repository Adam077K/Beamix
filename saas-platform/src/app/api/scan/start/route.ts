import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngine, type EngineQuery } from '@/lib/scan/engine-adapter'
import { parseEngineResponse } from '@/lib/scan/parser'
import { calculateCompositeScore } from '@/lib/scan/scorer'
import { INDUSTRY_COMPETITORS } from '@/constants/industries'
import type { ScanResults, EngineResult, LeaderboardEntry, LLMEngine, QuickWin } from '@/lib/types'

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

    // IP-based rate limiting — max 3 scans per IP per hour
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

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many scans. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const scanIdToken = nanoid(12)

    const { data: insertedScan, error: insertError } = await supabase
      .from('free_scans')
      .insert({
        website_url: url,
        business_name,
        industry: sector,
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
    console.log(`[scan/start] Created scan ${scanId} for "${business_name}"`)

    // Process scan synchronously — maxDuration=60 gives us plenty of time
    try {
      const scanResults = await runScan(business_name, url, sector, location)

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

    // Return scan_id — client navigates to /scan/{id} and polls
    // By this point the scan is already completed in DB
    return NextResponse.json(
      { scan_id: scanId, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

  console.log('[scan] Querying real engines via OpenRouter...')

  const engineQuery: EngineQuery = {
    query: `Who are the best ${industry} businesses${location ? ` in ${location}` : ''}? Is ${businessName} (${websiteUrl}) recommended?`,
    businessName,
    businessUrl: websiteUrl,
    industry,
    location: location ?? undefined,
  }

  const [chatgpt, gemini, perplexity] = await Promise.all([
    queryEngine('chatgpt', engineQuery),
    queryEngine('gemini', engineQuery),
    queryEngine('perplexity', engineQuery),
  ])

  console.log(`[scan] Engines responded — ChatGPT mock:${chatgpt.isMock} Gemini mock:${gemini.isMock} Perplexity mock:${perplexity.isMock}`)

  const responses = [chatgpt, gemini, perplexity]
  const parsedResults = responses.map((r) => parseEngineResponse(r, businessName))
  const compositeScore = calculateCompositeScore(parsedResults)

  const engines: EngineResult[] = parsedResults.map((p, i) => ({
    engine: p.engine as LLMEngine,
    is_mentioned: p.isMentioned,
    mention_position: p.mentionPosition,
    sentiment: p.sentiment >= 65 ? 'positive' as const : p.sentiment >= 40 ? 'neutral' as const : 'negative' as const,
    competitors_mentioned: p.competitorNames,
    response_snippet: responses[i]?.rawResponse?.slice(0, 300) ?? '',
  }))

  const competitors = INDUSTRY_COMPETITORS[industry] ?? ['Top Competitor', 'Industry Leader']
  const topCompetitor = competitors[0] ?? 'Top Competitor'
  const visibilityScore = compositeScore.overallScore
  const topCompetitorScore = Math.min(95, visibilityScore + 10 + Math.round(Math.random() * 15))

  const competitorScores = competitors.slice(0, 5).map((name, i) => ({
    name,
    score: Math.max(20, Math.min(95, topCompetitorScore - i * 8 + Math.round(Math.random() * 10 - 5))),
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
    engines,
    top_competitor: topCompetitor,
    top_competitor_score: topCompetitorScore,
    quick_wins: quickWins,
    rank: userEntry?.rank ?? leaderboard.length,
    total_businesses: leaderboard.length,
    leaderboard,
  }
}

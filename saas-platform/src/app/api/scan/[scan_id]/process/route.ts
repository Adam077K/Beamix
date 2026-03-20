import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngine, type EngineQuery } from '@/lib/scan/engine-adapter'
import { parseEngineResponse } from '@/lib/scan/parser'
import { calculateCompositeScore } from '@/lib/scan/scorer'
import { INDUSTRY_COMPETITORS } from '@/constants/industries'
import type { ScanResults, EngineResult, LeaderboardEntry, LLMEngine, QuickWin } from '@/lib/types'

// Vercel max duration: 60s for Pro, 10s for Hobby
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await params

  // Simple auth: first 16 chars of service role key
  const body = await request.json()
  const expectedSecret = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16)
  if (!expectedSecret || body.secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Update status to processing
  await supabase.from('free_scans').update({ status: 'processing' }).eq('id', scan_id)

  try {
    const { business_name, url, sector, location } = body

    console.log(`[scan/process] Starting scan ${scan_id} for ${business_name}`)

    const scanResults = await runScanInline(business_name, url, sector, location)

    await supabase
      .from('free_scans')
      .update({
        status: 'completed',
        overall_score: scanResults.visibility_score,
        results_data: JSON.parse(JSON.stringify(scanResults)),
        completed_at: new Date().toISOString(),
      })
      .eq('id', scan_id)

    console.log(`[scan/process] Scan ${scan_id} completed with score ${scanResults.visibility_score}`)

    return NextResponse.json({ success: true, score: scanResults.visibility_score })
  } catch (error) {
    console.error(`[scan/process] Scan ${scan_id} failed:`, error)
    await supabase.from('free_scans').update({ status: 'failed' }).eq('id', scan_id)
    return NextResponse.json({ error: 'Scan processing failed' }, { status: 500 })
  }
}

async function runScanInline(
  businessName: string,
  websiteUrl: string,
  industry: string,
  location?: string | null,
): Promise<ScanResults> {
  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

  if (!hasApiKey) {
    console.log('[scan/process] No API key — using mock engine')
    return runMockScan(businessName, businessName, industry)
  }

  console.log('[scan/process] Using real OpenRouter engines')

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

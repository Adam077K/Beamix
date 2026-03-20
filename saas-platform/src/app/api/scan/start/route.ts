import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngineRaw } from '@/lib/scan/engine-adapter'
import { inferIndustry, generateScanQueries } from '@/lib/scan/query-templates'
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

    // Infer industry if sector is generic
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
 * Smart Scan Pipeline v2:
 *
 * 1. Generate 3 queries: category + brand + authority (0 API calls)
 * 2. Query 3 engines × 3 queries = 9 calls in parallel (~3-5s)
 * 3. Analyze all 9 responses with Gemini Flash (1 call, ~1-2s)
 * 4. Build results with real competitor scores + personalized recommendations
 *
 * Total: ~11 API calls, ~$0.10-0.18/scan, ~7-10s wall-clock
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

  // Step 1: Generate 3 queries
  const [categoryQuery, brandQuery, authorityQuery] = generateScanQueries(
    businessName, websiteUrl, industry, location
  )
  const queries = [categoryQuery, brandQuery, authorityQuery]
  console.log(`[scan] Q1 (category): "${categoryQuery}"`)
  console.log(`[scan] Q2 (brand): "${brandQuery}"`)
  console.log(`[scan] Q3 (authority): "${authorityQuery}"`)

  // Step 2: Query all 3 engines × 3 queries = 9 calls in parallel
  const engines: Array<'chatgpt' | 'gemini' | 'perplexity'> = ['chatgpt', 'gemini', 'perplexity']

  const rawResponses = await Promise.all(
    engines.flatMap((engine) =>
      queries.map((query) =>
        queryEngineRaw(engine, query).then((r) => ({ ...r, query }) as RawEngineResponse)
      )
    )
  )

  const mockCount = rawResponses.filter((r) => r.isMock).length
  console.log(`[scan] Got ${rawResponses.length} responses (${mockCount} mock)`)

  // Step 3: Analyze with LLM
  const analysis = await analyzeResponses({
    businessName,
    websiteUrl,
    industry,
    location,
    queries,
    responses: rawResponses,
  })

  console.log(`[scan] Analysis: ${analysis.visibility_summary}`)

  // Step 4: Build results with real competitor scores
  return buildScanResults(businessName, industry, queries, analysis)
}

function buildScanResults(
  businessName: string,
  industry: string,
  queries: string[],
  analysis: AnalysisResult,
): ScanResults {
  // Engine results from analyzer
  const engineResults: EngineResult[] = analysis.engines.map((e) => ({
    engine: e.engine as EngineResult['engine'],
    is_mentioned: e.mentioned,
    mention_position: e.mention_position,
    sentiment: e.sentiment,
    competitors_mentioned: e.competitors_found.map((c) => c.name),
    response_snippet: e.context_quote ?? '',
  }))

  // Calculate visibility score
  const mentionedCount = engineResults.filter((e) => e.is_mentioned).length
  const totalEngines = engineResults.length
  let visibilityScore = 0

  if (totalEngines > 0) {
    // Mention presence: 0-40 points
    visibilityScore += Math.round((mentionedCount / totalEngines) * 40)

    // Position quality: 0-30 points
    for (const e of engineResults) {
      if (e.is_mentioned && e.mention_position !== null) {
        // Position 1 = 30pts, 2 = 25pts, 3 = 22pts, 5 = 15pts, 10 = 5pts
        const posScore = Math.max(5, 30 - (e.mention_position - 1) * 3)
        visibilityScore += Math.round(posScore / totalEngines)
      }
    }

    // Sentiment: 0-30 points
    for (const e of engineResults) {
      if (e.sentiment === 'positive') visibilityScore += Math.round(30 / totalEngines)
      else if (e.sentiment === 'neutral') visibilityScore += Math.round(15 / totalEngines)
    }
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore))

  // Build leaderboard with REAL competitor scores based on engine data
  const competitorScores = new Map<string, { mentions: number; bestPos: number | null }>()

  for (const comp of analysis.top_competitors) {
    competitorScores.set(comp.name, {
      mentions: comp.mention_count,
      bestPos: comp.best_position,
    })
  }

  const leaderboardEntries: Array<{ name: string; score: number }> = []

  // Score each competitor: (mentionRate * 60) + positionBonus
  for (const [name, data] of competitorScores) {
    if (name.toLowerCase() === businessName.toLowerCase()) continue
    const mentionRate = data.mentions / 3
    const posBonus = data.bestPos !== null
      ? Math.max(5, 35 - (data.bestPos - 1) * 4)
      : 10
    const score = Math.min(95, Math.round(mentionRate * 60 + posBonus))
    leaderboardEntries.push({ name, score })
  }

  // Add the user's business
  leaderboardEntries.push({ name: businessName, score: visibilityScore })

  // Sort by score descending
  leaderboardEntries.sort((a, b) => b.score - a.score)

  const leaderboard: LeaderboardEntry[] = leaderboardEntries.slice(0, 8).map((entry, i) => ({
    name: entry.name,
    score: entry.score,
    rank: i + 1,
    is_user: entry.name === businessName,
  }))

  const userEntry = leaderboard.find((e) => e.is_user)
  const topCompetitor = leaderboardEntries.find((e) => e.name !== businessName)

  // Use personalized recommendations from analyzer (not random templates)
  const quickWins = analysis.recommendations.map((r) => ({
    title: r.title,
    description: r.description,
    impact: r.impact,
  }))

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
  }
}

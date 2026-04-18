import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import {
  researchStep,
  generateQueriesStep,
  pickQueriesForEngine,
  queryEngineStep,
  analyzeStep,
  buildResultsStep,
  type ScanContext,
} from '@/lib/scan/scan-core'
import { getTierConfig } from '@/lib/scan/tier-config'
import type { RawEngineResponse } from '@/lib/scan/analyzer'

// Allow up to 300s on Vercel Pro, 60s on Hobby
export const maxDuration = 300

export async function POST(request: Request) {
  // Hard fail if OpenRouter is not configured — never silently return mock data in production
  if (!process.env.OPENROUTER_SCAN_KEY && !process.env.OPENROUTER_API_KEY) {
    console.error('[scan/start] CRITICAL: No OpenRouter API key configured. Set OPENROUTER_SCAN_KEY.')
    return NextResponse.json(
      { error: 'Scan service temporarily unavailable' },
      { status: 503 }
    )
  }

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

    // IP-based rate limiting (5 scans per hour per IP)
    const ip = process.env.VERCEL
      ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : request.headers.get('x-real-ip') || '127.0.0.1'

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

    // Insert scan record as 'processing'
    const { data: insertResult, error: insertError } = await supabase
      .from('free_scans')
      .insert({
        website_url: url,
        business_name,
        industry: sector || 'general',
        location,
        ip_address: ip,
        status: 'processing',
        scan_id: scanIdToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...(email ? { email } : {}),
      })
      .select('id, scan_id')
      .single()

    if (insertError || !insertResult) {
      console.error('[scan/start] insert failed:', insertError?.code, insertError?.message)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertResult.id

    // Run scan synchronously — the frontend polls /api/scan/{id}/status
    // and will pick up results when this route finishes and updates the DB.
    const ctx: ScanContext = { businessName: business_name, websiteUrl: url, location, sector }
    const tierConfig = getTierConfig(null)

    try {
      console.log(`[scan] ${scanId} — researching "${business_name}"...`)
      const research = await researchStep(ctx)
      console.log(`[scan] ${scanId} — industry: "${research.industry}"`)

      if (research.industry && sector && research.industry !== sector) {
        await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
      }

      const queries = generateQueriesStep(ctx, research, tierConfig)
      console.log(`[scan] ${scanId} — ${queries.length} queries`)

      const allResponses: RawEngineResponse[] = []
      const mockEngines: string[] = []

      // All engines receive 1 query each — run in parallel for speed
      const parallelResults = await Promise.all(
        tierConfig.engines.map(async (engine) => {
          const engineQueries = pickQueriesForEngine(engine, queries)
          const result = await queryEngineStep(engine, engineQueries, engineQueries.length)
          console.log(`[scan] ${scanId} — ${engine}: ${result.responses.length} responses, mock=${result.hasMock}`)
          return result
        })
      )
      for (const result of parallelResults) {
        allResponses.push(...result.responses)
        if (result.hasMock) mockEngines.push(result.engine)
      }

      const realResponses = allResponses.filter((r) => !r.isMock)
      if (realResponses.length === 0) {
        console.error(`[scan] ${scanId} — ALL MOCK. Check OPENROUTER_SCAN_KEY.`)
        await supabase.from('free_scans').update({
          status: 'failed', completed_at: new Date().toISOString(),
        }).eq('id', scanId)
        return NextResponse.json(
          { scan_id: scanId, scan_token: insertResult.scan_id, status: 'failed', error: 'AI engines unavailable' },
          { status: 500 }
        )
      }

      console.log(`[scan] ${scanId} — analyzing ${allResponses.length} responses...`)
      const analysis = await analyzeStep(ctx, research, queries, allResponses)
      console.log(`[scan] ${scanId} — analysis done, building results...`)

      const scanResults = buildResultsStep(ctx, research, queries, analysis)

      await supabase.from('free_scans').update({
        status: 'completed',
        overall_score: scanResults.visibility_score,
        results_data: JSON.parse(JSON.stringify(scanResults)),
        completed_at: new Date().toISOString(),
        ...(mockEngines.length > 0 ? { mock_engines: mockEngines } : {}),
      }).eq('id', scanId)

      console.log(`[scan] ${scanId} — DONE, score: ${scanResults.visibility_score}`)
    } catch (scanError) {
      console.error(`[scan] ${scanId} — FAILED:`, scanError)
      await supabase.from('free_scans').update({ status: 'failed' }).eq('id', scanId)
    }

    // Return 202 — by this point the DB is already updated to 'completed' or 'failed'.
    return NextResponse.json(
      { scan_id: scanId, scan_token: insertResult.scan_id, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

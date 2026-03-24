import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import {
  researchStep,
  generateQueriesStep,
  queryEngineStep,
  analyzeStep,
  buildResultsStep,
  type ScanContext,
} from '@/lib/scan/scan-core'
import { getTierConfig } from '@/lib/scan/tier-config'
import type { RawEngineResponse } from '@/lib/scan/analyzer'

// Allow up to 55s for synchronous scan (Vercel Hobby=60s, Pro=300s)
export const maxDuration = 55

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

    // Insert scan record as 'processing' — we run synchronously
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
      console.error('[scan/start] Failed to insert free_scan:', insertError?.code, insertError?.message)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertResult.id
    console.log(`[scan/start] Scan ${scanId} starting synchronously`)

    // Run scan synchronously — calls OpenRouter directly
    const ctx: ScanContext = { businessName: business_name, websiteUrl: url, location, sector }
    const tierConfig = getTierConfig(null) // free tier

    try {
      // Step 1: Research business via Perplexity
      console.log(`[scan/start] Step 1: Researching "${business_name}"...`)
      const research = await researchStep(ctx)
      console.log(`[scan/start] Research done — industry: "${research.industry}"`)

      if (research.industry && sector && research.industry !== sector) {
        await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
      }

      // Step 2: Generate queries (organic only, no brand queries)
      const queries = generateQueriesStep(ctx, research, tierConfig)
      console.log(`[scan/start] Generated ${queries.length} queries`)

      // Step 3: Query engines (ChatGPT, Gemini, Perplexity)
      const allResponses: RawEngineResponse[] = []
      const mockEngines: string[] = []

      for (const engine of tierConfig.engines) {
        const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
        console.log(`[scan/start] Querying ${engine} with ${engineQueryCount} queries...`)
        const result = await queryEngineStep(engine, queries, engineQueryCount)
        allResponses.push(...result.responses)
        if (result.hasMock) mockEngines.push(engine)
        console.log(`[scan/start] ${engine}: ${result.responses.length} responses (mock: ${result.hasMock})`)
      }

      // Check for all-mock (API key issue)
      const realResponses = allResponses.filter((r) => !r.isMock)
      if (realResponses.length === 0) {
        await supabase.from('free_scans').update({ status: 'failed', completed_at: new Date().toISOString() }).eq('id', scanId)
        console.error(`[scan/start] Scan ${scanId} FAILED — all engines returned mock data. OPENROUTER_SCAN_KEY may be wrong or missing.`)
        return NextResponse.json(
          { scan_id: scanId, scan_token: insertResult.scan_id, status: 'failed', error: 'AI engines unavailable — check API key configuration' },
          { status: 500 }
        )
      }

      console.log(`[scan/start] Got ${realResponses.length} real responses, ${mockEngines.length} mock engines`)

      // Step 4: Analyze all responses with Gemini Flash
      console.log(`[scan/start] Analyzing ${allResponses.length} responses...`)
      const analysis = await analyzeStep(ctx, research, queries, allResponses)

      // Step 5: Build results
      const scanResults = buildResultsStep(ctx, research, queries, analysis)

      // Save results
      await supabase.from('free_scans').update({
        status: 'completed',
        overall_score: scanResults.visibility_score,
        results_data: JSON.parse(JSON.stringify(scanResults)),
        completed_at: new Date().toISOString(),
        ...(mockEngines.length > 0 ? { mock_engines: mockEngines } : {}),
      }).eq('id', scanId)

      console.log(`[scan/start] Scan ${scanId} COMPLETED — score: ${scanResults.visibility_score}`)
    } catch (scanError) {
      console.error(`[scan/start] Scan ${scanId} processing failed:`, scanError)
      await supabase.from('free_scans').update({ status: 'failed' }).eq('id', scanId)
    }

    return NextResponse.json(
      { scan_id: scanId, scan_token: insertResult.scan_id, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

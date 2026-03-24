import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
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

// Allow enough time for the background scan to complete
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
      console.error('[scan/start] Failed to insert free_scan:', insertError?.code, insertError?.message)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertResult.id

    // Run scan in background — return 202 immediately so frontend can redirect.
    // The scan updates the DB directly; frontend polls /api/scan/{id}/status.
    runScanInBackground(scanId, business_name, url, sector, location)

    return NextResponse.json(
      { scan_id: scanId, scan_token: insertResult.scan_id, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Run the scan asynchronously. This function is NOT awaited — it runs in the
 * background after the HTTP response is sent. Uses its own Supabase client
 * since the request-scoped one may be closed.
 *
 * On Vercel, the function continues executing after the response is sent
 * as long as maxDuration hasn't been reached. The scan typically takes 20-40s.
 */
function runScanInBackground(
  scanId: string,
  businessName: string,
  websiteUrl: string,
  sector: string | undefined,
  location: string | undefined,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('[scan/bg] Missing Supabase env vars — cannot run scan')
    return
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const ctx: ScanContext = { businessName, websiteUrl, location, sector }
  const tierConfig = getTierConfig(null)

  // Fire and forget — errors are caught internally
  ;(async () => {
    try {
      console.log(`[scan/bg] ${scanId} — starting scan for "${businessName}"`)

      // Step 1: Research
      const research = await researchStep(ctx)
      console.log(`[scan/bg] ${scanId} — research done: "${research.industry}"`)

      if (research.industry && sector && research.industry !== sector) {
        await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
      }

      // Step 2: Generate queries
      const queries = generateQueriesStep(ctx, research, tierConfig)
      console.log(`[scan/bg] ${scanId} — ${queries.length} queries`)

      // Step 3: Query engines
      const allResponses: RawEngineResponse[] = []
      const mockEngines: string[] = []

      for (const engine of tierConfig.engines) {
        const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
        const result = await queryEngineStep(engine, queries, engineQueryCount)
        allResponses.push(...result.responses)
        if (result.hasMock) mockEngines.push(engine)
        console.log(`[scan/bg] ${scanId} — ${engine}: ${result.responses.length} responses, mock=${result.hasMock}`)
      }

      // Check for all-mock
      const realResponses = allResponses.filter((r) => !r.isMock)
      if (realResponses.length === 0) {
        console.error(`[scan/bg] ${scanId} — ALL MOCK. Check OPENROUTER_SCAN_KEY.`)
        await supabase.from('free_scans').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', scanId)
        return
      }

      // Step 4: Analyze
      console.log(`[scan/bg] ${scanId} — analyzing ${allResponses.length} responses...`)
      const analysis = await analyzeStep(ctx, research, queries, allResponses)

      // Step 5: Build results + save
      const scanResults = buildResultsStep(ctx, research, queries, analysis)

      await supabase.from('free_scans').update({
        status: 'completed',
        overall_score: scanResults.visibility_score,
        results_data: JSON.parse(JSON.stringify(scanResults)),
        completed_at: new Date().toISOString(),
        ...(mockEngines.length > 0 ? { mock_engines: mockEngines } : {}),
      }).eq('id', scanId)

      console.log(`[scan/bg] ${scanId} — DONE, score: ${scanResults.visibility_score}`)
    } catch (err) {
      console.error(`[scan/bg] ${scanId} — FAILED:`, err)
      try {
        await supabase.from('free_scans').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', scanId)
      } catch {
        // Best-effort DB update
      }
    }
  })()
}

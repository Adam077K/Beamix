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

    // Insert scan record
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

    // Try Inngest async path first, fall back to synchronous
    let useInngest = false
    try {
      if (process.env.INNGEST_EVENT_KEY) {
        const { inngest } = await import('@/inngest/client')
        await inngest.send({
          name: 'scan/free.started',
          data: {
            freeScanId: scanId,
            businessName: business_name,
            websiteUrl: url,
            sector: sector || undefined,
            location: location || null,
          },
        })
        useInngest = true
        console.log(`[scan/start] Scan ${scanId} queued via Inngest`)
      }
    } catch (inngestErr) {
      console.warn(`[scan/start] Inngest unavailable, falling back to sync:`, inngestErr instanceof Error ? inngestErr.message : inngestErr)
    }

    // If Inngest is available, return 202 (async processing)
    if (useInngest) {
      return NextResponse.json(
        { scan_id: scanId, scan_token: insertResult.scan_id, status: 'processing' },
        { status: 202 }
      )
    }

    // Synchronous fallback — run scan inline (works without Inngest)
    console.log(`[scan/start] Running scan ${scanId} synchronously (no Inngest)`)

    const ctx: ScanContext = { businessName: business_name, websiteUrl: url, location, sector }
    const tierConfig = getTierConfig(null)

    try {
      // Step 1: Research
      const research = await researchStep(ctx)

      if (research.industry && sector && research.industry !== sector) {
        await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
      }

      // Step 2: Generate queries
      const queries = generateQueriesStep(ctx, research, tierConfig)

      // Step 3: Query engines
      const allResponses: RawEngineResponse[] = []
      const mockEngines: string[] = []

      for (const engine of tierConfig.engines) {
        const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
        const result = await queryEngineStep(engine, queries, engineQueryCount)
        allResponses.push(...result.responses)
        if (result.hasMock) mockEngines.push(engine)
      }

      // Check for all-mock (API key issue)
      const realResponses = allResponses.filter((r) => !r.isMock)
      if (realResponses.length === 0) {
        await supabase.from('free_scans').update({ status: 'failed', completed_at: new Date().toISOString() }).eq('id', scanId)
        console.error(`[scan/start] Scan ${scanId} failed — all engines returned mock data. Check OPENROUTER_SCAN_KEY.`)
        return NextResponse.json(
          { scan_id: scanId, scan_token: insertResult.scan_id, status: 'failed', error: 'AI engines unavailable' },
          { status: 202 }
        )
      }

      // Step 4: Analyze
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

      console.log(`[scan/start] Scan ${scanId} completed — score: ${scanResults.visibility_score}`)
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

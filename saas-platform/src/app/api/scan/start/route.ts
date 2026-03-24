import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { after } from 'next/server'
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

// Keep alive long enough for the background scan (research + 4-6 engine calls + analysis)
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

    // Use Next.js after() to run the scan AFTER the response is sent.
    // This keeps the serverless function alive on Vercel (unlike fire-and-forget).
    // The frontend gets 202 immediately and polls /api/scan/{id}/status.
    after(async () => {
      const bgSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      const ctx: ScanContext = { businessName: business_name, websiteUrl: url, location, sector }
      const tierConfig = getTierConfig(null)

      try {
        console.log(`[scan] ${scanId} — researching "${business_name}"...`)
        const research = await researchStep(ctx)
        console.log(`[scan] ${scanId} — industry: "${research.industry}"`)

        if (research.industry && sector && research.industry !== sector) {
          await bgSupabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
        }

        const queries = generateQueriesStep(ctx, research, tierConfig)
        console.log(`[scan] ${scanId} — ${queries.length} queries`)

        const allResponses: RawEngineResponse[] = []
        const mockEngines: string[] = []

        for (const engine of tierConfig.engines) {
          const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
          const result = await queryEngineStep(engine, queries, engineQueryCount)
          allResponses.push(...result.responses)
          if (result.hasMock) mockEngines.push(engine)
          console.log(`[scan] ${scanId} — ${engine}: ${result.responses.length} responses, mock=${result.hasMock}`)
        }

        const realResponses = allResponses.filter((r) => !r.isMock)
        if (realResponses.length === 0) {
          console.error(`[scan] ${scanId} — ALL MOCK. Check OPENROUTER_SCAN_KEY.`)
          await bgSupabase.from('free_scans').update({
            status: 'failed', completed_at: new Date().toISOString(),
          }).eq('id', scanId)
          return
        }

        console.log(`[scan] ${scanId} — analyzing ${allResponses.length} responses...`)
        const analysis = await analyzeStep(ctx, research, queries, allResponses)

        const scanResults = buildResultsStep(ctx, research, queries, analysis)

        await bgSupabase.from('free_scans').update({
          status: 'completed',
          overall_score: scanResults.visibility_score,
          results_data: JSON.parse(JSON.stringify(scanResults)),
          completed_at: new Date().toISOString(),
          ...(mockEngines.length > 0 ? { mock_engines: mockEngines } : {}),
        }).eq('id', scanId)

        console.log(`[scan] ${scanId} — DONE, score: ${scanResults.visibility_score}`)
      } catch (err) {
        console.error(`[scan] ${scanId} — FAILED:`, err)
        try {
          await bgSupabase.from('free_scans').update({
            status: 'failed', completed_at: new Date().toISOString(),
          }).eq('id', scanId)
        } catch { /* best effort */ }
      }
    })

    // Return 202 immediately — scan runs in after() callback
    return NextResponse.json(
      { scan_id: scanId, scan_token: insertResult.scan_id, status: 'processing' },
      { status: 202 }
    )
  } catch (err) {
    console.error('[scan/start] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'

const onboardingSchema = z.object({
  business_name: z.string().min(2).max(100),
  industry: z.string().min(1),
  location: z.string().min(2),
  url: z.string().url(),
  scan_id: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { business_name, industry, location, url, scan_id } = parsed.data

  // 1. Create business record
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      user_id: user.id,
      name: business_name,
      website_url: url,
      industry,
      location,
      is_primary: true,
    })
    .select('id')
    .single()

  if (bizError) {
    return NextResponse.json(
      { error: 'Failed to create business', details: bizError.message },
      { status: 500 }
    )
  }

  // 2. If scan_id provided, link the free scan and convert results
  if (scan_id) {
    // Link free scan to this user
    const { data: freeScan, error: scanLinkError } = await supabase
      .from('free_scans')
      .update({ converted_user_id: user.id })
      .eq('scan_token', scan_id)
      .is('converted_user_id', null)
      .select('*')
      .single()

    if (scanLinkError) {
      // Non-fatal — business was created, scan just didn't link
      console.error('Failed to link free scan:', scanLinkError.message)
    } else if (freeScan?.results_data && freeScan.status === 'completed') {
      // Convert free scan results to scan_results + scan_result_details
      await convertFreeScanResults(supabase, freeScan, user.id, business.id)
    }
  }

  // 3. Mark onboarding as completed
  const { error: profileError } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  if (profileError) {
    console.error('Failed to update onboarding status:', profileError.message)
  }

  return NextResponse.json({ success: true, business_id: business.id })
}

interface FreeScanRow {
  id: string
  scan_token: string
  website_url: string
  business_name: string
  sector: string
  location: string
  overall_score: number | null
  results_data: Json | null
  status: string
}

interface FreeScanEngineResult {
  engine: string
  is_mentioned: boolean
  mention_position: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  competitors_mentioned: string[]
  response_snippet: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function convertFreeScanResults(
  supabase: SupabaseClient,
  freeScan: FreeScanRow,
  userId: string,
  businessId: string
) {
  if (!freeScan.results_data || typeof freeScan.results_data !== 'object' || Array.isArray(freeScan.results_data)) return
  const resultsData = freeScan.results_data as Record<string, Json | undefined>

  let queryId: string | null = null
  let scanResultId: string | null = null

  try {
    // Create a tracked query for the free scan
    const { data: query, error: queryError } = await supabase
      .from('tracked_queries')
      .insert({
        user_id: userId,
        business_id: businessId,
        query_text: `AI visibility scan for ${freeScan.business_name}`,
        query_category: 'general',
        target_url: freeScan.website_url,
        priority: 'high' as const,
      })
      .select('id')
      .single()

    if (queryError || !query) {
      console.error('Failed to create tracked query:', queryError?.message)
      return
    }
    queryId = query.id

    // Create scan_result
    const rawEngines = resultsData.engines
    const engines = (Array.isArray(rawEngines) ? rawEngines : []) as unknown as FreeScanEngineResult[]
    const mentionCount = engines.filter((e) => e.is_mentioned).length
    const mentionedPositions = engines
      .filter((e) => e.mention_position !== null)
      .map((e) => e.mention_position as number)
    const avgPosition =
      mentionedPositions.length > 0
        ? mentionedPositions.reduce((a, b) => a + b, 0) / mentionedPositions.length
        : null

    const { data: scanResult, error: scanError } = await supabase
      .from('scan_results')
      .insert({
        query_id: query.id,
        user_id: userId,
        business_id: businessId,
        scan_type: 'free' as const,
        overall_score: freeScan.overall_score,
        mention_count: mentionCount,
        avg_position: avgPosition,
      })
      .select('id')
      .single()

    if (scanError || !scanResult) {
      console.error('Failed to create scan result:', scanError?.message)
      return
    }
    scanResultId = scanResult.id

    // Create scan_result_details for each engine
    const engineMap: Record<string, string> = {
      chatgpt: 'chatgpt',
      gemini: 'gemini',
      perplexity: 'perplexity',
      claude: 'claude',
      google_ai_overviews: 'google_ai_overviews',
    }

    const details = engines
      .filter((e) => engineMap[e.engine])
      .map((e) => ({
        scan_result_id: scanResult.id,
        llm_provider: engineMap[e.engine] as 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'google_ai_overviews',
        is_mentioned: e.is_mentioned,
        mention_position: e.mention_position,
        mention_context: e.response_snippet || null,
        sentiment: e.sentiment,
        competitors_mentioned: e.competitors_mentioned ?? [],
      }))

    if (details.length > 0) {
      const { error: detailsError } = await supabase
        .from('scan_result_details')
        .insert(details)

      if (detailsError) {
        console.error('Failed to create scan result details:', detailsError.message)
      }
    }
  } catch (err) {
    console.error('convertFreeScanResults failed:', err)
    // Attempt cleanup: delete the scan_result if it was created (details cascade or orphan)
    if (scanResultId) {
      const { error: cleanupScanErr } = await supabase
        .from('scan_results')
        .delete()
        .eq('id', scanResultId)
      if (cleanupScanErr) {
        console.error('Cleanup: failed to delete scan_result:', cleanupScanErr.message)
      }
    }
    // Attempt cleanup: delete the tracked_query if it was created
    if (queryId) {
      const { error: cleanupQueryErr } = await supabase
        .from('tracked_queries')
        .delete()
        .eq('id', queryId)
      if (cleanupQueryErr) {
        console.error('Cleanup: failed to delete tracked_query:', cleanupQueryErr.message)
      }
    }
  }
}

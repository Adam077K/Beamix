import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import { queryEngineRaw } from '@/lib/scan/engine-adapter'
import { researchBusiness, generateScanQueries } from '@/lib/scan/query-templates'
import { analyzeResponses, type RawEngineResponse } from '@/lib/scan/analyzer'
import { buildScanResults } from '@/lib/scan/build-results'
import type { ScanResults } from '@/lib/types'

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

    // IP-based rate limiting
    // Vercel sets x-vercel-forwarded-for from the actual edge IP (not spoofable).
    // Fallback: use last IP in x-forwarded-for chain (infrastructure-injected).
    const ip =
      request.headers.get('x-vercel-forwarded-for')?.split(',').at(-1)?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
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

    // Start research while creating DB record (parallel)
    const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

    const [research, insertResult] = await Promise.all([
      hasApiKey
        ? researchBusiness(business_name, url)
        : Promise.resolve({ industry: sector || 'local business', description: '', services: [] as string[], targetCustomers: '', websiteContext: '', websiteTitle: null, websiteDescription: null }),
      supabase
        .from('free_scans')
        .insert({
          website_url: url,
          business_name,
          industry: sector || 'general', // updated later with real industry
          location,
          ip_address: ip,
          status: 'processing',
          scan_id: scanIdToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          ...(email ? { email } : {}),
        })
        .select('id, scan_id')
        .single(),
    ])

    if (insertResult.error || !insertResult.data) {
      console.error('[scan/start] Failed to insert free_scan:', insertResult.error)
      return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
    }

    const scanId = insertResult.data.id

    // Update industry with researched value
    if (research.industry && research.industry !== sector) {
      await supabase.from('free_scans').update({ industry: research.industry }).eq('id', scanId)
    }

    console.log(`[scan/start] Scan ${scanId} | Business: "${business_name}" | Industry: "${research.industry}" | Services: [${research.services.join(', ')}]`)

    // Process scan
    try {
      const scanResults = await runScan(business_name, url, research, location)

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
 * Wraps a promise with a per-engine timeout. Resolves to null on timeout so
 * the rest of the Promise.all can still complete with whatever succeeded.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallbackLabel: string): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`[scan] ${fallbackLabel} timed out after ${ms}ms`)
        resolve(null)
      }, ms)
    ),
  ])
}

/**
 * Scan Pipeline v3 — Web-grounded:
 *
 * 0. Scrape website + Perplexity research (parallel, ~2s)
 * 1. Generate 3 queries from real business data
 * 2. Query engines with web search (8 calls, all parallel):
 *    - ChatGPT (mini:online): 2 queries (category + brand) — expensive, skip authority
 *    - Gemini (flash:online): 3 queries — cheap with :online
 *    - Perplexity (sonar-pro): 3 queries — native search, no extra cost
 * 3. Analyze all 8 responses (1 call)
 * 4. Build results with real competitor scores + personalized recommendations
 *
 * Cost: ~$0.12/scan
 */
async function runScan(
  businessName: string,
  websiteUrl: string,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  location?: string | null,
): Promise<ScanResults> {
  const hasApiKey = !!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)

  if (!hasApiKey) {
    return runMockScan(businessName, businessName, research.industry)
  }

  // Step 1: Generate queries from research
  const [categoryQuery, brandQuery, authorityQuery] = generateScanQueries(
    businessName, websiteUrl, research, location
  )
  const queries = [categoryQuery, brandQuery, authorityQuery]
  console.log(`[scan] Q1: "${categoryQuery}"`)
  console.log(`[scan] Q2: "${brandQuery}"`)
  console.log(`[scan] Q3: "${authorityQuery}"`)

  // Step 2: Query engines in parallel
  // ChatGPT + Gemini (:online) — 2 queries each (category + brand), skip authority
  // Perplexity (native search, no extra cost) — all 3 queries
  const twoQueries = [categoryQuery, brandQuery]

  const rawResponses = (await Promise.all([
    ...twoQueries.map((query) =>
      withTimeout(
        queryEngineRaw('chatgpt', query).then((r) => ({ ...r, query }) as RawEngineResponse),
        15000,
        `chatgpt: ${query.slice(0, 50)}`
      )
    ),
    ...twoQueries.map((query) =>
      withTimeout(
        queryEngineRaw('gemini', query).then((r) => ({ ...r, query }) as RawEngineResponse),
        15000,
        `gemini: ${query.slice(0, 50)}`
      )
    ),
    ...queries.map((query) =>
      withTimeout(
        queryEngineRaw('perplexity', query).then((r) => ({ ...r, query }) as RawEngineResponse),
        15000,
        `perplexity: ${query.slice(0, 50)}`
      )
    ),
  ])).filter((r): r is RawEngineResponse => r !== null)

  // If every engine timed out, fall back to mock scan
  if (rawResponses.length === 0) {
    console.warn('[scan] All engines timed out — falling back to mock scan')
    return runMockScan(businessName, businessName, research.industry)
  }

  const mockCount = rawResponses.filter((r) => r.isMock).length
  console.log(`[scan] ${rawResponses.length} responses (${mockCount} mock)`)

  // Step 3: Analyze
  const analysis = await analyzeResponses({
    businessName,
    websiteUrl,
    industry: research.industry,
    location,
    queries,
    responses: rawResponses,
  })

  console.log(`[scan] ${analysis.visibility_summary}`)

  // Step 4: Build results using shared module
  return buildScanResults({
    businessName,
    websiteUrl,
    industry: research.industry,
    location,
    research,
    queries,
    analysis,
  })
}

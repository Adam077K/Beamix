/**
 * Shared scan core — the unified pipeline used by both free and paid scans.
 *
 * Design: Each function returns data. The caller wraps each in an Inngest
 * step (for retry isolation) or calls directly (sync mode).
 */

import { queryEngineRaw, type EngineResponse } from '@/lib/scan/engine-adapter'
import { analyzeResponses, type RawEngineResponse } from '@/lib/scan/analyzer'
import { buildScanResults } from '@/lib/scan/build-results'
import { type ScanTierConfig, type ScanEngine } from '@/lib/scan/tier-config'
import { researchBusiness, generateScanQueries } from '@/lib/scan/query-templates'
import type { ScanResults } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScanContext {
  businessName: string
  websiteUrl: string
  location?: string | null
  sector?: string | null
}

export interface ScanEngineResult {
  engine: string
  responses: RawEngineResponse[]
  hasMock: boolean
}

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

/**
 * Step 1: Research the business via Perplexity + website scrape.
 */
export async function researchStep(ctx: ScanContext) {
  return researchBusiness(ctx.businessName, ctx.websiteUrl, ctx.sector ?? undefined)
}

/**
 * Step 2: Generate 3 natural queries from research data.
 * Returns all 3 queries — the distribution to engines happens in queryEngineStep.
 */
export function generateQueriesStep(
  ctx: ScanContext,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  _tierConfig: ScanTierConfig,
) {
  return generateScanQueries(
    ctx.businessName,
    ctx.websiteUrl,
    research,
    ctx.location,
  )
}

/**
 * Pick which queries to send to a specific engine.
 *
 * Free tier: each engine gets exactly 1 query (query[0]) — 3 total API calls,
 * all parallel. We still generate 3 queries in the research step for quality,
 * but only send the first to each engine for cost efficiency.
 *
 * Paid tiers (starter/pro/business) handle their own multi-query distribution
 * in their respective Inngest functions and are not affected by this function.
 */
export function pickQueriesForEngine(
  _engine: ScanEngine,
  allQueries: string[],
): string[] {
  // All engines receive the same first query — clean, deterministic, parallel-safe
  return [allQueries[0]]
}

/**
 * Step 3: Query a single engine with its allocated queries.
 */
export async function queryEngineStep(
  engine: ScanEngine,
  queries: string[],
  _queriesPerEngine: number,
): Promise<ScanEngineResult> {
  const responses: RawEngineResponse[] = []
  let hasMock = false

  const promises = queries.map((query) =>
    queryEngineRaw(engine, query)
      .then((r): RawEngineResponse => ({
        engine: r.engine,
        query,
        rawResponse: r.rawResponse,
        isMock: r.isMock,
        latencyMs: r.latencyMs,
      }))
      .catch((err) => {
        console.error(`[scan-core] ${engine} query failed:`, err)
        return null
      })
  )

  const settled = await Promise.all(promises)
  for (const r of settled) {
    if (r) {
      responses.push(r)
      if (r.isMock) hasMock = true
    }
  }

  return { engine, responses, hasMock }
}

/**
 * Step 4: Analyze all responses with Gemini Flash.
 */
export async function analyzeStep(
  ctx: ScanContext,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  queries: string[],
  rawResponses: RawEngineResponse[],
) {
  return analyzeResponses({
    businessName: ctx.businessName,
    websiteUrl: ctx.websiteUrl,
    industry: research.industry,
    location: ctx.location,
    queries,
    responses: rawResponses,
    knownCompetitors: research.competitors,
  })
}

/**
 * Step 5: Build final results object.
 */
export function buildResultsStep(
  ctx: ScanContext,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  queries: string[],
  analysis: Awaited<ReturnType<typeof analyzeResponses>>,
): ScanResults {
  return buildScanResults({
    businessName: ctx.businessName,
    websiteUrl: ctx.websiteUrl,
    industry: research.industry,
    location: ctx.location,
    research,
    queries,
    analysis,
  })
}

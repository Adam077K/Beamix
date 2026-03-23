/**
 * Shared scan core — the unified pipeline used by both free and paid scans.
 *
 * Design: Each function returns data. The caller (Inngest function) wraps each
 * in an Inngest step for retry isolation. This module does NOT know about
 * Inngest — it's pure business logic.
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
  return researchBusiness(ctx.businessName, ctx.websiteUrl)
}

/**
 * Step 2: Generate queries based on research and tier.
 *
 * IMPORTANT: The old generateScanQueries() returns [categoryQuery, brandQuery, authorityQuery].
 * The brand query explicitly names the business and inflates scores.
 * We filter it out — only organic queries (category + authority) are used for scoring.
 * The brand query is kept as an UNSCORED diagnostic (index 1, filtered here).
 */
export function generateQueriesStep(
  ctx: ScanContext,
  research: Awaited<ReturnType<typeof researchBusiness>>,
  _tierConfig: ScanTierConfig,
) {
  const allQueries = generateScanQueries(
    ctx.businessName,
    ctx.websiteUrl,
    research,
    ctx.location,
  )
  // Filter out brand query (index 1) — it names the business and inflates scores.
  // Keep category (index 0) and authority (index 2) as organic queries.
  return [allQueries[0], allQueries[2]].filter(Boolean)
}

/**
 * Step 3: Query a single engine with its allocated queries.
 * Each engine is called as a separate Inngest step for retry isolation.
 */
export async function queryEngineStep(
  engine: ScanEngine,
  queries: string[],
  queriesPerEngine: number,
): Promise<ScanEngineResult> {
  const engineQueries = queries.slice(0, Math.min(queriesPerEngine, queries.length))
  const responses: RawEngineResponse[] = []
  let hasMock = false

  const promises = engineQueries.map((query) =>
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

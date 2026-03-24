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
  return researchBusiness(ctx.businessName, ctx.websiteUrl)
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
 * - Perplexity: gets ALL 3 queries (best at finding businesses, native web search)
 * - ChatGPT & Gemini: get 2 RANDOM queries out of 3 (saves cost, adds variety)
 *
 * The randomization is seeded by scanId so the same scan always produces
 * the same query assignment (reproducible results).
 */
export function pickQueriesForEngine(
  engine: ScanEngine,
  allQueries: string[],
  queriesPerEngine: number,
  scanId: string,
): string[] {
  // Perplexity gets all queries
  if (engine === 'perplexity') {
    return allQueries
  }

  // For other engines: pick N random queries seeded by scanId + engine name
  if (queriesPerEngine >= allQueries.length) {
    return allQueries
  }

  // Simple seeded shuffle: hash scanId+engine to get a stable starting index
  const seed = hashString(`${scanId}-${engine}`)
  const indices = allQueries.map((_, i) => i)

  // Fisher-Yates shuffle with seed
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.abs((seed + i * 31) % (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.slice(0, queriesPerEngine).sort().map((i) => allQueries[i])
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
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

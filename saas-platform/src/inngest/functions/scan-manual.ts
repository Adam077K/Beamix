import { z } from 'zod'
import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { queryEngineRaw } from '@/lib/scan/engine-adapter'
import { researchBusiness, generateScanQueries } from '@/lib/scan/query-templates'
import { analyzeResponses, type RawEngineResponse } from '@/lib/scan/analyzer'
import { buildScanResults } from '@/lib/scan/build-results'
import { getTierConfig, type ScanEngine } from '@/lib/scan/tier-config'

const eventDataSchema = z.object({
  scanId: z.string().uuid(),
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
})

export const scanManual = inngest.createFunction(
  { id: 'scan-manual', name: 'Process Manual Scan (v3 Pipeline)' },
  { event: 'scan/manual.started' },
  async ({ event, step }) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase env vars')
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    const parsed = eventDataSchema.safeParse(event.data)
    if (!parsed.success) {
      throw new Error(`Invalid event data: ${parsed.error.message}`)
    }
    const { scanId, businessId, userId } = parsed.data

    await step.run('update-status', async () => {
      const { data: lockResult } = await supabase
        .from('scans')
        .update({ status: 'processing' })
        .eq('id', scanId)
        .eq('status', 'pending')
        .select('id')
        .single()
      if (!lockResult) throw new Error('Scan already processing or completed')
    })

    // Fetch business details + verify ownership in a single query
    const business = await step.run('fetch-business', async () => {
      const { data } = await supabase
        .from('businesses')
        .select('name, website_url, industry, location, user_id')
        .eq('id', businessId)
        .single()
      return data
    })

    if (!business) throw new Error('Business not found')
    if (business.user_id !== userId) throw new Error('Business does not belong to user')

    // Determine scan tier from user's plan
    const planData = await step.run('fetch-plan', async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_tier')
        .eq('user_id', userId)
        .single()
      return data
    })

    const planTier = planData?.plan_tier ?? null
    const tierConfig = getTierConfig(planTier)

    // Step 1: Research business via Perplexity + website scrape
    const research = await step.run('research-business', async () => {
      return researchBusiness(business.name, business.website_url ?? '')
    })

    // Step 2: Generate queries from research data
    const queries = await step.run('generate-queries', async () => {
      const baseQueries = generateScanQueries(
        business.name,
        business.website_url ?? '',
        research,
        business.location,
      )
      // For higher tiers, we still use the 3 base queries but send more per engine
      return baseQueries
    })

    // Step 3: Query each engine as separate retryable steps
    // Each engine gets a subset of queries based on tier config
    const rawResponses: RawEngineResponse[] = []

    for (const engine of tierConfig.engines) {
      const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
      // Select which queries to send: first N from the query list
      const engineQueries = queries.slice(0, Math.min(engineQueryCount, queries.length))

      const results = await step.run(`query-${engine}`, async () => {
        const responses: RawEngineResponse[] = []
        // Run queries for this engine in parallel
        const promises = engineQueries.map((query) =>
          queryEngineRaw(engine as ScanEngine, query)
            .then((r) => ({ ...r, query }) as RawEngineResponse)
            .catch((err) => {
              console.error(`[scan-manual] ${engine} query failed:`, err)
              return null
            })
        )
        const settled = await Promise.all(promises)
        for (const r of settled) {
          if (r) responses.push(r)
        }
        return responses
      })

      rawResponses.push(...results)
    }

    if (rawResponses.length === 0) {
      await step.run('mark-failed-no-responses', async () => {
        await supabase
          .from('scans')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', scanId)
      })
      throw new Error('All engine queries failed')
    }

    // Step 4: Analyze all responses with Gemini Flash
    const analysis = await step.run('analyze-responses', async () => {
      return analyzeResponses({
        businessName: business.name,
        websiteUrl: business.website_url ?? '',
        industry: research.industry,
        location: business.location,
        queries,
        responses: rawResponses,
      })
    })

    // Step 5: Build results and save
    await step.run('save-results', async () => {
      const scanResults = buildScanResults({
        businessName: business.name,
        websiteUrl: business.website_url ?? '',
        industry: research.industry,
        location: business.location,
        research,
        queries,
        analysis,
      })

      // Insert per-engine scan_engine_results rows
      const mockEngines: string[] = []
      for (const engineData of analysis.engines) {
        const isMock = rawResponses.some(
          (r) => r.engine === engineData.engine && r.isMock
        )
        if (isMock) mockEngines.push(engineData.engine)

        await supabase.from('scan_engine_results').insert({
          scan_id: scanId,
          business_id: businessId,
          engine: engineData.engine,
          is_mentioned: engineData.mentioned,
          is_cited: false,
          mention_count: engineData.mentioned ? 1 : 0,
          rank_position: engineData.mention_position,
          sentiment: engineData.sentiment,
        })
      }

      if (mockEngines.length > 0) {
        console.warn(`[scan-manual] Scan ${scanId} used MOCK for: ${mockEngines.join(', ')}`)
      }

      // Update scan with score + rich results_data JSONB
      const mentionsCount = analysis.engines.filter((e) => e.mentioned).length
      await supabase
        .from('scans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          overall_score: scanResults.visibility_score,
          mentions_count: mentionsCount,
          results_summary: JSON.parse(JSON.stringify({
            ...scanResults,
            ...(mockEngines.length > 0 ? { _mock_engines: mockEngines } : {}),
          })),
        })
        .eq('id', scanId)

      console.log(`[scan-manual] Scan ${scanId} completed — score: ${scanResults.visibility_score}, engines: ${tierConfig.engines.length}, responses: ${rawResponses.length}`)

      return { overallScore: scanResults.visibility_score }
    })

    return { scanId }
  },
)

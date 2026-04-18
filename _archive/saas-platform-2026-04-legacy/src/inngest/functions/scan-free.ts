import { z } from 'zod'
import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { getTierConfig } from '@/lib/scan/tier-config'
import {
  researchStep,
  generateQueriesStep,
  queryEngineStep,
  analyzeStep,
  buildResultsStep,
  type ScanContext,
} from '@/lib/scan/scan-core'
import type { RawEngineResponse } from '@/lib/scan/analyzer'

const eventDataSchema = z.object({
  freeScanId: z.string().uuid(),
  businessName: z.string(),
  websiteUrl: z.string().url(),
  sector: z.string().optional(),
  location: z.string().nullable().optional(),
})

export const scanFree = inngest.createFunction(
  {
    id: 'scan-free',
    name: 'Process Free Scan (Async)',
    retries: 2, // Free scans: limited retries to control API budget
  },
  { event: 'scan/free.started' },
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
    const { freeScanId, businessName, websiteUrl, sector, location } = parsed.data

    const ctx: ScanContext = { businessName, websiteUrl, location, sector }
    const tierConfig = getTierConfig(null) // Always free tier

    // Step 1: Lock scan to processing
    await step.run('update-status', async () => {
      const { data } = await supabase
        .from('free_scans')
        .update({ status: 'processing' })
        .eq('id', freeScanId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .select('id')
        .single()
      if (!data) throw new Error('Free scan already processing, expired, or not found')
    })

    // Step 2: Research business
    const research = await step.run('research-business', async () => {
      return researchStep(ctx)
    })

    // Update industry if research found a better one than what the user submitted
    if (research.industry && sector && research.industry !== sector) {
      await step.run('update-industry', async () => {
        await supabase.from('free_scans').update({ industry: research.industry }).eq('id', freeScanId)
      })
    }

    // Step 3: Generate queries
    const queries = await step.run('generate-queries', async () => {
      return generateQueriesStep(ctx, research, tierConfig)
    })

    // Step 4: Query each engine as separate retryable steps
    const allResponses: RawEngineResponse[] = []
    const mockEngines: string[] = []

    for (const engine of tierConfig.engines) {
      const engineQueryCount = tierConfig.queriesPerEngine[engine] ?? 2
      const result = await step.run(`query-${engine}`, async () => {
        return queryEngineStep(engine, queries, engineQueryCount)
      })
      allResponses.push(...result.responses)
      if (result.hasMock) mockEngines.push(engine)
    }

    // If ALL responses are mock (API key misconfigured), fail — never show fake data as real
    const realResponses = allResponses.filter((r) => !r.isMock)
    if (realResponses.length === 0 && allResponses.length > 0) {
      await step.run('mark-failed-all-mock', async () => {
        await supabase.from('free_scans').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', freeScanId)
      })
      throw new Error('All engines returned mock data — API key may be misconfigured')
    }

    // If ALL engines failed (no responses at all), mark scan as failed
    if (allResponses.length === 0) {
      await step.run('mark-failed', async () => {
        await supabase.from('free_scans').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', freeScanId)
      })
      throw new Error('All engine queries failed — scan marked as failed')
    }

    // Step 5: Analyze all responses
    const analysis = await step.run('analyze-responses', async () => {
      return analyzeStep(ctx, research, queries, allResponses)
    })

    // Step 6: Build results and save
    await step.run('save-results', async () => {
      const scanResults = buildResultsStep(ctx, research, queries, analysis)

      await supabase.from('free_scans').update({
        status: 'completed',
        overall_score: scanResults.visibility_score,
        results_data: JSON.parse(JSON.stringify(scanResults)),
        completed_at: new Date().toISOString(),
        ...(mockEngines.length > 0 ? { mock_engines: mockEngines } : {}),
      }).eq('id', freeScanId)

      if (mockEngines.length > 0) {
        console.warn(`[scan-free] Scan ${freeScanId} used MOCK for: ${mockEngines.join(', ')}`)
      }
      console.log(`[scan-free] Scan ${freeScanId} completed — score: ${scanResults.visibility_score}`)

      return { overallScore: scanResults.visibility_score }
    })

    return { freeScanId }
  },
)

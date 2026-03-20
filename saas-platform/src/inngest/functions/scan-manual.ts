import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { queryEngine, type EngineQuery } from '@/lib/scan/engine-adapter'
import { parseEngineResponse } from '@/lib/scan/parser'
import { calculateCompositeScore } from '@/lib/scan/scorer'

// Pro tier and above get Claude in their scan engines
const FREE_ENGINES = ['chatgpt', 'gemini', 'perplexity'] as const
const PRO_ENGINES = ['chatgpt', 'gemini', 'perplexity', 'claude'] as const

export const scanManual = inngest.createFunction(
  { id: 'scan-manual', name: 'Process Manual Scan' },
  { event: 'scan/manual.started' },
  async ({ event, step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { scanId, businessId, userId } = event.data as {
      scanId: string
      businessId: string
      userId: string
    }

    await step.run('update-status', async () => {
      await supabase.from('scans').update({ status: 'processing' }).eq('id', scanId)
    })

    const business = await step.run('fetch-business', async () => {
      const { data } = await supabase
        .from('businesses')
        .select('name, website_url, industry, location')
        .eq('id', businessId)
        .single()
      return data
    })

    if (!business) throw new Error('Business not found')

    // Determine engines based on user's plan
    const planData = await step.run('fetch-plan', async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_tier')
        .eq('user_id', userId)
        .single()
      return data
    })

    const planTier = planData?.plan_tier ?? null
    const engines: typeof FREE_ENGINES[number][] | typeof PRO_ENGINES[number][] =
      planTier === 'pro' || planTier === 'business'
        ? [...PRO_ENGINES]
        : [...FREE_ENGINES]

    const engineQuery: EngineQuery = {
      query: `Who are the top ${business.industry ?? 'local'} businesses${business.location ? ` in ${business.location}` : ''}? Is ${business.name} recommended?`,
      businessName: business.name,
      businessUrl: business.website_url ?? '',
      industry: business.industry ?? 'local business',
      location: business.location ?? undefined,
    }

    // Query each engine as a separate retryable step
    const engineResponses: Array<{ engine: string; rawResponse: string; latencyMs: number; isMock: boolean }> = []

    for (const engine of engines) {
      const result = await step.run(`query-${engine}`, async () => {
        const response = await queryEngine(engine as Parameters<typeof queryEngine>[0], engineQuery)
        return {
          engine: response.engine,
          rawResponse: response.rawResponse,
          latencyMs: response.latencyMs,
          isMock: response.isMock,
        }
      })
      engineResponses.push(result)
    }

    // Parse, score, and store results
    await step.run('save-results', async () => {
      const responses = engineResponses.map((r) => ({ ...r, timestamp: new Date() }))
      const parsedResults = responses.map((r) => parseEngineResponse(r, business.name))
      const compositeScore = calculateCompositeScore(parsedResults)

      // Insert per-engine results (include is_mock flag for transparency)
      const mockEngines: string[] = []
      for (const parsed of parsedResults) {
        if (parsed.isMock) mockEngines.push(parsed.engine)
        await supabase.from('scan_engine_results').insert({
          scan_id: scanId,
          business_id: businessId,
          engine: parsed.engine,
          is_mentioned: parsed.isMentioned,
          rank_position: parsed.mentionPosition,
          sentiment_score: parsed.sentiment,
        })
      }

      if (mockEngines.length > 0) {
        console.warn(
          `[scan-manual] Scan ${scanId} used MOCK results for engines: ${mockEngines.join(', ')}`
        )
      }

      // Update scan with overall score and mock metadata
      await supabase
        .from('scans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          overall_score: compositeScore.overallScore,
          ...(mockEngines.length > 0 ? { metadata: { mock_engines: mockEngines } } : {}),
        })
        .eq('id', scanId)

      return { overallScore: compositeScore.overallScore }
    })

    return { scanId }
  },
)

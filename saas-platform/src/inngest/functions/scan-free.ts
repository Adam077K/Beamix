import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { queryEngine, type EngineQuery } from '@/lib/scan/engine-adapter'
import { parseEngineResponse } from '@/lib/scan/parser'
import { calculateCompositeScore } from '@/lib/scan/scorer'

export const scanFree = inngest.createFunction(
  { id: 'scan-free', name: 'Process Free Scan' },
  { event: 'scan/free.started' },
  async ({ event, step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { scanId, businessName, websiteUrl, industry, location } = event.data as {
      scanId: string
      businessName: string
      websiteUrl: string
      industry: string
      location?: string
      language?: string
    }

    await step.run('update-status-processing', async () => {
      await supabase.from('free_scans').update({ status: 'processing' }).eq('id', scanId)
    })

    const engineQuery: EngineQuery = {
      query: `Who are the best ${industry} businesses${location ? ` in ${location}` : ''}? Is ${businessName} (${websiteUrl}) recommended?`,
      businessName,
      businessUrl: websiteUrl,
      industry,
      location,
    }

    try {
      // Query each engine as a separate step for retry isolation
      const chatgptResult = await step.run('query-chatgpt', async () => {
        const response = await queryEngine('chatgpt', engineQuery)
        return { engine: response.engine, rawResponse: response.rawResponse, latencyMs: response.latencyMs, isMock: response.isMock }
      })

      const geminiResult = await step.run('query-gemini', async () => {
        const response = await queryEngine('gemini', engineQuery)
        return { engine: response.engine, rawResponse: response.rawResponse, latencyMs: response.latencyMs, isMock: response.isMock }
      })

      const perplexityResult = await step.run('query-perplexity', async () => {
        const response = await queryEngine('perplexity', engineQuery)
        return { engine: response.engine, rawResponse: response.rawResponse, latencyMs: response.latencyMs, isMock: response.isMock }
      })

      const results = await step.run('parse-and-score', async () => {
        const responses = [chatgptResult, geminiResult, perplexityResult].map((r) => ({
          ...r,
          timestamp: new Date(),
        }))

        const parsedResults = responses.map((r) => parseEngineResponse(r, businessName))
        const compositeScore = calculateCompositeScore(parsedResults)

        const engineData = parsedResults.map((p, i) => ({
          engine: p.engine,
          is_mentioned: p.isMentioned,
          rank_position: p.mentionPosition,
          sentiment_score: p.sentiment,
          response_text: responses[i]?.rawResponse ?? '',
          citations: p.citationUrls,
          competitors_found: p.competitorNames,
          context_excerpts: p.contextExcerpts,
          is_mock: p.isMock,
          latency_ms: responses[i]?.latencyMs ?? 0,
        }))

        return {
          engines: engineData,
          visibility_score: compositeScore.overallScore,
          mention_rate: compositeScore.mentionRate,
          average_sentiment: compositeScore.averageSentiment,
          score_breakdown: compositeScore.breakdown,
          business_name: businessName,
          website_url: websiteUrl,
        }
      })

      await step.run('save-results', async () => {
        await supabase
          .from('free_scans')
          .update({
            status: 'completed',
            overall_score: results.visibility_score,
            results_data: results,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scanId)
      })

      return { scanId, visibilityScore: results.visibility_score }
    } catch (error) {
      await step.run('mark-failed', async () => {
        await supabase
          .from('free_scans')
          .update({ status: 'failed' })
          .eq('id', scanId)
      })
      throw error // re-throw so Inngest records the failure
    }
  },
)

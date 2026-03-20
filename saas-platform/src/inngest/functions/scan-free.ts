import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { queryEngine, type EngineQuery } from '@/lib/scan/engine-adapter'
import { parseEngineResponse } from '@/lib/scan/parser'
import { calculateCompositeScore } from '@/lib/scan/scorer'
import { INDUSTRY_COMPETITORS } from '@/constants/industries'
import type { ScanResults, EngineResult, LeaderboardEntry, LLMEngine, QuickWin } from '@/lib/types'

// Quick win templates for recommendations
const QUICK_WIN_TEMPLATES: QuickWin[] = [
  { title: 'Add FAQ Schema Markup', description: 'Structured FAQ data helps AI engines understand and cite your expertise. Add JSON-LD FAQ schema to your homepage.', impact: 'high', engine_benefit: 'ChatGPT, Gemini' },
  { title: 'Create an About Page with Entity Data', description: 'AI engines look for structured entity information. Include founding year, team size, service area, and certifications.', impact: 'high', engine_benefit: 'All engines' },
  { title: 'Publish Expert Blog Content', description: 'Regular, in-depth content establishes topical authority. Aim for 1-2 posts per month on industry topics.', impact: 'medium', engine_benefit: 'Perplexity, ChatGPT' },
  { title: 'Optimize Google Business Profile', description: 'Complete and active GBP listings are a key signal for AI engines, especially for local queries.', impact: 'high', engine_benefit: 'Gemini, ChatGPT' },
  { title: 'Add Structured Data (LocalBusiness)', description: 'JSON-LD LocalBusiness schema helps AI engines identify your business type, location, and services.', impact: 'medium', engine_benefit: 'All engines' },
  { title: 'Build Citation Consistency', description: 'Ensure your business name, address, and phone are consistent across directories and review sites.', impact: 'medium', engine_benefit: 'ChatGPT, Perplexity' },
  { title: 'Get More Customer Reviews', description: 'AI engines reference review sentiment. Actively request reviews on Google, Yelp, and industry-specific platforms.', impact: 'high', engine_benefit: 'All engines' },
]

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

        // Transform into ScanResults format expected by the client
        const engines: EngineResult[] = parsedResults.map((p, i) => ({
          engine: p.engine as LLMEngine,
          is_mentioned: p.isMentioned,
          mention_position: p.mentionPosition,
          sentiment: p.sentiment >= 65 ? 'positive' : p.sentiment >= 40 ? 'neutral' : 'negative',
          competitors_mentioned: p.competitorNames,
          response_snippet: responses[i]?.rawResponse?.slice(0, 300) ?? '',
        }))

        // Generate competitor data
        const competitors = INDUSTRY_COMPETITORS[industry] ?? ['Top Competitor', 'Industry Leader']
        const topCompetitor = competitors[0] ?? 'Top Competitor'
        const visibilityScore = compositeScore.overallScore
        const topCompetitorScore = Math.min(95, visibilityScore + 10 + Math.round(Math.random() * 15))

        // Generate leaderboard
        const leaderboard: LeaderboardEntry[] = []
        const competitorScores = competitors.slice(0, 5).map((name, i) => ({
          name,
          score: Math.max(20, Math.min(95, topCompetitorScore - i * 8 + Math.round(Math.random() * 10 - 5))),
        }))
        competitorScores.push({ name: businessName, score: visibilityScore })
        competitorScores.sort((a, b) => b.score - a.score)
        competitorScores.forEach((c, i) => {
          leaderboard.push({
            name: c.name,
            score: c.score,
            rank: i + 1,
            is_user: c.name === businessName,
          })
        })

        const userEntry = leaderboard.find((e) => e.is_user)

        // Pick 3-4 quick wins
        const shuffled = [...QUICK_WIN_TEMPLATES].sort(() => Math.random() - 0.5)
        const quickWins = shuffled.slice(0, 3 + Math.round(Math.random()))

        const scanResults: ScanResults = {
          visibility_score: visibilityScore,
          engines,
          top_competitor: topCompetitor,
          top_competitor_score: topCompetitorScore,
          quick_wins: quickWins,
          rank: userEntry?.rank ?? leaderboard.length,
          total_businesses: leaderboard.length,
          leaderboard,
        }

        return scanResults
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

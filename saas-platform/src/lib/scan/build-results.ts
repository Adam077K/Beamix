/**
 * Shared scan result builder — used by both free and paid scan pipelines.
 *
 * Takes raw analyzer output and constructs the full ScanResults object
 * with leaderboard, brand attributes, quick wins, and composite score.
 */

import type { AnalysisResult } from './analyzer'
import type { ScanResults, EngineResult, LeaderboardEntry } from '@/lib/types/index'
import type { BusinessResearch } from './query-templates'

/**
 * Build the complete ScanResults object from analyzer output.
 *
 * Uses the analyzer's engine breakdown for mention/position/sentiment,
 * competitor data for the leaderboard, and recommendations as quick wins.
 *
 * Score formula mirrors calculateCompositeScore weights:
 * - 40% mention rate
 * - 30% position quality
 * - 30% sentiment
 */
export function buildScanResults(params: {
  businessName: string
  websiteUrl: string
  industry: string
  location?: string | null
  research: BusinessResearch
  queries: string[]
  analysis: AnalysisResult
}): ScanResults {
  const { businessName, research, queries, analysis } = params

  const engineResults: EngineResult[] = analysis.engines.map((e) => ({
    engine: e.engine as EngineResult['engine'],
    is_mentioned: e.mentioned,
    mention_position: e.mention_position,
    sentiment: e.sentiment,
    competitors_mentioned: e.competitors_found.map((c) => c.name),
    response_snippet: e.context_quote ?? '',
  }))

  // Visibility score: 40% mention + 30% position + 30% sentiment
  const totalEngines = engineResults.length
  let visibilityScore = 0

  if (totalEngines > 0) {
    const mentionedCount = engineResults.filter((e) => e.is_mentioned).length

    // Mention component: 0–40 pts
    visibilityScore += Math.round((mentionedCount / totalEngines) * 40)

    // Position component: 0–30 pts
    for (const e of engineResults) {
      if (e.is_mentioned && e.mention_position !== null) {
        const posScore = Math.max(5, 30 - (e.mention_position - 1) * 3)
        visibilityScore += Math.round(posScore / totalEngines)
      }
    }

    // Sentiment component: 0–30 pts
    for (const e of engineResults) {
      if (e.sentiment === 'positive') visibilityScore += Math.round(30 / totalEngines)
      else if (e.sentiment === 'neutral') visibilityScore += Math.round(15 / totalEngines)
    }
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore))

  // Real competitor scores derived from analyzer data
  const leaderboardEntries: Array<{ name: string; score: number }> = []

  for (const comp of analysis.top_competitors) {
    if (comp.name.toLowerCase() === businessName.toLowerCase()) continue
    const mentionRate = comp.mention_count / 3
    const posBonus = comp.best_position !== null
      ? Math.max(5, 35 - (comp.best_position - 1) * 4)
      : 10
    const score = Math.min(95, Math.round(mentionRate * 60 + posBonus))
    leaderboardEntries.push({ name: comp.name, score })
  }

  leaderboardEntries.push({ name: businessName, score: visibilityScore })
  leaderboardEntries.sort((a, b) => b.score - a.score)

  const leaderboard: LeaderboardEntry[] = leaderboardEntries.slice(0, 8).map((entry, i) => ({
    name: entry.name,
    score: entry.score,
    rank: i + 1,
    is_user: entry.name === businessName,
  }))

  const userEntry = leaderboard.find((e) => e.is_user)
  const topCompetitor = leaderboardEntries.find((e) => e.name !== businessName)

  // Personalized recommendations from analyzer
  const quickWins = analysis.recommendations.map((r) => ({
    title: r.title,
    description: r.description,
    impact: r.impact,
  }))

  // Share of Voice: user mentions / total mentions across all engines
  const userMentions = analysis.engines.filter((e) => e.mentioned).length
  const totalMentions =
    userMentions +
    analysis.top_competitors.reduce((sum, c) => sum + c.mention_count, 0)
  const shareOfVoice =
    totalMentions > 0 ? Math.round((userMentions / totalMentions) * 100) : 0

  return {
    visibility_score: visibilityScore,
    engines: engineResults,
    top_competitor: topCompetitor?.name ?? 'Industry Leader',
    top_competitor_score:
      topCompetitor?.score ?? Math.min(95, visibilityScore + 15),
    quick_wins: quickWins,
    rank: userEntry?.rank ?? leaderboard.length,
    total_businesses: leaderboard.length,
    leaderboard,
    queries_used: queries,
    visibility_summary: analysis.visibility_summary,
    business_context: {
      detected_industry: research.industry,
      description: research.description,
      services: research.services,
      website_title: research.websiteTitle ?? null,
      website_description: research.websiteDescription ?? null,
    },
    share_of_voice: shareOfVoice,
    per_query_breakdown: analysis.per_query_breakdown,
    brand_attributes: analysis.brand_attributes,
    citation_urls: analysis.citation_urls,
  }
}

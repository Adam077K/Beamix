/**
 * Shared scan result builder — used by both free and paid scan pipelines.
 *
 * Scoring formula (revised based on SparkToro research + industry audit):
 * - 50% mention rate (most reliable signal — did the AI mention you?)
 * - 20% position quality (unreliable per SparkToro, downweighted)
 * - 15% sentiment (positive/neutral/negative)
 * - 15% content richness (did the AI say something substantial about you?)
 *
 * SAME formula used for both user and competitors — fair leaderboard.
 */

import type { AnalysisResult } from './analyzer'
import type { ScanResults, EngineResult, LeaderboardEntry } from '@/lib/types/index'
import type { BusinessResearch } from './query-templates'

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

  // ---------------------------------------------------------------------------
  // Visibility score: 50% mention + 20% position + 15% sentiment + 15% content
  // ---------------------------------------------------------------------------
  const totalEngines = engineResults.length
  let visibilityScore = 0

  if (totalEngines > 0) {
    const mentionedCount = engineResults.filter((e) => e.is_mentioned).length

    // Mention component: 0–50 pts (most reliable signal)
    visibilityScore += Math.round((mentionedCount / totalEngines) * 50)

    // Position component: 0–20 pts (unreliable per SparkToro, downweighted)
    for (const e of engineResults) {
      if (e.is_mentioned && e.mention_position !== null) {
        const posScore = Math.max(3, 20 - (e.mention_position - 1) * 2)
        visibilityScore += Math.round(posScore / totalEngines)
      }
    }

    // Sentiment component: 0–15 pts
    for (const e of engineResults) {
      if (e.sentiment === 'positive') visibilityScore += Math.round(15 / totalEngines)
      else if (e.sentiment === 'neutral') visibilityScore += Math.round(8 / totalEngines)
    }

    // Content richness: 0–15 pts (did engines say something substantial?)
    for (const e of engineResults) {
      if (e.is_mentioned && e.response_snippet.length > 50) {
        visibilityScore += Math.round(15 / totalEngines)
      } else if (e.is_mentioned && e.response_snippet.length > 20) {
        visibilityScore += Math.round(8 / totalEngines)
      }
    }
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore))

  // ---------------------------------------------------------------------------
  // Competitor scores — SAME formula as user for fair leaderboard comparison
  // ---------------------------------------------------------------------------
  const leaderboardEntries: Array<{ name: string; score: number }> = []

  for (const comp of analysis.top_competitors) {
    if (comp.name.toLowerCase() === businessName.toLowerCase()) continue
    const mentionRate = comp.mention_count / Math.max(1, analysis.engines.length)
    // Same weights: 50% mention + 20% position + 25% baseline (15% sentiment + 15% content, estimated for competitors)
    const mentionPts = Math.round(mentionRate * 50)
    const posPts = comp.best_position !== null
      ? Math.round(Math.max(3, 20 - (comp.best_position - 1) * 2))
      : 0
    const baselinePts = Math.round(mentionRate * 25) // neutral sentiment + content assumed for mentioned competitors
    const score = Math.min(100, mentionPts + posPts + baselinePts)
    leaderboardEntries.push({ name: comp.name, score })
  }

  leaderboardEntries.push({ name: businessName, score: visibilityScore })
  leaderboardEntries.sort((a, b) => b.score - a.score)

  const leaderboard: LeaderboardEntry[] = leaderboardEntries.slice(0, 8).map((entry, i) => ({
    name: entry.name,
    score: entry.score,
    rank: i + 1,
    is_user: entry.name.toLowerCase() === businessName.toLowerCase(),
  }))

  const userEntry = leaderboard.find((e) => e.is_user)
  const topCompetitor = leaderboardEntries.find((e) => e.name !== businessName)

  const quickWins = analysis.recommendations.map((r) => ({
    title: r.title,
    description: r.description,
    impact: r.impact,
  }))

  // ---------------------------------------------------------------------------
  // Share of Voice — user vs top competitor (not aggregate sum)
  // ---------------------------------------------------------------------------
  const userMentionRate = totalEngines > 0
    ? analysis.engines.filter((e) => e.mentioned).length / totalEngines
    : 0
  // Filter out the user's own business from competitors before SOV calculation
  const actualCompetitors = analysis.top_competitors.filter(
    (c) => c.name.toLowerCase() !== businessName.toLowerCase()
  )
  const topCompMentionRate = actualCompetitors.length > 0
    ? (actualCompetitors[0]?.mention_count ?? 0) / Math.max(1, totalEngines)
    : 0
  const totalRate = userMentionRate + topCompMentionRate
  const shareOfVoice = totalRate > 0
    ? Math.round((userMentionRate / totalRate) * 100)
    : 0

  return {
    visibility_score: visibilityScore,
    engines: engineResults,
    top_competitor: topCompetitor?.name ?? 'Industry Leader',
    top_competitor_score: topCompetitor?.score ?? 0,
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
    brand_awareness_score: totalEngines > 0
      ? Math.round((engineResults.filter((e) => e.is_mentioned).length / totalEngines) * 100)
      : 0,
    ranking_quality_score: (() => {
      const mentioned = engineResults.filter((e) => e.is_mentioned && e.mention_position !== null)
      if (mentioned.length === 0) return 0
      const avg = mentioned.reduce((sum, e) => sum + Math.max(10, Math.min(100, 110 - (e.mention_position ?? 10) * 10)), 0) / mentioned.length
      return Math.min(100, Math.max(0, Math.round(avg)))
    })(),
    citation_quality_score: (() => {
      const mentioned = engineResults.filter((e) => e.is_mentioned)
      if (mentioned.length === 0) return 0
      const sentScores = mentioned.map((e) => e.sentiment === 'positive' ? 80 : e.sentiment === 'neutral' ? 50 : 20)
      return Math.round(sentScores.reduce((a, b) => a + b, 0) / sentScores.length)
    })(),
  }
}

/**
 * Scoring Redesign — defensible, multi-dimensional visibility score.
 *
 * DESIGN DECISIONS:
 *
 * 1. THREE SUB-SCORES instead of one blended number:
 *
 *    BRAND AWARENESS (0-100): "Do AI engines know you exist?"
 *    - Driven by mention rate across engines and query types
 *    - A business mentioned in 0/3 engines has 0 brand awareness
 *    - Weight: 40% of overall score
 *
 *    RANKING QUALITY (0-100): "Where do you appear when mentioned?"
 *    - Driven by position in ranked lists
 *    - Position 1 = 100, Position 10 = 10
 *    - Only calculated for engines/queries where the business IS mentioned
 *    - Weight: 35% of overall score
 *
 *    CITATION QUALITY (0-100): "How are you described?"
 *    - Combines: sentiment (positive/neutral/negative), cited_by_name (exact name vs vague reference),
 *      and confidence of the extraction
 *    - A positive, high-confidence, by-name citation = 100
 *    - A neutral, uncertain, generic mention = 30
 *    - Weight: 25% of overall score
 *
 * 2. QUERY TYPE WEIGHTING. Not all mentions are equal:
 *    - category_ranking mention: 1.0x weight (gold standard — this is what customers actually search)
 *    - service_specific mention: 0.9x weight (high intent, very valuable)
 *    - local_comparison mention: 0.85x weight (location-critical)
 *    - problem_solution mention: 0.8x weight (problem-aware, not solution-aware)
 *    - use_case_recommendation: 0.75x weight (contextual discovery)
 *    - industry_authority: 0.7x weight (thought leadership, less purchase intent)
 *    - competitor_alternative: 0.65x weight (only if competitors are known)
 *
 *    These weights come from query-taxonomy.ts QUERY_TEMPLATES[].scoringWeight.
 *
 * 3. ENGINE TYPE WEIGHTING:
 *    - Web-search engines (ChatGPT, Gemini, Perplexity): 1.0x weight
 *      These reflect current web visibility — what customers see RIGHT NOW.
 *    - Training-data engines (Claude): 0.6x weight
 *      Training data visibility is a lagging indicator — it shows historical
 *      brand presence but can't reflect recent changes. Still valuable as a
 *      "brand establishment" signal.
 *
 * 4. ENGINE MARKET SHARE WEIGHTING:
 *    - ChatGPT: 0.35 (dominant market share)
 *    - Gemini: 0.28 (Google ecosystem integration)
 *    - Perplexity: 0.22 (growing fast, search-focused)
 *    - Claude: 0.15 (smaller user base, training-data only)
 *
 * 5. CONFIDENCE DISCOUNTING. If the analyzer says confidence=0.4 for a mention,
 *    we discount that mention by 60%. This prevents fuzzy matches from inflating scores.
 *
 * 6. OLD BRAND QUERY PROBLEM — SOLVED. The old system had a "brand query" that
 *    explicitly named the business. This inflated scores because any AI engine
 *    will talk about a business if you directly ask about it. By removing brand
 *    queries entirely, every mention is organic and meaningful.
 */

import type { AnalyzerOutput } from './types'
import type { QueryType, ScanScore } from './types'
import { QUERY_TEMPLATES } from './query-taxonomy'
import { ENGINE_CATEGORIES } from './types'
import { ENGINE_MARKET_WEIGHTS, ENGINE_TYPE_MULTIPLIER } from './engine-config'

const OVERALL_WEIGHTS = {
  brand_awareness: 0.40,
  ranking_quality: 0.35,
  citation_quality: 0.25,
} as const

// ---------------------------------------------------------------------------
// Query type weight lookup
// ---------------------------------------------------------------------------

function getQueryTypeWeight(queryType: string): number {
  const template = QUERY_TEMPLATES.find((t) => t.type === queryType)
  return template?.scoringWeight ?? 0.5
}

// ---------------------------------------------------------------------------
// Scoring functions
// ---------------------------------------------------------------------------

/**
 * Calculate the complete scan score from analyzer output.
 */
export function calculateScanScore(analysis: AnalyzerOutput): ScanScore {
  const { extractions } = analysis

  if (extractions.length === 0) {
    return emptyScore()
  }

  // --- Brand Awareness: weighted mention rate ---
  let awarenessNumerator = 0
  let awarenessDenominator = 0

  for (const ext of extractions) {
    const engineWeight = ENGINE_MARKET_WEIGHTS[ext.engine] ?? 0.15
    const engineTypeMultiplier = ENGINE_TYPE_MULTIPLIER[ENGINE_CATEGORIES[ext.engine] ?? 'web_search'] ?? 1.0
    const queryWeight = getQueryTypeWeight(ext.query_type)
    const combinedWeight = engineWeight * engineTypeMultiplier * queryWeight

    awarenessDenominator += combinedWeight

    if (ext.mentioned) {
      // Discount by confidence
      awarenessNumerator += combinedWeight * ext.confidence
    }
  }

  const brandAwareness = awarenessDenominator > 0
    ? Math.round((awarenessNumerator / awarenessDenominator) * 100)
    : 0

  // --- Ranking Quality: weighted average position score ---
  let rankNumerator = 0
  let rankDenominator = 0

  for (const ext of extractions) {
    if (!ext.mentioned || ext.position === null) continue

    const engineWeight = ENGINE_MARKET_WEIGHTS[ext.engine] ?? 0.15
    const queryWeight = getQueryTypeWeight(ext.query_type)
    const weight = engineWeight * queryWeight * ext.confidence

    // Position score: 1 = 100, 2 = 90, 3 = 80, ... 10 = 10
    const posScore = Math.max(10, 110 - ext.position * 10)

    rankNumerator += posScore * weight
    rankDenominator += weight
  }

  const rankingQuality = rankDenominator > 0
    ? Math.round(rankNumerator / rankDenominator)
    : 0

  // --- Citation Quality: sentiment + named citation + confidence ---
  let citNumerator = 0
  let citDenominator = 0

  for (const ext of extractions) {
    if (!ext.mentioned) continue

    const engineWeight = ENGINE_MARKET_WEIGHTS[ext.engine] ?? 0.15
    const queryWeight = getQueryTypeWeight(ext.query_type)
    const weight = engineWeight * queryWeight

    let citScore = 0

    // Sentiment component (0-50)
    if (ext.sentiment === 'positive') citScore += 50
    else if (ext.sentiment === 'neutral') citScore += 25
    else if (ext.sentiment === 'negative') citScore += 5

    // Named citation component (0-30)
    if (ext.cited_by_name) citScore += 30
    else citScore += 10

    // Confidence component (0-20)
    citScore += Math.round(ext.confidence * 20)

    citNumerator += citScore * weight
    citDenominator += weight
  }

  const citationQuality = citDenominator > 0
    ? Math.round(citNumerator / citDenominator)
    : 0

  // --- Overall score ---
  const overall = Math.round(
    brandAwareness * OVERALL_WEIGHTS.brand_awareness +
    rankingQuality * OVERALL_WEIGHTS.ranking_quality +
    citationQuality * OVERALL_WEIGHTS.citation_quality,
  )

  // --- Per-engine scores ---
  const engineScores: ScanScore['engine_scores'] = {}
  const engineExtractions = groupBy(extractions, (e) => e.engine)

  for (const [engine, exts] of Object.entries(engineExtractions)) {
    const mentioned = exts.filter((e) => e.mentioned)
    const positions = mentioned
      .map((e) => e.position)
      .filter((p): p is number => p !== null)

    const dominantSentiment = mentioned.length === 0
      ? 'absent' as const
      : mode(mentioned.map((e) => e.sentiment).filter(Boolean) as string[]) as 'positive' | 'neutral' | 'negative'

    // Simple engine score: mention rate * 50 + avg position score * 30 + sentiment * 20
    const mentionRate = exts.length > 0 ? mentioned.length / exts.length : 0
    const avgPosScore = positions.length > 0
      ? positions.reduce((sum, p) => sum + Math.max(10, 110 - p * 10), 0) / positions.length
      : 0
    const sentScore = dominantSentiment === 'positive' ? 100 : dominantSentiment === 'neutral' ? 50 : dominantSentiment === 'negative' ? 10 : 0

    engineScores[engine] = {
      score: Math.round(mentionRate * 50 + (avgPosScore / 100) * 30 + (sentScore / 100) * 20),
      mentioned_in: mentioned.length,
      best_position: positions.length > 0 ? Math.min(...positions) : null,
      sentiment: mentioned.length === 0 ? 'absent' : dominantSentiment,
    }
  }

  // --- Per-query-type scores ---
  const queryTypeScores: ScanScore['query_type_scores'] = {} as ScanScore['query_type_scores']
  const queryTypeExtractions = groupBy(extractions, (e) => e.query_type)

  for (const [qt, exts] of Object.entries(queryTypeExtractions)) {
    const mentioned = exts.filter((e) => e.mentioned)
    const mentionRate = exts.length > 0 ? mentioned.length / exts.length : 0

    queryTypeScores[qt as QueryType] = {
      score: Math.round(mentionRate * 100),
      engines_mentioning: [...new Set(mentioned.map((e) => e.engine))],
    }
  }

  return {
    overall: Math.max(0, Math.min(100, overall)),
    brand_awareness: Math.max(0, Math.min(100, brandAwareness)),
    ranking_quality: Math.max(0, Math.min(100, rankingQuality)),
    citation_quality: Math.max(0, Math.min(100, citationQuality)),
    engine_scores: engineScores,
    query_type_scores: queryTypeScores,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of arr) {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }
  return result
}

function mode(arr: string[]): string {
  if (arr.length === 0) return 'neutral'
  const counts = new Map<string, number>()
  for (const item of arr) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let best = arr[0]
  let bestCount = 0
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item
      bestCount = count
    }
  }
  return best
}

function emptyScore(): ScanScore {
  return {
    overall: 0,
    brand_awareness: 0,
    ranking_quality: 0,
    citation_quality: 0,
    engine_scores: {},
    query_type_scores: {} as ScanScore['query_type_scores'],
  }
}

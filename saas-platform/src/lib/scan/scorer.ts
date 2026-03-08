import type { ParsedEngineResult } from './parser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EngineScore {
  engine: string
  mentionScore: number      // 0-100: 100 if mentioned, 0 if not
  positionScore: number     // 0-100: higher = better position
  sentimentScore: number    // 0-100: from parser
  citationScore: number     // 0-100: based on citation count
  competitorGap: number     // 0-100: fewer competitors = better
  engineTotal: number       // weighted composite for this engine
}

export interface CompositeScore {
  overallScore: number      // 0-100 final visibility score
  engineScores: EngineScore[]
  mentionRate: number       // 0-1 fraction of engines that mention
  averageSentiment: number  // 0-100
  averagePosition: number   // average position across mentioning engines (lower = better)
  breakdown: {
    mention: number         // weighted mention component
    position: number        // weighted position component
    sentiment: number       // weighted sentiment component
    citation: number        // weighted citation component
    coverage: number        // weighted coverage/competitor component
  }
}

// ---------------------------------------------------------------------------
// Weight configuration
// ---------------------------------------------------------------------------

/**
 * Weights for each scoring dimension. Must sum to 1.
 * Mention is the most important signal -- if an AI engine doesn't mention
 * the business at all, nothing else matters.
 */
const WEIGHTS = {
  mention: 0.35,
  position: 0.25,
  sentiment: 0.20,
  citation: 0.10,
  coverage: 0.10,
} as const

/**
 * Optional per-engine weights. Engines with larger market share
 * contribute more to the overall score.
 */
const ENGINE_WEIGHTS: Record<string, number> = {
  chatgpt: 0.35,
  gemini: 0.30,
  perplexity: 0.20,
  claude: 0.15,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate a composite visibility score (0-100) from parsed engine results.
 * Uses weighted average across dimensions and across engines.
 */
export function calculateCompositeScore(
  results: ParsedEngineResult[],
): CompositeScore {
  if (results.length === 0) {
    return emptyScore()
  }

  const engineScores = results.map(scoreEngine)
  const mentionedEngines = results.filter((r) => r.isMentioned)

  // Weighted average across engines
  let totalWeight = 0
  let weightedTotal = 0

  for (const es of engineScores) {
    const w = ENGINE_WEIGHTS[es.engine] ?? (1 / results.length)
    weightedTotal += es.engineTotal * w
    totalWeight += w
  }

  const overallScore = totalWeight > 0
    ? Math.round(weightedTotal / totalWeight)
    : 0

  const mentionRate = results.length > 0
    ? mentionedEngines.length / results.length
    : 0

  const averageSentiment = mentionedEngines.length > 0
    ? Math.round(
        mentionedEngines.reduce((sum, r) => sum + r.sentiment, 0) /
          mentionedEngines.length,
      )
    : 50

  const positions = mentionedEngines
    .map((r) => r.mentionPosition)
    .filter((p): p is number => p !== null)

  const averagePosition = positions.length > 0
    ? Math.round(
        (positions.reduce((sum, p) => sum + p, 0) / positions.length) * 10,
      ) / 10
    : 0

  // Breakdown: average of each dimension across engines (weighted)
  const breakdown = {
    mention: weightedAvg(engineScores, 'mentionScore'),
    position: weightedAvg(engineScores, 'positionScore'),
    sentiment: weightedAvg(engineScores, 'sentimentScore'),
    citation: weightedAvg(engineScores, 'citationScore'),
    coverage: weightedAvg(engineScores, 'competitorGap'),
  }

  return {
    overallScore,
    engineScores,
    mentionRate,
    averageSentiment,
    averagePosition,
    breakdown,
  }
}

// ---------------------------------------------------------------------------
// Per-engine scoring
// ---------------------------------------------------------------------------

function scoreEngine(result: ParsedEngineResult): EngineScore {
  const mentionScore = result.isMentioned ? 100 : 0

  // Position: 1 = best (100), 10+ = worst (10)
  const positionScore = result.mentionPosition !== null
    ? Math.max(10, 100 - (result.mentionPosition - 1) * 15)
    : 0

  const sentimentScore = result.sentiment

  // Citation: 0 = 0, 1 = 40, 2 = 60, 3+ = 80-100
  const citationCount = result.citationUrls.length
  const citationScore = citationCount === 0
    ? 0
    : Math.min(100, 20 + citationCount * 25)

  // Competitor gap: fewer competitors mentioned alongside = better for you
  const competitorCount = result.competitorNames.length
  const competitorGap = result.isMentioned
    ? Math.max(20, 100 - competitorCount * 12)
    : Math.max(0, 30 - competitorCount * 5)

  const engineTotal = Math.round(
    mentionScore * WEIGHTS.mention +
    positionScore * WEIGHTS.position +
    sentimentScore * WEIGHTS.sentiment +
    citationScore * WEIGHTS.citation +
    competitorGap * WEIGHTS.coverage,
  )

  return {
    engine: result.engine,
    mentionScore,
    positionScore,
    sentimentScore,
    citationScore,
    competitorGap,
    engineTotal,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function weightedAvg(
  scores: EngineScore[],
  field: keyof Omit<EngineScore, 'engine' | 'engineTotal'>,
): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const s of scores) {
    const w = ENGINE_WEIGHTS[s.engine] ?? (1 / scores.length)
    weightedSum += (s[field] as number) * w
    totalWeight += w
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
}

function emptyScore(): CompositeScore {
  return {
    overallScore: 0,
    engineScores: [],
    mentionRate: 0,
    averageSentiment: 50,
    averagePosition: 0,
    breakdown: {
      mention: 0,
      position: 0,
      sentiment: 0,
      citation: 0,
      coverage: 0,
    },
  }
}

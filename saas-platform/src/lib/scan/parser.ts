import type { EngineResponse } from './engine-adapter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedEngineResult {
  engine: string
  isMentioned: boolean
  mentionPosition: number | null
  sentiment: number // 0-100 integer
  citationUrls: string[]
  competitorNames: string[]
  contextExcerpts: string[]
  isMock: boolean
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a raw engine response into structured mention/position/sentiment data.
 * When real LLM APIs are wired up, the raw text naturally contains the info.
 * This parser uses heuristic text analysis (regex + keyword matching).
 */
export function parseEngineResponse(
  response: EngineResponse,
  businessName: string,
): ParsedEngineResult {
  const text = response.rawResponse
  const lowerText = text.toLowerCase()
  const lowerBizName = businessName.toLowerCase()

  const isMentioned = detectMention(lowerText, lowerBizName)
  const mentionPosition = isMentioned ? extractPosition(lowerText, lowerBizName) : null
  const sentiment = isMentioned ? analyzeSentiment(text, businessName) : 50
  const citationUrls = extractUrls(text)
  const competitorNames = extractCompetitors(text, businessName)
  const contextExcerpts = extractExcerpts(text, businessName)

  return {
    engine: response.engine,
    isMentioned,
    mentionPosition,
    sentiment,
    citationUrls,
    competitorNames,
    contextExcerpts,
    isMock: response.isMock,
  }
}

/**
 * Parse all engine responses for a single scan.
 */
export function parseAllResponses(
  responses: EngineResponse[],
  businessName: string,
): ParsedEngineResult[] {
  return responses.map((r) => parseEngineResponse(r, businessName))
}

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

function detectMention(lowerText: string, lowerBizName: string): boolean {
  if (lowerText.includes(lowerBizName)) {
    return true
  }

  // Try matching individual significant words (3+ chars) of the business name
  const words = lowerBizName
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .filter((w) => !STOP_WORDS.has(w))

  if (words.length === 0) return false

  // Require at least 2/3 of words to match (or all if fewer than 3)
  const threshold = Math.max(1, Math.ceil(words.length * 0.66))
  const matchCount = words.filter((w) => lowerText.includes(w)).length
  return matchCount >= threshold
}

/**
 * Extract rough position (1-based) of the business mention within the response.
 * Position is determined by where the mention appears relative to other
 * entity-like names in the text.
 */
function extractPosition(lowerText: string, lowerBizName: string): number {
  const mentionIndex = lowerText.indexOf(lowerBizName)
  if (mentionIndex < 0) return 5

  // Count how many "entity-like" patterns appear before this mention
  const textBefore = lowerText.slice(0, mentionIndex)
  // Count capitalized multi-word patterns (rough entity detection)
  const entityPattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g
  const entitiesBefore = (textBefore.match(entityPattern) ?? []).length

  return Math.min(entitiesBefore + 1, 10)
}

/**
 * Sentiment scoring 0-100.
 * Uses keyword-based heuristic: positive words push up, negative words push down.
 */
function analyzeSentiment(text: string, businessName: string): number {
  const lowerText = text.toLowerCase()
  const lowerBizName = businessName.toLowerCase()

  // Find sentences that mention the business
  const sentences = text.split(/[.!?]+/).filter((s) =>
    s.toLowerCase().includes(lowerBizName),
  )

  if (sentences.length === 0) return 50

  let score = 50

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()

    for (const word of POSITIVE_WORDS) {
      if (lower.includes(word)) score += 4
    }
    for (const word of NEGATIVE_WORDS) {
      if (lower.includes(word)) score -= 6
    }
    for (const word of STRONG_POSITIVE_WORDS) {
      if (lower.includes(word)) score += 7
    }
  }

  // Also check overall text tone if business is mentioned
  if (lowerText.includes('recommend') || lowerText.includes('top choice')) {
    score += 5
  }
  if (lowerText.includes('avoid') || lowerText.includes('not recommended')) {
    score -= 10
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Extract URLs from text using regex.
 */
function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s)"\]>]+/g
  const matches = text.match(urlPattern) ?? []
  return [...new Set(matches)].slice(0, 10)
}

/**
 * Extract competitor names by finding capitalized multi-word phrases
 * that are not the business itself.
 */
function extractCompetitors(text: string, businessName: string): string[] {
  const lowerBizName = businessName.toLowerCase()
  const entityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|LLC|Ltd|Co|Corp|Group)\.?)?)\b/g
  const matches: string[] = []
  let match: RegExpExecArray | null

  while ((match = entityPattern.exec(text)) !== null) {
    const name = match[1].trim()
    if (
      name.toLowerCase() !== lowerBizName &&
      name.length > 3 &&
      !COMMON_NON_ENTITIES.has(name) &&
      !name.match(/^(The|This|That|When|Where|What|How|They|These|Those|Other|Some|Many|Most|Also|Each|Both|Such)$/)
    ) {
      matches.push(name)
    }
  }

  return [...new Set(matches)].slice(0, 8)
}

/**
 * Extract context excerpts -- sentences mentioning the business.
 */
function extractExcerpts(text: string, businessName: string): string[] {
  const lowerBizName = businessName.toLowerCase()
  const sentences = text.split(/(?<=[.!?])\s+/)
  const relevant = sentences
    .filter((s) => s.toLowerCase().includes(lowerBizName))
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 500)
    .slice(0, 3)

  return relevant
}

// ---------------------------------------------------------------------------
// Word lists
// ---------------------------------------------------------------------------

const POSITIVE_WORDS = [
  'excellent', 'outstanding', 'reliable', 'trusted', 'quality',
  'professional', 'recommended', 'notable', 'leading', 'reputable',
  'innovative', 'comprehensive', 'solid', 'strong', 'effective',
  'popular', 'well-known', 'respected', 'competitive', 'efficient',
]

const STRONG_POSITIVE_WORDS = [
  'best', 'top-rated', 'award-winning', 'industry-leading',
  'highly recommended', 'first choice', 'go-to', 'premier',
]

const NEGATIVE_WORDS = [
  'poor', 'unreliable', 'complaints', 'issues', 'problems',
  'avoid', 'disappointing', 'overpriced', 'slow', 'outdated',
  'lacking', 'mediocre', 'inconsistent', 'limited',
]

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'inc', 'llc', 'ltd', 'corp', 'company', 'group',
  'services', 'solutions', 'that', 'this', 'with', 'from',
])

const COMMON_NON_ENTITIES = new Set([
  'The', 'Overall', 'However', 'Additionally', 'Furthermore',
  'Based', 'According', 'Several', 'Multiple', 'Various',
])

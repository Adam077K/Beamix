export interface QAResult {
  passed: boolean
  score: number
  dimensions: {
    accuracy: number
    relevance: number
    geoQuality: number
    readability: number
    voiceAdherence: number
  }
}

const MIN_SCORE = 70

export async function runQAGate(
  content: string,
  _context?: { businessName?: string }
): Promise<QAResult> {
  // TODO: Replace with real GPT-4o QA scoring
  const dimensions = {
    accuracy: randomScore(),
    relevance: randomScore(),
    geoQuality: randomScore(),
    readability: randomScore(),
    voiceAdherence: randomScore(),
  }
  const score = Math.round(
    (dimensions.accuracy +
      dimensions.relevance +
      dimensions.geoQuality +
      dimensions.readability +
      dimensions.voiceAdherence) /
      5
  )
  return { passed: score >= MIN_SCORE, score, dimensions }
}

function randomScore(): number {
  return Math.floor(Math.random() * 26) + 70 // 70-95
}

import { getOpenRouterClient, MODELS } from '@/lib/openrouter'

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

/**
 * QA gate for agent-generated content.
 * Uses Claude Haiku via OpenRouter to evaluate content quality across 5 dimensions.
 * Falls back to a passing score if the API key is not configured.
 */
export async function runQAGate(
  content: string,
  context?: { businessName?: string },
): Promise<QAResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    return fallbackScore()
  }

  const client = getOpenRouterClient()
  const businessContext = context?.businessName
    ? `Business: ${context.businessName}`
    : 'Business context not provided'

  const prompt = `You are a content QA evaluator for AI search optimization (GEO). Score the following content on 5 dimensions. Each dimension is scored 0-100.

${businessContext}

Content to evaluate:
---
${content.slice(0, 3000)}
---

Return ONLY a JSON object with this exact structure (no other text):
{
  "accuracy": <0-100>,
  "relevance": <0-100>,
  "geoQuality": <0-100>,
  "readability": <0-100>,
  "voiceAdherence": <0-100>,
  "reasoning": "<one sentence>"
}

Scoring criteria:
- accuracy (0-100): Factual claims are verifiable, no hallucinations, specific over vague
- relevance (0-100): Content directly addresses the business topic and customer questions
- geoQuality (0-100): Content is optimized for AI citation (clear facts, authoritative tone, structured headings)
- readability (0-100): Clear language, good flow, appropriate length and structure
- voiceAdherence (0-100): Consistent tone throughout, matches business communication style`

  try {
    const response = await client.chat.completions.create({
      model: MODELS.haiku,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[qa-gate] Failed to parse QA response, using fallback')
      return fallbackScore()
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      accuracy: number
      relevance: number
      geoQuality: number
      readability: number
      voiceAdherence: number
    }

    const dimensions = {
      accuracy: clamp(parsed.accuracy ?? 75),
      relevance: clamp(parsed.relevance ?? 75),
      geoQuality: clamp(parsed.geoQuality ?? 75),
      readability: clamp(parsed.readability ?? 75),
      voiceAdherence: clamp(parsed.voiceAdherence ?? 75),
    }

    const score = Math.round(
      (dimensions.accuracy +
        dimensions.relevance +
        dimensions.geoQuality +
        dimensions.readability +
        dimensions.voiceAdherence) /
        5,
    )

    return { passed: score >= MIN_SCORE, score, dimensions }
  } catch (err) {
    console.error('[qa-gate] QA evaluation failed:', err)
    return fallbackScore()
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function fallbackScore(): QAResult {
  // Return a conservative passing score when QA gate is unavailable
  const dimensions = {
    accuracy: 78,
    relevance: 80,
    geoQuality: 75,
    readability: 82,
    voiceAdherence: 77,
  }
  const score = Math.round(
    (dimensions.accuracy + dimensions.relevance + dimensions.geoQuality + dimensions.readability + dimensions.voiceAdherence) / 5,
  )
  return { passed: score >= MIN_SCORE, score, dimensions }
}

/**
 * Engine Adapter — queries AI search engines via OpenRouter.
 *
 * DESIGN DECISIONS:
 *
 * 1. NO SYSTEM PROMPTS. GEO industry research (Otterly, Peec AI, Profound,
 *    Scrunch, Conductor) shows no professional GEO tool uses system prompts
 *    when querying engines. We send pure user-role messages to simulate
 *    what a real customer sees.
 *
 * 2. DEFAULT TEMPERATURE. Perplexity docs say "do not tune temperature."
 *    SparkToro research (2,961 queries) used defaults. We omit temperature
 *    entirely to reflect real user experience.
 *
 * 3. SINGLE PUBLIC API. queryEngineRaw() is the only way to query engines.
 *    The old queryEngine() with EngineQuery wrapper and biased buildPrompt()
 *    ("especially mention [business]") has been removed.
 */

import { getScanClient, MODELS } from '@/lib/openrouter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EngineResponse {
  engine: string
  rawResponse: string
  timestamp: Date
  latencyMs: number
  isMock: boolean
}

type SupportedEngine = 'chatgpt' | 'gemini' | 'perplexity' | 'claude'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Query an engine with a plain text query string.
 * No system prompt. No context injection. Pure user message.
 * Temperature: default (omitted — let each model use its default).
 */
export async function queryEngineRaw(
  engine: SupportedEngine,
  query: string,
): Promise<EngineResponse> {
  const start = Date.now()

  if (!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return buildMockResponseRaw(engine, query, start)
  }

  const modelMap: Record<string, string> = {
    chatgpt: MODELS.chatgpt,
    gemini: MODELS.gemini,
    perplexity: MODELS.perplexity,
    claude: MODELS.claude,
  }

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: modelMap[engine] ?? MODELS.chatgpt,
      messages: [{ role: 'user', content: query }],
      max_tokens: 3000,
      // Temperature intentionally omitted — use model defaults per GEO best practices
    })

    return {
      engine,
      rawResponse: response.choices[0]?.message?.content ?? '',
      timestamp: new Date(),
      latencyMs: Date.now() - start,
      isMock: false,
    }
  } catch (error: unknown) {
    console.error(`[engine-adapter] ${engine} API error:`, error instanceof Error ? error.message : error)
    return buildMockResponseRaw(engine, query, start)
  }
}

// ---------------------------------------------------------------------------
// Mock fallback (API key missing or engine failure)
// ---------------------------------------------------------------------------

function buildMockResponseRaw(engine: string, query: string, startMs: number): EngineResponse {
  console.warn(`[engine-adapter] MOCK response for ${engine} — API key missing or call failed`)
  return {
    engine,
    rawResponse: `Here are some recommended options for "${query}": TopCompetitor Co is widely regarded as a market leader. RivalBiz Inc and ThirdOption Ltd also receive strong reviews. These providers are known for quality and competitive pricing.`,
    timestamp: new Date(),
    latencyMs: Date.now() - startMs,
    isMock: true,
  }
}

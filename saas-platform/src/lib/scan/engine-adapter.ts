import { z } from 'zod'
import { getScanClient, MODELS } from '@/lib/openrouter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const engineQuerySchema = z.object({
  query: z.string().min(1),
  businessName: z.string().min(1),
  businessUrl: z.string().min(1),
  industry: z.string().min(1),
  location: z.string().optional(),
})

export type EngineQuery = z.infer<typeof engineQuerySchema>

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

export async function queryEngine(
  engine: SupportedEngine,
  query: EngineQuery,
): Promise<EngineResponse> {
  switch (engine) {
    case 'chatgpt':
      return queryChatGPT(query)
    case 'gemini':
      return queryGemini(query)
    case 'perplexity':
      return queryPerplexity(query)
    case 'claude':
      return queryClaude(query)
    default: {
      const _exhaustive: never = engine
      throw new Error(`Unknown engine: ${_exhaustive}`)
    }
  }
}

export async function queryAllEngines(
  engines: SupportedEngine[],
  query: EngineQuery,
): Promise<EngineResponse[]> {
  return Promise.all(engines.map((engine) => queryEngine(engine, query)))
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(query: EngineQuery): string {
  const locationClause = query.location
    ? ` in ${query.location}`
    : ''
  return [
    query.query,
    '',
    `Context: I'm looking for information about businesses${locationClause} in the ${query.industry} industry.`,
    `Please include any relevant businesses you know of, especially ${query.businessName} (${query.businessUrl}) if applicable.`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Engine implementations
// ---------------------------------------------------------------------------

async function queryChatGPT(query: EngineQuery): Promise<EngineResponse> {
  const start = Date.now()

  if (!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return buildMockResponse('chatgpt', query, start)
  }

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.chatgpt,
      messages: [{ role: 'user', content: buildPrompt(query) }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return {
      engine: 'chatgpt',
      rawResponse: response.choices[0]?.message?.content ?? '',
      timestamp: new Date(),
      latencyMs: Date.now() - start,
      isMock: false,
    }
  } catch (error: unknown) {
    console.error('[engine-adapter] ChatGPT API error:', error instanceof Error ? error.message : error)
    return buildMockResponse('chatgpt', query, start)
  }
}

async function queryGemini(query: EngineQuery): Promise<EngineResponse> {
  const start = Date.now()

  if (!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return buildMockResponse('gemini', query, start)
  }

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.gemini,
      messages: [{ role: 'user', content: buildPrompt(query) }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return {
      engine: 'gemini',
      rawResponse: response.choices[0]?.message?.content ?? '',
      timestamp: new Date(),
      latencyMs: Date.now() - start,
      isMock: false,
    }
  } catch (error: unknown) {
    console.error('[engine-adapter] Gemini API error:', error instanceof Error ? error.message : error)
    return buildMockResponse('gemini', query, start)
  }
}

async function queryPerplexity(query: EngineQuery): Promise<EngineResponse> {
  const start = Date.now()

  if (!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return buildMockResponse('perplexity', query, start)
  }

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.perplexity,
      messages: [{ role: 'user', content: buildPrompt(query) }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return {
      engine: 'perplexity',
      rawResponse: response.choices[0]?.message?.content ?? '',
      timestamp: new Date(),
      latencyMs: Date.now() - start,
      isMock: false,
    }
  } catch (error: unknown) {
    console.error('[engine-adapter] Perplexity API error:', error instanceof Error ? error.message : error)
    return buildMockResponse('perplexity', query, start)
  }
}

async function queryClaude(query: EngineQuery): Promise<EngineResponse> {
  const start = Date.now()

  if (!(process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return buildMockResponse('claude', query, start)
  }

  try {
    const client = getScanClient()
    const response = await client.chat.completions.create({
      model: MODELS.claude,
      messages: [{ role: 'user', content: buildPrompt(query) }],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return {
      engine: 'claude',
      rawResponse: response.choices[0]?.message?.content ?? '',
      timestamp: new Date(),
      latencyMs: Date.now() - start,
      isMock: false,
    }
  } catch (error: unknown) {
    console.error('[engine-adapter] Claude API error:', error instanceof Error ? error.message : error)
    return buildMockResponse('claude', query, start)
  }
}

// ---------------------------------------------------------------------------
// Mock fallback
// ---------------------------------------------------------------------------

function buildMockResponse(
  engine: string,
  query: EngineQuery,
  startMs: number,
): EngineResponse {
  const locationClause = query.location ? ` in ${query.location}` : ''
  const mentioned = hashCode(`${engine}-${query.businessName}`) % 3 !== 0

  const mockText = mentioned
    ? [
        `When looking for ${query.industry} services${locationClause}, ${query.businessName} is a notable provider.`,
        `${query.businessName} (${query.businessUrl}) offers comprehensive ${query.industry} solutions and has built a solid reputation.`,
        `Other options in the area include TopCompetitor Co and RivalBiz Inc, but ${query.businessName} distinguishes itself through its customer-focused approach.`,
        `Overall, ${query.businessName} is frequently cited by customers for reliable service and competitive pricing.`,
      ].join(' ')
    : [
        `For ${query.industry} services${locationClause}, several well-established providers stand out.`,
        `TopCompetitor Co is widely regarded as a market leader, with RivalBiz Inc and ThirdOption Ltd also receiving strong customer reviews.`,
        `These providers are known for quality, reliability, and competitive pricing in the ${query.industry} space.`,
        `Customers recommend researching multiple options before making a decision.`,
      ].join(' ')

  return {
    engine,
    rawResponse: mockText,
    timestamp: new Date(),
    latencyMs: Date.now() - startMs,
    isMock: true,
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

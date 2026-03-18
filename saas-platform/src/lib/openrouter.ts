/**
 * OpenRouter unified LLM client.
 * Single API key → access to OpenAI, Anthropic, Google, Perplexity models.
 * Uses the OpenAI SDK with OpenRouter's base URL.
 */

import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenRouterClient(): OpenAI {
  if (_client) return _client

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  _client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io',
      'X-Title': 'Beamix',
    },
  })

  return _client
}

/**
 * Model mapping — OpenRouter model IDs.
 * Update these when switching models or providers.
 */
export const MODELS = {
  // Scan engines — fast, cheap models for querying
  chatgpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.0-flash-001',
  perplexity: 'perplexity/sonar-pro',
  claude: 'anthropic/claude-sonnet-4',

  // Agent execution — capable model for content generation
  agentExecution: 'anthropic/claude-sonnet-4',

  // QA gate + recommendations — fast, cheap model
  haiku: 'anthropic/claude-haiku-4',
} as const

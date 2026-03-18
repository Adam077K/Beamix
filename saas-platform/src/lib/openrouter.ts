/**
 * OpenRouter unified LLM client.
 * Two API keys for cost tracking:
 *   OPENROUTER_SCAN_KEY  — engine scans (frequent, cheap)
 *   OPENROUTER_AGENT_KEY — agent execution, QA, recommendations (fewer, pricier)
 *
 * Falls back to OPENROUTER_API_KEY if split keys aren't set.
 */

import OpenAI from 'openai'

const _clients: Record<string, OpenAI> = {}

function buildClient(apiKey: string): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://beamix.io',
      'X-Title': 'Beamix',
    },
  })
}

function getClient(envKey: string): OpenAI {
  if (_clients[envKey]) return _clients[envKey]

  // Try the specific key first, fall back to the shared key
  const apiKey = process.env[envKey] ?? process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(`${envKey} (or OPENROUTER_API_KEY fallback) is not configured`)
  }

  _clients[envKey] = buildClient(apiKey)
  return _clients[envKey]
}

/** Client for AI engine scans (ChatGPT, Gemini, Perplexity, Claude queries) */
export function getScanClient(): OpenAI {
  return getClient('OPENROUTER_SCAN_KEY')
}

/** Client for agent work (content generation, QA gate, recommendations) */
export function getAgentClient(): OpenAI {
  return getClient('OPENROUTER_AGENT_KEY')
}

/** Check if OpenRouter is configured (for mock fallback decisions) */
export function isOpenRouterConfigured(): boolean {
  return !!(
    process.env.OPENROUTER_SCAN_KEY ??
    process.env.OPENROUTER_AGENT_KEY ??
    process.env.OPENROUTER_API_KEY
  )
}

/**
 * Model mapping — OpenRouter model IDs.
 * Change models here, nowhere else.
 */
export const MODELS = {
  // Scan engines
  chatgpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.0-flash-001',
  perplexity: 'perplexity/sonar-pro',
  claude: 'anthropic/claude-sonnet-4',

  // Agent execution — capable model for content generation
  agentExecution: 'anthropic/claude-sonnet-4',

  // QA gate + recommendations — fast, cheap model
  haiku: 'anthropic/claude-haiku-4',
} as const

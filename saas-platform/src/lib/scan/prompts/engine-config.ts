/**
 * Engine Configuration — classification and model mapping for scan engines.
 *
 * DESIGN DECISIONS:
 *
 * 1. NO SYSTEM PROMPTS FOR ENGINE QUERIES.
 *    GEO industry research (Otterly, Peec AI, Profound, Scrunch, Conductor)
 *    shows NO professional GEO tool uses system prompts when querying engines.
 *    System prompts change model behavior and invalidate the measurement.
 *    We send PURE user-role messages to simulate what a real customer sees.
 *
 * 2. ENGINE CATEGORIES. Two types:
 *    - web_search: ChatGPT (:online), Gemini (:online), Perplexity — access live web data
 *    - training_data: Claude — knowledge from training corpus only, no web search
 *    This distinction affects scoring (training_data gets 0.6x weight) but NOT
 *    the query format (both get plain user messages, no system prompt).
 *
 * 3. DEFAULT TEMPERATURE.
 *    Perplexity docs explicitly say "do not tune temperature."
 *    SparkToro research (2,961 queries) used default settings.
 *    We omit temperature entirely to reflect real user experience.
 */

import type { EngineCategory } from './types'
import { ENGINE_CATEGORIES } from './types'

// ---------------------------------------------------------------------------
// Engine category lookup
// ---------------------------------------------------------------------------

/**
 * Get the category of an engine (web_search or training_data).
 * Used by the scorer to apply engine type multipliers.
 */
export function getEngineCategory(engine: string): EngineCategory {
  return ENGINE_CATEGORIES[engine] ?? 'web_search'
}

/**
 * Check if an engine has web search capability.
 */
export function isWebSearchEngine(engine: string): boolean {
  return getEngineCategory(engine) === 'web_search'
}

// ---------------------------------------------------------------------------
// Engine model mapping (for reference — actual model IDs live in openrouter.ts)
// ---------------------------------------------------------------------------

/**
 * Documentation of which OpenRouter models each engine maps to.
 * The actual model IDs are in src/lib/openrouter.ts MODELS constant.
 * This is here for reference so the scan module is self-documenting.
 */
export const ENGINE_MODEL_REFERENCE = {
  chatgpt: 'openai/gpt-4o-mini:online',     // Web search via :online suffix
  gemini: 'google/gemini-2.0-flash-001:online', // Web search via :online suffix
  perplexity: 'perplexity/sonar-pro',        // Native web search
  claude: 'anthropic/claude-sonnet-4',       // Training data only, no web search
} as const

/**
 * Engine market share weights for scoring.
 * ChatGPT has the largest user base, followed by Gemini (Google ecosystem),
 * Perplexity (growing fast, search-focused), and Claude (smaller base).
 */
export const ENGINE_MARKET_WEIGHTS: Record<string, number> = {
  chatgpt: 0.35,
  gemini: 0.28,
  perplexity: 0.22,
  claude: 0.15,
} as const

/**
 * Engine type scoring multiplier.
 * Web search engines reflect CURRENT visibility (what users see right now).
 * Training data engines reflect HISTORICAL visibility (brand is in training corpus).
 * Training data is a lagging indicator, so it gets 0.6x weight.
 */
export const ENGINE_TYPE_MULTIPLIER: Record<EngineCategory, number> = {
  web_search: 1.0,
  training_data: 0.6,
} as const

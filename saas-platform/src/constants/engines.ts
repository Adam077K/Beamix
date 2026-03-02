import type { LLMEngine } from '@/lib/types'
import type { LlmProvider } from '@/lib/types/database.types'

/** Human-readable labels for free-scan LLM engines */
export const ENGINE_LABELS: Record<LLMEngine, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
}

/** Human-readable labels for all LLM providers (including authenticated scan providers) */
export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  google_ai_overviews: 'Google AI',
}

/** Badge color classes per LLM provider */
export const PROVIDER_COLORS: Record<LlmProvider, string> = {
  chatgpt: 'bg-green-100 text-green-700',
  gemini: 'bg-blue-100 text-blue-700',
  perplexity: 'bg-purple-100 text-purple-700',
  claude: 'bg-orange-100 text-orange-700',
  google_ai_overviews: 'bg-red-100 text-red-700',
}

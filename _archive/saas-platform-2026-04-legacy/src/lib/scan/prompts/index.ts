// Scan prompts module — unified prompting architecture for AI visibility scanning
//
// Usage:
//   import { QUERY_TEMPLATES, buildResearchPrompt, buildAnalyzerPrompt, calculateScanScore } from '@/lib/scan/prompts'

// Types and schemas
export type {
  QueryType,
  QueryTemplate,
  EngineCategory,
  BusinessResearchOutput,
  GeneratedQuery,
  AnalyzerOutput,
  ScanScore,
} from './types'

export {
  ENGINE_CATEGORIES,
  businessResearchSchema,
  engineExtractionSchema,
  crossEngineSynthesisSchema,
  analyzerOutputSchema,
} from './types'

// Engine configuration (NO system prompts — per GEO industry research)
export {
  getEngineCategory,
  isWebSearchEngine,
  ENGINE_MARKET_WEIGHTS,
  ENGINE_TYPE_MULTIPLIER,
  ENGINE_MODEL_REFERENCE,
} from './engine-config'

// Query taxonomy — 7 query types, tier gating, template interpolation
export {
  QUERY_TEMPLATES,
  QUERIES_PER_ENGINE_PER_TIER,
  interpolateTemplate,
  getQueryTemplatesForTier,
  getEngineQueryTypes,
} from './query-taxonomy'

// Research prompt (Perplexity) + sanitization
export { buildResearchPrompt, parseResearchResponse, sanitizeForPrompt } from './research-prompt'

// Query generation (template mode + LLM mode)
export {
  generateTemplateQueries,
  buildQueryGeneratorPrompt,
  parseGeneratedQueries,
  getAllQueryTypesForTier,
} from './query-generator-prompt'

// Analyzer prompt (Gemini Flash)
export { buildAnalyzerPrompt, ANALYZER_SYSTEM_PROMPT } from './analyzer-prompt'
export type { AnalyzerInput } from './analyzer-prompt'

// Scoring (3-dimensional: brand awareness + ranking quality + citation quality)
export { calculateScanScore } from './scoring'

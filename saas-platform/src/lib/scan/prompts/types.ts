/**
 * Shared types for the scan prompting architecture.
 *
 * All prompt functions produce string prompts. All analyzer outputs
 * are validated with Zod schemas. This file defines the contracts.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Query taxonomy
// ---------------------------------------------------------------------------

export type QueryType =
  | 'category_ranking'
  | 'service_specific'
  | 'problem_solution'
  | 'local_comparison'
  | 'industry_authority'
  | 'use_case_recommendation'
  | 'competitor_alternative'

export interface QueryTemplate {
  type: QueryType
  purpose: string
  template: string
  /** Which tiers include this query type */
  tiers: ('free' | 'starter' | 'pro' | 'business')[]
  /** Weight in scoring: how much does a mention in this query type matter? */
  scoringWeight: number
}

// ---------------------------------------------------------------------------
// Engine classification
// ---------------------------------------------------------------------------

export type EngineCategory = 'web_search' | 'training_data'

export const ENGINE_CATEGORIES: Record<string, EngineCategory> = {
  chatgpt: 'web_search',
  gemini: 'web_search',
  perplexity: 'web_search',
  claude: 'training_data',
} as const

// ---------------------------------------------------------------------------
// Business research output
// ---------------------------------------------------------------------------

export const businessResearchSchema = z.object({
  industry: z.string().describe('Standardized 2-4 word industry category'),
  geographic_market: z.string().describe('City, region, or "Global"'),
  primary_services: z.array(z.string()).min(1).max(8).describe('Main services offered'),
  target_customer_type: z.string().describe('Who buys from them'),
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string().optional(),
    overlap: z.enum(['direct', 'partial', 'adjacent']),
  })).max(8),
  differentiators: z.array(z.string()).max(5).describe('What makes them unique'),
  customer_search_queries: z.array(z.string()).min(3).max(8).describe('Real queries customers would type'),
})

export type BusinessResearchOutput = z.infer<typeof businessResearchSchema>

// ---------------------------------------------------------------------------
// Generated query
// ---------------------------------------------------------------------------

export interface GeneratedQuery {
  text: string
  type: QueryType
  /** Which business context was interpolated */
  interpolated_fields: string[]
}

// ---------------------------------------------------------------------------
// Analyzer output schemas
// ---------------------------------------------------------------------------

export const engineExtractionSchema = z.object({
  engine: z.string(),
  query_type: z.string(),
  query_text: z.string(),
  mentioned: z.boolean(),
  cited_by_name: z.boolean().describe('Was the exact business name used, not just described?'),
  position: z.number().nullable().describe('Numeric rank if in a list, else null'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).nullable(),
  exact_quote: z.string().nullable().describe('Verbatim mention text, max 250 chars'),
  confidence: z.number().min(0).max(1).describe('How confident is the extraction? 0.0-1.0'),
  competitors_around: z.array(z.object({
    name: z.string(),
    position: z.number().nullable(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).nullable(),
  })).max(10),
})

export const crossEngineSynthesisSchema = z.object({
  overall_mention_rate: z.number().min(0).max(1).describe('Fraction of engine+query combos that mention the business'),
  best_position: z.number().nullable(),
  worst_position: z.number().nullable(),
  dominant_sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
  competitors: z.array(z.object({
    name: z.string(),
    frequency: z.number().describe('How many engine+query combos mention this competitor'),
    best_position: z.number().nullable(),
    engines_present: z.array(z.string()),
  })).max(12),
  citation_urls: z.array(z.string()),
  brand_attributes: z.object({
    associated_qualities: z.array(z.string()),
    missing_qualities: z.array(z.string()),
    competitor_advantages: z.array(z.object({
      competitor: z.string(),
      advantage: z.string(),
    })),
  }),
})

export const analyzerOutputSchema = z.object({
  extractions: z.array(engineExtractionSchema),
  synthesis: crossEngineSynthesisSchema,
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    based_on: z.string().describe('Which specific scan finding triggered this recommendation'),
  })).min(3).max(6),
  visibility_summary: z.string(),
})

export type AnalyzerOutput = z.infer<typeof analyzerOutputSchema>

// ---------------------------------------------------------------------------
// Scoring output
// ---------------------------------------------------------------------------

export interface ScanScore {
  /** 0-100 overall visibility score */
  overall: number
  /** Sub-scores */
  brand_awareness: number    // 0-100: are you known at all?
  ranking_quality: number    // 0-100: where do you appear?
  citation_quality: number   // 0-100: how are you described?
  /** Per-engine breakdown */
  engine_scores: Record<string, {
    score: number
    mentioned_in: number   // how many queries
    best_position: number | null
    sentiment: 'positive' | 'neutral' | 'negative' | 'absent'
  }>
  /** Per-query-type breakdown */
  query_type_scores: Record<QueryType, {
    score: number
    engines_mentioning: string[]
  }>
}

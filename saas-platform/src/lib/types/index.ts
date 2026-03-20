export type ScanStatus = 'processing' | 'completed' | 'failed'
/** Paid plan tiers (matches DB enum). Free tier = null in DB. */
export type PlanTier = 'starter' | 'pro' | 'business'
export type LLMEngine = 'chatgpt' | 'gemini' | 'perplexity' | 'claude'
export type AgentType =
  | 'content_writer'
  | 'blog_writer'
  | 'faq_agent'
  | 'review_analyzer'
  | 'schema_optimizer'
  | 'social_strategy'
  | 'competitor_intelligence'
export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'failed'
export type RecommendationImpact = 'high' | 'medium' | 'low'

export interface EngineResult {
  engine: LLMEngine
  is_mentioned: boolean
  mention_position: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  competitors_mentioned: string[]
  response_snippet: string
}

export interface QuickWin {
  title: string
  description: string
  impact: RecommendationImpact
  engine_benefit?: string
}

export interface ScanResults {
  visibility_score: number
  engines: EngineResult[]
  top_competitor: string
  top_competitor_score: number
  quick_wins: QuickWin[]
  rank: number
  total_businesses: number
  leaderboard: LeaderboardEntry[]
  /** The actual queries sent to AI engines (shown on results page) */
  queries_used?: string[]
  /** One-sentence AI visibility summary from the analyzer */
  visibility_summary?: string
  /** How we understood the business (from website scrape + Perplexity research) */
  business_context?: {
    detected_industry: string
    description: string
    services: string[]
    website_title?: string | null
    website_description?: string | null
  }
  /** Per-query breakdown: which engines found you for which query */
  per_query_breakdown?: Array<{
    query: string
    query_type: 'category' | 'brand' | 'authority'
    engines_mentioning: string[]
    engines_not_mentioning: string[]
    competitor_highlights: Array<{ name: string; praised_for: string }>
    user_finding: string | null
  }>
  /** Brand attributes extracted from engine responses */
  brand_attributes?: {
    associated_qualities: string[]
    missing_qualities: string[]
    competitor_advantages: Array<{ competitor: string; advantage: string }>
  }
  /** Share of Voice: your mentions / total mentions as percentage */
  share_of_voice?: number
  /** Citation URLs found in engine responses */
  citation_urls?: string[]
}

export interface LeaderboardEntry {
  name: string
  score: number
  rank: number
  is_user: boolean
}

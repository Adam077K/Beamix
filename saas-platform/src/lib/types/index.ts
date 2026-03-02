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
}

export interface LeaderboardEntry {
  name: string
  score: number
  rank: number
  is_user: boolean
}

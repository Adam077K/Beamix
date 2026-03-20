import type { Database } from '@/lib/types/database.types'

type AgentType = Database['public']['Tables']['agent_jobs']['Row']['agent_type']
type ContentFormat = Database['public']['Tables']['content_items']['Row']['content_format']
type PlanTier = Database['public']['Enums']['plan_tier']

export interface AgentConfig {
  name: string
  /** Cost in AI Runs. 0 = unlimited (no credit deduction). */
  cost: number
  /** Whether this agent is unlimited (no credit cost) on the user's plan */
  isUnlimited: boolean
  minPlan: PlanTier
  icon: string
  /** DB agent_type value */
  dbType: AgentType
  /** Whether this agent produces content items */
  producesContent: boolean
  /** Content format for content_items */
  contentFormat?: ContentFormat
  /** Short description for UI */
  description: string
}

/**
 * Agent configuration keyed by URL slug (kebab-case).
 * Maps to DB agent_type (underscore) via `dbType`.
 *
 * Pricing model: "Unlimited Basic + AI Runs"
 * - Unlimited agents (FAQ, Schema, Review): cost = 0, daily rate limit applies
 * - Premium agents (Content, Blog, Competitor, Social): cost = 1 AI Run each
 */
export const AGENT_CONFIG: Record<string, AgentConfig> = {
  'content-writer': {
    name: 'Content Writer',
    cost: 1,
    isUnlimited: false,
    minPlan: 'starter',
    icon: 'FileText',
    dbType: 'content_writer',
    producesContent: true,
    contentFormat: 'markdown',
    description: 'Write AI-optimized content that gets cited by search engines',
  },
  'blog-writer': {
    name: 'Blog Writer',
    cost: 1,
    isUnlimited: false,
    minPlan: 'starter',
    icon: 'BookOpen',
    dbType: 'blog_writer',
    producesContent: true,
    contentFormat: 'markdown',
    description: 'Create authority blog posts that boost your AI visibility',
  },
  'review-analyzer': {
    name: 'Review Analyzer',
    cost: 0,
    isUnlimited: true,
    minPlan: 'starter',
    icon: 'MessageSquare',
    dbType: 'review_analyzer',
    producesContent: false,
    description: 'Analyze your online reputation and get actionable insights',
  },
  'schema-optimizer': {
    name: 'Schema Optimizer',
    cost: 0,
    isUnlimited: true,
    minPlan: 'starter',
    icon: 'Code',
    dbType: 'schema_optimizer',
    producesContent: true,
    contentFormat: 'json_ld',
    description: 'Generate structured data markup for better AI engine visibility',
  },
  'social-strategy': {
    name: 'Social Strategy',
    cost: 1,
    isUnlimited: false,
    minPlan: 'pro',
    icon: 'Share2',
    dbType: 'social_strategy',
    producesContent: false,
    description: 'Build a social media strategy that increases AI citation signals',
  },
  'competitor-intelligence': {
    name: 'Competitor Intelligence',
    cost: 1,
    isUnlimited: false,
    minPlan: 'pro',
    icon: 'Search',
    dbType: 'competitor_intelligence',
    producesContent: false,
    description: 'Analyze competitor positioning and find strategic gaps',
  },
  'faq-agent': {
    name: 'FAQ Agent',
    cost: 0,
    isUnlimited: true,
    minPlan: 'starter',
    icon: 'TrendingUp',
    dbType: 'faq_agent',
    producesContent: true,
    contentFormat: 'markdown',
    description: 'Generate FAQ content that AI engines love to cite',
  },
} as const

/** Map DB agent_type to URL slug */
export function agentTypeToSlug(dbType: string): string | undefined {
  for (const [slug, config] of Object.entries(AGENT_CONFIG)) {
    if (config.dbType === dbType) return slug
  }
  return undefined
}

/** Plan tier ordering for comparison */
const PLAN_ORDER: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
}

export function isPlanSufficient(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_ORDER[userPlan] ?? 0) >= (PLAN_ORDER[requiredPlan] ?? 0)
}

/**
 * Daily rate limits for unlimited agents (prevents abuse).
 * Premium agents (cost > 0) are limited by AI Runs allocation instead.
 */
export const UNLIMITED_DAILY_LIMITS: Record<string, number> = {
  starter: 10,
  pro: 25,
  business: 100,
}

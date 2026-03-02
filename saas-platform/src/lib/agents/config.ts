import type { Database } from '@/lib/types/database.types'

type AgentType = Database['public']['Tables']['agent_jobs']['Row']['agent_type']
type ContentFormat = Database['public']['Tables']['content_items']['Row']['content_format']
type PlanTier = Database['public']['Enums']['plan_tier']

export interface AgentConfig {
  name: string
  cost: number
  minPlan: PlanTier
  icon: string
  /** DB agent_type value */
  dbType: AgentType
  /** Whether this agent produces content items */
  producesContent: boolean
  /** Content format for content_items */
  contentFormat?: ContentFormat
}

/**
 * Agent configuration keyed by URL slug (kebab-case).
 * Maps to DB agent_type (underscore) via `dbType`.
 */
export const AGENT_CONFIG: Record<string, AgentConfig> = {
  'content-writer': {
    name: 'Content Writer',
    cost: 3,
    minPlan: 'starter',
    icon: 'FileText',
    dbType: 'content_writer',
    producesContent: true,
    contentFormat: 'markdown',
  },
  'blog-writer': {
    name: 'Blog Writer',
    cost: 5,
    minPlan: 'starter',
    icon: 'BookOpen',
    dbType: 'blog_writer',
    producesContent: true,
    contentFormat: 'markdown',
  },
  'review-analyzer': {
    name: 'Review Analyzer',
    cost: 2,
    minPlan: 'starter',
    icon: 'MessageSquare',
    dbType: 'review_analyzer',
    producesContent: false,
  },
  'schema-optimizer': {
    name: 'Schema Optimizer',
    cost: 2,
    minPlan: 'starter',
    icon: 'Code',
    dbType: 'schema_optimizer',
    producesContent: true,
    contentFormat: 'json_ld',
  },
  'social-strategy': {
    name: 'Social Strategy',
    cost: 3,
    minPlan: 'pro',
    icon: 'Share2',
    dbType: 'social_strategy',
    producesContent: false,
  },
  'competitor-intelligence': {
    name: 'Competitor Intelligence',
    cost: 4,
    minPlan: 'pro',
    icon: 'Search',
    dbType: 'competitor_intelligence',
    producesContent: false,
  },
  'faq-agent': {
    name: 'FAQ Agent',
    cost: 2,
    minPlan: 'starter',
    icon: 'TrendingUp',
    dbType: 'faq_agent',
    producesContent: true,
    contentFormat: 'markdown',
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

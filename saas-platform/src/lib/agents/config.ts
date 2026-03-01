import type { Database } from '@/lib/types/database.types'

type AgentExecutionType = Database['public']['Tables']['agent_executions']['Row']['agent_type']
type ContentType = Database['public']['Tables']['content_generations']['Row']['content_type']
type AgentOutputType = Database['public']['Tables']['agent_outputs']['Row']['output_type']
type PlanTier = Database['public']['Tables']['subscriptions']['Row']['plan_tier']

export interface AgentConfig {
  name: string
  cost: number
  minPlan: PlanTier
  icon: string
  /** DB agent_type value */
  dbType: AgentExecutionType
  /** If this agent produces content, which content_type to use */
  contentType?: ContentType
  /** If this agent produces structured output, which output_type to use */
  outputType?: AgentOutputType
  /** Content format for content_generations */
  contentFormat?: 'markdown' | 'html' | 'json' | 'json-ld'
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
    contentType: 'landing_page',
    contentFormat: 'markdown',
  },
  'blog-writer': {
    name: 'Blog Writer',
    cost: 5,
    minPlan: 'starter',
    icon: 'BookOpen',
    dbType: 'blog_writer',
    contentType: 'blog_post',
    contentFormat: 'markdown',
  },
  'review-analyzer': {
    name: 'Review Analyzer',
    cost: 2,
    minPlan: 'starter',
    icon: 'MessageSquare',
    dbType: 'review_analyzer',
    outputType: 'review_analysis',
  },
  'schema-optimizer': {
    name: 'Schema Optimizer',
    cost: 2,
    minPlan: 'starter',
    icon: 'Code',
    dbType: 'schema_optimizer',
    contentType: 'schema_markup',
    contentFormat: 'json-ld',
  },
  'social-strategy': {
    name: 'Social Strategy',
    cost: 3,
    minPlan: 'pro',
    icon: 'Share2',
    dbType: 'social_strategy',
    outputType: 'social_strategy',
  },
  'competitor-research': {
    name: 'Competitor Research',
    cost: 4,
    minPlan: 'pro',
    icon: 'Search',
    dbType: 'competitor_research',
    outputType: 'competitor_report',
  },
  'query-researcher': {
    name: 'Query Researcher',
    cost: 2,
    minPlan: 'starter',
    icon: 'TrendingUp',
    dbType: 'query_researcher',
    outputType: 'query_suggestions',
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
  enterprise: 3,
}

export function isPlanSufficient(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_ORDER[userPlan] ?? 0) >= (PLAN_ORDER[requiredPlan] ?? 0)
}

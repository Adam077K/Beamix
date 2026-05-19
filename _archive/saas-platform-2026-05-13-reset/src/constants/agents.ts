/**
 * agents.ts — Central agent label map for the Beamix product UI.
 *
 * Single source of truth for human-readable agent names.
 * Import agentTypeLabel() wherever agent_type is rendered to the user.
 * Never leak snake_case identifiers into the UI.
 */

// ─── AgentType ────────────────────────────────────────────────────────────────

export type AgentType =
  | 'query_mapper'
  | 'content_optimizer'
  | 'freshness_agent'
  | 'faq_builder'
  | 'schema_generator'
  | 'offsite_presence_builder'
  | 'review_presence_planner'
  | 'entity_builder'
  | 'authority_blog_strategist'
  | 'performance_tracker'
  | 'reddit_presence_planner'
  | 'video_seo_agent'
  // Legacy / alias identifiers that may appear in older DB rows
  | 'competitor_intelligence'
  | 'content_writer'
  | 'blog_writer'
  | 'faq_agent'
  | 'schema_optimizer'
  | 'review_analyzer'
  | 'social_strategy'
  | 'recommendations'
  | 'citation_builder'
  | 'llms_txt'
  | 'ai_readiness'

// ─── Label shape ──────────────────────────────────────────────────────────────

export interface AgentLabelEntry {
  /** Human-readable title shown in tables, cards, and history. */
  title: string
  /** Imperative verb used in CTAs: "Draft FAQ schema", "Refresh content". */
  verb: string
  /** Noun phrase for the output artifact: "FAQ schema", "content update". */
  outcomeNoun: string
}

// ─── Label map ────────────────────────────────────────────────────────────────

export const AGENT_LABELS: Record<AgentType, AgentLabelEntry> = {
  // ── MVP-1 agents ────────────────────────────────────────────────────────────
  query_mapper: {
    title: 'Query Mapper',
    verb: 'Map',
    outcomeNoun: 'query map',
  },
  content_optimizer: {
    title: 'Content Optimizer',
    verb: 'Draft',
    outcomeNoun: 'content update',
  },
  freshness_agent: {
    title: 'Freshness Agent',
    verb: 'Refresh',
    outcomeNoun: 'content refresh',
  },
  faq_builder: {
    title: 'FAQ Builder',
    verb: 'Draft',
    outcomeNoun: 'FAQ schema',
  },
  schema_generator: {
    title: 'Schema Generator',
    verb: 'Draft',
    outcomeNoun: 'JSON-LD schema',
  },
  offsite_presence_builder: {
    title: 'Presence Builder',
    verb: 'Build',
    outcomeNoun: 'presence plan',
  },
  review_presence_planner: {
    title: 'Review Planner',
    verb: 'Plan',
    outcomeNoun: 'review strategy',
  },
  entity_builder: {
    title: 'Entity Builder',
    verb: 'Build',
    outcomeNoun: 'entity profile',
  },
  authority_blog_strategist: {
    title: 'Blog Strategist',
    verb: 'Draft',
    outcomeNoun: 'blog strategy',
  },
  performance_tracker: {
    title: 'Performance Tracker',
    verb: 'Analyze',
    outcomeNoun: 'performance report',
  },
  reddit_presence_planner: {
    title: 'Reddit Planner',
    verb: 'Plan',
    outcomeNoun: 'Reddit strategy',
  },
  // ── MVP-2 ────────────────────────────────────────────────────────────────────
  video_seo_agent: {
    title: 'Video SEO Agent',
    verb: 'Optimize',
    outcomeNoun: 'video metadata',
  },
  // ── Named aliases (legacy DB rows) ──────────────────────────────────────────
  competitor_intelligence: {
    title: 'Competitor Intelligence',
    verb: 'Analyze',
    outcomeNoun: 'competitor report',
  },
  content_writer: {
    title: 'Content Writer',
    verb: 'Draft',
    outcomeNoun: 'content draft',
  },
  blog_writer: {
    title: 'Blog Writer',
    verb: 'Draft',
    outcomeNoun: 'blog post',
  },
  faq_agent: {
    title: 'FAQ Builder',
    verb: 'Draft',
    outcomeNoun: 'FAQ schema',
  },
  schema_optimizer: {
    title: 'Schema Generator',
    verb: 'Draft',
    outcomeNoun: 'JSON-LD schema',
  },
  review_analyzer: {
    title: 'Review Analyzer',
    verb: 'Analyze',
    outcomeNoun: 'review report',
  },
  social_strategy: {
    title: 'Social Strategy',
    verb: 'Draft',
    outcomeNoun: 'social plan',
  },
  recommendations: {
    title: 'Recommendations',
    verb: 'Generate',
    outcomeNoun: 'recommendations',
  },
  citation_builder: {
    title: 'Citation Builder',
    verb: 'Build',
    outcomeNoun: 'citation profile',
  },
  llms_txt: {
    title: 'LLMs.txt',
    verb: 'Generate',
    outcomeNoun: 'LLMs.txt file',
  },
  ai_readiness: {
    title: 'AI Readiness',
    verb: 'Audit',
    outcomeNoun: 'readiness report',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the human-readable title for a given agent_type string.
 * Falls back gracefully to the raw identifier if not in the map.
 *
 * @example
 * agentTypeLabel('schema_generator') // → 'Schema Generator'
 * agentTypeLabel('unknown_agent')    // → 'unknown_agent'
 */
export function agentTypeLabel(type: string): string {
  return AGENT_LABELS[type as AgentType]?.title ?? type
}

/**
 * Returns a "Draft X" / "Refresh X" CTA verb for an agent type.
 * Used to build outcome-first button labels.
 *
 * @example
 * agentOutcomeCta('faq_builder') // → 'Draft FAQ schema'
 */
export function agentOutcomeCta(type: string): string {
  const entry = AGENT_LABELS[type as AgentType]
  if (!entry) return type
  return `${entry.verb} ${entry.outcomeNoun}`
}

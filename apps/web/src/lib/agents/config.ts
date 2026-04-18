/**
 * config.ts — Registry of all 11 MVP-1 agents + 1 MVP-2 Video SEO Agent.
 *
 * Source of truth: 07-AGENT-ROSTER-V2.md + 12-AGENT-BUILD-SPEC.md +
 * 05-BOARD-DECISIONS-2026-04-15.md.
 *
 * IMPORTANT:
 *  - `displayName` is internal only. UI layers MUST render `actionLabel`.
 *  - `dailyCapByTier` = null means "no daily cap — uses monthly credit pool".
 *  - Free agents (creditCost === 0) have numeric daily caps per board decision.
 */

import type {
  AgentConfig,
  AgentType,
  ModelChoice,
  PipelineStep,
  PlanTier,
} from './types';

export const ALL_TIERS: PlanTier[] = ['discover', 'build', 'scale'];
const FIVE_STEP: PipelineStep[] = ['plan', 'research', 'do', 'qa', 'summarize'];
const THREE_STEP: PipelineStep[] = ['plan', 'do', 'qa'];

interface RegistryEntry extends Omit<AgentConfig, 'isFree'> {}

const RAW_REGISTRY: Record<AgentType, RegistryEntry> = {
  query_mapper: {
    type: 'query_mapper',
    displayName: 'Query Mapper',
    actionLabel: 'Map AI search queries for your business',
    description:
      'Maps the query landscape — what users ask AI engines about your category, ranked by opportunity gap.',
    creditCost: 1,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar-pro',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.08,
  },

  content_optimizer: {
    type: 'content_optimizer',
    displayName: 'Content Optimizer',
    actionLabel: 'Rewrite a page for AI search',
    description:
      'Rewrites existing pages with statistics, citations, and expert quotes — the three proven GEO levers.',
    creditCost: 2,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar',
      do: 'claude-sonnet-4-6',
      qa: 'claude-sonnet-4-6',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: true,
    requiresTopicLedger: false,
    ymylRisk: 'medium',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.18,
  },

  freshness_agent: {
    type: 'freshness_agent',
    displayName: 'Freshness Agent',
    actionLabel: 'Update stale content with fresh data',
    description:
      'Detects stale content and updates it with current data, dates, and fresh citations.',
    creditCost: 1,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-haiku-4-5',
      research: 'sonar',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: true,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.09,
  },

  faq_builder: {
    type: 'faq_builder',
    displayName: 'FAQ Builder',
    actionLabel: 'Generate an FAQ page',
    description:
      'Creates comprehensive FAQ pages per query cluster that AI engines actively cite.',
    creditCost: 0,
    dailyCapByTier: { discover: 3, build: 5, scale: 10 },
    availableOnTiers: ALL_TIERS,
    steps: THREE_STEP,
    stepModels: {
      plan: 'claude-haiku-4-5',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: true,
    ymylRisk: 'medium',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.04,
  },

  schema_generator: {
    type: 'schema_generator',
    displayName: 'Schema Generator',
    actionLabel: 'Generate JSON-LD structured data',
    description:
      'Generates correct JSON-LD markup for LocalBusiness, Product, FAQ, and Article types.',
    creditCost: 0,
    dailyCapByTier: { discover: 20, build: 20, scale: 20 },
    availableOnTiers: ALL_TIERS,
    steps: THREE_STEP,
    stepModels: {
      plan: 'claude-haiku-4-5',
      do: 'claude-haiku-4-5',
      qa: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.03,
  },

  offsite_presence_builder: {
    type: 'offsite_presence_builder',
    displayName: 'Off-Site Presence Builder',
    actionLabel: 'Check directory and listing coverage',
    description:
      'Maps third-party sources AI engines trust, identifies where you are missing, guides through getting listed.',
    creditCost: 0,
    dailyCapByTier: { discover: 3, build: 5, scale: 10 },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar',
      do: 'gemini-2-0-flash',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.06,
  },

  review_presence_planner: {
    type: 'review_presence_planner',
    displayName: 'Review Presence Planner',
    actionLabel: 'Plan your review strategy',
    description:
      'Builds a review strategy targeting platforms AI engines trust — where and how to earn reviews.',
    creditCost: 2,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.15,
  },

  entity_builder: {
    type: 'entity_builder',
    displayName: 'Entity Builder',
    actionLabel: 'Build your knowledge graph presence',
    description:
      'Guides through Wikidata, Google Business Profile, and entity markers for knowledge graph recognition.',
    creditCost: 2,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar-pro',
      do: 'claude-sonnet-4-6',
      qa: 'claude-sonnet-4-6',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.2,
  },

  authority_blog_strategist: {
    type: 'authority_blog_strategist',
    displayName: 'Authority Blog Strategist',
    actionLabel: 'Write a long-form authority article',
    description:
      'Creates long-form GEO-optimized articles targeting specific AI queries with statistics, citations, and quotes.',
    creditCost: 3,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ['build', 'scale'],
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-opus-4-6',
      research: 'sonar-pro',
      do: 'claude-opus-4-6',
      qa: 'claude-sonnet-4-6',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: true,
    ymylRisk: 'high',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.38,
  },

  performance_tracker: {
    type: 'performance_tracker',
    displayName: 'Performance Tracker',
    actionLabel: 'Check visibility changes since last scan',
    description:
      'Measures before/after for every agent action — shows which engine improved and by how much.',
    creditCost: 0,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: THREE_STEP,
    stepModels: {
      plan: 'claude-haiku-4-5',
      do: 'gemini-2-0-flash',
      qa: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'deep-6',
    estimatedCostUsd: 0.05,
  },

  reddit_presence_planner: {
    type: 'reddit_presence_planner',
    displayName: 'Reddit Presence Planner',
    actionLabel: 'Plan a Reddit engagement strategy',
    description:
      'Identifies subreddits where your audience asks the exact questions you should be answering.',
    creditCost: 1,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ALL_TIERS,
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar-pro',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.07,
  },

  // MVP-2 — wired in config for forward compatibility; not yet consumer-facing.
  video_seo_agent: {
    type: 'video_seo_agent',
    displayName: 'Video SEO Agent',
    actionLabel: 'Optimize your YouTube for AI Overviews',
    description:
      'Optimizes YouTube channel and video metadata for Google AI Overview citation.',
    creditCost: 2,
    dailyCapByTier: { discover: null, build: null, scale: null },
    availableOnTiers: ['scale'],
    steps: FIVE_STEP,
    stepModels: {
      plan: 'claude-sonnet-4-6',
      research: 'sonar',
      do: 'claude-sonnet-4-6',
      qa: 'claude-haiku-4-5',
      summarize: 'claude-haiku-4-5',
    },
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    priorityTier: 'lighter-5',
    estimatedCostUsd: 0.22,
  },
};

/** Registry keyed by agent type. Every consumer must read from this map. */
export const AGENT_REGISTRY: Record<AgentType, AgentConfig> = Object.fromEntries(
  Object.entries(RAW_REGISTRY).map(([key, entry]) => [
    key,
    { ...entry, isFree: entry.creditCost === 0 },
  ]),
) as Record<AgentType, AgentConfig>;

export const AGENT_REGISTRY_LIST: AgentConfig[] = Object.values(AGENT_REGISTRY);

export const MVP1_AGENTS: AgentType[] = AGENT_REGISTRY_LIST.filter(
  (a) => a.type !== 'video_seo_agent',
).map((a) => a.type);

export function getAgentConfig(type: AgentType): AgentConfig {
  const entry = AGENT_REGISTRY[type];
  if (!entry) {
    throw new Error(`Unknown agent type: ${type}`);
  }
  return entry;
}

export function agentAvailableOnTier(type: AgentType, tier: PlanTier): boolean {
  return getAgentConfig(type).availableOnTiers.includes(tier);
}

export function getModelForStep(
  type: AgentType,
  step: PipelineStep,
): ModelChoice | undefined {
  return getAgentConfig(type).stepModels[step];
}

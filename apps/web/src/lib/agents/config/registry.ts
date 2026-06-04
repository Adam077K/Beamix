/**
 * Beamix Agent System — Agent Config Registry
 *
 * `AGENT_REGISTRY` holds one `AgentConfig` per MVP-1 agent, per the table in
 * `12-AGENT-BUILD-SPEC.md` §Agent Config Registry. This is the single source of
 * truth for credit cost, daily caps, tier availability, and pipeline shape.
 */

import type { AgentConfig, AgentType, PipelineStage } from '../types';
import type { ArtifactType } from '../approval-gate-writer/types';

/** The 5-step pipeline run by credit-gated agents. */
const FIVE_STEP: PipelineStage[] = ['plan', 'research', 'do', 'qa', 'summarize'];

/** The 3-step pipeline run by free agents (no RESEARCH, no SUMMARIZE). */
const THREE_STEP: PipelineStage[] = ['plan', 'do', 'qa'];

/**
 * Off-Site Presence Builder is free (creditCost 0) yet runs the full 5-step pipeline
 * — it needs a RESEARCH stage to pull directory data. The registry models this
 * explicitly rather than tying `stages` to `isFree`.
 */
const OFFSITE_STAGES: PipelineStage[] = FIVE_STEP;

export const AGENT_REGISTRY: AgentConfig[] = [
  {
    agentType: 'query_mapper',
    displayName: 'Query Mapper',
    creditCost: 1,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Produces an internal strategic report — not published externally, not gated.
    requiresApproval: false,
  },
  {
    agentType: 'content_optimizer',
    displayName: 'Content Optimizer',
    creditCost: 2,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: true,
    requiresTopicLedger: false,
    ymylRisk: 'medium',
    // Content publish — gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: true,
  },
  {
    agentType: 'freshness_agent',
    displayName: 'Freshness Agent',
    creditCost: 1,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: true,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Content publish — gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: true,
  },
  {
    agentType: 'faq_builder',
    displayName: 'FAQ Builder',
    creditCost: 0,
    isFree: true,
    dailyCap: { discover: 3, build: 5, scale: 10 },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: THREE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: true,
    ymylRisk: 'medium',
    // FAQ publish — gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: true,
  },
  {
    agentType: 'schema_generator',
    displayName: 'Schema Generator',
    creditCost: 0,
    isFree: true,
    dailyCap: { discover: 20, build: 20, scale: 20 },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: THREE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Schema auto-publishes — not gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: false,
  },
  {
    agentType: 'offsite_presence_builder',
    displayName: 'Off-Site Presence Builder',
    creditCost: 0,
    isFree: true,
    dailyCap: { discover: 3, build: 5, scale: 10 },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: OFFSITE_STAGES,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Citations auto-publish — not gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: false,
  },
  {
    agentType: 'review_presence_planner',
    displayName: 'Review Presence Planner',
    creditCost: 2,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Produces an internal strategic report — not published externally, not gated.
    requiresApproval: false,
  },
  {
    agentType: 'entity_builder',
    displayName: 'Entity Builder',
    creditCost: 2,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Citations auto-publish — not gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: false,
  },
  {
    agentType: 'authority_blog_strategist',
    displayName: 'Authority Blog Strategist',
    creditCost: 3,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    // Not available on Discover — Discover users see a locked/upgrade prompt.
    availableOnTiers: ['build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: true,
    requiresTopicLedger: true,
    ymylRisk: 'high',
    // Blog post / content publish — gated per docs/03-system-design/ARCHITECTURE.md §A3.
    requiresApproval: true,
  },
  {
    agentType: 'performance_tracker',
    displayName: 'Performance Tracker',
    creditCost: 0,
    isFree: true,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: THREE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Internal analytics report — not gated.
    requiresApproval: false,
  },
  {
    agentType: 'reddit_presence_planner',
    displayName: 'Reddit Presence Planner',
    creditCost: 1,
    isFree: false,
    dailyCap: { discover: null, build: null, scale: null },
    availableOnTiers: ['discover', 'build', 'scale'],
    stages: FIVE_STEP,
    requiresPageLock: false,
    requiresTopicLedger: false,
    ymylRisk: 'low',
    // Produces an internal strategic report — not published externally, not gated.
    requiresApproval: false,
  },
];

/** O(1) lookup index keyed by `agentType`. */
const REGISTRY_INDEX: Map<AgentType, AgentConfig> = new Map(
  AGENT_REGISTRY.map((c) => [c.agentType, c]),
);

/** Resolve the `AgentConfig` for an agent type. Throws if the agent is unknown. */
export function getAgentConfig(agentType: AgentType): AgentConfig {
  const config = REGISTRY_INDEX.get(agentType);
  if (!config) {
    throw new Error(`No registry entry for agent type "${agentType}"`);
  }
  return config;
}

/** True if the agent is available on the given plan tier. */
export function isAgentAvailable(agentType: AgentType, planTier: AgentConfig['availableOnTiers'][number]): boolean {
  return getAgentConfig(agentType).availableOnTiers.includes(planTier);
}

/**
 * Map an agent type to the `ArtifactType` used in `gated_publish.requested`.
 * Returns `null` for agents whose output is not subject to the approval gate
 * (internal reports, auto-publishing agents).
 *
 * Gated agents: content_optimizer, freshness_agent, faq_builder, authority_blog_strategist.
 * Per docs/03-system-design/ARCHITECTURE.md §Gating Rules (A3).
 */
export function resolveArtifactType(agentType: AgentType): ArtifactType | null {
  switch (agentType) {
    case 'authority_blog_strategist':
      return 'blog_post';
    case 'content_optimizer':
    case 'freshness_agent':
      // Both agents produce updated/optimised page content — mapped to blog_post
      // artifact type (closest canonical fit for a published content piece).
      return 'blog_post';
    case 'faq_builder':
      return 'faq';
    default:
      // schema_generator, offsite_presence_builder, entity_builder, query_mapper,
      // review_presence_planner, performance_tracker, reddit_presence_planner — not gated.
      return null;
  }
}

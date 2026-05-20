/**
 * Beamix Agent System — Prompt Registry
 *
 * Maps each `AgentType` to its per-stage prompt set. The pipeline steps resolve their
 * `StagePrompt` through `getStagePrompt()` rather than importing 11 prompt modules.
 *
 * Free 3-step agents (FAQ Builder, Schema Generator, Performance Tracker) have no
 * `research` or `summarize` entry; Off-Site Presence Builder is free but runs all 5.
 */

import type { AgentType, PipelineStage } from '../../types';
import type { StagePrompt } from './_shared';

import * as queryMapper from './query-mapper';
import * as contentOptimizer from './content-optimizer';
import * as freshnessAgent from './freshness-agent';
import * as faqBuilder from './faq-builder';
import * as schemaGenerator from './schema-generator';
import * as offsitePresenceBuilder from './offsite-presence-builder';
import * as reviewPresencePlanner from './review-presence-planner';
import * as entityBuilder from './entity-builder';
import * as authorityBlogStrategist from './authority-blog-strategist';
import * as performanceTracker from './performance-tracker';
import * as redditPresencePlanner from './reddit-presence-planner';

/** A per-agent prompt set. `research` / `summarize` are absent for 3-step agents. */
export interface AgentPromptSet {
  plan: StagePrompt;
  research?: StagePrompt;
  do: StagePrompt;
  qa: StagePrompt;
  summarize?: StagePrompt;
}

/** Narrow a prompt module (which may or may not export research/summarize) to an `AgentPromptSet`. */
function toPromptSet(mod: {
  PLAN_PROMPT: StagePrompt;
  RESEARCH_PROMPT?: StagePrompt;
  DO_PROMPT: StagePrompt;
  QA_PROMPT: StagePrompt;
  SUMMARIZE_PROMPT?: StagePrompt;
}): AgentPromptSet {
  return {
    plan: mod.PLAN_PROMPT,
    research: mod.RESEARCH_PROMPT,
    do: mod.DO_PROMPT,
    qa: mod.QA_PROMPT,
    summarize: mod.SUMMARIZE_PROMPT,
  };
}

/** The complete prompt registry, keyed by `AgentType`. */
export const PROMPT_REGISTRY: Record<AgentType, AgentPromptSet> = {
  query_mapper: toPromptSet(queryMapper),
  content_optimizer: toPromptSet(contentOptimizer),
  freshness_agent: toPromptSet(freshnessAgent),
  faq_builder: toPromptSet(faqBuilder),
  schema_generator: toPromptSet(schemaGenerator),
  offsite_presence_builder: toPromptSet(offsitePresenceBuilder),
  review_presence_planner: toPromptSet(reviewPresencePlanner),
  entity_builder: toPromptSet(entityBuilder),
  authority_blog_strategist: toPromptSet(authorityBlogStrategist),
  performance_tracker: toPromptSet(performanceTracker),
  reddit_presence_planner: toPromptSet(redditPresencePlanner),
};

/**
 * Resolve the `StagePrompt` for an agent + stage. Throws if the agent does not run
 * that stage (e.g. requesting `research` for a 3-step agent) — the pipeline only ever
 * requests stages listed in the agent's registry `stages` array, so this throw
 * indicates a registry/prompt mismatch.
 */
export function getStagePrompt(agentType: AgentType, stage: PipelineStage): StagePrompt {
  const set = PROMPT_REGISTRY[agentType];
  const prompt = set[stage];
  if (!prompt) {
    throw new Error(`Agent "${agentType}" has no prompt for stage "${stage}"`);
  }
  return prompt;
}

export type { StagePrompt };

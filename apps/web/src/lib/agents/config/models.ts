/**
 * Beamix Agent System — Model Router
 *
 * Maps `agentType` + `PipelineStage` → model ID, per `12-AGENT-BUILD-SPEC.md`
 * §Model Router Table and `07-AGENT-ROSTER-V2.md` §Per-agent routing.
 *
 * Provider routing (board April-18):
 *   `claude-*`                       → direct Anthropic SDK (primary, ~80% of calls)
 *   `google/*` | `openai/*` | `perplexity/*` → OpenRouter
 *   Perplexity Sonar QA verification → Perplexity native API (citation probe)
 *
 * Prohibited models: DeepSeek (any), Qwen (any) — not approved for customer data.
 */

import type { AgentType, PipelineStage } from '../types';

export type RuntimeProvider = 'anthropic' | 'openrouter' | 'perplexity';

type ModelMap = Record<AgentType, Partial<Record<PipelineStage, string>>>;

/**
 * Per-agent, per-stage model routing. A missing stage key means the agent does not
 * run that stage (free agents skip `research` and `summarize`).
 */
export const MODEL_ROUTER: ModelMap = {
  query_mapper: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar-pro',
    do: 'claude-sonnet-4-6',
    qa: 'claude-haiku-4-5',
    summarize: 'claude-haiku-4-5',
  },
  content_optimizer: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar',
    do: 'claude-sonnet-4-6',
    qa: 'claude-sonnet-4-6',
    summarize: 'claude-haiku-4-5',
  },
  freshness_agent: {
    plan: 'claude-haiku-4-5',
    research: 'perplexity/sonar',
    do: 'claude-sonnet-4-6',
    qa: 'claude-haiku-4-5',
    summarize: 'claude-haiku-4-5',
  },
  faq_builder: {
    plan: 'claude-haiku-4-5',
    do: 'claude-sonnet-4-6',
    qa: 'claude-haiku-4-5',
  },
  schema_generator: {
    plan: 'claude-haiku-4-5',
    do: 'claude-haiku-4-5',
    qa: 'claude-haiku-4-5',
  },
  offsite_presence_builder: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar',
    do: 'google/gemini-2.5-flash',
    qa: 'claude-haiku-4-5',
    summarize: 'claude-haiku-4-5',
  },
  review_presence_planner: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar',
    do: 'claude-sonnet-4-6',
    qa: 'claude-haiku-4-5',
    summarize: 'claude-haiku-4-5',
  },
  entity_builder: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar-pro',
    do: 'claude-sonnet-4-6',
    qa: 'claude-sonnet-4-6',
    summarize: 'claude-haiku-4-5',
  },
  authority_blog_strategist: {
    plan: 'claude-opus-4-6',
    research: 'perplexity/sonar-pro',
    do: 'claude-opus-4-6',
    qa: 'claude-sonnet-4-6',
    summarize: 'claude-haiku-4-5',
  },
  performance_tracker: {
    plan: 'claude-haiku-4-5',
    do: 'google/gemini-2.5-flash',
    qa: 'claude-haiku-4-5',
  },
  reddit_presence_planner: {
    plan: 'claude-sonnet-4-6',
    research: 'perplexity/sonar-pro',
    do: 'claude-sonnet-4-6',
    qa: 'claude-haiku-4-5',
    summarize: 'claude-haiku-4-5',
  },
};

/**
 * The model used for the Perplexity Sonar citation-verification probe in the QA stage.
 * Applied to Content Optimizer, Authority Blog Strategist, and FAQ Builder regardless
 * of their QA model — this is a second, independent QA call.
 */
export const CITATION_VERIFICATION_MODEL = 'sonar';

/** Agents whose QA stage runs the Perplexity Sonar citation-verification probe. */
export const CITATION_VERIFICATION_AGENTS: ReadonlySet<AgentType> = new Set<AgentType>([
  'content_optimizer',
  'authority_blog_strategist',
  'faq_builder',
]);

/**
 * Pick the runtime provider for a model ID by inspecting its prefix.
 *   `claude-*`     → Anthropic SDK directly
 *   `perplexity/*` → OpenRouter
 *   `sonar` / `sonar-pro` (bare) → Perplexity native API (citation probe)
 *   `google/*` | `openai/*` → OpenRouter
 */
export function runtimeProvider(modelId: string): RuntimeProvider {
  if (modelId.startsWith('claude-')) return 'anthropic';
  if (modelId === 'sonar' || modelId === 'sonar-pro') return 'perplexity';
  if (
    modelId.startsWith('google/') ||
    modelId.startsWith('openai/') ||
    modelId.startsWith('perplexity/')
  ) {
    return 'openrouter';
  }
  throw new Error(`Unknown model provider for model ID: ${modelId}`);
}

/** Resolve the model ID for an agent + stage. Throws if the stage is not routed. */
export function resolveModel(agentType: AgentType, stage: PipelineStage): string {
  const model = MODEL_ROUTER[agentType][stage];
  if (!model) {
    throw new Error(`No model routed for agent "${agentType}" stage "${stage}"`);
  }
  return model;
}

/**
 * Per-1M-token USD pricing (May 2026, locked Q3 2026-05-07). Used by the LLM runner to
 * compute `CostEntry.costUsd`. Anthropic native cache reads bill at 10% of input;
 * cache writes at 125% of input.
 */
export const MODEL_PRICING: Record<
  string,
  { inputPerM: number; outputPerM: number; cacheReadPerM: number; cacheWritePerM: number }
> = {
  'claude-opus-4-6': { inputPerM: 5, outputPerM: 25, cacheReadPerM: 0.5, cacheWritePerM: 6.25 },
  'claude-sonnet-4-6': { inputPerM: 3, outputPerM: 15, cacheReadPerM: 0.3, cacheWritePerM: 3.75 },
  'claude-haiku-4-5': { inputPerM: 1, outputPerM: 5, cacheReadPerM: 0.1, cacheWritePerM: 1.25 },
  'perplexity/sonar': { inputPerM: 1, outputPerM: 1, cacheReadPerM: 0, cacheWritePerM: 0 },
  'perplexity/sonar-pro': { inputPerM: 3, outputPerM: 15, cacheReadPerM: 0, cacheWritePerM: 0 },
  sonar: { inputPerM: 1, outputPerM: 1, cacheReadPerM: 0, cacheWritePerM: 0 },
  'google/gemini-2.5-flash': {
    inputPerM: 0.1,
    outputPerM: 0.4,
    cacheReadPerM: 0,
    cacheWritePerM: 0,
  },
};

/** Compute USD cost for a single LLM call. Unknown models fall back to Sonnet pricing. */
export function computeCostUsd(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
  cacheReadTokens = 0,
  cacheWriteTokens = 0,
): number {
  const pricing = MODEL_PRICING[modelId] ?? MODEL_PRICING['claude-sonnet-4-6'];
  const freshInputTokens = Math.max(0, promptTokens - cacheReadTokens - cacheWriteTokens);
  const cost =
    (freshInputTokens / 1_000_000) * pricing.inputPerM +
    (completionTokens / 1_000_000) * pricing.outputPerM +
    (cacheReadTokens / 1_000_000) * pricing.cacheReadPerM +
    (cacheWriteTokens / 1_000_000) * pricing.cacheWritePerM;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

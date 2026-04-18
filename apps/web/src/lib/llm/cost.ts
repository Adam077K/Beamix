/**
 * cost.ts — Per-model pricing + cost calculator.
 *
 * Rates current as of Feb 2026. Update when provider pricing changes.
 * Rates are USD per million tokens. OpenRouter adds ~5% markup on non-direct
 * providers — modeled as a multiplier on the base rate.
 */

import type { CostEntry, ModelChoice, ModelProvider, PipelineStep } from '@/lib/agents/types';

export interface RateCard {
  inputPerMillion: number;
  outputPerMillion: number;
  /** Anthropic cached input reads (10% of base input rate). */
  cacheReadPerMillion?: number;
  /** Anthropic cache writes (~125% of base input rate). */
  cacheCreationPerMillion?: number;
  provider: ModelProvider;
  /** For OpenRouter-routed models, apply ~5% markup on top. */
  openrouterMarkup?: number;
}

export const RATE_CARD: Record<ModelChoice, RateCard> = {
  // Direct Anthropic (no markup).
  'claude-sonnet-4-6': {
    provider: 'anthropic',
    inputPerMillion: 3,
    outputPerMillion: 15,
    cacheReadPerMillion: 0.3,
    cacheCreationPerMillion: 3.75,
  },
  'claude-haiku-4-5': {
    provider: 'anthropic',
    inputPerMillion: 1,
    outputPerMillion: 5,
    cacheReadPerMillion: 0.1,
    cacheCreationPerMillion: 1.25,
  },
  'claude-opus-4-6': {
    provider: 'anthropic',
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheReadPerMillion: 0.5,
    cacheCreationPerMillion: 6.25,
  },

  // OpenRouter-routed (Gemini, OpenAI, Perplexity). ~5% markup.
  'gemini-2-0-flash': {
    provider: 'openrouter',
    inputPerMillion: 0.1,
    outputPerMillion: 0.4,
    openrouterMarkup: 0.05,
  },
  'gemini-2-5-pro': {
    provider: 'openrouter',
    inputPerMillion: 1.25,
    outputPerMillion: 5,
    openrouterMarkup: 0.05,
  },
  'gpt-4o': {
    provider: 'openrouter',
    inputPerMillion: 2.5,
    outputPerMillion: 10,
    openrouterMarkup: 0.05,
  },
  'gpt-4o-mini': {
    provider: 'openrouter',
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
    openrouterMarkup: 0.05,
  },
  'gpt-5-mini': {
    provider: 'openrouter',
    inputPerMillion: 0.25,
    outputPerMillion: 2,
    openrouterMarkup: 0.05,
  },
  sonar: {
    provider: 'perplexity',
    inputPerMillion: 1,
    outputPerMillion: 1,
  },
  'sonar-pro': {
    provider: 'perplexity',
    inputPerMillion: 3,
    outputPerMillion: 15,
  },
  'sonar-online': {
    provider: 'perplexity',
    inputPerMillion: 1,
    outputPerMillion: 1,
  },
};

export interface CostInputs {
  model: ModelChoice;
  promptTokens: number;
  completionTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
}

export function calculateCost(inputs: CostInputs): number {
  const card = RATE_CARD[inputs.model];
  const markup = card.openrouterMarkup ?? 0;

  const baseInputTokens = Math.max(
    0,
    inputs.promptTokens - (inputs.cacheReadTokens ?? 0) - (inputs.cacheCreationTokens ?? 0),
  );

  const inputCost = (baseInputTokens / 1_000_000) * card.inputPerMillion;
  const outputCost = (inputs.completionTokens / 1_000_000) * card.outputPerMillion;

  const cacheReadCost =
    inputs.cacheReadTokens && card.cacheReadPerMillion
      ? (inputs.cacheReadTokens / 1_000_000) * card.cacheReadPerMillion
      : 0;

  const cacheWriteCost =
    inputs.cacheCreationTokens && card.cacheCreationPerMillion
      ? (inputs.cacheCreationTokens / 1_000_000) * card.cacheCreationPerMillion
      : 0;

  const subtotal = inputCost + outputCost + cacheReadCost + cacheWriteCost;
  return subtotal * (1 + markup);
}

export function buildCostEntry(params: {
  step: PipelineStep | 'qa-citation';
  model: ModelChoice;
  promptTokens: number;
  completionTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
}): CostEntry {
  const card = RATE_CARD[params.model];
  const costUsd = calculateCost(params);

  const entry: CostEntry = {
    step: params.step,
    model: params.model,
    provider: card.provider,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    costUsd,
  };
  if (params.cacheReadTokens !== undefined) entry.cacheReadTokens = params.cacheReadTokens;
  if (params.cacheCreationTokens !== undefined)
    entry.cacheCreationTokens = params.cacheCreationTokens;
  return entry;
}

/**
 * engines.ts — Scan engine configuration map.
 *
 * Engine sets per tier (board decision 2026-04-15):
 *   Discover: chatgpt, gemini, perplexity
 *   Build:    + claude, ai_overviews, grok, you_com
 *   Scale:    all engines
 *
 * All calls routed through callLLM (OpenRouter for non-Claude).
 */

import type { ModelChoice, PlanTier } from '@/lib/agents/types';

// ─── Engine identifiers ────────────────────────────────────────────────────

export type ScanEngineId =
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'claude'
  | 'ai_overviews'
  | 'grok'
  | 'you_com';

// ─── Engine config ──────────────────────────────────────────────────────────

export interface ScanEngineConfig {
  id: ScanEngineId;
  /** Human-readable label for the UI. */
  label: string;
  model: ModelChoice;
  /**
   * Approximate max output tokens per query.
   * Keep low to reduce cost — we only need brand mention detection.
   */
  maxTokens: number;
  /** Temperature for scan queries (lower = more deterministic responses). */
  temperature: number;
}

export const SCAN_ENGINE_CONFIGS: Record<ScanEngineId, ScanEngineConfig> = {
  chatgpt: {
    id: 'chatgpt',
    label: 'ChatGPT',
    model: 'gpt-4o',
    maxTokens: 800,
    temperature: 0.3,
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    model: 'gemini-2-0-flash',
    maxTokens: 800,
    temperature: 0.3,
  },
  perplexity: {
    id: 'perplexity',
    label: 'Perplexity',
    model: 'sonar-online',
    maxTokens: 800,
    temperature: 0.3,
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    model: 'claude-haiku-4-5',
    maxTokens: 800,
    temperature: 0.3,
  },
  ai_overviews: {
    id: 'ai_overviews',
    label: 'AI Overviews',
    // Route through Gemini as proxy for AI Overviews signal.
    model: 'gemini-2-5-pro',
    maxTokens: 800,
    temperature: 0.3,
  },
  grok: {
    id: 'grok',
    label: 'Grok',
    // Grok via GPT-4o as placeholder until direct API available.
    model: 'gpt-4o-mini',
    maxTokens: 800,
    temperature: 0.3,
  },
  you_com: {
    id: 'you_com',
    label: 'You.com',
    model: 'sonar-pro',
    maxTokens: 800,
    temperature: 0.3,
  },
};

// ─── Tier engine sets ──────────────────────────────────────────────────────

export const TIER_ENGINE_SETS: Record<PlanTier, ScanEngineId[]> = {
  discover: ['chatgpt', 'gemini', 'perplexity'],
  build: ['chatgpt', 'gemini', 'perplexity', 'claude', 'ai_overviews', 'grok', 'you_com'],
  scale: ['chatgpt', 'gemini', 'perplexity', 'claude', 'ai_overviews', 'grok', 'you_com'],
};

/**
 * Returns the engine config objects for a given tier.
 * If override engine IDs are provided (e.g. from API request), validates and
 * filters to only engines available for the tier.
 */
export function getEnginesForTier(
  tier: PlanTier,
  overrideEngineIds?: string[],
): ScanEngineConfig[] {
  const allowed = new Set(TIER_ENGINE_SETS[tier]);
  const ids =
    overrideEngineIds && overrideEngineIds.length > 0
      ? overrideEngineIds.filter((id): id is ScanEngineId => allowed.has(id as ScanEngineId))
      : [...allowed];
  return ids.map((id) => SCAN_ENGINE_CONFIGS[id]).filter(Boolean);
}

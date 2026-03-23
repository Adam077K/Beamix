/**
 * Scan tier configuration — controls query count, engines, and volume per plan.
 *
 * Free scans use the 'free' tier. Paid scans look up the user's plan_tier.
 * Higher tiers get more queries, more engines, and deeper analysis.
 */

export type ScanEngine = 'chatgpt' | 'gemini' | 'perplexity' | 'claude'

export interface ScanTierConfig {
  /** Total query types to generate (3-6) */
  queryCount: number
  /** Which engines to query */
  engines: readonly ScanEngine[]
  /** How many queries each engine receives */
  queriesPerEngine: Partial<Record<ScanEngine, number>>
  /** Total API calls = sum of queriesPerEngine values */
  totalCalls: number
}

export const SCAN_TIER_CONFIG: Record<string, ScanTierConfig> = {
  free: {
    queryCount: 3,
    engines: ['chatgpt', 'gemini', 'perplexity'],
    queriesPerEngine: { chatgpt: 2, gemini: 2, perplexity: 3 },
    totalCalls: 7,
  },
  starter: {
    queryCount: 4,
    engines: ['chatgpt', 'gemini', 'perplexity'],
    queriesPerEngine: { chatgpt: 3, gemini: 3, perplexity: 4 },
    totalCalls: 10,
  },
  pro: {
    queryCount: 5,
    engines: ['chatgpt', 'gemini', 'perplexity', 'claude'],
    queriesPerEngine: { chatgpt: 4, gemini: 4, perplexity: 5, claude: 3 },
    totalCalls: 16,
  },
  business: {
    queryCount: 6,
    engines: ['chatgpt', 'gemini', 'perplexity', 'claude'],
    queriesPerEngine: { chatgpt: 5, gemini: 5, perplexity: 6, claude: 4 },
    totalCalls: 20,
  },
}

/**
 * Get the scan tier config for a plan. Falls back to 'free' for null/unknown tiers.
 */
export function getTierConfig(planTier: string | null): ScanTierConfig {
  return SCAN_TIER_CONFIG[planTier ?? 'free'] ?? SCAN_TIER_CONFIG.free
}

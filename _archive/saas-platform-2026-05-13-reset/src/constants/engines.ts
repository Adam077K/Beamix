/**
 * Engine configuration — canonical map of AI engine keys to display metadata.
 * Used across home engine cards, scan drilldown, and anywhere engine keys appear.
 *
 * Keys match the values stored in scan_engine_results.engine column.
 */

export type EngineKey = 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'grok' | 'aio' | 'youcom'

export interface EngineConfig {
  /** Human-readable label */
  label: string
  /** Short label for compact displays */
  shortLabel: string
  /** Brand color hex */
  color: string
  /** Background tint (10% opacity version of color) */
  bg: string
  /** Initials for avatar fallback */
  initial: string
}

export const ENGINE_CONFIG: Record<string, EngineConfig> = {
  chatgpt: {
    label: 'ChatGPT',
    shortLabel: 'GPT',
    color: '#10B981',
    bg: '#ECFDF5',
    initial: 'CG',
  },
  gemini: {
    label: 'Gemini',
    shortLabel: 'GEM',
    color: '#3370FF',
    bg: '#EFF6FF',
    initial: 'GM',
  },
  perplexity: {
    label: 'Perplexity',
    shortLabel: 'PPX',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    initial: 'PX',
  },
  claude: {
    label: 'Claude',
    shortLabel: 'CLD',
    color: '#F59E0B',
    bg: '#FFFBEB',
    initial: 'CL',
  },
  grok: {
    label: 'Grok',
    shortLabel: 'GRK',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    initial: 'GK',
  },
  aio: {
    label: 'AI Overviews',
    shortLabel: 'AIO',
    color: '#06B6D4',
    bg: '#ECFEFF',
    initial: 'AI',
  },
  youcom: {
    label: 'You.com',
    shortLabel: 'YOU',
    color: '#EC4899',
    bg: '#FDF2F8',
    initial: 'YC',
  },
}

/** Fallback config for unknown engine keys */
export const ENGINE_CONFIG_FALLBACK: EngineConfig = {
  label: 'Unknown',
  shortLabel: '??',
  color: '#6B7280',
  bg: '#F9FAFB',
  initial: '??',
}

/** Safely get engine config — never returns undefined */
export function getEngineConfig(engineKey: string): EngineConfig {
  return ENGINE_CONFIG[engineKey] ?? ENGINE_CONFIG_FALLBACK
}

/** Get human-readable label for an engine key */
export function getEngineLabel(engineKey: string): string {
  return getEngineConfig(engineKey).label
}

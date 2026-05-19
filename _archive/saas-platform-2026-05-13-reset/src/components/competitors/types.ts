// ─── Competitors feature types ────────────────────────────────────────────────

export type Engine = 'ChatGPT' | 'Gemini' | 'Perplexity' | 'Claude' | 'AIO' | 'Grok' | 'You.com'

export const ALL_ENGINES: Engine[] = [
  'ChatGPT',
  'Gemini',
  'Perplexity',
  'Claude',
  'AIO',
  'Grok',
  'You.com',
]

export interface Competitor {
  id: string
  name: string
  url: string
  /** 0–1 overall SoV fraction */
  appearanceRate: number
  queriesWhereAppears: string[]
  /** One entry per week, last 4 weeks */
  fourWeekTrend: number[]
  /** Citation rate per engine — 0–1 */
  engineRates?: Partial<Record<Engine, number>>
  /** Estimated publish cadence description */
  publishCadence?: string
  /** Total queries covered by this competitor */
  queryCoverage?: number
}

export interface TrackedQuery {
  query: string
  volume?: number
  /** Rate per engine, keyed by engine name */
  enginePresence: Partial<Record<string, number>>
  /** Which competitors appear for this query */
  competitorPresence: string[]
  youPresent: boolean
  gap: number
}

export interface SovWeek {
  week: string
  you: number
  competitors: Record<string, number>
}

export interface CompetitorsData {
  competitors: Competitor[]
  yourSoV: number
  yourSoVTrend: number[]
  trackedQueries: TrackedQuery[]
  sovTrend: SovWeek[]
  alertMessage?: string
}

/**
 * Outcome-shaped DTOs for the dashboard and approvals surfaces.
 * These types describe what customers see (results, actions pending),
 * never how work was performed or by whom.
 */

export type AIEngine = 'chatgpt' | 'gemini' | 'perplexity'

export interface VisibilityScore {
  engine: AIEngine
  /** null = scan not yet run */
  score: number | null
  /** null = no trend data yet */
  trend: 'up' | 'down' | 'flat' | null
  lastUpdatedAt: string | null
}

export interface Win {
  id: string
  description: string
  /** ISO-8601 */
  achievedAt: string
}

/** A single week-over-week point of the overall (averaged) visibility score. */
export interface OverallTrendPoint {
  /** ISO-8601 week-start date. */
  weekOf: string
  /** Overall visibility score for that week (0–100). */
  score: number
}

export interface DashboardOutcomes {
  visibilityScores: VisibilityScore[]
  weeklyNarrative: { type: 'empty' | 'wins'; items?: Win[] }
  approvalCount: number
  /**
   * Week-over-week overall score trend (oldest → newest) for the dominant
   * trend chart. Optional and null-safe: < 2 points renders a designed
   * baseline. Omitted entirely for users with no scan history yet.
   */
  overallTrend?: OverallTrendPoint[]
}

export type ApprovalItemResource = 'content' | 'email' | 'outreach'

export interface ApprovalItem {
  id: string
  resource: ApprovalItemResource
  preview: string
  /** ISO-8601 */
  createdAt: string
  /** ISO-8601 */
  expiresAt: string
}

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

export interface DashboardOutcomes {
  visibilityScores: VisibilityScore[]
  weeklyNarrative: { type: 'empty' | 'wins'; items?: Win[] }
  approvalCount: number
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

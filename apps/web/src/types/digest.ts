/**
 * Digest types — Weekly Digest Archive ("The Record") surface.
 *
 * DigestOutput is the shape written by the digest-writer agent.
 * The UI renders these verbatim; section headings are the only UI copy.
 *
 * Wave 2: fetch from `weekly_digests` table (one row per customer per week_of).
 */

import type { AIEngine } from './outcomes'

/** Win type aligns with the digest-writer agent categories */
export type WinType = 'schema' | 'faq' | 'citation' | 'content' | 'outreach'

export interface DigestWin {
  id: string
  type: WinType
  description: string
  /** Optional: which agent drove this win (renders in violet) */
  agentName?: string
  /** For citation/faq wins — the query that surfaced in an engine */
  query?: string
}

export interface EngineVisibilityDelta {
  engine: AIEngine
  thisWeek: number
  lastWeek: number
  fourWeeksAgo: number | null
  delta: number
}

export type ApprovalStatus = 'approved' | 'rejected' | 'expired'
export type ApprovalType = 'content' | 'faq' | 'schema' | 'outreach' | 'email'

export interface DigestApproval {
  id: string
  title: string
  type: ApprovalType
  previewSnippet: string
  status: ApprovalStatus
  /** Optional: the agent that proposed this (renders in violet) */
  agentProposer?: string
}

export interface DigestOutput {
  /** ≤ 80 chars — the week's headline */
  headline: string
  /** Narrative sentence — the week in one line */
  narrativeLine: string
  wins: DigestWin[]
  engineDeltas: EngineVisibilityDelta[]
  /** Historical resolved approvals only — read-only display */
  resolvedApprovals: DigestApproval[]
  /** Customer success note — rendered in Fraunces, verbatim */
  customerNote: string
}

export interface WeeklyDigest {
  id: string
  weekOf: string     // ISO-8601 date (Monday of the week)
  weekLabel: string  // e.g. "Week of Jun 8"
  weekYear: string   // e.g. "2026"
  weekRelative: string // e.g. "This week" | "Last week" | "2 weeks ago"
  digest: DigestOutput
}

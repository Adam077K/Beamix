/**
 * Traceability types — "How we got this" surface.
 *
 * Data contract for mapping every customer outcome back to the exact work
 * (articles, schema, citations) that produced it. Pure frontend types for now.
 * Wave 2 will introduce fetchTraceability(userId) → TraceabilityData.
 */

import type { AIEngine } from '@/types/outcomes'

export type { AIEngine }

export type DeliverableKind = 'article' | 'schema' | 'citation'

export interface Deliverable {
  id: string
  kind: DeliverableKind
  label: string
  url: string
  /** ISO-8601 */
  occurredAt: string
}

export interface Outcome {
  id: string
  statement: string
  engine: AIEngine
  /** Positive integer point delta */
  deltaPoints: number
  /** ISO-8601 */
  achievedAt: string
  deliverables: Deliverable[]
}

export type TraceabilityState = 'loading' | 'empty' | 'error' | 'ready'

export interface TraceabilityData {
  state: TraceabilityState
  outcomes: Outcome[]
  errorMessage?: string
}

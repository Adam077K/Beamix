/**
 * Console Pipeline Ledger — Type Contract
 *
 * Violet adaptation of scan-contract.ts for the agent pipeline.
 * Blue (scan) → Violet (agent). Structure identical; colors swapped.
 *
 * This file is the single seam between the PipelineLedger UI and the
 * real pipeline runner. When the real pipeline ships, ONLY the data
 * source changes — PipelineLedger + StageRow are zero-change.
 */

import type { PipelineStage } from '@/lib/agents/types'

export type StageStatus = 'queued' | 'active' | 'done' | 'error'

export interface StageState {
  id: PipelineStage
  label: string
  status: StageStatus
  /** Live substep being executed, e.g. "Searching for dental competitors…" */
  substep?: string | null
}

export interface PipelineLedgerProps {
  stages: StageState[]
  /** Agent display label, e.g. "Content Optimizer" */
  agentLabel: string
  /** The current live substep string (streams under the ledger) */
  currentSubstep: string | null
  /** True during the completion handoff — rows lift out to reveal output */
  clearing?: boolean
  /** Called when the clear animation completes */
  onCleared?: () => void
}

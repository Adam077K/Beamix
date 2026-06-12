'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import type { StageState } from '@/components/console/pipeline-contract'
import type { PipelineStage } from '@/lib/agents/types'
import type { Workflow, DryRunStep } from '@/lib/demo/surfaces'
import { Button } from '@/components/ui/button'

/**
 * DryRunLedger — the signature moment.
 *
 * Reuses the violet console PipelineLedger (`mode=dryrun` grammar) to stream
 * each agent node's would-be execution: step counts, estimated cost, estimated
 * outputs — WITHOUT executing or consuming a credit. Same grammar as /ask's
 * thinking state, so the two surfaces feel like one product.
 *
 * The fixture's DryRunStep.figure carries the real estimate; we re-stream the
 * rows from queued→active→done so the engine-room moment reads as live.
 */

interface DryRunLedgerProps {
  workflow: Workflow
  steps: DryRunStep[]
  estCost: string
  onClose: () => void
  /** When true, the run is shown as an error on the named failing step */
  errorAtStep?: number | null
}

const FALLBACK_TYPES: PipelineStage[] = ['plan', 'research', 'do', 'qa', 'summarize']

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function DryRunLedger({
  workflow,
  steps,
  estCost,
  onClose,
  errorAtStep = null,
}: DryRunLedgerProps) {
  // Map fixture steps → console StageState, keyed by node type order.
  const baseStages = steps.map((s, i) => ({
    id: (workflow.nodes[i]?.type ?? FALLBACK_TYPES[i] ?? 'do') as PipelineStage,
    label: s.label,
    figure: s.figure,
  }))

  // How many rows have completed (drives the live stream).
  const [activeIndex, setActiveIndex] = useState(errorAtStep != null ? steps.length : 0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (errorAtStep != null) return
    if (prefersReducedMotion()) {
      setActiveIndex(steps.length)
      return
    }
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setActiveIndex(0)
    for (let i = 1; i <= steps.length; i++) {
      timers.current.push(window.setTimeout(() => setActiveIndex(i), i * 650))
    }
    return () => timers.current.forEach((t) => window.clearTimeout(t))
  }, [workflow.name, steps.length, errorAtStep])

  const stages: StageState[] = baseStages.map((s, i) => {
    let status: StageState['status']
    if (errorAtStep != null) {
      if (i < errorAtStep) status = 'done'
      else if (i === errorAtStep) status = 'error'
      else status = 'queued'
    } else if (i < activeIndex) status = 'done'
    else if (i === activeIndex) status = 'active'
    else status = 'queued'

    return {
      id: s.id,
      label: s.label,
      status,
      substep: status === 'active' ? `estimating · ${s.figure}` : status === 'done' ? s.figure : null,
    }
  })

  const currentSubstep =
    errorAtStep != null
      ? null
      : activeIndex < steps.length
        ? `estimating ${baseStages[activeIndex]?.label.toLowerCase() ?? 'step'}…`
        : 'estimate complete — no credits spent'

  const complete = errorAtStep == null && activeIndex >= steps.length

  return (
    <aside
      className="card-console-hero flex w-full flex-col overflow-hidden"
      aria-label="Dry-run preview"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#6E56F0]">
            Dry run
          </p>
          <p className="mt-1.5 text-[14px] font-medium text-[#0A0A0A]">
            What this workflow would do
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close dry-run preview"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* The violet ledger */}
      <div className="p-5">
        <PipelineLedger
          stages={stages}
          agentLabel={workflow.name}
          currentSubstep={currentSubstep}
        />

        {/* Cost summary — Geist Mono truth */}
        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-card)] border border-[#E5E7EB] bg-[#F7F6F2] px-4 py-3">
          <span className="text-[13px] text-[#6B7280]">
            {complete ? 'Estimated cost' : 'Estimating…'}
          </span>
          <span className="font-[var(--font-mono)] text-[15px] font-medium tabular-nums text-[#0A0A0A]">
            ~{estCost}
          </span>
        </div>

        {errorAtStep != null ? (
          <div className="mt-4 rounded-[var(--radius-card)] border border-[#FDECEC] bg-[#FDECEC]/40 px-4 py-3">
            <p className="text-[13px] font-medium text-[#DC2626]">
              Step {errorAtStep + 1} can&apos;t run — {steps[errorAtStep]?.label.toLowerCase()} is missing a target.
            </p>
            <div className="mt-3">
              <Button size="sm" onClick={onClose}>
                Fix and re-run
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[12px] leading-[1.5] text-[#9CA3AF]">
            This is an estimate. No credits are spent until you run for real.
          </p>
        )}
      </div>
    </aside>
  )
}

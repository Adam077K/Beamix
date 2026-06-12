'use client'

import { Play, FlaskConical, Layers, Coins, Workflow as WorkflowIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Workflow } from '@/lib/demo/surfaces'
import { NODE_VOCAB } from './node-vocab'

/**
 * BuilderRail — the persistent right rail that EARNS the canvas's freed width
 * (P1-1 / M3). At rest it shows the honest resting figure the page never used to
 * surface (P2-3): total steps + estimated cost in commanding Geist Mono, plus a
 * compact per-stage breakdown and the primary Run / Dry-run controls. It is the
 * weighted right column that stops the canvas reading as a ribbon in a void.
 *
 * When dry-run is open the rail is REPLACED in place by the DryRunLedger (in
 * BuilderSurface) — so the signature moment streams where the user is already
 * looking, never floating in dead space.
 *
 * blue = your actions (Run, Dry run); violet = the resting cost figure ground
 * (it estimates the agents' work). Violet never on a button.
 */

interface BuilderRailProps {
  workflow: Workflow
  estCost: string
  onDryRun: () => void
  onRun: () => void
  disabled?: boolean
}

export function BuilderRail({
  workflow,
  estCost,
  onDryRun,
  onRun,
  disabled = false,
}: BuilderRailProps) {
  const totalSteps = workflow.nodes.reduce(
    (sum, n) => sum + NODE_VOCAB[n.type].steps,
    0,
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Resting cost panel — the commanding figure (M2 STEP-1 / M11) */}
      <section className="agent-zone agent-zone-accent overflow-hidden">
        <div className="px-5 pb-5 pt-4">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#6E56F0]">
            This run
          </p>

          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="font-[var(--font-mono)] text-[34px] font-medium leading-none tabular-nums text-[#0A0A0A]">
                {totalSteps}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                <Layers className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
                agent steps
              </p>
            </div>
            <div className="h-10 w-px bg-[var(--color-agent-hairline)]" aria-hidden="true" />
            <div>
              <p className="font-[var(--font-mono)] text-[34px] font-medium leading-none tabular-nums text-[#0A0A0A]">
                {estCost.replace('$', '$')}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                <Coins className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
                est. per run
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-[1.5] text-[#6B7280]">
            Honest estimate before a single credit is spent. Dry-run to see what
            each agent would produce.
          </p>
        </div>

        {/* Controls — blue actions live in the rail now */}
        <div className="flex gap-2 border-t border-[var(--color-agent-hairline)] bg-white/40 px-5 py-4">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={onDryRun}
            disabled={disabled}
          >
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Dry run
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={onRun}
            disabled={disabled}
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Run
          </Button>
        </div>
      </section>

      {/* Per-stage breakdown — the rail carries real information, not filler */}
      <section className="card-inset overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] px-5 py-3">
          <WorkflowIcon className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Stage breakdown
          </p>
        </div>
        <ul className="divide-y divide-[var(--color-border-subtle)]">
          {workflow.nodes.map((node) => {
            const meta = NODE_VOCAB[node.type]
            const Icon = meta.icon
            const isHeavy = meta.steps >= 4
            return (
              <li
                key={node.id}
                className="flex items-center gap-3 px-5 py-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EEEAFD] text-[#6E56F0]">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#0A0A0A]">
                  {meta.eyebrow.charAt(0) + meta.eyebrow.slice(1).toLowerCase()}
                </span>
                <span
                  className={
                    'font-[var(--font-mono)] text-[11px] tabular-nums ' +
                    (isHeavy ? 'font-medium text-[#6E56F0]' : 'text-[#9CA3AF]')
                  }
                >
                  {meta.steps} {meta.steps === 1 ? 'step' : 'steps'}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type ToolPageState = 'idle' | 'running' | 'success' | 'empty' | 'error'

export interface ToolPageProps {
  // Zone 1 — Context Header
  eyebrow: string
  title: string
  whatThisDoes: string
  contextStat: ReactNode

  // Zone 2 — Input Panel
  inputPanel: ReactNode
  /** Rendered when inputCollapsed is true (after a successful run) */
  collapsedSummary?: ReactNode
  inputCollapsed?: boolean
  onToggleInput?: () => void

  // Zone 3 — Run Control (pass null to suppress Zone 3 entirely)
  runControl: ReactNode | null

  // Zone 4 — Pipeline Ledger (shown while running)
  ledger?: ReactNode

  // Zone 5 — Output (shown when success)
  output?: ReactNode

  // State routing
  state: ToolPageState

  // Zone 6 — History link
  historyHref?: string

  className?: string
}

/**
 * ToolPage — the 5-zone Console Spine wrapper (CONSOLE-SPINE-DIRECTION.md §A).
 *
 * Single-column max-w-[880px] document, centered in DashboardShell main area.
 * M12 explicit rhythm: header→input 32px · input→run 24px · run→ledger 32px
 * · ledger→output 40px. NOT a global space-y.
 *
 * Depth staging (M1):
 *   Zone 1 = TIER-3 .card-inset
 *   Zone 2 = TIER-2 .card-console (or .card-inset when collapsed)
 *   Zone 5 = TIER-1 .card-console-hero (when populated)
 *
 * State routing:
 *   idle     → Zones 1, 2, 3 (input expanded)
 *   running  → Zones 1, 2 (collapsed or input), 3, 4 (ledger)
 *   success  → Zones 1, 2 (collapsed), 3, 5 (output)
 *   empty    → caller supplies EmptyState via output prop (rendered in Zone 5 position)
 *   error    → caller supplies ErrorState via output prop
 */
export function ToolPage({
  eyebrow,
  title,
  whatThisDoes,
  contextStat,
  inputPanel,
  collapsedSummary,
  inputCollapsed = false,
  runControl,
  ledger,
  output,
  state,
  historyHref,
  className,
}: ToolPageProps) {
  const showLedger = state === 'running' && !!ledger
  const showOutput = (state === 'success' || state === 'empty' || state === 'error') && !!output

  return (
    <div className={cn('mx-auto w-full max-w-[880px] px-4 pb-16 pt-8 sm:px-6', className)}>
      {/* Zone 1 — Context Header (TIER-3 .card-inset) */}
      {/* M9 entrance stagger: zone 1 is enter-1 */}
      <div className="card-inset craft-enter craft-enter-1 px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          {/* Left dominant column */}
          <div className="min-w-0 flex-1">
            {/* STEP-3 eyebrow */}
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {eyebrow}
            </p>
            {/* STEP-2 title */}
            <h1
              className="font-[var(--font-display)] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]"
            >
              {title}
            </h1>
            {/* STEP-4 what-this-does */}
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7280]">
              {whatThisDoes}
            </p>
          </div>

          {/* Right narrow rail — the single context stat */}
          <div className="shrink-0">
            {contextStat}
          </div>
        </div>
      </div>

      {/* Zone 2 — Input Panel (TIER-2) */}
      {/* M12: 32px gap from Zone 1 */}
      <div className="craft-enter craft-enter-2 mt-8">
        {inputCollapsed && collapsedSummary ? (
          // Collapsed: show summary bar (still TIER-3)
          <div>{collapsedSummary}</div>
        ) : (
          // Expanded: full input panel (TIER-2)
          <div className="card-console overflow-hidden">
            {inputPanel}
          </div>
        )}
      </div>

      {/* Zone 3 — Run Control (only rendered when runControl is provided) */}
      {/* M12: 24px gap from Zone 2 */}
      {runControl && (
        <div className="craft-enter craft-enter-3 mt-6">
          {runControl}
        </div>
      )}

      {/* Zone 4 — Live Pipeline Ledger (running state only) */}
      {/* M12: 32px gap from Zone 3 */}
      {showLedger && (
        <div className="craft-enter craft-enter-4 mt-8">
          {ledger}
        </div>
      )}

      {/* Zone 5 — Output Zone (TIER-1 when populated) */}
      {/* M12: 40px gap from Zone 4 (or 3 if no ledger) */}
      {showOutput && (
        <div
          className="craft-enter craft-enter-5 mt-10"
        >
          {(state === 'success') ? (
            <div className="card-console-hero overflow-hidden">
              {output}
            </div>
          ) : (
            // empty / error states render their own containers
            <div>{output}</div>
          )}
        </div>
      )}

      {/* Zone 6 — Run History link */}
      {historyHref && (
        <div className="mt-8 craft-enter craft-enter-6">
          <Link
            href={historyHref}
            className="text-[13px] text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            View in Run History →
          </Link>
        </div>
      )}
    </div>
  )
}

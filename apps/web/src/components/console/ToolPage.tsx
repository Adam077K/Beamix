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

  /**
   * Working-column width. The spine is left-anchored inside the shell frame
   * (DashboardShell main = mx-auto max-w-[1200px] px-6); ToolPage no longer
   * re-centers, so the dead right-gutter is gone.
   *   'document' (default) → reading column, capped for forms/text (max-w-[760px])
   *   'wide'               → table-dense tabs (prompts/content) fill the working area
   */
  widthMode?: 'document' | 'wide'

  /**
   * "Earn the width" right rail (M3/M10). When provided, the spine becomes a
   * dominant-column + narrower-rail split instead of a column floating in a void.
   * Use for live context: last runs, engine coverage, what AI engines cite now.
   * Sticks below the fold on scroll. Hidden under lg (stacks under the spine).
   */
  rail?: ReactNode

  className?: string
}

/**
 * ToolPage — the 5-zone Console Spine wrapper (CONSOLE-SPINE-DIRECTION.md §A).
 *
 * LAYOUT (uix-f4): the spine is LEFT-ANCHORED inside the DashboardShell frame
 * (`<main>` = mx-auto max-w-[1200px] px-6, added by F1). ToolPage no longer
 * re-centers a fixed 880px doc in the wide main area — that produced the dead
 * right-gutter / "broken layout" read on every tool page (prompts P1-1,
 * blog-studio P1-2). The column is content-capped and flush-left under the page
 * chrome. `widthMode='wide'` lets table-dense tabs fill the working area; `rail`
 * earns the freed space with a persistent context rail instead of dead white.
 *
 * M12 explicit rhythm: header→input 32px · input→run 24px · run→ledger 32px
 * · ledger→output 32px. NOT a global space-y.
 *
 * Depth staging (M1) — fixed inversion (blog-studio P1-1): the receding TIER-3
 * header must not out-weigh the TIER-2 work card. Zone 1 recedes (hairline frame,
 * no shadow); Zone 2 commands with real `--shadow-card` elevation; Zone 5 is the
 * TIER-1 hero.
 *   Zone 1 = TIER-3 .card-inset (recede — the lightest surface)
 *   Zone 2 = TIER-2 .card-console (white + shadow — the brightest working surface)
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
  widthMode = 'document',
  rail,
  className,
}: ToolPageProps) {
  const showLedger = state === 'running' && !!ledger
  const showOutput = (state === 'success' || state === 'empty' || state === 'error') && !!output

  const spine = (
    <div className={cn(widthMode === 'document' && !rail && 'max-w-[760px]')}>
      {/* Zone 1 — Context Header (TIER-3 .card-inset — recedes) */}
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

      {/* Zone 2 — Input Panel (TIER-2 — the brightest working surface, commands over Zone 1) */}
      {/* M12: 32px gap from Zone 1 */}
      <div className="craft-enter craft-enter-2 mt-8">
        {inputCollapsed && collapsedSummary ? (
          // Collapsed: show summary bar (recedes — work is done, output leads)
          <div>{collapsedSummary}</div>
        ) : (
          // Expanded: full input panel (TIER-2, real elevation)
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
      {/* M12: 32px gap from Zone 4 — keeps the output's top edge above the fold */}
      {showOutput && (
        <div
          className="craft-enter craft-enter-5 mt-8"
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

  return (
    // Flush-left under the shell frame. The shell supplies the mx-auto max-w-[1200px]
    // px-6 container; ToolPage adds only the vertical rhythm + (optional) rail split.
    <div className={cn('w-full pb-16 pt-8', className)}>
      {rail ? (
        // "Earn the width" (M3/M10): dominant spine + narrower context rail.
        // Stacks under lg; the rail sticks below the fold on wide viewports.
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">{spine}</div>
          <aside className="craft-enter craft-enter-2 lg:sticky lg:top-8 lg:self-start">
            {rail}
          </aside>
        </div>
      ) : (
        spine
      )}
    </div>
  )
}

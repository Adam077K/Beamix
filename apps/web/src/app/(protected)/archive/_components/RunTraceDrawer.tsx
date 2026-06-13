'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PipelineLedger } from '@/components/console/PipelineLedger'
import { cn } from '@/lib/utils'
import type { RunRow, RunTrace } from '@/lib/demo/surfaces/types'
import type { StageState } from '@/components/console/pipeline-contract'
import type { PipelineStage } from '@/lib/agents/types'

// ---------------------------------------------------------------------------
// Map RunTrace stages → StageState for the PipelineLedger
// ---------------------------------------------------------------------------

function mapToStageState(
  stage: RunTrace['stages'][number],
): StageState {
  // For the archive trace we always show the final completed/error state:
  // 'done' or 'error'. The ledger will render these as static (no animation).
  return {
    id: stage.id as PipelineStage,
    label: stage.label,
    // RunTrace only has 'done' | 'error' per types.ts
    status: stage.status,
    substep: stage.status === 'done' ? stage.substep : null,
  }
}

// ---------------------------------------------------------------------------
// Duration formatter (Geist Mono per M11)
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  if (ms === 0) return '—'
  if (ms >= 60_000) {
    const m = Math.floor(ms / 60_000)
    const s = Math.floor((ms % 60_000) / 1000)
    return `${m}m ${s}s`
  }
  return `${(ms / 1000).toFixed(1)}s`
}

// ---------------------------------------------------------------------------
// Total run cost / duration from trace
// ---------------------------------------------------------------------------

function totalDurationMs(trace: RunTrace): number {
  return trace.stages.reduce((acc, s) => acc + s.durationMs, 0)
}

// ---------------------------------------------------------------------------
// Stage status label (compact, for the trace summary table)
// ---------------------------------------------------------------------------

function StageStatusGlyph({ status }: { status: 'done' | 'error' }) {
  if (status === 'done') {
    return (
      // Filled violet check circle — M6 DONE glyph
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#6E56F0" />
        <path
          d="M5 8.5l2 2 4-4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="#E5E7EB" strokeWidth="1.5" fill="white" />
      <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Mode / Status summary pills (reuse design from RunTable)
// ---------------------------------------------------------------------------

function DrawerModePill({ mode }: { mode: RunRow['mode'] }) {
  if (mode === 'myself') {
    return (
      <span className="inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#3370FF]">
        Manual
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-[#6E56F0]"
      style={{ backgroundColor: '#EEEAFD', boxShadow: 'inset 0 0 0 1px rgba(110,86,240,0.18)' }}
    >
      Autonomous
    </span>
  )
}

// ---------------------------------------------------------------------------
// No trace fallback
// ---------------------------------------------------------------------------

function NoTrace() {
  return (
    <div
      className="flex items-center justify-center rounded-[var(--radius-card)] px-6 py-10 text-center"
      style={{ backgroundColor: '#EEEAFD', border: '1px solid rgba(110,86,240,0.12)' }}
    >
      <p className="text-sm text-[#6E56F0]/70">Pipeline trace not available for this run.</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main drawer
// ---------------------------------------------------------------------------

interface RunTraceDrawerProps {
  open: boolean
  row: RunRow | null
  trace: RunTrace | undefined
  onClose: () => void
}

export function RunTraceDrawer({ open, row, trace, onClose }: RunTraceDrawerProps) {
  if (!row) return null

  const stageStates: StageState[] = trace
    ? trace.stages.map(mapToStageState)
    : []

  const totalMs = trace ? totalDurationMs(trace) : 0
  const successStages = stageStates.filter((s) => s.status === 'done').length

  // Determine the "last substep" for the PipelineLedger currentSubstep
  // (static trace — show last done stage substep or null)
  const lastDoneSubstep =
    stageStates
      .filter((s) => s.status === 'done' && s.substep)
      .at(-1)?.substep ?? null

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-[520px]"
        aria-label={`Run trace for ${row.agentLabel}`}
      >
        {/* Header */}
        <SheetHeader className="mb-6 pr-6">
          <div className="mb-3 flex items-center gap-2">
            <DrawerModePill mode={row.mode} />
            {row.status === 'failed' && (
              <span className="inline-flex items-center rounded-md bg-[#FDECEC] px-2 py-0.5 text-xs font-medium text-[#DC2626]">
                Failed
              </span>
            )}
            {row.status === 'success' && (
              <span className="inline-flex items-center rounded-md bg-[#E6F5EE] px-2 py-0.5 text-xs font-medium text-[#0E9E6E]">
                Done
              </span>
            )}
            {row.status === 'running' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EEEAFD] px-2 py-0.5 text-xs font-medium text-[#6E56F0]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
                Running
              </span>
            )}
          </div>

          <SheetTitle className="font-[var(--font-display)] text-[30px] font-medium leading-[1.2] tracking-[-0.02em] text-[#0A0A0A]">
            {row.agentLabel}
          </SheetTitle>

          {/* Meta line — Geist Mono per M11 */}
          <SheetDescription asChild>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-[var(--font-mono)] text-xs tabular-nums text-[#6B7280]">
                {new Date(row.timestamp).toLocaleString('en-IL', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
              {totalMs > 0 && (
                <span className="font-[var(--font-mono)] text-xs tabular-nums text-[#9CA3AF]">
                  {formatDuration(totalMs)} total
                </span>
              )}
              {row.costUsd > 0 && (
                <span className="font-[var(--font-mono)] text-xs tabular-nums text-[#9CA3AF]">
                  ${row.costUsd.toFixed(2)} cost
                </span>
              )}
              {trace && (
                <span className="font-[var(--font-mono)] text-xs tabular-nums text-[#9CA3AF]">
                  {successStages}/{trace.stages.length} stages
                </span>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {/* Output snippet */}
        <div
          className="mb-6 rounded-lg p-4"
          style={{ backgroundColor: '#F7F6F2', border: '1px solid #E5E7EB' }}
        >
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Output summary
          </p>
          <p className="text-sm leading-relaxed text-[#374151]">{row.snippet}</p>
        </div>

        {/* Pipeline trace — violet structure (M6), clearing=false = static replay */}
        <div className="mb-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Pipeline trace
          </p>
          {trace && stageStates.length > 0 ? (
            <PipelineLedger
              stages={stageStates}
              agentLabel={row.agentLabel}
              currentSubstep={lastDoneSubstep}
              clearing={false}
            />
          ) : (
            <NoTrace />
          )}
        </div>

        {/* Per-stage timing table */}
        {trace && trace.stages.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              Stage timings
            </p>
            <div
              className="overflow-hidden rounded-lg"
              style={{ border: '1px solid #E5E7EB' }}
            >
              {trace.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3',
                    i < trace.stages.length - 1 && 'border-b border-[#F3F4F6]',
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <StageStatusGlyph status={stage.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-[#0A0A0A]">{stage.label}</span>
                    {stage.substep && stage.status === 'done' && (
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">{stage.substep}</p>
                    )}
                    {stage.status === 'error' && stage.substep && (
                      <p className="mt-0.5 truncate text-xs text-[#DC2626]">{stage.substep}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 font-[var(--font-mono)] text-xs tabular-nums',
                      stage.durationMs > 0 ? 'text-[#9CA3AF]' : 'text-[#D1D5DB]',
                    )}
                  >
                    {formatDuration(stage.durationMs)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-[#E5E7EB] pt-5">
          <Button
            size="sm"
            className="flex-1"
            aria-label={`Run ${row.agentLabel} again`}
            onClick={() => {
              // Phase 1: demo-only, no backend
              alert(`"Run again" will dispatch a new ${row.agentLabel} job. (Wired in Phase 2.)`)
            }}
          >
            Run again
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="/automation" aria-label="Open Automation Center">
              Open in Automation
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

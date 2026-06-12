'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RunRow, RunTrace } from '@/lib/demo/surfaces/types'
import { RunTraceDrawer } from './RunTraceDrawer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TableState = 'loading' | 'error' | 'empty' | 'populated'

interface RunTableProps {
  state: TableState
  rows?: RunRow[]
  traces?: Record<string, RunTrace>
  onRetry?: () => void
}

// ---------------------------------------------------------------------------
// Helpers — every figure here is derived from REAL trace data (M11, never fake)
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString('en-IL', { day: '2-digit', month: 'short', year: '2-digit' })
}

function formatCost(usd: number): string {
  if (usd === 0) return 'free'
  if (usd < 0.01) return '<$0.01'
  return `$${usd.toFixed(2)}`
}

/** Total wall-clock of a run = Σ stage durations. Real data, never fabricated. */
function totalDurationMs(trace: RunTrace | undefined): number {
  if (!trace) return 0
  return trace.stages.reduce((acc, s) => acc + s.durationMs, 0)
}

/** Human duration, the row's dominant mono figure. */
function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  if (ms >= 60_000) {
    const m = Math.floor(ms / 60_000)
    const s = Math.round((ms % 60_000) / 1000)
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  if (ms >= 10_000) return `${Math.round(ms / 1000)}s`
  return `${(ms / 1000).toFixed(1)}s`
}

/** completed stages / total stages — the secondary truth that recedes under duration. */
function stageProgress(trace: RunTrace | undefined): { done: number; total: number } | null {
  if (!trace || trace.stages.length === 0) return null
  const done = trace.stages.filter((s) => s.status === 'done').length
  return { done, total: trace.stages.length }
}

// ---------------------------------------------------------------------------
// Status Badge — status pill per DESIGN-VISION.md §status-pill-set
// (Status keeps the PILL shape; Mode is downgraded to a dot+text so the
//  you-vs-agents axis reads spatially, not as a fourth interchangeable tag.)
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  RunRow['status'],
  { label: string; textClass: string; bgClass: string; rail: string }
> = {
  success: {
    label: 'Done',
    textClass: 'text-[#0E9E6E]',
    bgClass: 'bg-[#E6F5EE]',
    rail: '#0E9E6E',
  },
  failed: {
    label: 'Failed',
    textClass: 'text-[#DC2626]',
    bgClass: 'bg-[#FDECEC]',
    rail: '#DC2626',
  },
  running: {
    label: 'Running',
    textClass: 'text-[#6E56F0]',
    bgClass: 'bg-[#EEEAFD]',
    rail: '#6E56F0',
  },
}

function StatusPill({ status }: { status: RunRow['status'] }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        config.bgClass,
        config.textClass,
      )}
    >
      {status === 'running' && (
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Mode signal — blue=you / violet=beamix (M6 law). Rendered as a quiet
// dot+label, NOT a pill, so it stops competing with the Status pill and the
// you-vs-agents axis is glanceable at arm's length (tell #8).
// ---------------------------------------------------------------------------

function ModeSignal({ mode }: { mode: RunRow['mode'] }) {
  const isAgent = mode === 'beamix'
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium"
      style={{ color: isAgent ? '#6E56F0' : '#3370FF' }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: isAgent ? '#6E56F0' : '#3370FF' }}
        aria-hidden="true"
      />
      {isAgent ? 'Beamix' : 'You'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Filter bar — tightened control cluster (M12). The run count sits on the same
// hairline row, right-aligned, so the bar reads as one control surface.
// ---------------------------------------------------------------------------

const AGENT_OPTIONS = [
  'All agents',
  'Content Optimizer',
  'Schema Generator',
  'Query Mapper',
  'FAQ Builder',
  'Freshness Agent',
  'Off-Site Presence Builder',
  'Performance Tracker',
  'Entity Builder',
  'Review Presence Planner',
  'Authority Blog Strategist',
  'Reddit Presence Planner',
]

const STATUS_OPTIONS = ['All statuses', 'success', 'failed', 'running']
const MODE_OPTIONS = ['All modes', 'myself', 'beamix']

interface FilterState {
  agent: string
  status: string
  mode: string
}

const DEFAULT_FILTERS: FilterState = {
  agent: 'All agents',
  status: 'All statuses',
  mode: 'All modes',
}

function isActiveFilter(f: FilterState): boolean {
  return (
    f.agent !== 'All agents' ||
    f.status !== 'All statuses' ||
    f.mode !== 'All modes'
  )
}

function FilterBar({
  filters,
  onChange,
  countLabel,
  active,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  countLabel: string
  active: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Control cluster — tight gap signals "these belong together" */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Filter runs"
      >
        <Select
          value={filters.agent}
          onValueChange={(v) => onChange({ ...filters, agent: v })}
        >
          <SelectTrigger
            className={cn(
              'h-8 w-[176px] text-xs',
              filters.agent !== 'All agents' &&
                'ring-1 ring-[#3370FF]/30 ring-offset-0',
            )}
            aria-label="Filter by agent"
          >
            <SelectValue placeholder="All agents" />
          </SelectTrigger>
          <SelectContent>
            {AGENT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v })}
        >
          <SelectTrigger
            className={cn(
              'h-8 w-[136px] text-xs',
              filters.status !== 'All statuses' &&
                'ring-1 ring-[#3370FF]/30 ring-offset-0',
            )}
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs capitalize">
                {opt === 'myself' ? 'Manual' : opt === 'beamix' ? 'Autonomous' : opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.mode}
          onValueChange={(v) => onChange({ ...filters, mode: v })}
        >
          <SelectTrigger
            className={cn(
              'h-8 w-[136px] text-xs',
              filters.mode !== 'All modes' &&
                'ring-1 ring-[#3370FF]/30 ring-offset-0',
            )}
            aria-label="Filter by mode"
          >
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt === 'myself' ? 'By you' : opt === 'beamix' ? 'By Beamix' : opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {active && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="ml-0.5 text-xs text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Count — right-aligned on the same row, mono for truth (M11) */}
      <p className="font-[var(--font-mono)] text-xs tabular-nums text-[#9CA3AF]">
        {countLabel}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TIER-3 summary strip (M1) — a recessed .card-inset meta band ABOVE the table
// so the TIER-1 table card visibly lifts against a recessed plane. Carries the
// run-level truth figures (total runs, agent share, total spend) in mono, plus
// the one Fraunces verdict beat (M5) relocated here from the dead subtitle.
// ---------------------------------------------------------------------------

function SummaryStrip({
  rows,
  traces,
}: {
  rows: RunRow[]
  traces: Record<string, RunTrace>
}) {
  const total = rows.length
  const agentRuns = rows.filter((r) => r.mode === 'beamix').length
  const failed = rows.filter((r) => r.status === 'failed').length
  const totalSpend = rows.reduce((acc, r) => acc + r.costUsd, 0)
  const totalSeconds =
    rows.reduce((acc, r) => acc + totalDurationMs(traces[r.id]), 0) / 1000

  // Verdict word reflects the real run health — chosen, not faked.
  const verdict = failed === 0 ? 'clean' : failed <= 2 ? 'steady' : 'noisy'

  return (
    <div className="card-inset mb-5 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        {/* Verdict sentence — the one editorial Fraunces beat lands here (M5) */}
        <p className="max-w-[320px] text-[13px] leading-relaxed text-[#6B7280]">
          {total} runs this period — mostly{' '}
          <SerifVerdict size="inline">{verdict}</SerifVerdict>
          {failed > 0
            ? `, ${failed} need a retry.`
            : ', nothing needs a retry.'}
        </p>

        {/* Run-level truth figures — mono, right rail (M11, M2 STEP-4→sm) */}
        <div className="flex items-center gap-6 sm:gap-8">
          <StripStat
            value={agentRuns}
            unit={`/${total}`}
            label="By Beamix"
            valueColor="#6E56F0"
          />
          <StripStat
            value={`${Math.round(totalSeconds)}s`}
            label="Compute"
          />
          <StripStat
            value={totalSpend === 0 ? 'free' : `$${totalSpend.toFixed(2)}`}
            label="Spend"
          />
        </div>
      </div>
    </div>
  )
}

function StripStat({
  value,
  unit,
  label,
  valueColor,
}: {
  value: string | number
  unit?: string
  label: string
  valueColor?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-[var(--font-mono)] text-[20px] leading-none tracking-[-0.01em] tabular-nums"
        style={{ color: valueColor ?? '#0A0A0A' }}
      >
        {value}
        {unit && (
          <span className="ml-0.5 text-[13px] text-[#9CA3AF]">{unit}</span>
        )}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton rows — reads as the real table shape
// ---------------------------------------------------------------------------

function SkeletonRows() {
  return (
    <div aria-busy="true" aria-label="Loading run history">
      {/* TIER-3 strip skeleton */}
      <div className="card-inset mb-5 flex items-center justify-between px-5 py-4">
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-8">
          <Skeleton className="h-9 w-14" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-14" />
        </div>
      </div>
      {/* Filter bar skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-[176px]" />
          <Skeleton className="h-8 w-[136px]" />
          <Skeleton className="h-8 w-[136px]" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      {/* Table header skeleton */}
      <div className="mb-3 grid grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#E5E7EB] pb-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12" />
        <span />
      </div>
      {/* Row skeletons — fading opacity */}
      {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#F3F4F6] py-3.5"
          style={{ opacity }}
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 w-10" />
          <span />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state — two-tier recovery per M8
// ---------------------------------------------------------------------------

function EmptyFiltered({ onReset }: { onReset: () => void }) {
  return (
    <div className="card-inset flex flex-col items-center px-6 py-14 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: '#ECE7FB' }}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="6.5" stroke="#6E56F0" strokeWidth="1.5" />
          <line
            x1="14.8"
            y1="14.8"
            x2="18.5"
            y2="18.5"
            stroke="#6E56F0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-[#0A0A0A]">
        No runs match those filters
      </h3>
      <p className="mb-5 max-w-[300px] text-sm text-[#6B7280]">
        Nothing here yet — try widening the filter, or clear all to see every run.
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={onReset}>
          Clear filters
        </Button>
        <a
          href="/automation"
          className="text-sm text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline"
        >
          Go to Automation
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main table row — the dense, rank-and-figure row (P1-2, M4/M7/M11).
// The DURATION figure is promoted to the dominant mono metric that carries the
// row; step-progress recedes beneath it. A status-color hairline appears on the
// left on hover (M7).
// ---------------------------------------------------------------------------

interface RunRowItemProps {
  row: RunRow
  trace: RunTrace | undefined
  onSelect: (row: RunRow) => void
}

function RunRowItem({ row, trace, onSelect }: RunRowItemProps) {
  const durationMs = totalDurationMs(trace)
  const progress = stageProgress(trace)
  const rail = STATUS_CONFIG[row.status].rail
  const isLong = durationMs >= 60_000 // outlier band (e.g. the 9m timeout)

  return (
    <div
      className={cn(
        'group relative grid cursor-pointer grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#F3F4F6] py-3.5',
        'transition-colors hover:bg-[#F4F6FA] focus-within:bg-[#F4F6FA]',
      )}
      onClick={() => onSelect(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(row)
        }
      }}
      tabIndex={0}
      role="row"
      aria-label={`${row.agentLabel} run, ${row.status}, ${formatTimestamp(row.timestamp)}, ${formatDuration(durationMs)}`}
    >
      {/* M7 left status-color hairline — only on hover/focus */}
      <span
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ backgroundColor: rail }}
        aria-hidden="true"
      />

      {/* Agent name (weight anchor, M2) + receding single-line snippet */}
      <div className="min-w-0" role="cell">
        <span className="block text-[14px] font-semibold text-[#0A0A0A]">
          {row.agentLabel}
        </span>
        <span
          className="mt-0.5 block truncate text-xs text-[#9CA3AF]"
          title={row.snippet}
        >
          {row.snippet}
        </span>
      </div>

      {/* Mode signal — dot+label, blue=you / violet=Beamix (M6) */}
      <div className="justify-self-start" role="cell">
        <ModeSignal mode={row.mode} />
      </div>

      {/* Status pill */}
      <div className="justify-self-start" role="cell">
        <StatusPill status={row.status} />
      </div>

      {/* DURATION — the promoted mono figure that carries the row (M4/M7/M11) */}
      <div className="justify-self-end text-right" role="cell">
        <span
          className={cn(
            'block font-[var(--font-mono)] text-[16px] leading-none tabular-nums tracking-[-0.01em]',
            durationMs <= 0
              ? 'text-[#D1D5DB]'
              : isLong
                ? 'text-[#DC2626]'
                : 'text-[#0A0A0A]',
          )}
        >
          {formatDuration(durationMs)}
        </span>
        {progress && (
          <span className="mt-1 block font-[var(--font-mono)] text-[11px] leading-none tabular-nums text-[#9CA3AF]">
            {progress.done}/{progress.total} steps
          </span>
        )}
      </div>

      {/* Time + cost — quiet mono right rail */}
      <div className="justify-self-end text-right" role="cell">
        <span className="block font-[var(--font-mono)] text-xs leading-none tabular-nums text-[#6B7280]">
          {formatTimestamp(row.timestamp)}
        </span>
        <span
          className={cn(
            'mt-1 block font-[var(--font-mono)] text-[11px] leading-none tabular-nums',
            row.costUsd === 0 ? 'text-[#C7CBD1]' : 'text-[#9CA3AF]',
          )}
        >
          {formatCost(row.costUsd)}
        </span>
      </div>

      {/* Chevron — flush to the row's right edge */}
      <div className="justify-self-end" role="cell">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-[#D1D5DB] transition-transform group-hover:translate-x-0.5 group-hover:text-[#9CA3AF]"
          aria-hidden="true"
        >
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RunTable({ state, rows = [], traces = {}, onRetry }: RunTableProps) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS })
  const [selectedRow, setSelectedRow] = useState<RunRow | null>(null)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.agent !== 'All agents' && row.agentLabel !== filters.agent) return false
      if (filters.status !== 'All statuses' && row.status !== filters.status) return false
      if (filters.mode !== 'All modes' && row.mode !== filters.mode) return false
      return true
    })
  }, [rows, filters])

  // ----- Loading state -----
  if (state === 'loading') {
    return <SkeletonRows />
  }

  // ----- Error state -----
  if (state === 'error') {
    return (
      <ErrorState
        title="Couldn't load run history"
        description="Run history is stored locally — this usually clears up on retry."
        onRetry={onRetry}
        retryLabel="Try again"
      />
    )
  }

  // ----- Empty state (no runs ever) -----
  if (state === 'empty' || rows.length === 0) {
    return (
      <EmptyState
        illustration="archive"
        title="No runs yet"
        description="Every manual and autonomous agent run appears here. Start your first run from any tool."
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild>
              <a href="/automation">Open Automation Center</a>
            </Button>
            <a
              href="/prompts"
              className="text-sm text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline"
            >
              Start with Query Mapper
            </a>
          </div>
        }
        align="top"
      />
    )
  }

  // ----- Populated state -----
  const active = isActiveFilter(filters)
  const countLabel = active
    ? `${filteredRows.length} of ${rows.length} runs`
    : `${rows.length} runs`

  return (
    <>
      {/* TIER-3 recessed summary strip — the depth differential (M1) */}
      <SummaryStrip rows={rows} traces={traces} />

      {/* Filter bar + inline count (M12) */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          countLabel={countLabel}
          active={active}
        />
      </div>

      {/* No-match state after filtering */}
      {filteredRows.length === 0 ? (
        <EmptyFiltered onReset={() => setFilters({ ...DEFAULT_FILTERS })} />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[680px]" role="table" aria-label="Run history">
            {/* Header — column labels aligned to their cells */}
            <div
              className="grid grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#E5E7EB] pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]"
              role="row"
            >
              <span role="columnheader">Agent</span>
              <span className="justify-self-start" role="columnheader">
                By
              </span>
              <span className="justify-self-start" role="columnheader">
                Status
              </span>
              <span className="justify-self-end text-right" role="columnheader">
                Duration
              </span>
              <span className="justify-self-end text-right" role="columnheader">
                When
              </span>
              <span role="columnheader" aria-hidden="true" />
            </div>

            {/* Rows */}
            <div role="rowgroup">
              {filteredRows.map((row) => (
                <RunRowItem
                  key={row.id}
                  row={row}
                  trace={traces[row.id]}
                  onSelect={setSelectedRow}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <RunTraceDrawer
        open={selectedRow !== null}
        row={selectedRow}
        trace={selectedRow ? traces[selectedRow.id] : undefined}
        onClose={() => setSelectedRow(null)}
      />
    </>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
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
// Helpers
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
  if (usd === 0) return '—'
  if (usd < 0.01) return '<$0.01'
  return `$${usd.toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Status Badge — status pill per DESIGN-VISION.md §status-pill-set
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  RunRow['status'],
  { label: string; textClass: string; bgClass: string }
> = {
  success: {
    label: 'Done',
    textClass: 'text-[#0E9E6E]',
    bgClass: 'bg-[#E6F5EE]',
  },
  failed: {
    label: 'Failed',
    textClass: 'text-[#DC2626]',
    bgClass: 'bg-[#FDECEC]',
  },
  running: {
    label: 'Running',
    textClass: 'text-[#6E56F0]',
    bgClass: 'bg-[#EEEAFD]',
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
// Mode Badge — blue=you / violet=beamix (M6 law enforced here)
// ---------------------------------------------------------------------------

function ModeBadge({ mode }: { mode: RunRow['mode'] }) {
  if (mode === 'myself') {
    return (
      <span className="inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#3370FF]">
        Manual
      </span>
    )
  }
  return (
    // violet-tint ground + violet ring (NEVER a solid violet button)
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-[#6E56F0]"
      style={{ backgroundColor: '#EEEAFD', boxShadow: 'inset 0 0 0 1px rgba(110,86,240,0.18)' }}
    >
      Autonomous
    </span>
  )
}

// ---------------------------------------------------------------------------
// Filter bar
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

function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter runs"
    >
      <Select
        value={filters.agent}
        onValueChange={(v) => onChange({ ...filters, agent: v })}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs" aria-label="Filter by agent">
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
        <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Filter by status">
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
        <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Filter by mode">
          <SelectValue placeholder="All modes" />
        </SelectTrigger>
        <SelectContent>
          {MODE_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {opt === 'myself' ? 'Manual' : opt === 'beamix' ? 'Autonomous' : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.agent !== 'All agents' ||
        filters.status !== 'All statuses' ||
        filters.mode !== 'All modes') && (
        <button
          type="button"
          onClick={() =>
            onChange({ agent: 'All agents', status: 'All statuses', mode: 'All modes' })
          }
          className="text-xs text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton rows — reads as the real table shape
// ---------------------------------------------------------------------------

function SkeletonRows() {
  return (
    <div aria-busy="true" aria-label="Loading run history">
      {/* Filter bar skeleton */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-[180px]" />
        <Skeleton className="h-8 w-[140px]" />
        <Skeleton className="h-8 w-[140px]" />
      </div>
      {/* Table header skeleton */}
      <div className="mb-3 flex items-center gap-4 border-b border-[#E5E7EB] pb-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      {/* Row skeletons — 5 rows fading opacity */}
      {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[#F3F4F6] py-3"
          style={{ opacity }}
        >
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
          <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className="h-3 w-10 shrink-0" />
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
    <div className="flex flex-col items-center py-16 text-center">
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: '#F7F6F2' }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="#D1D5DB" strokeWidth="1.5" />
          <line x1="13.5" y1="13.5" x2="17" y2="17" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-[#0A0A0A]">No runs match those filters</h3>
      <p className="mb-4 max-w-[280px] text-sm text-[#6B7280]">
        Try widening the filter or clearing all to see the full run history.
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
// Main table row
// ---------------------------------------------------------------------------

interface RunRowItemProps {
  row: RunRow
  trace: RunTrace | undefined
  onSelect: (row: RunRow) => void
}

function RunRowItem({ row, onSelect }: RunRowItemProps) {
  return (
    <tr
      className="group cursor-pointer border-b border-[#F3F4F6] transition-colors hover:bg-[#F4F6FA] focus-within:bg-[#F4F6FA]"
      onClick={() => onSelect(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(row)
        }
      }}
      tabIndex={0}
      role="row"
      aria-label={`${row.agentLabel} run, ${row.status}, ${formatTimestamp(row.timestamp)}`}
    >
      {/* Agent name + snippet */}
      <td className="py-3 pr-4 align-top" role="cell">
        <span className="block text-sm font-medium text-[#0A0A0A]">{row.agentLabel}</span>
        <span className="mt-0.5 block max-w-[380px] truncate text-xs text-[#6B7280]">
          {row.snippet}
        </span>
      </td>

      {/* Mode */}
      <td className="whitespace-nowrap py-3 pr-4 align-middle" role="cell">
        <ModeBadge mode={row.mode} />
      </td>

      {/* Status */}
      <td className="whitespace-nowrap py-3 pr-4 align-middle" role="cell">
        <StatusPill status={row.status} />
      </td>

      {/* Timestamp — Geist Mono per M11 */}
      <td
        className="whitespace-nowrap py-3 pr-4 align-middle font-[var(--font-mono)] text-xs text-[#6B7280] tabular-nums"
        role="cell"
      >
        {formatTimestamp(row.timestamp)}
      </td>

      {/* Cost — Geist Mono per M11 */}
      <td
        className="whitespace-nowrap py-3 pr-4 align-middle font-[var(--font-mono)] text-xs tabular-nums"
        role="cell"
      >
        <span className={row.costUsd === 0 ? 'text-[#D1D5DB]' : 'text-[#374151]'}>
          {formatCost(row.costUsd)}
        </span>
      </td>

      {/* Chevron — appears on hover */}
      <td className="py-3 align-middle" role="cell">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="ml-auto text-[#D1D5DB] transition-transform group-hover:translate-x-0.5 group-hover:text-[#9CA3AF]"
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
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RunTable({ state, rows = [], traces = {}, onRetry }: RunTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    agent: 'All agents',
    status: 'All statuses',
    mode: 'All modes',
  })
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
  const isFiltered =
    filters.agent !== 'All agents' ||
    filters.status !== 'All statuses' ||
    filters.mode !== 'All modes'

  return (
    <>
      {/* Filter bar */}
      <div className="mb-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* No-match state after filtering */}
      {filteredRows.length === 0 ? (
        <EmptyFiltered
          onReset={() =>
            setFilters({ agent: 'All agents', status: 'All statuses', mode: 'All modes' })
          }
        />
      ) : (
        <>
          {/* Count label */}
          <p className="mb-3 font-[var(--font-mono)] text-xs tabular-nums text-[#9CA3AF]">
            {isFiltered
              ? `${filteredRows.length} of ${rows.length} runs`
              : `${rows.length} runs`}
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[640px] border-collapse"
              role="table"
              aria-label="Run history"
            >
              <thead>
                <tr className="border-b border-[#E5E7EB]" role="row">
                  {['Agent', 'Mode', 'Status', 'Time', 'Cost', ''].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]"
                      role="columnheader"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <RunRowItem
                    key={row.id}
                    row={row}
                    trace={traces[row.id]}
                    onSelect={setSelectedRow}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
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

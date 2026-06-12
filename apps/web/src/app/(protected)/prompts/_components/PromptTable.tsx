'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/loading-state'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import type { PromptRow } from '@/lib/demo/surfaces/types'
import { PromptDrawer } from './PromptDrawer'
import { DEMO_PROMPTS } from '@/lib/demo/surfaces/prompts'

// ---------------------------------------------------------------------------
// Engine chip helpers — M11: engine NAMES are prose (Inter), not mono. Mono is
// reserved for real numbers (#position, freq, deltas). A brand name in monospace
// reads like log output (audit P1-3).
// ---------------------------------------------------------------------------

const ENGINE_COLORS: Record<string, { bg: string; text: string }> = {
  ChatGPT: { bg: '#EEF2FF', text: '#3370FF' },
  Gemini: { bg: '#E6F5EE', text: '#0E9E6E' },
  Perplexity: { bg: '#EEEAFD', text: '#6E56F0' },
}

function EngineChip({ engine }: { engine: string }) {
  const color = ENGINE_COLORS[engine] ?? { bg: '#F3F4F6', text: '#6B7280' }
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {engine}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Per-row analytics — deterministic MOCK derived from the row id (NOT from
// frequency). Position and the freq-trend window are independent signals so the
// table doesn't show two columns that are secretly the same number (audit P2-3,
// data-integrity smell). When a real backend lands these fields move to the
// fixture; nothing here fabricates a correlation.
// ---------------------------------------------------------------------------

interface RowAnalytics {
  /** Real average position 1–8 (decoupled from frequency). null when not cited. */
  position: number | null
  /** Last-5-runs frequency window (drives the in-row sparkline + delta). */
  freqTrend: number[]
  /** Frequency 0–100 normalised for the sparkline color band. */
  freqScore: number
}

// Stable per-id mock. Positions are hand-set (not a function of freq); trends are
// a plausible 5-point walk ending at the current frequency.
const ROW_POSITION: Record<string, number | null> = {
  p1: 4, p2: 6, p3: 1, p4: 5, p5: 7,
  p6: 1, p7: 6, p8: 3, p9: 2, p10: 4,
}

function rowAnalytics(row: PromptRow): RowAnalytics {
  const cited = row.competitorEngines.length > 0 || row.covered
  const position = cited ? (ROW_POSITION[row.id] ?? null) : null

  // Build a 5-point trend that lands on the current frequency. Deterministic per
  // id via a small seeded walk — never random, never re-derived from position.
  const f = row.frequency
  const seed = row.id.charCodeAt(row.id.length - 1)
  const drift = (seed % 3) - 1 // -1, 0, or +1 shape per row
  const trend = [
    Math.max(0, f - 12 + drift * 2),
    Math.max(0, f - 9),
    Math.max(0, f - 5 + drift),
    Math.max(0, f - 2),
    f,
  ]
  // Normalise frequency to a 0–100 score so the sparkline picks a sensible band.
  const freqScore = Math.min(100, Math.round((f / 60) * 100))

  return { position, freqTrend: trend, freqScore }
}

// ---------------------------------------------------------------------------
// Intent badge
// ---------------------------------------------------------------------------

const INTENT_LABELS: Record<PromptRow['intent'], string> = {
  transactional: 'Buy',
  informational: 'Info',
  navigational: 'Nav',
}

const INTENT_COLORS: Record<PromptRow['intent'], { bg: string; text: string }> = {
  transactional: { bg: '#FDF3E0', text: '#B8770B' },
  informational: { bg: '#EEF2FF', text: '#3370FF' },
  navigational: { bg: '#F3F4F6', text: '#6B7280' },
}

function IntentBadge({ intent }: { intent: PromptRow['intent'] }) {
  const color = INTENT_COLORS[intent]
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {INTENT_LABELS[intent]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Coverage dot
// ---------------------------------------------------------------------------

function CoverageDot({ covered }: { covered: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full',
        covered ? 'bg-[#0E9E6E]' : 'bg-[#EF4444]',
      )}
      title={covered ? 'Covered' : 'Not covered'}
      aria-label={covered ? 'Covered' : 'Not covered'}
    />
  )
}

/**
 * CoverageCell — coverage is the single most important fact per row (are you
 * cited or not), so it gets a dot + a mono Yes/No, not a bare 6px dot lost in a
 * column (audit P2-4). Magnitude is glanceable down the column.
 */
function CoverageCell({ covered }: { covered: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CoverageDot covered={covered} />
      {/* Yes/No is prose — Inter, not mono (M11). The dot + saturated text carry
          the magnitude so coverage is glanceable down the column (audit P2-4). */}
      <span
        className="text-[12px] font-semibold"
        style={{ color: covered ? '#067A55' : '#C21C1C' }}
      >
        {covered ? 'Yes' : 'No'}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton — reads as a real table
// ---------------------------------------------------------------------------

function PromptTableSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading prompts…"
      className="overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ml-auto h-8 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_64px_160px_88px_56px_136px] items-center gap-3 border-b border-[#F3F4F6] px-5 py-2.5">
        {['Query', 'Intent', 'Citing engines', 'Covered', 'Pos.', 'Frequency'].map(
          (label) => (
            <Skeleton key={label} className="h-3 w-full max-w-[80px]" />
          ),
        )}
      </div>

      {/* Rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_64px_160px_88px_56px_136px] items-center gap-3 border-b border-[#F3F4F6] px-5 py-3.5"
        >
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-5 w-10" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-3 w-6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-7" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading prompts…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type PromptTableViewState = 'loading' | 'empty' | 'error' | 'populated'

/**
 * Shared desktop grid for header + rows — one source of truth so columns never
 * drift. Six columns; the Tag column was dropped (it duplicated Intent, audit
 * P2-5) and its width given to the in-row Frequency sparkline + trend (M4).
 *   Query (flex) · Intent · Citing engines · Covered · Pos. · Freq + trend
 */
const GRID_TEMPLATE = '1fr 64px 160px 88px 56px 136px'

interface PromptTableProps {
  viewState: PromptTableViewState
  rows?: PromptRow[]
  onRunQueryMapper?: () => void
  onRetry?: () => void
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PromptTable({
  viewState,
  rows = DEMO_PROMPTS.rows as unknown as PromptRow[],
  onRunQueryMapper,
  onRetry,
}: PromptTableProps) {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null)
  const [filterCovered, setFilterCovered] = useState<'all' | 'covered' | 'gap'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  if (viewState === 'loading') return <PromptTableSkeleton />

  if (viewState === 'error') {
    return (
      <ErrorState
        title="Couldn't load your prompts"
        description="There was a problem fetching your tracked queries. Your data is safe — this is a temporary glitch."
        onRetry={onRetry}
        retryLabel="Try again"
      />
    )
  }

  if (viewState === 'empty') {
    return (
      <EmptyState
        illustration="scan"
        title="No prompts tracked yet"
        description="Run Query Mapper once to discover how AI engines interpret your business and which queries you're missing."
        action={
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="default"
              size="default"
              onClick={onRunQueryMapper}
              aria-label="Run Query Mapper to discover your prompts"
            >
              Discover my prompts
            </Button>
            <button
              type="button"
              onClick={onRunQueryMapper}
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Or add a prompt manually →
            </button>
          </div>
        }
      />
    )
  }

  // Populated — apply filters
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      row.query.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCoverage =
      filterCovered === 'all' ||
      (filterCovered === 'covered' && row.covered) ||
      (filterCovered === 'gap' && !row.covered)
    return matchesSearch && matchesCoverage
  })

  const openRow = openDrawerId
    ? rows.find((r) => r.id === openDrawerId) ?? null
    : null

  const drawerData = openDrawerId
    ? (DEMO_PROMPTS.drawerData as Record<string, (typeof DEMO_PROMPTS.drawerData)[keyof typeof DEMO_PROMPTS.drawerData]>)[openDrawerId] ?? null
    : null

  return (
    <>
      <div className="overflow-hidden">
        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-5 py-3">
          {/* Search */}
          <div className="flex-1 min-w-[180px] max-w-[280px]">
            <input
              type="text"
              placeholder="Filter prompts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter tracked prompts by text"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0A0A0A] placeholder-[#9CA3AF] transition-colors focus:border-[#3370FF] focus:outline-none focus:ring-1 focus:ring-[#3370FF]"
            />
          </div>

          {/* Coverage filter */}
          <div
            className="flex h-8 items-center rounded-md border border-[#E5E7EB] bg-[#F7F7F7] p-0.5"
            role="group"
            aria-label="Filter by coverage status"
          >
            {(
              [
                { value: 'all', label: 'All' },
                { value: 'covered', label: 'Covered' },
                { value: 'gap', label: 'Gap' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterCovered(value)}
                aria-pressed={filterCovered === value}
                className={cn(
                  'h-full rounded px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  filterCovered === value
                    ? 'bg-white text-[#0A0A0A] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Count */}
          <span className="ml-auto font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
            {filteredRows.length} of {rows.length}
          </span>
        </div>

        {/* Column headers */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: GRID_TEMPLATE,
          }}
        >
          {[
            { label: 'Query', className: 'px-5' },
            { label: 'Intent', className: 'px-2' },
            { label: 'Citing engines', className: 'px-2' },
            { label: 'Covered', className: 'px-2' },
            { label: 'Pos.', className: 'px-2 text-center' },
            { label: 'Frequency', className: 'px-2 pr-5' },
          ].map(({ label, className }) => (
            <div
              key={label}
              className={cn(
                'py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] border-b border-[#F3F4F6]',
                className,
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[14px] text-[#6B7280]">
              No prompts match your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setFilterCovered('all')
              }}
              className="mt-2 text-[13px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {filteredRows.map((row) => (
              <PromptTableRow
                key={row.id}
                row={row}
                isOpen={openDrawerId === row.id}
                onClick={() =>
                  setOpenDrawerId((prev) => (prev === row.id ? null : row.id))
                }
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-3">
          <p className="text-[12px] text-[#9CA3AF]">
            Showing queries tracked across ChatGPT, Gemini, and Perplexity.
          </p>
          <button
            type="button"
            className="text-[12px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            onClick={onRunQueryMapper}
          >
            + Track a new prompt
          </button>
        </div>
      </div>

      {/* Drawer */}
      {openRow && drawerData && (
        <PromptDrawer
          open={!!openDrawerId}
          onClose={() => setOpenDrawerId(null)}
          row={openRow}
          drawerData={drawerData}
          gaps={DEMO_PROMPTS.uncitedGaps as unknown as Array<{ id: string; query: string; volume: string; ownedBy: string[] }>}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Table row sub-component
// ---------------------------------------------------------------------------

function PromptTableRow({
  row,
  isOpen,
  onClick,
}: {
  row: PromptRow
  isOpen: boolean
  onClick: () => void
}) {
  const hasCompetitors = row.competitorEngines.length > 0
  const { position, freqTrend, freqScore } = rowAnalytics(row)
  const freqDelta = freqTrend[freqTrend.length - 1] - freqTrend[0]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={`View details for: ${row.query}`}
      className={cn(
        'group w-full border-b border-[#F3F4F6] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
        isOpen ? 'bg-[#F7F8FF]' : 'bg-white hover:bg-[#F4F6FA]',
        // left hairline accent when row is open — blue = you
        isOpen && 'shadow-[inset_3px_0_0_0_#3370FF]',
      )}
    >
      {/* Desktop grid */}
      <div
        className="hidden items-center gap-3 py-3 md:grid"
        style={{ gridTemplateColumns: GRID_TEMPLATE }}
      >
        {/* Query text */}
        <div className="min-w-0 px-5">
          <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
            {row.query}
          </p>
          {hasCompetitors && (
            <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
              {row.competitorEngines.length === 1
                ? `1 competitor citing`
                : `${row.competitorEngines.length} competitors citing`}
            </p>
          )}
        </div>

        {/* Intent */}
        <div className="px-2">
          <IntentBadge intent={row.intent} />
        </div>

        {/* Citing engines */}
        <div className="flex flex-wrap gap-1 px-2">
          {hasCompetitors ? (
            row.competitorEngines.map((e) => (
              <EngineChip key={e} engine={e} />
            ))
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">—</span>
          )}
        </div>

        {/* Covered — dot + mono Yes/No (audit P2-4) */}
        <div className="px-2">
          <CoverageCell covered={row.covered} />
        </div>

        {/* Position — a real rank, decoupled from frequency (audit P2-3) */}
        <div className="px-2 text-center">
          <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
            {position !== null ? `#${position}` : '—'}
          </span>
        </div>

        {/* Frequency — the promoted figure (M2 STEP-4 mono) + in-row sparkline +
            trend delta so rows self-rank like Profound (audit P1-2 / M4 / M7). */}
        <div className="flex items-center justify-end gap-2.5 pr-5">
          <span className="font-[var(--font-mono)] text-[16px] leading-none tabular-nums text-[#0A0A0A]">
            {row.frequency}
          </span>
          <EngineMicroSparkline
            points={freqTrend}
            currentScore={freqScore}
            showDelta
            width={56}
            height={22}
          />
        </div>
      </div>

      {/* Mobile layout — coverage label + freq trend carried through */}
      <div className="flex items-start gap-3 px-4 py-3.5 md:hidden">
        <div className="pt-0.5">
          <CoverageDot covered={row.covered} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#0A0A0A]">{row.query}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <IntentBadge intent={row.intent} />
            {row.competitorEngines.map((e) => (
              <EngineChip key={e} engine={e} />
            ))}
            {position !== null && (
              <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#6B7280]">
                #{position}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-[var(--font-mono)] text-[14px] tabular-nums text-[#0A0A0A]">
            {row.frequency}
          </span>
          <span
            className="font-[var(--font-mono)] text-[11px] tabular-nums"
            style={{
              color:
                freqDelta > 0
                  ? 'var(--color-status-positive)'
                  : freqDelta < 0
                    ? 'var(--color-status-critical)'
                    : '#9CA3AF',
            }}
          >
            {freqDelta === 0 ? '±0' : `${freqDelta > 0 ? '+' : ''}${freqDelta}`}
          </span>
        </div>
      </div>
    </button>
  )
}

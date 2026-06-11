'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/loading-state'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import type { PromptRow } from '@/lib/demo/surfaces/types'
import { PromptDrawer } from './PromptDrawer'
import { DEMO_PROMPTS } from '@/lib/demo/surfaces/prompts'

// ---------------------------------------------------------------------------
// Engine chip helpers
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
      className="inline-flex items-center rounded px-1.5 py-0.5 font-[var(--font-mono)] text-[11px] tabular-nums"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {engine}
    </span>
  )
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

// ---------------------------------------------------------------------------
// Loading skeleton — reads as a real table
// ---------------------------------------------------------------------------

function PromptTableSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading prompts…"
      className="card-console-hero overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ml-auto h-8 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_80px_140px_72px_64px_64px_72px] items-center gap-3 border-b border-[#F3F4F6] px-5 py-2.5">
        {['Query', 'Intent', 'Citing engines', 'Cited', 'Pos.', 'Freq.', 'Tag'].map(
          (label) => (
            <Skeleton key={label} className="h-3 w-full max-w-[80px]" />
          ),
        )}
      </div>

      {/* Rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_80px_140px_72px_64px_64px_72px] items-center gap-3 border-b border-[#F3F4F6] px-5 py-3.5"
        >
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-5 w-10" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
      <span className="sr-only">Loading prompts…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tag label helper
// ---------------------------------------------------------------------------

function tagLabel(row: PromptRow): string {
  if (row.intent === 'navigational') return 'Branded'
  if (row.intent === 'transactional') return 'Bottom-funnel'
  return 'Top-funnel'
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type PromptTableViewState = 'loading' | 'empty' | 'error' | 'populated'

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
      <div className="card-console-hero overflow-hidden">
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
            gridTemplateColumns: '1fr 72px 168px 60px 60px 60px 100px',
          }}
        >
          {[
            { label: 'Query', className: 'px-5' },
            { label: 'Intent', className: 'px-2' },
            { label: 'Citing engines', className: 'px-2' },
            { label: 'Covered', className: 'px-2 text-center' },
            { label: 'Pos.', className: 'px-2 text-center' },
            { label: 'Freq.', className: 'px-2 text-center' },
            { label: 'Tag', className: 'px-2 pr-5' },
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
  const avgPosition = hasCompetitors
    ? Math.floor(1 + (1 - row.frequency / 60) * 4)
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={`View details for: ${row.query}`}
      className={cn(
        'w-full border-b border-[#F3F4F6] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
        isOpen ? 'bg-[#F7F8FF]' : 'bg-white hover:bg-[#F4F6FA]',
        // left hairline accent when row is open — blue = you
        isOpen && 'shadow-[inset_3px_0_0_0_#3370FF]',
      )}
    >
      {/* Desktop grid */}
      <div
        className="hidden items-center gap-3 py-3.5 md:grid"
        style={{ gridTemplateColumns: '1fr 72px 168px 60px 60px 60px 100px' }}
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

        {/* Covered dot */}
        <div className="flex items-center justify-center px-2">
          <CoverageDot covered={row.covered} />
        </div>

        {/* Position */}
        <div className="px-2 text-center">
          <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
            {avgPosition ? `#${avgPosition}` : '—'}
          </span>
        </div>

        {/* Frequency */}
        <div className="px-2 text-center">
          <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
            {row.frequency}
          </span>
        </div>

        {/* Tag */}
        <div className="pr-5">
          <span className="text-[11px] font-medium text-[#9CA3AF]">
            {tagLabel(row)}
          </span>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex items-start gap-3 px-4 py-3.5 md:hidden">
        <CoverageDot covered={row.covered} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#0A0A0A]">{row.query}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <IntentBadge intent={row.intent} />
            {row.competitorEngines.map((e) => (
              <EngineChip key={e} engine={e} />
            ))}
          </div>
        </div>
        <span className="shrink-0 font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
          {row.frequency}
        </span>
      </div>
    </button>
  )
}

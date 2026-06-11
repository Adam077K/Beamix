'use client'

/**
 * CompetitorPanel — Competitor Tracker surface (internal-report variant)
 *
 * All 4 states:
 *  - loading  → skeleton matching the real layout
 *  - empty    → M8 two-tier recovery with warm character glyph + preview
 *  - error    → ErrorState with onRetry
 *  - success  → full surface: competitor list + SoV + gap table + co-citation
 *
 * Design laws:
 *  M1  — TIER-1 = SoV card (hero focal), TIER-2 = gap table, TIER-3 = header + co-citation
 *  M2  — 4-step type contract (STEP-1 mono SoV %, STEP-2 page heading, STEP-3 eyebrows, STEP-4 body)
 *  M3  — weighted 2-up asymmetry in gap table (prompt col dominant)
 *  M5  — one SerifVerdict beat ("narrowing") in the narrative line
 *  M6  — no violet on buttons, only on agent-territory surfaces
 *  M8  — two-tier recovery on empty state
 *  M9  — craft-enter stagger on first paint
 *  M11 — every number is Geist Mono tabular-nums
 *  M12 — editorial rhythm, tight within clusters / wide between sections
 */

import { useState } from 'react'
import Link from 'next/link'
import { X, Plus, ExternalLink, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { ShareOfVoice } from './ShareOfVoice'
import { DEMO_COMPETITORS } from '@/lib/demo/surfaces/competitors'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'
import type { CompetitorRow } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CompetitorPanelState = 'loading' | 'empty' | 'error' | 'success'

interface CompetitorPanelProps {
  state: CompetitorPanelState
  onRetry?: () => void
}

// ---------------------------------------------------------------------------
// Priority pill
// ---------------------------------------------------------------------------

function PriorityPill({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  if (priority === 'high') {
    return (
      <span className="inline-flex h-5 items-center rounded-full bg-[#FDECEC] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#DC2626]">
        High
      </span>
    )
  }
  if (priority === 'medium') {
    return (
      <span className="inline-flex h-5 items-center rounded-full bg-[#FDF3E0] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#B8770B]">
        Med
      </span>
    )
  }
  return (
    <span className="inline-flex h-5 items-center rounded-full bg-[#F3F4F6] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]">
      Low
    </span>
  )
}

// ---------------------------------------------------------------------------
// Engine badge
// ---------------------------------------------------------------------------

function EngineBadge({ engine }: { engine: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full bg-[#EEF2FF] px-2 text-[10px] font-medium text-[#3370FF]">
      {engine}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Relationship badge for co-citation
// ---------------------------------------------------------------------------

function RelationshipBadge({
  rel,
}: {
  rel: 'direct-competitor' | 'authority' | 'directory'
}) {
  if (rel === 'direct-competitor') {
    return (
      <span className="inline-flex h-5 items-center rounded-full bg-[#FDECEC] px-2 text-[10px] font-medium text-[#DC2626]">
        Competitor
      </span>
    )
  }
  if (rel === 'authority') {
    return (
      <span className="inline-flex h-5 items-center rounded-full bg-[#E6F5EE] px-2 text-[10px] font-medium text-[#0E9E6E]">
        Authority
      </span>
    )
  }
  return (
    <span className="inline-flex h-5 items-center rounded-full bg-[#F3F4F6] px-2 text-[10px] font-medium text-[#6B7280]">
      Directory
    </span>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton — matches the real layout shape
// ---------------------------------------------------------------------------

function CompetitorPanelSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Loading competitor data…">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Competitor chips skeleton */}
      <div className="card-inset rounded-[12px] p-4">
        <Skeleton className="mb-3 h-3 w-28" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
      </div>

      {/* SoV chart skeleton — TIER-1 hero */}
      <div className="card-console-hero overflow-hidden rounded-[16px]">
        <div className="border-b border-[#F3F4F6] p-6">
          <Skeleton className="mb-2 h-3 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_200px]">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gap table skeleton — TIER-2 */}
      <div className="card-console overflow-hidden rounded-[16px]">
        <div className="border-b border-[#F3F4F6] p-5">
          <Skeleton className="h-3 w-24" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] px-5 py-3.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading competitor data…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state — M8 two-tier recovery
// ---------------------------------------------------------------------------

function CompetitorPanelEmpty() {
  // Ghost preview of the real feature behind a scrim (M8)
  const preview = (
    <div className="space-y-3">
      <div className="card-inset rounded-[10px] p-3">
        <div className="flex flex-wrap gap-2">
          {['smile-center.co.il', 'dentalplus.co.il', 'rgdental.co.il'].map((d) => (
            <span
              key={d}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs text-[#6B7280]"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        {['whitening cost Ramat Gan', 'dental implants price', 'Invisalign dentist'].map((q) => (
          <div key={q} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-2.5">
            <span className="text-xs text-[#9CA3AF]">{q}</span>
            <span className="text-xs text-[#D1D5DB]">Gap · 3 competitors</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <EmptyState
      illustration="competitors"
      preview={preview}
      title="Track your first competitor"
      description="Add a competitor's domain and Beamix maps where they rank, which AI engines cite them, and where you can close the gap."
      action={
        <div className="flex flex-col items-center gap-3">
          <Button variant="default" size="default">
            <Plus className="mr-1.5 h-4 w-4" />
            Add competitor
          </Button>
          <Link
            href="/scans"
            className="text-sm text-[#6B7280] underline-offset-4 hover:text-[#0A0A0A] hover:underline"
          >
            Run a scan first to see auto-suggestions
          </Link>
        </div>
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Competitor chip list with add/remove + suggestions
// ---------------------------------------------------------------------------

function CompetitorList({
  competitors,
  suggestions,
}: {
  competitors: readonly CompetitorRow[]
  suggestions: readonly { domain: string; name: string; reason: string }[]
}) {
  const [tracked, setTracked] = useState<string[]>(competitors.map((c) => c.id))
  const [showSuggestions, setShowSuggestions] = useState(false)

  const trackedCompetitors = competitors.filter((c) => tracked.includes(c.id))

  function removeCompetitor(id: string) {
    setTracked((prev) => prev.filter((tid) => tid !== id))
  }

  return (
    <div className="card-inset craft-enter craft-enter-1 rounded-[12px] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Tracked competitors
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {/* Tracked chips */}
        {trackedCompetitors.map((c) => (
          <div
            key={c.id}
            className="group inline-flex h-8 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white pl-3 pr-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:border-[#D1D5DB]"
          >
            <span>{c.name}</span>
            <button
              type="button"
              onClick={() => removeCompetitor(c.id)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
              aria-label={`Remove ${c.name}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setShowSuggestions((s) => !s)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-[#D1D5DB] bg-transparent px-3 text-sm text-[#6B7280] transition-colors hover:border-[#3370FF] hover:text-[#3370FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
          aria-expanded={showSuggestions}
          aria-controls="competitor-suggestions"
        >
          <Plus className="h-3.5 w-3.5" />
          Add competitor
        </button>
      </div>

      {/* Auto-suggested chips */}
      {showSuggestions && (
        <div
          id="competitor-suggestions"
          className="mt-4 border-t border-[#F3F4F6] pt-4"
        >
          <p className="mb-2.5 text-xs text-[#9CA3AF]">
            Suggested from scan data — click to track:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.domain}
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 text-sm font-medium text-[#3370FF] transition-colors hover:bg-[#3370FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
                title={s.reason}
                onClick={() => {
                  // In mock mode, just dismiss the suggestion panel
                  setShowSuggestions(false)
                }}
              >
                <Plus className="h-3 w-3" />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gap table — M3 asymmetric, prompt column dominant
// ---------------------------------------------------------------------------

function GapTable({
  gaps,
}: {
  gaps: typeof DEMO_COMPETITORS.gaps
}) {
  return (
    <section
      className="card-console craft-enter craft-enter-4 overflow-hidden rounded-[16px]"
      aria-labelledby="gap-table-heading"
    >
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Visibility gaps
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Queries where a competitor is cited and you are not — click any row to act.
          </p>
        </div>
        <span className="font-mono text-[22px] font-semibold tabular-nums leading-none text-[#0A0A0A]">
          {gaps.length}
        </span>
      </div>

      {/* Table — accessible */}
      <div role="table" aria-label="Visibility gaps">
        {/* Header */}
        <div
          role="row"
          className="hidden grid-cols-[1fr_180px_90px_80px_140px] items-center gap-4 border-b border-[#F3F4F6] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] sm:grid"
        >
          <span role="columnheader">Prompt / topic</span>
          <span role="columnheader">Competitor cited</span>
          <span role="columnheader">Priority</span>
          <span role="columnheader">Engines</span>
          <span role="columnheader" className="text-right">Action</span>
        </div>

        {gaps.map((gap, idx) => (
          <div
            key={gap.id}
            role="row"
            className={cn(
              'group grid grid-cols-1 gap-y-2 border-b border-[#F3F4F6] px-5 py-3.5 transition-colors hover:bg-[#F4F6FA]',
              'sm:grid-cols-[1fr_180px_90px_80px_140px] sm:items-center sm:gap-4 sm:gap-y-0',
              // M7 left hairline on hover
              'relative',
              'hover:before:absolute hover:before:inset-y-0 hover:before:left-0 hover:before:w-0.5',
              gap.priority === 'high'
                ? 'hover:before:bg-[#DC2626]'
                : gap.priority === 'medium'
                  ? 'hover:before:bg-[#F59E0B]'
                  : 'hover:before:bg-[#E5E7EB]',
              // Entrance stagger
              `craft-enter`,
              idx < 5 ? `craft-enter-${Math.min(idx + 5, 8) as 5 | 6 | 7 | 8}` : '',
            )}
          >
            {/* Prompt — dominant column */}
            <div role="cell" className="min-w-0">
              <p className="truncate text-[14px] font-medium text-[#0A0A0A]">
                {gap.prompt}
              </p>
            </div>

            {/* Competitor cited */}
            <div role="cell" className="hidden sm:block">
              <p className="truncate text-[13px] text-[#6B7280]">
                {gap.competitorsCited.join(', ')}
              </p>
            </div>

            {/* Priority */}
            <div role="cell">
              <PriorityPill priority={gap.priority} />
            </div>

            {/* Engines */}
            <div role="cell" className="flex flex-wrap gap-1">
              {gap.engines.map((eng) => (
                <EngineBadge key={eng} engine={eng} />
              ))}
            </div>

            {/* Action — deep-links to tool page */}
            <div role="cell" className="flex justify-start sm:justify-end">
              <Link
                href={gap.actionHref}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#EEF2FF] px-3 text-sm font-medium text-[#3370FF] transition-colors hover:bg-[#3370FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
                aria-label={`${gap.actionLabel} for: ${gap.prompt}`}
              >
                {gap.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Co-citation table
// ---------------------------------------------------------------------------

function CoCitationView({
  coCitations,
}: {
  coCitations: typeof DEMO_COMPETITORS.coCitations
}) {
  return (
    <section
      className="card-inset craft-enter craft-enter-5 rounded-[16px] overflow-hidden"
      aria-labelledby="cocitation-heading"
    >
      <div className="border-b border-[#F3F4F6] px-5 py-4">
        <p
          id="cocitation-heading"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Co-citation map
        </p>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Domains that appear alongside {DEMO_BUSINESS.name} in AI responses.
        </p>
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {coCitations.map((cc) => (
          <div
            key={cc.domain}
            className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[#F4F6FA]"
          >
            {/* Domain + name — dominant */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#0A0A0A]">{cc.name}</p>
              <p className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                {cc.domain}
              </p>
            </div>

            {/* Shared queries — mono */}
            <div className="shrink-0 text-right">
              <p className="font-mono text-[15px] tabular-nums font-semibold text-[#0A0A0A]">
                {cc.sharedQueries}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">shared queries</p>
            </div>

            {/* Relationship */}
            <div className="shrink-0">
              <RelationshipBadge rel={cc.relationship} />
            </div>

            {/* Engine chips */}
            <div className="hidden shrink-0 items-center gap-1 sm:flex">
              {cc.engines.map((eng) => (
                <EngineBadge key={eng} engine={eng} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Success state — populated surface
// ---------------------------------------------------------------------------

function CompetitorPanelSuccess() {
  const data = DEMO_COMPETITORS
  const topCompetitor = data.rows[0]

  return (
    <div className="space-y-0">
      {/* Page header */}
      <div className="craft-enter craft-enter-1">
        <PageHeader
          eyebrow={DEMO_BUSINESS.name}
          title="Competitor Tracker"
          subtitle={
            <>
              Your share of voice is{' '}
              <SerifVerdict>narrowing</SerifVerdict> the gap — Smile Center
              leads at {topCompetitor.shareOfVoice}%, you are at{' '}
              {data.shareOfVoiceHistory[data.shareOfVoiceHistory.length - 1].us}%.
            </>
          }
        />
      </div>

      {/* M12 editorial rhythm */}

      {/* TIER-3 competitor list */}
      <div className="mb-6">
        <CompetitorList
          competitors={data.rows}
          suggestions={data.suggestions}
        />
      </div>

      {/* 32px gap — SoV is a new register, TIER-1 hero */}
      <div className="mb-8">
        {/* SoV is TIER-1 — outer hero wrapper is the only depth container */}
        <div className="craft-enter craft-enter-2">
          <ShareOfVoice
            history={data.shareOfVoiceHistory}
            engineBreakdown={data.engineBreakdown}
            topCompetitorName={topCompetitor.name}
            className="card-console-hero overflow-hidden rounded-[16px]"
          />
        </div>
      </div>

      {/* 40px gap — gap table is a new section */}
      <div className="mb-10">
        <GapTable gaps={data.gaps} />
      </div>

      {/* 48px gap — co-citation is lower priority */}
      <div className="mb-4">
        <CoCitationView coCitations={data.coCitations} />
      </div>

      {/* History link — Zone 6 */}
      <div className="pt-2 text-right">
        <Link
          href="/archive"
          className="text-sm text-[#9CA3AF] underline-offset-4 transition-colors hover:text-[#6B7280] hover:underline"
        >
          View in Run History →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CompetitorPanel — routes by state
// ---------------------------------------------------------------------------

export function CompetitorPanel({ state, onRetry }: CompetitorPanelProps) {
  if (state === 'loading') {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-[880px] px-4 py-8 sm:px-6">
        <CompetitorPanelSkeleton />
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-[880px] px-4 py-8 sm:px-6">
        <ErrorState
          title="Could not load competitor data"
          description="We hit a snag fetching your competitor tracking data. Try again — it clears right up."
          onRetry={onRetry}
          retryLabel="Try again"
        />
      </main>
    )
  }

  if (state === 'empty') {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-[880px] px-4 py-8 sm:px-6">
        <div className="craft-enter craft-enter-1">
          <PageHeader
            eyebrow={DEMO_BUSINESS.name}
            title="Competitor Tracker"
          />
        </div>
        <CompetitorPanelEmpty />
      </main>
    )
  }

  // success
  return (
    <main className="mx-auto min-h-[100dvh] max-w-[880px] px-4 py-8 sm:px-6">
      <CompetitorPanelSuccess />
    </main>
  )
}

'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Users, AlertTriangle } from 'lucide-react'
import { AddCompetitorModal } from './AddCompetitorModal'
import { CompetitorDrawer } from './CompetitorDrawer'
import { MissedQueriesList } from './MissedQueriesList'
import { ShareOfVoiceCard } from './ShareOfVoiceCard'
import { EngineHeatmap } from './EngineHeatmap'
import { QueryWinLossTable } from './QueryWinLossTable'
import { SovTrendChart } from './SovTrendChart'
import { StrategyDeltaAside } from './StrategyDeltaAside'
import type { Competitor, TrackedQuery, SovWeek, Engine } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompetitorsClientProps {
  competitors: Competitor[]
  yourSoV: number
  yourSoVTrend: number[]
  yourEngineRates: Partial<Record<Engine, number>>
  trackedQueries: TrackedQuery[]
  sovTrend: SovWeek[]
  missedQueries: string[]
}

// ─── Loss-aversion alert banner ───────────────────────────────────────────────

function LossAversionBanner({
  competitors,
}: {
  competitors: Competitor[]
}) {
  const fastestRiser = React.useMemo(() => {
    return [...competitors].sort((a, b) => {
      const aDelta =
        a.fourWeekTrend.length >= 2
          ? a.fourWeekTrend[a.fourWeekTrend.length - 1]! - a.fourWeekTrend[0]!
          : 0
      const bDelta =
        b.fourWeekTrend.length >= 2
          ? b.fourWeekTrend[b.fourWeekTrend.length - 1]! - b.fourWeekTrend[0]!
          : 0
      return bDelta - aDelta
    })[0]
  }, [competitors])

  if (!fastestRiser) return null

  const delta =
    fastestRiser.fourWeekTrend.length >= 2
      ? fastestRiser.fourWeekTrend[fastestRiser.fourWeekTrend.length - 1]! -
        fastestRiser.fourWeekTrend[0]!
      : 0

  if (delta <= 0) return null

  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 px-4 py-3"
      role="alert"
    >
      <TrendingUp
        className="size-4 mt-0.5 shrink-0 text-amber-600"
        aria-hidden="true"
      />
      <p className="text-sm text-amber-800 leading-snug">
        <span className="font-semibold">{fastestRiser.name}</span> appeared in{' '}
        <span className="font-semibold">{delta} new queries</span> this week
        {' — '}2 of them are your highest-converting service terms.
      </p>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa] py-16 px-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <AlertTriangle className="size-5 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-[15px] font-semibold text-[#0a0a0a] mb-1">
        You're invisible in 4 queries your competitors own
      </h3>
      <p className="text-sm text-[#6b7280] max-w-[320px] leading-relaxed mb-1">
        While you're not being mentioned, they're capturing your potential customers
        in every AI engine that matters.
      </p>
      <p className="text-sm text-[#6b7280] max-w-[300px] leading-relaxed mb-6">
        Track a competitor to see exactly where you're losing ground and which queries
        to win back first.
      </p>
      <Button
        size="sm"
        onClick={onAdd}
        className="gap-1.5 bg-[#3370FF] hover:bg-[#2860e8] text-white rounded-lg"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Track a competitor
      </Button>
    </div>
  )
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export function CompetitorsClient({
  competitors,
  yourSoV,
  yourSoVTrend,
  yourEngineRates,
  trackedQueries,
  sovTrend,
  missedQueries,
}: CompetitorsClientProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedCompetitor, setSelectedCompetitor] =
    React.useState<Competitor | null>(null)

  const topCompetitor = React.useMemo(
    () =>
      [...competitors].sort((a, b) => b.appearanceRate - a.appearanceRate)[0]
        ?.name ?? 'a competitor',
    [competitors],
  )

  const competitorNames = React.useMemo(
    () => competitors.map((c) => c.name),
    [competitors],
  )

  const isEmpty = competitors.length === 0

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 sm:px-6 sm:py-10">

      {/* ── Top strip: title + subtitle + CTA ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            Competitors
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isEmpty ? (
              'No competitors tracked yet'
            ) : (
              <>
                {competitors.length} competitor
                {competitors.length !== 1 ? 's' : ''} tracked
                {' · '}
                <span className="text-[#ef4444] font-medium">
                  {topCompetitor} is pulling ahead
                </span>
              </>
            )}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="shrink-0 gap-1.5 bg-[#3370FF] hover:bg-[#2860e8] text-white rounded-lg"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Track a new competitor
        </Button>
      </div>

      {/* ── Loss-aversion alert (only when there's movement) ───────────────── */}
      {!isEmpty && <LossAversionBanner competitors={competitors} />}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-start">

          {/* ── Main column ──────────────────────────────────────────────────── */}
          <div className="min-w-0 space-y-5">

            {/* 1. Share of voice card — your score, prominent */}
            <ShareOfVoiceCard
              yourSoV={yourSoV}
              yourSoVTrend={yourSoVTrend}
              competitors={competitors}
            />

            {/* 2. Engine heatmap — head-to-head per engine */}
            <EngineHeatmap
              competitors={competitors}
              yourSoV={yourSoV}
              yourEngineRates={yourEngineRates}
              onViewQueries={(name) => {
                const found = competitors.find((c) => c.name === name) ?? null
                setSelectedCompetitor(found)
              }}
            />

            {/* 3. Per-query win/loss table — sortable */}
            <QueryWinLossTable
              queries={trackedQueries}
              competitors={competitors.map((c) => ({ id: c.id, name: c.name }))}
            />

            {/* 4. 12-week SoV trend chart */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b7280] mb-4">
                12-week share of voice trend
              </p>
              <SovTrendChart
                trend={sovTrend}
                competitorNames={competitorNames}
              />
            </div>

            {/* 5. Missed queries (existing) */}
            <MissedQueriesList queries={missedQueries} />
          </div>

          {/* ── Right aside: strategy deltas ─────────────────────────────────── */}
          <aside className="md:sticky md:top-6 space-y-3">
            <StrategyDeltaAside
              competitors={competitors}
              yourQueryCoverage={trackedQueries.filter((q) => q.youPresent).length}
              yourPublishCadence="2–3 articles/week"
            />
          </aside>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      <AddCompetitorModal open={modalOpen} onOpenChange={setModalOpen} />
      <CompetitorDrawer
        competitor={selectedCompetitor}
        onClose={() => setSelectedCompetitor(null)}
      />
    </div>
  )
}

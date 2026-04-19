'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CompetitorTable } from './CompetitorTable'
import type { Competitor } from './CompetitorTable'
import { MissedQueriesList } from './MissedQueriesList'
import { AddCompetitorModal } from './AddCompetitorModal'
import { Plus, TrendingUp, Users } from 'lucide-react'

interface CompetitorsClientProps {
  competitors: Competitor[]
  missedQueries: string[]
}

function getMovingCompetitors(competitors: Competitor[]): Competitor[] {
  return competitors.filter(
    (c) => c.fourWeekTrend[c.fourWeekTrend.length - 1] > c.fourWeekTrend[0] + 2
  )
}

// ── LoadingSkeleton ───────────────────────────────────────────────────────────

export function CompetitorsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-pulse" aria-label="Loading competitors">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-7 w-32 rounded-lg bg-gray-200" />
        <div className="h-8 w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 flex gap-6">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200 hidden md:block" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0"
          >
            <div className="h-8 w-8 rounded-lg bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 rounded bg-gray-200" />
              <div className="h-2.5 w-20 rounded bg-gray-100" />
            </div>
            <div className="h-2 w-24 rounded-full bg-gray-200 hidden sm:block" />
            <div className="h-5 w-14 rounded bg-gray-100 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function CompetitorsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center px-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Users size={20} className="text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Add your first competitor</h3>
      <p className="mt-2 text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
        Track how competitors rank in AI search results. See their share of voice, sentiment, and
        the queries where they outrank you.
      </p>
      <Button
        size="sm"
        className="mt-5 gap-1.5 h-9 text-xs"
        onClick={onAdd}
      >
        <Plus size={13} aria-hidden="true" />
        Add competitor
      </Button>
    </div>
  )
}

// ── MovementBanner ────────────────────────────────────────────────────────────

function MovementBanner({ competitors }: { competitors: Competitor[] }) {
  if (competitors.length === 0) return null

  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <TrendingUp
        size={15}
        className="mt-0.5 shrink-0 text-amber-600"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-0.5">
        {competitors.map((c) => {
          const newQueries =
            (c.fourWeekTrend[c.fourWeekTrend.length - 1] ?? 0) - (c.fourWeekTrend[0] ?? 0)
          return (
            <p key={c.id} className="text-xs text-amber-800 leading-snug">
              <span className="font-semibold">{c.name}</span> appeared in{' '}
              <span className="font-semibold">{newQueries} new quer{newQueries === 1 ? 'y' : 'ies'}</span> this week.
            </p>
          )
        })}
      </div>
    </div>
  )
}

// ── CompetitorsClient ─────────────────────────────────────────────────────────

export function CompetitorsClient({ competitors, missedQueries }: CompetitorsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const movingCompetitors = getMovingCompetitors(competitors)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">
            Competitors
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track how competitors rank across AI search engines.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="shrink-0 h-9 gap-1.5 text-xs"
          aria-label="Add a new competitor to track"
        >
          <Plus size={13} aria-hidden="true" />
          Add competitor
        </Button>
      </div>

      {/* Movement alert */}
      <MovementBanner competitors={movingCompetitors} />

      {/* Table or empty state */}
      {competitors.length === 0 ? (
        <CompetitorsEmpty onAdd={() => setModalOpen(true)} />
      ) : (
        <CompetitorTable competitors={competitors} />
      )}

      {/* Missed queries */}
      <MissedQueriesList queries={missedQueries} />

      {/* Modal */}
      <AddCompetitorModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

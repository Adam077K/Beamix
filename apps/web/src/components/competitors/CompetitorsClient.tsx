'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { CompetitorTable } from './CompetitorTable'
import { CompetitorDrawer } from './CompetitorDrawer'
import { MissedQueriesList } from './MissedQueriesList'
import { AddCompetitorModal } from './AddCompetitorModal'
import { Plus, TrendingUp, Users } from 'lucide-react'
import type { Competitor } from './CompetitorTable'

interface CompetitorsClientProps {
  competitors: Competitor[]
  missedQueries: string[]
}

function getMovingCompetitors(competitors: Competitor[]): Competitor[] {
  return competitors.filter(
    (c) => c.fourWeekTrend[c.fourWeekTrend.length - 1] > c.fourWeekTrend[0] + 2,
  )
}

export function CompetitorsClient({ competitors, missedQueries }: CompetitorsClientProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [sortKey, setSortKey] = React.useState<'appearanceRate' | 'name'>('appearanceRate')
  const [selectedCompetitor, setSelectedCompetitor] = React.useState<Competitor | null>(null)

  const sorted = React.useMemo(() => {
    return [...competitors].sort((a, b) => {
      if (sortKey === 'appearanceRate') return b.appearanceRate - a.appearanceRate
      return a.name.localeCompare(b.name)
    })
  }, [competitors, sortKey])

  const movingCompetitors = getMovingCompetitors(competitors)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Competitors</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-1.5 bg-[#3370FF] hover:bg-[#2860e8] text-white"
        >
          <Plus className="size-3.5" />
          Add competitor
        </Button>
      </div>

      {/* Movement alert banner */}
      {movingCompetitors.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
          <TrendingUp className="size-4 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="min-w-0">
            {movingCompetitors.map((c) => {
              const newQueries =
                c.fourWeekTrend[c.fourWeekTrend.length - 1] - c.fourWeekTrend[0]
              return (
                <p key={c.id} className="text-sm text-amber-800">
                  <span className="font-medium">{c.name}</span> appeared in{' '}
                  <span className="font-medium">{newQueries} new queries</span> this week.
                </p>
              )
            })}
          </div>
        </div>
      )}

      {/* Table or empty state */}
      {competitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <Users className="size-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">Add your first competitor</p>
          <p className="mt-1 text-xs text-gray-500 max-w-xs">
            Track how competitors rank in AI search results and see where you stack up.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-5 gap-1.5"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-3.5" />
            Add competitor
          </Button>
        </div>
      ) : (
        <CompetitorTable
          competitors={sorted}
          sortKey={sortKey}
          onSortChange={setSortKey}
          onSelectCompetitor={setSelectedCompetitor}
        />
      )}

      {/* Missed queries */}
      <MissedQueriesList queries={missedQueries} />

      {/* Add modal */}
      <AddCompetitorModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Per-competitor detail drawer */}
      <CompetitorDrawer
        competitor={selectedCompetitor}
        onClose={() => setSelectedCompetitor(null)}
      />
    </div>
  )
}

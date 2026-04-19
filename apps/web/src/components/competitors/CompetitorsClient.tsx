'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CompetitorTable } from './CompetitorTable'
import { MissedQueriesList } from './MissedQueriesList'
import { AddCompetitorModal } from './AddCompetitorModal'
import { Plus, TrendingUp } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  url: string
  appearanceRate: number
  queriesWhereAppears: string[]
  fourWeekTrend: number[]
}

interface CompetitorsClientProps {
  competitors: Competitor[]
  missedQueries: string[]
}

function getMovingCompetitors(competitors: Competitor[]): Competitor[] {
  return competitors.filter(
    (c) => c.fourWeekTrend[c.fourWeekTrend.length - 1] > c.fourWeekTrend[0] + 2
  )
}

export function CompetitorsClient({ competitors, missedQueries }: CompetitorsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const movingCompetitors = getMovingCompetitors(competitors)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Competitors
        </h1>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-1.5"
        >
          <Plus size={14} />
          Add competitor
        </Button>
      </div>

      {/* Movement alert banner */}
      {movingCompetitors.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3">
          <TrendingUp size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
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

      {/* Table */}
      {competitors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No competitors tracked yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Add a competitor to start monitoring their AI search visibility.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={14} />
            Add your first competitor
          </Button>
        </div>
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

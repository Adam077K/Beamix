'use client'

import { AlertCircle } from 'lucide-react'

interface MissedQueriesListProps {
  queries: string[]
}

export function MissedQueriesList({ queries }: MissedQueriesListProps) {
  if (queries.length === 0) return null

  return (
    <section className="mt-8" aria-labelledby="missed-queries-heading">
      <div className="mb-3 flex items-start gap-2">
        <AlertCircle
          size={14}
          className="mt-0.5 shrink-0 text-amber-500"
          aria-hidden="true"
        />
        <div>
          <h2
            id="missed-queries-heading"
            className="text-sm font-semibold text-gray-900 leading-tight"
          >
            Queries where they appear, you don&apos;t
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            At least one competitor is cited in these queries — you are absent.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5" role="list" aria-label="Missed queries">
        {queries.map((query) => (
          <span
            key={query}
            role="listitem"
            className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors duration-150 cursor-default"
          >
            {query}
          </span>
        ))}
      </div>
    </section>
  )
}

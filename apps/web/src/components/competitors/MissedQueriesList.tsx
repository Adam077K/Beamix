'use client'

interface MissedQueriesListProps {
  queries: string[]
}

export function MissedQueriesList({ queries }: MissedQueriesListProps) {
  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Queries where they appear, you don&apos;t
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Queries where at least one competitor is cited and Beamix is absent.
        </p>
      </div>
      {queries.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No missed queries detected.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {queries.map((query) => (
            <span
              key={query}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-150 cursor-default"
            >
              {query}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

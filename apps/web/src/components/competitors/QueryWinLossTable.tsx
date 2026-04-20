'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TrackedQuery } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortMode = 'contested' | 'gap'

interface QueryWinLossTableProps {
  queries: TrackedQuery[]
  competitors: { id: string; name: string }[]
  onFixGap?: (query: string) => void
}

// ─── Presence chip ────────────────────────────────────────────────────────────

function PresenceChip({
  present,
  label,
}: {
  present: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        present
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-500',
      )}
      aria-label={`${label}: ${present ? 'present' : 'absent'}`}
    >
      {present ? label : <span className="opacity-60">{label}</span>}
    </span>
  )
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({
  field,
  active,
  direction,
}: {
  field: string
  active: boolean
  direction: 'asc' | 'desc'
}) {
  if (!active) return <ArrowUpDown className="size-3 ml-1 opacity-30" aria-hidden="true" />
  if (direction === 'asc')
    return <ArrowUp className="size-3 ml-1 text-[#3370FF]" aria-hidden="true" />
  return <ArrowDown className="size-3 ml-1 text-[#3370FF]" aria-hidden="true" />
}

// ─── Main component ──────────────────────────────────────────────────────────

export function QueryWinLossTable({
  queries,
  competitors,
  onFixGap,
}: QueryWinLossTableProps) {
  const [sortMode, setSortMode] = React.useState<SortMode>('gap')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'gaps'>('gaps')

  const filtered = React.useMemo(() => {
    let q = queries
    if (activeFilter === 'gaps') {
      q = q.filter((r) => !r.youPresent && r.competitorPresence.length > 0)
    }
    return q
  }, [queries, activeFilter])

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      let val = 0
      if (sortMode === 'contested') {
        val = a.competitorPresence.length - b.competitorPresence.length
      } else {
        val = a.gap - b.gap
      }
      return sortDir === 'desc' ? -val : val
    })
  }, [filtered, sortMode, sortDir])

  function handleSort(mode: SortMode) {
    if (sortMode === mode) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortMode(mode)
      setSortDir('desc')
    }
  }

  const topCompetitors = competitors.slice(0, 3)

  return (
    <div>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0a0a0a]">
            Per-query win/loss
          </h2>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Where competitors appear across AI engines
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-1">
          <button
            type="button"
            onClick={() => setActiveFilter('gaps')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
              activeFilter === 'gaps'
                ? 'bg-white text-[#0a0a0a] shadow-sm'
                : 'text-[#6b7280] hover:text-[#0a0a0a]',
            )}
          >
            Biggest gaps
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
              activeFilter === 'all'
                ? 'bg-white text-[#0a0a0a] shadow-sm'
                : 'text-[#6b7280] hover:text-[#0a0a0a]',
            )}
          >
            All queries
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-[#e5e7eb] bg-white py-12 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-3">
            <Zap className="size-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-[#0a0a0a]">
            No query gaps found
          </p>
          <p className="text-xs text-[#6b7280] mt-1 max-w-xs mx-auto">
            You appear in all tracked queries where competitors are cited.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              aria-label="Per-query win/loss breakdown"
            >
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] min-w-[200px]">
                    Query
                  </th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#3370FF] whitespace-nowrap">
                    You
                  </th>
                  {topCompetitors.map((c) => (
                    <th
                      key={c.id}
                      className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] whitespace-nowrap hidden sm:table-cell"
                    >
                      {c.name}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center hidden md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('gap')}
                      className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] hover:text-[#0a0a0a] transition-colors duration-100 focus-visible:outline-none"
                      aria-label="Sort by gap"
                    >
                      Gap
                      <SortIcon
                        field="gap"
                        active={sortMode === 'gap'}
                        direction={sortDir}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {sorted.map((row) => (
                  <tr
                    key={row.query}
                    className="group hover:bg-[#f9fafb] transition-colors duration-100"
                  >
                    {/* Query */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {!row.youPresent && row.competitorPresence.length > 0 && (
                          <AlertTriangle
                            className="size-3.5 text-amber-500 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <p className="text-sm text-[#0a0a0a] leading-snug">
                            {row.query}
                          </p>
                          {row.volume && (
                            <p className="text-[11px] text-[#9ca3af] mt-0.5 tabular-nums">
                              ~{row.volume.toLocaleString()} searches/mo
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* You */}
                    <td className="px-3 py-3 text-center">
                      <PresenceChip present={row.youPresent} label="You" />
                    </td>

                    {/* Competitors */}
                    {topCompetitors.map((c) => (
                      <td
                        key={c.id}
                        className="px-3 py-3 text-center hidden sm:table-cell"
                      >
                        <PresenceChip
                          present={row.competitorPresence.includes(c.name)}
                          label={c.name}
                        />
                      </td>
                    ))}

                    {/* Gap score */}
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      {row.gap > 0 ? (
                        <span className="text-xs font-semibold tabular-nums text-red-600">
                          -{row.gap} pp
                        </span>
                      ) : row.gap < 0 ? (
                        <span className="text-xs font-semibold tabular-nums text-emerald-600">
                          +{Math.abs(row.gap)} pp
                        </span>
                      ) : (
                        <span className="text-xs text-[#9ca3af]">Tied</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {!row.youPresent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onFixGap?.(row.query)}
                          className="h-7 px-2.5 text-[11px] font-medium text-[#3370FF] border-[#3370FF]/30 hover:bg-[#3370FF]/5 hover:border-[#3370FF] transition-colors duration-150"
                        >
                          Fix this gap
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type { Competitor, Engine } from './types'
import { ALL_ENGINES } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EngineHeatmapProps {
  competitors: Competitor[]
  yourSoV: number
  yourEngineRates: Partial<Record<Engine, number>>
  onViewQueries?: (entityName: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCell(rate: number | undefined): {
  bg: string
  text: string
  display: string
} {
  if (rate === undefined) {
    return {
      bg: 'bg-[#f7f7f7]',
      text: 'text-[#9ca3af]',
      display: '—',
    }
  }
  const pct = Math.round(rate * 100)
  if (pct >= 50) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      display: `${pct}%`,
    }
  }
  if (pct >= 25) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      display: `${pct}%`,
    }
  }
  return {
    bg: 'bg-red-50',
    text: 'text-red-600',
    display: `${pct}%`,
  }
}

// ─── Favicon ──────────────────────────────────────────────────────────────────

function Favicon({ domain }: { domain: string }) {
  const [errored, setErrored] = React.useState(false)
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  if (errored) {
    return (
      <div className="size-5 rounded bg-[#f7f7f7] flex items-center justify-center text-[9px] font-semibold text-[#9ca3af] shrink-0">
        {domain.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={14}
      height={14}
      className="size-3.5 rounded shrink-0"
      onError={() => setErrored(true)}
    />
  )
}

// ─── Engine cell ─────────────────────────────────────────────────────────────

function EngineCell({
  rate,
  youRate,
}: {
  rate: number | undefined
  youRate: number | undefined
}) {
  const { bg, text, display } = getCell(rate)

  // Win/lose vs you
  const isWin =
    rate !== undefined && youRate !== undefined && rate > youRate + 0.05
  const isLoss =
    rate !== undefined && youRate !== undefined && rate < youRate - 0.05

  return (
    <td className="px-3 py-0 h-10">
      <div
        className={cn(
          'flex items-center justify-center rounded-md h-7 min-w-[52px] text-[11px] font-semibold tabular-nums transition-colors duration-150',
          bg,
          text,
          isWin && 'ring-1 ring-red-300',
          isLoss && 'ring-1 ring-emerald-300',
        )}
        title={
          isWin
            ? 'They outrank you here'
            : isLoss
              ? 'You outrank them here'
              : undefined
        }
      >
        {display}
      </div>
    </td>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function EngineHeatmap({
  competitors,
  yourSoV,
  yourEngineRates,
  onViewQueries,
}: EngineHeatmapProps) {
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null)

  // "You" row data — derive your SoV as a fraction
  const youRate = yourSoV / 100

  const rows = [
    {
      id: 'you',
      name: 'You',
      url: null as string | null,
      overallRate: youRate,
      engineRates: yourEngineRates,
      isYou: true,
    },
    ...competitors.map((c) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      overallRate: c.appearanceRate,
      engineRates: c.engineRates ?? ({} as Partial<Record<Engine, number>>),
      isYou: false,
    })),
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#0a0a0a]">
            Head-to-head by AI engine
          </h2>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Citation rate % over the last 30 days
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#6b7280]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-300" />
            You win
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-red-100 ring-1 ring-red-300" />
            They win
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-emerald-50" />
            ≥50%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-amber-50" />
            25–49%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-red-50" />
            &lt;25%
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Head-to-head engine citation rates">
            <thead>
              <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] min-w-[160px]">
                  Competitor
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280]">
                  Overall
                </th>
                {ALL_ENGINES.map((engine) => (
                  <th
                    key={engine}
                    className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7280] whitespace-nowrap"
                  >
                    {engine}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors duration-100 group',
                    row.isYou
                      ? 'bg-[#f0f5ff]'
                      : hoveredRow === row.id
                        ? 'bg-[#f9fafb]'
                        : 'bg-white',
                  )}
                  onMouseEnter={() => !row.isYou && setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Identity */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {row.url && <Favicon domain={row.url} />}
                      {!row.url && (
                        <div
                          className="size-3.5 rounded-full bg-[#3370FF] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p
                          className={cn(
                            'text-sm leading-tight',
                            row.isYou
                              ? 'font-semibold text-[#3370FF]'
                              : 'font-medium text-[#0a0a0a]',
                          )}
                        >
                          {row.name}
                        </p>
                        {row.url && (
                          <p className="text-[10px] text-[#9ca3af] mt-0.5">
                            {row.url}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Overall SoV */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#f3f4f6] overflow-hidden shrink-0">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            row.isYou ? 'bg-[#3370FF]' : 'bg-[#6b7280]',
                          )}
                          style={{ width: `${Math.round(row.overallRate * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums font-medium text-[#0a0a0a]">
                        {Math.round(row.overallRate * 100)}%
                      </span>
                    </div>
                  </td>

                  {/* Per-engine cells */}
                  {ALL_ENGINES.map((engine) => (
                    <EngineCell
                      key={engine}
                      rate={row.engineRates[engine]}
                      youRate={
                        row.isYou ? undefined : yourEngineRates[engine]
                      }
                    />
                  ))}

                  {/* View queries link */}
                  <td className="px-3 py-3">
                    {!row.isYou && onViewQueries && (
                      <button
                        type="button"
                        onClick={() => onViewQueries(row.name)}
                        aria-label={`View queries for ${row.name}`}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-[#3370FF] hover:underline whitespace-nowrap transition-opacity duration-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
                      >
                        View queries
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

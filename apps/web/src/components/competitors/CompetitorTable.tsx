'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface EngineBreakdown {
  engine: string
  mentionRate: number
}

export interface SentimentSplit {
  positive: number
  neutral: number
  negative: number
}

export interface Competitor {
  id: string
  name: string
  url: string
  appearanceRate: number
  queriesWhereAppears: string[]
  fourWeekTrend: number[]
  engineBreakdown?: EngineBreakdown[]
  sentimentSplit?: SentimentSplit
}

interface CompetitorTableProps {
  competitors: Competitor[]
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ values, isRising }: { values: number[]; isRising: boolean }) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 56
  const H = 22
  const step = W / (values.length - 1)

  const pts = values
    .map((v, i) => {
      const x = i * step
      const y = H - ((v - min) / range) * (H - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const color = isRising ? '#10B981' : '#6B7280'

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── ShareOfVoiceBar ───────────────────────────────────────────────────────────

function ShareOfVoiceBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="relative h-1.5 w-24 rounded-full bg-gray-100 shrink-0 overflow-hidden"
        role="img"
        aria-label={`${pct}% share of voice`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#3370FF] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums font-medium text-gray-700 shrink-0">
        {pct}%
      </span>
    </div>
  )
}

// ── TrendIndicator ────────────────────────────────────────────────────────────

function TrendIndicator({ trend }: { trend: number[] }) {
  const first = trend[0] ?? 0
  const last = trend[trend.length - 1] ?? 0
  const delta = last - first
  const isRising = delta > 0
  const isFlat = delta === 0

  return (
    <div className="flex items-center gap-2">
      <Sparkline values={trend} isRising={isRising} />
      <span
        className={cn(
          'text-xs font-medium tabular-nums',
          isRising ? 'text-emerald-600' : isFlat ? 'text-gray-400' : 'text-gray-500'
        )}
      >
        {isRising ? (
          <span className="flex items-center gap-0.5">
            <TrendingUp size={11} aria-hidden="true" />
            +{delta}
          </span>
        ) : isFlat ? (
          <span className="flex items-center gap-0.5">
            <Minus size={11} aria-hidden="true" />
            flat
          </span>
        ) : (
          <span className="flex items-center gap-0.5">
            <TrendingDown size={11} aria-hidden="true" />
            {delta}
          </span>
        )}
      </span>
    </div>
  )
}

// ── CompetitorAvatar ──────────────────────────────────────────────────────────

function CompetitorAvatar({ name, url }: { name: string; url: string }) {
  const initials = name
    .split(/[\s.]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  // Deterministic hue from domain string — avoids generic gray avatars
  const hue = Array.from(url).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white shrink-0 select-none"
      style={{ background: `hsl(${hue} 52% 48%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ── EngineBreakdownPanel ──────────────────────────────────────────────────────

function EngineBreakdownPanel({ breakdown }: { breakdown: EngineBreakdown[] }) {
  return (
    <div className="px-4 py-3.5 bg-[#F7F7F7] border-t border-gray-100">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400 mb-2.5">
        Engine-by-engine mention rate
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {breakdown.map((b) => {
          const pct = Math.round(b.mentionRate * 100)
          return (
            <div key={b.engine} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-20 shrink-0">{b.engine}</span>
              <div className="relative flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#3370FF] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-gray-600 w-7 text-right shrink-0">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SentimentPanel ────────────────────────────────────────────────────────────

function SentimentPanel({ sentiment }: { sentiment: SentimentSplit }) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative || 1
  const posPct = Math.round((sentiment.positive / total) * 100)
  const neuPct = Math.round((sentiment.neutral / total) * 100)
  const negPct = 100 - posPct - neuPct

  return (
    <div className="px-4 py-3.5 border-t border-gray-100 bg-[#F7F7F7]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400 mb-2.5">
        Sentiment split
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex-1 flex h-1.5 rounded-full overflow-hidden"
          role="img"
          aria-label={`Positive ${posPct}%, neutral ${neuPct}%, negative ${negPct}%`}
        >
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${posPct}%` }}
          />
          <div
            className="h-full bg-gray-300 transition-all duration-500"
            style={{ width: `${neuPct}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all duration-500"
            style={{ width: `${negPct}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs tabular-nums">
          <span className="text-emerald-600 font-medium">{posPct}%</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{neuPct}%</span>
          <span className="text-gray-300">/</span>
          <span className="text-red-400">{negPct}%</span>
        </div>
      </div>
      <div className="mt-2 flex gap-4">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" aria-hidden="true" />
          positive
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-gray-300" aria-hidden="true" />
          neutral
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-400" aria-hidden="true" />
          negative
        </span>
      </div>
    </div>
  )
}

// ── TopQueriesPanel ───────────────────────────────────────────────────────────

function TopQueriesPanel({ queries }: { queries: string[] }) {
  return (
    <div className="px-4 py-3.5 border-t border-gray-100 bg-[#F7F7F7] rounded-b-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400 mb-2.5">
        Queries where they appear
      </p>
      <div className="flex flex-wrap gap-1.5">
        {queries.slice(0, 6).map((q) => (
          <span
            key={q}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600"
          >
            {q}
          </span>
        ))}
        {queries.length > 6 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs text-gray-400">
            +{queries.length - 6} more
          </span>
        )}
      </div>
    </div>
  )
}

// ── CompetitorRow ─────────────────────────────────────────────────────────────

function CompetitorRow({ competitor }: { competitor: Competitor }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail =
    (competitor.engineBreakdown && competitor.engineBreakdown.length > 0) ||
    competitor.sentimentSplit ||
    competitor.queriesWhereAppears.length > 0

  const first = competitor.fourWeekTrend[0] ?? 0
  const last = competitor.fourWeekTrend[competitor.fourWeekTrend.length - 1] ?? 0
  const delta = last - first

  return (
    <>
      <tr
        className={cn(
          'transition-colors duration-150 hover:bg-gray-50/80',
          expanded && 'bg-gray-50/40'
        )}
      >
        {/* Competitor */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <CompetitorAvatar name={competitor.name} url={competitor.url} />
            <div className="min-w-0">
              <span className="block font-medium text-gray-900 text-sm leading-tight truncate">
                {competitor.name}
              </span>
              <a
                href={`https://${competitor.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-[#3370FF] transition-colors duration-150 mt-0.5"
                aria-label={`Visit ${competitor.url} (opens in new tab)`}
              >
                {competitor.url}
                <ExternalLink size={10} className="shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </td>

        {/* Share of voice */}
        <td className="px-4 py-3.5">
          <ShareOfVoiceBar rate={competitor.appearanceRate} />
        </td>

        {/* 4-week trend */}
        <td className="px-4 py-3.5 hidden md:table-cell">
          <TrendIndicator trend={competitor.fourWeekTrend} />
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-right">
          {hasDetail ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                'text-xs font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded px-1',
                expanded ? 'text-[#3370FF]' : 'text-gray-400 hover:text-gray-700'
              )}
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${competitor.name}`}
            >
              {expanded ? 'Collapse' : 'Details'}
            </button>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
      </tr>

      {/* Expanded detail section */}
      {expanded && (
        <tr aria-label={`${competitor.name} detail breakdown`}>
          <td colSpan={4} className="p-0">
            {competitor.engineBreakdown && competitor.engineBreakdown.length > 0 && (
              <EngineBreakdownPanel breakdown={competitor.engineBreakdown} />
            )}
            {competitor.sentimentSplit && (
              <SentimentPanel sentiment={competitor.sentimentSplit} />
            )}
            {competitor.queriesWhereAppears.length > 0 && (
              <TopQueriesPanel queries={competitor.queriesWhereAppears} />
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ── CompetitorTable ───────────────────────────────────────────────────────────

export function CompetitorTable({ competitors }: CompetitorTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Visually-hidden summary for screen readers */}
      <p className="sr-only">
        {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked.
        {competitors.map((c) => (
          ` ${c.name}: ${Math.round(c.appearanceRate * 100)}% share of voice.`
        ))}
      </p>

      <table
        className="w-full text-sm"
        aria-label="Competitor share-of-voice"
        role="table"
      >
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400"
            >
              Competitor
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400"
            >
              Share of voice
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 hidden md:table-cell"
            >
              4-week trend
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {competitors.map((competitor) => (
            <CompetitorRow key={competitor.id} competitor={competitor} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

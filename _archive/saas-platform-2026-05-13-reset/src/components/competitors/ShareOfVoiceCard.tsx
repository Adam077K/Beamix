'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Competitor } from './types'

// ─── Sparkline (pure SVG, no dependencies) ───────────────────────────────────

function Sparkline({
  data,
  color,
  className,
}: {
  data: number[]
  color: string
  className?: string
}) {
  if (data.length < 2) return null

  const W = 120
  const H = 36
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H * 0.8) - H * 0.1
    return [x.toFixed(1), y.toFixed(1)] as [string, string]
  })

  const polyline = pts.map((p) => p.join(',')).join(' ')
  const area = `M ${pts.map((p) => p.join(' ')).join(' L ')} L ${pts[pts.length - 1]![0]} ${H} L ${pts[0]![0]} ${H} Z`
  const gradId = `sov-sparkline-${color.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn('overflow-visible', className)}
      style={{ height: H }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last data point dot */}
      <circle
        cx={pts[pts.length - 1]![0]}
        cy={pts[pts.length - 1]![1]}
        r="3"
        fill={color}
      />
    </svg>
  )
}

// ─── SoV bar segment ──────────────────────────────────────────────────────────

function SovSegment({
  label,
  pct,
  color,
  isYou,
}: {
  label: string
  pct: number
  color: string
  isYou?: boolean
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={cn(
          'h-2 rounded-full transition-all duration-700',
          isYou ? 'opacity-100' : 'opacity-70',
        )}
        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
        role="presentation"
      />
      <span
        className={cn(
          'text-[11px] tabular-nums shrink-0',
          isYou ? 'font-semibold text-[#0a0a0a]' : 'text-[#6b7280]',
        )}
      >
        {label} {pct}%
      </span>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShareOfVoiceCardProps {
  yourSoV: number
  yourSoVTrend: number[]
  competitors: Competitor[]
}

const COMPETITOR_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']

export function ShareOfVoiceCard({
  yourSoV,
  yourSoVTrend,
  competitors,
}: ShareOfVoiceCardProps) {
  const topCompetitor = [...competitors].sort(
    (a, b) => b.appearanceRate - a.appearanceRate,
  )[0]

  const gap =
    topCompetitor
      ? Math.round(topCompetitor.appearanceRate * 100) - yourSoV
      : 0

  const trendDelta =
    yourSoVTrend.length >= 2
      ? yourSoVTrend[yourSoVTrend.length - 1]! - yourSoVTrend[0]!
      : 0

  const isGaining = trendDelta > 0

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6b7280] mb-1">
            Your share of voice
          </p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-[#0a0a0a]">
              {yourSoV}%
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isGaining
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600',
              )}
            >
              {isGaining ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              {isGaining ? '+' : ''}
              {trendDelta} pp this week
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-[120px] shrink-0">
          <Sparkline
            data={yourSoVTrend}
            color="#3370FF"
            className="w-full"
          />
        </div>
      </div>

      {/* Comparison row */}
      {topCompetitor && (
        <div className="mb-4 flex items-center gap-1.5 flex-wrap text-[13px] text-[#6b7280]">
          <span className="font-medium text-[#0a0a0a]">You: {yourSoV}%</span>
          <span className="text-[#e5e7eb]">·</span>
          <span className="font-medium text-[#ef4444]">
            {topCompetitor.name}: {Math.round(topCompetitor.appearanceRate * 100)}%
          </span>
          {gap > 0 && (
            <>
              <span className="text-[#e5e7eb]">·</span>
              <span className="font-semibold text-[#ef4444]">Gap: -{gap} pp</span>
            </>
          )}
          {gap <= 0 && (
            <>
              <span className="text-[#e5e7eb]">·</span>
              <span className="font-semibold text-emerald-600">You lead by {Math.abs(gap)} pp</span>
            </>
          )}
        </div>
      )}

      {/* SoV distribution bar */}
      <div className="space-y-2">
        <SovSegment
          label="You"
          pct={yourSoV}
          color="#3370FF"
          isYou
        />
        {competitors.slice(0, 3).map((c, i) => (
          <SovSegment
            key={c.id}
            label={c.name}
            pct={Math.round(c.appearanceRate * 100)}
            color={COMPETITOR_COLORS[i] ?? '#9ca3af'}
          />
        ))}
      </div>
    </div>
  )
}

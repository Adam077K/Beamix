'use client'

import { useMemo } from 'react'
import { engineOpacity, useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { cn } from '@/lib/utils'
import { BOT_COLORS, BOT_ORDER } from './bot-colors'
import type { CrawlerTrend } from '@/lib/demo/surfaces/types'

/**
 * BotMixPanel — TIER-2, ~40% width (lighter half of the weighted 2-up).
 *
 * Per-bot total crawl hits + a 24px micro-sparkline of the last ~5 weekly points
 * (M4 signature detail, reused from /analytics' AvgPositionPanel). The sparkline
 * color reads from a normalized band of each bot's own trend (rising = good).
 * Real points only — never fabricated; a single-point series falls back to the
 * flat baseline inside EngineMicroSparkline.
 *
 * Linked-instrument: a row fades to 40% when its bot is toggled off.
 */

interface BotMixPanelProps {
  data: CrawlerTrend[]
}

interface BotRow {
  bot: string
  total: number
  sparkline: number[] | null
  band: number | null
}

/** Normalize a bot's last-5 hit points into a 0–100 band for the sparkline color. */
function toBand(points: number[]): number | null {
  if (points.length < 2) return null
  const first = points[0]
  const last = points[points.length - 1]
  if (first === 0) return last > 0 ? 100 : 0
  const growth = (last - first) / first
  // Rising crawl volume is "good"; map 0%→50, +50%→100, −50%→0.
  return Math.max(0, Math.min(100, Math.round(50 + growth * 100)))
}

export function BotMixPanel({ data }: BotMixPanelProps) {
  const filter = useAnalyticsFilter()

  const rows = useMemo<BotRow[]>(() => {
    const map = new Map(data.map((t) => [t.bot, t]))
    return BOT_ORDER.map((bot) => {
      const series = map.get(bot)
      const points = series ? series.points.map((p) => p.hits) : []
      const sparkline = points.length >= 2 ? points.slice(-5) : null
      return {
        bot,
        total: points.reduce((s, v) => s + v, 0),
        sparkline,
        band: sparkline ? toBand(sparkline) : null,
      }
    }).sort((a, b) => b.total - a.total)
  }, [data])

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Bot mix
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Total hits per crawler, with its recent trend.
        </p>
      </div>

      <ul className="divide-y divide-[#F0F1F3]">
        {rows.map((row) => {
          const visible = filter.engines[row.bot] !== false
          return (
            <li
              key={row.bot}
              className={cn(
                'flex items-center gap-3 py-3 transition-opacity duration-200 ease-out',
                engineOpacity(row.bot, filter),
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: visible ? BOT_COLORS[row.bot] : '#D1D5DB' }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate font-mono text-[13px] text-[#374151]">{row.bot}</span>

              <EngineMicroSparkline
                points={row.sparkline}
                currentScore={row.band}
                className="shrink-0"
              />

              <span className="w-12 shrink-0 text-right font-mono text-[16px] font-medium tabular-nums text-[#0A0A0A]">
                {row.total.toLocaleString()}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

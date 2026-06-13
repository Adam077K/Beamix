'use client'

import { engineOpacity, useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { cn } from '@/lib/utils'
import { ENGINE_COLORS } from './engine-colors'
import type { AvgPositionStat } from '@/lib/demo/surfaces/types'

/**
 * AvgPositionPanel — TIER-3, ~40% width (the lighter half of the weighted 2-up).
 *
 * Demoted to .card-inset (P1.3): it RECEDES on the warm canvas behind the TIER-2
 * SoV chart beside it, so depth is felt rather than declared. Reads as a dense
 * mono stat strip, not another full chart card — the header is eyebrow-only
 * (the explanatory sentence moved to each row's title attribute, P2.7/P2.9), and
 * the #1.4 mono figure is the loud element with the engine label receding (M7).
 *
 * Mono stat list: per-engine average position + a 64px micro-sparkline of the
 * last ~5 points. This is the page-1 signature DETAIL (M4).
 *
 * Position is "lower = better", but EngineMicroSparkline draws "higher = up".
 * We INVERT the series (e.g. 5 - pos) so an improving position trends UP visually,
 * and derive a 0–100 band so the sparkline color reads good/fair correctly —
 * never fabricating data, just remapping the real points.
 *
 * Linked-instrument: a row fades to 40% when its engine is toggled off.
 */

interface AvgPositionPanelProps {
  stats: AvgPositionStat[]
}

/** Lower position is better. Map ~1.0 → 100, ~5.0 → 0 for the color band only. */
function positionToBand(pos: number): number {
  const clamped = Math.max(1, Math.min(5, pos))
  return Math.round(((5 - clamped) / 4) * 100)
}

/** Invert each position point so "improving = up" on the sparkline. */
function invertSeries(points: number[] | null): number[] | null {
  if (!points || points.length < 2) return null
  return points.map((p) => 5 - p)
}

export function AvgPositionPanel({ stats }: AvgPositionPanelProps) {
  const filter = useAnalyticsFilter()

  return (
    <div className="card-inset p-6">
      {/* Eyebrow-only header (P2.7/P2.9) — the "lower is better" gloss moves to
          each row's title so this panel reads as a dense strip, not a chart. */}
      <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Average position
      </p>

      <ul className="divide-y divide-[#EBEAE4]">
        {stats.map((stat) => {
          const visible = filter.engines[stat.engine] !== false
          const band = positionToBand(stat.avgPosition)
          const inverted = invertSeries(stat.sparkline)
          return (
            <li
              key={stat.engine}
              title={`${stat.engine}: average position #${stat.avgPosition.toFixed(1)} when it names you — lower is better.`}
              className={cn(
                'flex items-center gap-3 py-3 transition-opacity duration-200 ease-out',
                engineOpacity(stat.engine, filter),
              )}
            >
              {/* swatch + engine (receding label, M7) */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: visible ? ENGINE_COLORS[stat.engine] : '#D1D5DB' }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-[13px] text-[#6B7280]">{stat.engine}</span>

              {/* signature micro-sparkline */}
              <EngineMicroSparkline
                points={inverted}
                currentScore={inverted ? band : null}
                className="shrink-0"
              />

              {/* mono position figure — the loud element (M7) */}
              <span className="w-12 shrink-0 text-right font-mono text-[18px] font-medium tabular-nums text-[#0A0A0A]">
                #{stat.avgPosition.toFixed(1)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

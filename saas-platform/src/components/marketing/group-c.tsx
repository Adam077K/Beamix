'use client'

import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import { BrewBeanMark, CompetitorMark } from '@/components/marketing/logos'
import { CompetitorBarChart } from '@/components/dashboard/charts/competitor-bar-chart'
import { AnimatedCard, CARD } from '@/components/marketing/card'
import { Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_COMPETITORS = [
  { name: 'Brew & Bean', score: 75, isUser: true },
  { name: 'The Daily Grind', score: 68, isUser: false },
  { name: 'Morning Roast Co', score: 52, isUser: false },
  { name: 'Bean Scene', score: 44, isUser: false },
  { name: 'Espresso Lab', score: 38, isUser: false },
]

const LEADERBOARD = [
  { rank: 1, name: 'Brew & Bean', isUser: true, mentions: 534, position: 3.5, change: -3.3, visibility: 31.5 },
  { rank: 2, name: 'The Daily Grind', mentions: 142, position: 4.7, change: -2.6, visibility: 28.6 },
  { rank: 3, name: 'Morning Roast Co', mentions: 164, position: 5.8, change: 3.3, visibility: 18.5 },
  { rank: 4, name: 'Bean Scene', mentions: 139, position: 6.5, change: -1.4, visibility: 16.0 },
  { rank: 5, name: 'Espresso Lab', mentions: 98, position: 7.5, change: 3.3, visibility: 13.4 },
]

const MAX_VIS = Math.max(...LEADERBOARD.map(r => r.visibility))

// ─── Group C component ────────────────────────────────────────────────────────

export function GroupC() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* C1: Competitor bar chart */}
      <AnimatedCard className="overflow-hidden">
        <div className="px-6 pt-6 pb-1">
          <p className="text-sm font-medium text-gray-500">Competitor Comparison</p>
        </div>
        <div className="px-6 pb-6 pt-3">
          <CompetitorBarChart data={DEMO_COMPETITORS} hasRealData />
        </div>
      </AnimatedCard>

      {/* C2: Industry leaderboard — Attio table recipe */}
      <AnimatedCard className="overflow-hidden" delay={0.1}>
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <p className="text-sm font-medium text-gray-500">Industry Ranking</p>
          <div className="text-right">
            <NumberFlow
              value={31.5}
              suffix="%"
              format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
              className="text-xl font-semibold tracking-tight tabular-nums text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-0.5">avg visibility</p>
          </div>
        </div>

        {/* Header — clean, no uppercase */}
        <div className="grid grid-cols-[20px_1fr_56px_40px_48px_72px] gap-1 px-6 py-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-400">#</span>
          <span className="text-xs font-medium text-gray-400">Brand</span>
          <span className="text-xs font-medium text-gray-400 text-right">Mentions</span>
          <span className="text-xs font-medium text-gray-400 text-right">Pos</span>
          <span className="text-xs font-medium text-gray-400 text-right">Change</span>
          <span className="text-xs font-medium text-gray-400 text-right">Score</span>
        </div>

        {/* Rows — 52px height, divide-gray-50 */}
        <Stagger>
          {LEADERBOARD.map((row, idx) => (
            <StaggerItem key={row.rank}>
              <div
                className={cn(
                  'grid grid-cols-[20px_1fr_56px_40px_48px_72px] gap-1 items-center px-6 py-4',
                  'border-t border-gray-50 transition-colors duration-150 hover:bg-gray-50/50',
                  row.isUser && 'bg-[#3370FF]/[0.02]'
                )}
              >
                <span className="text-sm tabular-nums text-gray-300">{row.rank}</span>

                <span className="flex items-center gap-2 min-w-0">
                  {row.isUser ? (
                    <BrewBeanMark size="sm" />
                  ) : (
                    <CompetitorMark name={row.name} index={idx - 1} size="sm" />
                  )}
                  <span className={cn(
                    'text-sm truncate',
                    row.isUser ? 'font-medium text-gray-900' : 'text-gray-600'
                  )}>
                    {row.name}
                  </span>
                  {row.isUser && (
                    <span className="shrink-0 bg-[#3370FF] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">You</span>
                  )}
                </span>

                <span className="text-sm tabular-nums text-gray-500 text-right">{row.mentions}</span>
                <span className="text-sm tabular-nums text-gray-500 text-right">{row.position}</span>

                <span className={cn(
                  'text-sm tabular-nums text-right font-medium',
                  row.change > 0 ? 'text-[#3370FF]' : 'text-gray-400'
                )}>
                  {row.change > 0 ? '+' : ''}{row.change}%
                </span>

                {/* Score with proportional bar */}
                <div className="flex items-center justify-end gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(row.visibility / MAX_VIS) * 100}%`,
                        backgroundColor: row.isUser ? '#3370FF' : '#D1D5DB',
                      }}
                    />
                  </div>
                  <span className={cn(
                    'text-sm tabular-nums font-medium min-w-[36px] text-right',
                    row.isUser ? 'text-gray-900' : 'text-gray-500'
                  )}>
                    {row.visibility}%
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </AnimatedCard>
    </div>
  )
}

'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { cn } from '@/lib/utils'
import { ENGINE_COLORS, ENGINE_TO_BOT } from './bot-colors'
import type { ReferralAttribution } from '@/lib/demo/surfaces/types'

/**
 * ReferralAttributionPanel — TIER-2, ~60% width (heavier half of the 2-up).
 *
 * Horizontal bar per engine: AI-referred sessions (filled) with the conversions
 * subset shown as a darker inset segment — the GA4-join framing. This is
 * your-data only; there are no competitors here.
 *
 * Linked-instrument: each bar dims to 40% when the BOT that feeds it is toggled
 * off in the rail (ENGINE_TO_BOT mapping), so the linked-bot gesture ripples
 * across this instrument too — not just the bot-keyed charts.
 */

interface ReferralAttributionPanelProps {
  data: ReferralAttribution[]
}

export function ReferralAttributionPanel({ data }: ReferralAttributionPanelProps) {
  const { engines } = useAnalyticsFilter()
  const maxSessions = Math.max(...data.map((d) => d.sessions)) || 1

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Referral attribution
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Sessions and conversions each engine sent you, last 30 days.
        </p>
      </div>

      <ul className="space-y-4">
        {data.map((row) => {
          const bot = ENGINE_TO_BOT[row.engine]
          const visible = bot ? engines[bot] !== false : true
          const color = ENGINE_COLORS[row.engine] ?? '#9CA3AF'
          const sessionPct = (row.sessions / maxSessions) * 100
          const convPct = row.sessions > 0 ? (row.conversions / row.sessions) * sessionPct : 0
          return (
            <li
              key={row.engine}
              className={cn(
                'transition-opacity duration-200 ease-out',
                visible ? 'opacity-100' : 'opacity-40',
              )}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-[14px] text-[#374151]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: visible ? color : '#D1D5DB' }}
                    aria-hidden="true"
                  />
                  {row.engine}
                </span>
                <span className="font-mono text-[13px] tabular-nums text-[#9CA3AF]">
                  <span className="text-[#0A0A0A]">{row.sessions.toLocaleString()}</span> sessions ·{' '}
                  <span className="text-[#0A0A0A]">{row.conversions}</span> conv
                </span>
              </div>
              {/* Session bar with conversion inset segment */}
              <div
                className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
                role="img"
                aria-label={`${row.engine}: ${row.sessions} sessions, ${row.conversions} conversions`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${sessionPct}%`, backgroundColor: color, opacity: 0.35 }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${convPct}%`, backgroundColor: color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

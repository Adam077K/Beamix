'use client'

import { DEMO_OFFSITE } from '@/lib/demo/surfaces/offsite'
import type { OffsiteRow } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// OffsiteRail — the "earn the width" context rail (M3 / M10)
//
// The audit's P1.3 fix: the page was a centered 880px column floating in a
// vast right/lower void. ToolPage's `rail` prop turns the spine into a
// dominant-column + narrower-rail split. This rail fills the freed space with
// REAL derived context (not filler): per-channel coverage + last agent runs.
// TIER-3 .card-inset surfaces so the rail recedes behind the work column.
// ---------------------------------------------------------------------------

interface ChannelStat {
  key: OffsiteRow['tab']
  label: string
  tracked: number
  total: number
}

const CHANNEL_LABELS: Record<OffsiteRow['tab'], string> = {
  citation: 'Citations',
  directory: 'Directories',
  entity: 'Entities',
  reputation: 'Reputation',
  community: 'Community',
}

function channelStats(rows: readonly OffsiteRow[]): ChannelStat[] {
  return (Object.keys(CHANNEL_LABELS) as OffsiteRow['tab'][]).map((key) => {
    const tabRows = rows.filter((r) => r.tab === key)
    const tracked = tabRows.filter(
      (r) => r.status === 'tracked' || r.status === 'submitted',
    ).length
    return { key, label: CHANNEL_LABELS[key], tracked, total: tabRows.length }
  })
}

/** Coverage ratio → data-viz band color (data-viz only, never the action accent). */
function coverageColor(ratio: number): string {
  if (ratio >= 0.75) return 'var(--color-data-3)' // cyan — excellent
  if (ratio >= 0.5) return 'var(--color-data-4)' // green — good
  if (ratio >= 0.25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                  red — critical
}

const LAST_RUNS = [
  {
    label: 'Off-Site Presence Builder',
    detail: DEMO_OFFSITE.lastOffsiteRun.summary,
    when: '2d ago',
  },
  {
    label: 'Entity Builder',
    detail: DEMO_OFFSITE.lastEntityRun.summary,
    when: '3d ago',
  },
  {
    label: 'Review Presence Planner',
    detail: DEMO_OFFSITE.lastReputationRun.summary,
    when: '4d ago',
  },
] as const

export function OffsiteRail() {
  const stats = channelStats(DEMO_OFFSITE.rows)
  const totalTracked = stats.reduce((s, c) => s + c.tracked, 0)
  const totalSources = stats.reduce((s, c) => s + c.total, 0)

  return (
    <div className="space-y-6">
      {/* Coverage by channel — derived from the same rows the table shows */}
      <section className="card-inset px-5 py-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Coverage by channel
          </h2>
          <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
            {totalTracked}/{totalSources}
          </span>
        </div>

        <ul className="space-y-3.5">
          {stats.map((c) => {
            const ratio = c.total === 0 ? 0 : c.tracked / c.total
            return (
              <li key={c.key}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-[#0A0A0A]">
                    {c.label}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-[#6B7280]">
                    {c.tracked}
                    <span className="text-[#C4C9D1]">/{c.total}</span>
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
                  role="img"
                  aria-label={`${c.label}: ${c.tracked} of ${c.total} tracked`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(ratio * 100)}%`,
                      backgroundColor: coverageColor(ratio),
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Recent agent activity — violet zone (M6): agent work reads different */}
      <section className="card-inset border-l-2 border-l-[var(--color-agent-hairline)] px-5 py-4">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Recent agent runs
        </h2>
        <ul className="space-y-4">
          {LAST_RUNS.map((run) => (
            <li key={run.label} className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-agent)]"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
                    {run.label}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#9CA3AF]">
                    {run.when}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-[#6B7280]">
                  {run.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

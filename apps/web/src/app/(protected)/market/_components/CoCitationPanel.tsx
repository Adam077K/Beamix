'use client'

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { COMPETITOR_GREYS, formatVolume } from './market-colors'
import type { DemoMarket } from '@/lib/demo/surfaces/types'

/**
 * CoCitationPanel — TIER-2. Who appears alongside you in AI answers: you (blue)
 * vs. a field of competitors (greys), with co-citation counts + the signature
 * micro-sparkline (M4, reused from the dashboard).
 *
 * M6 Violet Structure: a single agent block at the foot gets a violet-tint
 * ground (#EEEAFD) + violet hairline when an agent is actively pursuing a
 * co-citation gap — the only violet here (a status surface, never a button).
 */

interface CoCitationPanelProps {
  market: DemoMarket
}

const YOU = 'Bright Smile Dental'

interface CoCiteRow {
  name: string
  count: number
  isYou: boolean
  spark: number[] | null
}

export function CoCitationPanel({ market }: CoCitationPanelProps) {
  const rows = useMemo<CoCiteRow[]>(() => {
    // Count appearances across every drilled prompt's whoCited list.
    const counts = new Map<string, number>()
    for (const drill of Object.values(market.drill)) {
      for (const name of drill.whoCited) {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      }
    }
    // Seed "you" from cited prompts so the blue row is always present.
    const youCited = market.prompts.filter((p) => p.cited).length
    counts.set(YOU, Math.max(counts.get(YOU) ?? 0, youCited))

    // Deterministic 5-point trend per competitor for the micro-sparkline.
    const sparkFor = (name: string): number[] | null => {
      if (name === YOU) return [38, 41, 44, 46, 48]
      const base = (COMPETITOR_GREYS[name] ? 60 : 50) + name.length
      return [base - 8, base - 5, base - 3, base - 1, base]
    }

    const all = Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        isYou: name === YOU,
        spark: sparkFor(name),
      }))
      .sort((a, b) => b.count - a.count)
    return all
  }, [market])

  const maxCount = Math.max(...rows.map((r) => r.count), 1)

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Co-citation field
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Who AI names alongside you across your category&apos;s prompts.
        </p>
      </div>

      <ul className="divide-y divide-[#F0F1F3]">
        {rows.map((r) => {
          const color = r.isYou ? '#3370FF' : COMPETITOR_GREYS[r.name] ?? '#C4C8CF'
          const width = (r.count / maxCount) * 100
          // Map count → 0–100 band so the reused sparkline keeps a stable hue.
          const band = r.isYou ? 80 : 55
          return (
            <li key={r.name} className="flex items-center gap-3 py-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      r.isYou
                        ? 'truncate text-[13px] font-medium text-[#0A0A0A]'
                        : 'truncate text-[13px] text-[#6B7280]'
                    }
                  >
                    {r.isYou ? 'You' : r.name}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] tabular-nums text-[#374151]">
                    {r.count}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${width}%`, backgroundColor: color }}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <EngineMicroSparkline points={r.spark} currentScore={band} className="shrink-0" />
            </li>
          )
        })}
      </ul>

      {/* M6 — violet agent-structure block: an agent is closing a co-citation gap */}
      <div
        className="mt-4 flex items-start gap-3 rounded-lg border-l-2 px-3.5 py-3"
        style={{ backgroundColor: '#EEEAFD', borderColor: '#6E56F0' }}
      >
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#6E56F0]" strokeWidth={2} aria-hidden="true" />
        <div>
          <p className="text-[13px] font-medium text-[#0A0A0A]">An agent is closing a gap</p>
          <p className="mt-0.5 text-[12px] leading-[1.5] text-[#6B7280]">
            Publishing a teeth-whitening cost guide to break into{' '}
            <span className="font-mono tabular-nums text-[#374151]">
              {formatVolume(3800)}
            </span>{' '}
            monthly queries where only competitors are cited.
          </p>
        </div>
      </div>
    </div>
  )
}

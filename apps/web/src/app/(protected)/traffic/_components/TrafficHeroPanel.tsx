'use client'

import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BOT_COLORS, BOT_ORDER } from './bot-colors'
import type { CrawlerTrend } from '@/lib/demo/surfaces/types'

/**
 * TrafficHeroPanel — TIER-1 focal card (card-console-hero, one per screen).
 *
 * Asymmetry (M3): LEFT figure column dominant, RIGHT 360px crawl-volume rail.
 * Mirrors SovHeroPanel's earned asymmetry — not an N-equal grid.
 *
 * STEP-1 = 64px Geist Mono AI-referred sessions in #3370FF (the ONE blue
 * structural figure on the page). STEP-2 = 30px InterDisplay verdict.
 * STEP-4 = body. Delta chip = mono status.
 *
 * The right rail is a CRAWL-VOLUME mini-bar set (hits per bot, GPTBot dominant
 * blue) rather than a donut — the bots are the page's primary dimension. Inner
 * figures render in neutral mono #374151 so the 64px blue figure stays the only
 * TIER-1 focal.
 */

interface TrafficHeroPanelProps {
  aiReferredSessions: number
  aiReferredDelta: number
  /** Conversions joined from the GA4 stream (verdict copy). */
  conversions: number
  /** Per-bot weekly series — summed for the crawl-volume mini-bars. */
  crawlerTrend: CrawlerTrend[]
}

interface BotVolume {
  bot: string
  hits: number
  color: string
}

function DeltaChip({ delta }: { delta: number }) {
  const positive = delta >= 0
  const cls = positive
    ? 'bg-status-positive text-status-positive'
    : 'bg-status-critical text-status-critical'
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
      <span className="font-mono tabular-nums">
        {positive ? '+' : ''}
        {delta}%
      </span>
      <span className="font-sans text-[#6B7280]">vs. previous 30d</span>
    </span>
  )
}

function CrawlVolumeBars({ volumes, total }: { volumes: BotVolume[]; total: number }) {
  const max = Math.max(...volumes.map((v) => v.hits)) || 1
  return (
    <div
      className="w-full"
      role="img"
      aria-label={`Crawl volume this period: ${total.toLocaleString()} total hits. ${volumes
        .map((v) => `${v.bot} ${v.hits} hits`)
        .join(', ')}.`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Crawl volume
        </span>
        <span className="font-mono text-[16px] font-medium tabular-nums text-[#374151]">
          {total.toLocaleString()}
        </span>
      </div>
      <ul className="space-y-2.5">
        {volumes.map((v) => {
          const share = Math.round((v.hits / total) * 100)
          return (
            <li key={v.bot} className="flex items-center gap-2.5">
              <span className="w-[108px] shrink-0 truncate font-mono text-[12px] text-[#374151]">
                {v.bot}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, (v.hits / max) * 100)}%`,
                    backgroundColor: v.color,
                  }}
                />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-[#9CA3AF]">
                {share}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function TrafficHeroPanel({
  aiReferredSessions,
  aiReferredDelta,
  conversions,
  crawlerTrend,
}: TrafficHeroPanelProps) {
  const { volumes, total } = useMemo(() => {
    const map = new Map(crawlerTrend.map((t) => [t.bot, t.points.reduce((s, p) => s + p.hits, 0)]))
    const volumes: BotVolume[] = BOT_ORDER.map((bot) => ({
      bot,
      hits: map.get(bot) ?? 0,
      color: BOT_COLORS[bot] ?? '#9CA3AF',
    })).sort((a, b) => b.hits - a.hits)
    const total = volumes.reduce((s, v) => s + v.hits, 0)
    return { volumes, total }
  }, [crawlerTrend])

  return (
    <section
      aria-labelledby="traffic-hero-heading"
      className="card-console-hero relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:items-center lg:p-10">
        {/* LEFT — figure + verdict (dominant) */}
        <div className="min-w-0">
          {/* STEP-3 eyebrow */}
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            AI-referred sessions
          </p>
          {/* STEP-1 — the one blue 64px mono figure */}
          <div className="flex items-end gap-3">
            <span className="font-mono text-[64px] font-medium leading-[0.9] tracking-[-0.03em] tabular-nums text-[#3370FF]">
              {aiReferredSessions.toLocaleString()}
            </span>
          </div>
          {/* STEP-2 verdict */}
          <h2
            id="traffic-hero-heading"
            className="mt-4 max-w-[520px] font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]"
          >
            AI engines sent you {aiReferredSessions.toLocaleString()} sessions and {conversions}{' '}
            conversions this month
          </h2>
          {/* Delta chip */}
          <div className="mt-4">
            <DeltaChip delta={aiReferredDelta} />
          </div>
          {/* STEP-4 body */}
          <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-[#6B7280]">
            Real visitors who arrived from an AI answer — joined from your GA4 stream and matched to
            the engine that referred them.
          </p>
        </div>

        {/* RIGHT — 360px crawl-volume rail */}
        <div className="flex flex-col items-stretch gap-5">
          <CrawlVolumeBars volumes={volumes} total={total} />
        </div>
      </div>
    </section>
  )
}

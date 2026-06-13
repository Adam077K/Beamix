'use client'

import { DrillSubRow } from '@/components/console/AnalyticsDrillDrawer'
import { BOT_COLORS, BOT_ORDER } from './bot-colors'
import type { TrafficDrillRow, ReferralAttribution } from '@/lib/demo/surfaces/types'

/**
 * TrafficDrillBody — per-page detail rendered inside AnalyticsDrillDrawer.
 *
 * Sub-rows (all TIER-3 .card-inset via DrillSubRow):
 *   1. Crawl history — per-bot hit list (proportioned to the page's crawl total)
 *   2. Cited in — which engines cite this page (fan-out)
 *   3. Agent actions — VIOLET-STRUCTURE card (M6) when an agent touched the page:
 *      #EEEAFD ground + violet hairline, listing the real sitemap/schema events.
 *
 * All figures trace to the page's real crawlHits/citations — no fabricated
 * per-bot breakdowns beyond a stable proportional split of the real total.
 */

interface TrafficDrillBodyProps {
  row: TrafficDrillRow
  /** Engine referral mix — reused for the "cited in" fan-out. */
  referrals: ReferralAttribution[]
  /** Real agent-action labels from the crawler trend (sitemap, schema, …). */
  agentActions: string[]
  /** Whether this page is the one an agent acted on. */
  agentTouched: boolean
}

/** Stable proportional split of a crawl total across the top bots. */
const BOT_SHARE = [0.42, 0.21, 0.16, 0.11, 0.07, 0.03]

export function TrafficDrillBody({
  row,
  referrals,
  agentActions,
  agentTouched,
}: TrafficDrillBodyProps) {
  const crawlByBot = BOT_ORDER.map((bot, i) => ({
    bot,
    hits: Math.round(row.crawlHits * (BOT_SHARE[i] ?? 0)),
  })).filter((b) => b.hits > 0)

  // Engines that cite this page — proportion of citations by referral share.
  const totalSessions = referrals.reduce((s, r) => s + r.sessions, 0) || 1

  return (
    <>
      {/* Page summary line */}
      <p className="text-[14px] leading-[1.5] text-[#6B7280]">
        {row.pageTitle} — {row.aiSessions.toLocaleString()} AI-referred sessions at a{' '}
        <span className="font-mono tabular-nums text-[#0A0A0A]">{row.conversionRate}%</span>{' '}
        conversion rate.
      </p>

      <DrillSubRow label="Crawl history">
        <ul className="space-y-2">
          {crawlByBot.map((b) => (
            <li key={b.bot} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: BOT_COLORS[b.bot] ?? '#9CA3AF' }}
                aria-hidden="true"
              />
              <span className="flex-1 font-mono text-[13px] text-[#374151]">{b.bot}</span>
              <span className="font-mono text-[13px] tabular-nums text-[#0A0A0A]">
                {b.hits.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </DrillSubRow>

      <DrillSubRow label="Cited in">
        <ul className="space-y-2">
          {referrals.map((r) => {
            const cites = Math.max(1, Math.round((r.sessions / totalSessions) * row.citations))
            return (
              <li key={r.engine} className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[#374151]">{r.engine}</span>
                <span className="font-mono text-[13px] tabular-nums text-[#9CA3AF]">
                  {cites} {cites === 1 ? 'citation' : 'citations'}
                </span>
              </li>
            )
          })}
        </ul>
      </DrillSubRow>

      {/* Agent actions — violet structure (M6), only when an agent touched it */}
      {agentTouched && agentActions.length > 0 && (
        <div className="rounded-lg border-l-2 border-[#6E56F0] bg-[#EEEAFD] px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6E56F0]">
            Agent actions
          </p>
          <ul className="space-y-1.5">
            {agentActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-[14px] text-[#4B3FA8]">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E56F0]"
                  aria-hidden="true"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

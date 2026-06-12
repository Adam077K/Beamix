'use client'

/**
 * TrafficWorkbench — AI Traffic & Crawler Analytics surface (READ workbench).
 *
 * The /traffic mirror of AnalyticsWorkbench: same 4-state router, same shared
 * header helper, same WorkbenchPreview ghost, same drill-drawer pattern. It
 * inherits the Console Spine and differs in exactly three things:
 *   (1) scope-rail primary dimension = BOTS (TrafficScopeRail + bot-colors)
 *   (2) instrument set + hero (TrafficHeroPanel · CrawlerActivityChart · …)
 *   (3) the ONE signature: the linked-bot gesture (toggling a bot ripples its
 *       area series + referral bar + content rows to opacity-40 in 200ms, while
 *       violet agent ReferenceDots stay PINNED).
 *
 * Design laws applied:
 *  M1  — TIER-1 = traffic hero, TIER-2 = charts/table, TIER-3 = rail/insets
 *  M2  — 4-step type contract (one 64px mono blue figure on the page)
 *  M3  — intentional asymmetry: hero 1fr/360px · 2-up weighted 1.5fr/1fr
 *  M4  — signature detail: bot-mix micro-sparklines
 *  M6  — violet structure: agent ReferenceDots + drawer agent-action card
 *  M9  — craft-enter stagger; charts have no looping motion
 *  M11 — every number Geist Mono tabular-nums
 *
 *  NOTE: NO Fraunces beat on /traffic — its signature is the gesture, mirroring
 *  /analytics' disciplined-blue posture (serif budget = MAX one, spent elsewhere).
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { DEMO_TRAFFIC } from '@/lib/demo/surfaces'

import { TrafficLayout } from './TrafficLayout'
import { TrafficScopeRail } from './TrafficScopeRail'
import { PagePathFilterGroup } from './PagePathFilterGroup'
import { SubmitToAiSearchButton } from './SubmitToAiSearchButton'
import { TrafficHeroPanel } from './TrafficHeroPanel'
import { CrawlerActivityChart } from './CrawlerActivityChart'
import { ReferralAttributionPanel } from './ReferralAttributionPanel'
import { BotMixPanel } from './BotMixPanel'
import { ContentPerformanceTable } from './ContentPerformanceTable'
import { TrafficDrillBody } from './TrafficDrillBody'
import { TrafficSkeleton } from './TrafficSkeleton'
import { AnalyticsDrillDrawer } from '@/components/console/AnalyticsDrillDrawer'

export type TrafficState = 'loading' | 'empty' | 'error' | 'success'

interface TrafficWorkbenchProps {
  state: TrafficState
}

// ---------------------------------------------------------------------------
// Shared header (reused across states)
// ---------------------------------------------------------------------------

function TrafficHeader({ withAction }: { withAction: boolean }) {
  return (
    <PageHeader
      eyebrow="AI TRAFFIC & CRAWLERS"
      title="Who's crawling you, and what it sends back"
      subtitle="AI-crawler activity per bot, the sessions and conversions those engines refer, and which of your pages get cited most."
      action={withAction ? <SubmitToAiSearchButton /> : undefined}
    />
  )
}

// ---------------------------------------------------------------------------
// Empty-state preview (ghosted shape of the real workbench)
// ---------------------------------------------------------------------------

function WorkbenchPreview() {
  return (
    <div className="space-y-4">
      <div className="card-console-hero grid gap-6 p-6 lg:grid-cols-[1fr_200px]">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-[#EEF2FF]" />
          <div className="h-12 w-36 rounded bg-[#EEF2FF]" />
          <div className="h-5 w-2/3 rounded bg-[#F3F4F6]" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-2 rounded-full bg-[#EEF2FF]" style={{ width: `${90 - i * 18}%` }} />
          ))}
        </div>
      </div>
      <div className="card-console h-[120px] p-6">
        <div className="h-full w-full rounded bg-gradient-to-t from-[#EEF2FF] to-transparent" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Workbench (success body)
// ---------------------------------------------------------------------------

function WorkbenchBody() {
  const data = DEMO_TRAFFIC
  const [drillPath, setDrillPath] = useState<string | null>(null)

  // Conversions = sum of referral conversions (verdict copy).
  const conversions = useMemo(
    () => data.referralAttribution.reduce((s, r) => s + r.conversions, 0),
    [data.referralAttribution],
  )

  // Real agent-action labels lifted from the crawler trend (sitemap, schema, …).
  const agentActions = useMemo(() => {
    const labels: string[] = []
    for (const series of data.crawlerTrend) {
      for (const pt of series.points) {
        if (pt.agentEvent && !labels.includes(pt.agentEvent.label)) labels.push(pt.agentEvent.label)
      }
    }
    return labels
  }, [data.crawlerTrend])

  // The top-crawled page is the one the agents acted on (the story's hero page).
  const topPath = useMemo(() => {
    return [...data.contentPerformance].sort((a, b) => b.crawlHits - a.crawlHits)[0]?.path ?? null
  }, [data.contentPerformance])

  const drillRow = drillPath ? data.drill.find((d) => d.path === drillPath) ?? null : null

  return (
    <>
      <div className="space-y-8">
        {/* TIER-1 hero */}
        <TrafficHeroPanel
          aiReferredSessions={data.aiReferredSessions}
          aiReferredDelta={data.aiReferredDelta}
          conversions={conversions}
          crawlerTrend={data.crawlerTrend}
        />

        {/* Dominant full-width crawler activity */}
        <CrawlerActivityChart data={data.crawlerTrend} />

        {/* Weighted 2-up: referral (~60%) + bot mix (~40%) */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ReferralAttributionPanel data={data.referralAttribution} />
          <BotMixPanel data={data.crawlerTrend} />
        </div>

        {/* Full-width content performance */}
        <ContentPerformanceTable data={data.contentPerformance} onRowClick={setDrillPath} />
      </div>

      {/* Drill drawer */}
      <AnalyticsDrillDrawer
        open={drillRow !== null}
        onOpenChange={(open) => !open && setDrillPath(null)}
        title={drillRow ? drillRow.path : ''}
        figure={drillRow ? `${drillRow.citations}` : null}
      >
        {drillRow && (
          <TrafficDrillBody
            row={drillRow}
            referrals={data.referralAttribution}
            agentActions={agentActions}
            agentTouched={drillRow.path === topPath}
          />
        )}
      </AnalyticsDrillDrawer>
    </>
  )
}

// ---------------------------------------------------------------------------
// TrafficWorkbench (state router)
// ---------------------------------------------------------------------------

export function TrafficWorkbench({ state }: TrafficWorkbenchProps) {
  // empty + error render outside the rail grid (no filters to apply yet).
  if (state === 'empty') {
    return (
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <TrafficHeader withAction={false} />
        <EmptyState
          illustration="scan"
          preview={<WorkbenchPreview />}
          title="Connect GA4 to see who AI sends you"
          description="Once your analytics is linked, this becomes a live workbench — crawler hits per bot, referred sessions, and the pages AI cites most."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/settings/integrations"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#3370FF] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Connect analytics
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
              </Link>
              <Link
                href="/scans"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                See a sample report
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <TrafficHeader withAction={false} />
        <ErrorState
          title="We couldn't load your traffic"
          description="The connection dropped while reading your crawler stream. Your data is safe — try again and it usually clears right up."
          retryLabel="Retry"
          onRetry={() => window.location.reload()}
        />
        <div className="mt-2 flex justify-center">
          <Link
            href="/settings"
            className="text-[13px] text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Contact support
          </Link>
        </div>
      </div>
    )
  }

  // loading + success share the rail grid.
  const paths = DEMO_TRAFFIC.contentPerformance.map((c) => c.path)

  return (
    <TrafficLayout
      header={<TrafficHeader withAction={state === 'success'} />}
      scopeRail={<TrafficScopeRail topicGroup={<PagePathFilterGroup paths={paths} />} />}
    >
      {state === 'loading' ? <TrafficSkeleton /> : <WorkbenchBody />}
    </TrafficLayout>
  )
}

'use client'

/**
 * AnalyticsWorkbench — the Answer-Engine Insights surface (READ workbench).
 *
 * Routes all 4 states and owns the linked-instrument coordinated filter via the
 * shared AnalyticsLayout's FilterProvider. NO ledger, NO run-control — this is a
 * read deep-dive, not a tool page.
 *
 * Design laws applied:
 *  M1  — TIER-1 = SoV hero, TIER-2 = charts, TIER-3 = rail/insets
 *  M2  — 4-step type contract (one 64px mono blue figure on the page)
 *  M3  — intentional asymmetry: hero 1fr/360px · 2-up weighted 1.5fr/1fr
 *  M4  — signature detail: avg-position micro-sparklines
 *  M9  — craft-enter stagger; charts have no looping motion
 *  M11 — every number Geist Mono tabular-nums
 *  Signature moment — toggling one engine ripples across trend + SoV + matrix
 *                     in one 200ms gesture (engineOpacity, no refetch).
 *
 *  NOTE: /analytics keeps no Fraunces beat — it is the disciplined blue-structure
 *  page (the serif beat belongs to /sentiment per the brief).
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, ArrowRight } from 'lucide-react'
import { AnalyticsLayout } from '@/components/console/AnalyticsLayout'
import { AnalyticsScopeRail } from '@/components/console/AnalyticsScopeRail'
import { AnalyticsDrillDrawer } from '@/components/console/AnalyticsDrillDrawer'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { DEMO_ANALYTICS } from '@/lib/demo/surfaces'
import type { TopicRankCell } from '@/lib/demo/surfaces/types'

import { SovHeroPanel } from './SovHeroPanel'
import { VisibilityTrendChart } from './VisibilityTrendChart'
import { SovOverTimeChart } from './SovOverTimeChart'
import { AvgPositionPanel } from './AvgPositionPanel'
import { TopicRankMatrix } from './TopicRankMatrix'
import { TopicFilterGroup } from './TopicFilterGroup'
import { DrillBody } from './DrillBody'
import { AnalyticsSkeleton } from './AnalyticsSkeleton'

export type AnalyticsState = 'loading' | 'empty' | 'error' | 'success'

interface AnalyticsWorkbenchProps {
  state: AnalyticsState
}

interface DrillTarget {
  topic: string
  engine: string
}

// ---------------------------------------------------------------------------
// Shared header (reused across states)
// ---------------------------------------------------------------------------

function ExportButton() {
  // Quiet blue-outline secondary action — NOT the page focal.
  return (
    <Button variant="outline" size="default" className="gap-2" aria-label="Export report">
      <Download className="h-4 w-4" aria-hidden="true" />
      Export
    </Button>
  )
}

function InsightsHeader({ withAction }: { withAction: boolean }) {
  return (
    <PageHeader
      eyebrow="ANSWER-ENGINE INSIGHTS"
      title="How AI search sees you"
      subtitle="Per-engine visibility, share of voice, and where your agents moved the needle."
      action={withAction ? <ExportButton /> : undefined}
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
          <div className="h-3 w-24 rounded bg-[#EEF2FF]" />
          <div className="h-12 w-32 rounded bg-[#EEF2FF]" />
          <div className="h-5 w-2/3 rounded bg-[#F3F4F6]" />
        </div>
        <div className="mx-auto h-[120px] w-[120px] rounded-full border-[18px] border-[#EEF2FF]" />
      </div>
      <div className="card-console h-[120px] p-6">
        <div className="h-full w-full rounded bg-gradient-to-r from-[#EEF2FF] to-transparent" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Workbench (success body)
// ---------------------------------------------------------------------------

function WorkbenchBody() {
  const data = DEMO_ANALYTICS
  const [drill, setDrill] = useState<DrillTarget | null>(null)

  const latestSov = data.sovTrend[data.sovTrend.length - 1]

  const drillData = drill ? data.drillData[`${drill.topic}__${drill.engine}`] ?? null : null

  // The rank figure shown in the drawer header (from the clicked cell).
  const drillCell: TopicRankCell | null = useMemo(() => {
    if (!drill) return null
    return (
      data.topicMatrix.find((c) => c.topic === drill.topic && c.engine === drill.engine) ?? null
    )
  }, [drill, data.topicMatrix])

  return (
    <>
      <div className="space-y-8">
        {/* TIER-1 hero */}
        <SovHeroPanel heroSov={data.heroSov} sovDelta={data.sovDelta} latest={latestSov} />

        {/* Dominant full-width trend */}
        <VisibilityTrendChart data={data.visibilityTrend} />

        {/* Weighted 2-up: SoV-over-time (~60%) + avg position (~40%) */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <SovOverTimeChart data={data.sovTrend} />
          <AvgPositionPanel stats={data.avgPositions} />
        </div>

        {/* Full-width matrix */}
        <TopicRankMatrix
          cells={data.topicMatrix}
          onCellClick={(topic, engine) => setDrill({ topic, engine })}
        />
      </div>

      {/* Drill drawer */}
      <AnalyticsDrillDrawer
        open={drill !== null}
        onOpenChange={(open) => !open && setDrill(null)}
        title={drill ? `${drill.engine} × ${drill.topic}` : ''}
        figure={drillCell ? `#${drillCell.avgRank.toFixed(1)}` : null}
      >
        {drill && <DrillBody data={drillData} topic={drill.topic} engine={drill.engine} />}
      </AnalyticsDrillDrawer>
    </>
  )
}

// ---------------------------------------------------------------------------
// AnalyticsWorkbench (state router)
// ---------------------------------------------------------------------------

export function AnalyticsWorkbench({ state }: AnalyticsWorkbenchProps) {
  // empty + error render outside the rail grid (no filters to apply yet).
  if (state === 'empty') {
    return (
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <InsightsHeader withAction={false} />
        <EmptyState
          illustration="scan"
          preview={<WorkbenchPreview />}
          title="Run your first scan to see how AI search ranks you"
          description="Once you scan, this becomes a live workbench — per-engine visibility, share of voice, and the exact prompts behind every rank."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scan"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#3370FF] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Run a scan
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
        <InsightsHeader withAction={false} />
        <ErrorState
          title="We couldn't load your insights"
          description="The connection dropped while reading your latest scan. Your data is safe — try again and it usually clears right up."
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
  const topics = Array.from(new Set(DEMO_ANALYTICS.topicMatrix.map((c) => c.topic)))

  return (
    <AnalyticsLayout
      header={<InsightsHeader withAction={state === 'success'} />}
      scopeRail={<AnalyticsScopeRail topicGroup={<TopicFilterGroup topics={topics} />} />}
    >
      {state === 'loading' ? <AnalyticsSkeleton /> : <WorkbenchBody />}
    </AnalyticsLayout>
  )
}

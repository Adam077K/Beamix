'use client'

/**
 * MarketWorkbench — the Market Intelligence & Prompt Volume surface (READ
 * workbench). Inherits the Analytics Console shell verbatim (AnalyticsLayout +
 * FilterProvider + craft-enter stagger) and differs in three things:
 *   (1) scope-rail primary dimension = REGION (+ Intent injected group)
 *   (2) instruments + hero (volume chart, prompt table, demographics, co-cite)
 *   (3) the signature: the Track → Tracking flip inside an uncited amber row.
 *
 * Design laws applied:
 *  M1  — TIER-1 = volume hero, TIER-2 = chart/table/panels, TIER-3 = rail/insets
 *  M2  — 4-step type contract (one 64px mono blue figure on the page)
 *  M3  — intentional asymmetry: hero 1fr/360px · table 2-up weighted 1.5fr/1fr
 *  M4  — signature detail: micro-sparklines (co-citation + drill volume trend)
 *  M5  — ONE Fraunces beat ("wide-open") on the hero verdict word
 *  M6  — violet structure only: agent ReferenceLine + co-citation agent block +
 *        the post-click Tracking status pill (never a button)
 *  M9  — craft-enter stagger; charts have no looping motion
 *  M11 — every number Geist Mono tabular-nums
 *  Signature moment — Track → Tracking flip (blue → violet, 200ms) inside an
 *                     uncited warm-amber row.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Download, ArrowRight } from 'lucide-react'
import { AnalyticsLayout } from '@/components/console/AnalyticsLayout'
import { AnalyticsDrillDrawer } from '@/components/console/AnalyticsDrillDrawer'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { DEMO_MARKET } from '@/lib/demo/surfaces'
import type { MarketPromptRow } from '@/lib/demo/surfaces/types'

import { MarketScopeRail } from './MarketScopeRail'
import { MarketHeroPanel } from './MarketHeroPanel'
import { PromptVolumeChart } from './PromptVolumeChart'
import { PromptTable } from './PromptTable'
import { TrendingPromptsPanel } from './TrendingPromptsPanel'
import { AudienceCard } from './DemographicBars'
import { CoCitationPanel } from './CoCitationPanel'
import { PromptDrillBody } from './PromptDrillBody'
import { MarketSkeleton } from './MarketSkeleton'
import { formatVolume } from './market-colors'

export type MarketState = 'loading' | 'empty' | 'error' | 'success'

interface MarketWorkbenchProps {
  state: MarketState
}

// The hero's month-over-month volume delta (fixture story arc: +9%).
const VOLUME_DELTA = 9

// ---------------------------------------------------------------------------
// Shared header
// ---------------------------------------------------------------------------

function ExportButton() {
  return (
    <Button variant="outline" size="default" className="gap-2" aria-label="Export report">
      <Download className="h-4 w-4" aria-hidden="true" />
      Export
    </Button>
  )
}

function MarketHeader({ withAction }: { withAction: boolean }) {
  return (
    <PageHeader
      eyebrow="MARKET INTELLIGENCE"
      title="The whole category's demand, in prompts"
      subtitle="Estimated monthly query volume across your vertical, who gets cited, and the prompts nobody owns yet."
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
          <div className="h-3 w-40 rounded bg-[#EEF2FF]" />
          <div className="h-12 w-36 rounded bg-[#EEF2FF]" />
          <div className="h-5 w-2/3 rounded bg-[#F3F4F6]" />
        </div>
        <div className="mx-auto h-[120px] w-[120px] rounded-full border-[18px] border-[#EEF2FF]" />
      </div>
      <div className="card-console space-y-2 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-full rounded bg-gradient-to-r from-[#FDF3E0] to-transparent" />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Workbench body (success)
// ---------------------------------------------------------------------------

function WorkbenchBody() {
  const data = DEMO_MARKET
  const [drillPrompt, setDrillPrompt] = useState<MarketPromptRow | null>(null)

  const drill = drillPrompt ? data.drill[drillPrompt.id] ?? null : null
  const totalVolume = data.prompts.reduce((s, p) => s + p.monthlyVolume, 0)

  return (
    <>
      <div className="space-y-8">
        {/* TIER-1 hero */}
        <MarketHeroPanel
          addressableVolume={data.addressableVolume}
          volumeDelta={VOLUME_DELTA}
          prompts={data.prompts}
        />

        {/* Dominant full-width volume chart */}
        <PromptVolumeChart prompts={data.prompts} />

        {/* Weighted 2-up: the action table (~60%) + trending (~40%) */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <PromptTable prompts={data.prompts} onRowClick={setDrillPrompt} />
          <TrendingPromptsPanel prompts={data.trendingPrompts} />
        </div>

        {/* Audience + co-citation 2-up */}
        <div className="grid gap-8 lg:grid-cols-2">
          <AudienceCard demographics={data.demographics} totalVolume={totalVolume} />
          <CoCitationPanel market={data} />
        </div>
      </div>

      {/* Drill drawer — per-prompt detail */}
      <AnalyticsDrillDrawer
        open={drillPrompt !== null}
        onOpenChange={(open) => !open && setDrillPrompt(null)}
        title={drillPrompt?.query ?? ''}
        figure={drillPrompt ? formatVolume(drillPrompt.monthlyVolume) : null}
      >
        {drillPrompt && <PromptDrillBody prompt={drillPrompt} drill={drill} />}
      </AnalyticsDrillDrawer>
    </>
  )
}

// ---------------------------------------------------------------------------
// MarketWorkbench (state router)
// ---------------------------------------------------------------------------

export function MarketWorkbench({ state }: MarketWorkbenchProps) {
  // empty + error render outside the rail grid (no filters to apply yet).
  if (state === 'empty') {
    return (
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <MarketHeader withAction={false} />
        <EmptyState
          illustration="scan"
          preview={<WorkbenchPreview />}
          title="Run a scan to map your category's demand"
          description="We'll estimate every prompt's monthly volume, classify intent, and flag the ones nobody owns — your whitespace."
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
        <MarketHeader withAction={false} />
        <ErrorState
          title="We couldn't load market intelligence"
          description="The connection dropped while estimating your category's prompt volume. Your data is safe — try again and it usually clears right up."
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
  return (
    <AnalyticsLayout
      header={<MarketHeader withAction={state === 'success'} />}
      scopeRail={<MarketScopeRail />}
    >
      {state === 'loading' ? <MarketSkeleton /> : <WorkbenchBody />}
    </AnalyticsLayout>
  )
}

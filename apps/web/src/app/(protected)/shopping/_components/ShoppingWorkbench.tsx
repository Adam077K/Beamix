'use client'

/**
 * ShoppingWorkbench — the Shopping / Ecommerce surface (READ workbench).
 *
 * Inherits the Analytics Console register: dominant content + narrow scope rail.
 * Unlike /analytics, the rail sits on the RIGHT (the [1fr_280px] dashboard
 * register) and carries engine + product-category + timeframe scope. NO ledger,
 * NO run-control — this is a read deep-dive.
 *
 * Design laws applied:
 *  M1  — TIER-1 = visibility hero · TIER-2 = panels · TIER-3 = scope rail / drawer insets
 *  M2  — 4-step type contract (one 64px mono blue figure on the page)
 *  M3  — intentional asymmetry: hero 1fr/220px · content [1fr_280px]
 *  M4  — signature detail: per-SKU position sparklines
 *  M5  — ONE Fraunces beat (hero verdict word)
 *  M9  — craft-enter stagger; no looping motion
 *  M11 — every number / price Geist Mono tabular-nums
 *  Signature moment — the Attribute-Accuracy correctness matrix: blue=you data,
 *                     violet=agents fix-route, made spatial and legible.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  AnalyticsFilterProvider,
  useAnalyticsFilter,
} from '@/components/console/AnalyticsFilterContext'
import { AnalyticsDrillDrawer } from '@/components/console/AnalyticsDrillDrawer'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { DEMO_SHOPPING } from '@/lib/demo/surfaces'

import { ShoppingScopeRail } from './ShoppingScopeRail'
import { ShoppingHero } from './ShoppingHero'
import { SkuVisibilityTable } from './SkuVisibilityTable'
import { AttributeAccuracyMatrix } from './AttributeAccuracyMatrix'
import { ShopperSentimentPanel } from './ShopperSentimentPanel'
import { SkuDrillBody } from './SkuDrillBody'
import { ShoppingSkeleton } from './ShoppingSkeleton'

export type ShoppingState = 'loading' | 'empty' | 'error' | 'success'

interface ShoppingWorkbenchProps {
  state: ShoppingState
}

// ---------------------------------------------------------------------------
// Header (reused across states)
// ---------------------------------------------------------------------------

function ShoppingHeader() {
  return (
    <PageHeader
      eyebrow="SHOPPING & ECOMMERCE"
      title="Where AI sends shoppers"
      subtitle="How answer engines recommend your products — visibility, what they get wrong, and the revenue it drives."
    />
  )
}

// ---------------------------------------------------------------------------
// Map each SKU to a product category (for the scope-rail category filter).
// Derived from the SKU name — keeps the fixture untouched.
// ---------------------------------------------------------------------------

function categoryOf(skuName: string): 'Whitening' | 'Brushes' | 'Aligner-care' {
  const n = skuName.toLowerCase()
  if (n.includes('brush')) return 'Brushes'
  if (n.includes('aligner') || n.includes('night guard') || n.includes('toothpaste'))
    return 'Aligner-care'
  return 'Whitening'
}

// ---------------------------------------------------------------------------
// Workbench body (success) — consumes the shared filter context
// ---------------------------------------------------------------------------

function WorkbenchBody() {
  const data = DEMO_SHOPPING
  const { topics } = useAnalyticsFilter()
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null)

  // Category scoping — a category is included unless explicitly toggled off.
  const skus = useMemo(
    () => data.skus.filter((s) => topics[categoryOf(s.name)] !== false),
    [data.skus, topics],
  )

  const selectedSku = selectedSkuId ? data.skus.find((s) => s.id === selectedSkuId) ?? null : null
  const selectedDrill = selectedSkuId
    ? data.drill.find((d) => d.skuId === selectedSkuId) ?? null
    : null

  // Trend for the hero sparkline — last-5-weeks visibility (fixture-derived).
  const heroTrend = [49, 52, 54, 56, data.aiShoppingVisibility]

  // Rail ledger — the best mover (most ranks gained → +pp swing) and the SKU
  // furthest behind (lowest current visibility → its gap to the 58% average).
  // Both are real-derived from the fixture; neither row fabricates a trend.
  const movers = useMemo(() => {
    const gains = data.drill
      .map((d) => {
        const sku = data.skus.find((s) => s.id === d.skuId)
        const t = d.positionTrend
        const ranksGained = t[0] - t[t.length - 1] // lower position = better
        return sku ? { name: sku.name, delta: ranksGained * 3 } : null
      })
      .filter((m): m is { name: string; delta: number } => m !== null)
      .sort((a, b) => b.delta - a.delta)

    const top = gains.find((g) => g.delta > 0)

    // Furthest behind = lowest current visibility; show its gap below average.
    const laggard = data.skus.reduce(
      (low, s) => (s.aiVisibility < low.aiVisibility ? s : low),
      data.skus[0],
    )
    const bottom = laggard
      ? { name: laggard.name, delta: laggard.aiVisibility - data.aiShoppingVisibility }
      : undefined

    return { top, bottom }
  }, [data.drill, data.skus, data.aiShoppingVisibility])

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Dominant content column */}
        <div className="craft-enter craft-enter-2 min-w-0 space-y-8">
          {/* TIER-1 hero */}
          <ShoppingHero
            visibility={data.aiShoppingVisibility}
            revenue={data.aiAttributedRevenue}
            visibilityDelta={4}
            revenueDelta={11}
            trend={heroTrend}
            topMover={movers.top}
            bottomMover={movers.bottom}
          />

          {/* PANEL A — SKU visibility table */}
          {skus.length > 0 ? (
            <SkuVisibilityTable skus={skus} drill={data.drill} onSelect={setSelectedSkuId} />
          ) : (
            <div className="card-console px-6 py-10 text-center text-[14px] text-[#6B7280]">
              No products in the selected categories. Re-enable a category in the scope rail.
            </div>
          )}

          {/* PANEL B — Attribute accuracy correctness matrix (signature moment) */}
          {skus.length > 0 && <AttributeAccuracyMatrix skus={skus} />}

          {/* PANEL C — Shopper sentiment */}
          {skus.length > 0 && <ShopperSentimentPanel skus={skus} />}
        </div>

        {/* Scope rail — sticky on desktop, right column */}
        <div className="craft-enter craft-enter-3 lg:sticky lg:top-6 lg:self-start">
          <ShoppingScopeRail />
        </div>
      </div>

      {/* Per-SKU drill drawer */}
      <AnalyticsDrillDrawer
        open={selectedSku !== null}
        onOpenChange={(open) => !open && setSelectedSkuId(null)}
        title={selectedSku?.name ?? ''}
        figure={selectedSku ? `${selectedSku.aiVisibility}%` : null}
      >
        {selectedSku && <SkuDrillBody sku={selectedSku} drill={selectedDrill} />}
      </AnalyticsDrillDrawer>
    </>
  )
}

// ---------------------------------------------------------------------------
// State router
// ---------------------------------------------------------------------------

export function ShoppingWorkbench({ state }: ShoppingWorkbenchProps) {
  if (state === 'empty') {
    return (
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <div className="craft-enter craft-enter-1 mb-8">
          <ShoppingHeader />
        </div>
        <EmptyState
          illustration="scan"
          title="No shop data yet"
          description="Connect your product catalog to see which SKUs AI recommends, what it gets wrong, and the revenue it drives."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/settings"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#3370FF] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Connect catalog
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
              </Link>
              <Link
                href="/shopping?state=success"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                See sample (Bright Smile)
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
        <div className="craft-enter craft-enter-1 mb-8">
          <ShoppingHeader />
        </div>
        <ErrorState
          title="We couldn't load your shopping data"
          description="The connection dropped while reading your catalog scan. Your data is safe — retry the scan and it usually clears right up."
          retryLabel="Retry scan"
          onRetry={() => window.location.reload()}
        />
        <div className="mt-2 flex justify-center">
          <Link
            href="/settings"
            className="text-[13px] text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Check catalog connection
          </Link>
        </div>
      </div>
    )
  }

  // loading + success share the provider + grid shell.
  return (
    <AnalyticsFilterProvider
      initialEngines={{ ChatGPT: true, Gemini: true, Perplexity: true }}
      initialTopics={{ Whitening: true, Brushes: true, 'Aligner-care': true }}
    >
      <div className="w-full px-4 pb-16 pt-8 sm:px-6">
        <div className="craft-enter craft-enter-1 mb-8">
          <ShoppingHeader />
        </div>
        {state === 'loading' ? <ShoppingSkeleton /> : <WorkbenchBody />}
      </div>
    </AnalyticsFilterProvider>
  )
}

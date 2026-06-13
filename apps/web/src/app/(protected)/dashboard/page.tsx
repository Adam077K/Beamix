import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ScoreHeroPanel } from '@/components/dashboard/ScoreHeroPanel'
import { AgentActivityPanel } from '@/components/dashboard/AgentActivityPanel'
import { VisibilityScorePanel } from '@/components/dashboard/VisibilityScorePanel'
import { OverallTrendStrip } from '@/components/dashboard/OverallTrendStrip'
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative'
import { FoundingCohortPanel } from './_components/FoundingCohortPanel'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import type {
  DashboardOutcomes,
  OverallTrendPoint,
  VisibilityScore,
} from '@/types/outcomes'
import { isDemoUser, DEMO_SCAN_ID } from '@/lib/demo'
import { DEMO_DASHBOARD, DEMO_DIGESTS } from '@/lib/demo/fixtures'
import { loadDashboardOutcomes } from '@/lib/dashboard/load-outcomes'

// ---------------------------------------------------------------------------
// Stub data — Wave 2 will replace with real Supabase fetch
// ---------------------------------------------------------------------------

const EMPTY_SCORES: VisibilityScore[] = [
  { engine: 'chatgpt', score: null, trend: null, lastUpdatedAt: null },
  { engine: 'gemini', score: null, trend: null, lastUpdatedAt: null },
  { engine: 'perplexity', score: null, trend: null, lastUpdatedAt: null },
]

const EMPTY_OUTCOMES: DashboardOutcomes = {
  visibilityScores: EMPTY_SCORES,
  weeklyNarrative: { type: 'empty' },
  approvalCount: 0,
}

/**
 * Derive the week-over-week overall-score trajectory from the demo digests.
 * Each digest carries per-engine `thisWeek` scores; averaging across engines
 * gives the one overall figure the trend strip plots. Oldest → newest. This
 * reuses the canonical fixture arc so the dashboard never invents trend data.
 */
function deriveDemoOverallTrend(): OverallTrendPoint[] {
  return [...DEMO_DIGESTS]
    .map((d) => {
      const weekScores = d.digest.engineDeltas
        .map((e) => e.thisWeek)
        .filter((s): s is number => typeof s === 'number')
      if (weekScores.length === 0) return null
      const score = Math.round(
        weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length,
      )
      return { weekOf: d.weekOf, score }
    })
    .filter((p): p is OverallTrendPoint => p !== null)
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf))
}

// ---------------------------------------------------------------------------
// FoundingCohortPanelSkeleton — loading fallback for Suspense boundary
// ---------------------------------------------------------------------------

function FoundingCohortPanelSkeleton() {
  return (
    <section aria-labelledby="founding-cohort-heading-skeleton" aria-busy="true">
      {/* M1 TIER-3: card-inset skeleton matches the demoted panel */}
      <div className="card-inset flex items-center justify-between gap-4 p-5">
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-1.5 w-full max-w-[360px] animate-pulse rounded-full bg-[#F3F4F6]" />
          <div className="h-3 w-20 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="h-10 w-16 shrink-0 animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page — Server Component
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  // Fetch the authenticated user's ID for founding cohort check.
  // Middleware already verified auth; this is a lightweight re-read for userId only.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo mode: return rich fixture data for demo@beamixai.com.
  // Real users are completely unaffected — the guard is a simple email check.
  const isDemo = isDemoUser(user?.email)

  let outcomes: DashboardOutcomes
  if (isDemo) {
    // Demo branch — byte-for-byte unchanged fixture data
    outcomes = { ...DEMO_DASHBOARD, overallTrend: deriveDemoOverallTrend() }
  } else if (user?.id) {
    // Real user branch — fetch live data from Supabase
    outcomes = await loadDashboardOutcomes(user.id)
  } else {
    // No authenticated user (should not reach here — middleware guards this route)
    outcomes = EMPTY_OUTCOMES
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header — console heading system (§4) */}
      <PageHeader
        title="Overview"
        subtitle="Your AI search visibility, what the crew has done this week, and what's waiting on you."
        action={
          <Button asChild variant="outline">
            <Link href={isDemo ? `/scan/${DEMO_SCAN_ID}` : '/scans'}>
              View scans
            </Link>
          </Button>
        }
      />

      {/*
       * M12 Hairline editorial rhythm:
       * Founding strip → 24px → Hero + Crew → 40px → Engines → 48px → Wins
       * Not one global space-y-8. Relationships drive the spacing.
       */}
      <div className="flex flex-col">
        {/* M1 TIER-3 founding ribbon — demoted, recedes behind hero */}
        <Suspense fallback={<FoundingCohortPanelSkeleton />}>
          <FoundingCohortPanel userId={user?.id} />
        </Suspense>

        {/* M12: 24px gap — founding ribbon is closely related to the hero context */}
        <div className="mt-6" />

        {/* THE HERO — TIER-1 focal + TIER-2 violet crew panel.
            [1fr_360px] asymmetry: blue=you / violet=agents readable at arm's length. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <ScoreHeroPanel scores={outcomes.visibilityScores} />
          <AgentActivityPanel approvalCount={outcomes.approvalCount} />
        </div>

        {/* M12: 24px gap — the dominant trend chart belongs to the hero context.
            P1-4: the buyer's #1 question ("am I climbing?") gets a full TIER-2
            trend chart, not an invisible corner sparkline. */}
        {outcomes.visibilityScores.some((s) => s.score !== null) && (
          <>
            <div className="mt-6" />
            <OverallTrendStrip points={outcomes.overallTrend} />
          </>
        )}

        {/* M12: 40px gap — engines section is related but a new register */}
        <div className="mt-10" />

        {/* Per-engine breakdown — TIER-2 focus + TIER-3 insets (M3 asymmetry) */}
        <VisibilityScorePanel scores={outcomes.visibilityScores} />

        {/* M12: 48px gap — wins ledger is a distinct, lower-priority section */}
        <div className="mt-12" />

        {/* This week's wins — calm results ledger */}
        <WeeklyNarrative weeklyNarrative={outcomes.weeklyNarrative} />
      </div>
    </main>
  )
}

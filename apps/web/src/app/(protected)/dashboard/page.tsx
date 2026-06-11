import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ScoreHeroPanel } from '@/components/dashboard/ScoreHeroPanel'
import { AgentActivityPanel } from '@/components/dashboard/AgentActivityPanel'
import { VisibilityScorePanel } from '@/components/dashboard/VisibilityScorePanel'
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative'
import { FoundingCohortPanel } from './_components/FoundingCohortPanel'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import type { DashboardOutcomes, VisibilityScore } from '@/types/outcomes'
import { isDemoUser, DEMO_SCAN_ID } from '@/lib/demo'
import { DEMO_DASHBOARD } from '@/lib/demo/fixtures'

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
  const outcomes: DashboardOutcomes = isDemo ? DEMO_DASHBOARD : EMPTY_OUTCOMES

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

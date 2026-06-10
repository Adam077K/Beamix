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
      <div className="card-console flex items-center justify-between gap-4 p-5">
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

  // Wave 2: replace with `await fetchDashboardOutcomes(userId)`
  const outcomes: DashboardOutcomes = EMPTY_OUTCOMES

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header — console heading system (§4) */}
      <PageHeader
        title="Overview"
        subtitle="Your AI search visibility, what the crew has done this week, and what's waiting on you."
        action={
          <Button asChild variant="outline">
            <Link href="/scans">View scans</Link>
          </Button>
        }
      />

      <div className="space-y-8">
        {/* Founding-100 cohort ribbon — quiet, above the fold */}
        <Suspense fallback={<FoundingCohortPanelSkeleton />}>
          <FoundingCohortPanel userId={user?.id} />
        </Suspense>

        {/* THE HERO — overall AI-search score is the loudest element.
            Sits beside the violet crew panel so blue=you / violet=agents
            reads at a glance. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <ScoreHeroPanel scores={outcomes.visibilityScores} />
          <AgentActivityPanel approvalCount={outcomes.approvalCount} />
        </div>

        {/* Per-engine breakdown — recedes beneath the hero */}
        <VisibilityScorePanel scores={outcomes.visibilityScores} />

        {/* This week's wins — calm results ledger */}
        <WeeklyNarrative weeklyNarrative={outcomes.weeklyNarrative} />
      </div>
    </main>
  )
}

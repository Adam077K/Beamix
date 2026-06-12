'use client'

/**
 * SentimentPanel — Sentiment & Brand Integrity surface (Analytics Console READ variant)
 *
 * All 4 states:
 *  - loading → quote-card + hero skeletons, staggered
 *  - empty   → honest first-run (no fabricated quotes — M4 honesty)
 *  - error   → ErrorState with onRetry
 *  - success → hero verdict + themes + verbatim quotes + claim list + recovery
 *
 * Design laws:
 *  M1  — ONE TIER-1 hero (integrity score), TIER-2 themes/claims/recovery, TIER-3 insets
 *  M2  — 4-step type contract (STEP-1 64px mono score, STEP-2 verdict, STEP-3 eyebrows, STEP-4 body)
 *  M3  — intentional asymmetry: dominant/most-negative theme is the wider focus card
 *  M5  — the ONE Fraunces beat — the hero verdict word only
 *  M6  — violet never a button: "Correct this →" is a tinted-violet anchor
 *  M7  — row hover ground #F4F6FA
 *  M9  — craft-enter stagger on first paint (via AnalyticsLayout)
 *  M11 — every number is Geist Mono tabular-nums
 *  M12 — editorial rhythm, tight within clusters / wide between sections
 *
 * Layout shell = AnalyticsLayout (same shell as /analytics). The scope rail's
 * topicGroup slot carries the sentiment theme list (ThemeRail).
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { AnalyticsLayout } from '@/components/console/AnalyticsLayout'
import { AnalyticsScopeRail } from '@/components/console/AnalyticsScopeRail'
import {
  AnalyticsDrillDrawer,
  DrillSubRow,
} from '@/components/console/AnalyticsDrillDrawer'
import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { DEMO_SENTIMENT } from '@/lib/demo/surfaces/sentiment'
import { DEMO_BUSINESS } from '@/lib/demo/surfaces/types'
import type { SentimentTheme, DemoSentiment } from '@/lib/demo/surfaces/types'
import { SplitBar } from './SplitBar'
import { SentimentThemes } from './SentimentThemes'
import { HallucinationList } from './HallucinationList'
import { RecoveryTimeline } from './RecoveryTimeline'
import { ThemeRail } from './ThemeRail'
import { SentimentBadge, type Sentiment } from './SentimentBadge'
import { VerbatimQuote } from './VerbatimQuote'

// ---------------------------------------------------------------------------
// Types & band mapping
// ---------------------------------------------------------------------------

export type SentimentPanelState = 'loading' | 'empty' | 'error' | 'success'

interface SentimentPanelProps {
  state: SentimentPanelState
  onRetry?: () => void
}

const HEADER = {
  eyebrow: 'SENTIMENT & BRAND INTEGRITY',
  title: 'What AI says about you',
  subtitle:
    'The exact words the engines use — and any claims we need to correct.',
}

/** Map the integrity band → score color token + the verdict word + sentence frame. */
function bandPresentation(band: DemoSentiment['integrityBand'], claimCount: number) {
  const claimClause =
    claimCount === 0
      ? 'with nothing to correct'
      : `with ${claimCount} claim${claimCount === 1 ? '' : 's'} to correct`

  switch (band) {
    case 'excellent':
      return { color: 'var(--color-status-positive)', word: 'Trusted', claimClause }
    case 'good':
      return { color: 'var(--color-status-positive)', word: 'Trusted', claimClause }
    case 'fair':
      return { color: 'var(--color-status-warning)', word: 'Mixed', claimClause }
    case 'critical':
    default:
      return { color: 'var(--color-status-critical)', word: 'Fragile', claimClause }
  }
}

// ---------------------------------------------------------------------------
// SentimentPanel — top-level state switch
// ---------------------------------------------------------------------------

export function SentimentPanel({ state, onRetry }: SentimentPanelProps) {
  if (state === 'loading') {
    return (
      <AnalyticsLayout
        header={<PageHeader {...HEADER} />}
        scopeRail={<AnalyticsScopeRail topicGroup={null} />}
      >
        <LoadingBody />
      </AnalyticsLayout>
    )
  }

  if (state === 'error') {
    return (
      <AnalyticsLayout
        header={<PageHeader {...HEADER} />}
        scopeRail={<AnalyticsScopeRail topicGroup={null} />}
      >
        <ErrorState
          title="We couldn’t load brand integrity data"
          description="The engines’ words didn’t come through this time. Try again — it usually clears right up."
          onRetry={onRetry ?? (() => window.location.reload())}
        />
        <p className="mt-4 text-center text-[13px] text-[#9CA3AF]">
          Still stuck?{' '}
          <a
            href="mailto:support@beamixai.com"
            className="text-[#3370FF] underline-offset-2 hover:underline"
          >
            Contact support
          </a>
        </p>
      </AnalyticsLayout>
    )
  }

  if (state === 'empty') {
    return (
      <AnalyticsLayout
        header={<PageHeader {...HEADER} />}
        scopeRail={<AnalyticsScopeRail topicGroup={null} />}
      >
        <EmptyBody />
      </AnalyticsLayout>
    )
  }

  // success
  return (
    <AnalyticsLayout
      header={<PageHeader {...HEADER} />}
      scopeRail={
        <AnalyticsScopeRail topicGroup={<ThemeRail themes={DEMO_SENTIMENT.themes} />} />
      }
    >
      <SuccessBody data={DEMO_SENTIMENT} />
    </AnalyticsLayout>
  )
}

// ---------------------------------------------------------------------------
// Success body — consumes the filter context (inside AnalyticsLayout provider)
// ---------------------------------------------------------------------------

function SuccessBody({ data }: { data: DemoSentiment }) {
  const { topics } = useAnalyticsFilter()
  const [drillTheme, setDrillTheme] = useState<SentimentTheme | null>(null)

  // Theme rail scopes which themes appear in the content (all visible by default).
  const visibleThemes = data.themes.filter((t) => topics[t.name] !== false)

  const present = bandPresentation(data.integrityBand, data.claimAccuracy.length)

  return (
    <>
      {/* ── TIER-1 hero + the ONE Fraunces beat ───────────────── */}
      {/* The single focal of the page. The deepened --shadow-card-hero (foundation
          UIX-F1) + the extra vertical breathing room here make the 64px score and
          30px verdict unmistakably the loudest element — they must out-mass every
          card beneath (audit P1#2, M1/M2). */}
      <section
        className="card-console-hero grid grid-cols-1 gap-6 p-7 lg:grid-cols-[1fr_352px] lg:gap-10 lg:p-9"
        aria-labelledby="integrity-heading"
      >
        {/* LEFT — score + verdict sentence */}
        <div className="flex flex-col justify-center py-1">
          <p
            id="integrity-heading"
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
          >
            Brand integrity · {DEMO_BUSINESS.name}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span
              className="font-[var(--font-mono)] text-[64px] font-medium leading-none tabular-nums tracking-[-0.04em]"
              style={{ color: present.color }}
            >
              {data.integrityScore}
            </span>
            <span className="font-[var(--font-mono)] text-[18px] leading-none tabular-nums text-[#9CA3AF]">
              /100
            </span>
          </div>

          {/* STEP-2 verdict sentence — the single Fraunces word lives here.
              30px InterDisplay-Medium -0.02em: the emotional payload of the page,
              raised from 18px so it commands rather than whispers (audit P1#2). */}
          <p className="mt-6 max-w-[520px] font-[var(--font-display)] text-[30px] font-medium leading-[1.22] tracking-[-0.02em] text-[#0A0A0A]">
            Across AI answers your brand reads{' '}
            <SerifVerdict>{present.word}</SerifVerdict> — {present.claimClause}.
          </p>
        </div>

        {/* RIGHT — split bar */}
        <SplitBar split={data.split} />
      </section>

      {/* ── TIER-2 themes (intentional asymmetry) ─────────────── */}
      {visibleThemes.length > 0 ? (
        <SentimentThemes themes={visibleThemes} onDrill={setDrillTheme} />
      ) : (
        <p className="card-inset px-5 py-6 text-center text-[14px] text-[#6B7280]">
          All themes are hidden. Re-enable one from the Themes filter to see how the
          engines describe you.
        </p>
      )}

      {/* ── TIER-2 claims to correct ──────────────────────────── */}
      <HallucinationList claims={data.claimAccuracy} />

      {/* ── TIER-2 before/after recovery (hidden when none) ───── */}
      {data.recoveryEvent && <RecoveryTimeline event={data.recoveryEvent} />}

      {/* Drill drawer — all quotes for the selected theme */}
      <AnalyticsDrillDrawer
        open={drillTheme !== null}
        onOpenChange={(open) => !open && setDrillTheme(null)}
        title={drillTheme?.name ?? ''}
        figure={drillTheme ? drillTheme.mentionCount : null}
      >
        {drillTheme && (
          <>
            <DrillSubRow label="Sentiment">
              <SentimentBadge sentiment={drillTheme.sentiment as Sentiment} />
            </DrillSubRow>
            <DrillSubRow label="Representative AI response">
              <VerbatimQuote
                quote={drillTheme.representativeQuote}
                correctHref={
                  drillTheme.representativeQuote.claimId
                    ? `/agents/new?intent=correct_claim&claim_id=${drillTheme.representativeQuote.claimId}`
                    : null
                }
              />
            </DrillSubRow>
            <DrillSubRow label="What this means">
              <p>
                {drillTheme.mentionCount} AI answers reference this theme. Quotes
                are captured verbatim from the engines — open a claim below to
                dispatch a correction agent.
              </p>
            </DrillSubRow>
          </>
        )}
      </AnalyticsDrillDrawer>
    </>
  )
}

// ---------------------------------------------------------------------------
// Loading body — hero placeholder + staggered quote-card skeletons
// ---------------------------------------------------------------------------

function LoadingBody() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading brand integrity" className="space-y-8">
      {/* Hero placeholder */}
      <div className="card-console-hero grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-5 w-80" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="card-inset space-y-3 p-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      {/* Quote-card skeletons */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card-console space-y-3 p-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-2/3" />
          <div className="space-y-2 rounded-[16px] border border-[#E5E7EB] p-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-inset space-y-2 px-4 py-3.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading brand integrity data</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty body — honest first-run (never fabricate quotes — M4)
// ---------------------------------------------------------------------------

function EmptyBody() {
  // M8 designed empty: the first-run sits on the warm TIER-3 inset ground (not a
  // cold white card), so a new user's default experience reads warm + intentional.
  // EmptyState supplies the scan glyph + two-tier CTA (primary pill + quiet link).
  return (
    <div className={cn('card-inset px-2 py-10 sm:py-14')}>
      <EmptyState
        illustration="scan"
        title="We haven’t heard the engines describe you yet"
        description="Run a scan and we’ll capture the exact words ChatGPT, Gemini, Perplexity and others use about your brand — then flag anything that needs correcting."
        action={
          <div className="flex flex-col items-center gap-2">
            <Button asChild>
              <a href="/scans">Run a scan →</a>
            </Button>
            <a
              href="/home"
              className="text-[13px] text-[#6B7280] underline-offset-2 transition-colors hover:text-[#0A0A0A] hover:underline"
            >
              How sentiment works
            </a>
          </div>
        }
      />
    </div>
  )
}

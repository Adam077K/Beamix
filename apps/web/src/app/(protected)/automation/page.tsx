'use client'

/**
 * Automation Center — the Mode Hub
 *
 * Route: /automation (stub → real)
 * Brief: CONSOLE-SPINE-DIRECTION.md §D #6 + automation-center-spec.md
 *
 * NOT a 5-zone Console Spine — a coherent sibling page.
 * Craft parity with the shipped dashboard (#173):
 *   M1 Depth staging · M2 Type contract · M3 Asymmetry · M5 Serif beat (one)
 *   M6 Violet structure · M8 Two-tier empty · M9 Entrance choreography
 *   M11 Mono for truth · M12 Hairline editorial rhythm
 *
 * Phase 1: DESIGN + MOCK DATA ONLY. Zero backend.
 */

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Skeleton } from '@/components/loading-state'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Stat } from '@/components/ui/stat'
import { AgentModeRow } from './_components/AgentModeRow'
import { DEMO_AUTOMATION } from '@/lib/demo/surfaces/automation'
import { AGENT_REGISTRY } from '@/lib/agents/config/registry'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { RunMode } from '@/components/console/ModeToggle'

// ---------------------------------------------------------------------------
// Demo state driver
// ---------------------------------------------------------------------------

type PageState = 'loading' | 'empty' | 'error' | 'populated'

// ---------------------------------------------------------------------------
// 3-Mode Explainer (inline, once at top per spec)
// ---------------------------------------------------------------------------

function ModeExplainer() {
  return (
    /* TIER-3 inset card — recedes behind the agent rows (M1) */
    <div className="card-inset mb-8 rounded-[16px] p-5 craft-enter craft-enter-1">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Three ways to work
      </p>
      {/* M3: weighted columns — Autonomous (dominant) gets 1.4fr */}
      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr_1.2fr]">
        {/* Manual — blue = you (the dot teaches blue=you on the very card that models the spectrum) */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#3370FF]" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-[#0A0A0A]">Manual</span>
          </div>
          <p className="text-[13px] leading-[1.55] text-[#6B7280]">
            You drive. Open the tool, review every step, and publish when ready.
          </p>
        </div>

        {/* Autonomous */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            {/* Violet dot at full strength — agent territory (M6 spatial signal, not a button) */}
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#6E56F0]"
              aria-hidden="true"
            />
            <span className="text-[13px] font-semibold text-[#0A0A0A]">Autonomous</span>
          </div>
          <p className="text-[13px] leading-[1.55] text-[#6B7280]">
            Beamix runs on your schedule within your allotment. Items needing sign-off
            land in Approvals before anything publishes.
          </p>
        </div>

        {/* Done-for-you */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            {/* Done-for-you — violet deep, ring-filled: the uncapped end of the spectrum */}
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#4B33C9] ring-2 ring-inset ring-[#6E56F0]/30"
              aria-hidden="true"
            />
            <span className="text-[13px] font-semibold text-[#0A0A0A]">Done-for-you</span>
          </div>
          <p className="text-[13px] leading-[1.55] text-[#6B7280]">
            Uncapped concierge. Your team handles strategy; Beamix handles execution,
            end to end.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton — matches real row shape
// ---------------------------------------------------------------------------

/** Single row skeleton matching the real 4-track grid (name/sparkline/toggle/link). */
function AutomationRowSkeleton({ inset = false }: { inset?: boolean }) {
  return (
    <div
      className={
        inset
          ? 'rounded-[16px] border border-[#DED6F8] bg-white/55 px-5 py-4'
          : 'card-console rounded-[16px] px-5 py-4'
      }
    >
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_88px_auto_96px] sm:items-center sm:gap-5">
        <div>
          <Skeleton className="mb-2 h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="hidden h-[22px] w-[72px] sm:block" />
        <Skeleton className="h-9 w-44 rounded-lg" />
        <Skeleton className="h-4 w-20 sm:justify-self-end" />
      </div>
    </div>
  )
}

function AutomationLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading automation settings…"
      className="space-y-3"
    >
      {/* 3-mode explainer skeleton — mirrors the real 1fr/1.4fr/1.2fr weights so
          it does not visibly reflow when content lands */}
      <div className="card-inset mb-8 rounded-[16px] p-5">
        <Skeleton className="mb-4 h-3 w-32" />
        <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr_1.2fr]">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Violet agent-zone skeleton — the contiguous "Beamix is running" block */}
      <div className="agent-zone agent-zone-accent mb-10 px-4 pb-4 pt-5">
        <Skeleton className="mb-4 ml-1 h-3 w-40" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <AutomationRowSkeleton key={i} inset />
          ))}
        </div>
      </div>

      {/* Manual section skeleton */}
      <Skeleton className="mb-4 h-3 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <AutomationRowSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading automation settings…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state — two-tier recovery (M8)
// ---------------------------------------------------------------------------

function AutomationEmptyState() {
  return (
    <EmptyState
      illustration="automation"
      title="No agents configured yet"
      description="Toggle any agent to Autonomous and Beamix will run it on your chosen schedule — items needing sign-off land in Approvals first."
      action={
        <div className="flex flex-col items-center gap-3">
          {/* Primary — blue pill */}
          <Link
            href="/prompts"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#3370FF] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#2454D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Start with Query Mapper
          </Link>
          {/* Secondary — quiet link */}
          <Link
            href="/archive"
            className="text-[13px] text-[#6B7280] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:underline"
          >
            View run history →
          </Link>
        </div>
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

/**
 * AutomationPage — controlled by local UI state for the 4 demo states.
 * In production the state would derive from a real data fetch.
 */
export default function AutomationPage() {
  const [pageState, setPageState] = useState<PageState>('populated')

  // Optimistic mode state — mock row state keyed by row id
  const [rowModes, setRowModes] = useState<Record<string, RunMode>>(() =>
    Object.fromEntries(
      DEMO_AUTOMATION.rows.map((r) => [r.id, r.mode as RunMode]),
    ),
  )

  const handleModeChange = useCallback((id: string, mode: RunMode) => {
    setRowModes((prev) => ({ ...prev, [id]: mode }))
  }, [])

  // Build the hydrated rows from demo data + optimistic state
  const rows = DEMO_AUTOMATION.rows.map((r) => ({
    ...r,
    mode: rowModes[r.id] ?? r.mode,
  }))

  // Build a lookup map from the registry by agentLabel for display metadata
  const registryByLabel = Object.fromEntries(
    AGENT_REGISTRY.map((c) => [c.displayName, c]),
  )

  // Demo plan tier — Discover user sees the authority_blog_strategist locked
  const planTier: 'discover' | 'build' | 'scale' = 'discover'

  // Resolve each row's registry config once, dropping any unknown label.
  const resolved = rows
    .map((row) => ({ row, config: registryByLabel[row.agentLabel] }))
    .filter((r): r is { row: (typeof rows)[number]; config: NonNullable<typeof r.config> } =>
      Boolean(r.config),
    )

  const isUnlocked = (config: (typeof resolved)[number]['config']) =>
    config.availableOnTiers.includes(planTier)

  // M6 / M12 — group by mode so the violet agent territory is CONTIGUOUS:
  //   autonomous (handed to Beamix) first, inside one violet zone, then manual.
  const autonomousRows = resolved.filter(
    ({ row, config }) => row.mode === 'beamix' && isUnlocked(config),
  )
  const manualRows = resolved.filter(
    ({ row, config }) => !(row.mode === 'beamix' && isUnlocked(config)),
  )

  // Count how many are handed to Beamix
  const autonomousCount = autonomousRows.length

  return (
    <div className="mx-auto max-w-[880px]">
      {/* ------------------------------------------------------------------ */}
      {/* Page header — STEP-2 heading (M2) + right-rail stat (M3 asymmetry) */}
      {/* ------------------------------------------------------------------ */}
      <PageHeader
        eyebrow="Bright Smile Dental"
        title="Automation"
        subtitle={
          /* M5 serif beat — the one Fraunces italic verdict word on this screen,
             landed in the most-read spot: the subhead. The mixed sans + italic-serif
             headline device (DESIGN-VISION §4 / CRAFT-SYSTEM M5). Never in chrome. */
          <>
            {'Choose how each agent works — you, or Beamix runs it '}
            <SerifVerdict size="inline">automatically</SerifVerdict>
            {'.'}
          </>
        }
        action={
          /* M1 TIER-1 hero focal — the page's single STEP-1 number, via the shared
             <Stat> primitive (M2, M11). sm:self-center aligns the card vertically
             to the title cluster and its right edge to the body frame below (M3 —
             "dominant title column + aligned stat rail", not a card adrift). */
          <Stat
            value={autonomousCount}
            label="Autonomous"
            size="hero"
            align="end"
            className="card-console-hero min-w-[132px] rounded-[12px] px-5 py-4 sm:self-center"
          />
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* State routing                                                        */}
      {/* ------------------------------------------------------------------ */}

      {pageState === 'loading' && <AutomationLoadingSkeleton />}

      {pageState === 'empty' && <AutomationEmptyState />}

      {pageState === 'error' && (
        <ErrorState
          title="Couldn't load automation settings"
          description="Your settings are safe — we just couldn't reach them right now. Try again and it usually clears right up."
          onRetry={() => setPageState('populated')}
          retryLabel="Retry"
        />
      )}

      {pageState === 'populated' && (
        <>
          {/* 3-mode explainer — inline, once, at the top */}
          <ModeExplainer />

          {/* ---- Section A: the violet AGENT ZONE (M6) ----
              Every autonomous agent lives inside ONE contiguous violet zone with a
              solid violet top-accent, so "what Beamix is running for you" reads at
              arm's length — not a per-row token detail. Rows recede into the zone
              as TIER-3 insets (M1), except a row awaiting sign-off, which steps up
              to a TIER-2 focus card so it asks for attention. */}
          {autonomousRows.length > 0 && (
            <section
              aria-label="Agents Beamix is running for you"
              className="agent-zone agent-zone-accent mb-10 px-4 pb-4 pt-5 craft-enter craft-enter-2"
            >
              <div className="mb-4 flex items-center gap-2 px-1">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full bg-[#6E56F0]"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6E56F0]">
                  Beamix is running
                </p>
                <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
                  {autonomousCount} {autonomousCount === 1 ? 'agent' : 'agents'}
                </span>
              </div>

              {/* M12 — tight rhythm WITHIN the cluster (space-y-2.5, not the page gap) */}
              <div className="space-y-2.5">
                {autonomousRows.map(({ row, config }, i) => {
                  const needsSignOff = config.requiresApproval
                  return (
                    <AgentModeRow
                      key={row.id}
                      row={row}
                      config={config}
                      planTier={planTier}
                      onModeChange={handleModeChange}
                      // Sign-off rows step up to TIER-2 focus; healthy rows recede.
                      tier={needsSignOff ? 'focus' : 'inset'}
                      enterIndex={i + 2}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* ---- Section B: manual agents — on the white canvas (you = neutral) ----
              Wider gap before this section (M12 — vary whitespace by relationship). */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] craft-enter craft-enter-3">
            Run it yourself
          </p>
          <div className="space-y-3">
            {manualRows.map(({ row, config }, i) => (
              <AgentModeRow
                key={row.id}
                row={row}
                config={config}
                planTier={planTier}
                onModeChange={handleModeChange}
                tier="focus"
                enterIndex={i + 3}
              />
            ))}
          </div>

          {/* Reassurance footnote — plain sans. The single M5 serif beat lives in the
              subhead (one beat per screen, CRAFT-SYSTEM tell #6), so this stays quiet. */}
          <p className="mb-4 mt-10 max-w-[560px] text-[14px] leading-[1.65] text-[#374151] craft-enter craft-enter-8">
            {'Whatever you hand off, nothing publishes behind your back — anything that needs a human lands in Approvals and waits, safely, until you say go. '}
            <Link
              href="/archive"
              className="text-[#6B7280] underline decoration-[#E5E7EB] hover:text-[#0A0A0A] hover:decoration-[#9CA3AF] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF]"
            >
              View run history →
            </Link>
          </p>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Dev-only state switcher — strip in production build                */}
      {/* ------------------------------------------------------------------ */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2 rounded-lg border border-[#E5E7EB] bg-white p-2 shadow-sm">
          <span className="self-center px-1 text-[11px] font-medium text-[#9CA3AF]">
            State:
          </span>
          {(['loading', 'empty', 'error', 'populated'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPageState(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] ${
                pageState === s
                  ? 'bg-[#3370FF] text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

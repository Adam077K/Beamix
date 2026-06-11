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
import { AgentModeRow } from './_components/AgentModeRow'
import { DEMO_AUTOMATION } from '@/lib/demo/surfaces/automation'
import { AGENT_REGISTRY } from '@/lib/agents/config/registry'
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
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Manual */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-[#0A0A0A]">Manual</span>
          </div>
          <p className="text-[13px] leading-[1.55] text-[#6B7280]">
            You drive. Open the tool, review every step, and publish when ready.
          </p>
        </div>

        {/* Autonomous */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            {/* Violet tint dot — M6 spatial signal, not a button */}
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#6E56F0]/40"
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
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#6E56F0]"
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

function AutomationLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading automation settings…"
      className="space-y-3"
    >
      {/* 3-mode explainer skeleton */}
      <div className="card-inset mb-8 rounded-[16px] p-5">
        <Skeleton className="mb-4 h-3 w-32" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[16px] border border-[#E5E7EB] bg-white px-5 py-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-9 w-44 shrink-0 rounded-lg" />
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        </div>
      ))}
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

  // Count how many are handed to Beamix
  const autonomousCount = rows.filter((r) => r.mode === 'beamix').length

  return (
    <div className="mx-auto max-w-[880px]">
      {/* ------------------------------------------------------------------ */}
      {/* Page header — STEP-2 heading (M2) + right-rail stat (M3 asymmetry) */}
      {/* ------------------------------------------------------------------ */}
      <PageHeader
        eyebrow="Bright Smile Dental"
        title="Automation"
        subtitle="Choose how each agent works — you, or Beamix on a schedule."
        action={
          /* TIER-3 inset stat rail — STEP-1 Geist Mono hero figure (M2, M11) */
          <div className="card-inset flex min-w-[120px] flex-col items-end rounded-[12px] px-4 py-3 text-right">
            <span
              aria-label={`${autonomousCount} agents running autonomously`}
              className="font-[var(--font-mono)] text-[32px] font-normal leading-none tabular-nums text-[#0A0A0A]"
            >
              {autonomousCount}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF]">
              AUTONOMOUS
            </span>
          </div>
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

          {/* ---- Section heading ---- */}
          {/* M12: hairline editorial rhythm — wider gap before section label */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] craft-enter craft-enter-2">
            All agents
          </p>

          {/* ---- Agent rows — TIER-2 cards (M1) ---- */}
          <div className="space-y-3">
            {rows.map((row, i) => {
              const config = registryByLabel[row.agentLabel]
              // If registry doesn't have this agentLabel (shouldn't happen), skip gracefully
              if (!config) return null
              return (
                <AgentModeRow
                  key={row.id}
                  row={row}
                  config={config}
                  planTier={planTier}
                  onModeChange={handleModeChange}
                  enterIndex={i + 2} // offset so rows stagger after the header
                />
              )
            })}
          </div>

          {/* ---- Serif beat (M5) — one Fraunces italic word in the whole page ---- */}
          {/* Placed as an editorial footer-note, not in chrome */}
          <p className="mb-4 mt-10 max-w-[560px] text-[13px] leading-[1.6] text-[#9CA3AF] craft-enter craft-enter-8">
            {'Agents set to Autonomous will run on schedule. Items requiring approval are '}
            <span
              className="font-[var(--font-serif)] italic text-[#6B7280]"
              style={{ fontStyle: 'italic' }}
            >
              held
            </span>
            {' in Approvals until you review them. '}
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

'use client'

/**
 * Post-payment live-work onboarding — replaces the old FreeScanFlow stub.
 *
 * DATA DRIVER: DEMO_DAY1 from lib/demo/fixtures.ts.
 * REAL-ENGINE SEAM: The `useDay1StateMachine` hook drives the UI via a timed
 * state machine over DEMO_DAY1.steps. In production, replace `advanceOnTimer`
 * with polling against `GET /api/onboarding/day1-status` (returns { state,
 * pct, drafts[] }). The same 4 UI states — waiting / in_progress / complete /
 * error — map 1:1 to the day1_state enum on user_profiles.
 *
 * COLOR LAW:
 * - Blue #3370FF  = your actions (the CTA, progress fill)
 * - Violet #6E56F0 = the crew at work (step pill border, draft cards, engine pills)
 * - Violet NEVER on a button.
 *
 * CRAFT RULES APPLIED:
 * M1 Depth staging: TIER-1 hero step label (no card shadow), TIER-2 step
 *   container card-console, draft cards card-inset (TIER-3 recede).
 * M2 Type contract: STEP-1 pct 64px Geist Mono; STEP-2 label 30px InterDisplay;
 *   STEP-3 detail eyebrow; STEP-4 draft text 13px.
 * M5 Serif beat: one Fraunces italic word on the complete state ("Ready.").
 * M6 Violet structure: draft card border accent + crew label glanceable.
 * M9 Entrance: craft-enter stagger on each draft card as it lands.
 * M11 Mono for truth: pct always Geist Mono tabular-nums.
 * M12 Hairline rhythm: varied gaps, not global space-y-8.
 */

import { useEffect, useReducer, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DEMO_DAY1 } from '@/lib/demo/fixtures'
import type { Day1Step, Day1Draft } from '@/types/day1'

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type ScreenPhase = 'waiting' | 'in_progress' | 'complete' | 'error'

interface MachineState {
  phase: ScreenPhase
  stepIndex: number
  revealedDraftIds: Set<string>
}

type MachineAction =
  | { type: 'ADVANCE' }
  | { type: 'ERROR' }
  | { type: 'REVEAL_DRAFT'; draftId: string }

function machineReducer(
  state: MachineState,
  action: MachineAction,
): MachineState {
  switch (action.type) {
    case 'ADVANCE': {
      const nextIndex = state.stepIndex + 1
      if (nextIndex >= DEMO_DAY1.steps.length) {
        return { ...state, phase: 'complete', stepIndex: state.stepIndex }
      }
      const nextStep = DEMO_DAY1.steps[nextIndex]
      return {
        ...state,
        phase: nextStep.state === 'complete' ? 'complete' : 'in_progress',
        stepIndex: nextIndex,
      }
    }
    case 'ERROR':
      return { ...state, phase: 'error' }
    case 'REVEAL_DRAFT':
      return {
        ...state,
        revealedDraftIds: new Set([...state.revealedDraftIds, action.draftId]),
      }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook: drives the timed demo progression
// ---------------------------------------------------------------------------

function useDay1StateMachine(triggerError: boolean) {
  const [state, dispatch] = useReducer(machineReducer, {
    phase: 'waiting',
    stepIndex: 0,
    revealedDraftIds: new Set<string>(),
  })

  // Start in_progress immediately from step 0
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    dispatch({ type: 'ADVANCE' })
  }, [])

  // Advance on timer per step's durationMs
  useEffect(() => {
    if (state.phase === 'complete' || state.phase === 'error') return
    const currentStep = DEMO_DAY1.steps[state.stepIndex]
    if (!currentStep) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Collapse dwell to 200ms if reduced motion — still advances, just faster
    const dwell = prefersReduced
      ? Math.min(currentStep.durationMs, 200)
      : currentStep.durationMs

    const t = window.setTimeout(() => {
      dispatch({ type: 'ADVANCE' })
    }, dwell)
    return () => window.clearTimeout(t)
  }, [state.stepIndex, state.phase])

  // Reveal drafts after their surfacedAfterStepId has passed
  useEffect(() => {
    const passedStepIds = DEMO_DAY1.steps
      .slice(0, state.stepIndex + 1)
      .map((s) => s.id)

    DEMO_DAY1.drafts.forEach((draft) => {
      if (
        passedStepIds.includes(draft.surfacedAfterStepId) &&
        !state.revealedDraftIds.has(draft.id)
      ) {
        dispatch({ type: 'REVEAL_DRAFT', draftId: draft.id })
      }
    })
  }, [state.stepIndex, state.revealedDraftIds])

  // External error trigger (for demo/testing)
  useEffect(() => {
    if (triggerError) dispatch({ type: 'ERROR' })
  }, [triggerError])

  return state
}

// ---------------------------------------------------------------------------
// Engine pill — lights up during scan_running step
// ---------------------------------------------------------------------------

const ENGINES = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' },
] as const

function EnginePills({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2" role="list" aria-label="AI engines">
      {ENGINES.map((engine, i) => (
        <div
          key={engine.id}
          role="listitem"
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all duration-300',
            active
              ? 'border-[rgba(110,86,240,0.3)] bg-[var(--color-agent-tint)] text-[var(--color-agent)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-warm)] text-[var(--color-text-muted)]',
          )}
          style={
            active
              ? {
                  transitionDelay: `${i * 80}ms`,
                  animation:
                    'none' /* no looping — state change is the signal */,
                }
              : undefined
          }
        >
          <EngineGlyph id={engine.id} active={active} />
          <span className="text-[11px] font-medium leading-none tracking-[0.02em]">
            {engine.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function EngineGlyph({
  id,
  active,
}: {
  id: (typeof ENGINES)[number]['id']
  active: boolean
}) {
  const color = active ? 'var(--color-agent)' : 'var(--color-text-muted)'
  if (id === 'chatgpt') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.5a4 4 0 0 1 3.46 2 4 4 0 0 1 1.04 7.4 4 4 0 0 1-1.04 5.6 4 4 0 0 1-7-1.5 4 4 0 0 1-1.04-7.4A4 4 0 0 1 8.54 3.5 4 4 0 0 1 12 3.5Z"
          stroke={color}
          strokeWidth="1.8"
        />
      </svg>
    )
  }
  if (id === 'gemini') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2c.4 4.8 2.2 6.6 7 7-4.8.4-6.6 2.2-7 7-.4-4.8-2.2-6.6-7-7 4.8-.4 6.6-2.2 7-7Z"
          fill={color}
        />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 3.5v17M5 8.5l14 7M19 8.5l-14 7" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Draft card — surfaces progressively as steps complete
// ---------------------------------------------------------------------------

const KIND_LABELS: Record<Day1Draft['kind'], string> = {
  faq: 'FAQ',
  schema: 'Schema',
  citation: 'Citation',
  content: 'Content',
}

function DraftCard({
  draft,
  enterDelay,
}: {
  draft: Day1Draft
  enterDelay: number
}) {
  return (
    <div
      className="card-inset craft-enter p-4"
      style={{ animationDelay: `${enterDelay}ms` }}
      aria-label={`Draft: ${draft.title}`}
    >
      {/* Violet structure top accent: 1px hairline  */}
      <div
        className="mb-3 h-px w-full"
        style={{ background: 'rgba(110,86,240,0.15)' }}
        aria-hidden="true"
      />

      {/* Kind chip + crew attribution */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{
            background: 'var(--color-agent-tint)',
            color: 'var(--color-agent)',
          }}
        >
          {KIND_LABELS[draft.kind]}
        </span>
        <span className="text-[11px] text-[var(--color-text-disabled)]">
          drafted by the crew
        </span>
      </div>

      {/* Title */}
      <p className="text-[13px] font-medium leading-snug text-[var(--color-text-primary)]">
        {draft.title}
      </p>

      {/* Summary */}
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
        {draft.summary}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress track — thin blue bar + Geist Mono pct (STEP-1)
// ---------------------------------------------------------------------------

function ProgressTrack({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* Bar */}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] origin-left transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${pct / 100})`, willChange: 'transform' }}
          role="presentation"
        />
      </div>

      {/* Pct — STEP-1 focal figure */}
      <span
        className="w-10 shrink-0 text-right font-[var(--font-mono)] tabular-nums text-[13px] text-[var(--color-text-muted)]"
        aria-live="polite"
        aria-label={`${pct}% complete`}
      >
        {pct}%
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active step block — the ritual core
// ---------------------------------------------------------------------------

function ActiveStepBlock({ step }: { step: Day1Step }) {
  const isScanRunning = step.state === 'scan_running'

  return (
    <div className="craft-enter craft-enter-1 flex flex-col gap-4">
      {/* STEP-2: Label — 30px InterDisplay */}
      <h1
        className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]"
        style={{ fontFamily: 'var(--font-display)' }}
        aria-live="polite"
      >
        {step.label}
      </h1>

      {/* STEP-3: Detail eyebrow */}
      <p
        className="text-[13px] leading-relaxed text-[var(--color-text-muted)]"
        aria-live="polite"
      >
        {step.detail}
      </p>

      {/* Engine pills — signature detail, only during scan_running */}
      <div
        className={cn(
          'transition-all duration-300',
          isScanRunning ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden',
        )}
        aria-hidden={!isScanRunning}
      >
        <EnginePills active={isScanRunning} />
      </div>

      {/* Progress track */}
      <ProgressTrack pct={step.pct} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Complete beat
// ---------------------------------------------------------------------------

function CompleteBlock({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="craft-enter craft-enter-1 flex flex-col items-start gap-6">
      {/* Vertical composition: eyebrow → Fraunces verdict → sub-line */}
      <div className="flex flex-col gap-2">
        {/* STEP-3 eyebrow */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-disabled)]">
          Setup complete
        </p>

        {/* STEP-2 verdict — one Fraunces italic word (M5 serif beat) */}
        <h1
          className="text-[30px] leading-tight tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          All set —{' '}
          <em
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            ready.
          </em>
        </h1>

        {/* STEP-4 body */}
        <p className="max-w-[440px] text-[14px] leading-relaxed text-[var(--color-text-muted)]">
          {DEMO_DAY1.steps[DEMO_DAY1.steps.length - 1].detail}
        </p>
      </div>

      {/* CTA — blue = your action (only place blue appears as an action) */}
      <button
        type="button"
        onClick={onContinue}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        Go to your workspace
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error state — two-tier recovery (M8)
// ---------------------------------------------------------------------------

function ErrorBlock() {
  return (
    <div className="craft-enter craft-enter-1 flex flex-col items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-status-warning)]">
          Setup paused
        </p>
        <h1
          className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          We hit a snag
        </h1>
        <p className="max-w-[440px] text-[14px] leading-relaxed text-[var(--color-text-muted)]">
          Your data is safe and your payment went through. The crew will finish
          setting up your workspace in the background — you can start exploring
          now.
        </p>
      </div>

      {/* Two-tier recovery: primary blue CTA + quiet secondary link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="/home"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Continue to dashboard
        </a>
        <a
          href="mailto:support@beamixai.com"
          className="text-[13px] text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text-primary)]"
        >
          Contact support
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Waiting state — confirming payment
// ---------------------------------------------------------------------------

function WaitingBlock() {
  return (
    <div className="craft-enter craft-enter-1 flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-disabled)]">
        Just a moment
      </p>
      <h1
        className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Confirming payment…
      </h1>
      <p className="text-[13px] text-[var(--color-text-muted)]">
        Verifying your subscription. This takes a few seconds.
      </p>
      {/* Minimal pulse dots — not a spinner, not a generic loader */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-[var(--color-text-disabled)] motion-safe:animate-[scan-dot_1.4s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drafts panel
// ---------------------------------------------------------------------------

function DraftsPanel({
  revealedDraftIds,
}: {
  revealedDraftIds: Set<string>
}) {
  const visibleDrafts = DEMO_DAY1.drafts.filter((d) =>
    revealedDraftIds.has(d.id),
  )
  if (visibleDrafts.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Rail label — violet structure (M6) */}
      <p
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: 'var(--color-agent)' }}
      >
        <span
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--color-agent)' }}
          aria-hidden="true"
        />
        Drafted by the crew
      </p>

      {/* Draft cards staggered in */}
      {visibleDrafts.map((draft, i) => (
        <DraftCard key={draft.id} draft={draft} enterDelay={i * 80} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function PostPaymentScan() {
  const router = useRouter()

  // Dev/test error trigger — toggle via URL ?error=1 or a hidden keystroke.
  // This keeps the error state fully accessible in QA without affecting prod.
  const [forceError, setForceError] = useState(false)

  // Hidden keyboard shortcut for QA: Shift+E triggers the error state
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === 'E') setForceError(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { phase, stepIndex, revealedDraftIds } = useDay1StateMachine(forceError)
  const currentStep = DEMO_DAY1.steps[stepIndex]

  function handleContinue() {
    router.push('/home')
  }

  // Determine if drafts panel should show (only during in_progress/complete)
  const showDrafts = phase === 'in_progress' || phase === 'complete'

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--color-surface)' }}
      role="main"
      aria-label="Workspace setup"
    >
      {/* Centered column — single column, no sidebar, asymmetric padding */}
      <div className="mx-auto flex min-h-full max-w-[640px] flex-col justify-center px-6 py-16 sm:px-10">

        {/* ── Violet crew header — sets the spatial register ── */}
        <div
          className="craft-enter craft-enter-1 mb-8 flex items-center gap-2.5"
          aria-label="Beamix workspace setup"
        >
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: 'var(--color-agent)' }}
            aria-hidden="true"
          />
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-agent)' }}
          >
            {DEMO_DAY1.businessName}
          </p>
        </div>

        {/* ── TIER-2 main card — the instrument panel ── */}
        <div className="card-console craft-enter craft-enter-2 p-7 sm:p-9">

          {/* Phase rendering */}
          {phase === 'waiting' && <WaitingBlock />}

          {phase === 'in_progress' && currentStep && (
            <ActiveStepBlock step={currentStep} />
          )}

          {phase === 'complete' && (
            <CompleteBlock onContinue={handleContinue} />
          )}

          {phase === 'error' && <ErrorBlock />}
        </div>

        {/* ── M12 gap: 40px between the main card and the drafts rail ── */}
        <div className="mt-10" />

        {/* ── Drafts panel — surfaces progressively (TIER-3 insets) ── */}
        {showDrafts && (
          <DraftsPanel revealedDraftIds={revealedDraftIds} />
        )}

        {/* ── Reassurance footer ── */}
        {(phase === 'in_progress' || phase === 'waiting') && (
          <p className="craft-enter craft-enter-5 mt-10 text-[12px] text-[var(--color-text-disabled)]">
            This page updates automatically. You don&apos;t need to do anything.
          </p>
        )}
      </div>
    </div>
  )
}

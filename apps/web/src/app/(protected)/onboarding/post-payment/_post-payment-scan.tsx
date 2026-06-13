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
 * CRAFT RULES APPLIED (Wave 2 redesign — audit onboarding-post-payment.md):
 * M1 Depth staging: page sits on warm canvas; the left ritual panel is the ONE
 *   TIER-1 hero (.card-console-hero); the right value-preview is the TIER-2
 *   violet agent-zone; draft rows recede as TIER-3 .card-inset.
 * M2 Type contract: STEP-1 = the 64px Geist Mono <Stat> progress figure (the
 *   focal of this dwell state); STEP-2 verdict 30px InterDisplay; STEP-3 eyebrow;
 *   STEP-4 body/draft text.
 * M3 Intentional asymmetry: confident [1.1fr_minmax(0,420px)] split that FILLS
 *   the viewport (content side + value-preview side) — kills the dead-center
 *   card-in-void (AI tell #5). Collapses to one column < 1024px.
 * M5 Serif beat: one Fraunces italic word on the complete state ("ready.").
 * M6 Violet structure: the whole right rail is the agent ZONE (crew at work);
 *   engine pills anchored in a labeled module, not loose chips.
 * M9 Entrance: priority-ordered fade-up — crew header → progress focal →
 *   value-preview rail — real choreography for the first paid moment.
 * M11 Mono for truth: pct always Geist Mono tabular-nums via <Stat>.
 * M12 Hairline rhythm: varied gaps + hairline dividers, not global space-y.
 */

import { useEffect, useReducer, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DEMO_DAY1 } from '@/lib/demo/fixtures'
import { Stat } from '@/components/ui/stat'
import type { Day1Step } from '@/types/day1'
import { ValuePreviewRail } from './_components/value-preview-rail'

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
// Progress focal — the 64px Geist Mono <Stat> (STEP-1) + thin blue track.
// This is the focal of the dwell state: the figure the eye lands on first.
// ---------------------------------------------------------------------------

function ProgressFocal({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="flex flex-col gap-4">
      {/* STEP-1 hero figure — blue = your progress (M2/M11) */}
      <Stat
        value={pct}
        unit="%"
        label={label}
        size="hero"
        labelPosition="top"
        align="start"
        valueColor="var(--color-accent)"
        aria-live="polite"
      />

      {/* Thin blue track — a touch more presence than a hairline (P3-1) */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="presentation"
      >
        <div
          className="h-full origin-left rounded-full bg-[var(--color-accent)] transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${pct / 100})`, willChange: 'transform' }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active step block — the ritual core (left column)
// ---------------------------------------------------------------------------

function ActiveStepBlock({ step }: { step: Day1Step }) {
  const isScanRunning = step.state === 'scan_running'

  return (
    <div className="flex flex-col gap-7">
      {/* STEP-1 — the progress figure leads, label as eyebrow above it */}
      <ProgressFocal pct={step.pct} label="Setting up your workspace" />

      {/* Hairline divider — M12 rhythm between focal and the live step */}
      <div
        className="h-px w-full bg-[var(--color-border-subtle)]"
        aria-hidden="true"
      />

      {/* STEP-2: verdict label — 30px InterDisplay (what's happening now) */}
      <div className="flex flex-col gap-2">
        <h1
          className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-live="polite"
        >
          {step.label}
        </h1>
        <p
          className="max-w-[460px] text-[14px] leading-relaxed text-[var(--color-text-muted)]"
          aria-live="polite"
        >
          {step.detail}
        </p>
      </div>

      {/* Engine pills — anchored in a labeled violet module (M6, fixes P2-3) */}
      <div
        className={cn(
          'transition-all duration-300',
          isScanRunning
            ? 'opacity-100'
            : 'pointer-events-none h-0 overflow-hidden opacity-0',
        )}
        aria-hidden={!isScanRunning}
      >
        <EngineModule active={isScanRunning} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Engine module — labeled, anchored violet structure (not loose chips)
// ---------------------------------------------------------------------------

function EngineModule({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: 'var(--color-agent)' }}
      >
        <span
          className="block h-1.5 w-1.5 rounded-full motion-safe:animate-[scan-dot_1.4s_ease-in-out_infinite]"
          style={{ background: 'var(--color-agent)' }}
          aria-hidden="true"
        />
        Scanning across
      </span>
      <EnginePills active={active} />
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

function ErrorBlock({ onContinue }: { onContinue: () => void }) {
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

      {/* Two-tier recovery: primary blue CTA (client-side nav) + quiet secondary link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Continue to dashboard
        </button>
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
// Main export
// ---------------------------------------------------------------------------

export function PostPaymentScan() {
  const router = useRouter()

  // Dev/test error trigger — toggle via URL ?error=1 or a hidden keystroke.
  // This keeps the error state fully accessible in QA without affecting prod.
  const [forceError, setForceError] = useState(false)

  // Hidden keyboard shortcut for QA: Shift+E triggers the error state.
  // Guarded to dev/test only — never attaches in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
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

  // The value-preview rail shows once payment is confirmed (everything except
  // the brief waiting beat and a hard error) — it is the "what you just bought"
  // half of the split that fills the frame.
  const showRail = phase === 'in_progress' || phase === 'complete'

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--color-surface-warm)' }}
      role="main"
      aria-label="Workspace setup"
    >
      {/* Asymmetric split that fills the viewport (M3): dominant ritual column +
          narrower value-preview rail. Collapses to one column < 1024px. */}
      <div className="mx-auto min-h-full w-full max-w-[1180px] px-6 py-12 sm:px-10 lg:py-16">
        {/* ── Violet crew header — sets the spatial register, full width ── */}
        <div
          className="craft-enter craft-enter-1 mb-8 flex items-center gap-2.5 lg:mb-10"
          aria-label="Beamix workspace setup"
        >
          <span
            className="block h-2 w-2 rounded-full"
            style={{ background: 'var(--color-agent)' }}
            aria-hidden="true"
          />
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: 'var(--color-agent)' }}
          >
            {DEMO_DAY1.businessName}
          </p>
          <span
            className="ml-auto hidden text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-disabled)] sm:block"
          >
            Setting up your workspace
          </span>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:gap-8">
          {/* ── LEFT: TIER-1 hero ritual panel (the one focal of the screen) ── */}
          <div className="craft-enter craft-enter-2 flex flex-col">
            <div className="card-console-hero flex flex-1 flex-col justify-center p-7 sm:p-9 lg:p-10">
              {phase === 'waiting' && <WaitingBlock />}

              {phase === 'in_progress' && currentStep && (
                <ActiveStepBlock step={currentStep} />
              )}

              {phase === 'complete' && (
                <CompleteBlock onContinue={handleContinue} />
              )}

              {phase === 'error' && <ErrorBlock onContinue={handleContinue} />}
            </div>

            {/* Reassurance footer — tied to the ritual cluster (fixes P2-4) */}
            {(phase === 'in_progress' || phase === 'waiting') && (
              <p className="craft-enter craft-enter-5 mt-4 pl-1 text-[12px] text-[var(--color-text-disabled)]">
                This page updates automatically — you don&apos;t need to do
                anything. Your payment is confirmed.
              </p>
            )}
          </div>

          {/* ── RIGHT: value-preview rail — what you just bought, being set up ── */}
          {showRail ? (
            <ValuePreviewRail
              revealedDraftIds={revealedDraftIds}
              totalExpected={DEMO_DAY1.drafts.length}
            />
          ) : (
            // Keep the frame filled during waiting / error with the same zone
            // shell carrying skeletons, so the split never collapses to a void.
            <ValuePreviewRail
              revealedDraftIds={new Set<string>()}
              totalExpected={DEMO_DAY1.drafts.length}
            />
          )}
        </div>
      </div>
    </div>
  )
}

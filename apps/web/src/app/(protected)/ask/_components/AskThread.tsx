'use client'

/**
 * AskThread — the Ask Beamix surface shell. Routes all 4 states and owns the
 * thread interaction (pick/send → grounding ledger → cited answer morph).
 *
 * Design laws applied:
 *  - Single centered column max-w-[760px] — a document THREAD, never a
 *    multi-panel dashboard grid. No KPI cards, no filter rail, no data table.
 *  - blue=you (user annotation rule, composer, Send) · violet=agent (the
 *    grounding ledger only). Violet never on a button.
 *  - Type contract: page H1 30px InterDisplay · eyebrow 12px · body 15–16px ·
 *    every figure Geist Mono tabular-nums.
 *  - Exactly ONE Fraunces beat (the verdict word in the first answer).
 *  - All 4 states designed; empty sells with grounded starter questions; error
 *    names a real recovery action.
 *  - Signature moment: the violet grounding ledger collapses (opacity+scale,
 *    ~300ms) and the cited AnswerCard fades up below.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { ErrorState } from '@/components/error-state'
import { DEMO_ASK } from '@/lib/demo/surfaces'
import type { AskMessage } from '@/lib/demo/surfaces/types'

import { UserTurn } from './UserTurn'
import { AnswerCard, type AnswerFocal } from './AnswerCard'
import { GroundingLedger } from './GroundingLedger'
import { StarterQuestions } from './StarterQuestions'
import { McpConnectStrip } from './McpConnectStrip'
import { Composer } from './Composer'
import { AskSkeleton } from './AskSkeleton'

export type AskState = 'loading' | 'empty' | 'error' | 'success'

interface AskThreadProps {
  state: AskState
}

// The one Fraunces verdict word lifted in the first grounded answer.
// Lands on the actual judgement of the answer ("Smile Center is cited FIRST"),
// not the common noun "gap" — so the serif beat reads as a verdict, not a typo.
const VERDICT_WORD = 'first'

// The single TIER-1 focal pulled above the first answer's prose (M2/M10).
// The load-bearing fact of the whole thread: the citation-rate verdict.
const FIRST_ANSWER_FOCAL: AnswerFocal = {
  eyebrow: 'Cited first · ChatGPT + Gemini',
  value: '5',
  unit: '/6 tests',
  caption:
    'Smile Center is surfaced ahead of you on the three most-searched whitening queries in your region.',
}

// A live turn in the rendered thread (seeded or user-driven).
type LiveTurn =
  | { kind: 'user'; id: string; content: string; timestamp?: string }
  | { kind: 'answer'; id: string; message: AskMessage }

// Seed the success thread from the fixture (alternating user / beamix).
function seedTurns(): LiveTurn[] {
  const turns: LiveTurn[] = []
  for (const msg of DEMO_ASK.thread) {
    if (msg.role === 'user') {
      turns.push({ kind: 'user', id: msg.id, content: msg.content })
    } else {
      turns.push({ kind: 'answer', id: msg.id, message: msg })
    }
  }
  return turns
}

// The seeded beamix answers, used to respond to follow-ups in order.
const SEEDED_ANSWERS = DEMO_ASK.thread.filter((m) => m.role === 'beamix')

export function AskThread({ state }: AskThreadProps) {
  // The thread shown to the user. In `success` we seed it; in `empty` it starts
  // bare and grows as the user asks. Local state only — no backend.
  const [turns, setTurns] = useState<LiveTurn[]>(() =>
    state === 'success' ? seedTurns() : [],
  )
  const [composerValue, setComposerValue] = useState('')
  // When set, the grounding ledger is running for this pending question.
  const [pending, setPending] = useState<{ question: string } | null>(null)
  // How many seeded answers we've already used (so follow-ups stay coherent).
  // The value is only read inside the functional updater, never in render.
  const [, setAnswerCursor] = useState(
    state === 'success' ? SEEDED_ANSWERS.length : 0,
  )
  // Local override so the error state's recovery can clear without a reload.
  const [recovered, setRecovered] = useState(false)

  // Scroll the latest turn into view after the user asks — never on the initial
  // seed (so the demo lands on the H1 + the focal hero, not the thread tail).
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const hasAskedRef = useRef(false)

  const askQuestion = useCallback((question: string) => {
    const q = question.trim()
    if (!q) return
    hasAskedRef.current = true
    setComposerValue('')
    setTurns((prev) => [
      ...prev,
      { kind: 'user', id: `u-${Date.now()}`, content: q },
    ])
    setPending({ question: q })
  }, [])

  // Keep the newest turn / grounding ledger in view as the conversation grows.
  useEffect(() => {
    if (!hasAskedRef.current) return
    scrollAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [turns, pending])

  // Called once the grounding ledger finishes its morph — mount the answer.
  const handleGroundingComplete = useCallback(() => {
    setAnswerCursor((cursor) => {
      const message = SEEDED_ANSWERS[cursor] ?? SEEDED_ANSWERS[SEEDED_ANSWERS.length - 1]
      if (message) {
        setTurns((prev) => [
          ...prev,
          { kind: 'answer', id: `a-${Date.now()}`, message },
        ])
      }
      return Math.min(cursor + 1, SEEDED_ANSWERS.length)
    })
    setPending(null)
  }, [])

  // -------------------------------------------------------------------------
  // LOADING
  // -------------------------------------------------------------------------
  if (state === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[760px] px-5 pb-40 pt-10 sm:px-8">
        <AskHeader />
        <AskSkeleton />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // ERROR (with named recovery — never "refresh the page")
  // -------------------------------------------------------------------------
  if (state === 'error' && !recovered) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-5 pt-10 sm:px-8">
        <AskHeader />
        <ErrorState
          title="Couldn’t reach the model"
          description="Your last answer is safe. Retry the question — this usually clears in a moment."
          onRetry={() => setRecovered(true)}
          retryLabel="Retry"
        />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // EMPTY — suggested grounded questions + MCP affordance (not a blinking void)
  // -------------------------------------------------------------------------
  const isEmptyThread = turns.length === 0 && !pending

  // Track which answer is allowed to carry the single Fraunces verdict beat:
  // the FIRST answer turn in the thread.
  const firstAnswerId = turns.find((t) => t.kind === 'answer')?.id ?? null

  return (
    <div className="relative flex h-full flex-col">
      {/* Scrollable thread column. Bottom padding reserves clearance for the
          pinned composer so the last turn is fully readable above it (M12) —
          the composer rests beneath the thread, never crops it. */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-5 pb-[13.5rem] pt-10 sm:px-8">
          <AskHeader />

          {isEmptyThread ? (
            <div className="craft-enter craft-enter-1 space-y-6">
              <div>
                <h2 className="mb-1 text-[17px] font-semibold text-[#0A0A0A]">
                  Start with a question
                </h2>
                <p className="text-[14px] leading-[1.5] text-[#6B7280]">
                  Every answer is grounded in your own scans, prompts and
                  competitors — with the sources linked inline.
                </p>
              </div>

              <StarterQuestions
                questions={DEMO_ASK.suggestedQuestions}
                onPick={askQuestion}
              />

              <McpConnectStrip />
            </div>
          ) : (
            <div className="space-y-10">
              {turns.map((turn, i) => {
                if (turn.kind === 'user') {
                  return (
                    <UserTurn
                      key={turn.id}
                      content={turn.content}
                      timestamp={turn.timestamp}
                    />
                  )
                }
                const isFirstAnswer = turn.id === firstAnswerId
                return (
                  <AnswerCard
                    key={turn.id}
                    content={turn.message.content}
                    citations={turn.message.citations}
                    verdictWord={isFirstAnswer ? VERDICT_WORD : null}
                    focal={isFirstAnswer ? FIRST_ANSWER_FOCAL : null}
                    enterIndex={Math.min(i + 1, 8)}
                  />
                )
              })}

              {/* Signature moment: the violet grounding ledger → answer morph */}
              {pending && (
                <GroundingLedger
                  key={pending.question}
                  steps={DEMO_ASK.groundingSteps}
                  onComplete={handleGroundingComplete}
                />
              )}

              {/* Scroll target — keeps the newest turn in view after a question. */}
              <div ref={scrollAnchorRef} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {/* Sticky composer pinned to the bottom of the column. The fade band is
          short (pt-6) and the solid-white floor only covers the composer's own
          height — so the gradient eases the thread tail OUT below the last
          readable line instead of cropping live content mid-sentence (P1.3). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white from-60% via-white/95 to-transparent pb-5 pt-6">
        <div className="pointer-events-auto mx-auto w-full max-w-[760px] px-5 sm:px-8">
          <Composer
            value={composerValue}
            onChange={setComposerValue}
            onSubmit={askQuestion}
            busy={pending !== null}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared header — carries the page identity + the (rare) serif moment lives in
// the answers, so the header stays calm sans.
// ---------------------------------------------------------------------------

function AskHeader() {
  return (
    <PageHeader
      eyebrow="ASK BEAMIX"
      title="Ask anything about your visibility"
      subtitle="A cited copilot over your own GEO data — every answer links back to the exact scans and prompts that back it."
    />
  )
}

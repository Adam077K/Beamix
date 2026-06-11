'use client'

import { FileText, Code2, Quote, ExternalLink } from 'lucide-react'
import type { Outcome, Deliverable, DeliverableKind } from '@/types/traceability'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENGINE_LABEL: Record<Outcome['engine'], string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

const KIND_ICON: Record<DeliverableKind, typeof FileText> = {
  article: FileText,
  schema: Code2,
  citation: Quote,
}

const KIND_LABEL: Record<DeliverableKind, string> = {
  article: 'Article',
  schema: 'Schema',
  citation: 'Citation',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format ISO to "Jun 9, 2026" — full date, Geist Mono rendered via caller. */
function fullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/** Format ISO to "Jun 9" — short, for timeline rows. */
function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

/** Returns the hostname only. */
function urlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Guard against javascript:/data: XSS. Returns null for non-http/https URLs. */
function safeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url
    return null
  } catch {
    return null
  }
}

/**
 * Split the outcome statement to italicize the engine name with a Fraunces beat.
 * Strategy: find the engine label in the statement and wrap it.
 * Returns [before, engineWord, after] — engineWord may be empty if not found.
 */
function splitOnEngine(
  statement: string,
  engine: Outcome['engine'],
): [string, string, string] {
  const label = ENGINE_LABEL[engine]
  const idx = statement.indexOf(label)
  if (idx === -1) return [statement, '', '']
  return [
    statement.slice(0, idx),
    label,
    statement.slice(idx + label.length),
  ]
}

// ---------------------------------------------------------------------------
// Kind pill — status-agent system (violet ground, violet text)
// ---------------------------------------------------------------------------

function KindPill({ kind }: { kind: DeliverableKind }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-agent px-2 py-0.5 text-[11px] font-medium text-status-agent">
      {KIND_LABEL[kind]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DeliverableLedgerRow — one deliverable in the timeline
// ---------------------------------------------------------------------------

interface DeliverableRowProps {
  deliverable: Deliverable
  staggerClass: string
}

function DeliverableLedgerRow({ deliverable, staggerClass }: DeliverableRowProps) {
  const KindIcon = KIND_ICON[deliverable.kind]
  const safeUrl = safeHttpUrl(deliverable.url)
  const host = urlHost(deliverable.url)
  const date = shortDate(deliverable.occurredAt)

  return (
    <div className={`craft-enter ${staggerClass} relative flex items-start gap-5 py-4 pl-6`}>
      {/*
       * Timeline node — violet 8px dot anchored on the left rail.
       * The parent column carries border-l border-[#E5E7EB] for the rail.
       * Offset: -9px left from the border, centered vertically with the first line.
       */}
      <span
        className="timeline-node absolute -left-[5px] top-[22px] ring-4 ring-white"
        aria-hidden="true"
      />

      {/* Content block */}
      <div className="min-w-0 flex-1 card-inset px-4 py-3">
        {/* Row 1: kind pill + date */}
        <div className="mb-1.5 flex items-center gap-2">
          <KindPill kind={deliverable.kind} />
          <span className="font-mono text-[11px] tabular-nums text-[#9CA3AF]">{date}</span>
        </div>

        {/* Row 2: kind icon + label */}
        <div className="flex items-start gap-2">
          <KindIcon
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-agent"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="text-[14px] leading-snug text-[#0A0A0A]">{deliverable.label}</span>
        </div>

        {/* Row 3: live link — blue, Geist Mono, external */}
        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${deliverable.label} at ${host} (opens in new tab)`}
            className="mt-1.5 inline-flex items-center gap-1 font-mono text-[12px] text-accent transition-colors hover:text-[var(--color-accent-hover)] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            {host}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : (
          <span className="mt-1.5 inline-block font-mono text-[12px] text-[#9CA3AF]">{host}</span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TerminalNode — the trail ends at the scored outcome
// ---------------------------------------------------------------------------

interface TerminalNodeProps {
  deltaPoints: number
  engine: Outcome['engine']
  achievedAt: string
}

function TerminalNode({ deltaPoints, engine, achievedAt }: TerminalNodeProps) {
  return (
    <div className="craft-enter craft-enter-5 relative flex items-center gap-5 py-3 pl-6">
      {/* Terminal dot — blue (the customer's verified result) */}
      <span
        className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent ring-4 ring-white"
        aria-hidden="true"
      />

      {/* Delta summary pill — blue, the outcome */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-status-info px-3 py-1 font-mono text-[13px] font-semibold tabular-nums text-status-info">
          +{deltaPoints} pt on {ENGINE_LABEL[engine]}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
          {fullDate(achievedAt)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OutcomeDetailView — the full detail screen content
// ---------------------------------------------------------------------------

interface OutcomeDetailViewProps {
  outcome: Outcome
}

export function OutcomeDetailView({ outcome }: OutcomeDetailViewProps) {
  const [before, engineWord, after] = splitOnEngine(outcome.statement, outcome.engine)

  return (
    <article aria-label={outcome.statement}>
      {/*
       * M1 TIER-1 hero — the loudest thing on screen.
       * card-console-hero carries the richest elevation ramp.
       * craft-enter: fades up on first paint.
       */}
      <section
        aria-labelledby="outcome-hero-heading"
        className="card-console-hero craft-enter craft-enter-1 overflow-hidden"
      >
        <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
          {/* STEP-3 eyebrow — 12px Inter-600 uppercase */}
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
            Outcome
          </p>

          {/*
           * STEP-1 hero figure — deltaPoints in Geist Mono 64px, the loudest number.
           * Green for positive delta (score-good), red for regression.
           */}
          <div
            className="mb-4 font-mono text-[64px] font-semibold leading-none tabular-nums"
            style={{
              color:
                outcome.deltaPoints >= 0
                  ? 'var(--color-score-good)'
                  : 'var(--color-score-critical)',
              letterSpacing: '-0.03em',
            }}
            aria-label={`Score delta: ${outcome.deltaPoints >= 0 ? '+' : ''}${outcome.deltaPoints} points`}
          >
            {outcome.deltaPoints >= 0 ? '+' : ''}
            {outcome.deltaPoints}
          </div>

          {/*
           * STEP-2 verdict — outcome statement in InterDisplay 30px.
           * One Fraunces italic beat: the engine name only.
           */}
          <h1
            id="outcome-hero-heading"
            className="text-[28px] leading-tight text-[#0A0A0A] sm:text-[30px]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {before}
            {engineWord && (
              <em
                className="not-italic"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
              >
                {engineWord}
              </em>
            )}
            {after}
          </h1>

          {/* STEP-4 body meta — engine + achieved date in Geist Mono */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {/* Engine badge — agent-tint ground (engine = what the agent targeted) */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-agent-tint px-2.5 py-0.5 text-[12px] font-medium text-agent">
              {ENGINE_LABEL[outcome.engine]}
            </span>

            {/* Achievement date */}
            <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
              Achieved {fullDate(outcome.achievedAt)}
            </span>
          </div>
        </div>
      </section>

      {/* M12 rhythm: 40px gap — hero to work trail */}
      <div className="mt-10" />

      {/*
       * Work trail section — TIER-3 inset ledger.
       * The deliverable ledger reads like a dated receipt.
       * craft-enter-2 for the section header.
       */}
      <section aria-labelledby="work-trail-heading">
        {/* STEP-3 eyebrow — work trail heading */}
        <p
          id="work-trail-heading"
          className="craft-enter craft-enter-2 mb-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Work trail
        </p>

        {/*
         * Timeline rail — border-l #E5E7EB hairline.
         * Each deliverable row is positioned relative to this container.
         * The timeline-node dots are anchored at -5px from the left border.
         */}
        {outcome.deliverables.length > 0 ? (
          <div className="border-l border-[#E5E7EB] ml-[5px]">
            {outcome.deliverables.map((d, idx) => {
              // Map index to stagger class (1-indexed, max craft-enter-4)
              const staggerClass =
                idx === 0
                  ? 'craft-enter-2'
                  : idx === 1
                    ? 'craft-enter-3'
                    : idx === 2
                      ? 'craft-enter-4'
                      : 'craft-enter-4'
              return (
                <DeliverableLedgerRow
                  key={d.id}
                  deliverable={d}
                  staggerClass={staggerClass}
                />
              )
            })}

            {/* Terminal node — the trail ends at the proven outcome */}
            <TerminalNode
              deltaPoints={outcome.deltaPoints}
              engine={outcome.engine}
              achievedAt={outcome.achievedAt}
            />
          </div>
        ) : (
          /* Empty deliverables — designed, not blank */
          <div className="card-inset craft-enter craft-enter-3 px-5 py-6">
            <p className="text-[14px] text-[#6B7280]">
              No deliverables recorded for this outcome yet.
            </p>
          </div>
        )}
      </section>

      {/* M12 rhythm: 40px gap — trail to footer */}
      <div className="mt-10" />

      {/* Footer attribution note */}
      <p className="craft-enter craft-enter-4 text-[12px] leading-relaxed text-[#9CA3AF]">
        Dates are when the work was completed, not when the ranking change was detected. Engine
        attribution is based on the first engine to surface the result for the tracked query.
      </p>
    </article>
  )
}

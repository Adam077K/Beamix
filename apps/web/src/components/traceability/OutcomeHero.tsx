import Link from 'next/link'
import { ArrowRight, FileText, Code2, Quote } from 'lucide-react'
import { Stat } from '@/components/ui/stat'
import type { Outcome, DeliverableKind } from '@/types/traceability'
import { ENGINE_LABEL, fullDate, splitOnEngine } from './helpers'

interface OutcomeHeroProps {
  outcome: Outcome
}

const KIND_ICON: Record<DeliverableKind, typeof FileText> = {
  article: FileText,
  schema: Code2,
  citation: Quote,
}

/**
 * OutcomeHero — TIER-1 focal for the traceability list (M1 / M3 / M10).
 *
 * The most recent, highest-impact outcome promoted to a hero band so the page
 * has exactly one TIER-1 focal. The `deltaPoints` figure is the loudest object
 * on screen: 64px Geist Mono via <Stat size="hero"> in score-good (M2 / M11).
 *
 * Composition is intentionally asymmetric (verdict left, proof rail right) to
 * break the full-width identical-row stack (tell #2). The whole band routes to
 * the full forensic receipt — the confident primary affordance (P2-3).
 *
 * Color laws:
 *  - Blue (#3370FF): the "See the full work trail" affordance only
 *  - Violet (#6E56F0): the engine badge ground + deliverable kind icons (agent work)
 *  - Green (score-good): the positive delta figure (data-viz, not a CTA)
 */
export function OutcomeHero({ outcome }: OutcomeHeroProps) {
  const [before, engineWord, after] = splitOnEngine(outcome.statement, outcome.engine)
  const positive = outcome.deltaPoints >= 0
  const deliverableCount = outcome.deliverables.length

  return (
    <Link
      href={`/traceability/${outcome.id}`}
      aria-label={`See the full work trail: ${outcome.statement}`}
      className="card-console-hero card-hover-lift craft-enter craft-enter-1 group block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
    >
      <div className="grid gap-8 px-6 py-7 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-12 sm:px-8 sm:py-8">
        {/* ── Left: verdict + proof rail ─────────────────────── */}
        <div className="min-w-0">
          {/* STEP-3 eyebrow */}
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
            Latest result
          </p>

          {/* STEP-2 verdict — InterDisplay 30px, one Fraunces engine beat */}
          <h2
            className="text-[24px] leading-tight text-[#0A0A0A] sm:text-[28px]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {before}
            {engineWord && (
              <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {engineWord}
              </em>
            )}
            {after}
          </h2>

          {/* Proof rail — engine badge + deliverable kinds + date */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Engine badge — violet agent-tint ground (the engine the agents moved) */}
            <span className="inline-flex items-center rounded-full bg-agent-tint px-2.5 py-0.5 text-[12px] font-medium text-agent">
              {ENGINE_LABEL[outcome.engine]}
            </span>

            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D1D5DB]" />

            {/* Deliverable kind icons — the violet work trail, glanceable (M6) */}
            <span className="inline-flex items-center gap-1.5">
              {outcome.deliverables.slice(0, 4).map((d) => {
                const Icon = KIND_ICON[d.kind]
                return (
                  <Icon
                    key={d.id}
                    className="h-3.5 w-3.5 text-agent"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                )
              })}
              <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
                {deliverableCount} deliverable{deliverableCount !== 1 ? 's' : ''}
              </span>
            </span>

            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D1D5DB]" />

            <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
              {fullDate(outcome.achievedAt)}
            </span>
          </div>

          {/* Confident primary affordance — blue */}
          <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors group-hover:text-[var(--color-accent-hover)]">
            See the full work trail
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
        </div>

        {/* ── Right: the proof number, 64px mono (M2 STEP-1) ── */}
        <div className="sm:border-l sm:border-[#F0F1F3] sm:pl-12">
          <Stat
            size="hero"
            align="start"
            value={`${positive ? '+' : ''}${outcome.deltaPoints}`}
            unit="pt"
            label="Visibility gained"
            valueColor={
              positive ? 'var(--color-score-good)' : 'var(--color-score-critical)'
            }
            className="sm:items-end sm:text-right"
          />
        </div>
      </div>
    </Link>
  )
}

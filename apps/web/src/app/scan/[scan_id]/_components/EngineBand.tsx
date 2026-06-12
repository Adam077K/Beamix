'use client'

/**
 * EngineBand — weighted per-engine breakdown rail (M3/M4/M7).
 *
 * Rebuilt 2026-06-12 (UIX-P scan-free). The old version was the canonical
 * AI "3-equal-cell grid" (CRAFT tell #2): three tied flex-1 cells, no
 * differentiation, no signature detail. This version makes the band MEAN
 * something:
 *   - Engines are sorted WORST-FIRST so the weakest surface reads at a glance
 *     (M3 — weight, don't tie). The lead row carries a "weakest" marker.
 *   - Each engine gets the signature micro-sparkline (M4) + an in-cell score
 *     shading bar keyed to the score-band color (M7 — in-cell data).
 *   - Row hover ground + a left score-band hairline give it a real data-surface
 *     feel rather than three styled <span>s.
 *   - The query verdict ("Mentioned for 4 of 6 tested queries") rides under the
 *     engine name as evidence density.
 *
 * Sits as a TIER-3 .card-inset (M1) — it recedes behind the hero and the
 * IssueLedger, which is the evidence that drives the CTA.
 *
 * Data-only score colors (never blue). Mono numerals via <Stat>. NO agent names
 * (Engineering Principle #9).
 */

import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'

interface EngineScore {
  id: 'chatgpt' | 'gemini' | 'perplexity'
  label: string
  /** Numeric score 0–100 if available */
  score?: number | null
  /** Boolean mention state if numeric score unavailable */
  mentioned?: boolean | null
  /** Raw verdict string — shown as the evidence line under the engine name */
  verdict?: string | null
}

interface EngineBandProps {
  engines: EngineScore[]
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                 red — critical
}

/** Short evidence line when the engine carries no explicit verdict. */
function mentionLine(engine: EngineScore): string | null {
  if (engine.verdict) return engine.verdict
  if (engine.mentioned === true) return 'Mentioned in AI answers.'
  if (engine.mentioned === false) return 'Not surfaced in AI answers yet.'
  return null
}

/** A tiny rounded glyph stands in for the engine logo (recognition, M3). */
function EngineGlyph({ id, color }: { id: EngineScore['id']; color: string }) {
  const letter = id === 'chatgpt' ? 'C' : id === 'gemini' ? 'G' : 'P'
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] font-mono text-[13px] font-semibold"
      style={{
        color,
        backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
        border: '1px solid color-mix(in srgb, currentColor 22%, transparent)',
      }}
    >
      {letter}
    </span>
  )
}

export function EngineBand({ engines }: EngineBandProps) {
  // Sort worst-first so the weakest engine leads (M3 — meaning, not three ties).
  // Engines without a numeric score sink to the bottom (nothing to rank).
  const ranked = [...engines].sort((a, b) => {
    const sa = a.score ?? Number.POSITIVE_INFINITY
    const sb = b.score ?? Number.POSITIVE_INFINITY
    return sa - sb
  })

  const numericCount = engines.filter((e) => e.score != null).length

  return (
    <section className="card-inset overflow-hidden" aria-label="Per-engine breakdown">
      <div className="flex items-baseline justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
          By engine
        </p>
        {numericCount > 1 && (
          <span className="text-[11px] font-medium text-[var(--color-text-disabled)]">
            Weakest first
          </span>
        )}
      </div>

      <ul className="divide-y divide-[var(--color-border-subtle)]">
        {ranked.map((engine, i) => {
          const hasScore = engine.score != null
          const score = engine.score ?? 0
          const color = hasScore ? scoreColor(score) : 'var(--color-text-disabled)'
          const isWeakest = i === 0 && numericCount > 1 && hasScore
          const evidence = mentionLine(engine)

          return (
            <li
              key={engine.id}
              className="group relative px-5 py-4 transition-colors duration-150 hover:bg-[#F4F6FA]"
            >
              {/* Left score-band hairline (M7) */}
              <span
                aria-hidden="true"
                className="absolute inset-y-3 left-0 w-[2px] rounded-full"
                style={{ backgroundColor: hasScore ? color : 'var(--color-border)' }}
              />

              <div className="flex items-center gap-3">
                <EngineGlyph id={engine.id} color={hasScore ? color : '#9CA3AF'} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {engine.label}
                    </span>
                    {isWeakest && (
                      <span
                        className="rounded-full px-2 py-px text-[10px] font-semibold uppercase tracking-[0.06em]"
                        style={{
                          color: 'var(--color-status-warning)',
                          backgroundColor: 'var(--color-status-warning-bg)',
                        }}
                      >
                        Weakest
                      </span>
                    )}
                  </div>
                  {evidence && (
                    <p className="mt-0.5 truncate text-[12px] leading-[1.4] text-[var(--color-text-muted)]">
                      {evidence}
                    </p>
                  )}
                </div>

                {/* Sparkline (M4) — baseline-only here since no history, but it
                    anchors "now" with the endpoint dot and gives the page its
                    fingerprint. Never fabricates a series. */}
                <EngineMicroSparkline
                  points={hasScore ? [score] : null}
                  currentScore={hasScore ? score : null}
                  className="hidden shrink-0 sm:block"
                />

                {/* Figure */}
                <div className="flex shrink-0 flex-col items-end">
                  {hasScore ? (
                    <span
                      className="font-mono text-[22px] font-medium leading-none tabular-nums"
                      style={{ color }}
                    >
                      {score}
                    </span>
                  ) : (
                    <span
                      className="text-[13px] font-medium leading-none"
                      style={{ color }}
                    >
                      {engine.mentioned === false ? 'Not found' : '—'}
                    </span>
                  )}
                </div>
              </div>

              {/* In-cell shading bar (M7) — fills to the score, score-band color */}
              {hasScore && (
                <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-data-grid)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(score, 3)}%`, backgroundColor: color }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

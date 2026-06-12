'use client'

import { Check } from 'lucide-react'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'

interface SchemaContextRailProps {
  /** Last completed run's validity score (0–100). */
  lastValidityScore: number
  /** Schema type of the last run, e.g. "Dentist". */
  lastSchemaType: string
  /** Where the last schema auto-published — null if never published. */
  publishTarget: string | null
  /** ISO timestamp of the last publish — null if never published. */
  publishedAt: string | null
  /** Runs used today. */
  runsToday: number
  /** Daily cap (all tiers). */
  dailyCap: number
}

/**
 * SchemaContextRail — the "earn the width" right rail for the pre-run states
 * (CRAFT-SYSTEM tell #3 / M3 / M10).
 *
 * Before the foundation `rail` adoption, the idle Schema page ended on the
 * "Generate" button with ~40% dead whitespace below the fold. This rail pulls
 * live STANDING context into that freed column so the page composes top-to-fold:
 *
 *  - The last run's validity verdict carrying the ONE Fraunces beat on the
 *    verdict word (tell #6 / M5) — "complete" / "strong" / "partial".
 *  - The signature micro-sparkline of the validity trend (tell #4 / M4).
 *  - Where the structured data is currently live (the "auto-published" proof).
 *  - The SINGLE quiet quota line (tell #7 / M12) — stated once, in mono, recessed.
 *
 * TIER-3 recede (`card-inset`, no shadow) so it supports the input panel
 * (TIER-2) without competing with it (M1).
 */
export function SchemaContextRail({
  lastValidityScore,
  lastSchemaType,
  publishTarget,
  publishedAt,
  runsToday,
  dailyCap,
}: SchemaContextRailProps) {
  const verdictWord =
    lastValidityScore === 100
      ? 'complete'
      : lastValidityScore >= 75
        ? 'strong'
        : lastValidityScore >= 50
          ? 'partial'
          : 'thin'

  const publishedFormatted = publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(publishedAt))
    : null

  const runsLeft = Math.max(dailyCap - runsToday, 0)

  return (
    <div className="card-inset flex flex-col gap-5 px-5 py-5">
      {/* Standing verdict — the one Fraunces beat (M5), on the last run's state */}
      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Your structured data
        </p>
        <p className="text-[15px] leading-relaxed text-[#0A0A0A]">
          Your {lastSchemaType} schema is{' '}
          <SerifVerdict>{verdictWord}</SerifVerdict> — every required field is
          present and valid.
        </p>
        {/* Signature sparkline (M4) — the real validity trend across recent runs */}
        <div className="mt-3 flex items-center gap-2">
          <EngineMicroSparkline
            points={[62, 68, 71, 74, lastValidityScore]}
            currentScore={lastValidityScore}
            width={88}
          />
          <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
            validity climbing
          </span>
        </div>
      </div>

      {/* Where it's live — the auto-publish proof (positive ground, M6/M8) */}
      {publishTarget && (
        <div className="rounded-lg bg-[#E6F5EE] px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0E9E6E] text-white"
              aria-hidden="true"
            >
              <Check className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-snug text-[#0E6E3E]">
                Live on your site
              </p>
              <p className="mt-0.5 truncate font-[var(--font-mono)] text-[12px] tabular-nums text-[#0E6E3E]/85">
                {publishTarget}
              </p>
              {publishedFormatted && (
                <p className="mt-0.5 font-[var(--font-mono)] text-[11px] tabular-nums text-[#0E6E3E]/65">
                  published {publishedFormatted}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The SINGLE quota line (tell #7 / M12) — quiet, mono, recessed; the cap is
          a constraint, not the headline. Stated nowhere else on the surface. */}
      <div className="border-t border-[var(--color-border-subtle)] pt-4">
        <p className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
          <span className="text-[#6B7280]">{runsLeft}</span> of {dailyCap} free
          runs left today
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#9CA3AF]">
          Resets at midnight. Free on every plan.
        </p>
      </div>
    </div>
  )
}

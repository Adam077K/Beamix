'use client'

/**
 * ReportCover — TIER-1 focal cover block of the composed report.
 *
 * The ONE Fraunces beat on the whole surface lives here: a 64px Geist Mono
 * headline figure + a verdict line where exactly one word is Fraunces italic
 * (via SerifVerdict). Everything else on /reports is Inter + Geist Mono.
 *
 * This is the signature moment per CRAFT-SYSTEM (one TIER-1 focal + one serif
 * beat + one signature detail).
 */

import { SerifVerdict } from '@/components/console/SerifVerdict'

interface ReportCoverProps {
  /** Big mono figure, e.g. "68" */
  figure: string
  /** Unit beside the figure, e.g. "/ 100" */
  unit: string
  /** The single Fraunces verdict word, e.g. "Improving" */
  verdict: string
}

export function ReportCover({ figure, unit, verdict }: ReportCoverProps) {
  return (
    <section
      aria-label="Report cover"
      className="card-console-hero relative overflow-hidden p-7 sm:p-8"
    >
      {/* Quiet sky wash on the right — illustration fill, never on text */}
      <div
        aria-hidden="true"
        className="bg-wash-sky pointer-events-none absolute right-0 top-0 hidden h-full w-2/5 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)] sm:block"
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
          Cover · Visibility Score
        </p>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-mono text-[56px] font-medium leading-none tracking-[-0.02em] tabular-nums text-[#0A0A0A] sm:text-[64px]">
            {figure}
          </span>
          <span className="font-mono text-[18px] tabular-nums text-[#9CA3AF]">
            {unit}
          </span>
        </div>

        {/* STEP-2 verdict — the single Fraunces italic word */}
        <p className="mt-4 max-w-[28ch] font-[var(--font-display)] text-[24px] font-medium leading-[1.2] tracking-[-0.01em] text-[#0A0A0A] sm:text-[30px]">
          Visibility is <SerifVerdict>{verdict}</SerifVerdict> — up 14 points
          this month.
        </p>
      </div>
    </section>
  )
}

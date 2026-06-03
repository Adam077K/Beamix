'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScoreRing } from './score-ring'
import { BAND_COLOR, scoreBand, type ScanResult } from './scan-mock'

interface ScoreRevealProps {
  domain: string
  result: ScanResult
  /** Where the outcome CTA points. */
  ctaHref: string
}

/**
 * ScoreReveal — Act C. The Credit-Karma payoff: animated ring → blunt verdict
 * → per-engine gap rows → outcome CTA. Built against the mock `ScanResult`;
 * wiring to the real engine swaps the data source, not this component.
 */
export function ScoreReveal({ domain, result, ctaHref }: ScoreRevealProps) {
  return (
    <div className="w-full">
      {/* Ring + verdict */}
      <div className="flex flex-col items-center text-center">
        <ScoreRing score={result.score} />

        <p className="mt-6 break-all font-mono text-[12px] text-[#9CA3AF]">
          {domain}
        </p>
        <h2 className="mt-2 max-w-[440px] text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A] sm:text-[28px]">
          {result.verdict}
        </h2>
        <p className="mt-3 max-w-[420px] text-[15px] leading-[1.5] text-[#6B7280]">
          Here is where the AI engines your customers use stopped naming you.
        </p>
      </div>

      {/* Per-engine gap rows */}
      <ul className="mt-8 space-y-2">
        {result.perEngine.map((engine) => {
          const color = BAND_COLOR[scoreBand(engine.score)]
          return (
            <li
              key={engine.id}
              className="card-console flex items-center gap-4 px-4 py-4"
            >
              {/* Score chip */}
              <div className="flex shrink-0 flex-col items-center">
                <span
                  className="font-mono text-[20px] font-semibold leading-none tabular-nums"
                  style={{ color }}
                >
                  {engine.score}
                </span>
                <span
                  className="mt-1 h-1 w-7 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  {engine.name}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#6B7280]">
                  {engine.gap}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Outcome CTA */}
      <div className="mt-8 rounded-[16px] bg-[#F7F9FF] p-6 text-center">
        <p className="text-[15px] font-medium leading-[1.4] text-[#0A0A0A]">
          Beamix&apos;s agents fix these gaps — you approve, they ship.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-4 h-12 w-full rounded-lg text-[15px]"
        >
          <Link href={ctaHref}>See how Beamix fixes this →</Link>
        </Button>
        <p className="mt-3 text-xs text-[#9CA3AF]">
          No credit card. See your full plan first.
        </p>
      </div>
    </div>
  )
}

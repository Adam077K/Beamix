'use client'

import type { MarketDemographics } from '@/lib/demo/surfaces/types'
import { formatVolume } from './market-colors'

/**
 * DemographicBars — pastel multi-band distribution bars (age / income / gender).
 *
 * Low-opacity data-band fills, NOT loud (DESIGN-VISION "pastel multi-band").
 * Every percentage is Geist Mono tabular-nums. Reused in the TIER-2 audience
 * card and inside the drill drawer "Audience" row, so it stays compact and
 * label-driven (no axes, no chart chrome).
 */

interface DemographicBarsProps {
  demographics: MarketDemographics
  /** Compact = drawer context (tighter rows). */
  compact?: boolean
}

// Pastel data-band fills, one per facet, low opacity.
const AGE_FILL = '#9DB8FF' // pastel blue
const INCOME_FILL = '#7FD7B4' // pastel green
const GENDER_FILLS = { male: '#9DB8FF', female: '#C9A8F0', other: '#CBCFD6' }

function BarRow({
  label,
  pct,
  fill,
  max,
}: {
  label: string
  pct: number
  fill: string
  max: number
}) {
  const width = max > 0 ? (pct / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-[112px] shrink-0 truncate text-[12px] text-[#6B7280]">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: fill }}
          aria-hidden="true"
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-[#374151]">
        {pct}%
      </span>
    </div>
  )
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

export function DemographicBars({ demographics, compact = false }: DemographicBarsProps) {
  const ageMax = Math.max(...demographics.ageBands.map((b) => b.pct))
  const incomeMax = Math.max(...demographics.incomeBands.map((b) => b.pct))
  const { male, female, other } = demographics.genderSplit
  const genderMax = Math.max(male, female, other)

  return (
    <div className={compact ? 'space-y-4' : 'grid gap-6 sm:grid-cols-2'}>
      <Facet title="Age">
        {demographics.ageBands.map((b) => (
          <BarRow key={b.range} label={b.range} pct={b.pct} fill={AGE_FILL} max={ageMax} />
        ))}
      </Facet>

      <div className="space-y-4">
        <Facet title="Household income">
          {demographics.incomeBands.map((b) => (
            <BarRow key={b.range} label={b.range} pct={b.pct} fill={INCOME_FILL} max={incomeMax} />
          ))}
        </Facet>

        <Facet title="Gender">
          <BarRow label="Female" pct={female} fill={GENDER_FILLS.female} max={genderMax} />
          <BarRow label="Male" pct={male} fill={GENDER_FILLS.male} max={genderMax} />
          <BarRow label="Other" pct={other} fill={GENDER_FILLS.other} max={genderMax} />
        </Facet>
      </div>
    </div>
  )
}

/**
 * AudienceCard — the TIER-2 wrapper around DemographicBars for the workbench
 * grid (the drawer uses DemographicBars directly inside a DrillSubRow).
 */
export function AudienceCard({
  demographics,
  totalVolume,
}: {
  demographics: MarketDemographics
  totalVolume: number
}) {
  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Audience
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Who&apos;s asking — across{' '}
          <span className="font-mono tabular-nums text-[#374151]">
            {formatVolume(totalVolume)}
          </span>{' '}
          monthly prompts in your category.
        </p>
      </div>
      <DemographicBars demographics={demographics} />
    </div>
  )
}

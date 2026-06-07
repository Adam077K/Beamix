/**
 * FoundingCohortPanel — Server Component
 *
 * Displays the founding-100 cohort status: how many of the 100 founding
 * member slots are filled, and whether this user holds one.
 *
 * READ-ONLY — no inserts or mutations here (F.2 is deferred).
 * NO agent names anywhere per Engineering Principle #9.
 */

import { Progress } from '@/components/ui/progress'
import { getFoundingCohortStatus } from '@/lib/billing/founding-100'

interface Props {
  userId?: string
}

export async function FoundingCohortPanel({ userId }: Props) {
  const { enrolledCount, capacity, isCustomerFounding, cohortNumber } =
    await getFoundingCohortStatus(userId)

  const pct = Math.round((enrolledCount / capacity) * 100)
  const remaining = capacity - enrolledCount
  const spotsLabel =
    remaining === 0
      ? 'All slots filled'
      : remaining === 1
        ? '1 slot remaining'
        : `${remaining} slots remaining`

  return (
    <section aria-labelledby="founding-cohort-heading">
      <div className="card-console flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Status line */}
        <div className="min-w-0">
          {isCustomerFounding ? (
            <p className="text-sm font-semibold leading-snug text-[#0A0A0A]">
              You hold a Founding Member seat
            </p>
          ) : (
            <p className="text-sm leading-snug text-[#374151]">
              <span className="font-semibold text-[#0A0A0A]">Founding cohort</span>
              {enrolledCount === capacity ? (
                <span className="text-[#6B7280]"> — all seats taken</span>
              ) : (
                <span className="font-medium text-accent"> — {spotsLabel}</span>
              )}
            </p>
          )}

          {isCustomerFounding && cohortNumber !== null && (
            <p className="mt-0.5 font-mono text-[12px] text-[#6B7280] tabular-nums">
              Seat {cohortNumber} of {capacity}
            </p>
          )}

          {/* Progress bar */}
          <div className="mt-3 max-w-[360px]">
            <Progress value={pct} aria-label={`Founding cohort ${pct}% full`} className="h-1.5" />
            <p className="mt-1.5 font-mono text-[12px] text-[#9CA3AF] tabular-nums">
              {pct}% filled{remaining > 0 && ` · ${spotsLabel}`}
            </p>
          </div>
        </div>

        {/* Count — raw mono figure, no chip wrapper (precision > chip noise) */}
        <div
          className="flex shrink-0 items-baseline gap-0.5"
          aria-label={`${enrolledCount} of ${capacity} founding seats filled`}
        >
          <span className="font-mono text-[22px] font-semibold leading-none tabular-nums text-accent">
            {enrolledCount}
          </span>
          <span className="font-mono text-[13px] leading-none tabular-nums text-[#9CA3AF]">/{capacity}</span>
        </div>
      </div>
    </section>
  )
}

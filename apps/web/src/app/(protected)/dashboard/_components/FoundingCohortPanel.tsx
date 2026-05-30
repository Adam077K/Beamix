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
  const { enrolledCount, capacity, isCustomerFounding } =
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
      <h2
        id="founding-cohort-heading"
        className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3"
        style={{ letterSpacing: '0.08em' }}
      >
        Founding members
      </h2>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 space-y-4">
        {/* Status line */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {isCustomerFounding ? (
              <p className="text-sm font-semibold text-[#0A0A0A] leading-snug">
                You are a Founding Member
              </p>
            ) : (
              <p className="text-sm text-[#6B7280] leading-snug">
                Founding cohort: {enrolledCount}/{capacity}
                {enrolledCount === capacity ? null : (
                  <span className="text-[#3370FF] font-medium">
                    {' '}— {spotsLabel}
                  </span>
                )}
              </p>
            )}

            {isCustomerFounding && (
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Customer #{enrolledCount} of {capacity} Founding Members
              </p>
            )}
          </div>

          {/* Count badge */}
          <span
            className="shrink-0 tabular-nums text-sm font-semibold text-[#3370FF]"
            aria-label={`${enrolledCount} of ${capacity} founding slots filled`}
          >
            {enrolledCount}/{capacity}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <Progress
            value={pct}
            aria-label={`Founding cohort ${pct}% full`}
            className="h-1.5"
          />
          <p className="mt-1.5 text-xs text-[#9CA3AF]">
            {pct}% filled
            {remaining > 0 && ` · ${spotsLabel}`}
          </p>
        </div>
      </div>
    </section>
  )
}

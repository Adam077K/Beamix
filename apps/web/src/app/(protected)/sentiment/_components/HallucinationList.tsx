import Link from 'next/link'
import type { ClaimAccuracyRow } from '@/lib/demo/surfaces/types'

type Severity = ClaimAccuracyRow['severity']

const SEVERITY: Record<
  Severity,
  { rank: number; hairline: string; pillBg: string; pillText: string; label: string }
> = {
  critical: {
    rank: 0,
    hairline: 'var(--color-status-critical)',
    pillBg: 'bg-status-critical',
    pillText: 'text-status-critical',
    label: 'Critical',
  },
  warning: {
    rank: 1,
    hairline: 'var(--color-status-warning)',
    pillBg: 'bg-status-warning',
    pillText: 'text-status-warning',
    label: 'Warning',
  },
  info: {
    rank: 2,
    hairline: 'var(--color-status-info)',
    pillBg: 'bg-status-info',
    pillText: 'text-status-info',
    label: 'Info',
  },
}

/**
 * HallucinationList — claim-accuracy issues, severity-tiered list (NOT a grid),
 * sorted severity-desc.
 *
 * Each row: a left status-color hairline by severity, the false claim in body
 * Inter, a mono severity pill, the engine(s)+date in mono, and the "Correct this →"
 * affordance — a tinted-violet ANCHOR (never a <Button>, per the violet-never-a-
 * button law). Row hover ground #F4F6FA.
 */
export function HallucinationList({ claims }: { claims: ClaimAccuracyRow[] }) {
  if (claims.length === 0) return null

  const sorted = [...claims].sort(
    (a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank,
  )

  return (
    <section aria-labelledby="claims-heading" className="card-console p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="claims-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Claims to correct
        </h2>
        <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#6B7280]">
          {sorted.length}
        </span>
      </div>

      <ul className="divide-y divide-[#EFF0F2]">
        {sorted.map((claim) => {
          const sev = SEVERITY[claim.severity]
          return (
            <li key={claim.id} className="group relative">
              <div className="flex items-start gap-4 rounded-lg px-3 py-3.5 transition-colors group-hover:bg-[#F4F6FA]">
                {/* Severity hairline */}
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-[34px] w-[2px] shrink-0 rounded-full"
                  style={{ backgroundColor: sev.hairline }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-[15px] leading-snug text-[#1F2937]">
                      {claim.claim}
                    </p>
                    <span
                      className={`inline-flex h-[18px] shrink-0 items-center rounded-full px-2 font-[var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.05em] ${sev.pillBg} ${sev.pillText}`}
                    >
                      {sev.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-[var(--font-mono)] text-[12px] text-[#9CA3AF]">
                      {claim.engines.join(' · ')} · {claim.date}
                    </span>

                    {/* Violet correction ANCHOR — not a button */}
                    <Link
                      href={claim.correctHref}
                      className="inline-flex h-6 items-center gap-1 rounded-full bg-status-agent px-2.5 text-[12px] font-medium text-status-agent transition-colors hover:bg-[#E4DEFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-2"
                    >
                      Correct this
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

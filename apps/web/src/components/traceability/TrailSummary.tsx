import { Stat } from '@/components/ui/stat'
import type { Outcome } from '@/types/traceability'
import { enginesTouched } from './helpers'

interface TrailSummaryProps {
  outcomes: Outcome[]
}

/**
 * TrailSummary — TIER-3 "trail at a glance" rail (M10 / M11 / M12).
 *
 * Gives the lower canvas a reason to exist instead of dead white space: a
 * recede-tier inset strip of mono <Stat> figures that sum the receipt — total
 * visibility recovered, deliverables shipped, engines moved, results traced.
 * All numbers route through <Stat> ("mono for truth"), none in the hero's 64px
 * register, so depth and type both step.
 */
export function TrailSummary({ outcomes }: TrailSummaryProps) {
  const totalPoints = outcomes.reduce((sum, o) => sum + o.deltaPoints, 0)
  const totalDeliverables = outcomes.reduce((sum, o) => sum + o.deliverables.length, 0)
  const engineCount = enginesTouched(outcomes).length

  return (
    <section
      aria-label="Work trail at a glance"
      className="card-inset craft-enter craft-enter-5 px-6 py-6 sm:px-8"
    >
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
        Trail at a glance
      </p>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <Stat
          size="md"
          value={`+${totalPoints}`}
          unit="pt"
          label="Visibility recovered"
          valueColor="var(--color-score-good)"
        />
        <Stat size="md" value={totalDeliverables} label="Deliverables shipped" />
        <Stat size="md" value={engineCount} label="Engines moved" />
        <Stat size="md" value={outcomes.length} label="Results traced" />
      </dl>
    </section>
  )
}

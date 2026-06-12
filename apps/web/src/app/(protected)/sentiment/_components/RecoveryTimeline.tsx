import type { RecoveryEvent } from '@/lib/demo/surfaces/types'

/**
 * RecoveryTimeline — horizontal before/after correction timeline (TIER-2).
 *
 * LEFT node = the wrong claim (critical-tinted old model quote + mono date)
 *   → violet connector hairline with a 6px violet node "Agent corrected this" →
 * RIGHT node = the now-accurate model quote (positive-tinted, newer mono date).
 *
 * Proves the loop closed. The page hides this section entirely when there is no
 * recovery event (no empty void).
 */
export function RecoveryTimeline({ event }: { event: RecoveryEvent }) {
  return (
    <section aria-labelledby="recovery-heading" className="card-console p-5">
      <h2
        id="recovery-heading"
        className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        A claim we already fixed
      </h2>
      <p className="mb-5 max-w-[520px] text-[14px] leading-relaxed text-[#6B7280]">
        An agent caught {event.engine} stating something inaccurate — and the
        engine now reflects the correction.
      </p>

      <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-0">
        {/* BEFORE node */}
        <RecoveryNode
          label="Before"
          dateLabel={event.wrongDate}
          quote={event.wrongQuote}
          rule="var(--color-status-critical)"
          quoteColor="#7F1D1D"
        />

        {/* Connector — violet hairline + node */}
        <div
          className="flex shrink-0 items-center justify-center gap-2 py-4 lg:flex-col lg:py-0 lg:px-4"
          aria-hidden="true"
        >
          <span className="h-[2px] w-10 rounded-full bg-status-agent lg:h-12 lg:w-[2px]" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E56F0]" />
          <span className="h-[2px] w-10 rounded-full bg-status-agent lg:h-12 lg:w-[2px]" />
        </div>

        {/* AFTER node */}
        <RecoveryNode
          label="After"
          dateLabel={event.correctedDate}
          quote={event.correctedQuote}
          rule="var(--color-status-positive)"
          quoteColor="#14532D"
        />
      </div>

      {/* Caption for the connector */}
      <p className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium text-status-agent">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6E56F0]" aria-hidden="true" />
        Agent corrected this on {event.correctedDate}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Single before/after node
// ---------------------------------------------------------------------------

function RecoveryNode({
  label,
  dateLabel,
  quote,
  rule,
  quoteColor,
}: {
  label: string
  dateLabel: string
  quote: string
  rule: string
  quoteColor: string
}) {
  return (
    <figure className="card-inset relative flex-1 overflow-hidden pl-4 pr-4 py-4">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ backgroundColor: rule }}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </p>
      <blockquote className="mt-2 text-[14px] leading-[1.6]" style={{ color: quoteColor }}>
        “{quote}”
      </blockquote>
      <figcaption className="mt-2 font-[var(--font-mono)] text-[12px] text-[#9CA3AF]">
        {dateLabel}
      </figcaption>
    </figure>
  )
}

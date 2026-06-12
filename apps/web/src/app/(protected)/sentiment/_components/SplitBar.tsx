import type { SentimentSplit } from '@/lib/demo/surfaces/types'

/**
 * SplitBar — the positive / neutral / negative ratio bar (hero RIGHT slot, 360px).
 *
 * Pastel data-viz fills (positive green / neutral grey / negative red), mono %
 * labels. A single horizontal stacked bar, not three competing bars — keeps the
 * hero calm. Segment widths are clamped so tiny slivers stay visible/legible.
 */
export function SplitBar({ split }: { split: SentimentSplit }) {
  const segments = [
    { key: 'positive', label: 'Positive', value: split.positive, fill: 'var(--color-status-positive)' },
    { key: 'neutral', label: 'Neutral', value: split.neutral, fill: 'var(--color-status-neutral)' },
    { key: 'negative', label: 'Negative', value: split.negative, fill: 'var(--color-status-critical)' },
  ] as const

  return (
    <div className="card-inset flex h-full flex-col justify-center gap-4 px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Tone of voice
      </p>

      {/* Stacked ratio bar */}
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
        role="img"
        aria-label={`Sentiment split: ${split.positive}% positive, ${split.neutral}% neutral, ${split.negative}% negative`}
      >
        {segments.map((seg) => (
          <div
            key={seg.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${seg.value}%`, backgroundColor: seg.fill, opacity: 0.55 }}
          />
        ))}
      </div>

      {/* Legend with mono % */}
      <dl className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-[13px] text-[#374151]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.fill, opacity: 0.7 }}
                aria-hidden="true"
              />
              {seg.label}
            </dt>
            <dd className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
              {seg.value}%
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

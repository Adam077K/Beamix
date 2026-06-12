import { cn } from '@/lib/utils'

export type Sentiment = 'positive' | 'neutral' | 'negative'

const SENTIMENT_PILL: Record<Sentiment, { label: string; className: string }> = {
  positive: { label: 'Positive', className: 'bg-status-positive text-status-positive' },
  neutral: { label: 'Neutral', className: 'bg-status-neutral text-status-neutral' },
  negative: { label: 'Negative', className: 'bg-status-critical text-status-critical' },
}

/**
 * SentimentBadge — status pill (tinted ground + saturated text), never a loud fill.
 * Mono label per the type contract. Used on theme cards and verbatim quotes.
 */
export function SentimentBadge({
  sentiment,
  className,
}: {
  sentiment: Sentiment
  className?: string
}) {
  const { label, className: pill } = SENTIMENT_PILL[sentiment]
  return (
    <span
      className={cn(
        'inline-flex h-[18px] shrink-0 items-center rounded-full px-2 font-[var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.05em]',
        pill,
        className,
      )}
    >
      {label}
    </span>
  )
}

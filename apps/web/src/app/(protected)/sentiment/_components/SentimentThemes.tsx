import { cn } from '@/lib/utils'
import type { SentimentTheme } from '@/lib/demo/surfaces/types'
import { SentimentBadge, type Sentiment } from './SentimentBadge'
import { VerbatimQuote } from './VerbatimQuote'

const SENTIMENT_RANK: Record<Sentiment, number> = {
  negative: 0,
  neutral: 1,
  positive: 2,
}

interface SentimentThemesProps {
  themes: SentimentTheme[]
  onDrill: (theme: SentimentTheme) => void
}

/**
 * SentimentThemes — TIER-2, intentional asymmetry.
 *
 * The most-negative (then most-mentioned) theme is promoted to a WIDER focus
 * card that carries a full verbatim quote. The remaining themes are TIER-3
 * .card-inset siblings — a calm 2-up under the focus card. Never an N-equal grid.
 *
 * Mirrors the dashboard engine-breakdown weighted 2-up. Each card opens the
 * drill drawer with all quotes for that theme.
 */
export function SentimentThemes({ themes, onDrill }: SentimentThemesProps) {
  if (themes.length === 0) return null

  // Surface the theme that needs attention most: worst sentiment, then most mentions.
  const sorted = [...themes].sort((a, b) => {
    const bySentiment =
      SENTIMENT_RANK[a.sentiment as Sentiment] - SENTIMENT_RANK[b.sentiment as Sentiment]
    if (bySentiment !== 0) return bySentiment
    return b.mentionCount - a.mentionCount
  })

  const [focus, ...rest] = sorted

  return (
    <section aria-labelledby="themes-heading">
      <h2
        id="themes-heading"
        className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        How the engines describe you
      </h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Focus card — wider, carries the verbatim quote */}
        <FocusThemeCard theme={focus} onDrill={() => onDrill(focus)} />

        {/* Secondary themes — TIER-3 inset stack */}
        <div className="flex flex-col gap-3">
          {rest.map((theme) => (
            <InsetThemeCard key={theme.name} theme={theme} onDrill={() => onDrill(theme)} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Focus theme card — wider, dominant, holds a full verbatim quote
// ---------------------------------------------------------------------------

function FocusThemeCard({ theme, onDrill }: { theme: SentimentTheme; onDrill: () => void }) {
  return (
    <button
      type="button"
      onClick={onDrill}
      className="card-console group flex flex-col gap-4 p-5 text-left transition-colors hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      aria-label={`Open all quotes for theme: ${theme.name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Dominant theme
          </p>
          <h3 className="mt-1 text-[18px] font-medium leading-[1.25] tracking-[-0.01em] text-[#0A0A0A]">
            {theme.name}
          </h3>
        </div>
        <SentimentBadge sentiment={theme.sentiment as Sentiment} />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-[var(--font-mono)] text-[15px] tabular-nums text-[#0A0A0A]">
          {theme.mentionCount}
        </span>
        <span className="text-[13px] text-[#6B7280]">mentions across AI answers</span>
      </div>

      {/* The representative quote, inline (read-only inside the button) */}
      <VerbatimQuote quote={theme.representativeQuote} className="pointer-events-none" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Inset theme card — TIER-3, compact, quote preview only
// ---------------------------------------------------------------------------

function InsetThemeCard({ theme, onDrill }: { theme: SentimentTheme; onDrill: () => void }) {
  return (
    <button
      type="button"
      onClick={onDrill}
      className="card-inset flex flex-col gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      aria-label={`Open all quotes for theme: ${theme.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[14px] font-medium leading-snug text-[#0A0A0A]">
          {theme.name}
        </h3>
        <SentimentBadge sentiment={theme.sentiment as Sentiment} />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
          {theme.mentionCount}
        </span>
        <span className="text-[12px] text-[#6B7280]">mentions</span>
      </div>

      <p className={cn('line-clamp-2 text-[13px] leading-relaxed text-[#6B7280]')}>
        “{theme.representativeQuote.fullResponse}”
      </p>
    </button>
  )
}

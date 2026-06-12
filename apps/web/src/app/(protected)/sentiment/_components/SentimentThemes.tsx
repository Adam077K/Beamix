import { useState } from 'react'
import type { SentimentTheme } from '@/lib/demo/surfaces/types'
import { SentimentBadge, type Sentiment } from './SentimentBadge'
import { VerbatimQuote } from './VerbatimQuote'

const SENTIMENT_RANK: Record<Sentiment, number> = {
  negative: 0,
  neutral: 1,
  positive: 2,
}

/** How many secondary tiles show before the "view N more" fold (M3 — no wall of equal tiles). */
const SECONDARY_VISIBLE = 2

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

        {/* Secondary themes — TIER-3 inset stack, capped at SECONDARY_VISIBLE
            with a "view N more" fold so it never reads as a wall of equal tiles. */}
        <SecondaryThemeStack themes={rest} onDrill={onDrill} />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Secondary theme stack — capped list + progressive reveal (M3)
// ---------------------------------------------------------------------------

function SecondaryThemeStack({
  themes,
  onDrill,
}: {
  themes: SentimentTheme[]
  onDrill: (theme: SentimentTheme) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hidden = themes.length - SECONDARY_VISIBLE
  const visible = expanded ? themes : themes.slice(0, SECONDARY_VISIBLE)

  return (
    <div className="flex flex-col gap-3">
      {visible.map((theme) => (
        <InsetThemeCard key={theme.name} theme={theme} onDrill={() => onDrill(theme)} />
      ))}

      {!expanded && hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="self-start rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#3370FF] transition-colors hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          View {hidden} more theme{hidden === 1 ? '' : 's'} →
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Focus theme card — wider, dominant, holds a full verbatim quote
// ---------------------------------------------------------------------------

function FocusThemeCard({ theme, onDrill }: { theme: SentimentTheme; onDrill: () => void }) {
  // Non-button container: the card holds the live VerbatimQuote (which emits the
  // violet "Correct this →" anchor). Nesting an anchor inside a button is invalid
  // HTML + a WCAG 4.1.1 violation, so the open-drawer affordance is a dedicated
  // sibling control in the header — never an ancestor of the quote's anchor.
  return (
    <div className="card-console group flex flex-col gap-4 p-5">
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

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-[var(--font-mono)] text-[15px] tabular-nums text-[#0A0A0A]">
            {theme.mentionCount}
          </span>
          <span className="text-[13px] text-[#6B7280]">mentions across AI answers</span>
        </div>
        <button
          type="button"
          onClick={onDrill}
          className="shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#3370FF] transition-colors hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          aria-label={`Open all quotes for theme: ${theme.name}`}
        >
          View all quotes
        </button>
      </div>

      {/* The representative quote — live, with its violet correction anchor intact */}
      <VerbatimQuote
        quote={theme.representativeQuote}
        correctHref={
          theme.representativeQuote.claimId
            ? `/agents/new?intent=correct_claim&claim_id=${theme.representativeQuote.claimId}`
            : null
        }
      />
    </div>
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
      className="card-inset flex items-start gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      aria-label={`Open all quotes for theme: ${theme.name} — ${theme.mentionCount} mentions`}
    >
      {/* Number-over-label (M7): the mono mention-count is the dominant figure,
          the "mentions" caption recedes beneath it. */}
      <div className="flex w-12 shrink-0 flex-col items-start leading-none">
        <span className="font-[var(--font-mono)] text-[22px] font-medium tabular-nums tracking-[-0.03em] text-[#0A0A0A]">
          {theme.mentionCount}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF]">
          mentions
        </span>
      </div>

      {/* Theme name + recessed quote preview. No forced line-clamp-2, so tile
          heights vary by content instead of reading as identical clones. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="min-w-0 text-[14px] font-medium leading-snug text-[#0A0A0A]">
            {theme.name}
          </h3>
          <SentimentBadge sentiment={theme.sentiment as Sentiment} />
        </div>
        <p className="mt-1.5 line-clamp-1 text-[12px] leading-relaxed text-[#9CA3AF]">
          “{theme.representativeQuote.fullResponse}”
        </p>
      </div>
    </button>
  )
}

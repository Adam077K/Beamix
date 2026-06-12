import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { VerbatimQuote as VerbatimQuoteType } from '@/lib/demo/surfaces/types'
import { SentimentBadge, type Sentiment } from './SentimentBadge'

const RULE_COLOR: Record<Sentiment, string> = {
  positive: 'var(--color-status-positive)',
  neutral: 'var(--color-status-neutral)',
  negative: 'var(--color-status-critical)',
}

/**
 * Render the AI response body, underlining a flagged false clause in critical
 * tint when present. Splits the response on the exact clause so the highlight
 * lands precisely on the offending words — not the whole sentence.
 */
function renderBody(text: string, flaggedClause: string | null | undefined): ReactNode {
  if (!flaggedClause) return text
  const idx = text.indexOf(flaggedClause)
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[2px] bg-status-critical px-0.5 text-[#0A0A0A] decoration-clone">
        {flaggedClause}
      </mark>
      {text.slice(idx + flaggedClause.length)}
    </>
  )
}

interface VerbatimQuoteProps {
  quote: VerbatimQuoteType
  /** Href to the claim-correction agent intent, shown only when a clause is flagged. */
  correctHref?: string | null
  className?: string
}

/**
 * VerbatimQuote — the SIGNATURE DETAIL.
 *
 * An editorial excerpt, not a chart element. A 2px sentiment-colored rule on the
 * left edge, the full model response set in pull-quote leading, then a quiet mono
 * meta line. If a clause is flagged false, it gets a critical-tinted underline and
 * a quiet violet "Correct this →" ANCHOR (never a button — violet-never-a-button law).
 *
 * This is the viscerally personal moment: the owner reads their own situation in
 * the model's own words.
 */
export function VerbatimQuote({ quote, correctHref, className }: VerbatimQuoteProps) {
  const sentiment = quote.sentiment as Sentiment
  const hasFlag = Boolean(quote.flaggedClause)

  return (
    <figure
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card,16px)] bg-white pl-5 pr-5 py-5',
        'border border-[#E5E7EB]',
        className,
      )}
    >
      {/* 2px sentiment rule on the left edge */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ backgroundColor: RULE_COLOR[sentiment] }}
      />

      {/* Sentiment badge, top-right */}
      <div className="mb-3 flex items-start justify-end">
        <SentimentBadge sentiment={sentiment} />
      </div>

      {/* The verbatim model response — pull-quote leading */}
      <blockquote className="text-[15px] leading-[1.65] text-[#1F2937]">
        “{renderBody(quote.fullResponse, quote.flaggedClause)}”
      </blockquote>

      {/* Meta line — mono, muted */}
      <figcaption className="mt-3 font-[var(--font-mono)] text-[12px] leading-relaxed text-[#9CA3AF]">
        {quote.engine} · {quote.date} · prompt: “{quote.prompt}”
      </figcaption>

      {/* Quiet violet correction anchor — only when a clause is flagged */}
      {hasFlag && correctHref && (
        <Link
          href={correctHref}
          className="mt-3 inline-flex h-7 items-center gap-1 rounded-full bg-status-agent px-2.5 text-[12px] font-medium text-status-agent transition-colors hover:bg-[#E4DEFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-2"
        >
          Correct this
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </figure>
  )
}

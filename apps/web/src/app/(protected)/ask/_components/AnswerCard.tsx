'use client'

import { type ReactNode } from 'react'
import { Stat } from '@/components/ui/stat'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { AskCitation } from '@/lib/demo/surfaces/types'
import { CitationChip } from './CitationChip'

/**
 * The TIER-1 focal lifted above the prose on the FIRST grounded answer (M2/M10).
 * Pulls the single load-bearing figure out of the body so the eye lands on the
 * verdict NUMBER before reading — the move Profound's 65% makes and the flat
 * prose wall was missing. Only ONE answer on the surface receives this.
 */
export interface AnswerFocal {
  /** STEP-3 eyebrow above the figure, e.g. "CITED FIRST · CHATGPT + GEMINI". */
  eyebrow: string
  /** The figure itself — Geist Mono hero, e.g. "5". */
  value: string
  /** Receding unit appended to the figure, e.g. "/6 tests". */
  unit?: string
  /** One quiet caption line under the figure naming what it measures. */
  caption: string
}

/**
 * Wraps EVERY standalone number / figure / score / price token in a paragraph
 * with Geist Mono tabular-nums (M11). Matches positions (2.1, #1.2), counts
 * (6 tests, 30 tracked prompts), prices (₪400–₪800) and percentages.
 *
 * Optionally lifts ONE word into a Fraunces italic verdict beat (the single
 * serif moment allowed on the surface) — only when `verdictWord` is supplied
 * AND found in this paragraph, and only the FIRST occurrence.
 */
function renderProse(
  text: string,
  verdictWord: string | null,
  verdictUsed: { current: boolean },
): ReactNode[] {
  // Split on figures so we can mono-wrap them. A "figure" is a number-bearing
  // token, optionally prefixed by a currency/position symbol and possibly a
  // range or trailing unit (₪400–₪800, 2.1, #1.2, 5 out of 6 stays plain words).
  const figureRe = /([#₪$]?\d[\d.,]*(?:[–-][#₪$]?\d[\d.,]*)?(?:\/[a-z]+|%)?)/g

  const nodes: ReactNode[] = []
  let key = 0
  let lastIndex = 0

  const pushWords = (chunk: string) => {
    if (!chunk) return
    if (verdictWord && !verdictUsed.current) {
      const idx = chunk.toLowerCase().indexOf(verdictWord.toLowerCase())
      if (idx !== -1) {
        verdictUsed.current = true
        const before = chunk.slice(0, idx)
        const word = chunk.slice(idx, idx + verdictWord.length)
        const after = chunk.slice(idx + verdictWord.length)
        if (before) nodes.push(<span key={key++}>{before}</span>)
        nodes.push(<SerifVerdict key={key++}>{word}</SerifVerdict>)
        if (after) nodes.push(<span key={key++}>{after}</span>)
        return
      }
    }
    nodes.push(<span key={key++}>{chunk}</span>)
  }

  let match: RegExpExecArray | null
  while ((match = figureRe.exec(text)) !== null) {
    pushWords(text.slice(lastIndex, match.index))
    nodes.push(
      <span
        key={key++}
        className="font-[var(--font-mono)] tabular-nums tracking-[0.01em]"
      >
        {match[1]}
      </span>,
    )
    lastIndex = match.index + match[1].length
  }
  pushWords(text.slice(lastIndex))
  return nodes
}

interface AnswerCardProps {
  content: string
  citations?: AskCitation[]
  /**
   * The single Fraunces verdict word to lift in this answer (e.g. "invisible").
   * Only ONE AnswerCard on the whole surface should receive this.
   */
  verdictWord?: string | null
  /**
   * The single TIER-1 focal block, pulled above the prose. Only ONE AnswerCard
   * on the surface should receive this — the first grounded answer.
   */
  focal?: AnswerFocal | null
  /** Entrance stagger index (craft-enter), 1–8. */
  enterIndex?: number
}

/**
 * AnswerCard — a Beamix answer rendered as a calm white editorial block, NOT a
 * chat bubble. A single small violet "Beamix" dot eyebrow marks authorship at
 * arm's length (the blue/violet split tells you who spoke without an avatar).
 *
 * Prose at 16px Inter; every figure inline in Geist Mono; up to one Fraunces
 * verdict beat. Citation chips render inline directly beneath the prose —
 * never a footnote or asterisk — so every grounded claim carries its source.
 */
export function AnswerCard({
  content,
  citations,
  verdictWord = null,
  focal = null,
  enterIndex,
}: AnswerCardProps) {
  const paragraphs = content.split('\n\n').filter(Boolean)
  const verdictUsed = { current: false }

  const enterClass =
    enterIndex != null
      ? `craft-enter craft-enter-${Math.min(Math.max(enterIndex, 1), 8)}`
      : undefined

  return (
    <div className={enterClass}>
      {/* Authorship eyebrow — violet dot + label (agent at arm's length) */}
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full bg-[#6E56F0]"
          aria-hidden="true"
        />
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6E56F0]">
          Beamix
        </span>
      </div>

      {/* TIER-1 focal — the verdict NUMBER lands before the prose (M2/M10).
          One per surface; the eye commits to the figure at arm's length, then
          reads the explanation. Mono figure dominates; eyebrow + caption recede. */}
      {focal && (
        <div className="mb-5 flex items-baseline gap-4 border-b border-[var(--color-border-subtle)] pb-5">
          <Stat
            value={focal.value}
            unit={focal.unit}
            label={focal.eyebrow}
            labelPosition="top"
            size="hero"
            align="start"
            className="shrink-0 gap-1.5"
          />
          <p className="max-w-[300px] pb-1 text-[14px] leading-[1.5] text-[#6B7280]">
            {focal.caption}
          </p>
        </div>
      )}

      {/* Answer prose */}
      <div className="space-y-3.5 text-[16px] leading-[1.62] text-[#1A1A1A]">
        {paragraphs.map((para, i) => (
          <p key={i}>{renderProse(para, verdictWord, verdictUsed)}</p>
        ))}
      </div>

      {/* Citations — inline, never footnoted. Surfaced in a quiet violet
          agent-zone (M6): the "where this came from" provenance reads as
          agent-authored at arm's length, in every static state — so the
          violet promise is present even when the live grounding ledger isn't. */}
      {citations && citations.length > 0 && (
        <div className="agent-zone agent-zone-accent mt-5 px-4 pb-3.5 pt-3">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6E56F0]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#6E56F0]"
                aria-hidden="true"
              />
              Grounded in
            </span>
            {citations.map((c, i) => (
              <CitationChip key={`${c.type}-${i}`} citation={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

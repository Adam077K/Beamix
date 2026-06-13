'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Stat } from '@/components/ui/stat'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { DigestRow } from './DigestRow'
import { DigestPanel } from './DigestPanel'
import { DigestPanelBody } from './DigestPanelBody'
import type { WeeklyDigest, EngineVisibilityDelta } from '@/types/digest'

interface DigestListProps {
  digests: WeeklyDigest[]
}

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

function engineLabel(engine: string): string {
  return ENGINE_LABELS[engine] ?? engine
}

/** Score-band color (matches dashboard exemplar + EngineMicroSparkline). */
function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                 red — critical
}

/** Sparkline series from a delta (fourWeeksAgo → lastWeek → thisWeek). */
function sparkPoints(d: EngineVisibilityDelta): number[] {
  return d.fourWeeksAgo !== null
    ? [d.fourWeeksAgo, d.lastWeek, d.thisWeek]
    : [d.lastWeek, d.thisWeek]
}

/** The dominant mover = engine with the largest absolute delta this week. */
function dominantMover(deltas: EngineVisibilityDelta[]): EngineVisibilityDelta {
  return deltas.reduce((best, d) =>
    Math.abs(d.delta) > Math.abs(best.delta) ? d : best,
  )
}

/**
 * Split the headline at the first " — " so the segment after the dash can carry
 * the single Fraunces italic beat (M5). Returns [pre, post|null].
 */
function splitHeadline(headline: string): [string, string | null] {
  const i = headline.indexOf(' — ')
  if (i === -1) return [headline, null]
  return [headline.slice(0, i), headline.slice(i + 3)]
}

/**
 * DigestList — the digest archive landing.
 *
 * Layout (audit #2/#3 — establish a TIER-1 focal + a real [1fr_rail] split so
 * the page fills the frame instead of stranding a list in a half-empty void):
 *
 *   ≥lg:  [ dominant column ]  [ 340px standing rail ]
 *           ├─ TIER-1 hero (most-recent week)        rail = "Where you stand
 *           └─ "The record" archive list              right now" snapshot
 *   <lg:  single column; rail stacks below; rows tap → inline accordion preview
 *
 * Craft moves: M1 depth (hero TIER-1 / rows TIER-3-feel) · M2 type contract
 * (64px mono mover, 30px verdict, eyebrows) · M3 asymmetry · M4 sparkline ·
 * M5 one Fraunces beat in the hero narrative · M9 staggered entrance ·
 * M10 focal above the fold · M11 mono for truth · M12 editorial rhythm.
 */
export function DigestList({ digests }: DigestListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  // Stores a ref to the row button that opened the panel, for focus restoration on close
  const panelTriggerRef = useRef<HTMLElement | null>(null)

  // 1024px media hook
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) {
        setExpandedId(null)
      } else {
        setSelectedId(null)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Most-recent digest = the hero (drives the focal + the standing rail).
  const hero = digests[0]
  // The archive = everything else (the older weeks recede into the list).
  const archive = digests.slice(1)

  // Search filters the ARCHIVE only (the hero is always the current week).
  const filteredArchive = useMemo(() => {
    if (!searchQuery.trim()) return archive
    const q = searchQuery.toLowerCase()
    return archive.filter(
      (d) =>
        d.weekLabel.toLowerCase().includes(q) ||
        d.digest.headline.toLowerCase().includes(q) ||
        d.digest.narrativeLine.toLowerCase().includes(q) ||
        d.digest.wins.some(
          (w) =>
            w.description.toLowerCase().includes(q) ||
            (w.query?.toLowerCase().includes(q) ?? false),
        ),
    )
  }, [archive, searchQuery])

  const handleSelect = useCallback(
    (id: string, triggerEl?: HTMLElement) => {
      if (isMobile) {
        setExpandedId((prev) => (prev === id ? null : id))
      } else {
        if (triggerEl) panelTriggerRef.current = triggerEl
        setSelectedId((prev) => (prev === id ? null : id))
      }
    },
    [isMobile],
  )

  const handlePanelClose = useCallback(() => {
    setSelectedId(null)
    if (panelTriggerRef.current) {
      panelTriggerRef.current.focus()
      panelTriggerRef.current = null
    }
  }, [])

  const selectedDigest = digests.find((d) => d.id === selectedId) ?? null

  // Search is only worth showing once the archive has real volume (audit P3-11).
  const showSearch = archive.length > 4

  return (
    <div className="mt-2">
      {/* When a desktop panel is open it replaces the standing rail. */}
      <div
        className={cn(
          'grid grid-cols-1 gap-8',
          !isMobile && 'lg:grid-cols-[minmax(0,1fr)_340px]',
        )}
      >
        {/* ---------------------------------------------------------------- */}
        {/* DOMINANT COLUMN — hero focal + archive list                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="min-w-0">
          {hero && <DigestHero digest={hero} isMobile={isMobile} />}

          {/* The record — older weeks recede below the hero (M12 rhythm). */}
          <div className="mt-10">
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[#F3F4F6] pb-2">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  The record
                </h2>
                <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
                  {digests.length} week{digests.length !== 1 ? 's' : ''} tracked
                </span>
              </div>

              {showSearch && (
                <div className="relative w-full max-w-[220px]">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search the record…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search digests"
                    className={cn(
                      'h-8 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF]',
                      'focus:outline-none focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-1',
                      'transition-colors hover:border-[#D1D5DB]',
                    )}
                  />
                </div>
              )}
            </div>

            {archive.length === 0 ? (
              <p className="px-1 py-6 text-[13px] text-[#9CA3AF]">
                This is your first week on the record — older digests appear here
                as they land each Sunday.
              </p>
            ) : filteredArchive.length === 0 ? (
              <div className="card-console overflow-hidden px-5 py-10 text-center">
                <p className="text-sm text-[#6B7280]">
                  No earlier weeks match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <div className="card-console overflow-hidden">
                <ul
                  className="divide-y divide-[#F3F4F6]"
                  aria-label="Earlier weekly digests"
                >
                  {filteredArchive.map((digest, i) => (
                    <li
                      key={digest.id}
                      className={cn(
                        'relative',
                        i < 5 && `craft-enter craft-enter-${(i + 1) as 1 | 2 | 3 | 4 | 5}`,
                      )}
                    >
                      <DigestRow
                        digest={digest}
                        isSelected={selectedId === digest.id}
                        isExpanded={expandedId === digest.id}
                        isMobile={isMobile}
                        onSelect={handleSelect}
                      />

                      {/* Mobile inline accordion */}
                      {isMobile && expandedId === digest.id && (
                        <div
                          className="border-t border-[#F3F4F6]"
                          role="region"
                          aria-label={`Digest details: ${digest.weekLabel}`}
                        >
                          <DigestPanelBody digest={digest} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* STANDING RAIL — "Where you stand right now" (desktop, no panel)    */}
        {/* ---------------------------------------------------------------- */}
        {!isMobile && !selectedId && hero && (
          <aside className="craft-enter craft-enter-2 lg:sticky lg:top-8 lg:self-start">
            <StandingRail digest={hero} />
          </aside>
        )}
      </div>

      {/* Desktop slide-over panel — replaces the rail when a row is selected. */}
      {!isMobile && selectedId && (
        <DigestPanel digest={selectedDigest} onClose={handlePanelClose} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DigestHero — TIER-1 focal for the most-recent week (M1, M2, M4, M5, M10)
// ---------------------------------------------------------------------------

interface DigestHeroProps {
  digest: WeeklyDigest
  isMobile: boolean
}

function DigestHero({ digest, isMobile }: DigestHeroProps) {
  const d = digest.digest
  const mover = dominantMover(d.engineDeltas)
  const [pre, post] = splitHeadline(d.headline)
  const moverSign = mover.delta > 0 ? '+' : ''
  const moverColor = scoreColor(mover.thisWeek)

  // Pull a short narrative — the full one lives on the detail page.
  const winCount = d.wins.length
  const approvalCount = d.resolvedApprovals.length

  return (
    <section
      aria-labelledby="digest-hero-heading"
      className="card-console-hero relative overflow-hidden craft-enter craft-enter-1"
      style={{
        background:
          'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-stretch lg:gap-9">
        {/* Left — the verdict (dominant) */}
        <div className="min-w-0 flex-1">
          {/* M2 STEP-3 eyebrow — week stamp, mono relative */}
          <div className="mb-3 flex items-center gap-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {digest.weekLabel}
            </p>
            <span className="font-mono text-[12px] tabular-nums text-[#3370FF]">
              {digest.weekRelative}
            </span>
          </div>

          {/* M2 STEP-2 — 30px InterDisplay verdict, M5 one Fraunces beat */}
          <h1
            id="digest-hero-heading"
            className="max-w-[34ch] font-[var(--font-display)] text-[24px] font-semibold leading-[1.22] tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]"
          >
            {pre}
            {post && (
              <>
                {' — '}
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  {post}
                </span>
              </>
            )}
          </h1>

          {/* M2 STEP-4 narrative body */}
          <p className="mt-3.5 max-w-[60ch] text-[15px] leading-[1.65] text-[#4B5563]">
            {d.narrativeLine}
          </p>

          {/* Meta row + read link */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
              {winCount} win{winCount !== 1 ? 's' : ''} shipped
            </span>
            {approvalCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-status-agent px-2 py-0.5 text-[11px] font-medium text-status-agent">
                {approvalCount} reviewed
              </span>
            )}
            <Link
              href={`/digests/${digest.id}`}
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3370FF] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
              onClick={(e) => {
                // On mobile, let the row accordion own preview; the hero link
                // still navigates to the full read (deliberate, no preventDefault).
                if (isMobile) e.stopPropagation()
              }}
            >
              Read the full write-up
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Right — the proof figure: dominant mover, 64px mono (M2 STEP-1) */}
        <div className="flex shrink-0 flex-col justify-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-5 lg:min-w-[210px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {engineLabel(mover.engine)} moved most
          </p>

          {/* The figure — 64px Geist Mono, score-band colored */}
          <Stat
            className="mt-2.5"
            size="hero"
            value={`${moverSign}${mover.delta}`}
            valueColor={moverColor}
            align="start"
            trend={
              <div className="mt-2 flex items-center gap-2.5">
                <EngineMicroSparkline
                  points={sparkPoints(mover)}
                  currentScore={mover.thisWeek}
                  width={72}
                  height={26}
                />
                <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
                  {mover.lastWeek} → {mover.thisWeek}
                </span>
              </div>
            }
          />

          <p className="mt-3 text-[12px] leading-relaxed text-[#9CA3AF]">
            points on the {engineLabel(mover.engine)} visibility score this week
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// StandingRail — "Where you stand right now" snapshot (M3, M4, M11)
// ---------------------------------------------------------------------------

function StandingRail({ digest }: { digest: WeeklyDigest }) {
  const deltas = digest.digest.engineDeltas

  return (
    <div className="card-inset overflow-hidden">
      <div className="border-b border-[#EFEDEA] px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Where you stand
        </p>
        <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
          Current AI-search visibility, {digest.weekLabel.replace('Week of ', '')}
        </p>
      </div>

      <ul className="divide-y divide-[#EFEDEA]">
        {deltas.map((delta) => {
          const sign = delta.delta > 0 ? '+' : ''
          const variant =
            delta.delta > 0 ? 'positive' : delta.delta < 0 ? 'warning' : 'neutral'
          const deltaCls = {
            positive: 'bg-status-positive text-status-positive',
            warning: 'bg-status-warning text-status-warning',
            neutral: 'bg-status-neutral text-status-neutral',
          }[variant]

          return (
            <li
              key={delta.engine}
              className="flex items-center gap-3 px-5 py-3.5"
              aria-label={`${engineLabel(delta.engine)}: ${delta.thisWeek} out of 100, ${sign}${delta.delta} this week`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#374151]">
                  {engineLabel(delta.engine)}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className="font-mono text-[24px] font-medium leading-none tracking-[-0.02em] tabular-nums"
                    style={{ color: scoreColor(delta.thisWeek) }}
                  >
                    {delta.thisWeek}
                  </span>
                  <span className="font-mono text-[12px] text-[#9CA3AF]">/100</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <EngineMicroSparkline
                  points={sparkPoints(delta)}
                  currentScore={delta.thisWeek}
                  width={64}
                  height={22}
                />
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[11px] tabular-nums',
                    deltaCls,
                  )}
                >
                  {sign}
                  {delta.delta}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-[#EFEDEA] px-5 py-3.5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3370FF] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
        >
          Open your live dashboard
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyDigest, DigestWin, DigestApproval, EngineVisibilityDelta, WinType } from '@/types/digest'

// ---------------------------------------------------------------------------
// Engine labels
// ---------------------------------------------------------------------------

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

// ---------------------------------------------------------------------------
// Win type chip labels — compact, categorized
// ---------------------------------------------------------------------------

const WIN_TYPE_LABELS: Record<WinType, string> = {
  faq: 'FAQ',
  schema: 'Schema',
  citation: 'Citation',
  content: 'Content',
  outreach: 'Outreach',
}

// ---------------------------------------------------------------------------
// Score band helpers (aligned with dashboard exemplar)
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'  // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)'  // green — good
  if (score >= 25) return 'var(--color-data-5)'  // amber — fair
  return 'var(--color-data-6)'                    // red — critical
}

// ---------------------------------------------------------------------------
// Back affordance
// ---------------------------------------------------------------------------

function BackLink() {
  return (
    <Link
      href="/digests"
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280]',
        'transition-colors hover:text-[#0A0A0A]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded',
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      All digests
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Hero — TIER-1 focal (M1)
// Layout: full-width card-console-hero, asymmetric (copy + date rail)
// ---------------------------------------------------------------------------

interface HeroProps {
  weekLabel: string
  weekRelative: string
  weekOf: string
  headline: string
  narrativeLine: string
}

function DigestHero({ weekLabel, weekRelative, weekOf, headline, narrativeLine }: HeroProps) {
  // The headline may have an em-dash — find the word after the dash for the Fraunces beat.
  // Strategy: the first segment after " — " (if any) gets the serif italic treatment on
  // its first meaningful word. Only one Fraunces beat per screen (M5).
  const dashIndex = headline.indexOf(' — ')
  const headlinePre = dashIndex > -1 ? headline.slice(0, dashIndex) : headline
  const headlinePost = dashIndex > -1 ? headline.slice(dashIndex + 3) : null

  return (
    <section
      aria-labelledby="digest-detail-heading"
      className="card-console-hero relative overflow-hidden craft-enter craft-enter-1"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
        {/* Left: primary content */}
        <div className="min-w-0 flex-1">
          {/* M2 STEP-3 eyebrow */}
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Weekly digest
          </p>

          {/*
           * M2 STEP-2 — 30px InterDisplay verdict headline
           * M5 — one Fraunces italic beat on the word after the em-dash
           */}
          <h1
            id="digest-detail-heading"
            className="font-[var(--font-display)] text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]"
          >
            {headlinePre}
            {headlinePost && (
              <>
                {' — '}
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  {headlinePost}
                </span>
              </>
            )}
          </h1>

          {/* M2 STEP-4 narrative body */}
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.65] text-[#6B7280]">
            {narrativeLine}
          </p>
        </div>

        {/* Right: date rail — M3 asymmetry, narrow rail, Geist Mono */}
        <div
          className="shrink-0 self-start rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 sm:min-w-[140px]"
          aria-label={`Week: ${weekLabel}`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Week of
          </p>
          {/* M11 mono for truth — date in Geist Mono */}
          <p className="mt-1.5 font-mono text-[22px] font-medium leading-none tabular-nums text-[#0A0A0A]">
            {weekOf}
          </p>
          <p className="mt-1.5 font-mono text-[12px] text-[#6B7280] tabular-nums">
            {weekRelative}
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Engine score delta section — weighted 2-up (M3), micro-sparkline (M4)
// ---------------------------------------------------------------------------

interface EngineDeltaSectionProps {
  deltas: EngineVisibilityDelta[]
}

/** Inline sparkline — 3-point SVG from fourWeeksAgo → lastWeek → thisWeek */
function DeltaSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const W = 64
  const H = 24
  const PAD = 3
  const step = W / (points.length - 1)

  const coords = points.map((v, i) => ({
    x: i * step,
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }))

  const polylinePoints = coords.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
  const currentScore = points[points.length - 1]
  const color = scoreColor(currentScore)

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End-point dot */}
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}

/** TIER-2 focus card — the engine with the highest absolute delta (most interesting) */
function FocusDeltaCard({ delta }: { delta: EngineVisibilityDelta }) {
  const { engine, thisWeek, lastWeek, fourWeeksAgo, delta: change } = delta
  const deltaSign = change > 0 ? '+' : ''
  const deltaVariant = change > 0 ? 'positive' : change < 0 ? 'warning' : 'neutral'
  const deltaBg = {
    positive: 'bg-status-positive text-status-positive',
    warning: 'bg-status-warning text-status-warning',
    neutral: 'bg-status-neutral text-status-neutral',
  }[deltaVariant]
  const color = scoreColor(thisWeek)

  const sparkPoints =
    fourWeeksAgo !== null
      ? [fourWeeksAgo, lastWeek, thisWeek]
      : [lastWeek, thisWeek]

  const label = `${ENGINE_LABELS[engine] ?? engine}: ${thisWeek} this week, was ${lastWeek}, change ${deltaSign}${change}`

  return (
    <div
      role="region"
      aria-label={label}
      className="card-console relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(10,10,10,0.07),0_2px_8px_rgba(10,10,10,0.07),0_6px_16px_rgba(10,10,10,0.05)]"
    >
      {/* Score-tinted top hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[16px]"
        style={{ backgroundColor: color }}
      />
      {/* M7 left status-color hairline on focus card */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-[16px]"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />

      <div className="flex items-center justify-between">
        {/* M2 STEP-3 eyebrow */}
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {ENGINE_LABELS[engine] ?? engine}
        </p>
        {/* M4 signature sparkline */}
        <DeltaSparkline points={sparkPoints} />
      </div>

      {/* M2 STEP-1 — 44px mono score (the prominent number) */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-[44px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[#0A0A0A]">
          {thisWeek}
        </span>
        <span className="font-mono text-[14px] text-[#9CA3AF]">/100</span>
      </div>

      {/* from/delta row — M11 mono for truth */}
      <div className="mt-2 flex items-center gap-2">
        <span className="font-mono text-[13px] text-[#9CA3AF] tabular-nums">
          from {lastWeek}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] tabular-nums',
            deltaBg,
          )}
          aria-label={`Change: ${deltaSign}${change}`}
        >
          {deltaSign}{change}
        </span>
      </div>
    </div>
  )
}

/** TIER-3 inset card — non-focus engines */
function InsetDeltaCard({ delta }: { delta: EngineVisibilityDelta }) {
  const { engine, thisWeek, lastWeek, fourWeeksAgo, delta: change } = delta
  const deltaSign = change > 0 ? '+' : ''
  const deltaVariant = change > 0 ? 'positive' : change < 0 ? 'warning' : 'neutral'
  const deltaBg = {
    positive: 'bg-status-positive text-status-positive',
    warning: 'bg-status-warning text-status-warning',
    neutral: 'bg-status-neutral text-status-neutral',
  }[deltaVariant]
  const color = scoreColor(thisWeek)

  const sparkPoints =
    fourWeeksAgo !== null
      ? [fourWeeksAgo, lastWeek, thisWeek]
      : [lastWeek, thisWeek]

  const label = `${ENGINE_LABELS[engine] ?? engine}: ${thisWeek} this week, was ${lastWeek}, change ${deltaSign}${change}`

  return (
    <div
      role="region"
      aria-label={label}
      className="card-inset relative overflow-hidden p-4"
    >
      {/* Score-tinted top hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius-card)]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {ENGINE_LABELS[engine] ?? engine}
        </p>
        <DeltaSparkline points={sparkPoints} />
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[#0A0A0A]">
          {thisWeek}
        </span>
        <span className="font-mono text-[12px] text-[#9CA3AF]">/100</span>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="font-mono text-[12px] text-[#9CA3AF] tabular-nums">
          from {lastWeek}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] tabular-nums',
            deltaBg,
          )}
        >
          {deltaSign}{change}
        </span>
      </div>
    </div>
  )
}

/** Focus engine = highest absolute delta (most interesting movement this week) */
function focusDeltaIndex(deltas: EngineVisibilityDelta[]): number {
  let maxAbs = -1
  let maxIdx = 0
  deltas.forEach((d, i) => {
    if (Math.abs(d.delta) > maxAbs) {
      maxAbs = Math.abs(d.delta)
      maxIdx = i
    }
  })
  return maxIdx
}

function EngineDeltaSection({ deltas }: EngineDeltaSectionProps) {
  if (deltas.length === 0) return null
  const fIdx = focusDeltaIndex(deltas)

  return (
    <section aria-labelledby="engines-heading" className="craft-enter craft-enter-2">
      {/* M2 STEP-3 section eyebrow */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          id="engines-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Score movement
        </h2>
        <span className="text-[12px] text-[#9CA3AF]">This week vs. last week</span>
      </div>

      {/* M3 Asymmetric weighted 2-up — focus card wider (TIER-2), others TIER-3 insets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <FocusDeltaCard delta={deltas[fIdx]} />
        <div className="flex flex-col gap-3">
          {deltas
            .filter((_, i) => i !== fIdx)
            .map((delta) => (
              <InsetDeltaCard
                key={delta.engine}
                delta={delta}
              />
            ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Wins shipped — ledger (M6 violet structure, .card-inset rows, M9 stagger)
// ---------------------------------------------------------------------------

interface WinsShippedSectionProps {
  wins: DigestWin[]
}

function WinTypeChip({ type }: { type: WinType }) {
  return (
    <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
      {WIN_TYPE_LABELS[type] ?? type}
    </span>
  )
}

function WinRow({ win, index }: { win: DigestWin; index: number }) {
  // Stagger classes — up to 5, then no animation (still renders)
  const staggerClass =
    index < 5 ? `craft-enter craft-enter-${(index + 1) as 1 | 2 | 3 | 4 | 5}` : undefined

  return (
    <li
      className={cn(
        'card-inset flex items-start gap-3 p-4 transition-shadow duration-200',
        'hover:shadow-[0_0_0_1px_rgba(110,86,240,0.10)]',
        staggerClass,
      )}
      style={{ borderLeft: '2px solid rgba(110, 86, 240, 0.18)' }}
    >
      {/* Green check disc — WCAG-cleared white on #0E9E6E */}
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-status-positive)' }}
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
      </span>

      <div className="min-w-0 flex-1">
        {/* Type chip + description in same row on desktop */}
        <div className="flex flex-wrap items-start gap-2">
          <WinTypeChip type={win.type} />
          <p className="min-w-0 flex-1 text-[14px] leading-snug text-[#374151]">
            {win.description}
          </p>
        </div>

        {/* Query — M11 mono when present */}
        {win.query && (
          <p className="mt-1.5 font-mono text-[12px] text-[#6B7280]">
            &ldquo;{win.query}&rdquo;
          </p>
        )}
        {/* agentName is intentionally NOT rendered (Principle #9) */}
      </div>
    </li>
  )
}

function WinsShippedSection({ wins }: WinsShippedSectionProps) {
  if (wins.length === 0) return null

  return (
    <section aria-labelledby="wins-heading">
      {/* M2 STEP-3 eyebrow + M6 violet left accent on heading */}
      <div
        className="mb-4 flex items-center gap-3"
        style={{ borderLeft: '3px solid var(--color-agent)', paddingLeft: '10px' }}
      >
        <h2
          id="wins-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Work shipped
        </h2>
        <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
          {wins.length} {wins.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Ledger rows — M9 stagger, M6 violet border structure */}
      <ul className="flex flex-col gap-2" aria-label="Work shipped this week">
        {wins.map((win, i) => (
          <WinRow key={win.id} win={win} index={i} />
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Resolved approvals — read-only archive rows
// ---------------------------------------------------------------------------

interface ApprovalsSectionProps {
  approvals: DigestApproval[]
}

const APPROVAL_TYPE_LABELS: Record<string, string> = {
  content: 'Content',
  faq: 'FAQ',
  schema: 'Schema',
  outreach: 'Outreach',
  email: 'Email',
}

function ApprovalStatusPill({ status }: { status: DigestApproval['status'] }) {
  const config = {
    approved: { label: 'Approved', cls: 'bg-status-positive text-status-positive' },
    rejected: { label: 'Rejected', cls: 'bg-status-neutral text-status-neutral' },
    expired:  { label: 'Expired',  cls: 'bg-status-warning text-status-warning' },
  }[status]

  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
        config.cls,
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

function ApprovalRow({ approval }: { approval: DigestApproval }) {
  return (
    <li className="card-inset flex items-start gap-3 p-4 transition-colors hover:bg-[#F4F6FA]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 text-[13px] font-medium text-[#0A0A0A]">
            {approval.title}
          </p>
          <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
            {APPROVAL_TYPE_LABELS[approval.type] ?? approval.type}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-[#9CA3AF] line-clamp-2">
          {approval.previewSnippet}
        </p>
        {/* agentProposer is intentionally NOT rendered (Principle #9) */}
      </div>
      <ApprovalStatusPill status={approval.status} />
    </li>
  )
}

function ApprovalsSection({ approvals }: ApprovalsSectionProps) {
  if (approvals.length === 0) return null

  return (
    <section aria-labelledby="approvals-heading" className="craft-enter craft-enter-4">
      <div className="mb-4">
        <h2
          id="approvals-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          What we asked you
        </h2>
      </div>
      <ul className="flex flex-col gap-2" aria-label="Resolved approvals from this week">
        {approvals.map((a) => (
          <ApprovalRow key={a.id} approval={a} />
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Customer note — Fraunces italic warm close block
// ---------------------------------------------------------------------------

function CustomerNoteSection({ note }: { note: string }) {
  return (
    <section aria-label="A note for you" className="craft-enter craft-enter-5">
      <div
        className="rounded-[var(--radius-card)] bg-surface-warm p-6 sm:p-8"
        aria-label="A note for you"
      >
        {/* M2 STEP-3 eyebrow */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          A note for you
        </p>
        {/*
         * M5 Fraunces italic — the ONE serif moment on the page.
         * Full note rendered verbatim, Fraunces italic body.
         */}
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '17px',
            lineHeight: '1.65',
            color: '#374151',
          }}
        >
          {note}
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// DigestDetailView — assembled detail page
// ---------------------------------------------------------------------------

interface DigestDetailViewProps {
  digest: WeeklyDigest
}

/**
 * DigestDetailView — full weekly digest detail.
 *
 * Craft moves applied (per CRAFT-SYSTEM.md):
 * M1  — hero = TIER-1 card-console-hero (one focal/screen); engine focus = TIER-2;
 *        win + approval rows = TIER-3 .card-inset
 * M2  — 4-step type contract: 44px mono score (STEP-1) · 30px InterDisplay verdict (STEP-2)
 *        · 12px eyebrow (STEP-3) · 14–15px body (STEP-4)
 * M3  — asymmetric engine grid [1fr_280px]; wins full-width ledger
 * M4  — micro-sparkline on every engine delta card (signature detail)
 * M5  — Fraunces italic on headline post-dash word (one beat/screen); full note block
 * M6  — violet left border rail on wins ledger (agent zone, never on buttons)
 * M8  — two-tier not-found recovery (in not-found.tsx)
 * M9  — craft-enter stagger on sections and win rows
 * M10 — hero above fold, scores, wins, approvals, note earned by scrolling
 * M11 — all numbers (scores, deltas, dates) in Geist Mono tabular-nums
 * M12 — varied whitespace by relationship (tight within clusters, wide between)
 */
export function DigestDetailView({ digest }: DigestDetailViewProps) {
  const { weekLabel, weekRelative, weekOf, digest: d } = digest

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back affordance */}
      <div className="mb-5">
        <BackLink />
      </div>

      {/*
       * M12 editorial rhythm:
       * Hero → 40px → Scores → 48px → Wins → 48px → Approvals → 48px → Note
       */}
      <div className="flex flex-col">
        {/* M1 TIER-1: hero */}
        <DigestHero
          weekLabel={weekLabel}
          weekRelative={weekRelative}
          weekOf={weekOf}
          headline={d.headline}
          narrativeLine={d.narrativeLine}
        />

        {/* M12: 40px gap to engine scores */}
        <div className="mt-10" />

        {/* Score movement — TIER-2 focus + TIER-3 insets */}
        <EngineDeltaSection deltas={d.engineDeltas} />

        {/* M12: 48px gap to wins */}
        <div className="mt-12" />

        {/* Work shipped — M6 violet ledger, .card-inset rows */}
        <WinsShippedSection wins={d.wins} />

        {d.resolvedApprovals.length > 0 && (
          <>
            {/* M12: 48px gap */}
            <div className="mt-12" />
            {/* Resolved approvals */}
            <ApprovalsSection approvals={d.resolvedApprovals} />
          </>
        )}

        {/* M12: 48px gap to note */}
        <div className="mt-12" />

        {/* Customer note — Fraunces close */}
        <CustomerNoteSection note={d.customerNote} />

        {/* Bottom breathing room */}
        <div className="mt-12" />
      </div>
    </main>
  )
}

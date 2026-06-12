/**
 * /scan/[scan_id] — Free Scan Results Page
 *
 * Warm-minimal "evidence then ask" diagnostic console:
 * ring → engines → issues → CTA.
 *
 * Agency framing throughout. NO agent names anywhere per Engineering Principle #9.
 * Full results shown, NO blur / NO preview-gating / NO paywall.
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ScanScoreHero } from './_components/ScanScoreHero'
import { EngineBand } from './_components/EngineBand'
import { IssueLedger } from './_components/IssueLedger'
import { ScanPendingState } from './_components/ScanPendingState'
import { ScanV2View } from './_components/ScanV2View'
import type { ScanV2Result } from '@/lib/scan/scan-v2-types'
import { isDemoScan } from '@/lib/demo/scan-gate'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types (no agent names — outcome shapes only)
// ---------------------------------------------------------------------------

interface IssueSummary {
  category: string
  count: number
}

interface EngineResult {
  id: 'chatgpt' | 'gemini' | 'perplexity'
  label: string
  score?: number | null
  mentioned?: boolean | null
  verdict?: string | null
}

interface ScanResult {
  id: string
  business_name: string
  website_url: string
  status: 'queued' | 'running' | 'complete' | 'failed'
  results: FreeScanResults | null
}

interface FreeScanResults {
  issues?: IssueSummary[]
  total_issues?: number
  engines_checked?: number
  visibility_score?: number
  /** Per-engine results if available */
  engine_results?: EngineResult[]
  /** Per-engine scores keyed by engine id */
  scores?: Partial<Record<string, number>>
  /**
   * Wave 7 v2 measurement result. Present when the scan was produced by
   * assembleFreeScanV2(). Absent for legacy scans (v1 path renders unchanged).
   * Source of truth: src/lib/scan/types.ts FreeScanResults.scan_v2
   */
  scan_v2?: ScanV2Result
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getFreeScan(scanId: string): Promise<ScanResult | null> {
  // Demo mode: return fixture for the well-known demo scan ID without a DB query.
  // This is a public route gated by ID only (no auth check needed here).
  const demoResult = isDemoScan(scanId)
  if (demoResult) return demoResult as unknown as ScanResult

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase
    .from('free_scans')
    .select('id, business_name, website_url, status, results')
    .eq('id', scanId)
    .maybeSingle()

  if (error) {
    console.error('[scan/results] Failed to fetch scan', { scanId, error: error.message })
    return null
  }

  if (!data) return null

  return {
    id: data.id as string,
    business_name: data.business_name as string,
    website_url: data.website_url as string,
    status: data.status as ScanResult['status'],
    results: data.results as FreeScanResults | null,
  }
}

// ---------------------------------------------------------------------------
// Helpers — derive visibility score from results
// ---------------------------------------------------------------------------

function deriveScore(results: FreeScanResults | null): number {
  if (!results) return 0
  if (results.visibility_score != null) return Math.round(results.visibility_score)
  // Try to average per-engine scores
  if (results.scores) {
    const vals = Object.values(results.scores).filter(
      (v): v is number => typeof v === 'number'
    )
    if (vals.length > 0) {
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    }
  }
  if (results.engine_results) {
    const scores = results.engine_results
      .map((e) => e.score)
      .filter((s): s is number => s != null)
    if (scores.length > 0) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }
  }
  return 0
}

function deriveEngines(results: FreeScanResults | null) {
  const defaults: EngineResult[] = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'perplexity', label: 'Perplexity' },
  ]

  if (!results) return defaults

  if (results.engine_results && results.engine_results.length > 0) {
    return results.engine_results
  }

  // Build from scores map if available
  if (results.scores) {
    return defaults.map((eng) => ({
      ...eng,
      score: results.scores?.[eng.id] ?? null,
    }))
  }

  return defaults
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header bar: wordmark + blue discovery CTA */
function PageHeader({ discoveryUrl }: { discoveryUrl: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
        <span className="flex items-center gap-2 font-[var(--font-display)] text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[var(--color-accent)] font-mono text-[13px] font-semibold text-white"
          >
            B
          </span>
          Beamix
        </span>
        <Link
          href={discoveryUrl}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Book a discovery call
        </Link>
      </div>
    </header>
  )
}

/** Identity eyebrow: favicon + business name + domain — reads as a header. */
function IdentityLine({ businessName, websiteUrl }: { businessName: string; websiteUrl: string }) {
  const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const initial = businessName.trim().charAt(0).toUpperCase() || 'B'
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] font-[var(--font-display)] text-[15px] font-semibold text-[var(--color-text-primary)]"
      >
        {initial}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
          AI search scan
        </p>
        <p className="truncate text-[15px] font-semibold leading-tight text-[var(--color-text-primary)]">
          {businessName}
          <span className="ml-2 font-mono text-[12px] font-normal text-[var(--color-text-muted)]">
            {domain}
          </span>
        </p>
      </div>
    </div>
  )
}

/** Rail trust card: "what happens next" + trust signals — pins the offer. */
function NextStepsRail({ discoveryUrl, totalIssues }: { discoveryUrl: string; totalIssues: number }) {
  const steps = [
    {
      title: 'We map the gaps',
      body: 'Every place AI search misses or misranks you — across ChatGPT, Gemini, and Perplexity.',
    },
    {
      title: 'We do the fixes',
      body: 'Schema, citations, FAQ coverage. We write and ship it — you approve, we run it.',
    },
    {
      title: 'You climb the rankings',
      body: 'We re-measure every week and keep your visibility moving, not just monitored.',
    },
  ]
  return (
    <aside className="card-console overflow-hidden" aria-label="What happens next">
      <p className="border-b border-[var(--color-border)] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
        What happens next
      </p>
      <ol className="relative space-y-5 px-6 py-6">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] font-mono text-[12px] font-semibold text-white"
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[14px] font-semibold leading-tight text-[var(--color-text-primary)]">
                {step.title}
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="border-t border-[var(--color-border)] px-6 py-5">
        <Link
          href={discoveryUrl}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 text-[14px] font-semibold text-white transition-[transform,background-color] duration-100 ease-out hover:-translate-y-px hover:bg-[var(--color-accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          {totalIssues > 0
            ? `Get all ${totalIssues} fixed for you`
            : 'Book a discovery call'}
        </Link>
        <p className="mt-2.5 text-center text-[12px] text-[var(--color-text-muted)]">
          Free 20-min call · No credit card
        </p>
      </div>
    </aside>
  )
}

/** Pending / scanning state — animated ledger fill */
function PendingSection({ businessName }: { businessName: string }) {
  return <ScanPendingState businessName={businessName} />
}

/** Failed scan — recovery CTA, never "refresh the page" */
function FailedSection({ discoveryUrl }: { discoveryUrl: string }) {
  return (
    <div className="card-console p-8 text-center">
      <p className="font-[var(--font-display)] text-[22px] font-semibold text-[var(--color-text-primary)]">
        We hit a snag with this scan
      </p>
      <p className="mx-auto mt-2 max-w-[400px] text-[15px] leading-[1.5] text-[var(--color-text-muted)]">
        This sometimes happens with newer domains or unusual site structures.
        We can walk through your results manually on a quick call.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href={discoveryUrl}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Book a discovery call instead
        </Link>
        <Link
          href="/scan"
          className="text-[14px] font-medium text-[var(--color-text-muted)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-sm"
        >
          Try a new scan
        </Link>
      </div>
    </div>
  )
}

/** Dark-panel CTA block — hard act-separator before discovery booking */
function CtaBlock({
  discoveryUrl,
  totalIssues,
}: {
  discoveryUrl: string
  totalIssues: number
}) {
  return (
    <section
      className="rounded-[var(--radius-card)] px-8 py-10 text-center"
      style={{ backgroundColor: 'var(--color-panel-dark)' }}
      aria-label="Book a discovery call"
    >
      <h2 className="font-[var(--font-display)] text-[24px] font-semibold leading-snug text-white sm:text-[28px]">
        {totalIssues > 0 ? (
          <>
            We{' '}
            <em className="font-[var(--font-serif)] font-normal italic">fix</em>{' '}
            all{' '}
            <span className="font-mono tabular-nums">{totalIssues}</span> issue
            {totalIssues !== 1 ? 's' : ''} for you — end-to-end.
          </>
        ) : (
          'We make sure your AI search visibility stays strong.'
        )}
      </h2>
      <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-[1.5] text-[#9CA3AF]">
        No dashboards to babysit. No copywriting to do. Book a free 20-minute
        call and we&apos;ll show you exactly what we&apos;ll do.
      </p>
      <Link
        href={discoveryUrl}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 text-[15px] font-semibold text-white transition-[transform,background-color,box-shadow] duration-100 ease-out hover:-translate-y-px hover:bg-[var(--color-accent-hover)] hover:shadow-[0_4px_16px_rgba(51,112,255,0.3)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel-dark)]"
      >
        Book a 20-min discovery call
      </Link>
      <p className="mt-4 text-[13px] text-[#6B7280]">
        No credit card. No commitment.
      </p>
    </section>
  )
}

/** Footnote */
function ScanFootnote({ scanId }: { scanId: string }) {
  return (
    <p className="border-t border-[var(--color-border-subtle)] pt-5 text-center font-mono text-[12px] text-[var(--color-text-disabled)]">
      Scan completed &bull; Results expire in 30 days &bull; ID: {scanId.slice(0, 8)}&hellip;
    </p>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ scan_id: string }>
}

export default async function ScanResultsPage({ params }: PageProps) {
  const { scan_id } = await params
  const scan = await getFreeScan(scan_id)

  if (!scan) notFound()

  const results = scan.results
  const totalIssues =
    results?.total_issues ??
    results?.issues?.reduce((s, i) => s + i.count, 0) ??
    0
  const issues = results?.issues ?? []
  const visibilityScore = deriveScore(results)
  const engines = deriveEngines(results)

  const isComplete = scan.status === 'complete'
  const isFailed = scan.status === 'failed'
  const isPending = !isComplete && !isFailed

  const discoveryUrl = `/discovery?scan_id=${scan.id}`

  // v2 measurement view owns its own internal layout; render it full-width
  // rather than forcing it into the v1 two-column grid.
  const isV2 = isComplete && Boolean(results?.scan_v2)

  return (
    <main className="min-h-screen bg-[var(--color-surface-warm)]">
      <PageHeader discoveryUrl={discoveryUrl} />

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Identity eyebrow */}
        <div className="craft-enter craft-enter-1">
          <IdentityLine businessName={scan.business_name} websiteUrl={scan.website_url} />
        </div>

        {/* State: pending */}
        {isPending && (
          <div className="mt-8 mx-auto max-w-3xl">
            <PendingSection businessName={scan.business_name} />
          </div>
        )}

        {/* State: failed */}
        {isFailed && (
          <div className="mt-8 mx-auto max-w-2xl">
            <FailedSection discoveryUrl={discoveryUrl} />
          </div>
        )}

        {/* State: complete — v2 (own internal layout) */}
        {isV2 && (
          <div className="mt-8 space-y-10">
            <div className="craft-enter craft-enter-2">
              <ScanScoreHero score={visibilityScore} businessName={scan.business_name} />
            </div>
            <div className="craft-enter craft-enter-3">
              <ScanV2View v2={results!.scan_v2!} />
            </div>
            <div className="craft-enter craft-enter-4">
              <CtaBlock discoveryUrl={discoveryUrl} totalIssues={totalIssues} />
            </div>
            <ScanFootnote scanId={scan.id} />
          </div>
        )}

        {/* State: complete — v1 asymmetric frame-filling layout (M3) */}
        {isComplete && !isV2 && (
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-y-0">
            {/* Dominant column — hero + issues (the evidence that drives the CTA) */}
            <div className="flex flex-col gap-10">
              <div className="craft-enter craft-enter-2">
                <ScanScoreHero score={visibilityScore} businessName={scan.business_name} />
              </div>

              {issues.length > 0 && (
                <div className="craft-enter craft-enter-4">
                  <IssueLedger issues={issues} totalIssues={totalIssues} />
                </div>
              )}

              {/* CTA — act separator (large air gap above via mt) */}
              <div className="craft-enter craft-enter-5 mt-4">
                <CtaBlock discoveryUrl={discoveryUrl} totalIssues={totalIssues} />
              </div>

              <ScanFootnote scanId={scan.id} />
            </div>

            {/* Narrow rail — engine breakdown + what-happens-next + pinned CTA */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="craft-enter craft-enter-3">
                <EngineBand engines={engines} />
              </div>
              <div className="craft-enter craft-enter-4">
                <NextStepsRail discoveryUrl={discoveryUrl} totalIssues={totalIssues} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending: auto-refresh every 10s */}
      {isPending && (
        <Suspense fallback={null}>
          <meta httpEquiv="refresh" content="10" />
        </Suspense>
      )}
    </main>
  )
}

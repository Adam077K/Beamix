/**
 * /scan/[scan_id] — Free Scan Results Page
 *
 * Agency framing: shows issues found + books a discovery call.
 * NO agent names anywhere in this file per Engineering Principle #9 + CTO decision A8.
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types (no agent names — outcome shapes only)
// ---------------------------------------------------------------------------

interface IssueSummary {
  category: string
  count: number
}

interface ScanResult {
  id: string
  business_name: string
  website_url: string
  status: 'queued' | 'running' | 'complete' | 'failed'
  /** Structured results blob — varies by scan implementation */
  results: FreeScanResults | null
}

interface FreeScanResults {
  issues?: IssueSummary[]
  total_issues?: number
  engines_checked?: number
  visibility_score?: number
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getFreeScan(scanId: string): Promise<ScanResult | null> {
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
// Sub-components
// ---------------------------------------------------------------------------

function IssueBar({ category, count }: { category: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0">
      <span className="text-[#0A0A0A] text-sm font-medium">{category}</span>
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-xs font-semibold">
        {count}
      </span>
    </div>
  )
}

function ScanPending({ businessName }: { businessName: string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-[#3370FF] animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-[#0A0A0A] font-medium text-lg mb-2">
        Scanning {businessName}&hellip;
      </p>
      <p className="text-[#6B7280] text-sm">
        This takes about 60 seconds. This page will update automatically.
      </p>
    </div>
  )
}

function ScanFailed() {
  return (
    <div className="text-center py-16">
      <p className="text-[#0A0A0A] font-medium text-lg mb-2">Scan could not complete</p>
      <p className="text-[#6B7280] text-sm mb-6">
        We hit an issue while scanning. This sometimes happens with newer domains.
      </p>
      <Link
        href="/scan"
        className="inline-flex items-center gap-2 text-[#3370FF] text-sm font-medium hover:underline"
      >
        Try again
      </Link>
    </div>
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
  const totalIssues = results?.total_issues ?? results?.issues?.reduce((s, i) => s + i.count, 0) ?? 0
  const issues = results?.issues ?? []
  const enginesChecked = results?.engines_checked ?? 3
  const isComplete = scan.status === 'complete'
  const isFailed = scan.status === 'failed'
  const isPending = !isComplete && !isFailed

  const discoveryUrl = process.env.NEXT_PUBLIC_CALCOM_DISCOVERY_LINK
    ? `/discovery?scan_id=${scan.id}`
    : `/discovery?scan_id=${scan.id}`

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-[#0A0A0A] font-semibold text-lg tracking-tight">Beamix</span>
          <Link
            href={discoveryUrl}
            className="inline-flex items-center gap-2 bg-[#3370FF] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2558d4] transition-colors"
          >
            Book a discovery call
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Business info */}
        <p className="text-[#6B7280] text-sm mb-1">
          Results for{' '}
          <span className="font-medium text-[#0A0A0A]">{scan.business_name}</span>
          {' '}·{' '}
          <span className="font-mono text-xs">{scan.website_url}</span>
        </p>

        {isPending && (
          <ScanPending businessName={scan.business_name} />
        )}

        {isFailed && <ScanFailed />}

        {isComplete && (
          <>
            {/* Hero headline — agency framing, no agent names */}
            <div className="mt-6 mb-10">
              <h1 className="text-3xl font-semibold text-[#0A0A0A] leading-tight mb-3">
                We found{' '}
                <span className="text-[#EF4444]">{totalIssues} issue{totalIssues !== 1 ? 's' : ''}</span>{' '}
                hurting your AI search visibility.
              </h1>
              <p className="text-[#6B7280] text-base leading-relaxed">
                We checked {enginesChecked} AI search engines — ChatGPT, Gemini, and Perplexity.
                Every issue below is something we&apos;ll fix for you, end-to-end. No dashboards to
                maintain. No copywriting to do. Just results.
              </p>
            </div>

            {/* Issue list */}
            {issues.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-4">
                  Issues found ({totalIssues})
                </h2>
                {issues.map((issue) => (
                  <IssueBar key={issue.category} category={issue.category} count={issue.count} />
                ))}
              </div>
            )}

            {/* CTA block */}
            <div className="bg-[#0A0A0A] rounded-2xl p-8 text-center">
              <p className="text-white text-xl font-semibold mb-2">
                We&apos;ll fix all {totalIssues} issue{totalIssues !== 1 ? 's' : ''} for you.
              </p>
              <p className="text-[#9CA3AF] text-sm mb-6 max-w-sm mx-auto">
                Book a free 30-minute discovery call. We&apos;ll show you exactly what we&apos;ll do and
                what results to expect.
              </p>
              <Link
                href={discoveryUrl}
                className="inline-flex items-center gap-2 bg-[#3370FF] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#2558d4] transition-colors"
              >
                Book a 30-min discovery call &rarr;
              </Link>
              <p className="text-[#6B7280] text-xs mt-4">No credit card. No commitment.</p>
            </div>

            {/* Footnote */}
            <p className="text-center text-[#9CA3AF] text-xs mt-8">
              Scan completed &bull; Results expire in 30 days &bull; Scan ID: {scan.id.slice(0, 8)}&hellip;
            </p>
          </>
        )}
      </div>

      {/* Pending page auto-refresh via meta tag (no JS framework required) */}
      {isPending && (
        <Suspense fallback={null}>
          <meta httpEquiv="refresh" content="10" />
        </Suspense>
      )}
    </main>
  )
}

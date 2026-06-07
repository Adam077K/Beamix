'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type BillingState = 'loading' | 'error' | 'success'

interface Invoice {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  downloadUrl: string
}

interface PlanInfo {
  name: string
  price: string
  period: string
  planId: string
  renewsAt: string
  features: string[]
}

// ── Pill helpers ─────────────────────────────────────────────────────────────

function InvoiceStatusPill({ status }: { status: Invoice['status'] }) {
  const map = {
    paid: 'bg-[#E6F5EE] text-[#0E9E6E]',
    pending: 'bg-[#FDF3E0] text-[#B8770B]',
    failed: 'bg-[#FDECEC] text-[#DC2626]',
  }
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium', map[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function BillingSkeletonLoader() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading billing information">
      <div className="card-console overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-8 w-40 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-4 h-9 w-36 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="card-console overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-t border-[#F3F4F6]">
              <div className="h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-4 w-10 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Error state ──────────────────────────────────────────────────────────────

function BillingErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card-console flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDECEC]">
        <AlertCircle className="h-6 w-6 text-[#DC2626]" />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-[#0A0A0A]">Couldn&apos;t load billing info</h3>
      <p className="mb-6 max-w-[280px] text-[13px] leading-relaxed text-[#6B7280]">
        We had trouble reaching the billing service. Your subscription is unaffected.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const PLAN: PlanInfo = {
  name: 'Build',
  price: '$189',
  period: 'per month',
  planId: 'bld-189-m-2026',
  renewsAt: 'Jul 7, 2026',
  features: [
    '7 AI agents',
    'Unlimited scans',
    'All publishing integrations',
    '50 monthly approvals',
  ],
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-0024', date: 'Jun 7, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0018', date: 'May 7, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0012', date: 'Apr 7, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0006', date: 'Mar 7, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
]

export function BillingTab() {
  const [uiState] = useState<BillingState>('success')
  const [portalLoading, setPortalLoading] = useState(false)

  async function handleManageBilling() {
    setPortalLoading(true)
    // Stub: Paddle portal redirect
    await new Promise((r) => setTimeout(r, 1200))
    setPortalLoading(false)
    // In production: window.location.href = paddlePortalUrl
  }

  if (uiState === 'loading') return <BillingSkeletonLoader />
  if (uiState === 'error') return <BillingErrorState onRetry={() => {}} />

  return (
    <div className="space-y-6">
      {/* Current plan card */}
      <div className="card-console overflow-hidden">
        <div className="p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Current plan
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-[var(--font-display)] text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]">
                  {PLAN.name}
                </span>
                <span className="text-2xl font-semibold text-[#0A0A0A]">{PLAN.price}</span>
                <span className="text-sm text-[#6B7280]">{PLAN.period}</span>
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Renews {PLAN.renewsAt} ·{' '}
                <span className="font-mono text-[12px] text-[#9CA3AF]">{PLAN.planId}</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {PLAN.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[13px] text-[#374151]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0E9E6E]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Button onClick={handleManageBilling} disabled={portalLoading} className="gap-2">
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening portal…
                  </>
                ) : (
                  <>
                    Manage billing
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="card-console overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Invoices
          </p>
        </div>

        {INVOICES.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-[#0A0A0A]">No invoices yet</p>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Your first invoice will appear here after your trial ends.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              <span>Invoice</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
              <span className="sr-only">Download</span>
            </div>

            {INVOICES.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-3.5 hover:bg-[#F9FAFB] transition-colors"
              >
                <div>
                  <p className="font-mono text-[13px] font-medium text-[#0A0A0A]">{inv.id}</p>
                  <p className="text-[12px] text-[#6B7280]">{inv.date}</p>
                </div>
                <span className="font-mono text-sm font-medium text-[#0A0A0A]">{inv.amount}</span>
                <InvoiceStatusPill status={inv.status} />
                <a
                  href={inv.downloadUrl}
                  aria-label={`Download invoice ${inv.id}`}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#3370FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowUpRight,
  AlertCircle,
  Loader2,
  Download,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type BillingUIState = 'loading' | 'error' | 'success'

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
  status: 'active' | 'trialing' | 'past_due' | 'cancelled'
  daysIntoGuarantee: number | null // null = guarantee expired
  guaranteeTotal: number
  annualSavingsPct: number
  paymentBrand: string
  paymentLast4: string
}

// ── Status pill ──────────────────────────────────────────────────────────────

function PlanStatusPill({ status }: { status: PlanInfo['status'] }) {
  const map: Record<PlanInfo['status'], { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-[var(--color-status-positive-bg,#E6F5EE)] text-[var(--color-status-positive)]' },
    trialing: { label: 'Trialing', className: 'bg-[var(--color-status-neutral-bg,#F3F4F6)] text-[var(--color-status-neutral)]' },
    past_due: { label: 'Past due', className: 'bg-[var(--color-status-warning-bg,#FDF3E0)] text-[var(--color-status-warning)]' },
    cancelled: { label: 'Cancelled', className: 'bg-[var(--color-status-critical-bg,#FDECEC)] text-[var(--color-status-critical)]' },
  }
  const { label, className } = map[status]
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium', className)}>
      {label}
    </span>
  )
}

function InvoiceStatusPill({ status }: { status: Invoice['status'] }) {
  const map: Record<Invoice['status'], { label: string; className: string }> = {
    paid: { label: 'Paid', className: 'bg-[var(--color-status-positive-bg,#E6F5EE)] text-[var(--color-status-positive)]' },
    pending: { label: 'Pending', className: 'bg-[var(--color-status-warning-bg,#FDF3E0)] text-[var(--color-status-warning)]' },
    failed: { label: 'Failed', className: 'bg-[var(--color-status-critical-bg,#FDECEC)] text-[var(--color-status-critical)]' },
  }
  const { label, className } = map[status]
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium', className)}>
      {label}
    </span>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function BillingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading billing information">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card-console overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-6 w-40 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-4 w-64 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-9 w-36 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Error state ──────────────────────────────────────────────────────────────

function BillingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card-console flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-status-critical-bg)]">
        <AlertCircle className="h-6 w-6 text-[var(--color-status-critical)]" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
        Couldn&apos;t reach billing
      </h3>
      <p className="mb-6 max-w-[280px] text-[13px] leading-relaxed text-[var(--color-text-muted)]">
        We had trouble reaching the billing service. Your subscription is unaffected.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

// ── Stub data ────────────────────────────────────────────────────────────────
// Wave 2: replace with Paddle API read via /api/billing/portal

const PLAN: PlanInfo = {
  name: 'Build',
  price: '$189',
  period: '/mo',
  planId: 'bld-189-m-2026',
  renewsAt: 'Jul 11, 2026',
  status: 'active',
  daysIntoGuarantee: 30,
  guaranteeTotal: 60,
  annualSavingsPct: 20,
  paymentBrand: 'Visa',
  paymentLast4: '4242',
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-0031', date: 'Jun 11, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0024', date: 'May 11, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0018', date: 'Apr 11, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
  { id: 'INV-2026-0012', date: 'Mar 11, 2026', amount: '$189.00', status: 'paid', downloadUrl: '#' },
]

// ── Main component ────────────────────────────────────────────────────────────

export function BillingTab() {
  // Wave 2: drive from Paddle read
  const [uiState] = useState<BillingUIState>('success')
  const [portalLoading, setPortalLoading] = useState(false)

  async function handleManageBilling() {
    setPortalLoading(true)
    // Wave 2: redirect to Paddle portal URL
    await new Promise((r) => setTimeout(r, 1200))
    setPortalLoading(false)
  }

  if (uiState === 'loading') return <BillingSkeleton />
  if (uiState === 'error') return <BillingError onRetry={() => {}} />

  const { daysIntoGuarantee, guaranteeTotal } = PLAN
  const inGuaranteeWindow = daysIntoGuarantee !== null && daysIntoGuarantee <= guaranteeTotal
  const daysRemaining = daysIntoGuarantee !== null ? guaranteeTotal - daysIntoGuarantee : 0

  return (
    <div className="space-y-6">

      {/* ── Current plan ── */}
      <div className="card-console overflow-hidden">
        <div className="px-5 py-4">
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Current plan
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {/* Plan name + price */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-[var(--font-display)] text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
                  {PLAN.name}
                </span>
                <span className="font-mono text-[22px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {PLAN.price}
                </span>
                <span className="text-[13px] text-[var(--color-text-muted)]">{PLAN.period}</span>
                <PlanStatusPill status={PLAN.status} />
              </div>
              {/* Meta */}
              <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                Renews{' '}
                <span className="font-mono tabular-nums text-[var(--color-text-secondary)]">
                  {PLAN.renewsAt}
                </span>{' '}
                ·{' '}
                <span className="font-mono text-[12px] text-[#9CA3AF]">{PLAN.planId}</span>
              </p>
            </div>
            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Button
                type="button"
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="gap-2"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Opening…
                  </>
                ) : (
                  <>
                    Change plan
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              >
                Switch to annual — save {PLAN.annualSavingsPct}%
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 60-day guarantee ── */}
      <div className="card-console overflow-hidden bg-[var(--color-surface-warm)]">
        <div className="flex items-start gap-3 px-5 py-4">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-status-positive)]"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              60-day money-back guarantee
            </p>
            {inGuaranteeWindow ? (
              <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                <span className="font-mono tabular-nums font-medium text-[var(--color-text-secondary)]">
                  {daysRemaining} days remaining
                </span>{' '}
                — cancel any time before{' '}
                <span className="font-mono tabular-nums">{PLAN.renewsAt}</span> for a full automatic refund.
                No emails, no support tickets.
              </p>
            ) : (
              <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                Your guarantee window has closed. Cancelling stops future billing — no charge today.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Payment method ── */}
      <div className="card-console overflow-hidden">
        <div className="px-5 py-4">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Payment method
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white">
                <CreditCard className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                  {PLAN.paymentBrand}
                </p>
                <p className="font-mono text-[13px] tabular-nums text-[var(--color-text-muted)]">
                  •••• {PLAN.paymentLast4}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManageBilling}
              disabled={portalLoading}
              aria-label="Update payment method via Paddle"
            >
              {portalLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                'Update via Paddle'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Invoices ── */}
      <div className="card-console overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Invoices
          </p>
        </div>

        {INVOICES.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-[var(--color-text-primary)]">No invoices yet</p>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              Your first invoice appears here after your trial ends.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_32px] items-center gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
              <span>Invoice</span>
              <span className="text-right">Amount</span>
              <span>Status</span>
              <span className="sr-only">Download</span>
            </div>

            {INVOICES.map((inv) => (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_auto_auto_32px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F9FAFB]"
              >
                <div>
                  <p className="font-mono text-[13px] font-medium tabular-nums text-[var(--color-text-primary)]">
                    {inv.id}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">{inv.date}</p>
                </div>
                <span className="font-mono text-[13px] font-medium tabular-nums text-[var(--color-text-primary)]">
                  {inv.amount}
                </span>
                <InvoiceStatusPill status={inv.status} />
                <a
                  href={inv.downloadUrl}
                  aria-label={`Download invoice ${inv.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

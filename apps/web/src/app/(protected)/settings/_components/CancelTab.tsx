'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, CheckCircle2, ShieldCheck, Check, FileDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type CancelState = 'idle' | 'disclosed' | 'cancelling' | 'cancelled' | 'error'

// ── Stub billing context ──────────────────────────────────────────────────────
// Wave 2: read from /api/billing/status

const BILLING = {
  daysIntoGuarantee: 30, // null = guarantee expired
  guaranteeTotal: 60,
  amount: '$189.00',
  planName: 'Build',
  renewsAt: 'Jul 11, 2026',
}

// ── "What you keep" card ─────────────────────────────────────────────────────

function WhatYouKeep() {
  const keeps = [
    'Everything the crew has published stays in your account',
    'Your scans and reports stay exportable for 30 days',
    'Your refund fires automatically — no emails, no support tickets',
  ]

  return (
    <div className="card-console overflow-hidden">
      <div className="px-5 py-4">
        <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Before you go</p>
      </div>
      <div className="border-t border-[#F3F4F6]">
        <ul className="divide-y divide-[#F3F4F6]" role="list">
          {keeps.map((item, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3.5">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-status-positive)]"
                aria-hidden="true"
                strokeWidth={2.5}
              />
              <span className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Refund status strip ──────────────────────────────────────────────────────

function RefundStrip() {
  const { daysIntoGuarantee, guaranteeTotal, amount, renewsAt } = BILLING
  const inWindow = daysIntoGuarantee !== null && daysIntoGuarantee <= guaranteeTotal
  const daysRemaining = inWindow ? guaranteeTotal - daysIntoGuarantee : 0

  if (inWindow) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[var(--color-status-positive-bg,#E6F5EE)] px-4 py-3.5">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-status-positive)]"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <p className="text-[14px] leading-relaxed text-[var(--color-status-positive)]">
          You&apos;re{' '}
          <span className="font-mono tabular-nums font-semibold">{daysIntoGuarantee} days</span>{' '}
          into your 60-day guarantee —{' '}
          <span className="font-mono tabular-nums font-semibold">{daysRemaining} days remaining</span>.
          Cancel now and we refund{' '}
          <span className="font-mono tabular-nums font-semibold">{amount}</span> automatically to your card.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-[var(--color-status-neutral-bg,#F3F4F6)] px-4 py-3.5">
      <ShieldCheck
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-status-neutral)]"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)]">
        Your guarantee window has closed. Cancelling stops future billing — no charge today.
        Your plan stays active until{' '}
        <span className="font-mono tabular-nums text-[var(--color-text-secondary)]">{renewsAt}</span>.
      </p>
    </div>
  )
}

// ── Confirmation dialog (inline, no modal for calm UX) ───────────────────────

interface ConfirmPanelProps {
  state: CancelState
  onConfirm: () => void
  onClose: () => void
}

function ConfirmPanel({ state, onConfirm, onClose }: ConfirmPanelProps) {
  const { daysIntoGuarantee, guaranteeTotal, amount } = BILLING
  const inWindow = daysIntoGuarantee !== null && daysIntoGuarantee <= guaranteeTotal

  return (
    <div className="card-console overflow-hidden border-[var(--color-status-critical-bg,#FDECEC)]">
      <div className="px-5 py-4">
        <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
          Cancel your subscription?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          {inWindow
            ? `Your plan stays active until the end of this billing period. We'll refund ${amount} automatically.`
            : 'Your plan stays active until the end of this billing period. No charge today.'}
        </p>
      </div>
      <div className="border-t border-[#F3F4F6] px-5 py-3.5 flex flex-wrap items-center gap-3">
        {/* Default focus: "Keep" — the safe choice */}
        <Button
          type="button"
          onClick={onClose}
          disabled={state === 'cancelling'}
          autoFocus
          className="order-first"
          aria-label="Keep my subscription"
        >
          Keep my subscription
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onConfirm}
          disabled={state === 'cancelling'}
          aria-label="Confirm cancellation"
          className={cn(
            'min-w-[140px] border-[var(--color-status-critical)] text-[var(--color-status-critical)]',
            'hover:bg-[var(--color-status-critical-bg,#FDECEC)] hover:border-[var(--color-status-critical)]',
            'focus-visible:ring-[var(--color-status-critical)]',
          )}
        >
          {state === 'cancelling' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="sr-only">Cancelling…</span>
            </>
          ) : (
            'Yes, cancel'
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Post-cancel success state ────────────────────────────────────────────────

function CancelSuccess({ onReactivate }: { onReactivate: () => void }) {
  const { daysIntoGuarantee, guaranteeTotal, amount } = BILLING
  const inWindow = daysIntoGuarantee !== null && daysIntoGuarantee <= guaranteeTotal

  return (
    <div className="space-y-6">
      <div className="card-console overflow-hidden bg-[var(--color-status-positive-bg,#E6F5EE)]">
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-[var(--color-status-positive)]" aria-hidden="true" />
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Your subscription is cancelled
          </h3>
          <p className="mt-2 max-w-[360px] text-[14px] leading-relaxed text-[var(--color-text-muted)]">
            {inWindow
              ? `A refund of ${amount} is on its way to your card — no action needed.`
              : `Your plan stays active until ${BILLING.renewsAt}. No further charges.`}
          </p>
          <p className="mt-1 max-w-[360px] text-[13px] text-[var(--color-text-muted)]">
            All your content, scans, and reports remain exportable for 30 days.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="gap-2"
          aria-label="Export your work product"
          onClick={() => {
            // Wave 2: generate + download export (zip of published content, scans, reports)
            // For now, navigate to dashboard where existing content is accessible
            window.location.href = '/dashboard'
          }}
        >
          <FileDown className="h-4 w-4" aria-hidden="true" />
          Export your work product
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onReactivate}
          className="gap-2 text-[var(--color-text-muted)]"
          aria-label="Reactivate subscription"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reactivate
        </Button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CancelTab() {
  const [state, setState] = useState<CancelState>('idle')

  async function handleConfirm() {
    setState('cancelling')
    try {
      // Wave 2: wire to Paddle cancel subscription API
      await new Promise((r) => setTimeout(r, 1500))
      setState('cancelled')
    } catch {
      // item #12: wire the error state — set it on cancel failure
      setState('error')
    }
  }

  if (state === 'cancelled') {
    return (
      <CancelSuccess
        onReactivate={() => setState('idle')}
      />
    )
  }

  return (
    <div className="max-w-[560px] space-y-5">
      {/* 1. What you keep — FIRST */}
      <WhatYouKeep />

      {/* 2. Refund context — conditional */}
      <RefundStrip />

      {/*
        item #11: two-step cancellation.
        Step 1 — calm quiet link ("I still want to cancel") discloses the confirm panel.
        Step 2 — confirm panel: explicit second click required. Default focus is on
                 the SAFE choice ("Keep my subscription") via autoFocus. The destructive
                 "Yes, cancel" is secondary (outline, not fill).
        No dark patterns: copy is calm, framing is what-you-keep, no countdown timers.
      */}
      {state === 'idle' && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setState('disclosed')}
            className={cn(
              'text-[13px] text-[var(--color-text-muted)] underline underline-offset-2 transition-colors',
              'hover:text-[var(--color-text-secondary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded',
            )}
          >
            I still want to cancel
          </button>
        </div>
      )}

      {(state === 'disclosed' || state === 'cancelling') && (
        <ConfirmPanel
          state={state}
          onConfirm={handleConfirm}
          onClose={() => setState('idle')}
        />
      )}

      {/* item #12: error state is now reachable — set in the catch of handleConfirm */}
      {state === 'error' && (
        <div className="flex items-start gap-2 rounded-lg bg-[var(--color-status-critical-bg,#FDECEC)] px-4 py-3 text-[13px] text-[var(--color-status-critical)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Something went wrong cancelling your subscription. Please try again or{' '}
            <a
              href="mailto:support@beamixai.com"
              className="font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-status-critical)] rounded"
            >
              contact support
            </a>.
          </span>
          <button
            type="button"
            onClick={() => setState('disclosed')}
            className="ml-auto shrink-0 text-[13px] font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-status-critical)] rounded"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

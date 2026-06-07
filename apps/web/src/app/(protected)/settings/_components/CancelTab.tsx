'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Violet "crew keeps working" reassurance ───────────────────────────────────

function CrewReassurance() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#EEEAFD] px-4 py-3.5">
      {/* Breathing dot — static here for calm */}
      <span className="mt-0.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#6E56F0]" />
      </span>
      <p className="text-[13px] leading-relaxed text-[#6E56F0]">
        <span className="font-semibold">Your crew keeps working until the last day.</span>{' '}
        All content your agents created stays in your account — you keep everything they built.
      </p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

type CancelState = 'idle' | 'confirming' | 'cancelling' | 'cancelled' | 'error'

export function CancelTab() {
  const [state, setState] = useState<CancelState>('idle')
  const [confirmText, setConfirmText] = useState('')

  const confirmPhrase = 'cancel my subscription'
  const isConfirmValid = confirmText.toLowerCase().trim() === confirmPhrase

  async function handleConfirm() {
    if (!isConfirmValid) return
    setState('cancelling')
    await new Promise((r) => setTimeout(r, 1500))
    setState('cancelled')
  }

  if (state === 'cancelled') {
    return (
      <div className="card-console flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F5EE]">
          <CheckCircle2 className="h-6 w-6 text-[#0E9E6E]" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-[#0A0A0A]">Subscription cancelled</h3>
        <p className="max-w-[320px] text-[13px] leading-relaxed text-[#6B7280]">
          Your plan remains active until the end of the current billing period. All your content and data are still accessible.
        </p>
        <p className="mt-3 text-[13px] text-[#6B7280]">
          Changed your mind?{' '}
          <button
            onClick={() => { setState('idle'); setConfirmText('') }}
            className="font-medium text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
          >
            Resume subscription
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="card-console overflow-hidden">
      <div className="p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Cancel subscription
        </p>

        <div className="mt-4 max-w-[520px] space-y-5">
          {/* Calm, frank copy */}
          <p className="text-sm leading-relaxed text-[#374151]">
            Cancelling stops your subscription at the end of the current billing period. Everything your agents have created — content, schema, reports — stays in your account. You can export or reactivate at any time.
          </p>

          <CrewReassurance />

          {/* 60-day note */}
          <p className="text-[13px] text-[#6B7280]">
            If you&apos;re within the first 60 days,{' '}
            <a
              href="mailto:support@beamixai.com"
              className="font-medium text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
            >
              contact us for a full refund
            </a>
            . No questions asked.
          </p>

          {/* Confirmation affordance */}
          {state === 'idle' && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setState('confirming')}
                className="border-[#FDECEC] text-[#DC2626] hover:bg-[#FDECEC] hover:border-[#DC2626]"
              >
                Continue to cancel
              </Button>
            </div>
          )}

          {(state === 'confirming' || state === 'cancelling') && (
            <div className="rounded-xl border border-[#FDECEC] bg-[#FFFAF9] p-4 space-y-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">Confirm cancellation</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                    Type{' '}
                    <span className="font-mono text-[12px] font-medium text-[#0A0A0A] bg-[#F3F4F6] px-1 py-0.5 rounded">
                      {confirmPhrase}
                    </span>{' '}
                    below to confirm.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="cancel-confirm" className="sr-only">
                  Type cancel my subscription to confirm
                </Label>
                <Input
                  id="cancel-confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmPhrase}
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    isConfirmValid && 'border-[#0E9E6E] focus-visible:ring-[#0E9E6E]'
                  )}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={handleConfirm}
                  disabled={!isConfirmValid || state === 'cancelling'}
                  className="bg-[#DC2626] hover:bg-[#C02020] active:bg-[#A81C1C] min-w-[140px]"
                >
                  {state === 'cancelling' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    'Confirm cancellation'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setState('idle'); setConfirmText('') }}
                  disabled={state === 'cancelling'}
                >
                  Never mind
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

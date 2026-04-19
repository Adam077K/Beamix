'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive, Switch as SwitchPrimitive } from 'radix-ui'
import { X, ShieldCheck, RefreshCw, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TierCard, TierKey } from './TierCard'

export interface PaywallModalProps {
  open: boolean
  onClose: () => void
  triggerContext?: string
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '14-day money-back guarantee' },
  { icon: RefreshCw, label: 'Cancel anytime' },
  { icon: Ban, label: 'No setup fees' },
] as const

export function PaywallModal({ open, onClose, triggerContext }: PaywallModalProps) {
  const [annual, setAnnual] = React.useState(true)
  const [loadingTier, setLoadingTier] = React.useState<TierKey | null>(null)

  function handleSelect(tier: TierKey) {
    if (loadingTier) return
    setLoadingTier(tier)
    // Simulate checkout redirect (replace with real Paddle integration)
    setTimeout(() => {
      setLoadingTier(null)
      onClose()
    }, 1800)
  }

  // Reset loading state when modal closes
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setLoadingTier(null), 300)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'duration-200'
          )}
        />

        {/* Content */}
        <DialogPrimitive.Content
          role="dialog"
          aria-modal="true"
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100vw-2rem)] max-w-[900px] max-h-[90dvh] overflow-y-auto',
            'rounded-[20px] bg-white p-6 sm:p-8',
            'shadow-[0_24px_60px_rgba(0,0,0,0.15)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'duration-200 outline-none'
          )}
        >
          {/* Close button */}
          <DialogPrimitive.Close
            aria-label="Close pricing modal"
            className={cn(
              'absolute right-4 top-4 sm:right-5 sm:top-5',
              'rounded-lg p-1.5 text-[#6B7280]',
              'hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2'
            )}
          >
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="mb-6 pr-10">
            <DialogPrimitive.Title
              id="paywall-modal-title"
              className="text-xl font-semibold tracking-tight text-[#0A0A0A] sm:text-2xl"
            >
              Choose your plan
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-sm text-[#6B7280]">
              {triggerContext ?? 'Get full AI search visibility and let agents do the fix work for you.'}
            </DialogPrimitive.Description>
          </div>

          {/* Billing toggle — pill switch */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Toggle track */}
            <SwitchPrimitive.Root
              id="annual-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Toggle annual billing"
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
                'border-2 border-transparent outline-none',
                'transition-colors duration-200 ease-in-out',
                'focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
                'data-[state=checked]:bg-[#3370FF]',
                'data-[state=unchecked]:bg-[#E5E7EB]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <SwitchPrimitive.Thumb
                className={cn(
                  'pointer-events-none block h-4 w-4 rounded-full bg-white',
                  'shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
                  'transition-transform duration-200',
                  'data-[state=checked]:translate-x-5',
                  'data-[state=unchecked]:translate-x-0.5'
                )}
              />
            </SwitchPrimitive.Root>

            <label
              htmlFor="annual-toggle"
              className="cursor-pointer select-none text-sm text-[#374151]"
            >
              Annual billing
            </label>

            {/* Save badge — only visible when annual is active */}
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                'transition-opacity duration-200',
                annual
                  ? 'bg-[#3370FF]/10 text-[#3370FF] opacity-100'
                  : 'opacity-0 pointer-events-none select-none bg-[#3370FF]/10 text-[#3370FF]'
              )}
              aria-live="polite"
              aria-label={annual ? 'Save 20% with annual billing' : ''}
            >
              Save 20%
            </span>
          </div>

          {/* Tier cards grid — 3 cols on sm+, single col on mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TierCard
              tier="discover"
              annual={annual}
              highlighted={false}
              onSelect={() => handleSelect('discover')}
              loading={loadingTier === 'discover'}
            />
            <TierCard
              tier="build"
              annual={annual}
              highlighted={true}
              onSelect={() => handleSelect('build')}
              loading={loadingTier === 'build'}
            />
            <TierCard
              tier="scale"
              annual={annual}
              highlighted={false}
              onSelect={() => handleSelect('scale')}
              loading={loadingTier === 'scale'}
            />
          </div>

          {/* Trust row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#10B981]" strokeWidth={2} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

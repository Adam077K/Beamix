'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive, Switch as SwitchPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TierCard, TierKey } from './TierCard'

export interface PaywallModalProps {
  open: boolean
  onClose: () => void
  triggerContext?: string
}

export function PaywallModal({ open, onClose, triggerContext }: PaywallModalProps) {
  const [annual, setAnnual] = React.useState(true)
  const [checkoutBanner, setCheckoutBanner] = React.useState<TierKey | null>(null)

  function handleSelect(tier: TierKey) {
    console.log('[PaywallModal] checkout start', { tier, annual })
    setCheckoutBanner(tier)
    setTimeout(() => {
      setCheckoutBanner(null)
      onClose()
    }, 1500)
  }

  // Reset banner when modal closes
  React.useEffect(() => {
    if (!open) setCheckoutBanner(null)
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
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[880px] max-h-[90vh] overflow-y-auto',
            'rounded-2xl bg-white p-8',
            'shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'duration-200 outline-none',
            'mx-4 sm:mx-0'
          )}
        >
          {/* Close button */}
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              'absolute right-5 top-5 rounded-lg p-1.5 text-gray-400',
              'hover:bg-gray-100 hover:text-gray-600',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2'
            )}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="mb-6">
            <DialogPrimitive.Title className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
              Unlock Beamix
            </DialogPrimitive.Title>
            {triggerContext && (
              <DialogPrimitive.Description className="mt-1.5 text-sm text-gray-500">
                {triggerContext}
              </DialogPrimitive.Description>
            )}
          </div>

          {/* Billing toggle */}
          <div className="mb-7 flex items-center gap-3">
            <SwitchPrimitive.Root
              id="annual-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
              className={cn(
                'group/switch inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent',
                'shadow-xs transition-all outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
                'data-[state=checked]:bg-[#3370FF] data-[state=unchecked]:bg-gray-200',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <SwitchPrimitive.Thumb
                className={cn(
                  'pointer-events-none block h-4 w-4 rounded-full bg-white ring-0',
                  'transition-transform',
                  'data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
                )}
              />
            </SwitchPrimitive.Root>
            <label
              htmlFor="annual-toggle"
              className="cursor-pointer select-none text-sm text-gray-700"
            >
              Save 20% with annual billing
              <span className="ml-2 inline-flex items-center rounded-full bg-[#3370FF]/10 px-2 py-0.5 text-xs font-medium text-[#3370FF]">
                2 months free
              </span>
            </label>
          </div>

          {/* Checkout banner */}
          {checkoutBanner && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-[#3370FF]/8 px-4 py-2.5 text-sm text-[#3370FF]">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#3370FF]/30 border-t-[#3370FF]" />
              Redirecting to checkout...
            </div>
          )}

          {/* Tier cards — 3-col grid on md+, single col on mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TierCard
              tier="discover"
              annual={annual}
              highlighted={false}
              onSelect={() => handleSelect('discover')}
            />
            <TierCard
              tier="build"
              annual={annual}
              highlighted={true}
              onSelect={() => handleSelect('build')}
            />
            <TierCard
              tier="scale"
              annual={annual}
              highlighted={false}
              onSelect={() => handleSelect('scale')}
            />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            All plans include a 14-day money-back guarantee. No contracts, cancel anytime.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

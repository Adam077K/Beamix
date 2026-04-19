'use client'

import * as React from 'react'
import { PaywallModal } from './PaywallModal'
import { TierKey } from './TierCard'

type TierWithNull = TierKey | null

const TIER_ORDER: Array<TierWithNull> = [null, 'discover', 'build', 'scale']

function tierIndex(tier: TierWithNull): number {
  return TIER_ORDER.indexOf(tier)
}

function meetsRequirement(current: TierWithNull, required: TierKey): boolean {
  return tierIndex(current) >= tierIndex(required)
}

export interface PaywallGateProps {
  requiredTier: TierKey
  currentTier: TierWithNull
  children: React.ReactNode
  context?: string
}

export function PaywallGate({
  requiredTier,
  currentTier,
  children,
  context,
}: PaywallGateProps) {
  const [open, setOpen] = React.useState(false)

  const hasAccess = meetsRequirement(currentTier, requiredTier)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <>
      {/* Intercept any click on children and open the paywall modal */}
      <span
        className="contents"
        onClickCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        // Keyboard accessibility: intercept Enter/Space on focused children
        onKeyDownCapture={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }
        }}
        aria-label={`Upgrade to ${requiredTier} to access this feature`}
      >
        {children}
      </span>

      <PaywallModal
        open={open}
        onClose={() => setOpen(false)}
        triggerContext={context}
      />
    </>
  )
}

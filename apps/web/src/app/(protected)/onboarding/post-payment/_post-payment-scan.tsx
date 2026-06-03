'use client'

import { FreeScanFlow } from '@/app/(public)/scan/_components/FreeScanFlow'

/**
 * Full-bleed wrapper for the post-payment onboarding scan (ACT 4).
 *
 * Fixed over the dashboard shell, auto-starts the scanning ledger on the new
 * customer's business, and routes the reveal CTA into the dashboard instead of
 * the discovery funnel.
 *
 * Real-engine seam: replace the hard-coded autoStart with the values from the
 * onboarding record once the pipeline ships.
 */
export function PostPaymentScan() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <FreeScanFlow
        autoStart={{ domain: 'fortucci-dental.com', businessName: 'Fortucci Dental' }}
        revealCtaHref="/home"
        revealCtaLabel="Go to my dashboard →"
        revealSecondaryLabel={null}
      />
    </div>
  )
}

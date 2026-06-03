'use client'

import { useCallback, useState } from 'react'
import { ErrorState } from '@/components/error-state'
import { EntryForm, type EntrySubmitPayload } from './EntryForm'
import { ScanningLedger } from './ScanningLedger'
import { ScoreReveal } from './ScoreReveal'
import { useMockScan } from './useMockScan'

/**
 * Free-scan act orchestrator (DESIGN-DIRECTION — three acts as one continuous
 * funnel). ENTRY → SCANNING (with the §3 "needle settles" hand-off) → REVEAL.
 *
 * The transition is never a hard cut or page reload (anti-generic #9): the
 * ledger lifts out (`clearing`) and the ring scales in at the same anchor.
 *
 * `autoStartDomain` lets the post-payment onboarding act skip ENTRY and kick the
 * same scanning component immediately (DESIGN-DIRECTION §5 #4).
 */

type Act = 'entry' | 'scan' | 'failed'

interface FreeScanFlowProps {
  /** When set, skip ENTRY and start scanning this domain immediately. */
  autoStart?: EntrySubmitPayload
  /** Override the reveal CTA (onboarding routes to the dashboard, not discovery). */
  revealCtaHref?: string
  revealSecondaryHref?: string
  revealCtaLabel?: string
  /** null hides the secondary link (onboarding). */
  revealSecondaryLabel?: string | null
}

export function FreeScanFlow({
  autoStart,
  revealCtaHref,
  revealSecondaryHref,
  revealCtaLabel,
  revealSecondaryLabel,
}: FreeScanFlowProps) {
  const [act, setAct] = useState<Act>(autoStart ? 'scan' : 'entry')
  const [payload, setPayload] = useState<EntrySubmitPayload | null>(
    autoStart ?? null,
  )

  const handleSubmit = useCallback((p: EntrySubmitPayload) => {
    setPayload(p)
    setAct('scan')
  }, [])

  const handleRetry = useCallback(() => {
    setPayload(null)
    setAct('entry')
  }, [])

  if (act === 'failed') {
    return (
      <main className="min-h-[100dvh] bg-white">
        <ErrorState
          title="We couldn’t start your scan"
          description="Something went wrong reaching the AI engines. Try again — it usually clears right up."
          onRetry={handleRetry}
        />
      </main>
    )
  }

  if (act === 'scan' && payload) {
    return (
      <main className="min-h-[100dvh] bg-white">
        <ScanRunner
          domain={payload.domain}
          businessName={payload.businessName}
          revealCtaHref={revealCtaHref}
          revealSecondaryHref={revealSecondaryHref}
          revealCtaLabel={revealCtaLabel}
          revealSecondaryLabel={revealSecondaryLabel}
        />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-white">
      <EntryForm onSubmit={handleSubmit} />
    </main>
  )
}

/** Runs the scan + owns the scanning→reveal hand-off. Separate component so the
 *  useMockScan hook mounts fresh per scan (clean event lifecycle). */
function ScanRunner({
  domain,
  businessName,
  revealCtaHref,
  revealSecondaryHref,
  revealCtaLabel,
  revealSecondaryLabel,
}: {
  domain: string
  businessName?: string
  revealCtaHref?: string
  revealSecondaryHref?: string
  revealCtaLabel?: string
  revealSecondaryLabel?: string | null
}) {
  const { engines, progress, currentQuery, phase, result, enterReveal } =
    useMockScan(domain, businessName)

  // phase: 'scanning' → (last engine resolves) 'settling' → (rows cleared) 'reveal'
  if (phase === 'reveal' && result) {
    return (
      <ScoreReveal
        result={result}
        ctaHref={revealCtaHref}
        secondaryHref={revealSecondaryHref}
        ctaLabelOverride={revealCtaLabel}
        secondaryLabel={revealSecondaryLabel}
      />
    )
  }

  return (
    <ScanningLedger
      domain={domain}
      engines={engines}
      progress={progress}
      currentQuery={currentQuery}
      clearing={phase === 'settling'}
      onCleared={enterReveal}
    />
  )
}

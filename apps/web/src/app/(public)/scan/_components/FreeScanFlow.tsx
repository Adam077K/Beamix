'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/error-state'
import { EntryForm, type EntrySubmitPayload } from './EntryForm'
import { ScanningLedger } from './ScanningLedger'
import { ScoreReveal } from './ScoreReveal'
import { useMockScan } from './useMockScan'
import { useLiveScan } from './useLiveScan'

/**
 * Free-scan act orchestrator (DESIGN-DIRECTION — three acts as one continuous
 * funnel). ENTRY → SCANNING → REVEAL (server-redirect).
 *
 * The transition is never a hard cut or page reload: the ledger lifts out
 * (`clearing`) and then navigates to the server-rendered /scan/[scanId] page
 * for the authoritative PII-safe result reveal.
 *
 * `autoStartDomain` lets the post-payment onboarding act skip ENTRY and kick the
 * same scanning component immediately (DESIGN-DIRECTION §5 #4).
 *
 * Hooks-of-hooks rule: useLiveScan vs useMockScan must NEVER be called
 * conditionally. We split into two separate runner components — ScanRunnerLive
 * and ScanRunnerMock — so each has its own hook call tree. The orchestrator
 * chooses which component to render based on whether a scanId exists.
 */

// v4 UUID format guard — must match the same regex used in the progress route.
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Dev flag: forces the mock scan path regardless of whether a real scan_id
// was returned from the backend. Set NEXT_PUBLIC_SCAN_FORCE_MOCK=1 in .env.local.
// Also active when no scan_id is present (autoStart without email/token).
const FORCE_MOCK = process.env.NEXT_PUBLIC_SCAN_FORCE_MOCK === '1'

type Act = 'entry' | 'scan' | 'failed'

interface ScanPayload extends EntrySubmitPayload {
  scanId?: string
}

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
  const [payload, setPayload] = useState<ScanPayload | null>(
    autoStart ?? null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(async (p: EntrySubmitPayload) => {
    // autoStart path (mock): no email/token — skip network call and go straight to mock scan.
    if (!p.email || !p.turnstileToken) {
      setPayload(p)
      setAct('scan')
      return
    }

    // POST to the real backend.
    try {
      const res = await fetch('/api/scan/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: p.businessName ?? p.domain,
          website_url: `https://${p.domain}`,
          email: p.email,
          turnstile_token: p.turnstileToken,
        }),
      })

      if (res.status === 202) {
        const { scan_id } = (await res.json()) as { scan_id: string }

        // Validate scan_id is a real v4 UUID before trusting it for navigation
        // and Realtime subscriptions. An invalid value here would cause a bad
        // Realtime subscription filter and a nonsensical redirect URL.
        if (typeof scan_id !== 'string' || !UUID_V4_RE.test(scan_id)) {
          setErrorMessage('Received an unexpected response from the server. Please try again.')
          setAct('failed')
          return
        }

        setPayload({ ...p, scanId: scan_id })
        setAct('scan')
        return
      }

      // Error path — extract server message.
      let message = 'Something went wrong. Please try again.'
      try {
        const body = (await res.json()) as { error?: string }
        if (body.error) message = body.error
      } catch {
        // ignore json parse failure
      }

      if (res.status === 429) {
        // Rate-limited — show in entry form instead of full failure screen.
        setErrorMessage(message)
        return
      }

      setErrorMessage(message)
      setAct('failed')
    } catch {
      setErrorMessage('Network error — check your connection and try again.')
      setAct('failed')
    }
  }, [])

  const handleRetry = useCallback(() => {
    setPayload(null)
    setErrorMessage(null)
    setAct('entry')
  }, [])

  if (act === 'failed') {
    return (
      <main className="min-h-[100dvh] bg-white">
        <ErrorState
          title="We couldn&apos;t start your scan"
          description={
            errorMessage ??
            "Something went wrong reaching the AI engines. Try again — it usually clears right up."
          }
          onRetry={handleRetry}
        />
      </main>
    )
  }

  if (act === 'scan' && payload) {
    // Live path: real scan_id from backend AND not overridden by the dev flag.
    if (payload.scanId && !FORCE_MOCK) {
      return (
        <main className="min-h-[100dvh] bg-white">
          <ScanRunnerLive
            scanId={payload.scanId}
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

    // Mock path: no scanId (autoStart / storybook) OR NEXT_PUBLIC_SCAN_FORCE_MOCK=1.
    return (
      <main className="min-h-[100dvh] bg-white">
        <ScanRunnerMock
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

// ── ScanRunnerLive ────────────────────────────────────────────────────────────
// Drives the scan from the live backend via useLiveScan. On enterReveal,
// navigates to /scan/[scanId] — the authoritative server-rendered result page.
// This is the PII-safe reveal strategy (no client-side free_scans read).

interface ScanRunnerLiveProps {
  scanId: string
  domain: string
  businessName?: string
  revealCtaHref?: string
  revealSecondaryHref?: string
  revealCtaLabel?: string
  revealSecondaryLabel?: string | null
}

function ScanRunnerLive({
  scanId,
  domain,
  businessName,
}: ScanRunnerLiveProps) {
  const router = useRouter()
  const { engines, progress, currentQuery, phase, enterReveal } =
    useLiveScan(scanId, domain, businessName)

  // On enterReveal (ledger clear animation done), navigate to the server result page.
  const handleEnterReveal = useCallback(() => {
    enterReveal()
    // Prefetch then navigate — the /scan/[scanId] page is server-rendered + PII-safe.
    router.push(`/scan/${scanId}`)
  }, [enterReveal, router, scanId])

  // phase 'reveal' is handled by the navigation above — this branch is a
  // safety fallback in case navigation is slow.
  if (phase === 'reveal') {
    return null
  }

  return (
    <ScanningLedger
      domain={domain}
      engines={engines}
      progress={progress}
      currentQuery={currentQuery}
      clearing={phase === 'settling'}
      onCleared={handleEnterReveal}
    />
  )
}

// ── ScanRunnerMock ────────────────────────────────────────────────────────────
// Drives the scan from the mock emitter (storybook/preview/autoStart path).
// Renders ScoreReveal client-side using the mock result (no real backend).

interface ScanRunnerMockProps {
  domain: string
  businessName?: string
  revealCtaHref?: string
  revealSecondaryHref?: string
  revealCtaLabel?: string
  revealSecondaryLabel?: string | null
}

function ScanRunnerMock({
  domain,
  businessName,
  revealCtaHref,
  revealSecondaryHref,
  revealCtaLabel,
  revealSecondaryLabel,
}: ScanRunnerMockProps) {
  const { engines, progress, currentQuery, phase, result, enterReveal } =
    useMockScan(domain, businessName)

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

'use client'

import { useCallback, useMemo, useState } from 'react'
import { ScanEntry } from './scan-entry'
import { ScanningMoment } from './scanning-moment'
import { ScoreReveal } from './score-reveal'
import { useScanSimulation } from './use-scan-simulation'
import { buildMockResult, type ScanResult } from './scan-mock'

type Phase = 'entry' | 'scanning' | 'reveal'

/**
 * ScanFlow — the three-act free-scan experience on one client surface.
 *
 *   entry → scanning (Act B mock-timed) → reveal (Act C mock result)
 *
 * ⚠️ MOCK SEAMS:
 *   - `handleStart` builds the result synchronously from `buildMockResult`.
 *     Real wiring: POST /api/scan/free here, then poll/stream for the result
 *     and set it on the `done` callback instead of pre-computing it.
 *   - The scanning theatre is driven by `useScanSimulation` (mock timers).
 */
export function ScanFlow() {
  const [phase, setPhase] = useState<Phase>('entry')
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)

  const handleStart = useCallback((nextDomain: string) => {
    setDomain(nextDomain)
    // MOCK: compute the result up front; real engine returns this after scan.
    setResult(buildMockResult(nextDomain))
    setPhase('scanning')
  }, [])

  const handleScanComplete = useCallback(() => {
    setPhase('reveal')
  }, [])

  const { engines, progress } = useScanSimulation({
    active: phase === 'scanning',
    onComplete: handleScanComplete,
  })

  // Stable key so the fade re-triggers per phase.
  const fadeKey = useMemo(() => phase, [phase])

  return (
    <div
      key={fadeKey}
      className="motion-safe:animate-[fadeIn_400ms_cubic-bezier(0.22,1,0.36,1)_both]"
    >
      {phase === 'entry' && <ScanEntry onSubmit={handleStart} />}

      {phase === 'scanning' && (
        <ScanningMoment domain={domain} engines={engines} progress={progress} />
      )}

      {phase === 'reveal' && result && (
        <ScoreReveal domain={domain} result={result} ctaHref="/discovery" />
      )}
    </div>
  )
}

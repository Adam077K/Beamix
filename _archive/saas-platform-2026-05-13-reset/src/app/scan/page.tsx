'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PreScanForm, type PreScanFormData } from '@/components/scan/PreScanForm'
import { ScanningAnimation } from '@/components/scan/ScanningAnimation'
import { WoundRevealResult, type ScanResultData } from '@/components/scan/WoundRevealResult'

type Phase = 'form' | 'scanning' | 'result'

const mockScanResult: ScanResultData = {
  score: 6.7,
  mentionedQueries: 2,
  totalQueries: 30,
  competitors: [
    {
      name: 'RivalCo',
      mentionsIn: 8,
      sampleQueries: ['best X for SMBs', 'X pricing 2026'],
    },
    {
      name: 'Challenger.io',
      mentionsIn: 6,
      sampleQueries: ['X alternatives', 'compare X vs Y'],
    },
    {
      name: 'NewcomerLabs',
      mentionsIn: 4,
      sampleQueries: ['affordable X', 'X for startups'],
    },
  ],
  visibleFixes: [
    { title: 'Add FAQ section to your pricing page', impact: 'high', quickFix: true },
    { title: 'Refresh homepage copy to answer common AI queries', impact: 'medium', quickFix: false },
    { title: 'Claim missing directory and review listings', impact: 'medium', quickFix: true },
  ],
  lockedFixes: 8,
}

export default function ScanPage() {
  const [phase, setPhase] = React.useState<Phase>('form')
  const [formData, setFormData] = React.useState<PreScanFormData | null>(null)
  const [scanData] = React.useState<ScanResultData>(mockScanResult)
  const scanTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFormSubmit(data: PreScanFormData) {
    setFormData(data)
    setPhase('scanning')

    // Simulate 4-second scan then reveal result
    scanTimerRef.current = setTimeout(() => {
      setPhase('result')
    }, 4000)
  }

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
    }
  }, [])

  return (
    <main>
      <AnimatePresence mode="wait">
        {phase === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[100dvh] flex items-center justify-center bg-[#F7F7F7] px-4 py-12"
          >
            <PreScanForm onSubmit={handleFormSubmit} />
          </motion.div>
        )}

        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ScanningAnimation />
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <WoundRevealResult
              data={scanData}
              businessUrl={formData?.url}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

import type { Metadata } from 'next'
import { FreeScanFlow } from './_components/FreeScanFlow'

export const metadata: Metadata = {
  title: 'Free AI-Search Scan',
  description:
    'See where AI search can’t find you. We check ChatGPT, Gemini, and Perplexity for your business in about 15 seconds.',
}

/**
 * The free scan — the company's front door (DESIGN-DIRECTION FREE-SCAN).
 * Three acts as one continuous funnel: ENTRY → SCANNING LEDGER → REVEAL.
 * Currently mock-driven; the real pipeline wires in at the seams documented in
 * _components/scan-contract.ts and useMockScan.ts.
 */
export default function ScanPage() {
  return <FreeScanFlow />
}

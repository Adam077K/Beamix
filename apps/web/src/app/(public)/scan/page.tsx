import type { Metadata } from 'next'
import { ScanFlow } from './_components/scan-flow'

export const metadata: Metadata = {
  title: 'Free AI search scan',
  description:
    'See where ChatGPT, Gemini, and Perplexity ignore your business — in under a minute, no signup.',
}

/**
 * /scan — the free-scan front door (Wave C).
 *
 * Three acts on a white canvas, max-w-560px:
 *   A. Entry      — one confident domain input + CTA
 *   B. Scanning   — live engine-by-engine deploy-log moment (the screenshot)
 *   C. Reveal     — animated score ring + blunt verdict + gap rows + CTA
 *
 * All client-driven and mock-data backed — see _components/scan-mock.ts for
 * the exact seams to wire the real scan engine.
 */
export default function ScanPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Quiet brand bar — a real toolbar floor, not a hero. */}
      <header className="flex h-14 items-center justify-center border-b border-[#E5E7EB] px-6">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M6 6h9a5 5 0 0 1 0 10H6V6Zm0 10h10a5 5 0 0 1 0 10H6V16Z"
              fill="#3370FF"
            />
            <circle cx="22" cy="6" r="2.5" fill="#3370FF" fillOpacity="0.45" />
          </svg>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
            Beamix
          </span>
        </div>
      </header>

      <div className="flex justify-center px-6 pb-24 pt-[12vh] sm:pt-[14vh]">
        <div className="w-full max-w-[560px]">
          <ScanFlow />
        </div>
      </div>
    </main>
  )
}

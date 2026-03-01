import type { Metadata } from 'next'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export const metadata: Metadata = {
  title: 'Onboarding — Beamix',
  description: 'Set up your business profile to start scanning AI search engines.',
}

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <div className="mb-8">
        <span className="font-display text-2xl font-bold text-[var(--color-text)]">
          Beam<span className="text-[var(--color-accent)]">ix</span>
        </span>
      </div>
      <OnboardingFlow />
    </div>
  )
}

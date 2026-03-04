import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixHero } from '@/components/landing/beamix-hero'
import { BeamixTrustBar } from '@/components/landing/beamix-trust-bar'
import { BeamixWakeupCall } from '@/components/landing/beamix-wakeup-call'
import { BeamixProductPreview } from '@/components/landing/beamix-product-preview'
import { BeamixHowItWorks } from '@/components/landing/beamix-how-it-works'
import { BeamixAgentsShowcase } from '@/components/landing/beamix-agents-showcase'
import { BeamixPricing } from '@/components/landing/beamix-pricing'
import { BeamixTestimonials } from '@/components/landing/beamix-testimonials'
import { BeamixFinalCTA } from '@/components/landing/beamix-final-cta'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      <BeamixNav />
      <BeamixHero />
      <BeamixTrustBar />
      <BeamixWakeupCall />
      <BeamixProductPreview />
      <BeamixHowItWorks />
      <BeamixAgentsShowcase />
      <BeamixPricing />
      <BeamixTestimonials />
      <BeamixFinalCTA />
      <BeamixFooter />
    </main>
  )
}

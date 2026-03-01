import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixHero } from '@/components/landing/beamix-hero'
import { BeamixWakeupCall } from '@/components/landing/beamix-wakeup-call'
import { BeamixCostSection } from '@/components/landing/beamix-cost-section'
import { BeamixHowItWorks } from '@/components/landing/beamix-how-it-works'
import { BeamixPricing } from '@/components/landing/beamix-pricing'
import { BeamixTestimonials } from '@/components/landing/beamix-testimonials'
import { BeamixFinalCTA } from '@/components/landing/beamix-final-cta'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      <BeamixNav />
      <BeamixHero />
      <BeamixWakeupCall />
      <BeamixCostSection />
      <BeamixHowItWorks />
      <BeamixPricing />
      <BeamixTestimonials />
      <BeamixFinalCTA />
      <BeamixFooter />
    </main>
  )
}

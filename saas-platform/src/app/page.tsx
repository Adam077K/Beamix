import { HpNav } from '@/components/landing/hp-nav'
import { HpHero } from '@/components/landing/hp-hero'
import { HpHeroIllustration } from '@/components/landing/hp-hero-illustration'
import { HpTrustBar } from '@/components/landing/hp-trust-bar'
import { HpFeatureSection } from '@/components/landing/hp-feature-section'
import { HpStats } from '@/components/landing/hp-stats'
import { HpTestimonial } from '@/components/landing/hp-testimonial'
import { HpFeatureCards } from '@/components/landing/hp-feature-cards'
import { HpFinalCta } from '@/components/landing/hp-final-cta'
import { HpFooter } from '@/components/landing/hp-footer'

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF7]">
      <HpNav />
      <HpHero />
      <HpHeroIllustration />
      <HpTrustBar />
      <HpFeatureSection />
      <HpStats />
      <div className="max-w-4xl mx-auto px-6 py-0"><hr className="border-[#E8E6E1]" /></div>
      <HpTestimonial />
      <div className="max-w-4xl mx-auto px-6 py-0"><hr className="border-[#E8E6E1]" /></div>
      <HpFeatureCards />
      <HpFinalCta />
      <HpFooter />
    </main>
  )
}

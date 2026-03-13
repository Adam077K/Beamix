import { HpNav } from '@/components/landing/hp-nav'
import { HpHero } from '@/components/landing/hp-hero'
import { HpProblem } from '@/components/landing/hp-problem'
import { HpWhy } from '@/components/landing/hp-why'
import { HpHowItWorks } from '@/components/landing/hp-how-it-works'
import { HpFeatureSection } from '@/components/landing/hp-feature-section'
import { HpFeatureCards } from '@/components/landing/hp-feature-cards'
import { HpGeoVsSeo } from '@/components/landing/hp-geo-vs-seo'
import { HpStats } from '@/components/landing/hp-stats'
import { HpTestimonial } from '@/components/landing/hp-testimonial'
import { HpPricingPreview } from '@/components/landing/hp-pricing-preview'
import { HpFaq } from '@/components/landing/hp-faq'
import { HpFinalCta } from '@/components/landing/hp-final-cta'
import { HpFooter } from '@/components/landing/hp-footer'

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF9]">
      <HpNav />
      <HpHero />
      <HpProblem />
      <HpWhy />
      <HpHowItWorks />
      <HpFeatureSection />
      <HpFeatureCards />
      <HpGeoVsSeo />
      <HpStats />
      <div className="max-w-4xl mx-auto px-6 py-0"><hr className="border-[#E8E6E1]" /></div>
      <HpTestimonial />
      <div className="max-w-4xl mx-auto px-6 py-0"><hr className="border-[#E8E6E1]" /></div>
      <HpPricingPreview />
      <HpFaq />
      <HpFinalCta />
      <HpFooter />
    </main>
  )
}

import { HpNav } from '@/components/landing/hp-nav'
import { HpFooter } from '@/components/landing/hp-footer'
import { WhyHero } from '@/components/landing/why-hero'
import { WhyGap } from '@/components/landing/why-gap'
import { WhyBeliefs } from '@/components/landing/why-beliefs'
import { WhyNow } from '@/components/landing/why-now'
import { HiwFinalCta } from '@/components/landing/hiw-final-cta'

export default function WhyBeamixPage() {
  return (
    <main className="bg-[#FAFAF9]">
      <HpNav />
      <WhyHero />
      <WhyGap />
      <WhyBeliefs />
      <WhyNow />
      <HiwFinalCta
        headline="You've read enough. See where you actually stand."
        caption="No account · No credit card · 60 seconds"
        ctaLabel="Scan My Business — Free"
      />
      <HpFooter />
    </main>
  )
}

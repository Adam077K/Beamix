import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import CustomerLogos from '@/components/landing/CustomerLogos';
import ValueProposition from '@/components/landing/ValueProposition';
import FinAISection from '@/components/landing/FinAISection';
import CapabilitiesTabs from '@/components/landing/CapabilitiesTabs';
import PerformanceChart from '@/components/landing/PerformanceChart';
import TechnologyVideo from '@/components/landing/TechnologyVideo';
import TestimonialCard from '@/components/landing/TestimonialCard';
import FinFeaturesCTA from '@/components/landing/FinFeaturesCTA';
import HelpdeskIntro from '@/components/landing/HelpdeskIntro';
import ProductivityFeature from '@/components/landing/ProductivityFeature';
import UsabilityFeature from '@/components/landing/UsabilityFeature';
import OptimizationFeature from '@/components/landing/OptimizationFeature';
import G2Rankings from '@/components/landing/G2Rankings';
import HelpdeskCTA from '@/components/landing/HelpdeskCTA';
import OneSuiteHero from '@/components/landing/OneSuiteHero';
import SuiteBenefitsGrid from '@/components/landing/SuiteBenefitsGrid';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';
import PricingCTA from '@/components/landing/PricingCTA';
import Footer from '@/components/landing/Footer';

// Import testimonials for inline use
import { testimonials, getPlaceholderImage } from '@/components/landing/shared';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Customer Logos Strip */}
      <CustomerLogos />

      {/* Value Proposition: How it works */}
      <ValueProposition />

      {/* Fin AI Agent Section */}
      <FinAISection />

      {/* Capabilities Tabs */}
      <CapabilitiesTabs />

      {/* Performance Chart */}
      <PerformanceChart />

      {/* Testimonial: Dark variant */}
      <section className="intercom-bg-dark py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <TestimonialCard
            quote={testimonials[0].quote}
            name={testimonials[0].name}
            title={testimonials[0].title}
            company={testimonials[0].company}
            logoUrl={getPlaceholderImage(100, 30, testimonials[0].company, '2A3F6A', 'FFFFFF')}
            variant="dark"
          />
        </div>
      </section>

      {/* Technology Video */}
      <TechnologyVideo />

      {/* Fin Features CTA (Transition) */}
      <FinFeaturesCTA />

      {/* Helpdesk Section Intro */}
      <HelpdeskIntro />

      {/* Productivity Feature */}
      <ProductivityFeature />

      {/* Usability Feature */}
      <UsabilityFeature />

      {/* Optimization Feature */}
      <OptimizationFeature />

      {/* Testimonial: Light variant */}
      <section className="intercom-bg-white py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <TestimonialCard
            quote={testimonials[1].quote}
            name={testimonials[1].name}
            title={testimonials[1].title}
            company={testimonials[1].company}
            avatarUrl={getPlaceholderImage(300, 400, 'Portrait', 'E5E7EB', '6B7280')}
            variant="light"
          />
        </div>
      </section>

      {/* G2 Rankings */}
      <G2Rankings />

      {/* Helpdesk CTA (Transition) */}
      <HelpdeskCTA />

      {/* One Suite Hero */}
      <OneSuiteHero />

      {/* Suite Benefits Grid */}
      <SuiteBenefitsGrid />

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Pricing CTA */}
      <PricingCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}

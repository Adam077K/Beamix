'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface PricingPageClientProps {
  isLoggedIn: boolean
  scanId: string | null
}

const AI_ENGINES = {
  free: ['ChatGPT', 'Gemini', 'Perplexity', 'Bing Copilot'],
  starter: ['ChatGPT', 'Gemini', 'Perplexity', 'Bing Copilot'],
  pro: [
    'ChatGPT',
    'Gemini',
    'Perplexity',
    'Bing Copilot',
    'Claude',
    'Google AI Overviews',
    'Grok (X)',
    'You.com',
  ],
  business: [
    'ChatGPT',
    'Gemini',
    'Perplexity',
    'Bing Copilot',
    'Claude',
    'Google AI Overviews',
    'Grok (X)',
    'You.com',
    'More TBD',
    '...',
  ],
} as const

interface Plan {
  key: 'starter' | 'pro' | 'business'
  name: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  features: string[]
  popular: boolean
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 49,
    yearlyPrice: 470,
    description: 'For businesses getting started with AI visibility.',
    features: [
      '4 AI engines (ChatGPT, Gemini, Perplexity, Bing)',
      '10 tracked queries',
      '5 agent uses/month',
      'Weekly scans',
      'Email reports',
    ],
    popular: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 1430,
    description: 'Full AI search coverage with daily monitoring.',
    features: [
      '8 AI engines (+ Claude, AI Overviews, Grok, You.com)',
      '25 tracked queries',
      '15 agent uses/month',
      'Daily scans',
      'Priority support',
    ],
    popular: true,
  },
  {
    key: 'business',
    name: 'Business',
    monthlyPrice: 349,
    yearlyPrice: 3350,
    description: 'Enterprise-grade visibility with dedicated support.',
    features: [
      '10+ AI engines',
      'Unlimited queries',
      '50 agent uses/month',
      'Unlimited scans',
      'Dedicated account manager',
      'Custom integrations',
    ],
    popular: false,
  },
]

interface FeatureRow {
  name: string
  free: string | boolean
  starter: string | boolean
  pro: string | boolean
  business: string | boolean
}

interface FeatureSection {
  title: string
  rows: FeatureRow[]
}

const FEATURE_MATRIX: FeatureSection[] = [
  {
    title: 'AI Engine Coverage',
    rows: [
      { name: 'ChatGPT', free: true, starter: true, pro: true, business: true },
      { name: 'Gemini', free: true, starter: true, pro: true, business: true },
      { name: 'Perplexity', free: true, starter: true, pro: true, business: true },
      { name: 'Bing Copilot', free: true, starter: true, pro: true, business: true },
      { name: 'Claude', free: false, starter: false, pro: true, business: true },
      { name: 'Google AI Overviews', free: false, starter: false, pro: true, business: true },
      { name: 'Grok (X)', free: false, starter: false, pro: true, business: true },
      { name: 'You.com', free: false, starter: false, pro: true, business: true },
      { name: 'Additional engines', free: false, starter: false, pro: false, business: true },
    ],
  },
  {
    title: 'Scan Features',
    rows: [
      { name: 'Tracked queries', free: '3', starter: '10', pro: '25', business: 'Unlimited' },
      { name: 'Scan frequency', free: 'One-time', starter: 'Weekly', pro: 'Daily', business: 'Unlimited' },
      { name: 'Visibility score', free: true, starter: true, pro: true, business: true },
      { name: 'Competitor analysis', free: 'Basic', starter: 'Basic', pro: 'Full', business: 'Full' },
      { name: 'Historical tracking', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    title: 'Agent Capabilities',
    rows: [
      { name: 'Agent uses/month', free: false, starter: '5', pro: '15', business: '50' },
      { name: 'Blog Writer agent', free: false, starter: true, pro: true, business: true },
      { name: 'Schema Optimizer agent', free: false, starter: true, pro: true, business: true },
      { name: 'FAQ Generator agent', free: false, starter: true, pro: true, business: true },
      { name: 'Content Refresher agent', free: false, starter: false, pro: true, business: true },
      { name: 'Rollover (20% cap)', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    title: 'Content Tools',
    rows: [
      { name: 'Content library', free: false, starter: true, pro: true, business: true },
      { name: 'Inline Markdown editor', free: false, starter: true, pro: true, business: true },
      { name: 'Quick win recommendations', free: '3', starter: 'All', pro: 'All', business: 'All' },
      { name: 'Export content', free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    title: 'Reporting & Analytics',
    rows: [
      { name: 'Email reports', free: false, starter: 'Weekly', pro: 'Daily', business: 'Custom' },
      { name: 'Dashboard analytics', free: false, starter: true, pro: true, business: true },
      { name: 'Trend graphs', free: false, starter: true, pro: true, business: true },
      { name: 'Custom reports', free: false, starter: false, pro: false, business: true },
    ],
  },
  {
    title: 'Support',
    rows: [
      { name: 'Help center', free: true, starter: true, pro: true, business: true },
      { name: 'Email support', free: false, starter: true, pro: true, business: true },
      { name: 'Priority support', free: false, starter: false, pro: true, business: true },
      { name: 'Dedicated account manager', free: false, starter: false, pro: false, business: true },
    ],
  },
]

const FAQ_ITEMS = [
  {
    q: 'What is GEO?',
    a: 'GEO stands for Generative Engine Optimization. It\'s the practice of making your business visible and accurately represented in AI-powered search engines like ChatGPT, Gemini, Perplexity, and others. Think of it as SEO for the AI era.',
  },
  {
    q: 'How does Beamix scan AI engines?',
    a: 'Beamix queries each AI engine with search terms relevant to your business and industry. We analyze the responses to determine if your business is mentioned, how accurately it\'s represented, and how you compare to competitors.',
  },
  {
    q: "What's included in the free scan?",
    a: 'The free scan checks your business across 4 major AI engines (ChatGPT, Gemini, Perplexity, Bing Copilot). You get a visibility score, competitive ranking, and 3 personalized quick-win recommendations. No account required.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel with one click from your settings page. No questions asked, no penalties, no hidden fees. Your data is preserved if you decide to come back.',
  },
  {
    q: 'What happens after my trial ends?',
    a: 'After 14 days, your account enters read-only mode. All your data, scan history, and content are preserved. Upgrade anytime to regain full access.',
  },
  {
    q: 'How do agent uses work?',
    a: 'Each time you use an AI agent (Blog Writer, Schema Optimizer, FAQ Generator, etc.) to generate or optimize content, it counts as one agent use. Results are saved to your content library for easy access.',
  },
  {
    q: 'Do unused agent uses roll over?',
    a: '20% of your unused monthly agent uses roll over to the next month, capped at 50% of your plan\'s monthly allowance. This gives you flexibility without waste.',
  },
  {
    q: "What's the difference between Starter and Pro?",
    a: 'Starter covers 4 AI engines with weekly scans — great for getting started. Pro expands to 8 engines with daily scans, 3x more agent uses, and priority support. Pro is ideal for businesses serious about AI visibility.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SmartCta({
  isLoggedIn,
  scanId,
  className,
}: {
  isLoggedIn: boolean
  scanId: string | null
  className?: string
}) {
  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className={className}
      >
        Go to Dashboard
      </Link>
    )
  }
  if (scanId) {
    return (
      <Link
        href={`/signup?scan_id=${scanId}`}
        className={className}
      >
        Continue with My Scan
      </Link>
    )
  }
  return (
    <Link href="/signup" className={className}>
      Start Free Trial
    </Link>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <CheckIcon className="text-[#06B6D4] mx-auto" />
  }
  if (value === false) {
    return <XIcon className="text-stone-300 mx-auto" />
  }
  return <span className="text-sm text-stone-600">{value}</span>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PricingPageClient({ isLoggedIn, scanId }: PricingPageClientProps) {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const ctaStyle =
    'inline-block bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors'

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <BeamixNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl lg:text-6xl text-[#141310] mb-4">
            Start free. Upgrade when you see results.
          </h1>
          <p className="text-lg text-stone-500 mb-6 max-w-xl mx-auto">
            Every plan includes a 7-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <CheckIcon className="text-[#06B6D4]" />
              7-day trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="text-[#06B6D4]" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="text-[#06B6D4]" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="px-6 pb-4">
        <div className="flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!annual ? 'text-[#141310]' : 'text-stone-400'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              annual ? 'bg-[#06B6D4]' : 'bg-stone-300'
            }`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                annual ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? 'text-[#141310]' : 'text-stone-400'}`}
          >
            Annual{' '}
            <span className="text-green-600 font-semibold">Save 20%</span>
          </span>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-5">
          {/* Free Scan Card */}
          <div className="bg-white rounded-[20px] p-8 border border-stone-200 shadow-sm flex flex-col">
            <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mb-1">
              Free Scan
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              See where you stand in 60 seconds.
            </p>
            <div className="mb-6">
              <span className="text-5xl font-[family-name:var(--font-outfit)] font-bold text-[#141310]">
                $0
              </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                '4 AI engines',
                '3 tracked queries',
                'Visibility score',
                '3 quick-win recommendations',
                'No account required',
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-stone-600"
                >
                  <CheckIcon className="text-[#06B6D4] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/scan"
              className="block text-center py-3 rounded-[14px] font-semibold text-sm bg-stone-100 hover:bg-stone-200 text-[#141310] transition-colors"
            >
              Try it free &rarr;
            </Link>
          </div>

          {/* Paid Plans */}
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`bg-white rounded-[20px] p-8 border relative flex flex-col ${
                plan.popular
                  ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/20 shadow-lg'
                  : 'border-stone-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06B6D4] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-stone-500 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-[family-name:var(--font-outfit)] font-bold text-[#141310]">
                  ${annual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-stone-400 text-sm">/mo</span>
                {annual && (
                  <p className="text-xs text-stone-400 mt-1">
                    Billed ${plan.yearlyPrice}/yr
                  </p>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-stone-600"
                  >
                    <CheckIcon className="text-[#06B6D4] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <SmartCta
                isLoggedIn={isLoggedIn}
                scanId={scanId}
                className={`block text-center py-3 rounded-[14px] font-semibold text-sm transition-colors ${
                  plan.popular
                    ? 'bg-[#06B6D4] hover:bg-cyan-600 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-[#141310]'
                }`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl text-[#141310] text-center mb-4">
            Compare all features
          </h2>
          <p className="text-center text-stone-500 mb-12 max-w-lg mx-auto">
            Everything you need to dominate AI search — from free scan to full
            enterprise coverage.
          </p>

          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 border-b border-stone-200 bg-stone-50/50">
              <div className="p-4" />
              <div className="p-4 text-center text-sm font-semibold text-stone-500">
                Free
              </div>
              <div className="p-4 text-center text-sm font-semibold text-stone-500">
                Starter
              </div>
              <div className="p-4 text-center text-sm font-semibold text-[#06B6D4]">
                Pro
              </div>
              <div className="p-4 text-center text-sm font-semibold text-stone-500">
                Business
              </div>
            </div>

            {/* Sections */}
            {FEATURE_MATRIX.map((section) => (
              <div key={section.title}>
                <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100">
                  <span className="font-[family-name:var(--font-outfit)] font-semibold text-sm text-[#141310]">
                    {section.title}
                  </span>
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.name}
                    className={`grid grid-cols-5 ${
                      i < section.rows.length - 1
                        ? 'border-b border-stone-100'
                        : ''
                    }`}
                  >
                    <div className="p-4 text-sm text-stone-600">
                      {row.name}
                    </div>
                    <div className="p-4 text-center">
                      <FeatureCell value={row.free} />
                    </div>
                    <div className="p-4 text-center">
                      <FeatureCell value={row.starter} />
                    </div>
                    <div className="p-4 text-center">
                      <FeatureCell value={row.pro} />
                    </div>
                    <div className="p-4 text-center">
                      <FeatureCell value={row.business} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Engines Explainer */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl text-[#141310] text-center mb-4">
            More engines = more visibility
          </h2>
          <p className="text-center text-stone-500 mb-12 max-w-lg mx-auto">
            Each AI engine has its own knowledge base and ranking logic. Covering
            more engines means your business is found wherever customers search.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {(
              [
                {
                  tier: 'Starter',
                  count: 4,
                  engines: AI_ENGINES.starter,
                  color: 'border-stone-200',
                  bg: 'bg-white',
                },
                {
                  tier: 'Pro',
                  count: 8,
                  engines: AI_ENGINES.pro,
                  color: 'border-[#06B6D4] ring-2 ring-[#06B6D4]/20',
                  bg: 'bg-white',
                },
                {
                  tier: 'Business',
                  count: '10+',
                  engines: AI_ENGINES.business,
                  color: 'border-stone-200',
                  bg: 'bg-white',
                },
              ] as const
            ).map((item) => (
              <div
                key={item.tier}
                className={`${item.bg} rounded-[20px] p-8 border ${item.color} shadow-sm`}
              >
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-[family-name:var(--font-outfit)] font-bold text-[#141310]">
                    {item.count}
                  </span>
                  <span className="text-stone-400 text-sm">engines</span>
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-lg text-[#141310] mb-4">
                  {item.tier}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.engines.map((engine) => (
                    <span
                      key={engine}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        item.tier === 'Starter'
                          ? 'bg-stone-100 text-stone-600'
                          : item.tier === 'Pro'
                            ? 'bg-cyan-50 text-cyan-700'
                            : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {engine}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl text-[#141310] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-[16px] overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-4 font-medium text-[#141310] flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span
                    className={`text-stone-400 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  >
                    &#8595;
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-stone-500 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#141310] to-stone-800 rounded-[24px] p-12">
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to be found by AI?
          </h2>
          <p className="text-stone-400 mb-8 max-w-md mx-auto">
            Start your free scan now. No credit card, no commitment — just
            results.
          </p>
          <SmartCta
            isLoggedIn={isLoggedIn}
            scanId={scanId}
            className={ctaStyle}
          />
        </div>
      </section>

      <BeamixFooter />
    </div>
  )
}

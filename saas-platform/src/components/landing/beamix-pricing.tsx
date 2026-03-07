'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Starter',
    monthlyPrice: 49,
    yearlyPrice: 470,
    features: ['10 tracked queries', '5 AI agent uses/month', '4 AI engines', 'Weekly scan', 'Email digest'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 1430,
    features: ['25 tracked queries', '15 AI agent uses/month', '8 AI engines', 'Every 3 days scan', 'Priority support', 'All Starter features'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    monthlyPrice: 349,
    yearlyPrice: 3350,
    features: ['75 tracked queries', '50 AI agent uses/month', '10+ AI engines', 'Daily scan', 'Dedicated support', 'Custom reporting'],
    cta: 'Start Free Trial',
    popular: false,
  },
]

const FAQ = [
  { q: 'What is a free scan?', a: 'A free scan checks your business across 4 major AI engines and shows your visibility score, rank, and 3 quick wins. No account required.' },
  { q: 'Do I need a credit card for the trial?', a: 'No. Your 7-day free trial starts without any payment information required.' },
  { q: 'What are AI agent uses?', a: 'Each time you use an AI agent (like Blog Writer or Schema Optimizer) to generate content, it counts as one agent use.' },
  { q: 'What happens after the trial ends?', a: 'Your data is preserved. You can upgrade to keep access, or your account enters read-only mode.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your settings. No questions, no penalties.' },
  { q: 'Do unused agent uses roll over?', a: '20% of unused monthly agent uses roll over to the next month, capped at 50% of your plan allowance.' },
  { q: 'What AI engines do you scan?', a: 'Free/Starter: ChatGPT, Gemini, Perplexity, Claude (4). Pro: +4 more including Google AI Overviews, Grok, and others. Business: 10+ engines.' },
  { q: 'Is my data private?', a: 'Yes. Your business data and scan results are private to your account and never shared.' },
]

export function BeamixPricing() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-24 px-6 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto">
        <p className="section-label text-stone-400 text-center mb-4">Pricing</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-4">
          Start free. Upgrade when you see results.
        </h2>
        <p className="text-center text-stone-500 mb-8">7-day free trial on all plans. No credit card required.</p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!annual ? 'text-[#141310]' : 'text-stone-400'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#06B6D4]' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-[#141310]' : 'text-stone-400'}`}>
            Annual <span className="text-green-600 font-semibold">Save 20%</span>
          </span>
        </div>

        {/* Glass plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative card-hover-lift ${
                plan.popular ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/20 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06B6D4] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-6xl font-[family-name:var(--font-outfit)] font-bold text-[#141310]">
                  ${annual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-stone-400 text-sm">/mo</span>
                {annual && <p className="text-xs text-stone-400 mt-1">Billed ${plan.yearlyPrice}/yr</p>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-[#06B6D4] mt-0.5">&check;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center py-3 rounded-[14px] font-semibold text-sm transition-colors ${
                  plan.popular
                    ? 'bg-[#06B6D4] hover:bg-cyan-600 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-[#141310]'
                }`}
              >
                {plan.cta} &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h3 className="text-center font-[family-name:var(--font-outfit)] font-bold text-3xl text-[#141310] mb-8">Frequently Asked Questions</h3>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="glass-card p-0 overflow-hidden rounded-[16px]">
              <button
                className="w-full text-left px-6 py-4 font-medium text-[#141310] flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className={`text-stone-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>&darr;</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-stone-500 leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

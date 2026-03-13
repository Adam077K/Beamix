'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const plans = [
  {
    name: 'Free Scan',
    price: '$0',
    description: 'See where you stand. No account needed.',
    features: ['3 AI engines', '1 scan', 'Visibility Score'],
    cta: 'Scan My Business',
    href: '/scan',
    highlight: false,
    trial: false,
  },
  {
    name: 'Starter',
    price: '$49/mo',
    description: 'Fix it. 4 engines, 10 queries, 5 agents/month.',
    features: ['4 AI engines', '10 queries/mo', '5 agents/month', 'Dashboard access'],
    cta: 'Start Free Trial',
    href: '/signup',
    highlight: false,
    trial: true,
  },
  {
    name: 'Pro',
    price: '$149/mo',
    description: 'Scale it. 8 engines, 25 queries, 15 agents/month.',
    features: ['8 AI engines', '25 queries/mo', '15 agents/month', 'Priority support'],
    cta: 'Start Free Trial',
    href: '/signup',
    highlight: true,
    trial: true,
  },
]

export function HpPricingPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4 text-center"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          PRICING
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-normal text-[#141310] text-center mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Start free. Upgrade when you see results.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="text-sm text-[#78716C] text-center mb-14"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          All trials include 5 free agent credits. No credit card required to start.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ name, price, description, features, cta, href, highlight, trial }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 flex flex-col ${
                highlight
                  ? 'border-2 border-[#023c65]'
                  : 'border border-[#F9FAFB]'
              }`}
            >
              {highlight && (
                <p
                  className="text-xs font-semibold text-[#023c65] tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  MOST POPULAR
                </p>
              )}
              <h3
                className="text-lg font-semibold text-[#141310] mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {name}
              </h3>
              <p
                className="text-3xl font-semibold text-[#141310] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {price}
              </p>
              <p
                className="text-sm text-[#78716C] mb-6 leading-relaxed"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {description}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-[#023c65] shrink-0" />
                    <span
                      className="text-sm text-[#78716C]"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              {trial && (
                <p
                  className="text-xs text-[#78716C] mb-4"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  7-day free trial included
                </p>
              )}
              <Link
                href={href}
                className={`w-full text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  highlight
                    ? 'bg-[#023c65] text-white hover:bg-[#013f6c]'
                    : 'bg-[#F5F4F2] text-[#141310] hover:bg-[#EDEBE6]'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {cta}
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-[#023c65] hover:text-[#013f6c] transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Compare all features
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

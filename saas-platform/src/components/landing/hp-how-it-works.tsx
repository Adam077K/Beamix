'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Scan',
    description: 'Enter your URL. We query every major AI engine with the same prompts your customers use. Results in 60 seconds.',
  },
  {
    number: '02',
    title: 'Diagnose',
    description: 'Your Visibility Score across every engine. Every competitor. Every gap — ranked by impact. Not data. A diagnosis.',
  },
  {
    number: '03',
    title: 'Fix',
    description: 'Run an agent. Get a finished deliverable. Content, schema, FAQs — ready to publish. Not a to-do list. Actual work.',
  },
  {
    number: '04',
    title: 'Repeat',
    description: 'Rescan in 48 hours. See exactly what moved. Every week, the advantage compounds.',
  },
]

export function HpHowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          HOW IT WORKS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-normal text-[#141310] leading-tight mb-16"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Four steps. Compounding results.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map(({ number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p
                className="text-3xl font-semibold text-[#023c65] mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {number}
              </p>
              <h3
                className="text-lg font-semibold text-[#141310] mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </h3>
              <p
                className="text-sm text-[#78716C] leading-relaxed"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {description}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm text-[#023c65] hover:text-[#013f6c] transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            See the full process
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

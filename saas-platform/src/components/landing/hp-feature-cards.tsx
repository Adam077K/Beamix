'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FileText, BookOpen, HelpCircle, Code2, Search, Star } from 'lucide-react'

const cards = [
  {
    icon: FileText,
    title: 'Content Writer',
    description: 'Writes GEO-optimized pages that AI engines cite.',
  },
  {
    icon: BookOpen,
    title: 'Blog Writer',
    description: 'Long-form articles targeting the exact queries AI answers.',
  },
  {
    icon: HelpCircle,
    title: 'FAQ Agent',
    description: 'Conversational Q&A in the format AI searches.',
  },
  {
    icon: Code2,
    title: 'Schema Optimizer',
    description: 'JSON-LD structured data — generated in 2 minutes, ready to install.',
  },
  {
    icon: Search,
    title: 'Competitor Intelligence',
    description: 'Why they outrank you. Specific. Actionable.',
  },
  {
    icon: Star,
    title: 'Review Analyzer',
    description: 'What your reviews signal to AI — and how to improve it.',
  },
]

export function HpFeatureCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4 text-center"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          THE AGENTS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-normal text-[#141310] text-center mb-14 leading-tight max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Other platforms show you where you&apos;re invisible.
          Beamix deploys agents that fix it.
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-[#F9FAFB] rounded-2xl p-6 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f0f5fa] flex items-center justify-center mb-4">
                <Icon size={20} color="#023c65" />
              </div>
              <h3
                className="text-base font-semibold text-[#141310] mb-2"
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-[#78716C] mt-8"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          + 10 more agents
        </motion.p>
      </div>
    </section>
  )
}

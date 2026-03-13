'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const pillars = [
  {
    title: 'Structured content',
    description: 'AI engines read and cite content that is organized, clear, and answers specific questions directly.',
  },
  {
    title: 'Schema markup',
    description: 'JSON-LD structured data tells AI engines exactly who you are, what you do, and where you operate.',
  },
  {
    title: 'Brand mentions',
    description: 'Citations in authoritative sources signal to AI that your business is real, trusted, and relevant.',
  },
]

export function HpWhy() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6 bg-[#FAFAF9]">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          WHY IT&apos;S HAPPENING
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-normal text-[#141310] leading-tight mb-10 max-w-2xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          AI doesn&apos;t rank businesses by who&apos;s best.
          It ranks by who&apos;s built for it.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-[#78716C] leading-relaxed mb-16 max-w-2xl"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          The businesses AI recommends aren&apos;t the biggest or the most established.
          They have structured content, FAQ coverage, schema markup, and brand mentions
          that AI engines can actually read and cite.
          Most businesses have none of it. Beamix builds all of it for you.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map(({ title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-[#E8E6E1] pt-6"
            >
              <h3
                className="text-base font-semibold text-[#141310] mb-3"
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
      </div>
    </section>
  )
}

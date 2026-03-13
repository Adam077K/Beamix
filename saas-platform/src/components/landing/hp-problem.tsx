'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function HpProblem() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-3xl mx-auto">
        <div className="border-t border-[#E8E6E1] mb-16" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <p
            className="text-2xl md:text-3xl text-[#141310] leading-relaxed"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Right now, someone is asking ChatGPT
            for the service you provide.
          </p>
          <p
            className="text-2xl md:text-3xl text-[#141310] leading-relaxed"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Your competitor is getting the recommendation.
            You&apos;re not in the answer.
          </p>
          <p
            className="text-xl text-[#78716C] leading-relaxed"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            This is happening in your industry.
            Every day. With your customers.
            Most businesses have no idea it&apos;s occurring.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

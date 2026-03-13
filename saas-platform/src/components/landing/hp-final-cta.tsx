'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HpFinalCta() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="relative bg-[#141310] px-6 pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] overflow-hidden">
      {/* Subtle impasto texture — very low opacity so dark section character is preserved */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/homepage/Final_CTA_image.png"
          alt=""
          fill
          className="object-cover opacity-20"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl font-normal text-white leading-tight mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The businesses AI recommends started somewhere.
          Start with a free scan.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base text-white/60 mb-10"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          No account. No credit card. 60 seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-[#141310] px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Scan My Business — Free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HpFinalCta() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 px-6 bg-[#F5F3EE]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-4xl md:text-5xl font-semibold text-[#1A1A17] leading-tight mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Stop being invisible.
            <br />
            Start being recommended.
          </h2>
          <p
            className="text-base text-[#6B6B63] mb-8 leading-relaxed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Run a free scan in 60 seconds. No credit card required. See exactly where your business
            stands across every major AI engine.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/scan"
              className="flex items-center gap-2 bg-[#1A1A17] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2A2A22] transition-colors"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Scan for Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 border border-[#E8E6E1] text-[#1A1A17] px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition-colors"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              View Pricing
            </Link>
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative h-[400px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/homepage/Final_CTA_image.png"
            alt="Start your free scan"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}

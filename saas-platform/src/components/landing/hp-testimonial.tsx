'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

export function HpTestimonial() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: quote */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="text-7xl leading-none text-[#9C9C94] mb-4 select-none"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            &ldquo;
          </div>
          <p
            className="text-xl text-[#1A1A17] italic leading-relaxed mb-8"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Before Beamix, we weren&apos;t showing up in ChatGPT at all. Three weeks later,
            we&apos;re the first business recommended for &ldquo;best Italian restaurant in Tel
            Aviv.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F0EFE9] border border-[#E8E6E1] flex items-center justify-center">
              <span
                className="text-sm font-semibold text-[#1A1A17]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                M
              </span>
            </div>
            <div>
              <div
                className="text-sm font-semibold text-[#1A1A17]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Maya Cohen
              </div>
              <div className="text-xs text-[#9C9C94]" style={{ fontFamily: 'var(--font-inter)' }}>
                Owner, Trattoria Romano · Tel Aviv
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative h-[300px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/homepage/Testimonial_section.png"
            alt="Happy customer"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}

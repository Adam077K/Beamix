'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const rows = [
  { ai: 'Structured schema markup', seo: 'Keyword density' },
  { ai: 'Authoritative FAQ content', seo: 'Meta tags' },
  { ai: 'Brand citations in trusted sources', seo: 'Backlinks' },
  { ai: 'Review volume and sentiment', seo: 'Page speed' },
  { ai: 'Fresh, structured content', seo: 'Domain authority' },
]

export function HpGeoVsSeo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          GEO VS SEO
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-normal text-[#141310] leading-tight mb-16 max-w-2xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Your SEO is fine.
          Your AI search visibility is a different problem.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl overflow-hidden border border-[#E8E6E1]"
        >
          <div className="grid grid-cols-2">
            <div className="bg-[#023c65] px-6 py-4">
              <p
                className="text-sm font-semibold text-white"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                What AI engines care about
              </p>
            </div>
            <div className="bg-[#F5F4F2] px-6 py-4">
              <p
                className="text-sm font-semibold text-[#78716C]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                What old SEO cared about
              </p>
            </div>
          </div>
          {rows.map(({ ai, seo }, i) => (
            <div
              key={i}
              className="grid grid-cols-2 border-t border-[#E8E6E1]"
            >
              <div className="px-6 py-4 bg-white">
                <p
                  className="text-sm text-[#141310] font-medium"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {ai}
                </p>
              </div>
              <div className="px-6 py-4 bg-[#FAFAF9]">
                <p
                  className="text-sm text-[#78716C]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {seo}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#78716C] mt-6 text-center"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Every Beamix agent targets the left column.
        </motion.p>
      </div>
    </section>
  )
}

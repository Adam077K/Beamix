'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageCircle, Sparkles, Search, Bot, Globe, Eye } from 'lucide-react'

const engines = [
  { icon: MessageCircle, label: 'ChatGPT' },
  { icon: Sparkles, label: 'Gemini' },
  { icon: Search, label: 'Perplexity' },
  { icon: Bot, label: 'Claude' },
  { icon: Globe, label: 'Bing Copilot' },
  { icon: Eye, label: 'Google AI' },
]

export function HpTrustBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-12 px-6 border-y border-[#E8E6E1]">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-xs tracking-[0.18em] text-[#9C9C94] mb-8 uppercase"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Scanning across 10+ AI engines
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {engines.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2 text-[#9C9C94]"
            >
              <Icon size={18} />
              <span className="text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

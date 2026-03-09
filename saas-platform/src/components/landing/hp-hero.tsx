'use client'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export function HpHero() {
  return (
    <section className="pt-32 pb-16 px-6 text-center">
      <motion.div
        className="max-w-3xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-5xl md:text-6xl font-semibold text-[#1A1A17] leading-tight mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          We make your business visible to AI search
        </motion.h1>
        <motion.p
          variants={item}
          className="text-lg text-[#6B6B63] leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Beamix scans your business across ChatGPT, Gemini, Perplexity, and more — then uses AI
          agents to write the content that gets you found and recommended.
        </motion.p>
        <motion.div variants={item} className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/scan"
            className="flex items-center gap-2 bg-[#1A1A17] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2A2A22] transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Scan for Free
            <ArrowRight size={16} />
          </Link>
          <button
            className="flex items-center gap-2 border border-[#E8E6E1] text-[#1A1A17] px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#F5F3EE] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <Play size={14} className="fill-current" />
            Watch demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

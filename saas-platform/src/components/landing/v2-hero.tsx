'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Globe } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const AI_LOGOS = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Grok']

export function V2Hero() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  function handleScan(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    router.push(`/scan?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="pt-[100px] pb-0 px-6 xl:px-0 bg-[#FAFAF9]">
      <div className="max-w-[1280px] mx-auto px-6 xl:px-12">
        <div className="grid grid-cols-1 xl:grid-cols-[65fr_35fr] gap-16 items-center min-h-[600px]">

          {/* LEFT COLUMN */}
          <motion.div
            className="flex flex-col items-start"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-[64px] xl:text-[75px] leading-[0.93] font-extrabold uppercase text-[#141310] tracking-[-0.01em] mb-5"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              CUSTOMERS ASK AI.
              <br />
              <span className="inline-flex items-center gap-3">
                {/* AI logo cycling square */}
                <span
                  className="inline-flex items-center justify-center rounded-[12px] text-[11px] font-semibold text-white bg-[#9E9E9E] select-none align-middle"
                  style={{ width: 61, height: 61, fontFamily: 'var(--font-inter)', flexShrink: 0 }}
                  aria-hidden="true"
                >
                  AI
                </span>
                AI DOESN'T KNOW
              </span>
              <br />
              YOU EXIST.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={item}
              className="text-[18px] text-[#78716C] leading-relaxed mb-8 max-w-[520px]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              We scan, diagnose, and optimize your AI search presence so customers find you first.
            </motion.p>

            {/* URL Input bar */}
            <motion.div variants={item} className="w-full max-w-[520px]">
              <form
                onSubmit={handleScan}
                className="flex items-center bg-white border border-[#E7E5E4] rounded-[10px] h-[48px] overflow-hidden pr-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div className="pl-4 pr-2 shrink-0 flex items-center">
                  <Globe size={15} className="text-[#78716C]" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  aria-label="Enter your website URL to scan"
                  className="flex-1 bg-transparent text-sm text-[#141310] placeholder:text-[#78716C] outline-none min-w-0 py-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
                <button
                  type="submit"
                  className="shrink-0 flex items-center gap-1.5 bg-[#023c65] text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-[#013f6c] transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-inter)' }}
                  aria-label="Scan Now"
                >
                  {/* Beamix icon placeholder */}
                  <span
                    className="w-3.5 h-3.5 rounded-sm bg-white/30 shrink-0"
                    aria-hidden="true"
                  />
                  Scan Now
                </button>
              </form>
              <p
                className="mt-2 text-[11px] text-[#78716C] tracking-wide"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                No account&nbsp;&nbsp;·&nbsp;&nbsp;No credit card&nbsp;&nbsp;·&nbsp;&nbsp;60 seconds
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN — trust logos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden xl:flex flex-col items-start justify-center gap-4"
          >
            <p
              className="text-[12px] text-[#78716C] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Trusted by teams at
            </p>
            {['Acme Corp', 'Horizon Ltd', 'Pulse Studio', 'Verda Group'].map((name) => (
              <div
                key={name}
                className="h-9 w-[160px] bg-[#E8E6E1] rounded-md opacity-60 flex items-center justify-center"
                aria-label={name}
              >
                <span
                  className="text-xs text-[#78716C] font-medium"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {name}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}

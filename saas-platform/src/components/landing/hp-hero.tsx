'use client'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Globe } from 'lucide-react'
import Image from 'next/image'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export function HpHero() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  function handleScan(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    router.push(`/scan?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="pt-[120px] pb-0 px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto">

        {/* Centered text deck */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={item}
            className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            GEO Platform for SMEs
          </motion.span>

          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl xl:text-6xl font-semibold text-[#141310] leading-[1.1] tracking-[-0.02em] mb-4"
            style={{ fontFamily: 'var(--font-figtree)' }}
          >
            Be the business that AI recommends.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base text-[#78716C] leading-relaxed mb-7 max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            AI already has an opinion about your business.
            Beamix shows you what it is — and changes it.
          </motion.p>

          {/* Glass scan input */}
          <motion.div variants={item} className="flex flex-col items-center gap-3">
            <form
              onSubmit={handleScan}
              className="relative w-full max-w-md backdrop-blur-xl bg-white/60 border border-[#023c65]/20 rounded-2xl shadow-[0_8px_32px_rgba(2,60,101,0.12)] p-1.5 flex items-center gap-2"
            >
              {/* Globe icon */}
              <div className="pl-3 shrink-0">
                <Globe size={14} className="text-[#023c65]/50" />
              </div>

              {/* URL input */}
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourbusiness.com"
                className="flex-1 bg-transparent text-sm text-[#141310] placeholder:text-[#78716C]/60 outline-none min-w-0 py-1.5"
                style={{ fontFamily: 'var(--font-inter)' }}
              />

              {/* Scan button */}
              <button
                type="submit"
                className="shrink-0 flex items-center gap-1.5 bg-[#023c65] text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#013f6c] transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Scan
                <ArrowRight size={12} />
              </button>
            </form>

            <p
              className="text-[11px] text-[#78716C] tracking-wide"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              No account&nbsp;&nbsp;·&nbsp;&nbsp;No credit card&nbsp;&nbsp;·&nbsp;&nbsp;60 seconds
            </p>
          </motion.div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 w-full aspect-[5/2] min-h-[400px] 2xl:min-h-[560px] rounded-2xl overflow-hidden relative"
        >
          <Image
            src="/homepage/Hero_homepage_city.png"
            alt="Beamix hero"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

      </div>
    </section>
  )
}

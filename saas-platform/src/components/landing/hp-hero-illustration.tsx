'use client'
import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import Image from 'next/image'

export function HpHeroIllustration() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-200, 200], [4, -4])
  const rotateY = useTransform(mouseX, [-200, 200], [-4, 4])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left - rect.width / 2)
      mouseY.set(e.clientY - rect.top - rect.height / 2)
    }
    const handleLeave = () => {
      animate(mouseX, 0, { duration: 0.6 })
      animate(mouseY, 0, { duration: 0.6 })
    }

    el.addEventListener('mousemove', handleMouse)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMouse)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [mouseX, mouseY])

  return (
    <section className="px-6 pb-16">
      <div ref={containerRef} className="max-w-6xl mx-auto relative h-[560px] rounded-2xl overflow-hidden">
        <Image
          src="/homepage/Hero_section.png"
          alt="Beamix platform"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

        {/* Floating product mockup */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ rotateX, rotateY }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[680px] max-w-[90vw] bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl overflow-hidden"
          >
            {/* macOS window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8E6E1]/60 bg-white/60">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span
                className="ml-3 text-xs text-[#6B6B63] font-medium"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                AI Visibility Dashboard
              </span>
            </div>

            {/* Stat cards */}
            <div className="p-6 flex items-center gap-4">
              <div className="flex-1 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/20 p-4">
                <div
                  className="text-xs text-[#6B6B63] mb-1"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Visibility Score
                </div>
                <div
                  className="text-3xl font-bold text-[#1A1A17]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  34
                </div>
                <div
                  className="text-xs text-[#F59E0B] mt-1 font-medium"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Needs improvement
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-[#1A1A17] p-4">
                <div
                  className="text-xs text-white/60 mb-1"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Engines scanned
                </div>
                <div
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  10+
                </div>
                <div
                  className="text-xs text-white/60 mt-1"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  ChatGPT, Gemini, Perplexity...
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-[#F0FDF4] border border-[#4A7C59]/20 p-4">
                <div
                  className="text-xs text-[#6B6B63] mb-1"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Agent fixes
                </div>
                <div
                  className="text-3xl font-bold text-[#1A1A17]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  7
                </div>
                <div
                  className="text-xs text-[#4A7C59] mt-1 font-medium"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Ready to apply
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

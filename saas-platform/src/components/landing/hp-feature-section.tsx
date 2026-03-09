'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const statuses = [
  { label: 'Schema Optimizer', status: 'Running', color: '#F59E0B' },
  { label: 'Content Writer', status: 'Complete', color: '#4A7C59' },
  { label: 'FAQ Generator', status: 'Queued', color: '#9C9C94' },
]

export function HpFeatureSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center text-sm text-[#6B6B63] mb-10"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          From invisible to ranked — without touching a word yourself
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[480px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/homepage/Feature_Section.png"
            alt="AI Agent Workspace"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          {/* Overlay card */}
          <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md rounded-xl p-5 w-72 shadow-xl border border-white/60">
            <h3
              className="text-base font-semibold text-[#1A1A17] mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              AI Agent Workspace
            </h3>
            <p
              className="text-xs text-[#6B6B63] mb-4 leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Agents scan, diagnose, and fix your AI visibility gaps in real time.
            </p>
            <div className="space-y-2">
              {statuses.map(({ label, status, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <div className="flex items-center gap-2 text-[#1A1A17]">
                    <CheckCircle2 size={14} color={color} />
                    {label}
                  </div>
                  <span style={{ color }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

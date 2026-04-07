'use client'

import { motion } from 'framer-motion'
import { ENGINE_LOGOS } from '@/components/marketing/logos'
import { Check, ArrowRight } from 'lucide-react'
import { CARD } from '@/components/marketing/card'
import { FadeUp } from '@/components/marketing/motion'

// ─── Scan steps ──────────────────────────────────────────────────────────────

const SCAN_ENGINES = [
  { name: 'ChatGPT', delay: 0.5, score: 82, mentioned: true },
  { name: 'Gemini', delay: 1.0, score: 71, mentioned: true },
  { name: 'Perplexity', delay: 1.5, score: 88, mentioned: true },
  { name: 'Google AI', delay: 2.0, score: 45, mentioned: false },
  { name: 'Claude', delay: 2.5, score: 67, mentioned: true },
]

// ─── Single scan row ─────────────────────────────────────────────────────────

function ScanRow({ engine, index }: { engine: typeof SCAN_ENGINES[0]; index: number }) {
  const Logo = ENGINE_LOGOS[engine.name]

  return (
    <motion.div
      className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: 0.3 + index * 0.12, ease: 'easeOut' }}
    >
      {/* Engine logo */}
      <div className="size-8 flex items-center justify-center shrink-0">
        {Logo ? <Logo size="lg" /> : <div className="size-6 rounded bg-gray-100" />}
      </div>

      {/* Engine name + mention status */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">{engine.name}</span>
        <span className="text-[11px] text-gray-400 ml-2">
          {engine.mentioned ? 'Mentioned' : 'Not mentioned'}
        </span>
      </div>

      {/* Score bar — proportional fill with animation */}
      <div className="w-28 flex items-center gap-2.5">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: engine.mentioned ? '#3370FF' : '#D1D5DB' }}
            initial={{ width: 0 }}
            whileInView={{ width: `${engine.score}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: 'easeOut' }}
          />
        </div>
        <motion.span
          className="text-sm tabular-nums font-medium text-gray-900 min-w-[28px] text-right"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 + index * 0.12 }}
        >
          {engine.score}
        </motion.span>
      </div>

      {/* Check mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25, delay: 0.9 + index * 0.12, type: 'spring', stiffness: 300 }}
      >
        <div className="size-5 rounded-full bg-[#3370FF]/10 flex items-center justify-center">
          <Check className="size-3 text-[#3370FF]" />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Score ring ──────────────────────────────────────────────────────────────

function ScoreReveal() {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const score = 75
  const mentioned = SCAN_ENGINES.filter(e => e.mentioned).length

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 1.4 }}
    >
      <div className="relative size-24">
        <motion.div
          className="absolute inset-0 rounded-full bg-[#3370FF]/8 blur-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8, duration: 0.6 }}
          aria-hidden="true"
        />
        <svg viewBox="0 0 100 100" className="relative w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none" stroke="#3370FF" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1.6, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(51,112,255,0.35))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-gray-900 tabular-nums"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2.0 }}
          >
            {score}
          </motion.span>
          <span className="text-[9px] text-gray-400 font-medium">/100</span>
        </div>
      </div>

      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 2.2 }}
      >
        <p className="text-sm font-medium text-gray-900">Scan Complete</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Mentioned in {mentioned}/{SCAN_ENGINES.length} engines</p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupScanLive() {
  return (
    <FadeUp>
      <div className={`${CARD} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <motion.div
                className="size-1.5 rounded-full bg-[#3370FF]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-sm font-medium text-gray-900 text-balance">Live Scan Demo</p>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-pretty">See how Beamix scans 5 AI engines in seconds</p>
          </div>
          <button
            type="button"
            className="text-xs text-[#3370FF] font-medium inline-flex items-center gap-1 transition-colors hover:opacity-70"
          >
            Try it free
            <ArrowRight className="size-3" />
          </button>
        </div>

        {/* Content — scan list + score */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px]">
          <div className="border-t border-gray-100">
            {SCAN_ENGINES.map((engine, i) => (
              <ScanRow key={engine.name} engine={engine} index={i} />
            ))}
          </div>
          <div className="flex items-center justify-center py-8 px-4 border-t lg:border-t-0 lg:border-l border-gray-100">
            <ScoreReveal />
          </div>
        </div>
      </div>
    </FadeUp>
  )
}

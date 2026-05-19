'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Competitor } from './CompetitorTable'

interface CompetitorDrawerProps {
  competitor: Competitor | null
  onClose: () => void
}

// ─── Engine mention bars ──────────────────────────────────────────────────────

const MOCK_ENGINES = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude']

function EngineMentionBar({
  engine,
  rate,
  delay,
}: {
  engine: string
  rate: number
  delay: number
}) {
  const pct = Math.round(rate * 100)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600">{engine}</span>
        <span className="text-xs font-medium tabular-nums text-gray-700">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#3370FF]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

// ─── Trend direction ──────────────────────────────────────────────────────────

function TrendBadge({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const delta = values[values.length - 1] - values[0]

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <TrendingUp className="size-3" />
        +{delta} queries
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <TrendingDown className="size-3" />
        {delta} queries
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
      <Minus className="size-3" />
      No change
    </span>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export function CompetitorDrawer({ competitor, onClose }: CompetitorDrawerProps) {
  const isOpen = Boolean(competitor)

  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Seed pseudo-random engine rates from appearance rate
  const engineRates = React.useMemo(() => {
    if (!competitor) return []
    const base = competitor.appearanceRate
    return MOCK_ENGINES.map((engine, i) => ({
      engine,
      rate: Math.min(0.95, Math.max(0.05, base + (i % 2 === 0 ? 0.08 : -0.06) + i * 0.03)),
    }))
  }, [competitor])

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && competitor && (
          <motion.aside
            key="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${competitor.name} details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-base font-semibold text-gray-900">{competitor.name}</p>
                <a
                  href={`https://${competitor.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#3370FF] hover:underline mt-0.5"
                >
                  {competitor.url}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 mt-0.5"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6 px-6 py-5 flex-1">

              {/* SoV + trend */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3.5">
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Share of voice
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-gray-900">
                    {Math.round(competitor.appearanceRate * 100)}%
                  </p>
                </div>
                <TrendBadge values={competitor.fourWeekTrend} />
              </div>

              {/* Engine breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3.5">
                  Mention rate by engine
                </h3>
                <div className="flex flex-col gap-4">
                  {engineRates.map(({ engine, rate }, i) => (
                    <EngineMentionBar
                      key={engine}
                      engine={engine}
                      rate={rate}
                      delay={i * 0.07}
                    />
                  ))}
                </div>
              </div>

              {/* Queries where they outrank */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Queries where they appear
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {competitor.queriesWhereAppears.length === 0 ? (
                    <li className="text-xs text-gray-400 italic">No queries tracked yet.</li>
                  ) : (
                    competitor.queriesWhereAppears.map((q) => (
                      <li
                        key={q}
                        className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <span className="text-[10px] mt-0.5 rounded-full bg-[#3370FF]/10 text-[#3370FF] font-medium px-1.5 py-0.5 shrink-0">
                          Q
                        </span>
                        <span className="text-xs text-gray-700 leading-relaxed">{q}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Sentiment split placeholder */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Sentiment split
                </h3>
                <div className="flex items-center gap-1 rounded-full overflow-hidden h-2">
                  {/* Seeded from appearance rate for realistic feel */}
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${Math.round(competitor.appearanceRate * 60)}%` }}
                    title="Positive"
                  />
                  <div
                    className="h-full bg-gray-200"
                    style={{ width: `${Math.round(competitor.appearanceRate * 25)}%` }}
                    title="Neutral"
                  />
                  <div className="h-full bg-red-300 flex-1" title="Negative" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {[
                    { label: 'Positive', color: 'bg-emerald-400' },
                    { label: 'Neutral', color: 'bg-gray-200' },
                    { label: 'Negative', color: 'bg-red-300' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={cn('size-2 rounded-full', color)} />
                      <span className="text-[11px] text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

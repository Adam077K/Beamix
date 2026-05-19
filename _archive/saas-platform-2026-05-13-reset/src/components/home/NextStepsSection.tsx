'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface NextStepItem {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimatedRuns: number
  actionLabel: string
}

interface NextStepsSectionProps {
  items: NextStepItem[]
}

const IMPACT_CONFIG = {
  high: { label: 'High impact', class: 'bg-red-50 text-red-600' },
  medium: { label: 'Medium impact', class: 'bg-amber-50 text-amber-600' },
  low: { label: 'Low impact', class: 'bg-gray-100 text-gray-500' },
}

function CreditPill({ runs }: { runs: number }) {
  if (runs === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
        Free
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-[#3370FF]">
      {runs} {runs === 1 ? 'run' : 'runs'}
    </span>
  )
}

// Impact dot indicator
function ImpactDot({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const dots = {
    high: 3,
    medium: 2,
    low: 1,
  }
  const colors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#D1D5DB',
  }
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: n <= dots[impact] ? colors[impact] : '#E5E7EB',
          }}
        />
      ))}
    </div>
  )
}

function StepCard({
  item,
  onAccept,
  onDismiss,
}: {
  item: NextStepItem
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={spring.subtle}
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-2 mb-2">
        <ImpactDot impact={item.impact} />
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
            IMPACT_CONFIG[item.impact].class,
          )}
        >
          {IMPACT_CONFIG[item.impact].label}
        </span>
      </div>

      <p className="text-[15px] font-semibold text-gray-900 leading-snug">{item.title}</p>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">
        {item.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <CreditPill runs={item.estimatedRuns} />

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onDismiss(item.id)}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label={`Dismiss: ${item.title}`}
          >
            Skip
          </button>
          <button
            onClick={() => onAccept(item.id)}
            className="rounded-lg bg-[#3370FF] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 active:scale-[0.98] transition-all"
            aria-label={`Accept: ${item.actionLabel}`}
          >
            {item.actionLabel}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function NextStepsSection({ items }: NextStepsSectionProps) {
  const [visible, setVisible] = useState(items)
  const remove = (id: string) => setVisible((prev) => prev.filter((s) => s.id !== id))

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
        <p className="text-sm font-medium text-gray-500">All caught up this week</p>
        <p className="mt-1 text-xs text-gray-400">
          New suggestions appear after your next scan.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {visible.map((item) => (
          <StepCard
            key={item.id}
            item={item}
            onAccept={remove}
            onDismiss={remove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

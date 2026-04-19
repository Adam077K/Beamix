'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface NextStep {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  creditsRequired: number
  agentLabel: string
}

interface NextStepsCardProps {
  steps: NextStep[]
  className?: string
}

const IMPACT_STYLES: Record<NextStep['impact'], { badge: string; dot: string }> = {
  high: { badge: 'bg-red-50 text-red-600', dot: 'bg-red-400' },
  medium: { badge: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' },
  low: { badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
}

const IMPACT_LABEL: Record<NextStep['impact'], string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}

function StepRow({
  step,
  onAccept,
}: {
  step: NextStep
  onAccept: (id: string) => void
}) {
  const [accepting, setAccepting] = useState(false)
  const styles = IMPACT_STYLES[step.impact]

  function handleAccept() {
    setAccepting(true)
    setTimeout(() => onAccept(step.id), 320)
  }

  return (
    <motion.div
      layout
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={spring.subtle}
      className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0"
    >
      {/* Impact dot */}
      <div className="mt-1.5 shrink-0">
        <span
          className={cn('block h-2 w-2 rounded-full', styles.dot)}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-gray-900 leading-snug truncate">
            {step.title}
          </p>
          <span
            className={cn(
              'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
              styles.badge,
            )}
          >
            {IMPACT_LABEL[step.impact]}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
          {step.description}
        </p>
        {step.creditsRequired > 0 && (
          <p className="mt-1 text-[10px] text-gray-400">
            {step.creditsRequired} credit{step.creditsRequired !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={accepting}
        className={cn(
          'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
          accepting
            ? 'bg-emerald-50 text-emerald-600 scale-95'
            : 'bg-[#3370FF] text-white hover:bg-blue-600 active:scale-[0.97]',
        )}
        aria-label={`Accept: ${step.agentLabel}`}
      >
        {accepting ? 'Queued' : step.agentLabel}
      </button>
    </motion.div>
  )
}

export function NextStepsCard({ steps, className }: NextStepsCardProps) {
  const [items, setItems] = useState<NextStep[]>(steps.slice(0, 3))

  const remove = (id: string) => setItems((prev) => prev.filter((s) => s.id !== id))

  return (
    <div className={cn('flex flex-col', className)}>
      {items.length === 0 ? (
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={spring.subtle}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50"
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10l4 4 8-8"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">All caught up</p>
          <p className="mt-0.5 text-xs text-gray-400">No pending steps right now.</p>
        </motion.div>
      ) : (
        <AnimatePresence initial={false}>
          {items.map((step) => (
            <StepRow key={step.id} step={step} onAccept={remove} />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}

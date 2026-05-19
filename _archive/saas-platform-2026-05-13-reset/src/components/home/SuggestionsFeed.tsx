'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

interface SuggestionItem {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimatedRuns: number
  actionLabel: string
}

interface SuggestionsFeedProps {
  suggestions: SuggestionItem[]
}

const impactStyles: Record<SuggestionItem['impact'], string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-gray-100 text-gray-500',
}

const impactLabel: Record<SuggestionItem['impact'], string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
}

function CreditPill({ runs }: { runs: number }) {
  if (runs === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        Free
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-[#3370FF]">
      {runs} {runs === 1 ? 'run' : 'runs'}
    </span>
  )
}

function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: SuggestionItem
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
      whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base text-gray-900 leading-snug">{suggestion.title}</p>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {suggestion.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Left badges */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              impactStyles[suggestion.impact],
            )}
          >
            {impactLabel[suggestion.impact]}
          </span>
          <CreditPill runs={suggestion.estimatedRuns} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              console.log('dismiss', suggestion.id)
              onDismiss(suggestion.id)
            }}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label={`Dismiss: ${suggestion.title}`}
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              console.log('accept', suggestion.id)
              onAccept(suggestion.id)
            }}
            className="rounded-lg bg-[#3370FF] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
            aria-label={`Accept: ${suggestion.actionLabel}`}
          >
            {suggestion.actionLabel}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function SuggestionsFeed({ suggestions }: SuggestionsFeedProps) {
  const [items, setItems] = useState(suggestions)

  const remove = (id: string) => setItems((prev) => prev.filter((s) => s.id !== id))

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
        <p className="text-sm font-medium text-gray-500">All caught up</p>
        <p className="mt-1 text-xs text-gray-400">No pending suggestions right now.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onAccept={remove}
            onDismiss={remove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

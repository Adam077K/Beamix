'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface SuggestionItem {
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

const impactMeta: Record<
  SuggestionItem['impact'],
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  high: {
    label: 'High impact',
    bgClass: 'bg-red-50',
    textClass: 'text-red-600',
    dotClass: 'bg-red-500',
  },
  medium: {
    label: 'Medium impact',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600',
    dotClass: 'bg-amber-500',
  },
  low: {
    label: 'Low impact',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
}

function CreditPill({ runs }: { runs: number }) {
  if (runs === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 size={10} aria-hidden="true" />
        Free
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#3370FF]">
      <Zap size={10} aria-hidden="true" />
      {runs} {runs === 1 ? 'credit' : 'credits'}
    </span>
  )
}

function SuggestionCard({
  suggestion,
  index,
  onAccept,
  onDismiss,
}: {
  suggestion: SuggestionItem
  index: number
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const meta = impactMeta[suggestion.impact]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ ...spring.subtle, delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }}
      className="rounded-[20px] border border-border bg-card p-5 shadow-sm transition-shadow duration-200"
      aria-label={suggestion.title}
    >
      {/* Impact indicator bar at top */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
            meta.bgClass,
            meta.textClass,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} aria-hidden="true" />
          {meta.label}
        </span>
        <CreditPill runs={suggestion.estimatedRuns} />
      </div>

      {/* Content */}
      <p className="text-base font-medium leading-snug text-foreground">{suggestion.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {suggestion.description}
      </p>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => onDismiss(suggestion.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm text-muted-foreground',
            'hover:bg-muted hover:text-foreground',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
            'active:scale-[0.98]',
          )}
          aria-label={`Dismiss: ${suggestion.title}`}
        >
          Dismiss
        </button>
        <button
          onClick={() => onAccept(suggestion.id)}
          className={cn(
            'rounded-lg bg-[#3370FF] px-3 py-1.5 text-sm font-medium text-white',
            'hover:bg-[#2960DB]',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
            'active:scale-[0.98]',
          )}
          aria-label={`Accept: ${suggestion.actionLabel}`}
        >
          {suggestion.actionLabel}
        </button>
      </div>
    </motion.article>
  )
}

export function SuggestionsFeed({ suggestions }: SuggestionsFeedProps) {
  const [items, setItems] = useState(suggestions)

  const remove = (id: string) => setItems((prev) => prev.filter((s) => s.id !== id))

  if (items.length === 0) {
    return (
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={spring.subtle}
        className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-muted/20 py-10 text-center"
      >
        <CheckCircle2 size={28} className="mb-3 text-[#10B981]" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">All caught up</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No suggestions right now. Agents are watching.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((s, i) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            index={i}
            onAccept={remove}
            onDismiss={remove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* Skeleton for suggestions feed */
export function SuggestionsFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[20px] border border-border bg-card p-5 shadow-sm"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-4 flex justify-end gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

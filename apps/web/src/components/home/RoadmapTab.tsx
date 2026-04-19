'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Loader, Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'
import ProgressRing from './ProgressRing'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoadmapStatus = 'completed' | 'in_progress' | 'up_next' | 'future'

export interface RoadmapAction {
  id: string
  label: string
  status: RoadmapStatus
  impactDelta?: string     // e.g. "+3 score"
  dateLabel?: string       // e.g. "Apr 14"
  note?: string            // secondary note e.g. "pending verification"
  inboxHref?: string       // if in_progress and reviewable
  upNextIndex?: number     // 1-based number for up_next rows
}

interface RoadmapTabProps {
  actions?: RoadmapAction[]
  className?: string
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
      {label}{' '}
      <span className="font-normal text-gray-300">({count})</span>
    </p>
  )
}

// ─── Completed row ────────────────────────────────────────────────────────────

function CompletedRow({ action, index }: { action: RoadmapAction; index: number }) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.035 }}
      className="flex min-h-[52px] items-center gap-3 border-b border-gray-50 last:border-0 py-2"
    >
      {/* Check icon */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
      </span>

      {/* Title */}
      <p className="flex-1 min-w-0 truncate text-sm text-gray-400 line-through">
        {action.label}
      </p>

      {/* Right side: delta + date */}
      <div className="flex items-center gap-2 shrink-0">
        {action.impactDelta && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            {action.impactDelta}
          </span>
        )}
        {action.note && !action.impactDelta && (
          <span className="text-[11px] text-gray-400">{action.note}</span>
        )}
        {action.dateLabel && (
          <span className="text-[11px] text-gray-400">{action.dateLabel}</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── In Progress row ──────────────────────────────────────────────────────────

function InProgressRow({ action, index }: { action: RoadmapAction; index: number }) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.035 }}
      className="flex min-h-[52px] items-center gap-3 border-b border-gray-50 last:border-0 py-2"
    >
      {/* Spinner */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Loader className="h-4 w-4 animate-spin text-[#3370FF]" strokeWidth={2} />
      </span>

      {/* Title */}
      <p className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-800">
        {action.label}
      </p>

      {/* CTA */}
      {action.inboxHref && (
        <Link
          href={action.inboxHref}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
        >
          Review in Inbox
          <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
        </Link>
      )}
    </motion.div>
  )
}

// ─── Up Next row ──────────────────────────────────────────────────────────────

function UpNextRow({ action, index }: { action: RoadmapAction; index: number }) {
  const num = action.upNextIndex ?? index + 1

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.035 }}
      className="flex min-h-[52px] items-center gap-3 border-b border-gray-50 last:border-0 py-2"
    >
      {/* Numbered circle */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500">
        {num}
      </span>

      {/* Title */}
      <p className="flex-1 min-w-0 truncate text-sm text-gray-700">
        {action.label}
      </p>
    </motion.div>
  )
}

// ─── Future row ───────────────────────────────────────────────────────────────

function FutureRow({ action, index }: { action: RoadmapAction; index: number }) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.035 }}
      className="flex min-h-[52px] items-center gap-3 border-b border-gray-50 last:border-0 py-2 opacity-50"
    >
      {/* Lock */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Lock className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
      </span>

      {/* Title */}
      <p className="flex-1 min-w-0 truncate text-sm text-gray-400">
        {action.label}
      </p>
    </motion.div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay }}
      className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
    >
      {children}
    </motion.div>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ACTIONS: RoadmapAction[] = [
  // Completed
  {
    id: 'c1',
    status: 'completed',
    label: 'Schema markup added (LocalBusiness)',
    impactDelta: '+3 score',
    dateLabel: 'Apr 14',
  },
  {
    id: 'c2',
    status: 'completed',
    label: 'FAQ page: pricing questions (8 Q&A)',
    impactDelta: '+5 score',
    dateLabel: 'Apr 16',
  },
  {
    id: 'c3',
    status: 'completed',
    label: 'Yelp listing claimed',
    note: 'pending verification',
    dateLabel: 'Apr 17',
  },
  // In progress
  {
    id: 'ip1',
    status: 'in_progress',
    label: 'Homepage rewrite — ready for your review',
    inboxHref: '/inbox',
  },
  // Up next
  {
    id: 'u1',
    status: 'up_next',
    label: 'Add statistics to your services page',
    upNextIndex: 1,
  },
  {
    id: 'u2',
    status: 'up_next',
    label: 'Create comparison page vs competitors',
    upNextIndex: 2,
  },
  {
    id: 'u3',
    status: 'up_next',
    label: 'Build your Google Business Profile',
    upNextIndex: 3,
  },
  // Future
  {
    id: 'f1',
    status: 'future',
    label: 'Video schema markup',
  },
  {
    id: 'f2',
    status: 'future',
    label: 'Reddit presence builder',
  },
  {
    id: 'f3',
    status: 'future',
    label: 'Industry directory submissions (7 more)',
  },
  {
    id: 'f4',
    status: 'future',
    label: 'Long-tail query expansion',
  },
  {
    id: 'f5',
    status: 'future',
    label: 'Competitor comparison blog series',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function RoadmapTab({ actions, className }: RoadmapTabProps) {
  const items = actions && actions.length > 0 ? actions : MOCK_ACTIONS

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50',
          className,
        )}
      >
        <p className="text-xs text-gray-400">Complete your first scan to unlock your roadmap</p>
      </div>
    )
  }

  // Group by status
  const grouped: Record<RoadmapStatus, RoadmapAction[]> = {
    completed: [],
    in_progress: [],
    up_next: [],
    future: [],
  }
  for (const a of items) {
    grouped[a.status].push(a)
  }

  const doneCount = grouped.completed.length
  const totalCount = items.length

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Progress header */}
      <Section delay={0}>
        <div className="flex items-center gap-4">
          <ProgressRing value={doneCount} max={totalCount} size={64} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {doneCount} of {totalCount} actions done
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Keep closing the gap</p>
          </div>
        </div>
      </Section>

      {/* Completed */}
      {grouped.completed.length > 0 && (
        <Section delay={0.04}>
          <SectionHeader label="Completed" count={grouped.completed.length} />
          {grouped.completed.map((a, i) => (
            <CompletedRow key={a.id} action={a} index={i} />
          ))}
        </Section>
      )}

      {/* In Progress */}
      {grouped.in_progress.length > 0 && (
        <Section delay={0.08}>
          <SectionHeader label="In Progress" count={grouped.in_progress.length} />
          {grouped.in_progress.map((a, i) => (
            <InProgressRow key={a.id} action={a} index={i} />
          ))}
        </Section>
      )}

      {/* Up Next */}
      {grouped.up_next.length > 0 && (
        <Section delay={0.12}>
          <SectionHeader label="Up Next" count={grouped.up_next.length} />
          {grouped.up_next.map((a, i) => (
            <UpNextRow key={a.id} action={a} index={i} />
          ))}
        </Section>
      )}

      {/* Future */}
      {grouped.future.length > 0 && (
        <Section delay={0.16}>
          <SectionHeader label="Future" count={grouped.future.length} />
          {grouped.future.map((a, i) => (
            <FutureRow key={a.id} action={a} index={i} />
          ))}
        </Section>
      )}
    </div>
  )
}

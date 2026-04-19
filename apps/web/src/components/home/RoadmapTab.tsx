'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export type RoadmapStatus = 'completed' | 'in_progress' | 'up_next' | 'future'

export interface RoadmapAction {
  id: string
  label: string
  status: RoadmapStatus
  impactDelta?: string   // e.g. "+12 citations"
  relativeTime?: string  // e.g. "3 days ago"
}

interface RoadmapTabProps {
  actions: RoadmapAction[]
  className?: string
}

const STATUS_CONFIG: Record<
  RoadmapStatus,
  { label: string; dotClass: string; iconEl: React.ReactNode }
> = {
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    iconEl: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" fill="#10B981" />
        <path d="M4.5 7l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  in_progress: {
    label: 'In Progress',
    dotClass: 'bg-blue-500 animate-pulse',
    iconEl: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#3370FF" strokeWidth="1.5" fill="#EFF6FF" />
        <path d="M7 4.5v2.5l1.5 1" stroke="#3370FF" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  up_next: {
    label: 'Up Next',
    dotClass: 'bg-amber-400',
    iconEl: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#F59E0B" strokeWidth="1.5" fill="#FFFBEB" />
        <path d="M5 7h4M7 5l2 2-2 2" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  future: {
    label: 'Future',
    dotClass: 'bg-gray-300',
    iconEl: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#D1D5DB" strokeWidth="1.5" fill="#F9FAFB" />
        <path d="M5 7h4" stroke="#D1D5DB" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M7 5l2 2-2 2" stroke="#D1D5DB" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

// Circular progress ring
function ProgressRing({
  done,
  total,
  pct,
}: {
  done: number
  total: number
  pct: number
}) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r={r} stroke="#E5E7EB" strokeWidth="5" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            stroke="#3370FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ ...spring.subtle, duration: 1.0 }}
          />
        </svg>
        <span className="absolute text-sm font-bold tabular-nums text-gray-900">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {done} of {total} actions done
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {total - done} remaining to complete your GEO plan
        </p>
      </div>
    </div>
  )
}

interface ActionRowProps {
  action: RoadmapAction
  index: number
}

function ActionRow({ action, index }: ActionRowProps) {
  const cfg = STATUS_CONFIG[action.status]
  const isFuture = action.status === 'future'

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0',
        isFuture && 'opacity-50',
      )}
    >
      <div className="shrink-0">{cfg.iconEl}</div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-snug truncate',
            action.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800',
          )}
        >
          {action.label}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action.impactDelta && (
          <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">
            {action.impactDelta}
          </span>
        )}
        {action.relativeTime && (
          <span className="text-[11px] text-gray-400">{action.relativeTime}</span>
        )}
        {isFuture && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            Locked
          </span>
        )}
      </div>
    </motion.div>
  )
}

const STATUS_ORDER: RoadmapStatus[] = ['completed', 'in_progress', 'up_next', 'future']

export function RoadmapTab({ actions, className }: RoadmapTabProps) {
  if (!actions || actions.length === 0) {
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

  const doneCount = actions.filter((a) => a.status === 'completed').length
  const totalCount = actions.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  // Group by status in display order
  const grouped: Record<RoadmapStatus, RoadmapAction[]> = {
    completed: [],
    in_progress: [],
    up_next: [],
    future: [],
  }
  for (const action of actions) {
    grouped[action.status].push(action)
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Progress ring header */}
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={spring.subtle}
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <ProgressRing done={doneCount} total={totalCount} pct={pct} />
      </motion.div>

      {/* Action groups */}
      {STATUS_ORDER.map((status) => {
        const group = grouped[status]
        if (group.length === 0) return null
        const cfg = STATUS_CONFIG[status]

        return (
          <motion.div
            key={status}
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={spring.subtle}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            {/* Group heading */}
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('h-2 w-2 rounded-full', cfg.dotClass)} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {cfg.label}
                <span className="ml-1.5 text-gray-300">({group.length})</span>
              </span>
            </div>

            {group.map((action, i) => (
              <ActionRow key={action.id} action={action} index={i} />
            ))}
          </motion.div>
        )
      })}
    </div>
  )
}

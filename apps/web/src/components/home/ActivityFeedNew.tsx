'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export type ActivityEventType =
  | 'scan_complete'
  | 'competitor_alert'
  | 'content_ranking'
  | 'new_competitor'
  | 'agent_run'
  | 'suggestion_ready'
  | 'credit_reset'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  message: string
  relativeTime: string
  isAlert?: boolean
}

interface ActivityFeedNewProps {
  items: ActivityEvent[]
  className?: string
}

// Type-specific icons as inline SVG
const EVENT_ICONS: Record<ActivityEventType, { el: React.ReactNode; bg: string; fg: string }> = {
  scan_complete: {
    bg: '#EFF6FF',
    fg: '#3370FF',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  competitor_alert: {
    bg: '#FFF1F2',
    fg: '#EF4444',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2L1.5 12h11L7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7 6v3M7 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  content_ranking: {
    bg: '#F0FDF4',
    fg: '#10B981',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 10l3-3.5 2.5 2.5 2-4 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  new_competitor: {
    bg: '#FFF7ED',
    fg: '#F59E0B',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  agent_run: {
    bg: '#F5F3FF',
    fg: '#8B5CF6',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  suggestion_ready: {
    bg: '#ECFDF5',
    fg: '#059669',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2a3.5 3.5 0 012.5 6l-.5 1H5l-.5-1A3.5 3.5 0 017 2z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5.5 9v1.5a1.5 1.5 0 003 0V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  credit_reset: {
    bg: '#F9FAFB',
    fg: '#6B7280',
    el: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 7a4 4 0 017.5-1.4M11 7a4 4 0 01-7.5 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M10.5 3.5L11 7l-3.5-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

function EventRow({ item, index }: { item: ActivityEvent; index: number }) {
  const cfg = EVENT_ICONS[item.type] ?? EVENT_ICONS.agent_run

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.04 }}
      className={cn(
        'flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0',
        item.isAlert && 'bg-red-50/30 rounded-lg px-2 -mx-2',
      )}
      role="article"
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: cfg.bg, color: cfg.fg }}
        aria-hidden="true"
      >
        {cfg.el}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-[13px] leading-snug',
            item.isAlert ? 'font-medium text-gray-800' : 'text-gray-700',
          )}
        >
          {item.message}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400">{item.relativeTime}</p>
      </div>
    </motion.div>
  )
}

export function ActivityFeedNew({ items, className }: ActivityFeedNewProps) {
  if (!items || items.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center',
          className,
        )}
      >
        <p className="text-sm font-medium text-gray-500">No recent activity</p>
        <p className="mt-1 text-xs text-gray-400">Agent runs and scan events will appear here.</p>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col', className)}
      role="feed"
      aria-label="Recent activity"
      aria-busy="false"
    >
      {items.map((item, i) => (
        <EventRow key={item.id} item={item} index={i} />
      ))}
    </div>
  )
}

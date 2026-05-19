'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface ActivityItem {
  id: string
  agentSlug: string
  agentName: string
  event: string
  relativeTime: string
  status: 'completed' | 'running' | 'failed' | 'pending'
}

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

const AGENT_COLORS: Record<string, { bg: string; fg: string; initial: string }> = {
  'citation-builder': { bg: '#EFF6FF', fg: '#3370FF', initial: 'CB' },
  'faq-agent': { bg: '#F0FDF4', fg: '#16A34A', initial: 'FA' },
  'review-monitor': { bg: '#FFF7ED', fg: '#EA580C', initial: 'RM' },
  'schema-optimizer': { bg: '#F5F3FF', fg: '#7C3AED', initial: 'SO' },
  'content-updater': { bg: '#ECFDF5', fg: '#10B981', initial: 'CU' },
  'competitor-intel': { bg: '#FFF1F2', fg: '#EF4444', initial: 'CI' },
  'directory-planner': { bg: '#F0F9FF', fg: '#0EA5E9', initial: 'DP' },
  default: { bg: '#F9FAFB', fg: '#6B7280', initial: '??' },
}

const STATUS_DOT: Record<ActivityItem['status'], string> = {
  completed: 'bg-emerald-400',
  running: 'bg-blue-400 animate-pulse',
  failed: 'bg-red-400',
  pending: 'bg-gray-300',
}

const STATUS_LABEL: Record<ActivityItem['status'], string> = {
  completed: 'Done',
  running: 'Running',
  failed: 'Failed',
  pending: 'Queued',
}

function AgentAvatar({ slug, name }: { slug: string; name: string }) {
  const style = AGENT_COLORS[slug] ?? AGENT_COLORS.default
  const words = name.split(' ')
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
      style={{ backgroundColor: style.bg, color: style.fg }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (!items || items.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center',
          className,
        )}
      >
        <p className="text-sm font-medium text-gray-500">No activity yet</p>
        <p className="mt-1 text-xs text-gray-400">Agent runs will appear here.</p>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col divide-y divide-gray-50', className)}
      role="feed"
      aria-label="Recent agent activity"
      aria-busy="false"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: i * 0.05 }}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          role="article"
        >
          <AgentAvatar slug={item.agentSlug} name={item.agentName} />

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {item.event}
            </p>
            <p className="text-xs text-gray-400">{item.agentName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 ms-auto">
            <span
              className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[item.status])}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-400">
              {item.relativeTime}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

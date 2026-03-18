'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CheckCheck,
  Zap,
  BarChart3,
  AlertTriangle,
  Info,
  Star,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────

interface Notification {
  id: string
  title: string
  body: string | null
  type: string | null
  is_read: boolean
  created_at: string
}

interface NotificationsViewProps {
  notifications: Notification[]
}

type CategoryFilter = 'all' | 'agents' | 'scans' | 'system'

// ── Constants ──────────────────────────────────────────────

const TYPE_META: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>
    bgColor: string
    iconColor: string
    category: CategoryFilter
  }
> = {
  agent_complete: {
    icon: Zap,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    category: 'agents',
  },
  scan_complete: {
    icon: BarChart3,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    category: 'scans',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    category: 'system',
  },
  error: {
    icon: AlertTriangle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
    category: 'system',
  },
  info: {
    icon: Info,
    bgColor: 'bg-muted',
    iconColor: 'text-muted-foreground',
    category: 'system',
  },
  milestone: {
    icon: Star,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    category: 'agents',
  },
}

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  agents: 'Agents',
  scans: 'Scans',
  system: 'System',
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier this week', 'Older']

// ── Helpers ────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  if (diffDays <= 7) return 'Earlier this week'
  return 'Older'
}

// ── Notification Item ─────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const typeMeta = notification.type
    ? (TYPE_META[notification.type] ?? {
        icon: Info,
        bgColor: 'bg-muted',
        iconColor: 'text-muted-foreground',
        category: 'system' as const,
      })
    : {
        icon: Bot,
        bgColor: 'bg-muted',
        iconColor: 'text-muted-foreground',
        category: 'system' as const,
      }

  const TypeIcon = typeMeta.icon

  return (
    <div
      className={cn(
        'group flex items-start gap-4 px-5 py-4 transition-colors duration-150',
        'hover:bg-muted/40',
        !notification.is_read && 'border-l-2 border-l-primary',
        notification.is_read && 'border-l-2 border-l-transparent',
      )}
    >
      {/* Icon circle */}
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          typeMeta.bgColor,
        )}
      >
        <TypeIcon
          className={cn('h-4 w-4', typeMeta.iconColor)}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              'text-sm leading-snug',
              notification.is_read
                ? 'text-muted-foreground font-normal'
                : 'text-foreground font-medium',
            )}
          >
            {notification.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {/* Unread dot */}
            {!notification.is_read && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                aria-label="Unread"
              />
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(notification.created_at)}
            </span>
          </div>
        </div>

        {notification.body && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {notification.body}
          </p>
        )}
      </div>

      {/* Mark read — appears on hover */}
      {!notification.is_read && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className={cn(
            'shrink-0 mt-0.5 text-xs text-muted-foreground hover:text-foreground transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
            'opacity-0 group-hover:opacity-100',
          )}
          aria-label="Mark as read"
        >
          Mark read
        </button>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export function NotificationsView({ notifications }: NotificationsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'all') return true
    const typeMeta = n.type ? TYPE_META[n.type] : null
    return typeMeta
      ? typeMeta.category === categoryFilter
      : categoryFilter === 'system'
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.created_at)
    if (!acc[group]) acc[group] = []
    acc[group].push(n)
    return acc
  }, {})

  const orderedGroups = GROUP_ORDER.filter((g) => grouped[g]?.length > 0)

  async function handleMarkRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      startTransition(() => router.refresh())
    } catch {
      // Silently fail
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      startTransition(() => router.refresh())
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Row 1: Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Stay updated on your scans, agents, and visibility changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="gap-1.5 rounded-lg shrink-0"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* ── Row 2: Filter pills + unread badge ──────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Pill toggle group */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-lg font-medium transition-all duration-150',
                categoryFilter === cat
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={categoryFilter === cat}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* ── Row 3: Notification list ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
          <EmptyState
            icon={Bell}
            title={
              categoryFilter !== 'all'
                ? `No ${CATEGORY_LABELS[categoryFilter].toLowerCase()} notifications`
                : 'All caught up'
            }
            description={
              categoryFilter !== 'all'
                ? `No ${CATEGORY_LABELS[categoryFilter].toLowerCase()} notifications yet.`
                : "We'll notify you when something important happens."
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {orderedGroups.map((group) => (
            <div key={group} className="space-y-1">
              {/* Date group label */}
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                {group}
              </p>

              {/* Group card */}
              <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)] overflow-hidden divide-y divide-border/50">
                {grouped[group].map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

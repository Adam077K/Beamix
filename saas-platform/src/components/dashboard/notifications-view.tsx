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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'

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

type FilterType = 'all' | 'unread' | 'read'

const TYPE_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  agent_complete: { icon: Zap, color: 'text-[#FF3C00]' },
  scan_complete: { icon: BarChart3, color: 'text-[#10B981]' },
  warning: { icon: AlertTriangle, color: 'text-[#F59E0B]' },
  error: { icon: AlertTriangle, color: 'text-destructive' },
  info: { icon: Info, color: 'text-muted-foreground' },
  milestone: { icon: Star, color: 'text-[#FF3C00]' },
}

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

export function NotificationsView({ notifications }: NotificationsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

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
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on your AI search activity"
      >
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {/* Unread count badge + filter tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        {unreadCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {unreadCount} unread
          </span>
        )}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                filter === tab
                  ? 'bg-card text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-[20px] border border-border">
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'All caught up'}
            description={
              filter === 'unread'
                ? 'You have read all your notifications.'
                : "We'll notify you when something important happens."
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const typeMeta = notification.type
              ? (TYPE_META[notification.type] ?? { icon: Info, color: 'text-muted-foreground' })
              : { icon: Info, color: 'text-muted-foreground' }
            const TypeIcon = typeMeta.icon

            return (
              <div
                key={notification.id}
                className={cn(
                  'bg-card rounded-lg border p-4 flex items-start gap-3 transition-colors',
                  notification.is_read
                    ? 'border-border'
                    : 'bg-primary/5 border-primary/20',
                )}
              >
                {/* Type icon */}
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted',
                  )}
                >
                  <TypeIcon className={cn('h-4 w-4', typeMeta.color)} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={cn(
                        'text-sm',
                        notification.is_read
                          ? 'text-muted-foreground'
                          : 'text-foreground font-medium',
                      )}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-muted-foreground text-xs whitespace-nowrap shrink-0">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  {notification.body && (
                    <p className="text-muted-foreground text-sm mt-1">{notification.body}</p>
                  )}
                  {notification.type && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Mark read action */}
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="text-muted-foreground hover:text-foreground text-xs whitespace-nowrap mt-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    Mark read
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

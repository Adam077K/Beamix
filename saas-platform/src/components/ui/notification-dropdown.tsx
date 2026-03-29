'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, Zap, BarChart3, AlertTriangle, Info, Star, Bot, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  body: string | null
  type: string | null
  is_read: boolean
  created_at: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
}

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  agent_complete: Zap,
  scan_complete: BarChart3,
  warning: AlertTriangle,
  info: Info,
  achievement: Star,
  agent_started: Bot,
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const VIEW_ALL_THRESHOLD = 8

export function NotificationDropdown({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => !n.is_read).length
  const hasMore = notifications.length > VIEW_ALL_THRESHOLD
  const recent = notifications.slice(0, VIEW_ALL_THRESHOLD)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    // Move focus into panel on open
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, close])

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3370FF] px-1 text-[10px] font-medium text-white animate-badge-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
          tabIndex={-1}
          className="absolute right-0 top-full mt-2 w-[360px] rounded-lg border border-border bg-card shadow-[0_4px_16px_rgba(0,0,0,0.10)] z-50 animate-slide-in-down outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <span className="text-sm font-medium text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => onMarkAllRead?.()}
                className="text-xs text-[#3370FF] hover:text-[#3370FF]/80 font-medium transition-colors duration-150"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <CheckCircle2 className="size-5 text-[#10B981] opacity-70" />
                <span>All caught up</span>
              </div>
            ) : (
              recent.map((n) => {
                const Icon = TYPE_ICON[n.type ?? 'info'] ?? Info
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) onMarkRead?.(n.id)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-[#F6F7F9]',
                      !n.is_read && 'bg-[#EBF0FF]/40'
                    )}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{n.body}</p>
                      )}
                      <p className="mt-1 text-[11px] text-[#9CA3AF]">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#3370FF]" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* View all footer */}
          {hasMore && (
            <div className="border-t border-[#F3F4F6] px-4 py-2.5">
              <a
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-[#3370FF] hover:text-[#3370FF]/80 transition-colors duration-150"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

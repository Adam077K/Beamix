'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#141310]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-sm text-stone-500 hover:text-[#141310] disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-stone-100 rounded-lg p-1 w-fit">
        {(['all', 'unread', 'read'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === tab
                ? 'bg-white text-[#141310] font-medium shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500 text-lg">
            {filter === 'unread' ? 'No unread notifications.' : 'All caught up!'}
          </p>
          <p className="text-stone-400 mt-2">
            {filter === 'unread'
              ? 'You have read all your notifications.'
              : "We'll notify you when something important happens."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                notification.is_read
                  ? 'border-stone-200'
                  : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.is_read ? 'bg-stone-200' : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm ${
                      notification.is_read
                        ? 'text-stone-600'
                        : 'text-[#141310] font-semibold'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="text-stone-400 text-xs whitespace-nowrap">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                </div>
                {notification.body && (
                  <p className="text-stone-500 text-sm mt-1">{notification.body}</p>
                )}
                {notification.type && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-500">
                    {notification.type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="text-stone-400 hover:text-stone-600 text-xs whitespace-nowrap mt-1"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

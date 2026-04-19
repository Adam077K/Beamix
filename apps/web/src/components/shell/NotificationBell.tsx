'use client'

import { useEffect, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

export function NotificationBell({ userEmail }: { userEmail: string }) {
  const [items, setItems] = useState<Notif[]>([])

  const unread = items.filter((i) => !i.readAt).length

  async function load() {
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) {
        console.error('[NotificationBell] fetch failed for user:', userEmail, res.status)
        return
      }
      const json = await res.json()
      setItems(json.items ?? [])
    } catch (err) {
      console.error('[NotificationBell] fetch error for user:', userEmail, err)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function markAllRead() {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      load()
    } catch (err) {
      console.error('[NotificationBell] markAllRead error:', err)
    }
  }

  async function markOne(id: string, url: string | null) {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (url) {
        window.location.href = url
      } else {
        load()
      }
    } catch (err) {
      console.error('[NotificationBell] markOne error:', err)
    }
  }

  const now = Date.now()
  const today = items.filter((i) => now - new Date(i.createdAt).getTime() < 86_400_000)
  const earlier = items.filter((i) => now - new Date(i.createdAt).getTime() >= 86_400_000)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 bg-[#3370FF] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="end"
          className="w-[360px] bg-white rounded-xl shadow-lg border border-gray-200 p-1 z-50 outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <span className="font-medium text-sm text-gray-900">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#3370FF] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                You&rsquo;re all caught up.
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <Group title="Today" items={today} onClick={markOne} />
                )}
                {earlier.length > 0 && (
                  <Group title="Earlier" items={earlier} onClick={markOne} />
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function Group({
  title,
  items,
  onClick,
}: {
  title: string
  items: Notif[]
  onClick: (id: string, url: string | null) => void
}) {
  return (
    <div>
      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">
        {title}
      </div>
      {items.map((n) => (
        <button
          key={n.id}
          onClick={() => onClick(n.id, n.actionUrl)}
          className={cn(
            'w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2 border-b border-gray-50 last:border-0 transition-colors',
            !n.readAt && 'bg-blue-50/40',
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
            {n.body && (
              <div className="text-xs text-gray-600 truncate mt-0.5">{n.body}</div>
            )}
          </div>
          <div className="text-[10px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</div>
          {!n.readAt && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3370FF] shrink-0 mt-1.5" />
          )}
        </button>
      ))}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

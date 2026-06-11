'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DigestRow } from './DigestRow'
import { DigestPanel } from './DigestPanel'
import { DigestPanelBody } from './DigestPanelBody'
import type { WeeklyDigest } from '@/types/digest'

interface DigestListProps {
  digests: WeeklyDigest[]
}

/**
 * DigestList — client interaction layer for the digest archive.
 *
 * State:
 *  - searchQuery: client-side filter by week label + headline + win text + query text
 *  - selectedId: which digest is open in the slide-over (desktop)
 *  - expandedId: which digest is expanded inline (mobile accordion)
 *  - isMobile: true when viewport < 1024px (media hook)
 *
 * Layout:
 *  ≥1024px: list column (max-w-[560px]) + right slide-over panel (480px)
 *  <1024px: single column; tap row → in-place accordion expansion
 */
export function DigestList({ digests }: DigestListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 1024px media hook
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) {
        // Switching to desktop — clear accordion expansion
        setExpandedId(null)
      } else {
        // Switching to mobile — clear panel selection
        setSelectedId(null)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Search filter
  const filtered = digests.filter((d) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      d.weekLabel.toLowerCase().includes(q) ||
      d.digest.headline.toLowerCase().includes(q) ||
      d.digest.narrativeLine.toLowerCase().includes(q) ||
      d.digest.wins.some(
        (w) =>
          w.description.toLowerCase().includes(q) ||
          (w.query?.toLowerCase().includes(q) ?? false),
      )
    )
  })

  const handleSelect = useCallback(
    (id: string) => {
      if (isMobile) {
        setExpandedId((prev) => (prev === id ? null : id))
      } else {
        setSelectedId((prev) => (prev === id ? null : id))
      }
    },
    [isMobile],
  )

  const handlePanelClose = useCallback(() => {
    setSelectedId(null)
  }, [])

  const selectedDigest = digests.find((d) => d.id === selectedId) ?? null

  return (
    <div className={cn('flex gap-0', !isMobile && selectedId && 'overflow-hidden rounded-[var(--radius-card)]')}>
      {/* List column */}
      <div
        className={cn(
          'min-w-0 flex-1',
          !isMobile && selectedId && 'max-w-[560px]',
        )}
      >
        {/* Toolbar */}
        <div className="mb-2 flex items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search digests…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search digests"
              className={cn(
                'h-8 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF]',
                'focus:outline-none focus:ring-2 focus:ring-[#3370FF] focus:ring-offset-1',
                'transition-colors hover:border-[#D1D5DB]',
              )}
            />
          </div>

          {/* Result count */}
          <span className="shrink-0 font-mono text-[12px] text-[#6B7280] tabular-nums">
            {filtered.length} digest{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        <div
          className="card-console overflow-hidden"
          role="listbox"
          aria-label="Weekly digests"
          aria-multiselectable="false"
        >
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-[#6B7280]">No digests match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {filtered.map((digest) => (
                <li key={digest.id} className="relative">
                  <DigestRow
                    digest={digest}
                    isSelected={selectedId === digest.id}
                    isExpanded={expandedId === digest.id}
                    isMobile={isMobile}
                    onSelect={handleSelect}
                  />

                  {/* Mobile inline accordion */}
                  {isMobile && expandedId === digest.id && (
                    <div
                      className="border-t border-[#F3F4F6]"
                      role="region"
                      aria-label={`Digest details: ${digest.weekLabel}`}
                    >
                      <DigestPanelBody digest={digest} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Desktop slide-over panel — rendered outside list column */}
      {!isMobile && (
        <DigestPanel digest={selectedDigest} onClose={handlePanelClose} />
      )}
    </div>
  )
}

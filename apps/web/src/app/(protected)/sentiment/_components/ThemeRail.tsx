'use client'

import { cn } from '@/lib/utils'
import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import type { SentimentTheme } from '@/lib/demo/surfaces/types'
import type { Sentiment } from './SentimentBadge'

const SWATCH: Record<Sentiment, string> = {
  positive: 'var(--color-status-positive)',
  neutral: 'var(--color-status-neutral)',
  negative: 'var(--color-status-critical)',
}

/**
 * ThemeRail — the page-specific topic group injected into AnalyticsScopeRail.
 *
 * Lists the sentiment THEMES with a sentiment swatch + mono mention count.
 * Toggling a theme scopes it in/out of the content area (drives `topics` in
 * AnalyticsFilterContext). All themes start visible.
 */
export function ThemeRail({ themes }: { themes: SentimentTheme[] }) {
  const { topics, toggleTopic } = useAnalyticsFilter()

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Themes
      </p>
      <div className="space-y-1.5">
        {themes.map((theme) => {
          const active = topics[theme.name] !== false
          return (
            <button
              key={theme.name}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-label={`Toggle theme ${theme.name}`}
              onClick={() => toggleTopic(theme.name)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                active
                  ? 'bg-[#EEF2FF] text-[#3370FF]'
                  : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: active ? SWATCH[theme.sentiment as Sentiment] : '#D1D5DB',
                  opacity: active ? 0.75 : 1,
                }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-left">{theme.name}</span>
              <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
                {theme.mentionCount}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

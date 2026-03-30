'use client'

import { useState } from 'react'
import { format, subDays, startOfDay, isSameDay, getDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface ScanHeatmapProps {
  scanDates?: string[] // ISO date strings of scan dates
}

// Build 13 weeks x 7 days grid (91 days total, ending today)
function buildGrid(scanDates: string[]) {
  const today = startOfDay(new Date())
  const totalDays = 13 * 7 // 91 days

  // Count scans per date
  const scanCounts: Record<string, number> = {}
  for (const d of scanDates) {
    const key = format(startOfDay(new Date(d)), 'yyyy-MM-dd')
    scanCounts[key] = (scanCounts[key] ?? 0) + 1
  }

  // Build days from oldest to newest
  const days = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = subDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    days.push({
      date,
      key,
      count: scanCounts[key] ?? 0,
      isToday: isSameDay(date, today),
    })
  }

  // Pad start so grid starts on Sunday
  const firstDayOfWeek = getDay(days[0].date) // 0=Sun
  const padDays = firstDayOfWeek // number of empty cells to prepend

  return { days, padDays }
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-800'
  if (count === 1) return 'bg-blue-100 dark:bg-blue-900/50'
  if (count === 2) return 'bg-blue-300 dark:bg-blue-700/70'
  return 'bg-[#3370FF] dark:bg-[#3370FF]'
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function ScanHeatmap({ scanDates = [] }: ScanHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: Date
    count: number
    x: number
    y: number
  } | null>(null)

  const { days, padDays } = buildGrid(scanDates)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        {/* Day labels on left */}
        <div className="flex flex-col gap-0.5 shrink-0 justify-start pt-0">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-3 flex items-center text-[9px] text-muted-foreground/60 leading-none"
              style={{ width: 12 }}
            >
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Grid: 13 weeks as columns */}
        <div className="relative flex-1">
          <div
            className="grid gap-0.5"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(13, 1fr)',
              gridTemplateRows: 'repeat(7, 14px)',
              gridAutoFlow: 'column',
            }}
          >
            {/* Pad empty cells */}
            {Array.from({ length: padDays }).map((_, i) => (
              <div key={`pad-${i}`} style={{ height: 14 }} className="w-full rounded-sm" />
            ))}

            {days.map((day) => (
              <div
                key={day.key}
                className={cn(
                  'w-full rounded-sm cursor-default transition-opacity hover:opacity-80',
                  getIntensityClass(day.count),
                  day.isToday && 'ring-1 ring-[#3370FF] ring-offset-1'
                )}
                style={{ height: 14 }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top })
                }}
                onMouseLeave={() => setTooltip(null)}
                aria-label={`${format(day.date, 'MMM d, yyyy')}: ${day.count} scan${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 rounded-lg border border-border bg-background px-2.5 py-1.5 shadow-md text-xs pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y - 40 }}
            >
              <span className="font-medium text-foreground">
                {format(tooltip.date, 'MMM d, yyyy')}
              </span>
              <span className="text-muted-foreground ml-1.5">
                {tooltip.count} scan{tooltip.count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Less/More legend */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-muted-foreground/60">Less</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn('h-3 w-3 rounded-sm', getIntensityClass(level))}
            aria-hidden="true"
          />
        ))}
        <span className="text-[10px] text-muted-foreground/60">More</span>
      </div>
    </div>
  )
}

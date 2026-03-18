'use client'

import * as React from 'react'
import { Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  value?: number | string
  name?: string
  dataKey?: string | number
  color?: string
  fill?: string
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  /** Visual style of the color indicator for each series. Defaults to 'dot'. */
  indicator?: 'dot' | 'line' | 'dashed'
  className?: string
}

// ─── Indicator renderers ───────────────────────────────────────────────────────

function IndicatorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

function IndicatorLine({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-0.5 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

function IndicatorDashed({ color }: { color: string }) {
  return (
    <span
      className="inline-flex h-0.5 w-3 shrink-0 items-center gap-px"
      aria-hidden="true"
    >
      <span className="h-full w-1 rounded-full" style={{ backgroundColor: color }} />
      <span className="h-full w-1 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}

// ─── ChartTooltipContent ───────────────────────────────────────────────────────

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  indicator = 'dot',
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  const formattedLabel = label
    ? labelFormatter
      ? labelFormatter(String(label))
      : String(label)
    : null

  return (
    <div
      className={cn(
        'pointer-events-none z-50 overflow-hidden rounded-lg border border-border',
        'bg-card/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        className
      )}
    >
      {formattedLabel && (
        <p className="mb-1.5 text-xs text-muted-foreground">{formattedLabel}</p>
      )}

      <div className="flex flex-col gap-1">
        {payload.map((item, index) => {
          const value = item.value as number
          const color = (item.color ?? item.fill ?? 'var(--chart-1)') as string
          const name = item.name ?? item.dataKey ?? ''
          const formattedValue =
            valueFormatter ? valueFormatter(value) : String(value ?? '')

          return (
            <div
              key={`${String(name)}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                {indicator === 'dot' && <IndicatorDot color={color} />}
                {indicator === 'line' && <IndicatorLine color={color} />}
                {indicator === 'dashed' && <IndicatorDashed color={color} />}
                <span className="text-muted-foreground">{String(name)}</span>
              </div>
              <span className="font-medium tabular-nums text-foreground">
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ChartTooltip wrapper ──────────────────────────────────────────────────────
// Renders Recharts <Tooltip> pre-configured with ChartTooltipContent.

interface ChartTooltipProps {
  labelFormatter?: ChartTooltipContentProps['labelFormatter']
  valueFormatter?: ChartTooltipContentProps['valueFormatter']
  indicator?: ChartTooltipContentProps['indicator']
  className?: ChartTooltipContentProps['className']
  /** Override the cursor line style. Pass false to disable. */
  cursor?: React.SVGProps<SVGElement> | false
}

export function ChartTooltip({
  labelFormatter,
  valueFormatter,
  indicator = 'dot',
  className,
  cursor,
}: ChartTooltipProps) {
  return (
    <Tooltip
      cursor={
        cursor === false
          ? false
          : cursor ?? {
              stroke: 'var(--chart-1)',
              strokeWidth: 1,
              strokeDasharray: '3 3',
              strokeOpacity: 0.6,
            }
      }
      content={(props) => (
        <ChartTooltipContent
          active={props.active}
          payload={props.payload as TooltipPayloadItem[] | undefined}
          label={props.label as string | undefined}
          labelFormatter={labelFormatter}
          valueFormatter={valueFormatter}
          indicator={indicator}
          className={className}
        />
      )}
    />
  )
}

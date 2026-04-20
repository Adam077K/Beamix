'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface EngineCell {
  engine: 'ChatGPT' | 'Gemini' | 'Perplexity' | 'Claude' | string
  mentionRate: number   // 0-100
  weeklyDelta: number   // percentage points change
  sparkline: number[]   // last 7 readings
}

interface EngineBreakdownGridProps {
  engines: EngineCell[]
  className?: string
}

const ENGINE_CONFIG: Record<string, { color: string; bg: string; initial: string }> = {
  ChatGPT:    { color: '#10B981', bg: '#ECFDF5', initial: 'CG' },
  Gemini:     { color: '#3370FF', bg: '#EFF6FF', initial: 'GM' },
  Perplexity: { color: '#8B5CF6', bg: '#F5F3FF', initial: 'PX' },
  Claude:     { color: '#F59E0B', bg: '#FFFBEB', initial: 'CL' },
  Grok:       { color: '#0EA5E9', bg: '#F0F9FF', initial: 'GK' },
}

const DEFAULT_CONFIG = { color: '#6B7280', bg: '#F9FAFB', initial: '??' }

function buildSparkPath(data: number[], w: number, h: number): string {
  if (!data || data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 2) - 1,
  }))
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const path = buildSparkPath(data, 56, 20)
  if (!path) return null
  return (
    <svg width="56" height="20" viewBox="0 0 56 20" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function EngineCard({ cell, index }: { cell: EngineCell; index: number }) {
  const cfg = ENGINE_CONFIG[cell.engine] ?? DEFAULT_CONFIG
  const isPositive = cell.weeklyDelta >= 0
  const pct = Math.max(0, Math.min(100, cell.mentionRate))

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.06 }}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3"
    >
      {/* Header: engine name + delta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
            aria-hidden="true"
          >
            {cfg.initial}
          </div>
          <span className="text-sm font-semibold text-gray-800 truncate">{cell.engine}</span>
        </div>
        {cell.weeklyDelta !== 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums shrink-0',
              isPositive ? 'text-emerald-600' : 'text-red-500',
            )}
            aria-label={`${isPositive ? 'up' : 'down'} ${Math.abs(cell.weeklyDelta)} percentage points this week`}
          >
            <span aria-hidden="true">{isPositive ? '↑' : '↓'}</span>
            {Math.abs(cell.weeklyDelta)}pp
          </span>
        )}
      </div>

      {/* Mention rate number + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Mention rate
          </p>
          <p
            className="mt-0.5 text-2xl font-bold tabular-nums"
            style={{ color: pct >= 50 ? cfg.color : '#374151' }}
          >
            {pct}
            <span className="text-sm font-normal text-gray-400">%</span>
          </p>
        </div>
        <MiniSparkline data={cell.sparkline} color={cfg.color} />
      </div>

      {/* Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: cfg.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ...spring.subtle, delay: index * 0.06 + 0.2 }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  )
}

export function EngineBreakdownGrid({ engines, className }: EngineBreakdownGridProps) {
  if (!engines || engines.length === 0) {
    return (
      <div
        className={cn(
          'flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50',
          className,
        )}
      >
        <p className="text-xs text-gray-400">Run a scan to see engine-by-engine results</p>
      </div>
    )
  }

  return (
    <div
      className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}
      role="region"
      aria-label="AI engine mention rates"
    >
      {engines.map((cell, i) => (
        <EngineCard key={cell.engine} cell={cell} index={i} />
      ))}
    </div>
  )
}

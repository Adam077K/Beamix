'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface EngineResult {
  engine: string
  mentionRate: number
  color: string
  label: string
}

interface EngineBreakdownProps {
  engines: EngineResult[]
  className?: string
}

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#10B981',
  Gemini: '#3370FF',
  Perplexity: '#8B5CF6',
  Claude: '#F59E0B',
  Grok: '#EF4444',
  'AI Overviews': '#06B6D4',
}

function EngineBar({
  engine,
  index,
}: {
  engine: EngineResult
  index: number
}) {
  const color = engine.color || ENGINE_COLORS[engine.engine] || '#9CA3AF'
  const pct = Math.max(0, Math.min(100, engine.mentionRate))
  const tintBg = color + '18' // ~10% opacity hex

  return (
    <div className="flex items-center gap-3">
      {/* Engine label */}
      <div className="w-24 shrink-0">
        <span className="text-xs font-medium text-gray-600 truncate block">{engine.engine}</span>
      </div>

      {/* Bar track */}
      <div className="relative flex-1 h-6 rounded-md overflow-hidden" style={{ backgroundColor: tintBg }}>
        <motion.div
          className="absolute inset-y-0 start-0 rounded-md"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ...spring.subtle, delay: index * 0.07 }}
          aria-hidden="true"
        />
        <span
          className="absolute inset-y-0 end-3 flex items-center text-[11px] font-semibold tabular-nums"
          style={{ color: pct > 50 ? 'white' : color }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

export function EngineBreakdown({ engines, className }: EngineBreakdownProps) {
  if (!engines || engines.length === 0) {
    return (
      <div
        className={cn(
          'flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50',
          className,
        )}
      >
        <p className="text-xs text-gray-400">No engine data yet</p>
      </div>
    )
  }

  const sorted = [...engines].sort((a, b) => b.mentionRate - a.mentionRate)

  return (
    <div className={cn('flex flex-col gap-2.5', className)} role="list" aria-label="AI engine mention rates">
      {sorted.map((engine, i) => (
        <div key={engine.engine} role="listitem">
          <EngineBar engine={engine} index={i} />
        </div>
      ))}
    </div>
  )
}

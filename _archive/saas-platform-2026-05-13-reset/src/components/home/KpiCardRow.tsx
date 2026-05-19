'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

interface KpiTile {
  id: string
  label: string
  value: string
  unit?: string
  delta: number
  deltaLabel?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  inverseDelta?: boolean
}

interface KpiCardRowProps {
  mentionRate: number
  sentimentPct: number
  competitorSoV: number
  pendingSuggestions: number
  mentionDelta: number
  sentimentDelta: number
  sovDelta: number
}

function TrendArrow({ delta, inverse = false }: { delta: number; inverse?: boolean }) {
  const effectiveDelta = inverse ? -delta : delta
  const isGood = effectiveDelta >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
        isGood ? 'text-emerald-600' : 'text-red-500',
      )}
    >
      <span aria-hidden="true">{isGood ? '↑' : '↓'}</span>
      {Math.abs(delta)}
      <span className="font-normal opacity-70"> pp</span>
    </span>
  )
}

function KpiTileIcon({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <span style={{ color }}>{children}</span>
    </div>
  )
}

// Inline SVG icons — no lucide needed, avoids dependency checks
function IconTarget() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
    </svg>
  )
}

function IconSmile() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5c.5 1.5 5.5 1.5 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}

function IconPulse() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9h3l2-5 2 8 2-4 1 1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLightning() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M10 2L4 10h5l-1 6 7-8h-5l1-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function KpiCardRow({
  mentionRate,
  sentimentPct,
  competitorSoV,
  pendingSuggestions,
  mentionDelta,
  sentimentDelta,
  sovDelta,
}: KpiCardRowProps) {
  const tiles: Array<{
    id: string
    label: string
    value: string
    unit: string
    delta: number
    inverse?: boolean
    icon: React.ReactNode
    iconBg: string
    iconColor: string
  }> = [
    {
      id: 'mention-rate',
      label: 'Mention rate',
      value: String(mentionRate),
      unit: '%',
      delta: mentionDelta,
      icon: <IconTarget />,
      iconBg: '#EFF6FF',
      iconColor: '#3370FF',
    },
    {
      id: 'sentiment',
      label: 'Positive sentiment',
      value: String(sentimentPct),
      unit: '%',
      delta: sentimentDelta,
      icon: <IconSmile />,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      id: 'competitor-sov',
      label: 'Competitor SoV',
      value: String(competitorSoV),
      unit: '%',
      delta: sovDelta,
      inverse: true,
      icon: <IconPulse />,
      iconBg: '#FFF7ED',
      iconColor: '#F59E0B',
    },
    {
      id: 'suggestions',
      label: 'Pending suggestions',
      value: String(pendingSuggestions),
      unit: '',
      delta: 0,
      icon: <IconLightning />,
      iconBg: '#FFF1F2',
      iconColor: '#EF4444',
    },
  ]

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      role="region"
      aria-label="Key performance indicators"
    >
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.id}
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...spring.subtle, delay: i * 0.05 }}
          className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <KpiTileIcon bg={tile.iconBg} color={tile.iconColor}>
              {tile.icon}
            </KpiTileIcon>
            {tile.delta !== 0 && (
              <TrendArrow delta={tile.delta} inverse={tile.inverse} />
            )}
            {tile.delta === 0 && tile.id === 'suggestions' && pendingSuggestions > 0 && (
              <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                New
              </span>
            )}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
              {tile.label}
            </p>
            <p className="mt-0.5 flex items-baseline gap-0.5 leading-none">
              <span className="text-2xl font-bold tabular-nums text-gray-900">
                {tile.value}
              </span>
              {tile.unit && (
                <span className="text-sm font-medium text-gray-400">{tile.unit}</span>
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

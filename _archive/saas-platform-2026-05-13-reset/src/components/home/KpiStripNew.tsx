'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring, fadeInUp } from '@/lib/motion'

export interface KpiStripData {
  score: number
  scoreDelta: number
  verdict: 'Excellent' | 'Good' | 'Fair' | 'Critical'
  verdictSubtitle: string
  citationsThisMonth: number
  citationsLastMonth: number
  impressionsAdded: number
  creditsUsed: number
  creditsCap: number
  creditsResetDays: number
}

function scoreColor(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function scoreBgClass(score: number): string {
  if (score >= 75) return 'bg-cyan-50 text-cyan-700'
  if (score >= 50) return 'bg-emerald-50 text-emerald-700'
  if (score >= 25) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

// Inline SVG icons — no external dependency
function IconVisibility() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconCitation() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4h10M3 8h6M3 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="11" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function IconImpressions() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 11l3.5-4 3 3 2.5-5L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCredits() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

interface KpiTileProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  tooltip: string
  value: React.ReactNode
  sub: React.ReactNode
  index: number
}

function KpiTile({ icon, iconBg, iconColor, label, tooltip, value, sub, index }: KpiTileProps) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...spring.subtle, delay: index * 0.05 }}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2.5 min-w-0"
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">
            {label}
          </p>
          <span
            title={tooltip}
            aria-label={tooltip}
            className="shrink-0 cursor-help"
          >
            <Info className="h-3 w-3 text-gray-300 hover:text-gray-500 transition-colors" aria-hidden="true" />
          </span>
        </span>
        <div className="mt-0.5 leading-none">{value}</div>
        <div className="mt-1">{sub}</div>
      </div>
    </motion.div>
  )
}

export function KpiStripNew({
  score,
  scoreDelta,
  verdict,
  verdictSubtitle,
  citationsThisMonth,
  citationsLastMonth,
  impressionsAdded,
  creditsUsed,
  creditsCap,
  creditsResetDays,
}: KpiStripData) {
  const color = scoreColor(score)
  const creditPct = Math.min(100, Math.round((creditsUsed / creditsCap) * 100))
  const isHighCredits = creditPct >= 75

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      role="region"
      aria-label="Key performance indicators"
    >
      {/* Tile 1: AI Visibility Score */}
      <KpiTile
        index={0}
        icon={<IconVisibility />}
        iconBg="#EFF6FF"
        iconColor="#3370FF"
        label="AI Visibility Score"
        tooltip="Your brand's average mention rate across all tracked AI engines. 0 = never cited, 100 = always top-of-answer."
        value={
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color }}
              aria-label={`${score} out of 100`}
            >
              {score}
            </span>
            <span className="text-sm font-normal text-gray-300">/100</span>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                scoreDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
              )}
            >
              <span aria-hidden="true">{scoreDelta >= 0 ? '↑' : '↓'}</span>
              {Math.abs(scoreDelta)}
            </span>
          </div>
        }
        sub={
          <span
            className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', scoreBgClass(score))}
          >
            {verdict}
          </span>
        }
      />

      {/* Tile 2: Citations Earned This Month */}
      <KpiTile
        index={1}
        icon={<IconCitation />}
        iconBg="#ECFDF5"
        iconColor="#10B981"
        label="Citations This Month"
        tooltip="Times an AI engine named your brand in an answer this month."
        value={
          <span className="text-3xl font-bold tabular-nums text-gray-900">
            {citationsThisMonth}
          </span>
        }
        sub={
          <span className="text-xs text-gray-400">
            was{' '}
            <span className="font-medium text-gray-600">{citationsLastMonth}</span>{' '}
            last month
          </span>
        }
      />

      {/* Tile 3: Est. Monthly AI Impressions Added */}
      <KpiTile
        index={2}
        icon={<IconImpressions />}
        iconBg="#F0F9FF"
        iconColor="#0EA5E9"
        label="AI Impressions Added"
        tooltip="Estimated monthly AI search impressions gained from agent-run fixes. Populated after your first scan."
        value={
          <span className="text-3xl font-bold tabular-nums text-gray-900">
            {impressionsAdded >= 1000
              ? `${(impressionsAdded / 1000).toFixed(1)}k`
              : impressionsAdded}
          </span>
        }
        sub={<span className="text-xs text-gray-400">est. monthly from agents</span>}
      />

      {/* Tile 4: Credits Used */}
      <KpiTile
        index={3}
        icon={<IconCredits />}
        iconBg={isHighCredits ? '#FFF7ED' : '#F9FAFB'}
        iconColor={isHighCredits ? '#F59E0B' : '#6B7280'}
        label="Actions Used This Month"
        tooltip="1 action = 1 agent run (draft + review). Resets at end of billing period."
        value={
          <span
            className={cn(
              'text-3xl font-bold tabular-nums',
              isHighCredits ? 'text-amber-600' : 'text-gray-900',
            )}
          >
            {creditsUsed}
            <span className="text-base font-normal text-gray-400"> / {creditsCap}</span>
          </span>
        }
        sub={
          <div className="flex flex-col gap-1">
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={creditsUsed}
              aria-valuemin={0}
              aria-valuemax={creditsCap}
              aria-label={`${creditsUsed} of ${creditsCap} actions used`}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${creditPct}%`,
                  backgroundColor: isHighCredits ? '#F59E0B' : '#3370FF',
                }}
              />
            </div>
            <span className="text-xs text-gray-400">
              Resets in{' '}
              <span className="font-medium text-gray-600">{creditsResetDays} days</span>
            </span>
          </div>
        }
      />
    </div>
  )
}

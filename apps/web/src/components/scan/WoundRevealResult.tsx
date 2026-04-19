'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Lock, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExploreFirstModal } from './ExploreFirstModal'

interface Competitor {
  name: string
  mentionsIn: number
  sampleQueries: string[]
}

interface VisibleFix {
  title: string
  impact: 'high' | 'medium' | 'low'
  quickFix: boolean
}

export interface ScanResultData {
  score: number
  mentionedQueries: number
  totalQueries: number
  competitors: Competitor[]
  visibleFixes: VisibleFix[]
  lockedFixes: number
}

interface WoundRevealResultProps {
  data: ScanResultData
  businessUrl?: string
}

const IMPACT_COLORS = {
  high: 'text-red-500 bg-red-50 border-red-100',
  medium: 'text-amber-600 bg-amber-50 border-amber-100',
  low: 'text-gray-500 bg-gray-50 border-gray-100',
}

function FixCard({ fix, index, t }: { fix: VisibleFix; index: number; t: ReturnType<typeof useTranslations<'scanResult'>> }) {
  const impactLabel = fix.impact === 'high'
    ? t('highImpact')
    : fix.impact === 'medium'
    ? t('mediumImpact')
    : t('lowImpact')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.5 + index * 0.08 }}
      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
    >
      <div className="mt-0.5 shrink-0">
        <Zap className="size-4 text-[#3370FF]" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0A0A0A] leading-snug">{fix.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', IMPACT_COLORS[fix.impact])}>
            {impactLabel}
          </span>
          {fix.quickFix && (
            <span className="text-xs px-2 py-0.5 rounded border border-[#3370FF]/20 bg-[#3370FF]/5 text-[#3370FF] font-medium">
              {t('quickFix')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function LockedFixCard({ index }: { index: number }) {
  return (
    <div
      className="relative rounded-xl border border-gray-100 bg-white p-4 select-none"
      style={{ filter: 'blur(3px)', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div className="size-4 mt-0.5 rounded bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className={cn('h-3 rounded bg-gray-200', index % 2 === 0 ? 'w-3/4' : 'w-2/3')} />
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded bg-gray-100" />
            {index % 3 === 0 && <div className="h-5 w-16 rounded bg-gray-100" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WoundRevealResult({ data, businessUrl }: WoundRevealResultProps) {
  const router = useRouter()
  const t = useTranslations('scanResult')
  const [modalOpen, setModalOpen] = React.useState(false)

  const lockedFixArray = Array.from({ length: data.lockedFixes }, (_, i) => i)

  // Severity framing
  const severity =
    data.mentionedQueries <= 3
      ? 'critical'
      : data.mentionedQueries <= 10
      ? 'poor'
      : 'fair'

  const severityLabel = {
    critical: t('criticalSeverity'),
    poor: t('poorSeverity'),
    fair: t('fairSeverity'),
  }[severity]

  const severityColor = {
    critical: 'text-red-500',
    poor: 'text-amber-600',
    fair: 'text-amber-500',
  }[severity]

  return (
    <>
      <div className="min-h-[100dvh] bg-[#F7F7F7] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Score block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 mb-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-[#0A0A0A] tracking-tight leading-none">
                    {data.mentionedQueries}
                  </span>
                  <span className="text-2xl font-medium text-gray-400 tracking-tight">
                    / {data.totalQueries}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs">
                  {t('queriesLabel')}
                </p>
                <p className={cn('mt-2 text-sm font-semibold', severityColor)}>
                  {severityLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <TrendingUp className="size-5 text-gray-300" aria-hidden="true" />
                {businessUrl && (
                  <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">
                    {businessUrl.replace(/^https?:\/\//, '')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Competitors */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.12 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 mb-5"
          >
            <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wider mb-4">
              {t('competitorsTitle')}
            </h2>
            <div className="flex flex-col divide-y divide-gray-50">
              {data.competitors.map((comp, i) => (
                <div key={comp.name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="size-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-500">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#0A0A0A] truncate">{comp.name}</span>
                      <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                        {t('mentionedIn')}{' '}
                        <span className="font-semibold text-[#0A0A0A]">{comp.mentionsIn}</span>{' '}
                        {t('queries')}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {comp.sampleQueries.map(q => (
                        <span
                          key={q}
                          className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 leading-relaxed"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visible fixes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.24 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wider">
                {t('visibleFixesTitle', { count: data.visibleFixes.length })}
              </h2>
              <span className="text-xs text-gray-400">
                {data.visibleFixes.length} {t('of')} {data.visibleFixes.length + data.lockedFixes} {t('total')}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.visibleFixes.map((fix, i) => (
                <FixCard key={fix.title} fix={fix} index={i} t={t} />
              ))}
            </div>
          </motion.div>

          {/* Locked fixes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.36 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wider">
                  {t('moreFixesTitle', { count: data.lockedFixes })}
                </h2>
                <span className="text-xs text-gray-400">{t('unlockWithAccount')}</span>
              </div>

              {/* Blurred fix cards */}
              <div className="flex flex-col gap-2.5">
                {lockedFixArray.map(i => (
                  <LockedFixCard key={i} index={i} />
                ))}
              </div>

              {/* Lock overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(247,247,247,0.85) 35%, rgba(247,247,247,0.97) 100%)' }}
              >
                <div className="flex flex-col items-center gap-3 px-4 text-center mt-16">
                  <div className="size-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                    <Lock className="size-4 text-gray-500" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">
                    {t('moreFixesWaiting', { count: data.lockedFixes })}
                  </p>
                  <p className="text-xs text-gray-500 max-w-[220px]">
                    {t('signUpToSee')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.44 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/signup?source=scan')}
              className="flex items-center justify-center gap-2 h-12 w-full rounded-lg bg-[#3370FF] text-white text-sm font-medium tracking-tight cursor-pointer transition-all duration-150 hover:bg-[#2558e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              {t('fixThisNow')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </motion.button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              {t('exploreFirst')}
            </button>
          </motion.div>
        </div>
      </div>

      <ExploreFirstModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

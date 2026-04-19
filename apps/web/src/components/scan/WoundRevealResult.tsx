'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Zap, ArrowRight } from 'lucide-react'
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

// ─── Score color helpers ──────────────────────────────────────────────────────

function getScoreHex(score: number): string {
  if (score >= 75) return '#06B6D4'  // Excellent
  if (score >= 50) return '#10B981'  // Good
  if (score >= 25) return '#F59E0B'  // Fair
  return '#EF4444'                   // Critical
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

// ─── Animated score ring ──────────────────────────────────────────────────────

interface ScoreRingInlineProps {
  score: number  // 0–100
}

function ScoreRingInline({ score }: ScoreRingInlineProps) {
  const size = 96
  const strokeWidth = 7
  const radius = (size / 2) - (strokeWidth / 2) - 2
  const circumference = 2 * Math.PI * radius
  const normalized = Math.max(0, Math.min(100, score))
  const offset = circumference - (normalized / 100) * circumference
  const color = getScoreHex(score)
  const progressRef = React.useRef<SVGCircleElement>(null)

  React.useEffect(() => {
    const el = progressRef.current
    if (!el) return
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.strokeDashoffset = String(offset)
  }, [score, circumference, offset])

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`AI visibility score: ${score} out of 100, ${getScoreLabel(score)}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      {/* Score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#9CA3AF] mt-0.5">
          /100
        </span>
      </div>
    </div>
  )
}

// ─── Impact badge styles ──────────────────────────────────────────────────────

const IMPACT_COLORS = {
  high: 'text-[#EF4444] bg-[#EF4444]/8 border-[#EF4444]/15',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/8 border-[#F59E0B]/15',
  low: 'text-[#6B7280] bg-[#6B7280]/8 border-[#6B7280]/15',
}

const IMPACT_LABELS = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
}

// ─── Eyebrow label style ──────────────────────────────────────────────────────

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]', className)}>
      {children}
    </span>
  )
}

// ─── Fix cards ────────────────────────────────────────────────────────────────

function FixCard({ fix, index }: { fix: VisibleFix; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.5 + index * 0.08 }}
      className="flex items-start gap-3 rounded-[20px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
    >
      <div className="mt-0.5 shrink-0">
        <Zap className="size-4 text-[#3370FF]" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0A0A0A] leading-snug">{fix.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', IMPACT_COLORS[fix.impact])}>
            {IMPACT_LABELS[fix.impact]}
          </span>
          {fix.quickFix && (
            <span className="text-xs px-2 py-0.5 rounded border border-[#3370FF]/20 bg-[#3370FF]/5 text-[#3370FF] font-medium">
              Quick fix
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
      className="relative rounded-[20px] border border-[#E5E7EB] bg-white p-4 select-none"
      style={{ filter: 'blur(3px)', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div className="size-4 mt-0.5 rounded bg-[#E5E7EB] shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className={cn('h-3 rounded bg-[#E5E7EB]', index % 2 === 0 ? 'w-3/4' : 'w-2/3')} />
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded bg-[#F3F4F6]" />
            {index % 3 === 0 && <div className="h-5 w-16 rounded bg-[#F3F4F6]" />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WoundRevealResult({ data, businessUrl }: WoundRevealResultProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = React.useState(false)

  const lockedFixArray = Array.from({ length: data.lockedFixes }, (_, i) => i)

  // Normalize score: if it's on 0–10 scale (mock data), convert to 0–100
  const normalizedScore = data.score <= 10 ? Math.round(data.score * 10) : Math.round(data.score)

  // Severity framing based on mention rate
  const mentionRate = data.mentionedQueries / data.totalQueries
  const severity =
    mentionRate <= 0.1
      ? 'critical'
      : mentionRate <= 0.33
      ? 'poor'
      : 'fair'

  const severityLabel = {
    critical: 'AI almost never recommends you',
    poor: 'AI rarely recommends you',
    fair: 'Some visibility — room to improve',
  }[severity]

  const severityColor = {
    critical: 'text-[#EF4444]',
    poor: 'text-[#F59E0B]',
    fair: 'text-[#F59E0B]',
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
            className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 sm:p-8 mb-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Score ring */}
              <ScoreRingInline score={normalizedScore} />

              {/* Score text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[48px] font-bold text-[#0A0A0A] tracking-tight leading-none tabular-nums">
                    {data.mentionedQueries}
                  </span>
                  <span className="text-xl font-medium text-[#9CA3AF] tracking-tight">
                    / {data.totalQueries}
                  </span>
                </div>
                <p className="text-[15px] text-[#6B7280] leading-relaxed mb-2">
                  queries where AI engines mention your business
                </p>
                <p className={cn('text-sm font-semibold', severityColor)}>
                  {severityLabel}
                </p>
                {businessUrl && (
                  <p className="mt-2 text-xs text-[#9CA3AF] font-mono truncate">
                    {businessUrl.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Competitors */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.12 }}
            className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 mb-4"
          >
            <Eyebrow className="block mb-4">Competitors outranking you</Eyebrow>
            <div className="flex flex-col divide-y divide-[#F3F4F6]">
              {data.competitors.map((comp, i) => (
                <div key={comp.name} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="size-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#6B7280]">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#0A0A0A] truncate">{comp.name}</span>
                      <span className="text-xs text-[#6B7280] shrink-0 whitespace-nowrap">
                        mentioned in{' '}
                        <span className="font-semibold text-[#0A0A0A]">{comp.mentionsIn}</span>{' '}
                        queries
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {comp.sampleQueries.map(q => (
                        <span
                          key={q}
                          className="text-xs bg-[#F3F4F6] text-[#6B7280] rounded-md px-2 py-0.5 leading-relaxed"
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
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <Eyebrow>{data.visibleFixes.length} fixes visible</Eyebrow>
              <span className="text-xs text-[#9CA3AF]">
                {data.visibleFixes.length} of {data.visibleFixes.length + data.lockedFixes} total
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.visibleFixes.map((fix, i) => (
                <FixCard key={fix.title} fix={fix} index={i} />
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
                <Eyebrow>{data.lockedFixes} more fixes</Eyebrow>
                <span className="text-xs text-[#9CA3AF]">Unlock with a free account</span>
              </div>

              {/* Blurred fix cards */}
              <div className="flex flex-col gap-2.5">
                {lockedFixArray.map(i => (
                  <LockedFixCard key={i} index={i} />
                ))}
              </div>

              {/* Lock overlay — Tailwind gradient instead of inline style */}
              <div className="absolute inset-0 flex flex-col items-end justify-center rounded-xl bg-gradient-to-b from-transparent via-[#F7F7F7]/85 to-[#F7F7F7]/97">
                <div className="flex flex-col items-center gap-3 px-4 text-center w-full mt-20">
                  <div className="size-10 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <Lock className="size-4 text-[#6B7280]" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">
                    {data.lockedFixes} more fixes are waiting
                  </p>
                  <p className="text-xs text-[#6B7280] max-w-[220px] leading-relaxed">
                    Create a free account to see every issue — then decide if you want agents to fix them.
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
            {/* Primary CTA — pill shape for marketing context */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/signup?source=scan')}
              className="flex items-center justify-center gap-2 h-12 w-full rounded-full bg-[#3370FF] text-white text-sm font-medium tracking-tight cursor-pointer transition-all duration-150 hover:bg-[#2558E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              See the full report &rarr;
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </motion.button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-sm text-[#6B7280] underline underline-offset-2 hover:text-[#0A0A0A] transition-colors cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              Explore the product first
            </button>
          </motion.div>
        </div>
      </div>

      <ExploreFirstModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

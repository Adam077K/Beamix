'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ScanResults, LLMEngine } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Lock,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ScanPageStatus = 'loading' | 'processing' | 'completed' | 'error'

interface ScanData {
  scan_id: string
  business_name: string
  website_url: string
  sector: string
  location: string
  email?: string | null
  created_at?: string | null
  results: ScanResults
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

function getScoreLabelDescription(score: number, businessName: string): string {
  if (score >= 75) return `${businessName} has strong AI search visibility`
  if (score >= 50) return `${businessName} has moderate AI search visibility`
  if (score >= 25) return `Most AI engines don't know your business exists`
  return `Your business is invisible to AI search engines`
}

function getScoreRingColor(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function getIndustryAverage(sector: string | null): number {
  // Reasonable mock industry averages by sector
  const averages: Record<string, number> = {
    insurance: 55,
    legal: 48,
    healthcare: 52,
    finance: 58,
    technology: 63,
    retail: 45,
    restaurant: 42,
    realestate: 50,
  }
  const key = (sector ?? '').toLowerCase().replace(/\s+/g, '')
  return averages[key] ?? 54
}

function daysUntilExpiry(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

// ─── Processing State ─────────────────────────────────────────────────────────

interface EngineStatus {
  engine: LLMEngine
  label: string
  status: 'waiting' | 'checking' | 'done'
}

function ProcessingState() {
  const [engineStatuses, setEngineStatuses] = useState<EngineStatus[]>([
    { engine: 'chatgpt', label: 'ChatGPT', status: 'waiting' },
    { engine: 'gemini', label: 'Gemini', status: 'waiting' },
    { engine: 'perplexity', label: 'Perplexity', status: 'waiting' },
  ])
  const [phase, setPhase] = useState<'engines' | 'analyzing'>('engines')

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    engineStatuses.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setEngineStatuses(prev => prev.map((e, idx) => idx === i ? { ...e, status: 'checking' } : e))
      }, i * 3000))
      timers.push(setTimeout(() => {
        setEngineStatuses(prev => prev.map((e, idx) => idx === i ? { ...e, status: 'done' } : e))
      }, i * 3000 + 2000))
    })
    timers.push(setTimeout(() => setPhase('analyzing'), engineStatuses.length * 3000 + 1000))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5F2]">
          <Loader2 className="h-7 w-7 animate-spin text-[#FF3C00]" />
        </div>
        <h2 className="mt-5 text-xl font-medium text-[#111827]">Scanning your business</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Checking 3 AI engines — this takes about 30 seconds</p>

        <div className="mt-8 space-y-2.5">
          {engineStatuses.map((engine) => (
            <div
              key={engine.engine}
              className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 text-left"
            >
              {engine.status === 'waiting' && (
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#E5E7EB]" />
              )}
              {engine.status === 'checking' && (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#FF3C00]" />
              )}
              {engine.status === 'done' && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#10B981]" />
              )}
              <span className={cn(
                'text-sm font-medium',
                engine.status === 'checking' && 'text-[#FF3C00]',
                engine.status === 'done' && 'text-[#10B981]',
                engine.status === 'waiting' && 'text-[#9CA3AF]'
              )}>
                {engine.status === 'checking'
                  ? `Asking ${engine.label}...`
                  : engine.status === 'done'
                    ? `${engine.label} checked`
                    : `Waiting for ${engine.label}`}
              </span>
            </div>
          ))}
        </div>

        {phase === 'analyzing' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-[#6B7280]"
          >
            Analyzing results and calculating your score...
          </motion.p>
        )}
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-7 w-7 text-[#EF4444]" />
        </div>
        <h2 className="mt-5 text-xl font-medium text-[#111827]">Something went wrong</h2>
        <p className="mt-2 text-sm text-[#6B7280]">{message ?? 'Unable to load scan results.'}</p>
        <Link
          href="/scan"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF3C00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e63600] transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}

// ─── Score Ring (inline SVG matching Stitch exactly) ─────────────────────────

interface ScoreRingInlineProps {
  score: number
}

function ScoreRingInline({ score }: ScoreRingInlineProps) {
  const r = 74
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = getScoreRingColor(score)
  const progressRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!progressRef.current) return
    const el = progressRef.current
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.strokeDashoffset = String(offset)
  }, [score, circumference, offset])

  return (
    <div className="relative mx-auto flex h-[160px] w-[160px] items-center justify-center mb-6">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 160 160"
        aria-hidden="true"
      >
        <circle cx="80" cy="80" r={r} fill="transparent" stroke="#f1f4f7" strokeWidth="10" />
        <circle
          ref={progressRef}
          cx="80"
          cy="80"
          r={r}
          fill="transparent"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="text-center">
        <CountUpNumber value={score} className="text-[48px] font-semibold tabular-nums leading-none text-[#111827]" />
      </div>
    </div>
  )
}

// ─── Count-up animation helper ────────────────────────────────────────────────

interface CountUpNumberProps {
  value: number
  className?: string
}

function CountUpNumber({ value, className }: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!ref.current) return
    cancelAnimationFrame(rafRef.current)
    const el = ref.current
    const duration = 1000
    const startTime = performance.now()

    function update(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = String(Math.round(eased * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}

// ─── Engine Row (free — shown) ────────────────────────────────────────────────

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

function EngineRow({ engineKey, result }: {
  engineKey: string
  result: { is_mentioned: boolean; mention_position: number | null; sentiment: string | null; response_snippet?: string | null }
}) {
  const label = ENGINE_LABELS[engineKey] ?? engineKey

  return (
    <div className="flex items-start gap-4 rounded-xl bg-[#f1f4f7] p-5 transition-all hover:bg-[#e8ecf0]/50">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
        {result.is_mentioned ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" aria-label="Mentioned" />
        ) : (
          <div className="h-3.5 w-3.5 rounded-full border border-[#D1D5DB]" aria-label="Not mentioned" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#111827]">{label}</span>
          {result.is_mentioned ? (
            <span className="text-[12px] font-semibold text-emerald-600">
              {result.mention_position ? `#${result.mention_position} — Mentioned` : 'Mentioned'}
            </span>
          ) : (
            <span className="text-[12px] font-semibold text-[#6B7280]">
              Not found — Your business wasn&apos;t mentioned
            </span>
          )}
        </div>
        {result.is_mentioned && result.response_snippet && (
          <p className="text-[13px] italic leading-relaxed text-[#6B7280]">
            &ldquo;{result.response_snippet}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Locked Engine Overlay ────────────────────────────────────────────────────

const LOCKED_ENGINES = [
  { key: 'claude', label: 'Claude' },
  { key: 'google_ai_overviews', label: 'Google AI' },
  { key: 'grok', label: 'Grok (X)' },
  { key: 'you_com', label: 'You.com' },
]

function LockedEnginesSection({ signupHref }: { signupHref: string }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none space-y-4 opacity-40 blur-[2px] grayscale">
        {LOCKED_ENGINES.slice(0, 2).map((eng) => (
          <div key={eng.key} className="flex items-center gap-4 rounded-xl bg-[#f1f4f7] p-5">
            <span className="text-[14px] font-semibold text-[#111827]">{eng.label}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href={signupHref}
          className="flex items-center gap-2 rounded-full border border-[#E5E7EB]/20 bg-white/90 px-4 py-2 shadow-sm backdrop-blur transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
        >
          <Lock className="h-4 w-4 text-[#111827]" aria-hidden="true" />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#111827]">
            Unlock with free trial
          </span>
        </Link>
      </div>
    </div>
  )
}

// ─── Agent Fix Cards ───────────────────────────────────────────────────────────

interface AgentFixCard {
  icon: string
  name: string
  description: string
  estimatedGain: number
  duration: string
}

function buildAgentCards(score: number, sector: string | null): AgentFixCard[] {
  const sectorLabel = sector ?? 'your industry'
  return [
    {
      icon: 'schema',
      name: 'Schema Optimizer',
      description: `Would add structured data to help ChatGPT understand your business better.`,
      estimatedGain: score < 50 ? 12 : 8,
      duration: '~15 minutes',
    },
    {
      icon: 'quiz',
      name: 'FAQ Agent',
      description: `Would create a FAQ page answering the questions AI engines look for.`,
      estimatedGain: score < 50 ? 8 : 6,
      duration: '~20 minutes',
    },
    {
      icon: 'edit_note',
      name: 'Content Writer',
      description: `Would write a blog post optimized for '${sectorLabel}' queries.`,
      estimatedGain: score < 50 ? 7 : 5,
      duration: '~30 minutes',
    },
  ]
}

function AgentFixSection({ score, sector, signupHref }: {
  score: number
  sector: string | null
  signupHref: string
}) {
  const agents = buildAgentCards(score, sector)
  const totalGain = agents.reduce((sum, a) => sum + a.estimatedGain, 0)
  const projectedScore = Math.min(100, score + totalGain)

  return (
    <section aria-labelledby="agents-heading" className="mb-16">
      <h2 id="agents-heading" className="mb-6 text-[18px] font-semibold text-[#111827]">
        Here&apos;s what we&apos;d fix for you
      </h2>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {agents.map((agent, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg border border-[#FF3C00]/20 bg-white p-5 transition-colors hover:border-[#FF3C00]"
          >
            <div className="absolute right-0 top-0 p-2 opacity-10 text-[#111827] text-[40px] leading-none">
              {agent.icon === 'schema' && '⚙'}
              {agent.icon === 'quiz' && '?'}
              {agent.icon === 'edit_note' && '✏'}
            </div>
            <h3 className="mb-2 text-[14px] font-bold text-[#111827]">{agent.name}</h3>
            <p className="mb-4 text-[13px] leading-relaxed text-[#6B7280]">
              {agent.description}{' '}
              <span className="font-semibold text-[#FF3C00]">
                Estimated impact: +{agent.estimatedGain} points
              </span>
            </p>
            <div className="flex items-center gap-3">
              <span className="rounded bg-[#f1f4f7] px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">
                {agent.duration}
              </span>
              <span className="rounded bg-[#FF3C00]/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-[#FF3C00]">
                Automated
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[#f1f4f7] px-6 py-4 text-center">
        <p className="text-[14px] font-semibold text-[#111827]">
          Total estimated improvement:{' '}
          <span className="text-[#FF3C00]">+{totalGain} points</span>{' '}
          <span className="font-normal text-[#6B7280]">
            ({score} &rarr; {projectedScore})
          </span>
        </p>
      </div>
    </section>
  )
}

// ─── CTA Card ─────────────────────────────────────────────────────────────────

function UpgradeCTACard({ signupHref, sector }: { signupHref: string; sector: string | null }) {
  return (
    <section className="mb-12" aria-labelledby="cta-heading">
      <div className="rounded-xl border-2 border-[#FF3C00] bg-white p-8 text-center shadow-lg shadow-[#FF3C00]/5">
        <h2 id="cta-heading" className="mb-2 text-[20px] font-semibold text-[#111827]">
          Start your free trial
        </h2>
        <p className="mb-8 text-[14px] text-[#6B7280]">
          7 days free. Run all agents. See your score improve.
        </p>
        <Link
          href={signupHref}
          className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#111827] text-[15px] font-semibold text-white transition-all hover:bg-[#111827]/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="space-y-2">
          <p className="text-[12px] text-[#9CA3AF]">No credit card required · Cancel anytime</p>
          {sector && (
            <p className="text-[12px] font-medium text-[#6B7280]">
              Built for businesses like yours in {sector}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScanResultsClient({ scanId }: { scanId: string }) {
  const [status, setStatus] = useState<ScanPageStatus>('loading')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status }, [status])

  const scanEmail = scanData?.email ?? null

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/scan/${scanId}/status`)
      if (!res.ok) {
        setStatus('error')
        setErrorMsg('Scan not found')
        return
      }
      const data = await res.json()

      if (data.status === 'completed') {
        const resultsRes = await fetch(`/api/scan/${scanId}/results`)
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setScanData(resultsData)
          setStatus('completed')
        } else {
          setStatus('error')
          setErrorMsg('Failed to load results')
        }
      } else if (data.status === 'failed') {
        setStatus('error')
        setErrorMsg('Scan failed. Please try again.')
      } else {
        setStatus('processing')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection.')
    }
  }, [scanId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (statusRef.current === 'loading' || statusRef.current === 'processing') {
        pollStatus()
      }
    }, 2000)
    const timeout = setTimeout(() => pollStatus(), 0)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [pollStatus])

  // ── Loading / Processing ───────────────────────────────────────────────────
  if (status === 'loading' || status === 'processing') {
    return <ProcessingState />
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return <ErrorState message={errorMsg} />
  }

  // ── Empty results ──────────────────────────────────────────────────────────
  if (!scanData?.results) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-7 w-7 text-[#F59E0B]" />
          </div>
          <h2 className="mt-5 text-xl font-medium text-[#111827]">Results unavailable</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            This scan may still be processing or has expired.
          </p>
          <Link
            href="/scan"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF3C00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e63600] transition-all active:scale-95"
          >
            Run a new scan
          </Link>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  const { results, business_name, website_url, sector } = scanData
  const score = results.visibility_score
  const scoreLabel = getScoreLabel(score)
  const scoreDescription = getScoreLabelDescription(score, business_name)
  const industryAvg = getIndustryAverage(sector)
  const belowAvg = score < industryAvg

  // Build signup URL
  const signupHref = scanEmail
    ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(scanEmail)}`
    : `/signup?scan_id=${scanId}`

  // Parse free engine results
  const FREE_ENGINE_KEYS = ['chatgpt', 'gemini', 'perplexity'] as const
  const freeEngineResults = FREE_ENGINE_KEYS.map((key) => {
    const match = results.engines.find((e) => e.engine === key)
    return {
      key,
      result: {
        is_mentioned: match?.is_mentioned ?? false,
        mention_position: match?.mention_position ?? null,
        sentiment: match?.sentiment ?? null,
        response_snippet: match?.response_snippet ?? null,
      },
    }
  })

  // Expiry
  const expiresAt = (scanData as { expires_at?: string | null }).expires_at
  const daysLeft = daysUntilExpiry(expiresAt) ?? 28

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#f1f4f7] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-6 py-4">
          <Link href="/" aria-label="Beamix home" className="flex items-center gap-2">
            <span className="text-[22px] font-semibold tracking-tight text-[#111827]">
              Beam<span className="text-[#FF3C00]">ix</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={signupHref}
              className="text-[0.875rem] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Log in
            </Link>
            <Link
              href={signupHref}
              className="rounded-lg bg-[#111827] px-5 py-2 text-[0.875rem] font-semibold text-white transition-all hover:bg-[#111827]/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[680px] px-6 pb-24 pt-32"
        aria-label="Scan results"
      >
        {/* ── SECTION 1: Score Hero ── */}
        <motion.section
          variants={itemVariants}
          className="mb-16 text-center"
          aria-labelledby="score-heading"
        >
          <h1 id="score-heading" className="mb-1 text-[28px] font-semibold tracking-tight text-[#111827]">
            Your AI Visibility Score
          </h1>
          <p className="mb-10 text-[14px] text-[#6B7280]">
            {business_name}
            {website_url && (
              <> &middot; {website_url.replace(/^https?:\/\//, '')}</>
            )}
          </p>

          <ScoreRingInline score={score} />

          <p className="mb-1 text-[16px] font-semibold text-[#111827]">
            {scoreLabel} — {scoreDescription}
          </p>
          <p className="text-[13px] text-[#6B7280]">
            Industry average:{' '}
            <span className="tabular-nums font-medium">{industryAvg}</span>
            {' '}·{' '}
            {belowAvg ? "You're below average" : "You're above average"}
          </p>
        </motion.section>

        {/* ── SECTION 2: Engine Results ── */}
        <motion.section variants={itemVariants} className="mb-16" aria-labelledby="engines-heading">
          <h2 id="engines-heading" className="mb-6 text-[18px] font-semibold text-[#111827]">
            Where you appear
          </h2>

          <div className="space-y-4">
            {freeEngineResults.map(({ key, result }) => (
              <EngineRow key={key} engineKey={key} result={result} />
            ))}

            {/* Locked engines overlay */}
            <LockedEnginesSection signupHref={signupHref} />
          </div>
        </motion.section>

        {/* ── SECTION 3: Agent Fix Cards ── */}
        <motion.div variants={itemVariants}>
          <AgentFixSection score={score} sector={sector} signupHref={signupHref} />
        </motion.div>

        {/* ── SECTION 4: CTA Card ── */}
        <motion.div variants={itemVariants}>
          <UpgradeCTACard signupHref={signupHref} sector={sector} />
        </motion.div>

        {/* ── SECTION 5: Urgency footer ── */}
        <motion.section
          variants={itemVariants}
          className="space-y-4 text-center"
          aria-label="Scan expiry notice"
        >
          <p className="text-[12px] text-[#9CA3AF]">
            These results expire in {daysLeft} days. Sign up to save them permanently.
          </p>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Beamix AI Visibility Score', url: window.location.href }).catch(() => {})
              } else {
                navigator.clipboard.writeText(window.location.href).catch(() => {})
              }
            }}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#FF3C00] hover:underline transition-all focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#FF3C00]"
          >
            Share your results
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </motion.section>
      </motion.main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#f1f4f7] bg-white py-12 px-8">
        <div className="mx-auto flex max-w-[680px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <span className="text-lg font-bold tracking-tight text-[#111827]">Beamix</span>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#6B7280]">
              © 2025 Beamix. AI Visibility for your business.
            </p>
          </div>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#9CA3AF] hover:text-[#FF3C00] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#9CA3AF] hover:text-[#FF3C00] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

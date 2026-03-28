'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ScanResults, LLMEngine } from '@/lib/types'
import { ScoreRing } from '@/components/ui/score-ring'
import { Button } from '@/components/ui/button'
import { cn, getScoreColor } from '@/lib/utils'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Lock,
  TrendingUp,
  Zap,
  FileText,
  BarChart2,
  Clock,
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

function getScoreBadgeStyle(score: number): { bg: string; text: string } {
  if (score >= 75) return { bg: 'bg-cyan-50', text: 'text-[#06B6D4]' }
  if (score >= 50) return { bg: 'bg-emerald-50', text: 'text-[#10B981]' }
  if (score >= 25) return { bg: 'bg-amber-50', text: 'text-[#F59E0B]' }
  return { bg: 'bg-red-50', text: 'text-[#EF4444]' }
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
        <Link href="/scan" className="mt-6 inline-block">
          <Button className="rounded-lg bg-[#FF3C00] text-white hover:bg-[#e63600] focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2">
            Try again
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Engine Row (free — shown) ────────────────────────────────────────────────

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

function EngineRow({ engineKey, result }: {
  engineKey: string
  result: { is_mentioned: boolean; mention_position: number | null; sentiment: string | null }
}) {
  const label = ENGINE_LABELS[engineKey] ?? engineKey
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
      {/* Mention indicator — filled vs empty circle (color-blind safe) */}
      <div className="shrink-0">
        {result.is_mentioned ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981]" aria-label="Mentioned">
            <span className="text-[10px] font-bold text-white">●</span>
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#E5E7EB]" aria-label="Not mentioned">
            <span className="text-[10px] text-[#9CA3AF]">○</span>
          </div>
        )}
      </div>

      {/* Engine name */}
      <span className="w-24 shrink-0 text-sm font-medium text-[#111827]">{label}</span>

      {/* Status */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {result.is_mentioned ? (
          <>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-[#10B981]">
              Mentioned
            </span>
            {result.mention_position && (
              <span className="text-xs text-[#6B7280]">
                Rank <strong className="text-[#111827]">#{result.mention_position}</strong>
              </span>
            )}
            {result.sentiment && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                result.sentiment === 'positive' && 'bg-emerald-50 text-[#10B981]',
                result.sentiment === 'neutral' && 'bg-amber-50 text-[#F59E0B]',
                result.sentiment === 'negative' && 'bg-red-50 text-[#EF4444]'
              )}>
                {SENTIMENT_LABEL[result.sentiment] ?? result.sentiment}
              </span>
            )}
          </>
        ) : (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-[#EF4444]">
            Not found
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Locked Engine Row ────────────────────────────────────────────────────────

const LOCKED_ENGINES = [
  { key: 'claude', label: 'Claude' },
  { key: 'google_ai_overviews', label: 'Google AI Overviews' },
  { key: 'grok', label: 'Grok (X)' },
  { key: 'you_com', label: 'You.com' },
]

function LockedEngineRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 opacity-60">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#E5E7EB] bg-white">
        <Lock className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />
      </div>
      <span className="w-24 shrink-0 text-sm font-medium text-[#9CA3AF]">{label}</span>
      <span className="text-xs text-[#9CA3AF]">Unlock with free trial</span>
    </div>
  )
}

// ─── Teaser Recommendations ───────────────────────────────────────────────────

const TEASER_RECS = [
  {
    title: 'Add an FAQ page optimized for AI queries',
    description: 'AI engines favor structured Q&A content. A targeted FAQ page can get you mentioned in 2–3 more engines.',
    impact: 'High impact',
    impactColor: 'text-[#EF4444]',
    impactBg: 'bg-red-50',
  },
  {
    title: 'Claim and optimize your business description',
    description: 'Consistent, keyword-rich descriptions across directories help AI engines build a clear picture of your business.',
    impact: 'Medium impact',
    impactColor: 'text-[#F59E0B]',
    impactBg: 'bg-amber-50',
  },
]

function TeaserRecommendations({ lockedCount }: { lockedCount: number }) {
  return (
    <div className="space-y-3">
      {TEASER_RECS.map((rec, i) => (
        <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-[#111827]">{rec.title}</h4>
              <p className="mt-1 text-sm text-[#6B7280]">{rec.description}</p>
            </div>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', rec.impactBg, rec.impactColor)}>
              {rec.impact}
            </span>
          </div>
        </div>
      ))}

      {/* Locked count teaser */}
      {lockedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <Lock className="h-4 w-4 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
          <span className="text-sm text-[#6B7280]">
            Unlock <strong className="text-[#111827]">{lockedCount} more</strong> personalized recommendations
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Agent Preview Cards ("What our agents would fix") ───────────────────────

interface AgentPreview {
  icon: React.ComponentType<{ className?: string }>
  name: string
  action: string
  estimatedGain: number
  accent: string
  accentBg: string
}

function buildAgentPreviews(score: number): AgentPreview[] {
  return [
    {
      icon: FileText,
      name: 'Content Writer',
      action: 'Create an AI-optimized FAQ + About page targeting your top missed queries',
      estimatedGain: score < 50 ? 12 : 8,
      accent: 'text-[#3370FF]',
      accentBg: 'bg-[#EBF0FF]',
    },
    {
      icon: BarChart2,
      name: 'Schema Optimizer',
      action: 'Add structured data markup (JSON-LD) so AI engines can parse your business details',
      estimatedGain: score < 50 ? 8 : 5,
      accent: 'text-[#10B981]',
      accentBg: 'bg-emerald-50',
    },
    {
      icon: TrendingUp,
      name: 'Competitor Intelligence',
      action: 'Identify the exact phrases your competitors rank for and create content to compete',
      estimatedGain: score < 50 ? 7 : 4,
      accent: 'text-[#F59E0B]',
      accentBg: 'bg-amber-50',
    },
  ]
}

function AgentPreviewSection({ score }: { score: number }) {
  const agents = buildAgentPreviews(score)
  const totalGain = agents.reduce((sum, a) => sum + a.estimatedGain, 0)
  const projectedScore = Math.min(100, score + totalGain)

  return (
    <section aria-labelledby="agents-heading">
      <h2 id="agents-heading" className="text-lg font-medium text-[#111827]">
        What our agents would fix
      </h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        Start a trial and these agents get to work automatically.
      </p>

      <div className="mt-4 space-y-3">
        {agents.map((agent, i) => {
          const Icon = agent.icon
          return (
            <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', agent.accentBg)}>
                  <Icon className={cn('h-4 w-4', agent.accent)} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#111827]">{agent.name}</span>
                    <span className="shrink-0 text-xs font-medium text-[#10B981]">
                      +{agent.estimatedGain} pts
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">{agent.action}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total improvement estimate */}
      <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280]">Total estimated improvement</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#9CA3AF] line-through">{score}</span>
            <ArrowRight className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#10B981]">
              {projectedScore}{' '}
              <span className="text-[#10B981]">(+{totalGain} points)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Social Proof ─────────────────────────────────────────────────────────────

function SocialProof({ industry }: { industry: string | null }) {
  const industryLabel = industry ?? 'your industry'
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
      <p className="text-sm text-[#6B7280]">
        <Zap className="inline-block h-4 w-4 text-[#FF3C00] mr-1 align-text-bottom" aria-hidden="true" />
        Built for businesses like yours in{' '}
        <strong className="text-[#111827]">{industryLabel}</strong>
      </p>
    </div>
  )
}

// ─── Data Expiry Notice ───────────────────────────────────────────────────────

function ExpiryNotice({ expiresAt }: { expiresAt: string | null | undefined }) {
  const days = daysUntilExpiry(expiresAt)
  if (days === null) return null

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-[#9CA3AF]">
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Results expire in{' '}
        <strong className={cn(days <= 7 ? 'text-[#EF4444]' : 'text-[#6B7280]')}>{days} days</strong>
      </span>
    </div>
  )
}

// ─── Upgrade CTA Card ─────────────────────────────────────────────────────────

function UpgradeCTA({ scanId, email }: { scanId: string; email?: string | null }) {
  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const signupHref = isValidEmail
    ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(email)}`
    : `/signup?scan_id=${scanId}`

  return (
    <div className="rounded-xl border-2 border-[#3370FF] bg-white p-6 text-center">
      <h3 className="text-xl font-medium text-[#111827]">
        Ready to fix your AI visibility?
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-[#6B7280]">
        Beamix agents implement these fixes automatically. Start your 7-day free trial — no credit card required.
      </p>

      <Link href={signupHref} className="mt-5 inline-block">
        <Button
          size="lg"
          className="rounded-lg bg-[#FF3C00] px-8 text-white hover:bg-[#e63600] focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
        >
          Start 7-day free trial
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#9CA3AF]">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          7-day free trial
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          No credit card
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          Cancel anytime
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScanResultsClient({ scanId }: { scanId: string }) {
  const [status, setStatus] = useState<ScanPageStatus>('loading')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status }, [status])

  // Derived values from scan data (used in results view)
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
          <Link href="/scan" className="mt-6 inline-block">
            <Button className="rounded-lg bg-[#FF3C00] text-white hover:bg-[#e63600]">
              Run a new scan
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  const { results, business_name } = scanData
  const score = results.visibility_score
  const scoreBadge = getScoreBadgeStyle(score)
  const scoreColor = getScoreColor(score)

  // Parse free engine results (chatgpt, gemini, perplexity)
  const FREE_ENGINE_KEYS = ['chatgpt', 'gemini', 'perplexity'] as const
  const freeEngineResults = FREE_ENGINE_KEYS.map((key) => {
    const match = results.engines.find((e) => e.engine === key)
    return {
      key,
      result: match ?? { is_mentioned: false, mention_position: null, sentiment: null },
    }
  })

  const mentionedFreeCount = freeEngineResults.filter((e) => e.result.is_mentioned).length

  // Locked recommendation count (total - 2 teaser shown)
  const lockedRecCount = Math.max(0, (results.quick_wins?.length ?? 5) - 2)

  // Expiry date from scanData (may come from API)
  const expiresAt = (scanData as { expires_at?: string | null }).expires_at

  const signupHref = scanEmail
    ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(scanEmail)}`
    : `/signup?scan_id=${scanId}`

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* ── Header ── */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" aria-label="Beamix home">
            <span className="text-lg font-semibold text-[#111827]">
              Beam<span className="text-[#FF3C00]">ix</span>
            </span>
          </Link>
          <Link
            href={signupHref}
            className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#FF3C00]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Page body ── */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl space-y-6 px-4 py-8"
        aria-label="Scan results"
      >
        {/* ── Score Hero ── */}
        <motion.section
          variants={itemVariants}
          className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-8 text-center"
          aria-labelledby="score-heading"
        >
          <p className="text-sm font-medium text-[#6B7280]">Your AI Visibility Score</p>
          <h1 id="score-heading" className="mt-1 text-lg font-medium text-[#111827]">
            {business_name}
          </h1>

          <div className="mt-6 flex justify-center">
            <ScoreRing score={score} size="lg" animate showLabel />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className={cn('rounded-full px-3 py-1 text-sm font-medium', scoreBadge.bg, scoreBadge.text)}
            >
              {getScoreLabel(score)}
            </span>
          </div>

          <p className="mt-3 text-sm text-[#6B7280]">
            Mentioned in{' '}
            <strong style={{ color: scoreColor }} className="tabular-nums">
              {mentionedFreeCount} of 3
            </strong>{' '}
            free engines checked
          </p>
        </motion.section>

        {/* ── Engine Results ── */}
        <motion.section variants={itemVariants} aria-labelledby="engines-heading">
          <h2 id="engines-heading" className="mb-3 text-base font-medium text-[#111827]">
            Engine Results
          </h2>

          {/* Free engines */}
          <div className="space-y-2">
            {freeEngineResults.map(({ key, result }) => (
              <EngineRow key={key} engineKey={key} result={result} />
            ))}
          </div>

          {/* Locked engines */}
          <div className="mt-2 space-y-2">
            {LOCKED_ENGINES.map((eng) => (
              <LockedEngineRow key={eng.key} label={eng.label} />
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-[#9CA3AF]">
            4 additional engines unlocked with free trial
          </p>
        </motion.section>

        {/* ── Teaser Recommendations ── */}
        <motion.section variants={itemVariants} aria-labelledby="recs-heading">
          <h2 id="recs-heading" className="mb-3 text-base font-medium text-[#111827]">
            Top Recommendations
          </h2>
          <TeaserRecommendations lockedCount={lockedRecCount} />
        </motion.section>

        {/* ── Agent Previews ── */}
        <motion.div variants={itemVariants}>
          <AgentPreviewSection score={score} />
        </motion.div>

        {/* ── Inline mid-page CTA ── */}
        <motion.div variants={itemVariants} className="text-center">
          <Link href={signupHref}>
            <Button
              size="lg"
              className="w-full rounded-lg bg-[#FF3C00] text-white hover:bg-[#e63600] focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2 sm:w-auto sm:px-10"
            >
              Start 7-day free trial
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <p className="mt-2 text-xs text-[#9CA3AF]">No credit card required</p>
        </motion.div>

        {/* ── Social Proof ── */}
        <motion.div variants={itemVariants}>
          <SocialProof industry={scanData.sector ?? null} />
        </motion.div>

        {/* ── Data Expiry ── */}
        {expiresAt && (
          <motion.div variants={itemVariants}>
            <ExpiryNotice expiresAt={expiresAt} />
          </motion.div>
        )}

        {/* ── Upgrade CTA Card ── */}
        <motion.div variants={itemVariants}>
          <UpgradeCTA scanId={scanId} email={scanEmail} />
        </motion.div>

        {/* ── Footer ── */}
        <motion.footer
          variants={itemVariants}
          className="border-t border-[#F3F4F6] pt-6 text-center text-xs text-[#9CA3AF]"
        >
          <Link
            href="/"
            className="font-medium text-[#6B7280] hover:text-[#111827] transition-colors focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#FF3C00]"
          >
            Beamix
          </Link>
          {' · '}
          <Link
            href="/privacy"
            className="hover:text-[#6B7280] transition-colors focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#FF3C00]"
          >
            Privacy
          </Link>
          {' · '}
          <Link
            href="/terms"
            className="hover:text-[#6B7280] transition-colors focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#FF3C00]"
          >
            Terms
          </Link>
        </motion.footer>
      </motion.main>
    </div>
  )
}

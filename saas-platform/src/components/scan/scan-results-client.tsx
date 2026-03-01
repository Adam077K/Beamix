'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScanResults, LLMEngine } from '@/lib/types'
import { ENGINE_LABELS } from '@/lib/scan/mock-engine'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trophy,
  Zap,
  ArrowRight,
  AlertTriangle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Share2,
  Link2,
  Lock,
} from 'lucide-react'

type ScanPageStatus = 'loading' | 'processing' | 'completed' | 'error'

interface ScanData {
  scan_id: string
  business_name: string
  website_url: string
  sector: string
  location: string
  results: ScanResults
}

// --- Utility functions ---

function getScoreColor(score: number): string {
  if (score >= 75) return 'var(--score-excellent)'
  if (score >= 50) return 'var(--score-good)'
  if (score >= 25) return 'var(--score-fair)'
  return 'var(--score-critical)'
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

// --- Animation variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// --- Processing State with per-engine indicators ---

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
    { engine: 'claude', label: 'Claude', status: 'waiting' },
  ])
  const [phase, setPhase] = useState<'engines' | 'analyzing'>('engines')

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Stagger engine checks
    engineStatuses.forEach((_, i) => {
      // Start checking
      timers.push(
        setTimeout(() => {
          setEngineStatuses((prev) =>
            prev.map((e, idx) => (idx === i ? { ...e, status: 'checking' } : e))
          )
        }, i * 1200)
      )
      // Mark done
      timers.push(
        setTimeout(() => {
          setEngineStatuses((prev) =>
            prev.map((e, idx) => (idx === i ? { ...e, status: 'done' } : e))
          )
        }, i * 1200 + 1000)
      )
    })

    // Switch to analyzing phase
    timers.push(
      setTimeout(() => {
        setPhase('analyzing')
      }, engineStatuses.length * 1200 + 500)
    )

    return () => timers.forEach(clearTimeout)
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completedCount = engineStatuses.filter((e) => e.status === 'done').length
  const progressPercent = phase === 'analyzing'
    ? 80 + Math.min(20, 0)
    : (completedCount / engineStatuses.length) * 80

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-accent)]" />
        <h2 className="mt-6 font-display text-2xl font-bold text-[var(--color-text)]">
          Scanning your business
        </h2>

        {/* Per-engine status indicators */}
        <div className="mt-8 space-y-3">
          {engineStatuses.map((engine) => (
            <div
              key={engine.engine}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
            >
              {engine.status === 'waiting' && (
                <div className="h-5 w-5 rounded-full border-2 border-[var(--color-card-border)]" />
              )}
              {engine.status === 'checking' && (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
              )}
              {engine.status === 'done' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  engine.status === 'checking'
                    ? 'text-[var(--color-accent)]'
                    : engine.status === 'done'
                      ? 'text-emerald-600'
                      : 'text-[var(--color-muted)]'
                }`}
              >
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
            className="mt-4 text-sm text-[var(--color-muted)]"
          >
            Analyzing results and calculating your score...
          </motion.p>
        )}

        <Progress value={progressPercent} className="mx-auto mt-6 w-full" />
      </motion.div>
    </div>
  )
}

// --- DotsIndicator: 10 dots filled by score ---

function DotsIndicator({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const filledDots = Math.round(score / 10)
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`rounded-full ${dotSize} transition-colors`}
          style={{
            backgroundColor: i < filledDots ? getScoreColor(score) : 'var(--color-card-border)',
          }}
        />
      ))}
    </div>
  )
}

// --- Score Reveal with animated counter ---

function ScoreReveal({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center"
    >
      <div
        className="relative flex h-40 w-40 items-center justify-center rounded-full border-4"
        style={{ borderColor: getScoreColor(score) }}
      >
        <span
          className="font-display text-5xl font-bold"
          style={{ color: getScoreColor(score) }}
        >
          {displayScore}
        </span>
      </div>
      <Badge
        className="mt-3 text-sm"
        style={{
          backgroundColor: getScoreColor(score),
          color: '#fff',
        }}
      >
        {getScoreLabel(score)}
      </Badge>
      <div className="mt-4">
        <DotsIndicator score={score} />
      </div>
    </motion.div>
  )
}

// --- Score Breakdown Gradient Bar ---

function ScoreBreakdownBar({ score }: { score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-[var(--color-muted)]">
        <span>Critical</span>
        <span>Fair</span>
        <span>Good</span>
        <span>Excellent</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-400 via-amber-400 via-60% to-emerald-400">
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(score, 100)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' as const }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="h-5 w-5 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: getScoreColor(score) }}
          />
        </motion.div>
      </div>
      <div className="flex justify-between text-xs font-medium text-[var(--color-muted)]">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  )
}

// --- Engine Card ---

function EngineCard({
  engine,
  result,
}: {
  engine: LLMEngine
  result: ScanResults['engines'][number]
}) {
  return (
    <Card
      className="border-[var(--color-card-border)]"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg font-semibold">
            {ENGINE_LABELS[engine]}
          </h4>
          {result.is_mentioned ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Mentioned
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-50 text-red-600">
              <XCircle className="mr-1 h-3 w-3" />
              Not found
            </Badge>
          )}
        </div>

        {result.is_mentioned && (
          <div className="mt-3 flex items-center gap-4 text-sm text-[var(--color-muted)]">
            <span>
              Position: <strong className="text-[var(--color-text)]">#{result.mention_position}</strong>
            </span>
            <span className="flex items-center gap-1">
              Sentiment:{' '}
              {result.sentiment === 'positive' && (
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {result.sentiment === 'neutral' && (
                <Minus className="h-3.5 w-3.5 text-amber-500" />
              )}
              {result.sentiment === 'negative' && (
                <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <strong className="capitalize text-[var(--color-text)]">
                {result.sentiment}
              </strong>
            </span>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          &ldquo;{result.response_snippet}&rdquo;
        </p>

        {result.competitors_mentioned.length > 0 && (
          <div className="mt-3">
            <span className="text-xs text-[var(--color-muted)]">
              Also mentioned:
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {result.competitors_mentioned.map((comp) => (
                <Badge key={comp} variant="outline" className="text-xs">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Top Competitor Callout ---

function TopCompetitorCallout({
  competitor,
  competitorScore,
  userScore,
}: {
  competitor: string
  competitorScore: number
  userScore: number
}) {
  const gap = Math.round(competitorScore - userScore)

  return (
    <Card
      className="border-amber-200 bg-amber-50"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-amber-900">
              Top Competitor Threat
            </h3>
            <p className="mt-2 text-sm text-amber-800">
              <strong>{competitor}</strong> scores{' '}
              <strong>{competitorScore}</strong> in AI visibility — that&apos;s{' '}
              <strong>{gap} points</strong> above your score of{' '}
              <strong>{userScore}</strong>.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              When potential customers ask AI about your industry, {competitor} is
              more likely to be recommended. Every day without optimization is a
              day they capture leads that should be yours.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <span className="block text-2xl font-bold text-amber-900">{userScore}</span>
                <span className="text-xs text-amber-600">Your score</span>
              </div>
              <div className="flex-1">
                <div className="relative h-2 rounded-full bg-amber-200">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-amber-400"
                    style={{ width: `${userScore}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-amber-900">{competitorScore}</span>
                <span className="text-xs text-amber-600">{competitor}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Leaderboard ---

function LeaderboardSection({
  leaderboard,
}: {
  leaderboard: ScanResults['leaderboard']
}) {
  return (
    <Card
      className="border-[var(--color-card-border)]"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Trophy className="h-5 w-5 text-[var(--color-accent-warm)]" />
          AI Visibility Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.name}
            className={`flex items-center gap-3 rounded-xl p-3 ${
              entry.is_user
                ? 'bg-cyan-50 ring-1 ring-[var(--color-accent)]'
                : 'bg-[var(--color-bg)]'
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                entry.rank <= 3
                  ? 'bg-[var(--color-accent-warm)] text-white'
                  : 'bg-[var(--color-card-border)] text-[var(--color-muted)]'
              }`}
            >
              {entry.rank}
            </span>
            <span
              className={`flex-1 text-sm font-medium ${
                entry.is_user ? 'text-[var(--color-accent)]' : ''
              }`}
            >
              {entry.name}
              {entry.is_user && (
                <span className="ml-2 text-xs text-[var(--color-muted)]">
                  (You)
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <DotsIndicator score={entry.score} size="sm" />
              <span className="w-10 text-right text-sm font-semibold">
                {Math.round(entry.score)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// --- Quick Wins (show first 3 free, blur the rest) ---

function QuickWinsSection({
  quickWins,
}: {
  quickWins: ScanResults['quick_wins']
}) {
  const impactColors = {
    high: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', icon: TrendingUp },
    low: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Zap },
  }

  const freeWins = quickWins.slice(0, 3)

  return (
    <Card
      className="border-[var(--color-card-border)]"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Zap className="h-5 w-5 text-[var(--color-accent-warm)]" />
          Quick Wins to Improve Your Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {freeWins.map((win, i) => {
          const style = impactColors[win.impact]
          const ImpactIcon = style.icon
          return (
            <div key={i} className={`rounded-xl ${style.bg} p-4`}>
              <div className="flex items-start gap-3">
                <ImpactIcon className={`mt-0.5 h-5 w-5 shrink-0 ${style.text}`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--color-text)]">
                    {win.title}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {win.description}
                  </p>
                  {win.engine_benefit && (
                    <p className="mt-2 text-xs font-medium text-[var(--color-accent)]">
                      {win.engine_benefit}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 capitalize ${style.text}`}
                >
                  {win.impact} impact
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// --- Gated/Blurred CTA ---

function GatedCTA({ scanId }: { scanId: string }) {
  return (
    <div className="relative">
      {/* Blurred placeholder content */}
      <Card
        className="border-[var(--color-card-border)] select-none"
        style={{ borderRadius: 'var(--card-radius)' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Zap className="h-5 w-5 text-[var(--color-accent-warm)]" />
            5 More Personalized Fixes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl bg-gray-50 p-4 blur-sm">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center rounded-[var(--card-radius)] bg-white/80 backdrop-blur-sm">
        <div className="text-center px-6">
          <Lock className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
          <h3 className="mt-4 font-display text-xl font-bold text-[var(--color-text)]">
            Unlock 5 More Personalized Fixes
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-muted)]">
            Sign up for a free 14-day trial to get detailed, AI-generated action
            items tailored to your business.
          </p>
          <Link href={`/signup?scan_id=${scanId}`}>
            <Button
              size="lg"
              className="mt-4 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
            >
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// --- Share Section ---

function ShareSection({ scanId }: { scanId: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = `${window.location.origin}/scan/${scanId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareUrl = encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${scanId}`)
  const shareText = encodeURIComponent('Check out my AI visibility score from Beamix!')

  return (
    <Card
      className="border-[var(--color-card-border)]"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5 text-[var(--color-accent)]" />
          <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Share your results
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="gap-2"
          >
            <Link2 className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </Button>
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Conversion CTA ---

function ConversionCTA({ scanId }: { scanId: string }) {
  return (
    <Card
      className="border-2 border-[var(--color-accent)] bg-gradient-to-br from-cyan-50 to-white"
      style={{ borderRadius: 'var(--card-radius)' }}
    >
      <CardContent className="p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Ready to fix your AI visibility?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-muted)]">
          Beamix AI agents can implement these fixes automatically.
          Start your 14-day free trial — no credit card required.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={`/signup?scan_id=${scanId}`}>
            <Button
              size="lg"
              className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
            >
              Start fixing now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              See pricing
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---

export function ScanResultsClient({ scanId }: { scanId: string }) {
  const [status, setStatus] = useState<ScanPageStatus>('loading')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
      setErrorMsg('Network error')
    }
  }, [scanId])

  useEffect(() => {
    pollStatus()
    const interval = setInterval(() => {
      if (status === 'loading' || status === 'processing') {
        pollStatus()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [pollStatus, status])

  if (status === 'loading' || status === 'processing') {
    return <ProcessingState />
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
        <XCircle className="h-12 w-12 text-[var(--score-critical)]" />
        <h2 className="mt-4 font-display text-2xl font-bold">
          Something went wrong
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">{errorMsg}</p>
        <Link href="/scan" className="mt-6">
          <Button>Try again</Button>
        </Link>
      </div>
    )
  }

  if (!scanData?.results) return null

  const { results, business_name } = scanData
  const mentionedCount = results.engines.filter((e) => e.is_mentioned).length

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-card-border)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/">
            <span className="font-display text-xl font-bold text-[var(--color-text)]">
              Beam<span className="text-[var(--color-accent)]">ix</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/scan">
              <Button variant="outline" size="sm">
                New scan
              </Button>
            </Link>
            <Link href={`/signup?scan_id=${scanId}`}>
              <Button size="sm" className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90">
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl px-4 py-8"
      >
        {/* Hero: Score */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
            AI Visibility Report
          </h1>
          <p className="mt-2 text-lg text-[var(--color-muted)]">
            {business_name}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center"
        >
          <ScoreReveal score={results.visibility_score} />
          <p className="mt-4 text-center text-[var(--color-muted)]">
            Your business is mentioned in{' '}
            <strong className="text-[var(--color-text)]">
              {mentionedCount} of {results.engines.length}
            </strong>{' '}
            AI engines
          </p>
        </motion.div>

        {/* Score Breakdown Bar */}
        <motion.div variants={itemVariants} className="mx-auto mt-6 max-w-md">
          <ScoreBreakdownBar score={results.visibility_score} />
        </motion.div>

        <Separator className="my-8" />

        {/* Top Competitor Callout */}
        <motion.div variants={itemVariants}>
          <TopCompetitorCallout
            competitor={results.top_competitor}
            competitorScore={results.top_competitor_score}
            userScore={results.visibility_score}
          />
        </motion.div>

        <Separator className="my-8" />

        {/* Engine Breakdown */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
            Per-Engine Breakdown
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {results.engines.map((result) => (
              <EngineCard
                key={result.engine}
                engine={result.engine}
                result={result}
              />
            ))}
          </div>
        </motion.div>

        <Separator className="my-8" />

        {/* Leaderboard */}
        <motion.div variants={itemVariants}>
          <LeaderboardSection leaderboard={results.leaderboard} />
        </motion.div>

        <Separator className="my-8" />

        {/* Quick Wins (free — first 3) */}
        <motion.div variants={itemVariants}>
          <QuickWinsSection quickWins={results.quick_wins} />
        </motion.div>

        <Separator className="my-8" />

        {/* Gated CTA — blurred additional fixes */}
        <motion.div variants={itemVariants}>
          <GatedCTA scanId={scanId} />
        </motion.div>

        <Separator className="my-8" />

        {/* Share Section */}
        <motion.div variants={itemVariants}>
          <ShareSection scanId={scanId} />
        </motion.div>

        <Separator className="my-8" />

        {/* Conversion CTA */}
        <motion.div variants={itemVariants}>
          <ConversionCTA scanId={scanId} />
        </motion.div>
      </motion.div>
    </div>
  )
}

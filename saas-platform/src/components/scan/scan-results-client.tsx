'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ScanResults, LLMEngine } from '@/lib/types'
import { ENGINE_LABELS, PROVIDER_COLORS } from '@/constants/engines'
import type { LlmProvider } from '@/constants/engines'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn, getScoreColor } from '@/lib/utils'
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
  ChevronRight,
} from 'lucide-react'

type ScanPageStatus = 'loading' | 'processing' | 'completed' | 'error'

interface ScanData {
  scan_id: string
  business_name: string
  website_url: string
  sector: string
  location: string
  email?: string | null
  results: ScanResults
}

// --- Utility functions ---

// getScoreColorHex: alias for the shared getScoreColor from @/lib/utils
const getScoreColorHex = (score: number): string => getScoreColor(score)

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

function getScoreBadgeClasses(score: number): string {
  if (score >= 75) return 'bg-cyan-50 text-[#06B6D4]'
  if (score >= 50) return 'bg-green-50 text-[#10B981]'
  if (score >= 25) return 'bg-amber-50 text-[#F59E0B]'
  return 'bg-red-50 text-[#EF4444]'
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

    engineStatuses.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setEngineStatuses((prev) =>
            prev.map((e, idx) => (idx === i ? { ...e, status: 'checking' } : e))
          )
        }, i * 1200)
      )
      timers.push(
        setTimeout(() => {
          setEngineStatuses((prev) =>
            prev.map((e, idx) => (idx === i ? { ...e, status: 'done' } : e))
          )
        }, i * 1200 + 1000)
      )
    })

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
  const progressPercent =
    phase === 'analyzing'
      ? 95
      : (completedCount / engineStatuses.length) * 80

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-6 font-sans font-medium text-2xl text-foreground">
          Scanning your business
        </h2>

        {/* Per-engine status indicators */}
        <div className="mt-8 space-y-3">
          {engineStatuses.map((engine) => (
            <div
              key={engine.engine}
              className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border"
            >
              {engine.status === 'waiting' && (
                <div className="h-5 w-5 rounded-full border-2 border-border" />
              )}
              {engine.status === 'checking' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {engine.status === 'done' && (
                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  engine.status === 'checking' && 'text-primary',
                  engine.status === 'done' && 'text-[#10B981]',
                  engine.status === 'waiting' && 'text-muted-foreground'
                )}
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
            className="mt-4 text-sm text-muted-foreground"
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
          className={cn(`rounded-full ${dotSize} transition-colors`, i >= filledDots && 'bg-border')}
          style={i < filledDots ? { backgroundColor: getScoreColorHex(score) } : undefined}
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
        style={{ borderColor: getScoreColorHex(score) }}
      >
        <span
          className="font-sans font-bold text-5xl"
          style={{ color: getScoreColorHex(score) }}
        >
          {displayScore}
        </span>
      </div>
      <span
        className={cn(
          'mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
          getScoreBadgeClasses(score)
        )}
      >
        {getScoreLabel(score)}
      </span>
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
      <div className="flex justify-between text-xs text-muted-foreground">
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
            style={{ backgroundColor: getScoreColorHex(score) }}
          />
        </motion.div>
      </div>
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
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
  const providerColor =
    engine in PROVIDER_COLORS
      ? PROVIDER_COLORS[engine as LlmProvider]
      : 'bg-muted text-muted-foreground'

  return (
    <Card className="rounded-[20px] border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', providerColor)}>
              {ENGINE_LABELS[engine]}
            </span>
          </div>
          {result.is_mentioned ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="me-1 h-3 w-3" />
              Mentioned
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-50 text-red-600">
              <XCircle className="me-1 h-3 w-3" />
              Not found
            </Badge>
          )}
        </div>

        {result.is_mentioned && (
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Position:{' '}
              <strong className="text-foreground">#{result.mention_position}</strong>
            </span>
            <span className="flex items-center gap-1">
              Sentiment:{' '}
              {result.sentiment === 'positive' && (
                <ThumbsUp className="h-3.5 w-3.5 text-[#10B981]" />
              )}
              {result.sentiment === 'neutral' && (
                <Minus className="h-3.5 w-3.5 text-[#F59E0B]" />
              )}
              {result.sentiment === 'negative' && (
                <ThumbsDown className="h-3.5 w-3.5 text-[#EF4444]" />
              )}
              <strong className="capitalize text-foreground">{result.sentiment}</strong>
            </span>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{result.response_snippet}&rdquo;
        </p>

        {result.competitors_mentioned.length > 0 && (
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">Also mentioned:</span>
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
    <Card className="rounded-[20px] border border-amber-200 bg-amber-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-sans font-bold text-lg text-amber-900">
              Top Competitor Threat
            </h3>
            <p className="mt-2 text-sm text-amber-800">
              <strong>{competitor}</strong> scores{' '}
              <strong>{competitorScore}</strong> in AI visibility — that&apos;s{' '}
              <strong>{gap} points</strong> above your score of{' '}
              <strong>{userScore}</strong>.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              When potential customers ask AI about your industry, {competitor} is more likely to
              be recommended. Every day without optimization is a day they capture leads that
              should be yours.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <span className="block text-2xl font-bold text-amber-900">{userScore}</span>
                <span className="text-xs text-amber-600">Your score</span>
              </div>
              <div className="flex-1">
                <div className="relative h-2 rounded-full bg-amber-200">
                  <div
                    className="absolute start-0 top-0 h-full rounded-full bg-amber-400"
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
    <Card className="rounded-[20px] border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          AI Visibility Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.name}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3',
              entry.is_user
                ? 'bg-[#FFF5F2] ring-1 ring-primary'
                : 'bg-background'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                entry.rank <= 3
                  ? 'bg-primary text-white'
                  : 'bg-border text-muted-foreground'
              )}
            >
              {entry.rank}
            </span>
            <span
              className={cn(
                'flex-1 text-sm font-medium',
                entry.is_user && 'text-primary'
              )}
            >
              {entry.name}
              {entry.is_user && (
                <span className="ms-2 text-xs text-muted-foreground">(You)</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <DotsIndicator score={entry.score} size="sm" />
              <span className="w-10 text-end text-sm font-semibold">
                {Math.round(entry.score)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// --- Quick Wins (show first 3 free) ---

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
    <Card className="rounded-[20px] border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Quick Wins to Improve Your Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {freeWins.map((win, i) => {
          const style = impactColors[win.impact]
          const ImpactIcon = style.icon
          return (
            <div key={i} className={cn('rounded-xl p-4', style.bg)}>
              <div className="flex items-start gap-3">
                <ImpactIcon className={cn('mt-0.5 h-5 w-5 shrink-0', style.text)} />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{win.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{win.description}</p>
                  {win.engine_benefit && (
                    <p className="mt-2 text-xs font-medium text-primary">{win.engine_benefit}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn('shrink-0 capitalize', style.text)}
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

function GatedCTA({ scanId, email }: { scanId: string; email?: string | null }) {
  const signupHref = email
    ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(email)}`
    : `/signup?scan_id=${scanId}`

  return (
    <div className="relative">
      {/* Blurred placeholder content */}
      <Card className="select-none rounded-[20px] border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-lg">
            <Zap className="h-5 w-5 text-primary" />
            5 More Personalized Fixes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl bg-muted p-4 blur-sm">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-border" />
                  <div className="h-3 w-full rounded bg-border" />
                  <div className="h-3 w-2/3 rounded bg-border" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-card/80 backdrop-blur-sm">
        <div className="px-6 text-center">
          <Lock className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-4 font-sans font-bold text-xl text-foreground">
            Unlock 5 More Personalized Fixes
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Sign up for a free 7-day trial to get detailed, AI-generated action items tailored to
            your business.
          </p>
          <Link href={signupHref}>
            <Button
              size="lg"
              className="mt-4 rounded-full bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Start free trial
              <ArrowRight className="ms-2 h-4 w-4" />
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

  const shareUrl = encodeURIComponent(
    `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${scanId}`
  )
  const shareText = encodeURIComponent('Check out my AI visibility score from Beamix!')

  return (
    <Card className="rounded-[20px] border border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5 text-primary" />
          <h3 className="font-sans font-semibold text-lg text-foreground">
            Share your results
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
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

function ConversionCTA({ scanId, email }: { scanId: string; email?: string | null }) {
  const signupHref = email
    ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(email)}`
    : `/signup?scan_id=${scanId}`

  return (
    <Card className="rounded-[20px] border-2 border-primary bg-gradient-to-br from-[#FFF5F2] to-card">
      <CardContent className="p-8 text-center">
        <h3 className="font-sans font-bold text-2xl text-foreground">
          Ready to fix your AI visibility?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Beamix AI agents can implement these fixes automatically. Start your 7-day free trial —
          no credit card required.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={signupHref}>
            <Button
              size="lg"
              className="rounded-full bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Start fixing now
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              See pricing
            </Button>
          </Link>
        </div>

        {/* Value props */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            7-day free trial
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            Cancel anytime
          </span>
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
  const scanEmail = scanData?.email ?? null
  const statusRef = useRef(status)
  useEffect(() => { statusRef.current = status }, [status])

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
    const interval = setInterval(() => {
      if (statusRef.current === 'loading' || statusRef.current === 'processing') {
        pollStatus()
      }
    }, 2000)
    // Initial poll — run on next tick to satisfy react-hooks/set-state-in-effect
    const timeout = setTimeout(() => pollStatus(), 0)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [pollStatus])

  if (status === 'loading' || status === 'processing') {
    return <ProcessingState />
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-sans font-bold text-2xl text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-muted-foreground">{errorMsg}</p>
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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 h-14">
          <Link href="/">
            <span className="font-sans font-bold text-xl text-foreground">
              Beam<span className="text-primary">ix</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/scan">
              <Button variant="outline" size="sm">
                New scan
              </Button>
            </Link>
            <Link
              href={
                scanEmail
                  ? `/signup?scan_id=${scanId}&email=${encodeURIComponent(scanEmail)}`
                  : `/signup?scan_id=${scanId}`
              }
            >
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
              >
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
          <h1 className="font-sans font-medium text-3xl text-foreground">
            AI Visibility Report
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{business_name}</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center"
        >
          <ScoreReveal score={results.visibility_score} />
          <p className="mt-4 text-center text-muted-foreground">
            Your business is mentioned in{' '}
            <strong className="text-foreground">
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

        {/* Visibility Summary */}
        {results.visibility_summary && (
          <motion.div variants={itemVariants}>
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">{results.visibility_summary}</p>
            </div>
          </motion.div>
        )}

        <Separator className="my-8" />

        {/* Engine Breakdown */}
        <motion.div variants={itemVariants}>
          <h2 className="font-sans font-bold text-xl text-foreground">
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

        {/* Queries Used */}
        {results.queries_used && results.queries_used.length > 0 && (
          <>
            <Separator className="my-8" />
            <motion.div variants={itemVariants}>
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  What we searched for
                </summary>
                <div className="mt-3 space-y-2 pl-6">
                  {results.queries_used.map((query, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground italic">&quot;{query}&quot;</span>
                    </div>
                  ))}
                </div>
              </details>
            </motion.div>
          </>
        )}

        {/* Business Context — how we understood the business */}
        {results.business_context && (
          <>
            <Separator className="my-8" />
            <motion.div variants={itemVariants}>
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  How we understood your business
                </summary>
                <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Industry: </span>
                    <span className="text-muted-foreground">{results.business_context.detected_industry}</span>
                  </div>
                  {results.business_context.description && (
                    <div>
                      <span className="font-medium text-foreground">About: </span>
                      <span className="text-muted-foreground">{results.business_context.description}</span>
                    </div>
                  )}
                  {results.business_context.services.length > 0 && (
                    <div>
                      <span className="font-medium text-foreground">Services: </span>
                      <span className="text-muted-foreground">{results.business_context.services.join(', ')}</span>
                    </div>
                  )}
                  {results.business_context.website_title && (
                    <div>
                      <span className="font-medium text-foreground">Website title: </span>
                      <span className="text-muted-foreground">{results.business_context.website_title}</span>
                    </div>
                  )}
                  {results.business_context.website_description && (
                    <div>
                      <span className="font-medium text-foreground">Website description: </span>
                      <span className="text-muted-foreground">{results.business_context.website_description}</span>
                    </div>
                  )}
                </div>
              </details>
            </motion.div>
          </>
        )}

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
          <GatedCTA scanId={scanId} email={scanEmail} />
        </motion.div>

        <Separator className="my-8" />

        {/* Share Section */}
        <motion.div variants={itemVariants}>
          <ShareSection scanId={scanId} />
        </motion.div>

        <Separator className="my-8" />

        {/* Conversion CTA */}
        <motion.div variants={itemVariants}>
          <ConversionCTA scanId={scanId} email={scanEmail} />
        </motion.div>
      </motion.div>
    </div>
  )
}

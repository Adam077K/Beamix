'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScanResults } from '@/lib/types'
import { ENGINE_LABELS } from '@/lib/scan/mock-engine'
import type { LLMEngine } from '@/lib/types'
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
    </motion.div>
  )
}

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
              <Progress
                value={entry.score}
                className="h-2 w-20"
              />
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
        {quickWins.map((win, i) => {
          const style = impactColors[win.impact]
          const ImpactIcon = style.icon
          return (
            <div key={i} className={`rounded-xl ${style.bg} p-4`}>
              <div className="flex items-start gap-3">
                <ImpactIcon className={`mt-0.5 h-5 w-5 shrink-0 ${style.text}`} />
                <div>
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

function ProcessingState() {
  const messages = [
    'Asking ChatGPT about your business...',
    'Checking Gemini for mentions...',
    'Searching Perplexity for citations...',
    'Querying Claude for references...',
    'Analyzing competitor landscape...',
    'Calculating visibility score...',
  ]
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [messages.length])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-accent)]" />
        <h2 className="mt-6 font-display text-2xl font-bold text-[var(--color-text)]">
          Scanning your business
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-[var(--color-muted)]"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
        <Progress value={((messageIndex + 1) / messages.length) * 100} className="mx-auto mt-6 w-64" />
      </motion.div>
    </div>
  )
}

export default function ScanResultsPage() {
  const params = useParams()
  const scanId = params.scan_id as string
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
          <Link href="/scan">
            <Button variant="outline" size="sm">
              New scan
            </Button>
          </Link>
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

        {/* Quick Wins */}
        <motion.div variants={itemVariants}>
          <QuickWinsSection quickWins={results.quick_wins} />
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

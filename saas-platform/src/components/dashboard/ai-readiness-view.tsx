'use client'

import Link from 'next/link'
import {
  Globe,
  ShieldCheck,
  FileCode2,
  FileText,
  HelpCircle,
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreRing } from '@/components/ui/score-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { getScoreLevel } from '@/components/ui/score-badge'
import { cn, getScoreColor } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryScore {
  score: number
  description: string
}

interface AiReadinessData {
  id: string
  user_id: string
  overall_score: number
  crawlability: CategoryScore | null
  schema_markup: CategoryScore | null
  content_quality: CategoryScore | null
  faq_coverage: CategoryScore | null
  llms_txt: CategoryScore | null
  created_at: string
  [key: string]: unknown
}

interface AiReadinessViewProps {
  readiness: AiReadinessData | null
  websiteUrl: string | null
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'crawlability',
    label: 'Crawlability',
    icon: Globe,
    description: 'How easily AI bots can access and crawl your site.',
  },
  {
    key: 'schema_markup',
    label: 'Schema & Structured Data',
    icon: FileCode2,
    description: 'Structured markup that helps AI understand your content.',
  },
  {
    key: 'content_quality',
    label: 'Content Quality',
    icon: FileText,
    description: 'How well your content answers user queries.',
  },
  {
    key: 'faq_coverage',
    label: 'FAQ Coverage',
    icon: HelpCircle,
    description: 'Coverage of common questions in your category.',
  },
  {
    key: 'llms_txt',
    label: 'llms.txt',
    icon: Bot,
    description: 'AI instruction file for language models.',
  },
] as const

// ─── Derived assessment items ─────────────────────────────────────────────────

interface AssessmentItem {
  id: string
  category: string
  categoryIcon: typeof Globe
  name: string
  status: 'pass' | 'fail' | 'warning'
  score: number
  agentLink?: string
}

function buildAssessmentItems(readiness: AiReadinessData): AssessmentItem[] {
  return CATEGORIES.map(({ key, label, icon }) => {
    const cat = readiness[key] as CategoryScore | null
    const score = cat?.score ?? 0
    const status: AssessmentItem['status'] =
      score >= 70 ? 'pass' : score >= 40 ? 'warning' : 'fail'
    return {
      id: key,
      category: label,
      categoryIcon: icon,
      name: label,
      status,
      score,
      agentLink: '/dashboard/agents',
    }
  })
}

// ─── Recommendation items derived from category scores ────────────────────────

interface RecommendationItem {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  categoryIcon: typeof Globe
  agentLink: string
}

function buildRecommendations(readiness: AiReadinessData): RecommendationItem[] {
  const items: RecommendationItem[] = []

  for (const { key, label, icon, description } of CATEGORIES) {
    const cat = readiness[key] as CategoryScore | null
    const score = cat?.score ?? 0
    if (score < 70) {
      items.push({
        id: key,
        title: `Improve ${label}`,
        description: cat?.description ?? description,
        priority: score < 30 ? 'critical' : score < 50 ? 'high' : 'medium',
        categoryIcon: icon,
        agentLink: '/dashboard/agents',
      })
    }
  }

  // Sort: critical first, then high, medium, low
  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  return items.sort((a, b) => order[a.priority] - order[b.priority])
}

// ─── Score color helper ───────────────────────────────────────────────────────

// ─── Status icon ──────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: 'pass' | 'fail' | 'warning' }) {
  if (status === 'pass') return (
    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-label="Pass" />
  )
  if (status === 'fail') return (
    <XCircle className="h-4 w-4 text-red-500 shrink-0" aria-label="Fail" />
  )
  return (
    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" aria-label="Warning" />
  )
}

// ─── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: RecommendationItem['priority'] }) {
  const config = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high:     'bg-orange-50 text-orange-700 border-orange-200',
    medium:   'bg-amber-50 text-amber-700 border-amber-200',
    low:      'bg-muted text-muted-foreground border-border',
  }[priority]
  return (
    <Badge variant="outline" className={cn('text-xs capitalize shrink-0', config)}>
      {priority}
    </Badge>
  )
}

// ─── AiReadinessView ──────────────────────────────────────────────────────────

export function AiReadinessView({ readiness, websiteUrl }: AiReadinessViewProps) {
  // Derived data
  const assessmentItems = readiness ? buildAssessmentItems(readiness) : []
  const recommendations = readiness ? buildRecommendations(readiness) : []
  const totalFactors = CATEGORIES.length
  const lastAuditLabel = readiness
    ? new Date(readiness.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-5">

      {/* ── Row 1: Page header ──────────────────────────────────────────────── */}
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            AI Readiness
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {websiteUrl
              ? `Assess how well ${websiteUrl} is prepared for AI search engines.`
              : 'Assess how well your business is prepared for AI search engines.'}
          </p>
        </div>
        <Button
          disabled
          className="shrink-0 rounded-lg bg-primary/50 text-white cursor-not-allowed"
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Coming Soon
        </Button>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!readiness && (
        <div className="animate-fade-up [animation-delay:80ms]">
          <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <EmptyState
                icon={ShieldCheck}
                title="AI Readiness Audit — Coming Soon"
                description="This feature is currently in development. Check back soon to see how ready your website is for AI search engines."
              />
            </CardContent>
          </Card>
        </div>
      )}

      {readiness && (
        <>
          {/* ── Row 2: Overall Readiness Score hero ───────────────────────────── */}
          <div className="animate-fade-up [animation-delay:80ms]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Score ring hero */}
              <Card className="lg:col-span-5 rounded-[20px] shadow-[var(--shadow-card)]">
                <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                  <span className="section-eyebrow">Overall AI Readiness</span>
                  <ScoreRing score={readiness.overall_score} size="lg" showLabel={false} animate />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {getScoreLevel(readiness.overall_score).label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on {totalFactors} factors assessed
                    </p>
                  </div>
                  {lastAuditLabel && (
                    <p className="text-xs text-muted-foreground">
                      Last audited: {lastAuditLabel}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Right: Category score summary cards */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3">
                {CATEGORIES.map(({ key, label, icon: CategoryIcon }, i) => {
                  const cat = readiness[key] as CategoryScore | null
                  const score = cat?.score ?? 0
                  const color = getScoreColor(score)
                  const { level } = getScoreLevel(score)
                  const levelBg =
                    level === 'excellent' ? 'bg-cyan-50/60 dark:bg-cyan-950/20' :
                    level === 'good'      ? 'bg-emerald-50/60 dark:bg-emerald-950/20' :
                    level === 'fair'      ? 'bg-amber-50/60 dark:bg-amber-950/20' :
                    'bg-red-50/60 dark:bg-red-950/20'

                  return (
                    <Card
                      key={key}
                      className={cn(
                        'rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up card-hover',
                        levelBg,
                      )}
                      style={{ animationDelay: `${120 + i * 60}ms` }}
                    >
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border">
                            <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <span
                            className="metric-value text-2xl font-bold"
                            style={{ color }}
                          >
                            {score}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${score}%`, backgroundColor: color }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Row 4: Detailed Assessment ────────────────────────────────────── */}
          <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:400ms]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Detailed Assessment</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {assessmentItems.filter((i) => i.status === 'pass').length} of {totalFactors} factors passing
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-0">
              <div className="divide-y divide-border/50">
                {assessmentItems.map((item) => {
                  const Icon = item.categoryIcon
                  const scoreColor = getScoreColor(item.score)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3.5"
                    >
                      {/* Category icon */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {(readiness[item.id] as CategoryScore | null)?.description ?? ''}
                        </p>
                      </div>

                      {/* Status icon */}
                      <StatusIcon status={item.status} />

                      {/* Score */}
                      <span
                        className="font-mono font-bold text-sm tabular-nums w-8 text-right shrink-0"
                        style={{ color: scoreColor }}
                      >
                        {item.score}
                      </span>

                      {/* Fix link */}
                      {item.status !== 'pass' && (
                        <Link
                          href={item.agentLink ?? '/dashboard/agents'}
                          className="shrink-0 flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2 rounded"
                        >
                          Fix <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      )}
                      {item.status === 'pass' && (
                        <span className="w-10 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Row 5: Recommendations ────────────────────────────────────────── */}
          {recommendations.length > 0 && (
            <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:480ms]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Improve Your Score</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {recommendations.length} actionable {recommendations.length === 1 ? 'recommendation' : 'recommendations'}, priority sorted
                    </p>
                  </div>
                  <Link
                    href="/dashboard/agents"
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    All agents <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5 pt-0 flex flex-col gap-0">
                {recommendations.map((rec, i) => {
                  const Icon = rec.categoryIcon
                  const isTop = i === 0
                  return (
                    <div
                      key={rec.id}
                      className={cn(
                        'flex items-start gap-3 py-3.5 border-b border-border/50 last:border-0',
                        isTop && 'pb-4'
                      )}
                    >
                      {/* Category icon */}
                      <div
                        className={cn(
                          'flex shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5',
                          isTop ? 'h-8 w-8' : 'h-7 w-7'
                        )}
                      >
                        <Icon
                          className={cn('text-muted-foreground', isTop ? 'h-4 w-4' : 'h-3.5 w-3.5')}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              'font-medium text-foreground leading-snug',
                              isTop ? 'text-sm' : 'text-xs'
                            )}
                          >
                            {rec.title}
                          </p>
                          <PriorityBadge priority={rec.priority} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
                          {rec.description}
                        </p>
                      </div>

                      {/* Run agent link */}
                      <Link
                        href={rec.agentLink}
                        className="shrink-0 flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2 rounded"
                      >
                        Run Agent <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* All-pass state */}
          {recommendations.length === 0 && (
            <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:480ms]">
              <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">You&apos;re fully optimized!</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  All readiness factors are passing. Keep running periodic audits to maintain your AI search visibility.
                </p>
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="rounded-lg mt-2 cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

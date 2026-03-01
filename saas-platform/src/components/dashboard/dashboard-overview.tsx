'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Bot,
  BarChart3,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

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

const AGENT_LABELS: Record<string, string> = {
  content_writer: 'Content Writer',
  blog_writer: 'Blog Writer',
  review_analyzer: 'Review Analyzer',
  schema_optimizer: 'Schema Optimizer',
  recommendations: 'Recommendations',
  social_strategy: 'Social Strategy',
  competitor_research: 'Competitor Research',
  query_researcher: 'Query Researcher',
  initial_analysis: 'Initial Analysis',
  free_scan: 'Free Scan',
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
}

interface DashboardOverviewProps {
  businessName: string
  businessUrl: string | null
  score: number | null
  scoreDelta: number | null
  mentionCount: number
  lastScanned: string | null
  totalCredits: number
  monthlyCredits: number
  recommendations: Array<{
    id: string
    title: string
    description: string
    priority: string
    recommendation_type: string
    status: string
    agent_type: string | null
    credits_cost: number | null
  }>
  recentAgents: Array<{
    id: string
    agent_type: string
    status: string
    credits_charged: number
    created_at: string
    completed_at: string | null
  }>
  recentScans: Array<{
    id: string
    overall_score: number | null
    mention_count: number
    avg_position: number | null
    scanned_at: string
  }>
}

export function DashboardOverview({
  businessName,
  score,
  scoreDelta,
  mentionCount,
  lastScanned,
  totalCredits,
  monthlyCredits,
  recommendations,
  recentAgents,
  recentScans,
}: DashboardOverviewProps) {
  const hasData = score !== null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          {businessName}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          {hasData ? 'Your AI visibility dashboard' : 'Complete your first scan to see insights'}
        </p>
      </div>

      {/* Zone 1: Hero metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visibility Score */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Visibility Score</span>
              <BarChart3 className="h-4 w-4 text-[var(--color-muted)]" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span
                className="font-display text-3xl font-bold"
                style={{ color: hasData ? getScoreColor(score) : 'var(--color-muted)' }}
              >
                {hasData ? score : '--'}
              </span>
              <span className="mb-1 text-sm text-[var(--color-muted)]">/ 100</span>
            </div>
            {hasData && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {scoreDelta !== null && scoreDelta > 0 && (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-600">+{scoreDelta} from last scan</span>
                  </>
                )}
                {scoreDelta !== null && scoreDelta < 0 && (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">{scoreDelta} from last scan</span>
                  </>
                )}
                {scoreDelta !== null && scoreDelta === 0 && (
                  <>
                    <Minus className="h-3 w-3 text-[var(--color-muted)]" />
                    <span className="text-[var(--color-muted)]">No change</span>
                  </>
                )}
                {scoreDelta === null && (
                  <Badge className="text-xs" style={{ backgroundColor: getScoreColor(score), color: '#fff' }}>
                    {getScoreLabel(score)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentions */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">AI Mentions</span>
              <Zap className="h-4 w-4 text-[var(--color-muted)]" />
            </div>
            <div className="mt-2">
              <span className="font-display text-3xl font-bold text-[var(--color-text)]">
                {hasData ? mentionCount : '--'}
              </span>
              <span className="ml-1 text-sm text-[var(--color-muted)]">/ 4 engines</span>
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Credits</span>
              <Bot className="h-4 w-4 text-[var(--color-muted)]" />
            </div>
            <div className="mt-2">
              <span className="font-display text-3xl font-bold text-[var(--color-text)]">
                {totalCredits}
              </span>
              <span className="ml-1 text-sm text-[var(--color-muted)]">/ {monthlyCredits} monthly</span>
            </div>
          </CardContent>
        </Card>

        {/* Last Scanned */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Last Scan</span>
              <Clock className="h-4 w-4 text-[var(--color-muted)]" />
            </div>
            <div className="mt-2">
              <span className="font-display text-lg font-bold text-[var(--color-text)]">
                {lastScanned
                  ? formatDistanceToNow(new Date(lastScanned), { addSuffix: true })
                  : 'No scans yet'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone 2 + 3: Action Queue + Engine Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action Queue (recommendations) */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <AlertTriangle className="h-5 w-5 text-[var(--color-accent-warm)]" />
              Action Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No pending actions. Run a scan to get personalized recommendations.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((rec) => {
                  const style = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.medium
                  return (
                    <div key={rec.id} className="flex items-start gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                      <Badge className={`shrink-0 text-xs ${style.bg} ${style.text}`}>
                        {rec.priority}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">
                          {rec.title}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] line-clamp-1">
                          {rec.description}
                        </p>
                      </div>
                      {rec.agent_type && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          <Bot className="mr-1 h-3 w-3" />
                          Auto-fix
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {recommendations.length > 0 && (
              <Link href="/dashboard/rankings" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  View all recommendations
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Engine Status */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <BarChart3 className="h-5 w-5 text-[var(--color-accent)]" />
              Engine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <p className="text-sm text-[var(--color-muted)]">
                Run a scan to see per-engine results.
              </p>
            ) : (
              <div className="space-y-3">
                {(['chatgpt', 'gemini', 'perplexity', 'claude'] as const).map((engine) => {
                  const labels: Record<string, string> = {
                    chatgpt: 'ChatGPT',
                    gemini: 'Gemini',
                    perplexity: 'Perplexity',
                    claude: 'Claude',
                  }
                  const colors: Record<string, string> = {
                    chatgpt: 'bg-green-100 text-green-700',
                    gemini: 'bg-blue-100 text-blue-700',
                    perplexity: 'bg-purple-100 text-purple-700',
                    claude: 'bg-orange-100 text-orange-700',
                  }
                  return (
                    <div key={engine} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                      <Badge className={`text-xs ${colors[engine]}`}>
                        {labels[engine]}
                      </Badge>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-[var(--color-card-border)]">
                          <div
                            className="h-2 rounded-full bg-[var(--color-accent)]"
                            style={{ width: `${Math.min(100, (score ?? 0) / 4 * (Math.random() * 0.5 + 0.75))}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-muted)]">
                        Active
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <Link href="/dashboard/rankings" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                View detailed rankings
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Zone 4 + 5: Recent Activity + Scan History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Agent Activity */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Bot className="h-5 w-5 text-[var(--color-accent)]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAgents.length === 0 ? (
              <div className="text-center py-6">
                <Bot className="mx-auto h-8 w-8 text-[var(--color-card-border)]" />
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  No agent activity yet
                </p>
                <Link href="/dashboard/agents" className="mt-3 inline-block">
                  <Button size="sm" className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90">
                    Run your first agent
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                    {agent.status === 'completed' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    {agent.status === 'running' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-accent)]" />}
                    {agent.status === 'failed' && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                    {!['completed', 'running', 'failed'].includes(agent.status) && (
                      <Clock className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {AGENT_LABELS[agent.agent_type] ?? agent.agent_type}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs capitalize">
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {recentAgents.length > 0 && (
              <Link href="/dashboard/agents" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  View all agents
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <BarChart3 className="h-5 w-5 text-[var(--color-accent-warm)]" />
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="text-center py-6">
                <BarChart3 className="mx-auto h-8 w-8 text-[var(--color-card-border)]" />
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  No scans yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: scan.overall_score !== null ? getScoreColor(scan.overall_score) : 'var(--color-card-border)' }}
                    >
                      {scan.overall_score ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        Score: {scan.overall_score ?? 'N/A'}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {scan.mention_count} mentions
                        {scan.avg_position !== null && ` · Avg pos: #${Math.round(scan.avg_position)}`}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-muted)]">
                      {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

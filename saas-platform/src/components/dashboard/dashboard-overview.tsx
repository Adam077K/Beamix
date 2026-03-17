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
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/ui/page-header'
import { ScoreBadge, getScoreLevel } from '@/components/ui/score-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const AGENT_LABELS: Record<string, string> = {
  content_writer: 'Content Writer',
  blog_writer: 'Blog Writer',
  review_analyzer: 'Review Analyzer',
  schema_optimizer: 'Schema Optimizer',
  recommendations: 'Recommendations',
  social_strategy: 'Social Strategy',
  competitor_intelligence: 'Competitor Intelligence',
  faq_agent: 'FAQ Agent',
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
    recommendation_type: string | null
    status: string
    suggested_agent: string | null
    credits_cost: number | null
  }>
  recentAgents: Array<{
    id: string
    agent_type: string
    status: string
    credits_cost: number
    created_at: string
    completed_at: string | null
  }>
  recentScans: Array<{
    id: string
    overall_score: number | null
    mentions_count: number
    created_at: string
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
  const creditsUsed = monthlyCredits - totalCredits
  const creditsPercent = monthlyCredits > 0 ? Math.round((creditsUsed / monthlyCredits) * 100) : 0
  const scoreInfo = hasData && score !== null ? getScoreLevel(score) : null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Overview"
        description={hasData ? 'Your AI search visibility at a glance' : 'Complete your first scan to see insights'}
      />

      {/* Zone 1: Hero metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Visibility Score — spans full width on md, 1 col on lg */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Visibility Score</span>
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-4">
            {hasData && score !== null ? (
              <>
                <ScoreBadge score={score} size="lg" />
                {scoreDelta !== null && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {scoreDelta > 0 && (
                      <>
                        <TrendingUp className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                        <span className="text-emerald-600">+{scoreDelta} from last scan</span>
                      </>
                    )}
                    {scoreDelta < 0 && (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />
                        <span className="text-red-600">{scoreDelta} from last scan</span>
                      </>
                    )}
                    {scoreDelta === 0 && (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">No change</span>
                      </>
                    )}
                  </div>
                )}
                {lastScanned && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scanned {formatDistanceToNow(new Date(lastScanned), { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <span className="text-3xl font-semibold text-muted-foreground">--</span>
                <p className="text-xs text-muted-foreground">Run a scan to get your score</p>
              </div>
            )}
          </div>
        </Card>

        {/* AI Mentions */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">AI Mentions</span>
            <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold text-foreground">
              {hasData ? mentionCount : '--'}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/ 4 engines</span>
          </div>
          {hasData && (
            <p className="mt-2 text-xs text-muted-foreground">
              {mentionCount === 0
                ? 'Not appearing in any AI engine'
                : mentionCount === 1
                ? 'Appearing in 1 AI engine'
                : `Appearing in ${mentionCount} AI engines`}
            </p>
          )}
        </Card>

        {/* Agent Credits */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Agent Credits</span>
            <Bot className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold text-foreground">{totalCredits}</span>
            <span className="ml-1 text-sm text-muted-foreground">/ {monthlyCredits} monthly</span>
          </div>
          {monthlyCredits > 0 && (
            <div className="mt-3 space-y-1">
              <Progress
                value={creditsPercent}
                className="h-1.5"
                aria-label={`${creditsUsed} of ${monthlyCredits} agent credits used`}
              />
              <p className="text-xs text-muted-foreground">
                {creditsUsed} of {monthlyCredits} used
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Zone 2: Action Queue + Engine Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Action Queue */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
              Action Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending actions. Run a scan to get personalized recommendations.
              </p>
            ) : (
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec) => {
                  const style = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.medium
                  return (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                    >
                      <Badge className={cn('shrink-0 text-xs', style.bg, style.text)}>
                        {rec.priority}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {rec.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                      {rec.suggested_agent && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          <Bot className="mr-1 h-3 w-3" aria-hidden="true" />
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
                  <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Engine Status */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
              Engine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <p className="text-sm text-muted-foreground">
                Run a scan to see per-engine results.
              </p>
            ) : (
              <div className="space-y-2">
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
                    <div
                      key={engine}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                    >
                      <Badge className={cn('text-xs', colors[engine])}>
                        {labels[engine]}
                      </Badge>
                      <div className="flex-1" />
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50"
                      >
                        Active
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
            <Link href="/dashboard/rankings" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                View detailed rankings
                <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Zone 3: Recent Activity + Scan History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Agent Activity */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No agent activity yet"
                description="Run an agent to start fixing your AI visibility gaps."
                action={{
                  label: 'Run your first agent',
                  onClick: () => { window.location.href = '/dashboard/agents' },
                }}
              />
            ) : (
              <div className="space-y-2">
                {recentAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                  >
                    {agent.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    )}
                    {agent.status === 'running' && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                    )}
                    {agent.status === 'failed' && (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                    )}
                    {!['completed', 'running', 'failed'].includes(agent.status) && (
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {AGENT_LABELS[agent.agent_type] ?? agent.agent_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                  <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No scans yet"
                description="Your scan history will appear here after your first scan."
              />
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan) => {
                  const scanScore = scan.overall_score
                  const scanInfo = scanScore !== null ? getScoreLevel(scanScore) : null
                  return (
                    <div
                      key={scan.id}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
                          scanInfo ? scanInfo.bg : 'bg-muted',
                          scanInfo ? scanInfo.color : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      >
                        {scanScore ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Score: {scanScore ?? 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.mentions_count} mention{scan.mentions_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

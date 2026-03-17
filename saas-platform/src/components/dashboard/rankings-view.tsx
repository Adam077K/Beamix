'use client'

import Link from 'next/link'
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Search,
  ScanSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { ScoreBadge } from '@/components/ui/score-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDistanceToNow } from 'date-fns'
import type { LlmProvider } from '@/constants/engines'
import { PROVIDER_LABELS, PROVIDER_COLORS } from '@/constants/engines'
import { cn } from '@/lib/utils'

type MentionSentiment = 'positive' | 'neutral' | 'negative'

interface RankingsViewProps {
  scans: Array<{
    id: string
    overall_score: number | null
    mentions_count: number
    created_at: string
    scan_type: string
  }>
  latestDetails: Array<{
    id: string
    scan_id: string
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: MentionSentiment | null
  }>
  queries: Array<{
    id: string
    query_text: string
    priority: string
    is_active: boolean
    last_scanned_at: string | null
  }>
}

export function RankingsView({ scans, latestDetails, queries }: RankingsViewProps) {
  const latestScan = scans[0] ?? null
  const hasData = latestScan !== null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Rankings"
        description="Track your visibility across AI search engines"
      />

      {/* Empty state — no data */}
      {!hasData && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent>
            <EmptyState
              icon={ScanSearch}
              title="No rankings data yet"
              description="Run your first scan to see your AI visibility score across ChatGPT, Gemini, Perplexity, and more."
              action={{
                label: 'Run your first scan',
                onClick: () => { window.location.href = '/scan' },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Current score summary */}
      {hasData && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Visibility Score</p>
              {latestScan.overall_score !== null ? (
                <ScoreBadge score={latestScan.overall_score} size="lg" />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">--</span>
              )}
            </div>
            <div className="h-px bg-border sm:h-12 sm:w-px" role="separator" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Engines Mentioning You</p>
              <p className="text-2xl font-semibold text-foreground">
                {latestScan.mentions_count}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  engine{latestScan.mentions_count !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
            <div className="h-px bg-border sm:h-12 sm:w-px" role="separator" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Scanned</p>
              <p className="text-sm text-foreground">
                {formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="ms-auto">
              <Button asChild size="sm">
                <Link href="/scan">
                  <ScanSearch className="me-2 h-4 w-4" aria-hidden="true" />
                  Rescan
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Per-engine breakdown */}
      {hasData && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
              Per-Engine Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No engine data available. Run a scan to see detailed results.
              </p>
            ) : (
              <div className="space-y-2">
                {latestDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 transition-colors duration-150 hover:bg-muted"
                  >
                    <Badge
                      className={cn(
                        'shrink-0 text-xs',
                        PROVIDER_COLORS[detail.engine as LlmProvider] ?? 'bg-gray-100 text-gray-700',
                      )}
                    >
                      {PROVIDER_LABELS[detail.engine as LlmProvider] ?? detail.engine}
                    </Badge>
                    <div className="flex-1">
                      {detail.is_mentioned ? (
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                            <span className="text-foreground">Mentioned</span>
                          </span>
                          {detail.rank_position !== null && (
                            <span className="text-muted-foreground">
                              Position:{' '}
                              <strong className="text-foreground">#{detail.rank_position}</strong>
                            </span>
                          )}
                          {detail.sentiment && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {detail.sentiment === 'positive' && (
                                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                              )}
                              {detail.sentiment === 'neutral' && (
                                <Minus className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                              )}
                              {detail.sentiment === 'negative' && (
                                <ThumbsDown className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                              )}
                              <span className="capitalize">{detail.sentiment}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <XCircle className="h-4 w-4 text-destructive/60" aria-hidden="true" />
                          Not mentioned
                        </span>
                      )}
                    </div>
                    {/* Mention status badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-xs',
                        detail.is_mentioned
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-red-200 bg-red-50 text-red-700',
                      )}
                    >
                      {detail.is_mentioned ? 'Listed' : 'Missing'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tracked Queries */}
      {hasData && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Search className="h-4 w-4 text-primary" aria-hidden="true" />
              Tracked Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tracked queries yet. Queries are created automatically when you run scans.
              </p>
            ) : (
              <div className="space-y-2">
                {queries.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                  >
                    <Badge variant="outline" className="shrink-0 text-xs capitalize">
                      {q.priority}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {q.query_text}
                    </span>
                    {q.last_scanned_at && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(q.last_scanned_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scans.length > 1 && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Scan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {scan.overall_score ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground">
                      Score: {scan.overall_score ?? 'N/A'}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {scan.mentions_count} mention{scan.mentions_count !== 1 ? 's' : ''} · {scan.scan_type}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

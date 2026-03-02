'use client'

import {
  BarChart3,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { LlmProvider, MentionSentiment } from '@/lib/types/database.types'
import { PROVIDER_LABELS, PROVIDER_COLORS } from '@/constants/engines'

function getScoreColor(score: number): string {
  if (score >= 75) return 'var(--score-excellent)'
  if (score >= 50) return 'var(--score-good)'
  if (score >= 25) return 'var(--score-fair)'
  return 'var(--score-critical)'
}

interface RankingsViewProps {
  scans: Array<{
    id: string
    overall_score: number | null
    mention_count: number
    avg_position: number | null
    scanned_at: string
    scan_type: string
  }>
  latestDetails: Array<{
    id: string
    scan_result_id: string
    llm_provider: LlmProvider
    is_mentioned: boolean
    mention_position: number | null
    sentiment: MentionSentiment | null
    mention_context: string | null
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
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Rankings
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Track your AI search visibility across all engines
        </p>
      </div>

      {/* Current score card */}
      {hasData && (
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 font-display text-3xl font-bold text-white"
                style={{ borderColor: getScoreColor(latestScan.overall_score ?? 0), backgroundColor: getScoreColor(latestScan.overall_score ?? 0) }}
              >
                {latestScan.overall_score ?? '?'}
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Current Visibility Score</p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {latestScan.mention_count} engine{latestScan.mention_count !== 1 ? 's' : ''} mention you
                </p>
                {latestScan.avg_position !== null && (
                  <p className="text-sm text-[var(--color-muted)]">
                    Average position: #{Math.round(latestScan.avg_position)}
                  </p>
                )}
                <p className="text-xs text-[var(--color-muted)]">
                  Last scanned {formatDistanceToNow(new Date(latestScan.scanned_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-engine breakdown */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BarChart3 className="h-5 w-5 text-[var(--color-accent)]" />
            Per-Engine Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestDetails.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No engine data available. Run a scan to see detailed results.
            </p>
          ) : (
            <div className="space-y-3">
              {latestDetails.map((detail) => (
                <div key={detail.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-4">
                  <Badge className={`shrink-0 text-xs ${PROVIDER_COLORS[detail.llm_provider] ?? 'bg-gray-100 text-gray-700'}`}>
                    {PROVIDER_LABELS[detail.llm_provider] ?? detail.llm_provider}
                  </Badge>
                  <div className="flex-1">
                    {detail.is_mentioned ? (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Mentioned
                        </span>
                        {detail.mention_position !== null && (
                          <span className="text-[var(--color-muted)]">
                            Position: <strong className="text-[var(--color-text)]">#{detail.mention_position}</strong>
                          </span>
                        )}
                        {detail.sentiment && (
                          <span className="flex items-center gap-1 text-[var(--color-muted)]">
                            {detail.sentiment === 'positive' && <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />}
                            {detail.sentiment === 'neutral' && <Minus className="h-3.5 w-3.5 text-amber-500" />}
                            {detail.sentiment === 'negative' && <ThumbsDown className="h-3.5 w-3.5 text-red-500" />}
                            <span className="capitalize">{detail.sentiment}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                        <XCircle className="h-4 w-4 text-red-400" />
                        Not mentioned
                      </span>
                    )}
                    {detail.mention_context && (
                      <p className="mt-1 text-xs text-[var(--color-muted)] line-clamp-2">
                        &ldquo;{detail.mention_context}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracked Queries */}
      <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Search className="h-5 w-5 text-[var(--color-accent-warm)]" />
            Tracked Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queries.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No tracked queries yet. Queries are created automatically when you run scans.
            </p>
          ) : (
            <div className="space-y-2">
              {queries.map((q) => (
                <div key={q.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                  <Badge variant="outline" className="shrink-0 text-xs capitalize">
                    {q.priority}
                  </Badge>
                  <span className="flex-1 text-sm text-[var(--color-text)] truncate">
                    {q.query_text}
                  </span>
                  {q.last_scanned_at && (
                    <span className="text-xs text-[var(--color-muted)]">
                      {formatDistanceToNow(new Date(q.last_scanned_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan History */}
      {scans.length > 1 && (
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardHeader>
            <CardTitle className="font-display text-lg">Scan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: scan.overall_score !== null ? getScoreColor(scan.overall_score) : 'var(--color-card-border)' }}
                  >
                    {scan.overall_score ?? '?'}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Score: {scan.overall_score ?? 'N/A'}
                    </span>
                    <span className="ml-2 text-xs text-[var(--color-muted)]">
                      {scan.mention_count} mentions · {scan.scan_type}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-muted)]">
                    {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}
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

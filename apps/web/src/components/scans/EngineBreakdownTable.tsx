'use client'

import { cn } from '@/lib/utils'

// ─── Shared type ─────────────────────────────────────────────────────────────

export type ScanEngineResult = {
  id: string
  scan_id: string
  engine: string
  is_mentioned: boolean
  rank_position: number | null
  sentiment_score: number | null
  mention_context: string | null
  competitors_mentioned: string[]
  prompt_text?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SentimentLevel = 'positive' | 'neutral' | 'negative' | 'none'

function classifySentiment(score: number | null): SentimentLevel {
  if (score === null) return 'none'
  if (score > 0.2) return 'positive'
  if (score < -0.2) return 'negative'
  return 'neutral'
}

function avgSentiment(scores: (number | null)[]): SentimentLevel {
  const valid = scores.filter((s): s is number => s !== null)
  if (valid.length === 0) return 'none'
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length
  return classifySentiment(avg)
}

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  aio: 'AI Overviews',
  grok: 'Grok',
  youcom: 'You.com',
}

function engineLabel(key: string): string {
  return ENGINE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

// ─── Sentiment display ────────────────────────────────────────────────────────

function SentimentCell({ level }: { level: SentimentLevel }) {
  if (level === 'none') {
    return <span className="text-muted-foreground tabular-nums">—</span>
  }
  const map: Record<Exclude<SentimentLevel, 'none'>, { label: string; cls: string }> = {
    positive: { label: 'Positive', cls: 'text-emerald-600' },
    neutral: { label: 'Neutral', cls: 'text-zinc-400' },
    negative: { label: 'Negative', cls: 'text-red-500' },
  }
  const { label, cls } = map[level as Exclude<SentimentLevel, 'none'>]
  return (
    <span className={cn('tabular-nums', cls)}>
      ◐ {label}
    </span>
  )
}

// ─── Engine row ───────────────────────────────────────────────────────────────

interface EngineRowData {
  engine: string
  mentioned: boolean
  bestRank: number | null
  sentimentLevel: SentimentLevel
  queryCount: number
}

function buildRows(results: ScanEngineResult[]): EngineRowData[] {
  const grouped: Record<string, ScanEngineResult[]> = {}
  for (const r of results) {
    if (!grouped[r.engine]) grouped[r.engine] = []
    grouped[r.engine].push(r)
  }

  return Object.entries(grouped).map(([engine, rows]) => {
    const mentioned = rows.some((r) => r.is_mentioned)
    const ranks = rows.map((r) => r.rank_position).filter((p): p is number => p !== null)
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null
    const sentimentLevel = avgSentiment(rows.map((r) => r.sentiment_score))
    return {
      engine,
      mentioned,
      bestRank,
      sentimentLevel,
      queryCount: rows.length,
    }
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  results: ScanEngineResult[]
}

export function EngineBreakdownTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-zinc-500">No engine results</p>
        <p className="mt-1 text-xs text-zinc-400">Run a scan to see per-engine breakdown</p>
      </div>
    )
  }

  const rows = buildRows(results)

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="py-2.5 pr-6 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Engine
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Best Rank
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Sentiment
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-zinc-400">
              Queries
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row) => (
            <tr
              key={row.engine}
              className="h-11 transition-colors hover:bg-zinc-50/60"
            >
              <td className="py-2 pr-6 font-medium text-zinc-800">
                {engineLabel(row.engine)}
              </td>
              <td className="px-4 py-2">
                {row.mentioned ? (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="text-base leading-none">●</span>
                    <span>Cited</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="text-base leading-none">○</span>
                    <span>Not found</span>
                  </span>
                )}
              </td>
              <td className="px-4 py-2 font-mono tabular-nums text-zinc-700">
                {row.bestRank !== null ? (
                  <span>#{row.bestRank}</span>
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </td>
              <td className="px-4 py-2">
                <SentimentCell level={row.sentimentLevel} />
              </td>
              <td className="px-4 py-2 text-right font-mono tabular-nums text-zinc-500">
                {row.queryCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

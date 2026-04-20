'use client'

import { cn } from '@/lib/utils'
import type { ScanEngineResult } from './EngineBreakdownTable'

// Re-export so consumers can import from either file
export type { ScanEngineResult }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a stable query key. Uses prompt_text when available, falls back
 * to a positional index string so null/undefined prompts still group correctly.
 */
function queryKey(r: ScanEngineResult, fallbackIndex: number): string {
  return r.prompt_text?.trim() || `query_${fallbackIndex}`
}

/** Truncate long queries to keep the table readable */
function truncate(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

// ─── Pivot builder ────────────────────────────────────────────────────────────

interface CellData {
  mentioned: boolean
  rank: number | null
}

interface PivotRow {
  queryLabel: string
  cells: Record<string, CellData | undefined>
}

function buildPivot(results: ScanEngineResult[]): {
  engines: string[]
  rows: PivotRow[]
} {
  // Preserve insertion order for both queries and engines
  const queryOrder: string[] = []
  const engineOrder: string[] = []

  // We need a stable label per unique prompt — build a map keyed by prompt text
  const queryMap: Record<string, Record<string, CellData>> = {}

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const key = queryKey(r, i)
    const label = r.prompt_text?.trim() ? r.prompt_text.trim() : `Query ${i + 1}`

    if (!queryMap[key]) {
      queryMap[key] = {}
      queryOrder.push(key)
    }

    if (!engineOrder.includes(r.engine)) {
      engineOrder.push(r.engine)
    }

    // If multiple results share the same (query, engine), take the best rank
    const existing = queryMap[key][r.engine]
    if (!existing) {
      queryMap[key][r.engine] = { mentioned: r.is_mentioned, rank: r.rank_position }
    } else {
      const betterRank =
        r.rank_position !== null &&
        (existing.rank === null || r.rank_position < existing.rank)
          ? r.rank_position
          : existing.rank
      queryMap[key][r.engine] = {
        mentioned: existing.mentioned || r.is_mentioned,
        rank: betterRank,
      }
    }
  }

  // Rebuild label map from first seen prompt_text per key
  const labelMap: Record<string, string> = {}
  let fallback = 1
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const key = queryKey(r, i)
    if (!labelMap[key]) {
      labelMap[key] = r.prompt_text?.trim() || `Query ${fallback++}`
    }
  }

  const rows: PivotRow[] = queryOrder.map((key) => ({
    queryLabel: labelMap[key] || key,
    cells: queryMap[key],
  }))

  return { engines: engineOrder, rows }
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

// ─── Cell display ─────────────────────────────────────────────────────────────

function ResultCell({ data }: { data: CellData | undefined }) {
  if (!data) {
    return (
      <td className="h-11 px-3 py-2 text-center font-mono tabular-nums text-zinc-200">
        —
      </td>
    )
  }
  if (data.mentioned) {
    return (
      <td className="h-11 px-3 py-2 text-center">
        <span className="inline-flex items-center gap-1 font-mono tabular-nums text-zinc-700">
          {data.rank !== null ? (
            <span className="font-medium text-[#3370FF]">#{data.rank}</span>
          ) : null}
          <span className="text-emerald-500 text-xs leading-none">●</span>
        </span>
      </td>
    )
  }
  return (
    <td className="h-11 px-3 py-2 text-center font-mono tabular-nums text-zinc-300">
      ○
    </td>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  results: ScanEngineResult[]
}

export function QueryByQueryTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-zinc-500">No query results</p>
        <p className="mt-1 text-xs text-zinc-400">Results will appear per engine once a scan completes</p>
      </div>
    )
  }

  const { engines, rows } = buildPivot(results)

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="py-2.5 pr-6 text-left text-xs font-medium uppercase tracking-wide text-zinc-400 min-w-[200px]">
              Query
            </th>
            {engines.map((eng) => (
              <th
                key={eng}
                className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-zinc-400 whitespace-nowrap"
              >
                {engineLabel(eng)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="h-11 transition-colors hover:bg-zinc-50/60"
            >
              <td
                className="py-2 pr-6 text-zinc-700 max-w-[240px]"
                title={row.queryLabel}
              >
                <span className="block truncate text-xs leading-snug">
                  &ldquo;{truncate(row.queryLabel)}&rdquo;
                </span>
              </td>
              {engines.map((eng) => (
                <ResultCell key={eng} data={row.cells[eng]} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

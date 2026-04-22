import type {
  Competitor,
  Engine,
  SovWeek,
  TrackedQuery,
} from '@/components/competitors/types'

type CompetitorRow = {
  id: string
  name: string
  website_url: string | null
  domain: string | null
  latest_score: number | null
}

type ScanResultRow = {
  scan_id: string | null
  engine: string | null
  prompt_text: string | null
  is_mentioned: boolean | null
  competitors_mentioned: string[] | null
  scan_completed_at: string | null
}

export interface CompetitorsDerived {
  competitors: Competitor[]
  yourSoV: number
  yourSoVTrend: number[]
  yourEngineRates: Partial<Record<Engine, number>>
  trackedQueries: TrackedQuery[]
  sovTrend: SovWeek[]
  missedQueries: string[]
}

const ENGINE_LABEL: Record<string, Engine> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  aio: 'AIO',
  grok: 'Grok',
  youcom: 'You.com',
}

function labelEngine(raw: string | null): Engine | null {
  if (!raw) return null
  return ENGINE_LABEL[raw.toLowerCase()] ?? null
}

// ISO week bucket — start of week (Monday) as YYYY-MM-DD.
function weekStart(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function deriveCompetitorsData(
  competitorRows: CompetitorRow[],
  scanResults: ScanResultRow[],
): CompetitorsDerived {
  const totalSlots = scanResults.length
  const yourMentions = scanResults.filter((r) => r.is_mentioned === true).length
  const yourSoV = totalSlots > 0 ? Math.round((100 * yourMentions) / totalSlots) : 0

  // Per-engine mention rates (0–1)
  const perEngineTotal = new Map<Engine, number>()
  const perEngineMentioned = new Map<Engine, number>()
  for (const r of scanResults) {
    const eng = labelEngine(r.engine)
    if (!eng) continue
    perEngineTotal.set(eng, (perEngineTotal.get(eng) ?? 0) + 1)
    if (r.is_mentioned) perEngineMentioned.set(eng, (perEngineMentioned.get(eng) ?? 0) + 1)
  }
  const yourEngineRates: Partial<Record<Engine, number>> = {}
  for (const [eng, total] of perEngineTotal) {
    const mentioned = perEngineMentioned.get(eng) ?? 0
    yourEngineRates[eng] = total > 0 ? mentioned / total : 0
  }

  // Weekly SoV buckets for our sparkline + trend
  const weekBuckets = new Map<string, { total: number; you: number; comps: Map<string, number> }>()
  for (const r of scanResults) {
    const wk = weekStart(r.scan_completed_at)
    if (!wk) continue
    const bucket = weekBuckets.get(wk) ?? { total: 0, you: 0, comps: new Map<string, number>() }
    bucket.total += 1
    if (r.is_mentioned) bucket.you += 1
    const compsMentioned = r.competitors_mentioned ?? []
    for (const compName of compsMentioned) {
      bucket.comps.set(compName, (bucket.comps.get(compName) ?? 0) + 1)
    }
    weekBuckets.set(wk, bucket)
  }
  const sortedWeeks = [...weekBuckets.keys()].sort()
  const recentWeeks = sortedWeeks.slice(-4)

  const yourSoVTrend: number[] = recentWeeks.map((wk) => {
    const b = weekBuckets.get(wk)!
    return b.total > 0 ? Math.round((100 * b.you) / b.total) : 0
  })

  // 12-week (or fewer) full SoV trend for the chart
  const trendWeeks = sortedWeeks.slice(-12)
  const sovTrend: SovWeek[] = trendWeeks.map((wk) => {
    const b = weekBuckets.get(wk)!
    const you = b.total > 0 ? Math.round((100 * b.you) / b.total) : 0
    const competitors: Record<string, number> = {}
    for (const [compName, count] of b.comps) {
      competitors[compName] = b.total > 0 ? Math.round((100 * count) / b.total) : 0
    }
    return { week: wk, you, competitors }
  })

  // Per-competitor stats by matching scan_engine_results.competitors_mentioned on name
  const compByName = new Map<string, CompetitorRow>()
  for (const c of competitorRows) compByName.set(c.name, c)

  const competitors: Competitor[] = competitorRows.map((c) => {
    const rowsCitingThem = scanResults.filter((r) =>
      (r.competitors_mentioned ?? []).includes(c.name),
    )
    const citeCount = rowsCitingThem.length
    const appearanceRate = totalSlots > 0 ? citeCount / totalSlots : 0

    // Queries where this competitor appeared (distinct prompt_text)
    const queriesWhereAppears = [
      ...new Set(rowsCitingThem.map((r) => r.prompt_text ?? '').filter(Boolean)),
    ]

    // 4-week sparkline — per-week appearance rate 0–100
    const fourWeekTrend: number[] = recentWeeks.map((wk) => {
      const b = weekBuckets.get(wk)!
      const compCount = b.comps.get(c.name) ?? 0
      return b.total > 0 ? Math.round((100 * compCount) / b.total) : 0
    })

    // Per-engine rate for this competitor — 0–1
    const perEngineComp = new Map<Engine, number>()
    for (const r of rowsCitingThem) {
      const eng = labelEngine(r.engine)
      if (!eng) continue
      perEngineComp.set(eng, (perEngineComp.get(eng) ?? 0) + 1)
    }
    const engineRates: Partial<Record<Engine, number>> = {}
    for (const [eng, count] of perEngineComp) {
      const total = perEngineTotal.get(eng) ?? 0
      engineRates[eng] = total > 0 ? count / total : 0
    }

    return {
      id: c.id,
      name: c.name,
      url: c.website_url ?? '',
      appearanceRate,
      queriesWhereAppears,
      fourWeekTrend: fourWeekTrend.length >= 2 ? fourWeekTrend : [0, 0, 0, 0],
      engineRates,
      queryCoverage: queriesWhereAppears.length,
    }
  })

  // Tracked queries — one entry per distinct prompt_text
  const byQuery = new Map<string, ScanResultRow[]>()
  for (const r of scanResults) {
    const q = r.prompt_text ?? ''
    if (!q) continue
    const arr = byQuery.get(q) ?? []
    arr.push(r)
    byQuery.set(q, arr)
  }

  const trackedQueries: TrackedQuery[] = [...byQuery.entries()].map(([query, rows]) => {
    const enginePresenceRaw = new Map<Engine, { total: number; mentioned: number }>()
    for (const r of rows) {
      const eng = labelEngine(r.engine)
      if (!eng) continue
      const cur = enginePresenceRaw.get(eng) ?? { total: 0, mentioned: 0 }
      cur.total += 1
      if (r.is_mentioned) cur.mentioned += 1
      enginePresenceRaw.set(eng, cur)
    }
    const enginePresence: Partial<Record<string, number>> = {}
    for (const [eng, v] of enginePresenceRaw) {
      enginePresence[eng] = v.total > 0 ? v.mentioned / v.total : 0
    }

    const competitorPresence = [
      ...new Set(
        rows
          .flatMap((r) => r.competitors_mentioned ?? [])
          .filter((name) => compByName.has(name)),
      ),
    ]

    const youPresent = rows.some((r) => r.is_mentioned === true)
    const gap = competitorPresence.length > 0 && !youPresent ? 1 : 0

    return { query, enginePresence, competitorPresence, youPresent, gap }
  })

  // Missed queries — you absent, competitors present
  const missedQueries = trackedQueries
    .filter((q) => !q.youPresent && q.competitorPresence.length > 0)
    .map((q) => q.query)

  return {
    competitors,
    yourSoV,
    yourSoVTrend,
    yourEngineRates,
    trackedQueries,
    sovTrend,
    missedQueries,
  }
}

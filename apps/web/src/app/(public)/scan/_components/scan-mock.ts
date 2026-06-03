/**
 * scan-mock.ts — Mock scan engine for the Wave C free-scan front door.
 *
 * ⚠️ MOCK SEAM. Everything in this file is a stand-in for the real scan
 * pipeline (see apps/web/src/app/api/scan/free/route.ts + the Inngest
 * scan-free function). When the engine lands, replace:
 *
 *   1. `runMockScan()`        → POST /api/scan/free  (kick off real scan)
 *   2. `ENGINES[].queries`    → the real query set the engine probed
 *   3. `buildMockResult()`    → the real scan result payload (per-engine
 *                                rank/mention/sentiment + computed score)
 *   4. Per-row timing/ticks   → real progress events (poll or SSE/stream)
 *
 * The component layer (ScanFlow / ScanningMoment / ScoreReveal) is written
 * against these types, so swapping this file for a real adapter that returns
 * the same shapes is the only wiring work required.
 */

export type EngineId = 'chatgpt' | 'gemini' | 'perplexity'

export type EngineRowStatus = 'queued' | 'querying' | 'done'

export interface EngineDef {
  id: EngineId
  /** Display name as shown to the user. */
  name: string
  /** Total queries this engine runs (drives the mono ticking count). */
  queryCount: number
  /** A representative query string shown "running" during the scan. */
  sampleQuery: string
}

/** Score band → color (data-viz only, never a CTA/link). */
export type ScoreBand = 'excellent' | 'good' | 'fair' | 'critical'

export interface EngineGap {
  id: EngineId
  name: string
  /** 0–100 per-engine visibility score. */
  score: number
  /** One blunt, direct line: where you're invisible on this engine. */
  gap: string
}

export interface ScanResult {
  /** Overall 0–100 GEO visibility score. */
  score: number
  band: ScoreBand
  /** Blunt verdict headline keyed off the score band. */
  verdict: string
  perEngine: EngineGap[]
}

/** The three engines probed on the free tier (BRAND/pricing canon). */
export const ENGINES: EngineDef[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    queryCount: 18,
    sampleQuery: 'best accountants near me',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    queryCount: 14,
    sampleQuery: 'tax help in Tel Aviv',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    queryCount: 11,
    sampleQuery: 'top bookkeeping services 2026',
  },
]

export const TOTAL_QUERIES = ENGINES.reduce((sum, e) => sum + e.queryCount, 0)

/** Map a 0–100 score to its band + color (DESIGN-DIRECTION / brand). */
export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 25) return 'fair'
  return 'critical'
}

export const BAND_COLOR: Record<ScoreBand, string> = {
  excellent: '#06B6D4',
  good: '#10B981',
  fair: '#F59E0B',
  critical: '#EF4444',
}

const BAND_VERDICT: Record<ScoreBand, string> = {
  excellent: "You're showing up across AI search.",
  good: "You're getting found, but losing ground.",
  fair: "You're barely visible in AI search.",
  critical: "You're invisible in AI search.",
}

/**
 * Deterministic mock scoring from the domain string, so the same domain
 * always yields the same demo result (stable for screenshots) but different
 * domains feel distinct. Real engine replaces this entirely.
 */
function hashDomain(domain: string): number {
  let h = 0
  for (let i = 0; i < domain.length; i++) {
    h = (h * 31 + domain.charCodeAt(i)) >>> 0
  }
  return h
}

const ENGINE_GAP_COPY: Record<EngineId, string[]> = {
  chatgpt: [
    'Never named when buyers ask for your category.',
    'A competitor is recommended in your place.',
    'Cited only for your brand name, not your service.',
  ],
  gemini: [
    'Absent from the local results that matter.',
    "Mentioned, but ranked below three rivals.",
    'No structured data for AI to quote you from.',
  ],
  perplexity: [
    'Not indexed as a source on your topic.',
    'Outranked by directories, not real businesses.',
    'Cited once, with stale information.',
  ],
}

/**
 * Build the mock reveal payload for a domain. Deterministic per-domain.
 * Real engine returns this shape from the scan pipeline.
 */
export function buildMockResult(domain: string): ScanResult {
  const seed = hashDomain(domain || 'yourbusiness.com')
  // Bias the demo toward a low/critical score — the honest, common reality
  // for an un-optimized SMB, and the emotional payoff of the reveal.
  const base = 12 + (seed % 34) // 12–45
  const perEngine: EngineGap[] = ENGINES.map((engine, i) => {
    const drift = ((seed >> (i * 3)) % 18) - 6 // -6..+11
    const s = Math.max(4, Math.min(72, base + drift))
    const copyPool = ENGINE_GAP_COPY[engine.id]
    const gap = copyPool[(seed >> i) % copyPool.length]
    return { id: engine.id, name: engine.name, score: s, gap }
  })
  const score = Math.round(
    perEngine.reduce((sum, e) => sum + e.score, 0) / perEngine.length,
  )
  const band = scoreBand(score)
  return { score, band, verdict: BAND_VERDICT[band], perEngine }
}

/** Basic client-side domain shape validation. */
export function isValidDomain(raw: string): boolean {
  const value = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  // label.tld — at least one dot, valid chars, 2+ char TLD.
  return /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(value)
}

/** Normalize a raw input into a bare domain (strip scheme + path + www). */
export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

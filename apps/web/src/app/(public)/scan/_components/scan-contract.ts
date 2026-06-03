/**
 * Free-scan mock data contract (DESIGN-DIRECTION §Appendix "Mock data contract").
 *
 * This file is the single seam between the UI and the scanning pipeline. Every
 * component reads ONLY these types. When the real engine ships, the only file
 * that changes is the event source (`createMockScanEmitter` → a real SSE/Inngest
 * subscription). Components, the ledger, and the reveal are zero-change.
 *
 * ── REAL-ENGINE SEAM MAP ───────────────────────────────────────────────────
 *  1. createMockScanEmitter()  → replace with createLiveScanEmitter(scanId)
 *     that subscribes to the real per-engine completion events
 *     (POST /api/scan/free already returns 202 + scan_id; wire an EventSource
 *     to /api/scan/free/[scan_id]/stream). The ScanEvent shape below is the
 *     wire contract — emit one event per engine state transition.
 *  2. QUERY_SETS  → replace the hand-written per-vertical arrays with the actual
 *     query set the engine ran (returned alongside each engine's events).
 *  3. buildMockResult()  → replace with the real aggregate the pipeline returns
 *     ({ score, tier, engines }). Tier + verdict copy are derived client-side
 *     from `score`, so the server only needs to return raw numbers + per-engine
 *     verdict strings.
 */

export type EngineId = 'chatgpt' | 'gemini' | 'perplexity'

export type EngineStatus = 'queued' | 'querying' | 'done' | 'error'

/** A single engine's live state, as the ledger renders it. */
export interface EngineState {
  id: EngineId
  /** Display label, e.g. "ChatGPT". */
  label: string
  status: EngineStatus
  /** Live query count, increments while `querying`. Tabular mono. */
  queryCount: number
  /** Final query count when `done`. */
  totalQueries: number
}

/** One event off the emitter — a state transition for a single engine, plus
 *  overall progress (0–1) and the currently-streaming query string. */
export interface ScanEvent {
  engine: EngineState
  /** All engines, current snapshot (so the ledger is always fully described). */
  engines: EngineState[]
  /** Overall completion 0–1, drives the progress needle. */
  progress: number
  /** The query string currently "running" — streams under the ledger. */
  currentQuery: string | null
  /** True only on the terminal event (last engine resolved). Triggers the
   *  §3 "needle settles" hand-off. */
  done: boolean
}

export type ScoreTier = 'critical' | 'fair' | 'good' | 'excellent'

export interface EngineVerdict {
  id: EngineId
  label: string
  /** 'critical' | 'fair' | 'good' | 'excellent' → drives the status dot color. */
  tier: ScoreTier
  /** Blunt mono verdict, e.g. "Not mentioned", "Rank 7 of 9". */
  verdict: string
}

export interface ScanResult {
  /** 0–100. */
  score: number
  tier: ScoreTier
  engines: EngineVerdict[]
  /** Engines that actually returned. < 3 ⇒ partial scan. */
  enginesScanned: number
  enginesTotal: number
  /** Echoes the user's input for the verdict subline. */
  domain: string
  businessName?: string
}

export type Vertical = 'dental' | 'saas' | 'legal'

// ── Score → tier + colors (data-only palette, never blue) ───────────────────

export const TIER_COLOR: Record<ScoreTier, string> = {
  critical: '#EF4444',
  fair: '#F59E0B',
  good: '#10B981',
  excellent: '#06B6D4',
}

export function scoreToTier(score: number): ScoreTier {
  if (score <= 24) return 'critical'
  if (score <= 49) return 'fair'
  if (score <= 74) return 'good'
  return 'excellent'
}

// ── Per-vertical query sets — REAL prompts, never lorem (§4 anti-generic #3) ──
// These are the screenshot detail: the machine "thinking in the customer's
// words". Curated per vertical. Real-engine seam: replace with the actual
// query set returned by the pipeline.

export const QUERY_SETS: Record<Vertical, string[]> = {
  dental: [
    'best family dentist near Tel Aviv',
    'emergency dentist open now Tel Aviv',
    'Invisalign cost Tel Aviv',
    'top rated dental implants clinic Tel Aviv',
    'pediatric dentist accepting new patients Tel Aviv',
    'teeth whitening near me Tel Aviv',
    'dentist that takes Maccabi insurance Tel Aviv',
    'root canal specialist Tel Aviv reviews',
  ],
  saas: [
    'best CRM for small B2B teams',
    'Salesforce alternatives for startups',
    'cheapest sales pipeline software 2026',
    'CRM with built-in email sequences',
    'top lead-scoring tools for B2B SaaS',
    'HubSpot vs which CRM for 10 person team',
    'CRM that integrates with Slack and Gmail',
    'AI sales assistant software comparison',
  ],
  legal: [
    'best personal injury lawyer near me',
    'employment lawyer free consultation Tel Aviv',
    'how much does a divorce lawyer cost Israel',
    'top rated business attorney Tel Aviv',
    'contract review lawyer for startups',
    'real estate closing attorney Tel Aviv reviews',
    'immigration lawyer accepting new clients',
    'wrongful termination lawyer near me',
  ],
}

export const ENGINE_META: { id: EngineId; label: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' },
]

// ── Tiered verdict copy (§4 ACT 3 microcopy) ────────────────────────────────

export function verdictHeadline(tier: ScoreTier): string {
  switch (tier) {
    case 'critical':
      return "You're nearly invisible in AI search."
    case 'fair':
      return 'AI search barely sees you.'
    case 'good':
      return "You show up sometimes — not enough."
    case 'excellent':
      return "You're visible — let's defend the lead."
  }
}

export function verdictCta(tier: ScoreTier): string {
  return tier === 'excellent'
    ? 'See how Beamix keeps you ahead →'
    : 'See how Beamix fixes this →'
}

export function verdictSubline(result: ScanResult): string {
  const place = inferPlace(result.domain)
  const noun = inferNoun(result.businessName, result.domain)
  if (result.tier === 'excellent') {
    return `When people ask AI for a ${noun}${place}, you usually come up. Now defend it.`
  }
  return `When people ask AI for a ${noun}${place}, you almost never come up.`
}

function inferPlace(domain: string): string {
  // Mock-only heuristic. Real pipeline supplies the business's actual city.
  return domain.includes('dental') ? ' in Tel Aviv' : ' in your area'
}

function inferNoun(businessName: string | undefined, domain: string): string {
  if (domain.includes('dental') || domain.includes('dentist')) return 'dentist'
  if (domain.includes('law') || domain.includes('legal')) return 'lawyer'
  return 'business like yours'
}

// ── Mock aggregate result (§Appendix REVEAL contract) ───────────────────────
// REAL-ENGINE SEAM: replace with the pipeline aggregate. Score + per-engine
// verdicts come from the real scan; tier + copy derive client-side from score.

export function buildMockResult(
  domain: string,
  businessName?: string,
): ScanResult {
  const score = 23 // The canonical demo verdict — blunt, screenshot-bait.
  const tier = scoreToTier(score)
  return {
    score,
    tier,
    enginesScanned: 3,
    enginesTotal: 3,
    domain,
    businessName,
    engines: [
      { id: 'chatgpt', label: 'ChatGPT', tier: 'critical', verdict: 'Not mentioned' },
      { id: 'gemini', label: 'Gemini', tier: 'fair', verdict: 'Rank 7 of 9' },
      { id: 'perplexity', label: 'Perplexity', tier: 'critical', verdict: 'Not indexed' },
    ],
  }
}

/** Pick a plausible vertical from the domain so the demo query stream + verdict
 *  feel coherent. Real pipeline classifies the business server-side. */
export function inferVertical(domain: string): Vertical {
  const d = domain.toLowerCase()
  if (d.includes('dental') || d.includes('dentist') || d.includes('clinic')) return 'dental'
  if (d.includes('law') || d.includes('legal') || d.includes('attorney')) return 'legal'
  return 'saas'
}

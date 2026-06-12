/**
 * Run-history fixture for the Automation Center sparkline (M4 signature detail).
 *
 * The EngineMicroSparkline contract forbids fabricating data at render time — a
 * sparkline must reflect a REAL series or fall back to its flat baseline. So the
 * last-N autonomous-run health scores live here as named fixture data keyed by
 * the automation row id, not derived on the fly.
 *
 * `scores` = last ~5 run-health scores (0–100): how clean each scheduled run was
 * (items published vs. items bounced back for sign-off). `current` is the latest
 * run's health and selects the score-band color + endpoint dot.
 *
 * A row with no autonomous history (or a manual-only agent) is simply absent from
 * this map → the sparkline renders its intentional flat baseline. Never invent a
 * series for a row that has not run autonomously.
 *
 * Phase 1: DESIGN + MOCK DATA ONLY. In production this comes from agent_jobs.
 */
export interface AutomationRunHistory {
  /** Last ~5 run-health scores, oldest → newest. */
  scores: number[]
  /** Latest run-health score — picks the band color and endpoint. */
  current: number
}

export const AUTOMATION_RUN_HISTORY: Record<string, AutomationRunHistory> = {
  // Query Mapper — steady, healthy autonomous cadence (climbing)
  a1: { scores: [72, 78, 81, 85, 88], current: 88 },
  // FAQ Builder — recovering after a couple of bounced drafts
  a4: { scores: [58, 49, 55, 64, 71], current: 71 },
  // Schema Generator — monthly, only one clean run so far → near-flat
  a5: { scores: [82, 84], current: 84 },
  // Entity Builder — early, mixed health, slight dip
  a8: { scores: [66, 71, 63, 68, 61], current: 61 },
}

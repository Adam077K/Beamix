/**
 * Day-1 post-payment live-work screen — type contracts.
 *
 * These types back DEMO_DAY1 in lib/demo/fixtures.ts and the
 * /onboarding/post-payment UI (Wave 1 Frontend Worker 3).
 *
 * State names mirror the day1_state enum on user_profiles from
 * docs/product-rethink-2026-04-09/build-prep-2026-05-13/03-DAY-1-FLOW.md.
 */

export type Day1StepState =
  | 'confirming_payment'
  | 'ensure_business'
  | 'query_mapper'
  | 'scan_running'
  | 'analyzing'
  | 'complete'

export interface Day1Step {
  id: string
  state: Day1StepState
  /** Customer-facing progress line, e.g. "Mapping how AI engines see Bright Smile Dental…" */
  label: string
  /** Sub-line detail shown beneath the label */
  detail: string
  /** 0–100 progress percentage at this step */
  pct: number
  /** Dwell time in milliseconds for the timed demo progression */
  durationMs: number
}

export interface Day1Draft {
  id: string
  kind: 'faq' | 'schema' | 'content' | 'citation'
  title: string
  summary: string
  /** Which step id this draft surfaces after — used by the UI to reveal drafts progressively */
  surfacedAfterStepId: string
}

export interface Day1Fixture {
  businessName: string
  steps: Day1Step[]
  /** 2–3 auto-run drafts that surface live as the chain progresses */
  drafts: Day1Draft[]
}

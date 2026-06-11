/**
 * Demo Mode — entry point
 *
 * When the signed-in user's email is demo@beamixai.com, every protected
 * product page renders rich fixture data instead of real Supabase rows.
 * Real users are completely unaffected: the guard is a simple email string
 * comparison that fires server-side before any DB query.
 *
 * NO DB writes, NO new deps, additive only.
 */

export const DEMO_EMAILS = ['demo@beamixai.com'] as const

export function isDemoUser(email: string | null | undefined): boolean {
  return !!email && DEMO_EMAILS.includes(email.toLowerCase() as (typeof DEMO_EMAILS)[number])
}

/**
 * Fixed scan ID for the demo free-scan page.
 * /scan/00000000-0000-4000-8000-00000000d3a0 returns DEMO_SCAN without a DB query.
 */
export const DEMO_SCAN_ID = '00000000-0000-4000-8000-00000000d3a0'

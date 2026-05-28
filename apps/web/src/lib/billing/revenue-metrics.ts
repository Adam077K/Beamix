/**
 * Revenue metrics helpers — ARR / MRR from booked revenue.
 *
 * Engineering Principle #11:
 *   ARR/MRR MUST read from `revenue_events WHERE booked_at IS NOT NULL` ONLY.
 *   Never read `received_at` for revenue reporting.
 *
 * These helpers are used by:
 *   - Admin/internal dashboards
 *   - CBO reporting
 *   - Any future public metrics endpoints
 *
 * Currency handling:
 *   - Returns amounts in integer cents (number, not bigint) by currency.
 *   - Currency keys are ISO 4217 uppercase (e.g. "USD", "EUR").
 *   - To get a single-currency total, access the returned map by key.
 *   - Multi-currency ARR is intentionally NOT auto-converted (FX risk belongs
 *     to the caller/reporting layer, not this helper).
 *
 * MRR vs ARR:
 *   - MRR = sum of amounts charged in the most recent calendar month
 *     (i.e. booked_at >= first day of current month).
 *   - ARR = MRR * 12 (industry-standard approximation for subscription SaaS).
 *
 * Note: revenue_events stores per-transaction amounts, not annualised values.
 * ARR = MRR * 12 is a commonly accepted proxy for recurring SaaS revenue.
 */

import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/database.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Amount by ISO currency code, e.g. { USD: 9900, EUR: 4900 } */
export type RevenueByCurrency = Record<string, number>

export type BookedMRRResult = {
  ok: true
  mrr_by_currency: RevenueByCurrency
  period_start: string // ISO date string — first day of current month
  period_end: string // ISO date string — now
}

export type BookedARRResult = {
  ok: true
  arr_by_currency: RevenueByCurrency
  mrr_by_currency: RevenueByCurrency
  period_start: string
  period_end: string
}

type MetricsError = {
  ok: false
  error: string
}

// ---------------------------------------------------------------------------
// Internal shape from DB
// ---------------------------------------------------------------------------

interface RevenueEventSummaryRow {
  currency: string
  total_cents: string // Postgres SUM returns string for large numbers
}

// ---------------------------------------------------------------------------
// Supabase service-role client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('[revenue-metrics] Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('[revenue-metrics] Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// getBookedMRR
// ---------------------------------------------------------------------------

/**
 * Returns the sum of all booked revenue events for the current calendar month,
 * grouped by currency.
 *
 * "Current month" = UTC month containing `now()`.
 */
export async function getBookedMRR(): Promise<BookedMRRResult | MetricsError> {
  const supabase = getAdminClient()

  const now = new Date()
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const periodEnd = now

  // Use raw SQL via RPC-style query to group + sum in one round-trip
  // Supabase JS client doesn't expose GROUP BY directly, so we use .rpc or raw
  // PostgREST aggregate endpoint. Using select with group by via PostgREST
  // requires a view or RPC — we use raw execute via pg SQL.
  //
  // Alternative (simpler, no view needed): fetch all rows and aggregate in JS.
  // For current scale (pre-revenue), this is acceptable. Swap to SQL view post-scale.
  const { data, error } = await supabase
    .from('revenue_events' as never)
    .select('currency, amount_cents')
    .not('booked_at', 'is', null)
    .gte('booked_at', periodStart.toISOString())
    .lte('booked_at', periodEnd.toISOString())
    .returns<Array<{ currency: string; amount_cents: number }>>()

  if (error) {
    console.error('[revenue-metrics] getBookedMRR query failed', {
      error: (error as { message: string }).message,
    })
    return {
      ok: false,
      error: `getBookedMRR query failed: ${(error as { message: string }).message}`,
    }
  }

  const rows = (data ?? []) as Array<{ currency: string; amount_cents: number }>
  const mrr_by_currency = aggregateByCurrency(rows)

  return {
    ok: true,
    mrr_by_currency,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// getBookedARR
// ---------------------------------------------------------------------------

/**
 * Returns ARR = MRR * 12, grouped by currency.
 * Also returns raw MRR for reference.
 *
 * Industry-standard proxy: ARR = MRR * 12.
 */
export async function getBookedARR(): Promise<BookedARRResult | MetricsError> {
  const mrrResult = await getBookedMRR()

  if (!mrrResult.ok) {
    return mrrResult
  }

  const arr_by_currency: RevenueByCurrency = {}
  for (const [currency, mrrCents] of Object.entries(mrrResult.mrr_by_currency)) {
    arr_by_currency[currency] = mrrCents * 12
  }

  return {
    ok: true,
    arr_by_currency,
    mrr_by_currency: mrrResult.mrr_by_currency,
    period_start: mrrResult.period_start,
    period_end: mrrResult.period_end,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Aggregate rows by currency, summing amount_cents.
 * Handles Postgres returning totals as strings (bigint safety).
 */
function aggregateByCurrency(
  rows: Array<{ currency: string; amount_cents: number | string }>,
): RevenueByCurrency {
  const result: RevenueByCurrency = {}
  for (const row of rows) {
    const currency = row.currency.toUpperCase()
    const cents =
      typeof row.amount_cents === 'string' ? parseInt(row.amount_cents, 10) : row.amount_cents
    if (isNaN(cents)) continue
    result[currency] = (result[currency] ?? 0) + cents
  }
  return result
}

// Re-export for convenience
export { aggregateByCurrency as _aggregateByCurrencyForTest }

// Convenience: compute aggregate summary across ALL booked revenue (not just current month)
// Used for lifetime value calculations and admin overviews.
export async function getTotalBookedRevenue(): Promise<
  { ok: true; total_by_currency: RevenueByCurrency } | MetricsError
> {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('revenue_events' as never)
    .select('currency, amount_cents')
    .not('booked_at', 'is', null)
    .returns<Array<{ currency: string; amount_cents: number }>>()

  if (error) {
    console.error('[revenue-metrics] getTotalBookedRevenue query failed', {
      error: (error as { message: string }).message,
    })
    return {
      ok: false,
      error: `getTotalBookedRevenue query failed: ${(error as { message: string }).message}`,
    }
  }

  const rows = (data ?? []) as Array<{ currency: string; amount_cents: number }>
  return {
    ok: true,
    total_by_currency: aggregateByCurrency(rows),
  }
}

/**
 * Beamix — Revenue Booking Sweep (Inngest Cron)
 *
 * Cron: daily at 02:00 UTC.
 *
 * Walks `revenue_events WHERE booked_at IS NULL AND received_at < now() - interval '60 days'`.
 * For each row:
 *   1. Check no matching `refund_events` row (refunded → skip, never book).
 *   2. UPDATE `booked_at = now()` using the scoped UPDATE RLS policy
 *      (service_role only; USING booked_at IS NULL / WITH CHECK booked_at IS NOT NULL).
 *   3. Write audit_log row per booking.
 *
 * Engineering Principle #11:
 *   - ARR/MRR reads from booked_at IS NOT NULL only.
 *   - The UPDATE is the ONLY mutation on revenue_events — no other column is touched.
 *
 * RLS note (migration 20260525000004):
 *   - revenue_events UPDATE policy is scoped to service_role only.
 *   - This function uses the service-role Supabase client (SUPABASE_SERVICE_ROLE_KEY).
 *
 * Concurrency: concurrency limit 1 — only one sweep at a time.
 */

import { createClient } from '@supabase/supabase-js'
import { inngest } from '../client'
import type { Database } from '../../lib/db/database.types'

// ---------------------------------------------------------------------------
// Service-role client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// Revenue event shape returned from the query
// ---------------------------------------------------------------------------

interface RevenueEventRow {
  id: string
  customer_id: string
  amount_cents: number
  currency: string
  received_at: string
  paddle_event_id: string
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

export const revenueBookingSweep = inngest.createFunction(
  {
    id: 'revenue-booking-sweep',
    retries: 2,
    // Only one sweep at a time — prevents double-booking on slow DB
    concurrency: { limit: 1 },
  },
  // Daily at 02:00 UTC
  { cron: '0 2 * * *' },
  async ({ step }) => {
    const bookedIds = await step.run('find-and-book-eligible-revenue', async () => {
      const supabase = getAdminClient()

      // Fetch revenue events that are:
      //   - not yet booked (booked_at IS NULL)
      //   - held long enough (received_at < now() - 60 days → eligible on day 61)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

      const { data: eligible, error: fetchError } = await supabase
        .from('revenue_events' as never)
        .select('id, customer_id, amount_cents, currency, received_at, paddle_event_id')
        .is('booked_at', null)
        .lt('received_at', sixtyDaysAgo)
        .returns<RevenueEventRow[]>()

      if (fetchError) {
        console.error('[revenue-booking-sweep] Failed to fetch eligible rows', {
          error: (fetchError as { message: string }).message,
        })
        throw new Error(`fetch eligible revenue_events failed: ${(fetchError as { message: string }).message}`)
      }

      if (!eligible || eligible.length === 0) {
        console.info('[revenue-booking-sweep] No eligible revenue events to book')
        return []
      }

      console.info('[revenue-booking-sweep] Found eligible rows', { count: eligible.length })

      const bookedEventIds: string[] = []
      const now = new Date().toISOString()

      for (const row of eligible) {
        // Check for a matching refund_events row scoped to THIS specific revenue event.
        // (P1 Fix 3) — previously guarded on customer_id, which blocked ALL future revenue
        // for any customer who had ever received a refund. Now scoped to revenue_event_id
        // so only the refunded event is skipped; subsequent charges book normally.
        //
        // .limit(1) ensures a duplicate refund row never throws and wedges the sweep.
        const { data: refundRow, error: refundCheckError } = await supabase
          .from('refund_events' as never)
          .select('id')
          .eq('revenue_event_id', row.id)
          .limit(1)
          .maybeSingle()

        if (refundCheckError) {
          console.error('[revenue-booking-sweep] refund check failed — skipping row', {
            revenueEventId: row.id,
            error: (refundCheckError as { message: string }).message,
          })
          continue
        }

        if (refundRow !== null) {
          console.info('[revenue-booking-sweep] Skipping — revenue event has a matching refund', {
            revenueEventId: row.id,
            refundEventId: (refundRow as { id: string }).id,
          })
          continue
        }

        // Flip booked_at — scoped UPDATE: service_role + USING(booked_at IS NULL)
        // IMPORTANT: only SET booked_at; never touch other columns (RLS constraint).
        const { error: updateError } = await supabase
          .from('revenue_events' as never)
          .update({ booked_at: now } as never)
          .eq('id', row.id)
          .is('booked_at', null) // Extra guard: only update if still NULL

        if (updateError) {
          console.error('[revenue-booking-sweep] booked_at flip failed', {
            revenueEventId: row.id,
            error: (updateError as { message: string }).message,
          })
          // Continue — don't abort the whole sweep for one row failure
          continue
        }

        // Audit log per booking
        const { error: auditError } = await supabase.from('audit_log').insert({
          actor_type: 'system',
          event_type: 'revenue.booked',
          target_table: 'revenue_events',
          target_id: row.id,
          payload: {
            revenue_event_id: row.id,
            customer_id: row.customer_id,
            amount_cents: row.amount_cents,
            currency: row.currency,
            received_at: row.received_at,
            paddle_event_id: row.paddle_event_id,
            booked_at: now,
          },
        })

        if (auditError) {
          console.error('[revenue-booking-sweep] audit_log insert failed', {
            revenueEventId: row.id,
            error: auditError.message,
          })
          // Non-fatal — booking was written; continue
        }

        bookedEventIds.push(row.id)
      }

      console.info('[revenue-booking-sweep] Booking sweep complete', {
        eligible: eligible.length,
        booked: bookedEventIds.length,
        skipped: eligible.length - bookedEventIds.length,
      })

      return bookedEventIds
    })

    return {
      booked_count: bookedIds.length,
      booked_ids: bookedIds,
    }
  },
)

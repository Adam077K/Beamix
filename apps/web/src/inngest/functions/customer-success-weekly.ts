/**
 * Beamix — customer-success-weekly Inngest function (cron)
 *
 * Fires every Sunday at 14:00 UTC. Per-customer timezone scheduling is a follow-up
 * ticket — UTC is the MVP baseline (deliberate decision, documented here).
 *
 * For each active customer (has a business row):
 *   1. Build weeklyContext from approval_queue.
 *   2. Skip if ALL three context arrays are empty (nothing to say).
 *   3. Load brand fingerprint for voice + approval flag.
 *   4. Call runCustomerSuccessNudge with trigger='cron_weekly'.
 *
 * emitCostAlert is wired to step.sendEvent('cost.alert') outside step.run
 * (Inngest does not support nested step.* calls — same pattern as approval-gate-writer).
 *
 * retries: 1 — weekly cron is safe to miss once; a double-send is worse than a skip.
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { inngest } from '../client';
import { getAdminClient } from '../../lib/agents/db/admin-client';
import { runCustomerSuccessNudge } from '../../lib/agents/customer-success/index';
import { buildWeeklyContext } from '../../lib/agents/customer-success/weekly-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomerRecord {
  userId: string;
  email: string;
  firstName: string;
  businessName: string;
}

interface BrandFingerprint {
  requiresHumanApproval: boolean;
  briefVersionId: string;
  toneDescriptors: string[];
}

interface PendingCostAlert {
  customerId: string;
  feature: string;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// Raw (un-typed) client for tables not yet in database.types.ts
// ---------------------------------------------------------------------------

function getRawAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('[customer-success-weekly] Missing Supabase service-role env vars');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Helper: load brand fingerprint for a customer
// ---------------------------------------------------------------------------

async function loadBrandFingerprint(customerId: string): Promise<BrandFingerprint | null> {
  const raw = getRawAdminClient();
  const { data, error } = await raw
    .from('brand_fingerprints')
    .select('requires_human_approval, brief_version_id, voice')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error('[customer-success-weekly] brand_fingerprints query failed', {
      customerId,
      error: error.message,
    });
    return null;
  }
  if (!data) return null;

  const row = data as {
    requires_human_approval: boolean;
    brief_version_id: string;
    voice: Record<string, unknown> | null;
  };

  const toneDescriptors: string[] = Array.isArray(row.voice?.['tone_descriptors'])
    ? (row.voice!['tone_descriptors'] as string[])
    : [];

  return {
    requiresHumanApproval: row.requires_human_approval,
    briefVersionId: row.brief_version_id,
    toneDescriptors,
  };
}

// ---------------------------------------------------------------------------
// Cron function
// ---------------------------------------------------------------------------

export const customerSuccessWeekly = inngest.createFunction(
  {
    id: 'customer-success-weekly',
    retries: 1,
    // One run at a time — prevents parallel Sunday runs from double-sending.
    concurrency: { limit: 1 },
  },
  // Sunday 14:00 UTC. Per-customer timezone scheduling is a future ticket (not in MVP).
  { cron: '0 14 * * 0' },
  async ({ step }) => {
    // ── Step 1: Fetch active customers ────────────────────────────────────────
    const customers = await step.run(
      'fetch-active-customers',
      async (): Promise<CustomerRecord[]> => {
        const db = getAdminClient();

        // Join businesses → user_profiles to get email + name.
        // A customer is "active" if they have a businesses row (they completed onboarding).
        // Two separate queries — Supabase TypeScript types don't recognize the
        // businesses → user_profiles join direction (user_profiles has no FK to businesses;
        // businesses.user_id → user_profiles.id). Splitting into two typed queries avoids
        // the SelectQueryError while keeping full type safety.
        const { data: bizData, error: bizError } = await db
          .from('businesses')
          .select('user_id, name')
          .limit(100); // pilot ceiling — promote to cursor-pagination at scale

        if (bizError) {
          console.error('[customer-success-weekly] fetch-active-customers failed', {
            error: bizError.message,
          });
          return [];
        }

        if (!bizData || bizData.length === 0) return [];

        // Collect unique user_ids, then fetch all matching user_profiles in one query.
        const userIds = bizData.map((b) => b.user_id);
        const { data: profileData, error: profileError } = await db
          .from('user_profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profileError) {
          console.error('[customer-success-weekly] user_profiles fetch failed', {
            error: profileError.message,
          });
          return [];
        }

        const profileMap = new Map(
          (profileData ?? []).map((p) => [p.id, p]),
        );

        return bizData.flatMap((biz) => {
          const profile = profileMap.get(biz.user_id);
          if (!profile) return []; // skip if no matching profile (data inconsistency)
          return [{
            userId: biz.user_id,
            email: profile.email,
            firstName: profile.full_name?.split(' ')[0]?.trim() ?? 'there',
            businessName: biz.name,
          }];
        });
      },
    );

    // ── Step 2: Process each customer ─────────────────────────────────────────
    const summary = { sent: 0, deferred: 0, skipped: 0, errors: 0 };

    for (const customer of customers) {
      // Accumulate cost.alert events during step.run; flush via step.sendEvent after.
      const pendingAlerts: PendingCostAlert[] = [];

      const outcome = await step.run(
        `process-customer-${customer.userId}`,
        async () => {
          const raw = getRawAdminClient();

          // Build context from approval_queue
          const weeklyContext = await buildWeeklyContext(customer.userId, raw);

          // Guard: skip if nothing to say (all buckets empty)
          if (
            weeklyContext.wins.length === 0 &&
            weeklyContext.queued.length === 0 &&
            (weeklyContext.concerns ?? []).length === 0
          ) {
            return { kind: 'skipped', reason: 'empty_context' } as const;
          }

          // Load brand fingerprint (voice + approval flag)
          const fingerprint = await loadBrandFingerprint(customer.userId);
          if (!fingerprint) {
            // No fingerprint → skip (brand hasn't completed discovery yet)
            console.log('[customer-success-weekly] no brand fingerprint, skipping', {
              customerId: customer.userId,
            });
            return { kind: 'skipped', reason: 'no_fingerprint' } as const;
          }

          const nudgeOutcome = await runCustomerSuccessNudge(
            {
              customerId: customer.userId,
              customerEmail: customer.email,
              firstName: customer.firstName,
              businessName: customer.businessName,
              trigger: 'cron_weekly',
              weeklyContext,
              requiresHumanApproval: fingerprint.requiresHumanApproval,
              briefVersionId: fingerprint.briefVersionId,
              toneDescriptors: fingerprint.toneDescriptors,
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.beamixai.com'}/dashboard`,
            },
            {
              emitCostAlert: (payload) => {
                // Accumulate — flushed via step.sendEvent outside step.run
                pendingAlerts.push({
                  customerId: payload.customerId,
                  feature: payload.feature,
                  costUsd: payload.costUsd,
                });
              },
            },
          );

          return nudgeOutcome;
        },
      );

      // Flush cost.alert events outside step.run (Inngest disallows nested step.*)
      for (const alert of pendingAlerts) {
        await step.sendEvent(`emit-cost-alert-${customer.userId}`, {
          name: 'cost.alert',
          data: {
            customerId: alert.customerId,
            feature: alert.feature,
            costUsd: alert.costUsd,
          },
        });
      }

      if ('kind' in outcome) {
        if (outcome.kind === 'sent') summary.sent++;
        else if (outcome.kind === 'deferred_approval') summary.deferred++;
        else if (outcome.kind === 'skipped') summary.skipped++;
        else summary.errors++;
      }
    }

    return summary;
  },
);

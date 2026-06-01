/**
 * Beamix — customer-success-on-approval-rejected Inngest function
 *
 * Listens for `approval.rejected` events and triggers a recovery-framed
 * customer-success nudge so the customer feels supported, not abandoned.
 *
 * Pattern mirrors approval-gate-writer.ts:
 *   - pendingEvents array accumulates inside step.run
 *   - step.sendEvent is called OUTSIDE step.run (Inngest disallows nested step.*)
 *
 * retries: 2 — covers transient LLM 429/529 + Supabase blips.
 * concurrency: keyed on customerId so simultaneous rejections for the same customer
 * are serialised.
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { inngest } from '../client';
import { runCustomerSuccessNudge } from '../../lib/agents/customer-success/index';
import { buildWeeklyContext } from '../../lib/agents/customer-success/weekly-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingCostAlert {
  customerId: string;
  feature: string;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// Raw client for tables not yet in database.types.ts
// ---------------------------------------------------------------------------

function getRawAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('[customer-success-on-approval-rejected] Missing Supabase service-role env vars');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Helper: load customer profile + brand fingerprint
// ---------------------------------------------------------------------------

interface CustomerProfile {
  email: string;
  firstName: string;
  businessName: string;
  requiresHumanApproval: boolean;
  briefVersionId: string;
  toneDescriptors: string[];
}

async function loadCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
  const raw = getRawAdminClient();

  // Fetch user_profiles + business name (join on user_id)
  const { data: profile, error: profileError } = await raw
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', customerId)
    .maybeSingle();

  if (profileError || !profile) {
    console.error('[customer-success-on-approval-rejected] user_profiles query failed', {
      customerId,
      error: profileError?.message,
    });
    return null;
  }

  const { data: business, error: businessError } = await raw
    .from('businesses')
    .select('name')
    .eq('user_id', customerId)
    .maybeSingle();

  if (businessError) {
    console.error('[customer-success-on-approval-rejected] businesses query failed', {
      customerId,
      error: businessError.message,
    });
  }

  const { data: fingerprint, error: fpError } = await raw
    .from('brand_fingerprints')
    .select('requires_human_approval, brief_version_id, voice')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (fpError) {
    console.error('[customer-success-on-approval-rejected] brand_fingerprints query failed', {
      customerId,
      error: fpError.message,
    });
  }

  const fpRow = fingerprint as {
    requires_human_approval: boolean;
    brief_version_id: string;
    voice: Record<string, unknown> | null;
  } | null;

  const toneDescriptors: string[] = Array.isArray(fpRow?.voice?.['tone_descriptors'])
    ? (fpRow!.voice!['tone_descriptors'] as string[])
    : [];

  return {
    email: (profile as { email: string }).email,
    firstName:
      ((profile as { full_name: string | null }).full_name?.split(' ')[0]?.trim()) ?? 'there',
    businessName: (business as { name: string } | null)?.name ?? 'your business',
    requiresHumanApproval: fpRow?.requires_human_approval ?? true,
    briefVersionId: fpRow?.brief_version_id ?? '',
    toneDescriptors,
  };
}

// ---------------------------------------------------------------------------
// Event handler function
// ---------------------------------------------------------------------------

export const customerSuccessOnApprovalRejected = inngest.createFunction(
  {
    id: 'customer-success-on-approval-rejected',
    retries: 2,
    // One in-flight nudge per customer at a time — prevents duplicate recovery emails.
    concurrency: { key: 'event.data.customerId', limit: 1 },
  },
  { event: 'approval.rejected' },
  async ({ event, step }) => {
    const { customerId } = event.data;

    // Accumulate cost.alert events inside step.run; flush outside via step.sendEvent.
    const pendingAlerts: PendingCostAlert[] = [];

    const outcome = await step.run('run-customer-success-nudge', async () => {
      const raw = getRawAdminClient();

      // Load customer profile + brand fingerprint
      const customerProfile = await loadCustomerProfile(customerId);
      if (!customerProfile) {
        console.error('[customer-success-on-approval-rejected] could not load customer profile', {
          customerId,
        });
        return { kind: 'aborted', reason: 'profile_not_found' } as const;
      }

      // Build weekly context — the rejection is the main trigger but we also show other activity
      const weeklyContext = await buildWeeklyContext(customerId, raw);

      return runCustomerSuccessNudge(
        {
          customerId,
          customerEmail: customerProfile.email,
          firstName: customerProfile.firstName,
          businessName: customerProfile.businessName,
          trigger: 'approval_rejected',
          weeklyContext,
          requiresHumanApproval: customerProfile.requiresHumanApproval,
          briefVersionId: customerProfile.briefVersionId,
          toneDescriptors: customerProfile.toneDescriptors,
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
    });

    // Flush cost.alert events outside step.run
    for (const alert of pendingAlerts) {
      await step.sendEvent(`emit-cost-alert-${customerId}`, {
        name: 'cost.alert',
        data: {
          customerId: alert.customerId,
          feature: alert.feature,
          costUsd: alert.costUsd,
        },
      });
    }

    return { customerId, outcome };
  },
);

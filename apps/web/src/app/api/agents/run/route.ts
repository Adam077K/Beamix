/**
 * POST /api/agents/run
 *
 * Ignition route for the Beamix agent pipeline. Authenticated users can trigger
 * an agent run for a business they own. The route:
 *   1. Verifies the caller is authenticated (Supabase SSR getUser).
 *   2. Zod-validates the request body.
 *   3. IDOR guard — confirms the businessId belongs to the session user.
 *   4. Resolves the user's plan tier from subscriptions → plans join.
 *   5. Checks agent availability on the resolved tier.
 *   6. Checks the daily cap for free agents (throws 429 if exceeded).
 *   7. INSERTs an `agent_jobs` row via the service-role admin client.
 *   8. Fires `agent/run.requested` via Inngest to ignite the existing pipeline.
 *   9. Returns 202 { jobId, status: 'queued' }.
 *
 * Risk tier: FULL (new API route + auth + service-role writes + Inngest emit).
 *
 * Returns:
 *   202  { jobId, status: 'queued' }
 *   400  Zod validation error
 *   401  No authenticated session
 *   403  Agent not available on the user's plan tier
 *   404  Business not found or not owned by session user
 *   429  Daily cap exceeded for free agent
 *   500  Internal error (DB insert, Inngest send)
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAdminClient } from '@/lib/agents/db/admin-client';
import { isAgentAvailable, getAgentConfig, checkDailyCap } from '@/lib/agents';
import { CapExceededError } from '@/lib/agents/errors';
import { inngest } from '@/inngest/client';
import type { Database } from '@/lib/db/database.types';
import type { AgentType, PlanTier } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Input schema — 11 AgentType values from registry.ts
// ---------------------------------------------------------------------------

const AGENT_TYPES = [
  'query_mapper',
  'content_optimizer',
  'freshness_agent',
  'faq_builder',
  'schema_generator',
  'offsite_presence_builder',
  'review_presence_planner',
  'entity_builder',
  'authority_blog_strategist',
  'performance_tracker',
  'reddit_presence_planner',
] as const satisfies readonly AgentType[];

const AgentRunBodySchema = z.object({
  agentType: z.enum(AGENT_TYPES),
  businessId: z.string().uuid(),
  targetUrl: z.string().url().optional(),
  targetContent: z.string().max(50_000).optional(),
  queryCluster: z.array(z.string()).optional(),
  customInstructions: z.string().max(2_000).optional(),
  scanId: z.string().uuid().optional(),
});

type AgentRunBody = z.infer<typeof AgentRunBodySchema>;

// ---------------------------------------------------------------------------
// Auth helper — cookie-based user client (getUser only)
// ---------------------------------------------------------------------------

async function getUserClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Route handler — cookie writes may fail after response headers sent; not an error
          }
        },
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Plan tier resolver
//
// Decision: resolve via subscriptions → plans join (not businesses.plan_tier —
// businesses table has no plan_tier column). This is the canonical billing source.
// Falls back to 'discover' (most restrictive product tier) when no active
// subscription is found.
// ---------------------------------------------------------------------------

async function resolveUserPlanTier(userId: string): Promise<PlanTier> {
  const { data, error } = await getAdminClient()
    .from('subscriptions')
    .select('plan_id, plans!inner(tier)')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'] as const)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[agents/run] failed to resolve plan tier', {
      userId,
      error: error.message,
    });
    return 'discover';
  }

  if (!data) return 'discover';

  const plansJoin = data.plans as unknown as { tier: string } | null;
  const rawTier = plansJoin?.tier ?? 'discover';

  // Guard: only accept known PlanTier values
  const validTiers: PlanTier[] = ['discover', 'build', 'scale'];
  return validTiers.includes(rawTier as PlanTier) ? (rawTier as PlanTier) : 'discover';
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Authenticate via cookie-based Supabase SSR client
  const userClient = await getUserClient();
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // 2. Parse + Zod-validate the request body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = AgentRunBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    agentType,
    businessId,
    targetUrl,
    targetContent,
    queryCluster,
    customInstructions,
    scanId,
  }: AgentRunBody = parsed.data;

  // 3. IDOR guard — confirm businessId belongs to the session user
  const admin = getAdminClient();

  const { data: business, error: businessError } = await admin
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', userId)
    .maybeSingle();

  if (businessError) {
    console.error('[agents/run] business ownership check failed', {
      userId,
      businessId,
      error: businessError.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!business) {
    // Return 404 (not 403) to avoid leaking that the business exists
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  // 4. Resolve plan tier
  const planTier = await resolveUserPlanTier(userId);

  // 5. Check agent availability on the user's tier
  if (!isAgentAvailable(agentType, planTier)) {
    return NextResponse.json(
      {
        error: 'Agent not available on your current plan',
        agentType,
        planTier,
      },
      { status: 403 },
    );
  }

  // 6. Check daily cap (free agents only — credit-gated agents have null cap)
  const jobId = crypto.randomUUID();

  try {
    await checkDailyCap(userId, agentType, planTier, jobId);
  } catch (err) {
    if (err instanceof CapExceededError) {
      return NextResponse.json(
        {
          error: 'Daily cap exceeded for this agent',
          capStatus: err.capStatus,
        },
        { status: 429 },
      );
    }
    // Unexpected error from daily cap check
    console.error('[agents/run] checkDailyCap threw unexpectedly', {
      userId,
      agentType,
      error: String(err),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // 7. INSERT agent_jobs row via service-role admin client
  //    Columns: id, user_id, business_id, agent_type, plan_tier, credit_cost,
  //             status (default 'queued'), scan_id?, target_url?, target_content?,
  //             custom_instructions?
  const agentConfig = getAgentConfig(agentType);

  const { error: insertError } = await admin.from('agent_jobs').insert({
    id: jobId,
    user_id: userId,
    business_id: businessId,
    agent_type: agentType,
    plan_tier: planTier,
    credit_cost: agentConfig.creditCost,
    status: 'queued',
    scan_id: scanId ?? null,
    target_url: targetUrl ?? null,
    target_content: targetContent ?? null,
    custom_instructions: customInstructions ?? null,
  });

  if (insertError) {
    console.error('[agents/run] agent_jobs insert failed', {
      jobId,
      userId,
      agentType,
      error: insertError.message,
    });
    return NextResponse.json({ error: 'Failed to queue agent job' }, { status: 500 });
  }

  // 8. Emit Inngest event — ignites the existing agent-execute pipeline
  try {
    await inngest.send({
      name: 'agent/run.requested',
      data: {
        jobId,
        agentType,
        userId,
        businessId,
        planTier,
        targetUrl,
        targetContent,
        queryCluster,
        customInstructions,
        scanId,
      },
    });
  } catch (err) {
    // Inngest send failure is non-fatal — the agent_jobs row is persisted with
    // status 'queued'. A recovery mechanism can re-emit queued jobs. Log prominently.
    console.error('[agents/run] Inngest send failed — job queued but not triggered', {
      jobId,
      agentType,
      error: String(err),
    });
  }

  // 9. Return 202 with the new jobId
  return NextResponse.json({ jobId, status: 'queued' }, { status: 202 });
}

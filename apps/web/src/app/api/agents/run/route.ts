/**
 * POST /api/agents/run
 *
 * Ignition route for the Beamix agent pipeline. Authenticated users can trigger
 * an agent run for a business they own. The route:
 *   1. Verifies the caller is authenticated (Supabase SSR getUser).
 *   2. Zod-validates the request body (includes SSRF guard on targetUrl).
 *   3. IDOR guard — confirms the businessId belongs to the session user
 *      (query via USER-scoped client; admin client only for writes).
 *   4. Resolves the user's plan tier from subscriptions → plans join (admin client
 *      because subscriptions RLS may block the user-scoped client on join).
 *   5. Checks agent availability on the resolved tier.
 *   6. Checks the daily cap for free agents (throws 429 if exceeded).
 *   7. INSERTs an `agent_jobs` row via the service-role admin client.
 *   8. Fires `agent/run.requested` via Inngest to ignite the existing pipeline.
 *      On Inngest failure → marks the job 'failed' and returns 502.
 *   9. Returns 202 { jobId, status: 'queued' }.
 *
 * Risk tier: FULL (new API route + auth + service-role writes + Inngest emit).
 *
 * Returns:
 *   202  { jobId, status: 'queued' }
 *   400  Zod validation error (includes SSRF-blocked targetUrl)
 *   401  No authenticated session
 *   403  Agent not available on the user's plan tier
 *   404  Business not found or not owned by session user
 *   429  Daily cap exceeded for free agent
 *   500  Internal error (DB insert, env vars missing)
 *   502  Inngest send failed (job inserted but not triggered; row marked 'failed')
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

/**
 * SSRF guard for targetUrl.
 * Requires http(s) scheme and rejects private/internal hosts:
 *   - file://, gopher://, ftp:// etc.
 *   - localhost, *.local, *.internal
 *   - RFC-1918 ranges: 10.x, 192.168.x, 172.16-31.x
 *   - Link-local: 169.254.x
 *   - Loopback: 127.x, 0.x, ::1
 */
function isPublicHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
    if (/^(10\.|127\.|0\.|169\.254\.|192\.168\.)/.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (h === '::1' || h === '[::1]') return false;
    return true;
  } catch {
    return false;
  }
}

const AgentRunBodySchema = z.object({
  agentType: z.enum(AGENT_TYPES),
  businessId: z.string().uuid(),
  /** Public http(s) URLs only — internal/private hosts are rejected (SSRF guard). */
  targetUrl: z
    .string()
    .url()
    .refine(isPublicHttpUrl, { message: 'targetUrl must be a public http(s) URL' })
    .optional(),
  targetContent: z.string().max(50_000).optional(),
  /** DoS/cost guard: max 50 entries, each max 500 chars. */
  queryCluster: z.array(z.string().min(1).max(500)).max(50).optional(),
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
// Uses the service-role admin client because the subscriptions → plans join
// may be blocked by RLS on the user-scoped anon client. RLS allows users to
// SELECT their own subscriptions, but the inner join to plans (a system table)
// can fail in some policy configurations. Admin client is safe here because
// the query is scoped with .eq('user_id', userId).
//
// Error handling: DB errors surface as 500 (thrown), NOT silently downgraded
// to 'discover'. Only a genuinely missing row falls back to 'discover'.
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
    // Throw so the caller's 500 path fires — do NOT silently downgrade a paying user.
    throw new Error(`[agents/run] failed to resolve plan tier for user ${userId}: ${error.message}`);
  }

  // No active subscription → most-restrictive tier (free-tier equivalent)
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
  // Guard: getAdminClient() throws synchronously on missing env vars — catch it
  // so we return a structured 500 instead of an unhandled Next error.
  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (err) {
    console.error('[agents/run] getAdminClient threw — missing env vars', { error: String(err) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

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

  // 3. IDOR guard — confirm businessId belongs to the session user.
  //    This is a READ operation on the user's own data; the user-scoped client
  //    is the correct choice (RLS defense-in-depth: policy ensures user_id = auth.uid()).
  //    We keep the explicit .eq('user_id', userId) as belt-and-suspenders.
  const { data: business, error: businessError } = await userClient
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

  // 4. Resolve plan tier (throws on DB error → 500 via the catch below)
  let planTier: PlanTier;
  try {
    planTier = await resolveUserPlanTier(userId);
  } catch (err) {
    console.error('[agents/run] plan tier resolution failed', {
      userId,
      error: String(err),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

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

  // 7. INSERT agent_jobs row via service-role admin client.
  //    NOTE: queryCluster is event-only; agent_jobs has no query_cluster column.
  //    DB-recovery (if ever built) must re-drive from the Inngest event payload.
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

  // 8. Emit Inngest event — ignites the existing agent-execute pipeline.
  //    On failure: update the job row to 'failed' (so the user is never left with
  //    a permanently-stuck 'queued' row) and return 502. There is no background
  //    recovery mechanism; the client must retry the full request.
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
    console.error('[agents/run] Inngest send failed — marking job failed', {
      jobId,
      agentType,
      error: String(err),
    });

    // Best-effort update — if this also fails, the row stays 'queued' but we still
    // return 502 (the Inngest failure is authoritative for the response).
    const { error: updateError } = await admin
      .from('agent_jobs')
      .update({
        status: 'failed',
        error_message: `Inngest dispatch failed: ${String(err)}`,
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('[agents/run] agent_jobs status update to failed also failed', {
        jobId,
        error: updateError.message,
      });
    }

    return NextResponse.json(
      { error: 'Failed to dispatch agent job. Please try again.' },
      { status: 502 },
    );
  }

  // 9. Return 202 with the new jobId
  return NextResponse.json({ jobId, status: 'queued' }, { status: 202 });
}

/**
 * POST /api/agents/run
 *
 * Queues a new agent job for a given business. Inserts an `agent_jobs` row,
 * fires an Inngest event, and returns 202 with the jobId.
 *
 * Daily-capped agents (free agents with per-tier limits) are checked before
 * enqueuing and incremented after successful enqueue.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';
import { AgentRunRequestSchema } from '@/lib/types/api';
import { sanitizeUserInput } from '@/lib/agents/security';
import { checkDailyCap, incrementDailyCap } from '@/lib/agents/daily-cap';
import type { AgentType, PlanTier } from '@/lib/agents/types';

const DAILY_CAPPED_AGENTS = [
  'schema_generator',
  'faq_builder',
  'offsite_presence_builder',
  'performance_tracker',
] as const satisfies readonly AgentType[];

export async function POST(request: Request) {
  try {
    // 1. Parse + validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      );
    }

    const parsed = AgentRunRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid request body.',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { agentType, businessId, targetUrl, customInstructions, sourceSuggestionId } =
      parsed.data;

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } },
        { status: 401 },
      );
    }

    const userId = user.id;

    // 3. Resolve plan tier for daily cap check
    // The real tier is fetched inside the Inngest pipeline; we fetch it here
    // only to enforce the daily cap at the API boundary.
    const { data: subRow } = await (supabase as any)
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', userId)
      .maybeSingle();
    const planTier: PlanTier = (subRow?.plan_tier as PlanTier) ?? 'discover';

    // 4. Daily cap check (free agents only)
    if (DAILY_CAPPED_AGENTS.includes(agentType as (typeof DAILY_CAPPED_AGENTS)[number])) {
      const capResult = await checkDailyCap(userId, agentType as AgentType, planTier);
      if (!capResult.allowed) {
        const resetAt = new Date();
        resetAt.setUTCHours(24, 0, 0, 0);
        return NextResponse.json(
          {
            error: 'daily_cap_reached',
            agent_type: agentType,
            reset_at: resetAt.toISOString(),
          },
          { status: 429 },
        );
      }
    }

    // 5. Generate jobId and insert agent_jobs row
    const jobId = crypto.randomUUID();

    const { error: insertError } = await (supabase as any).from('agent_jobs').insert({
      id: jobId,
      user_id: userId,
      business_id: businessId,
      agent_type: agentType,
      status: 'queued',
      started_at: null,
      custom_instructions: customInstructions
        ? sanitizeUserInput(customInstructions)
        : null,
    });

    if (insertError) {
      console.error('[agents/run] insert error:', insertError.message);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to create agent job.' } },
        { status: 500 },
      );
    }

    // 6. Fire Inngest event
    await inngest.send({
      name: 'agent.run.requested',
      data: {
        jobId,
        userId,
        businessId,
        agentType,
        planTier: planTier,
        targetUrl,
        customInstructions: customInstructions
          ? sanitizeUserInput(customInstructions)
          : undefined,
        sourceSuggestionId,
        enqueuedAt: new Date().toISOString(),
      },
    });

    // 7. Increment daily cap after successful enqueue
    if (DAILY_CAPPED_AGENTS.includes(agentType as (typeof DAILY_CAPPED_AGENTS)[number])) {
      await incrementDailyCap(userId, agentType as AgentType);
    }

    // 8. Return 202
    return NextResponse.json(
      {
        jobId,
        status: 'queued',
        estimatedCreditsCost: 1,
        estimatedCompletionAt: new Date(Date.now() + 60_000).toISOString(),
      },
      { status: 202 },
    );
  } catch (err) {
    console.error('[agents/run] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}

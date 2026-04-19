/**
 * POST /api/agents/run
 *
 * Queues a new agent job for a given business. Inserts an `agent_jobs` row,
 * fires an Inngest event, and returns 202 with the jobId.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';
import { AgentRunRequestSchema } from '@/lib/types/api';
import { sanitizeUserInput } from '@/lib/agents/security';

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

    // 3. Generate jobId and insert agent_jobs row
    const jobId = crypto.randomUUID();

    const { error: insertError } = await (supabase as any).from('agent_jobs').insert({
      id: jobId,
      user_id: user.id,
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

    // 4. Fire Inngest event
    await inngest.send({
      name: 'agent.run.requested',
      data: {
        jobId,
        userId: user.id,
        businessId,
        agentType,
        planTier: 'discover', // placeholder — real tier fetched in pipeline
        targetUrl,
        customInstructions: customInstructions
          ? sanitizeUserInput(customInstructions)
          : undefined,
        sourceSuggestionId,
        enqueuedAt: new Date().toISOString(),
      },
    });

    // 5. Return 202
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

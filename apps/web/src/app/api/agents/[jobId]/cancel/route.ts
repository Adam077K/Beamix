/**
 * POST /api/agents/[jobId]/cancel
 *
 * Cancels a queued or running agent job. Validates ownership, checks the
 * job is not already in a terminal state, updates status, and releases credits.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { releaseCredits } from '@/lib/agents/credit-guard';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    // 1. Auth check
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

    // 2. Fetch the job — confirm ownership
    const { data: job, error: fetchError } = await (supabase as any)
      .from('agent_jobs')
      .select('id, user_id, status')
      .eq('id', jobId)
      .single();

    if (fetchError || !job || job.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Agent job not found.' } },
        { status: 404 },
      );
    }

    // 3. Guard terminal states
    if (job.status === 'completed' || job.status === 'cancelled') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_FINAL',
            message: `Job is already in terminal state: ${job.status}.`,
          },
        },
        { status: 409 },
      );
    }

    // 4. Update status to cancelled
    const { error: updateError } = await (supabase as any)
      .from('agent_jobs')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', jobId);

    if (updateError) {
      console.error('[agents/cancel] update error:', updateError.message);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to cancel agent job.' } },
        { status: 500 },
      );
    }

    // 5. Release any held credits
    try {
      await releaseCredits(jobId);
    } catch (creditErr) {
      // Non-fatal — log but don't fail the cancel response
      console.warn('[agents/cancel] releaseCredits failed:', creditErr);
    }

    return NextResponse.json({ jobId, status: 'cancelled' }, { status: 200 });
  } catch (err) {
    console.error('[agents/cancel] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}

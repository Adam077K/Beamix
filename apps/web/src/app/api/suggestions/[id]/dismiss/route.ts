/**
 * POST /api/suggestions/[id]/dismiss
 *
 * Dismisses a suggestion for the authenticated user. An optional reason
 * string may be included in the request body.
 */

import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { SuggestionDismissRequestSchema } from '@/lib/types/api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1. Parse + validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = SuggestionDismissRequestSchema.safeParse(body);
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

    const { reason } = parsed.data;

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

    // 3. Update suggestion — scoped to user for ownership enforcement
    const { data: updated, error: updateError } = await (supabase as any)
      .from('suggestions')
      .update({
        status: 'dismissed',
        dismissed_reason: reason ?? null,
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, status')
      .single();

    if (updateError || !updated) {
      if (updateError?.code === 'PGRST116') {
        // No rows matched — not found or wrong owner
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Suggestion not found.' } },
          { status: 404 },
        );
      }
      console.error('[suggestions/dismiss] update error:', updateError?.message);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to dismiss suggestion.' } },
        { status: 500 },
      );
    }

    // Invalidate home + inbox cache for this user so fresh suggestions are fetched
    revalidateTag(`home-${user.id}`, 'page');
    revalidateTag(`inbox-${user.id}`, 'page');
    revalidatePath('/home');

    return NextResponse.json({ id, status: 'dismissed' }, { status: 200 });
  } catch (err) {
    console.error('[suggestions/dismiss] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}

/**
 * GET /api/suggestions
 *
 * Returns the authenticated user's suggestions, filtered by status,
 * ordered by impact (high → medium → low) then recency.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SuggestionsListQuerySchema } from '@/lib/types/api';
import type { Suggestion } from '@/lib/types/shared';

/** Map DB impact values to a sort weight so high comes first. */
const IMPACT_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export async function GET(request: Request) {
  try {
    // 1. Parse + validate query params
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      status: searchParams.get('status') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    };

    const parsed = SuggestionsListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid query parameters.',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { status, limit } = parsed.data;

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

    // 3. Build query
    let query = (supabase as any)
      .from('suggestions')
      .select(
        'id, user_id, business_id, scan_id, agent_type, title, description, impact, estimated_runs, status, trigger_rule, evidence, target_query_ids, target_url, accepted_at, expires_at, created_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: rows, error: fetchError } = await query;

    if (fetchError) {
      console.error('[suggestions] fetch error:', fetchError.message);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch suggestions.' } },
        { status: 500 },
      );
    }

    // 4. Map DB snake_case → Suggestion camelCase and sort by impact
    const suggestions: Suggestion[] = ((rows as Record<string, unknown>[]) ?? [])
      .map((row) => ({
        id: row['id'] as string,
        userId: row['user_id'] as string,
        businessId: row['business_id'] as string,
        scanId: (row['scan_id'] as string | null) ?? null,
        agentType: row['agent_type'] as Suggestion['agentType'],
        title: row['title'] as string,
        description: row['description'] as string,
        impact: row['impact'] as Suggestion['impact'],
        estimatedRuns: (row['estimated_runs'] as number) ?? 1,
        status: row['status'] as Suggestion['status'],
        triggerRule: (row['trigger_rule'] as string | null) ?? null,
        evidence: (row['evidence'] as Record<string, unknown>) ?? {},
        targetQueryIds: (row['target_query_ids'] as string[]) ?? [],
        targetUrl: (row['target_url'] as string | null) ?? null,
        acceptedAt: (row['accepted_at'] as string | null) ?? null,
        expiresAt: row['expires_at'] as string,
        createdAt: row['created_at'] as string,
      }))
      .sort(
        (a, b) =>
          (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (err) {
    console.error('[suggestions] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { AgentTypeSchema } from '@/lib/types/api';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

const CadenceSchema = z.enum(['daily', 'weekly', 'biweekly', 'monthly']);

const PostBodySchema = z.object({
  agent_type: AgentTypeSchema,
  cadence: CadenceSchema,
});

function computeNextRunAt(cadence: string): string {
  const now = Date.now();
  const msMap: Record<string, number> = {
    daily: 1 * 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    biweekly: 14 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };
  const delta = msMap[cadence] ?? msMap['weekly'];
  return new Date(now + delta).toISOString();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const { data: schedules, error } = await supabase
    .from('automation_configs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ schedules: schedules ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  // Accept both camelCase (legacy modal) and snake_case
  const normalized = body
    ? {
        agent_type: body.agent_type ?? body.agentType,
        cadence: body.cadence ?? body.frequency,
      }
    : null;

  const parsed = PostBodySchema.safeParse(normalized);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { agent_type, cadence } = parsed.data;
  const nextRunAt = computeNextRunAt(cadence);
  const now = new Date().toISOString();

  const { data: schedule, error } = await supabase
    .from('automation_configs')
    .upsert(
      {
        user_id: user.id,
        agent_type,
        cadence,
        is_active: true,
        paused_at: null,
        next_run_at: nextRunAt,
        updated_at: now,
      },
      { onConflict: 'user_id,agent_type' }
    )
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ schedule }, { status: 201 });
}

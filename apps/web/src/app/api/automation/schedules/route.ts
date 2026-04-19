import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AutomationScheduleUpsertSchema } from '@/lib/types/api';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

function computeNextRunAt(frequency: string): string {
  const now = Date.now();
  const msMap: Record<string, number> = {
    daily: 1 * 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    biweekly: 14 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };
  const delta = msMap[frequency] ?? msMap['weekly'];
  return new Date(now + delta).toISOString();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const { data: schedules, error } = await (supabase as any)
    .from('automation_configs')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ schedules: schedules ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = AutomationScheduleUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { agentType, frequency, isEnabled } = parsed.data as any;
  const nextRunAt = computeNextRunAt(frequency);

  const { data: schedule, error } = await (supabase as any)
    .from('automation_configs')
    .upsert(
      {
        user_id: user.id,
        agent_type: agentType,
        frequency,
        is_enabled: isEnabled,
        next_run_at: nextRunAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,agent_type' }
    )
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ schedule });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { KillSwitchToggleSchema } from '@/lib/types/api';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = KillSwitchToggleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { enabled } = parsed.data as any;
  const now = new Date().toISOString();

  const { error: profileError } = await (supabase as any)
    .from('user_profiles')
    .upsert({ id: user.id, automation_kill_switch: enabled, updated_at: now });

  if (profileError) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: profileError.message } },
      { status: 500 }
    );
  }

  if (enabled) {
    const { error: configError } = await (supabase as any)
      .from('automation_configs')
      .update({ is_paused: true, updated_at: now })
      .eq('user_id', user.id);

    if (configError) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: configError.message } },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, enabled });
}

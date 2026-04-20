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
  } = await supabase.auth.getUser();

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

  const { enabled } = parsed.data;
  const now = new Date().toISOString();

  // Upsert automation_settings — creates row if missing (W0 migration created this table)
  const { error: settingsError } = await supabase
    .from('automation_settings')
    .upsert(
      { user_id: user.id, automation_paused: !enabled, updated_at: now },
      { onConflict: 'user_id' }
    );

  if (settingsError) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: settingsError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, automation_paused: !enabled });
}

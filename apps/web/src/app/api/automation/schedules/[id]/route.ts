import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

const PatchBodySchema = z.object({
  is_active: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = PatchBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { is_active } = parsed.data;
  const now = new Date().toISOString();

  // Running = is_active=true AND paused_at IS NULL
  // Paused  = paused_at IS NOT NULL
  // Off     = is_active=false
  const updatePayload = is_active
    ? { is_active: true, paused_at: null, updated_at: now }
    : { is_active: false, paused_at: now, updated_at: now };

  const { data: updated, error } = await supabase
    .from('automation_configs')
    .update(updatePayload as never)
    .eq('id', id)
    .eq('user_id', user.id) // RLS double-check
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ schedule: updated });
}

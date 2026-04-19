import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ArchivePublishRequestSchema } from '@/lib/types/api';
import { inngest } from '@/inngest/client';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const { itemId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = ArchivePublishRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { publishedUrl } = parsed.data as any;

  const { data: item, error: fetchError } = await (supabase as any)
    .from('content_items')
    .select('id, user_id')
    .eq('id', itemId)
    .single();

  if (fetchError || !item) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Content item not found' } },
      { status: 404 }
    );
  }

  if (item.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Content item not found' } },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  const { error: updateError } = await (supabase as any)
    .from('content_items')
    .update({
      published_at: now,
      published_url: publishedUrl,
      verification_status: 'pending',
      updated_at: now,
    })
    .eq('id', itemId);

  if (updateError) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: updateError.message } },
      { status: 500 }
    );
  }

  await (inngest as any).send({
    name: 'archive/published' as any,
    data: { itemId, userId: user.id, url: publishedUrl },
  });

  return NextResponse.json({ itemId, publishedAt: now, publishedUrl });
}

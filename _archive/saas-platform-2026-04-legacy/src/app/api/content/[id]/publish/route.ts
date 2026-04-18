import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership and current status
  const { data: item, error: fetchError } = await supabase
    .from('content_items')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  if (item.status === 'archived') {
    return NextResponse.json(
      { error: 'Cannot publish archived content. Restore it first.' },
      { status: 400 }
    )
  }

  if (item.status === 'published') {
    return NextResponse.json(
      { error: 'Content is already published' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('content_items')
    .update({
      status: 'published',
      published_at: now,
      updated_at: now,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to publish content', details: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, published_at: now })
}

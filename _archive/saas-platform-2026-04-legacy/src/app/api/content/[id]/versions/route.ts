import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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

  // Verify user owns the content item
  const { data: item, error: itemError } = await supabase
    .from('content_items')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (itemError || !item) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  const { data: versions, error } = await supabase
    .from('content_versions')
    .select('id, version_number, content_body, edited_by, change_summary, created_at')
    .eq('content_item_id', id)
    .order('version_number', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch versions', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ versions: versions ?? [] })
}

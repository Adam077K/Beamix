import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const updateContentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content_body: z.string().min(1).optional(),
  meta_description: z.string().max(500).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  language: z.string().max(10).optional(),
  change_summary: z.string().max(300).optional(),
})

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

  const { data: item, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !item) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  // Fetch latest version
  const { data: latestVersion } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_item_id', id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  // Fetch performance data if published
  let performance = null
  if (item.status === 'published') {
    const { data: perfData } = await supabase
      .from('content_performance')
      .select('*')
      .eq('content_item_id', id)
      .order('measurement_date', { ascending: false })
      .limit(5)

    performance = perfData
  }

  return NextResponse.json({
    ...item,
    latest_version: latestVersion ?? null,
    performance: performance ?? [],
  })
}

export async function PATCH(
  request: Request,
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateContentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('content_items')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  if (existing.status === 'archived') {
    return NextResponse.json({ error: 'Cannot edit archived content' }, { status: 400 })
  }

  const input = parsed.data

  // Build the update payload for content_items
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updates.title = input.title
  if (input.meta_description !== undefined) updates.meta_description = input.meta_description
  if (input.tags !== undefined) updates.tags = input.tags
  if (input.language !== undefined) updates.language = input.language

  if (input.content_body !== undefined) {
    updates.content_body = input.content_body
    updates.content = input.content_body
    updates.word_count = input.content_body.split(/\s+/).filter(Boolean).length
  }

  const { error: updateError } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update content', details: updateError.message },
      { status: 500 }
    )
  }

  // If content_body changed, create a new version
  if (input.content_body !== undefined) {
    // Get current max version
    const { data: maxVersion } = await supabase
      .from('content_versions')
      .select('version_number')
      .eq('content_item_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (maxVersion?.version_number ?? 0) + 1

    const { error: versionError } = await supabase.from('content_versions').insert({
      content_item_id: id,
      version_number: nextVersion,
      content_body: input.content_body,
      edited_by: user.id,
      change_summary: input.change_summary ?? null,
    })

    if (versionError) {
      console.error('Failed to create content version:', versionError.message)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
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

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('content_items')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  // Soft delete — set status to archived
  const { error: archiveError } = await supabase
    .from('content_items')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (archiveError) {
    return NextResponse.json(
      { error: 'Failed to archive content', details: archiveError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

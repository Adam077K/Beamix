import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AGENT_TYPES = [
  'content_writer',
  'blog_writer',
  'faq_agent',
  'schema_optimizer',
  'review_analyzer',
  'social_strategy',
  'competitor_intelligence',
] as const

const CONTENT_STATUSES = ['draft', 'in_review', 'approved', 'published', 'archived'] as const

const CONTENT_FORMATS = [
  'markdown',
  'html',
  'json_ld',
  'plain_text',
  'structured_report',
] as const

const createContentSchema = z.object({
  business_id: z.string().uuid(),
  agent_job_id: z.string().uuid(),
  agent_type: z.enum(AGENT_TYPES),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  content_body: z.string().nullable().optional(),
  content_format: z.enum(CONTENT_FORMATS).optional(),
  content_type: z.string().max(100).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  language: z.string().max(10).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const agentType = searchParams.get('agent_type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25', 10)))
  const offset = (page - 1) * limit

  let query = supabase
    .from('content_items')
    .select(
      'id, agent_type, title, content_format, status, word_count, quality_score, is_favorited, language, tags, created_at, updated_at, published_at',
      { count: 'exact' }
    )
    .eq('user_id', user.id)

  if (agentType && AGENT_TYPES.includes(agentType as (typeof AGENT_TYPES)[number])) {
    query = query.eq('agent_type', agentType as (typeof AGENT_TYPES)[number])
  }

  if (status && CONTENT_STATUSES.includes(status as (typeof CONTENT_STATUSES)[number])) {
    query = query.eq('status', status as (typeof CONTENT_STATUSES)[number])
  }

  if (search) {
    const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    query = query.ilike('title', `%${escapedSearch}%`)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(request: Request) {
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

  const parsed = createContentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  const input = parsed.data

  // Verify business belongs to user
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', input.business_id)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const wordCount = input.content.split(/\s+/).filter(Boolean).length

  const { data: item, error: insertError } = await supabase
    .from('content_items')
    .insert({
      user_id: user.id,
      business_id: input.business_id,
      agent_job_id: input.agent_job_id,
      agent_type: input.agent_type,
      title: input.title,
      content: input.content,
      content_body: input.content_body ?? null,
      content_format: input.content_format ?? 'markdown',
      content_type: input.content_type ?? null,
      meta_description: input.meta_description ?? null,
      language: input.language ?? 'en',
      tags: input.tags ?? null,
      word_count: wordCount,
      status: 'draft',
    })
    .select('id, title, status, created_at')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to create content', details: insertError.message },
      { status: 500 }
    )
  }

  // Create initial version
  const { error: versionError } = await supabase.from('content_versions').insert({
    content_item_id: item.id,
    version_number: 1,
    content_body: input.content,
    edited_by: user.id,
    change_summary: 'Initial version',
  })

  if (versionError) {
    // Content was created but version tracking failed — log but don't fail the request
    console.error('Failed to create initial content version:', versionError.message)
  }

  return NextResponse.json(item, { status: 201 })
}

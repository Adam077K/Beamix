import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  let query = supabase
    .from('recommendations')
    .select(
      'id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    const validStatuses = ['pending', 'in_progress', 'done', 'dismissed'] as const
    const statusList = status.split(',').filter((s): s is typeof validStatuses[number] =>
      (validStatuses as readonly string[]).includes(s)
    )
    if (statusList.length > 0) {
      query = query.in('status', statusList)
    }
  }

  if (priority) {
    const validPriorities = ['high', 'medium', 'low'] as const
    const priorityList = priority.split(',').filter((p): p is typeof validPriorities[number] =>
      (validPriorities as readonly string[]).includes(p)
    )
    if (priorityList.length > 0) {
      query = query.in('priority', priorityList)
    }
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

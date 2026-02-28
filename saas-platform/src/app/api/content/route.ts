// ================================================
// Content Generations API
// GET /api/content - List generated content
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const searchParams = request.nextUrl.searchParams
  
  const agent_type = searchParams.get('agent_type')
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '20')
  
  const supabase = await createClient()
  
  // Build query
  let query = supabase
    .from('content_generations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
  
  // Filter by agent type if specified
  if (agent_type) {
    query = query.eq('agent_type', agent_type)
  }
  
  // Pagination and sorting
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)
  
  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }
  
  return successResponse({
    content: data || [],
    pagination: {
      page,
      per_page,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / per_page),
    },
  })
}

export const GET = withErrorHandler(handler)

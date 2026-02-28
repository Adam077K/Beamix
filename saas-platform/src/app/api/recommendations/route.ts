// ================================================
// Recommendations API
// GET /api/recommendations - List recommendations
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') || 'pending'
  
  const supabase = await createClient()
  
  // Build query
  let query = supabase
    .from('recommendations')
    .select(`
      id,
      recommendation_text,
      action_type,
      impact,
      effort,
      reasoning,
      status,
      agent_type,
      agent_input_params,
      related_query_id,
      priority_score,
      created_at
    `)
    .eq('user_id', user.id)
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false })
  
  // Filter by status if specified
  if (status !== 'all') {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`)
  }
  
  return successResponse({
    recommendations: data || [],
    total: data?.length || 0,
  })
}

export const GET = withErrorHandler(handler)

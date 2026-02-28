// ================================================
// Queries API Routes
// GET /api/queries - List all queries
// POST /api/queries - Create new query
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { BadRequestError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

// GET - List all queries
async function handleGet(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tracked_queries')
    .select(`
      id,
      query_text,
      source,
      category,
      priority,
      is_active,
      avg_ranking,
      last_checked_at,
      created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch queries: ${error.message}`)
  }
  
  return successResponse({ queries: data || [] })
}

// POST - Create new query
async function handlePost(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const body = await request.json()
  
  const { query_text, category, priority } = body
  
  // Validate
  if (!query_text || query_text.trim().length < 10) {
    throw new BadRequestError('Query text must be at least 10 characters')
  }
  
  if (query_text.length > 200) {
    throw new BadRequestError('Query text must be less than 200 characters')
  }
  
  const supabase = await createClient()
  
  // Check for duplicate (case-insensitive)
  const { data: existing } = await supabase
    .from('tracked_queries')
    .select('id')
    .eq('user_id', user.id)
    .ilike('query_text', query_text.trim())
    .single()
  
  if (existing) {
    throw new BadRequestError('Query already exists')
  }
  
  // Create query
  const { data, error } = await supabase
    .from('tracked_queries')
    .insert({
      user_id: user.id,
      query_text: query_text.trim(),
      source: 'user-added',
      category: category || null,
      priority: priority || 'medium',
      is_active: true,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create query: ${error.message}`)
  }
  
  return successResponse(data, { created: true })
}

export const GET = withErrorHandler(handleGet)
export const POST = withErrorHandler(handlePost)

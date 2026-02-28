// ================================================
// Query Detail API Routes
// PUT /api/queries/[id] - Update query
// DELETE /api/queries/[id] - Delete query (soft delete)
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { NotFoundError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

// PUT - Update query
async function handlePut(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  const { id } = await params
  const body = await request.json()
  
  const supabase = await createClient()
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('tracked_queries')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (!existing) {
    throw new NotFoundError('Query not found')
  }
  
  // Update query
  const updateData: any = {}
  if (body.query_text !== undefined) updateData.query_text = body.query_text
  if (body.is_active !== undefined) updateData.is_active = body.is_active
  if (body.priority !== undefined) updateData.priority = body.priority
  if (body.category !== undefined) updateData.category = body.category
  
  const { data, error } = await supabase
    .from('tracked_queries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update query: ${error.message}`)
  }
  
  return successResponse(data)
}

// DELETE - Soft delete query
async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  const { id } = await params
  
  const supabase = await createClient()
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('tracked_queries')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (!existing) {
    throw new NotFoundError('Query not found')
  }
  
  // Soft delete by setting is_active = false
  const { error } = await supabase
    .from('tracked_queries')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) {
    throw new Error(`Failed to delete query: ${error.message}`)
  }
  
  return successResponse({ id, deleted: true })
}

export const PUT = withErrorHandler(handlePut)
export const DELETE = withErrorHandler(handleDelete)

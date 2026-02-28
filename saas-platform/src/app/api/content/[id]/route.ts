// ================================================
// Content Detail API
// GET /api/content/[id] - Get single content
// PUT /api/content/[id] - Update content (favorite, rating)
// DELETE /api/content/[id] - Delete content
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { NotFoundError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

// GET - Get single content
async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  const { id } = await params
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('content_generations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (error || !data) {
    throw new NotFoundError('Content not found')
  }
  
  return successResponse(data)
}

// PUT - Update content (favorite, rating)
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
    .from('content_generations')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (!existing) {
    throw new NotFoundError('Content not found')
  }
  
  // Update allowed fields only
  const updateData: any = {}
  if (body.is_favorite !== undefined) updateData.is_favorite = body.is_favorite
  if (body.user_rating !== undefined) updateData.user_rating = body.user_rating
  
  const { data, error } = await supabase
    .from('content_generations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update content: ${error.message}`)
  }
  
  return successResponse(data)
}

// DELETE - Delete content
async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  const { id } = await params
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('content_generations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    throw new Error(`Failed to delete content: ${error.message}`)
  }
  
  return successResponse({ id, deleted: true })
}

export const GET = withErrorHandler(handleGet)
export const PUT = withErrorHandler(handlePut)
export const DELETE = withErrorHandler(handleDelete)

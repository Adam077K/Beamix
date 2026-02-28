// ================================================
// Recommendation Detail API
// PUT /api/recommendations/[id] - Update recommendation status
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { NotFoundError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  const { id } = await params
  const body = await request.json()
  
  const supabase = await createClient()
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('recommendations')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (!existing) {
    throw new NotFoundError('Recommendation not found')
  }
  
  // Update status
  const { data, error } = await supabase
    .from('recommendations')
    .update({
      status: body.status,
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update recommendation: ${error.message}`)
  }
  
  return successResponse(data)
}

export const PUT = withErrorHandler(handler)

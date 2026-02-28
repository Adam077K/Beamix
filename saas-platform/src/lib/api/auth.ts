// ================================================
// API Authentication Middleware
// ================================================

import { createClient } from '@/lib/supabase/server'
import { UnauthorizedError } from './errors'

export interface AuthenticatedUser {
  id: string
  email: string
}

/**
 * Get authenticated user from request
 * Throws UnauthorizedError if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new UnauthorizedError('Authentication required')
  }

  return {
    id: user.id,
    email: user.email!,
  }
}

/**
 * Check if user has sufficient credits
 */
export async function checkCredits(userId: string, required: number): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('credits')
    .select('total_credits')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.total_credits >= required
}

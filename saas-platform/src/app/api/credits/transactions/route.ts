// ================================================
// Credits Transactions API
// GET /api/credits/transactions
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  
  // Get pagination parameters
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '20')
  
  const supabase = await createClient()
  
  // Get total count
  const { count } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  // Get paginated transactions
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id, transaction_type, amount, balance_after, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)
  
  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }
  
  return successResponse({
    transactions: data || [],
    pagination: {
      page,
      per_page,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / per_page),
    },
  })
}

export const GET = withErrorHandler(handler)

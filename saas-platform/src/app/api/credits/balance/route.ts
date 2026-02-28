// ================================================
// Credits Balance API
// GET /api/credits/balance
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  
  // Get credit balance
  const { data: credits, error: creditsError } = await supabase
    .from('credits')
    .select('total_credits, monthly_allocation, rollover_credits, bonus_credits, last_reset_date')
    .eq('user_id', user.id)
    .single()
  
  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_tier')
    .eq('user_id', user.id)
    .single()
  
  if (creditsError || !credits) {
    // Return default if no credits record exists
    return successResponse({
      credits_remaining: 0,
      credits_total: 0,
      monthly_allocation: 0,
      rollover_credits: 0,
      bonus_credits: 0,
      reset_date: null,
      tier: subscription?.plan_tier || 'starter',
    })
  }
  
  // Calculate next reset date (same day next month)
  const nextResetDate = credits.last_reset_date
    ? new Date(new Date(credits.last_reset_date).setMonth(new Date(credits.last_reset_date).getMonth() + 1))
    : null
  
  return successResponse({
    credits_remaining: credits.total_credits,
    credits_total: credits.monthly_allocation,
    monthly_allocation: credits.monthly_allocation,
    rollover_credits: credits.rollover_credits,
    bonus_credits: credits.bonus_credits,
    reset_date: nextResetDate?.toISOString() || null,
    tier: subscription?.plan_tier || 'starter',
  })
}

export const GET = withErrorHandler(handler)

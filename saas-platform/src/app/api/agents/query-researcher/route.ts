// ================================================
// Query Researcher Agent API
// POST /api/agents/query-researcher
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser, checkCredits } from '@/lib/api/auth'
import { InsufficientCreditsError, BadRequestError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

const QUERY_RESEARCHER_COST = 1 // credits

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const body = await request.json()
  
  const { industry, location, focus_areas } = body
  
  // Get user's industry and company info if not provided
  const supabase = await createClient()
  
  const { data: userProfile } = await supabase
    .from('users')
    .select('industry, company_name')
    .eq('id', user.id)
    .single()
  
  const effectiveIndustry = industry || userProfile?.industry
  const effectiveLocation = location || 'global'
  
  if (!effectiveIndustry) {
    throw new BadRequestError('Industry is required')
  }
  
  // Check credits
  const hasCredits = await checkCredits(user.id, QUERY_RESEARCHER_COST)
  if (!hasCredits) {
    throw new InsufficientCreditsError(
      `Query Researcher requires ${QUERY_RESEARCHER_COST} credit. Please add credits to continue.`
    )
  }
  
  // Create agent execution record
  const { data: execution, error: executionError } = await supabase
    .from('agent_executions')
    .insert({
      user_id: user.id,
      agent_type: 'query_researcher',
      input_params: {
        industry: effectiveIndustry,
        location: effectiveLocation,
        focus_areas: focus_areas || [],
      },
      status: 'pending',
    })
    .select()
    .single()
  
  if (executionError) {
    throw new Error(`Failed to create execution: ${executionError.message}`)
  }
  
  // Get n8n webhook URL
  const webhookUrl = process.env.N8N_QUERY_RESEARCHER_WEBHOOK
  
  if (!webhookUrl) {
    throw new Error('Query Researcher webhook not configured')
  }
  
  // Trigger n8n workflow
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        execution_id: execution.id,
        user_id: user.id,
        industry: effectiveIndustry,
        location: effectiveLocation,
        focus_areas: focus_areas || [],
        company_name: userProfile?.company_name,
      }),
    }).catch((err) => {
      console.error('[Query Researcher] Webhook trigger failed:', err)
    })
  } catch (err) {
    console.error('[Query Researcher] Failed to trigger workflow:', err)
  }
  
  return successResponse({
    execution_id: execution.id,
    status: 'processing',
    estimated_completion: '2-5 minutes',
  })
}

export const POST = withErrorHandler(handler)

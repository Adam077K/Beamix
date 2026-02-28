// ================================================
// Competitor Research Agent API
// POST /api/agents/competitor-research
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser, checkCredits } from '@/lib/api/auth'
import { InsufficientCreditsError, BadRequestError, NotFoundError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

const COMPETITOR_RESEARCH_COST = 2 // credits

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const body = await request.json()
  
  const { competitor_id } = body
  
  // Validate input
  if (!competitor_id) {
    throw new BadRequestError('Competitor ID is required')
  }
  
  // Check credits
  const hasCredits = await checkCredits(user.id, COMPETITOR_RESEARCH_COST)
  if (!hasCredits) {
    throw new InsufficientCreditsError(
      `Competitor Research requires ${COMPETITOR_RESEARCH_COST} credits. Please add credits to continue.`
    )
  }
  
  const supabase = await createClient()
  
  // Verify competitor belongs to user
  const { data: competitor, error: competitorError } = await supabase
    .from('competitor_tracking')
    .select('id, competitor_name, competitor_website')
    .eq('id', competitor_id)
    .eq('user_id', user.id)
    .single()
  
  if (competitorError || !competitor) {
    throw new NotFoundError('Competitor not found')
  }
  
  // Create agent execution record
  const { data: execution, error: executionError } = await supabase
    .from('agent_executions')
    .insert({
      user_id: user.id,
      agent_type: 'competitor_research',
      input_params: {
        competitor_id,
        competitor_name: competitor.competitor_name,
        competitor_website: competitor.competitor_website,
      },
      status: 'pending',
    })
    .select()
    .single()
  
  if (executionError) {
    throw new Error(`Failed to create execution: ${executionError.message}`)
  }
  
  // Get n8n webhook URL
  const webhookUrl = process.env.N8N_COMPETITOR_RESEARCH_WEBHOOK
  
  if (!webhookUrl) {
    throw new Error('Competitor Research webhook not configured')
  }
  
  // Trigger n8n workflow
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        execution_id: execution.id,
        user_id: user.id,
        competitor_id,
        competitor_name: competitor.competitor_name,
        competitor_website: competitor.competitor_website,
      }),
    }).catch((err) => {
      console.error('[Competitor Research] Webhook trigger failed:', err)
    })
  } catch (err) {
    console.error('[Competitor Research] Failed to trigger workflow:', err)
  }
  
  return successResponse({
    execution_id: execution.id,
    status: 'processing',
    estimated_completion: '2-5 minutes',
  })
}

export const POST = withErrorHandler(handler)

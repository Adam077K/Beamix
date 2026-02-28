// ================================================
// Content Writer Agent API
// POST /api/agents/content-writer
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser, checkCredits } from '@/lib/api/auth'
import { InsufficientCreditsError, BadRequestError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

const CONTENT_WRITER_COST = 3 // credits

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const body = await request.json()
  
  const { topic, content_type, tone, length } = body
  
  // Validate input
  if (!topic || topic.trim().length < 10) {
    throw new BadRequestError('Topic must be at least 10 characters')
  }
  
  // Check credits
  const hasCredits = await checkCredits(user.id, CONTENT_WRITER_COST)
  if (!hasCredits) {
    throw new InsufficientCreditsError(
      `Content Writer requires ${CONTENT_WRITER_COST} credits. Please add credits to continue.`
    )
  }
  
  const supabase = await createClient()
  
  // Create agent execution record
  const { data: execution, error: executionError } = await supabase
    .from('agent_executions')
    .insert({
      user_id: user.id,
      agent_type: 'content_writer',
      input_params: {
        topic: topic.trim(),
        content_type: content_type || 'article',
        tone: tone || 'professional',
        length: length || 'medium',
      },
      status: 'pending',
    })
    .select()
    .single()
  
  if (executionError) {
    throw new Error(`Failed to create execution: ${executionError.message}`)
  }
  
  // Get n8n webhook URL from environment
  const webhookUrl = process.env.N8N_CONTENT_WRITER_WEBHOOK
  
  if (!webhookUrl) {
    throw new Error('Content Writer webhook not configured')
  }
  
  // Trigger n8n workflow (fire and forget)
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        execution_id: execution.id,
        user_id: user.id,
        topic: topic.trim(),
        content_type: content_type || 'article',
        tone: tone || 'professional',
        length: length || 'medium',
      }),
    }).catch((err) => {
      console.error('[Content Writer] Webhook trigger failed:', err)
    })
  } catch (err) {
    console.error('[Content Writer] Failed to trigger workflow:', err)
  }
  
  // Return execution ID immediately (async processing)
  return successResponse({
    execution_id: execution.id,
    status: 'processing',
    estimated_completion: '2-5 minutes',
  })
}

export const POST = withErrorHandler(handler)

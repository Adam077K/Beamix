// ================================================
// Onboarding Complete API
// POST /api/onboarding/complete
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { BadRequestError } from '@/lib/api/errors'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  const user = await getAuthenticatedUser()
  const body = await request.json()
  
  const { company_name, industry, website_url, location } = body
  
  // Validate required fields
  if (!company_name || !industry) {
    throw new BadRequestError('Company name and industry are required')
  }
  
  const supabase = await createClient()
  
  // Update user profile
  const { error: updateError } = await supabase
    .from('users')
    .update({
      company_name: company_name.trim(),
      industry: industry.trim(),
      website_url: website_url?.trim() || null,
      onboarding_completed: true,
    })
    .eq('id', user.id)
  
  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }
  
  // Trigger Initial Analysis workflow
  const webhookUrl = process.env.N8N_INITIAL_ANALYSIS_WEBHOOK
  
  if (webhookUrl) {
    try {
      // Fire and forget - don't wait for response
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          company_name: company_name.trim(),
          industry: industry.trim(),
          location: location || 'global',
          website_url: website_url?.trim() || null,
        }),
      }).catch((err) => {
        console.error('[Onboarding] Initial Analysis webhook failed:', err)
      })
    } catch (err) {
      console.error('[Onboarding] Failed to trigger Initial Analysis:', err)
    }
  }
  
  return successResponse({
    onboarding_completed: true,
    initial_analysis_triggered: !!webhookUrl,
  })
}

export const POST = withErrorHandler(handler)

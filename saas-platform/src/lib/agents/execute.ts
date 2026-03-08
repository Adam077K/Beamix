import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'
import { AGENT_CONFIG, isPlanSufficient } from './config'
import { generateMockOutput, type AgentOutput } from './mock-outputs'

/**
 * Shared Zod schema for agent execution input.
 */
export const agentInputSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(500),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional().default('professional'),
  targetLength: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  language: z.enum(['en', 'he']).optional().default('en'),
  targetKeyword: z.string().max(100).optional(),
})

export type AgentInput = z.infer<typeof agentInputSchema>

/**
 * Shared agent execution handler.
 * Implements the 10-step pattern for all agent types.
 */
export async function executeAgent(slug: string, request: Request): Promise<NextResponse> {
  const config = AGENT_CONFIG[slug]
  if (!config) {
    return NextResponse.json({ error: 'Unknown agent type' }, { status: 404 })
  }

  // 1. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Plan tier check
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_tier, status')
    .eq('user_id', user.id)
    .single()

  const userPlan = subscription?.plan_tier ?? 'free'
  const subStatus = subscription?.status ?? 'active'

  if (subStatus !== 'active' && subStatus !== 'trialing') {
    return NextResponse.json(
      { error: 'Your subscription is not active. Please update your billing.' },
      { status: 403 }
    )
  }

  if (!isPlanSufficient(userPlan, config.minPlan)) {
    return NextResponse.json(
      { error: `This agent requires the ${config.minPlan} plan or higher. You are on the ${userPlan} plan.` },
      { status: 403 }
    )
  }

  // 3. Credits check
  const { data: credits } = await supabase
    .from('credit_pools')
    .select('base_allocation, topup_amount, rollover_amount, used_amount')
    .eq('user_id', user.id)
    .single()

  const totalCredits = credits
    ? (credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount)
    : 0

  if (totalCredits < config.cost) {
    return NextResponse.json(
      { error: `Not enough credits. You need ${config.cost} but have ${totalCredits}.` },
      { status: 402 }
    )
  }

  // 4. Validate input
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = agentInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const input = parsed.data

  // Look up business context
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, website_url, industry, location')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Primary business not found. Complete onboarding first.' }, { status: 400 })
  }

  const businessId = business.id
  const businessName = business.name

  // 5. Insert agent_jobs record (status='pending')
  const startedAt = new Date().toISOString()
  const { data: execution, error: execError } = await supabase
    .from('agent_jobs')
    .insert({
      user_id: user.id,
      business_id: businessId,
      agent_type: config.dbType,
      status: 'pending',
      input_params: {
        topic: input.topic,
        tone: input.tone,
        targetLength: input.targetLength,
        language: input.language,
        targetKeyword: input.targetKeyword,
      },
      credits_cost: config.cost,
      llm_calls_count: 0,
      started_at: startedAt,
    })
    .select('id')
    .single()

  if (execError || !execution) {
    return NextResponse.json({ error: 'Failed to create execution record' }, { status: 500 })
  }

  // 6. Deduct credits BEFORE running the agent (prevent race condition)
  const { data: deducted } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: config.cost,
    p_agent_job_id: execution.id,
    p_pool_type: 'agent',
    p_description: `${config.name} execution`,
  })

  if (!deducted) {
    await supabase
      .from('agent_jobs')
      .update({ status: 'failed', error_message: 'Credit deduction failed' })
      .eq('id', execution.id)

    return NextResponse.json(
      { error: 'Credit deduction failed. You may not have enough credits.' },
      { status: 402 }
    )
  }

  // 7. Run mock agent
  const agentOutput: AgentOutput = generateMockOutput(config.dbType, {
    businessName,
    businessUrl: business?.website_url ?? undefined,
    industry: business?.industry ?? undefined,
    location: business?.location ?? undefined,
    userPrompt: input.topic,
  })

  const completedAt = new Date().toISOString()
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

  // 8. Update agent_jobs status = 'completed'
  await supabase
    .from('agent_jobs')
    .update({
      status: 'completed',
      output_data: agentOutput as unknown as Json,
      completed_at: completedAt,
      runtime_ms: durationMs,
    })
    .eq('id', execution.id)

  // 9. Insert into content_items (structured output is stored in agent_jobs.output_data)
  if (agentOutput.type === 'content' && config.producesContent) {
    await supabase.from('content_items').insert({
      agent_job_id: execution.id,
      user_id: user.id,
      business_id: businessId,
      agent_type: config.dbType,
      title: agentOutput.title,
      content: agentOutput.content,
      content_format: config.contentFormat ?? 'markdown',
      word_count: agentOutput.wordCount,
      metadata: {
        tone: input.tone,
        targetLength: input.targetLength,
        language: input.language,
        targetKeyword: input.targetKeyword,
      },
    })
  }
  // Structured outputs (type === 'structured') are already stored
  // in agent_jobs.output_data (set above in step 8).

  // 10. Return result
  return NextResponse.json({
    execution_id: execution.id,
    status: 'completed',
    agent_type: config.dbType,
    credits_cost: config.cost,
    output: agentOutput,
  })
}

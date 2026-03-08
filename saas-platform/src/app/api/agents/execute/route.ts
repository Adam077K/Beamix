import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'
import {
  generateMockOutput,
  AGENT_CREDIT_COSTS,
} from '@/lib/agents/mock-outputs'

const VALID_AGENT_TYPES = [
  'content_writer',
  'blog_writer',
  'faq_agent',
  'review_analyzer',
  'schema_optimizer',
  'social_strategy',
  'competitor_intelligence',
] as const

const ExecuteSchema = z.object({
  agentType: z.enum(VALID_AGENT_TYPES),
  prompt: z.string().min(1).max(2000),
  businessId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ExecuteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { agentType, prompt, businessId } = parsed.data
  const creditCost = AGENT_CREDIT_COSTS[agentType] ?? 3

  // Verify business belongs to user
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, website_url, industry, location')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (bizErr || !business) {
    return NextResponse.json(
      { error: 'Business not found or unauthorized' },
      { status: 404 }
    )
  }

  // Check credit balance
  const { data: credits } = await supabase
    .from('credit_pools')
    .select('base_allocation, topup_amount, rollover_amount, used_amount')
    .eq('user_id', user.id)
    .single()

  const available = credits
    ? (credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount)
    : 0

  if (!credits || available < creditCost) {
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        required: creditCost,
        available,
      },
      { status: 402 }
    )
  }

  // Create execution record as pending
  const { data: execution, error: execErr } = await supabase
    .from('agent_jobs')
    .insert({
      user_id: user.id,
      business_id: businessId,
      agent_type: agentType,
      status: 'pending',
      input_params: { prompt, businessName: business.name } as Json,
      credits_cost: creditCost,
      llm_calls_count: 0,
    })
    .select('id')
    .single()

  if (execErr || !execution) {
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    )
  }

  // Deduct credits via DB function
  const { data: deducted } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: creditCost,
    p_agent_job_id: execution.id,
    p_pool_type: 'agent',
    p_description: `${agentType} agent execution`,
  })

  if (!deducted) {
    // Credit deduction failed — cancel execution
    await supabase
      .from('agent_jobs')
      .update({ status: 'failed', error_message: 'Credit deduction failed' })
      .eq('id', execution.id)

    return NextResponse.json(
      { error: 'Credit deduction failed' },
      { status: 402 }
    )
  }

  // Generate mock output (in production, this would be async LLM calls)
  const startedAt = new Date().toISOString()
  const output = generateMockOutput(agentType, {
    businessName: business.name,
    businessUrl: business.website_url ?? undefined,
    industry: business.industry ?? undefined,
    location: business.location ?? undefined,
    userPrompt: prompt,
  })

  // Store content output in content_items table
  if (output.type === 'content') {
    const { error: contentErr } = await supabase
      .from('content_items')
      .insert({
        agent_job_id: execution.id,
        user_id: user.id,
        business_id: businessId,
        agent_type: agentType,
        title: output.title,
        content: output.content,
        content_format: output.format,
        word_count: output.wordCount,
        metadata: { prompt, agentType } as Json,
      })

    if (contentErr) {
      await supabase
        .from('agent_jobs')
        .update({
          status: 'failed',
          error_message: `Failed to store content: ${contentErr.message}`,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id)

      return NextResponse.json(
        { error: 'Failed to store agent output' },
        { status: 500 }
      )
    }
  }
  // Structured outputs are stored in agent_jobs.output_data (set below)

  // Mark execution as completed
  const completedAt = new Date().toISOString()
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

  await supabase
    .from('agent_jobs')
    .update({
      status: 'completed',
      output_data: (output.type === 'content'
        ? { title: output.title, wordCount: output.wordCount, format: output.format }
        : { title: output.title, summary: output.summary, data: output.data }) as Json,
      started_at: startedAt,
      completed_at: completedAt,
      runtime_ms: durationMs,
    })
    .eq('id', execution.id)

  return NextResponse.json({
    executionId: execution.id,
    status: 'completed',
    agentType,
    creditsCharged: creditCost,
    output: {
      type: output.type,
      title: output.title,
      ...(output.type === 'content'
        ? {
            content: output.content,
            format: output.format,
            wordCount: output.wordCount,
          }
        : {
            summary: output.summary,
            data: output.data,
          }),
    },
  })
}

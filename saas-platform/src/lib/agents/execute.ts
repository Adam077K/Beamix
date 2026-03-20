import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'
import { AGENT_CONFIG, isPlanSufficient, UNLIMITED_DAILY_LIMITS } from './config'
import type { AgentOutput } from './mock-outputs'
import { holdCredits, confirmCredits, releaseCredits, InsufficientCreditsError } from './credit-guard'
import { runAgentLLM } from './llm-runner'
import { runQAGate } from './qa-gate'

/** Scan data context passed to agents for scan-aware content generation */
export interface ScanContext {
  visibilityScore?: number | null
  engineMentions?: Array<{ engine: string; mentioned: boolean; position: number | null; sentiment: string | null }>
  topCompetitors?: Array<{ name: string; score: number }>
  brandAttributes?: { associated_qualities?: string[]; missing_qualities?: string[] }
  quickWins?: Array<{ title: string; description: string }>
}

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
 * Uses hold/confirm/release credit pattern for safe deduction.
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

  // 3. Credits / rate-limit check
  if (config.isUnlimited) {
    // Unlimited agents: check daily rate limit instead of credits
    const dailyLimit = UNLIMITED_DAILY_LIMITS[userPlan] ?? UNLIMITED_DAILY_LIMITS.starter ?? 10
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('agent_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('agent_type', config.dbType)
      .gte('created_at', todayStart.toISOString())

    if ((todayCount ?? 0) >= dailyLimit) {
      return NextResponse.json(
        { error: `Daily limit reached for ${config.name}. You can run it up to ${dailyLimit} times per day. Resets at midnight.` },
        { status: 429 }
      )
    }
  } else {
    // Premium agents: check AI Runs balance
    const { data: credits } = await supabase
      .from('credit_pools')
      .select('base_allocation, topup_amount, rollover_amount, used_amount, held_amount')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false })
      .limit(1)
      .single()

    const availableCredits = credits
      ? (credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount - (credits.held_amount ?? 0))
      : 0

    if (availableCredits < config.cost) {
      return NextResponse.json(
        { error: `Not enough AI Runs. You need ${config.cost} but have ${availableCredits}. Upgrade your plan for more runs.` },
        { status: 402 }
      )
    }
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

  // Sanitize topic and targetKeyword to prevent prompt injection (strip system-level formatting)
  const rawInput = parsed.data
  const input = {
    ...rawInput,
    topic: rawInput.topic.replace(/```/g, '').replace(/^(system|user|assistant):/gim, '').trim(),
    targetKeyword: rawInput.targetKeyword
      ? rawInput.targetKeyword.replace(/```/g, '').replace(/^(system|user|assistant):/gim, '').trim()
      : undefined,
  }

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

  // Fetch latest scan data for agent context (scan-aware agents)
  let scanContext: ScanContext | undefined
  {
    const { data: latestScan } = await supabase
      .from('scans')
      .select('overall_score, results_summary')
      .eq('business_id', businessId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (latestScan?.results_summary && typeof latestScan.results_summary === 'object') {
      const rd = latestScan.results_summary as Record<string, unknown>
      scanContext = {
        visibilityScore: latestScan.overall_score ?? (rd.visibility_score as number | undefined),
        engineMentions: Array.isArray(rd.engines)
          ? (rd.engines as Array<Record<string, unknown>>).map((e) => ({
              engine: String(e.engine ?? ''),
              mentioned: Boolean(e.is_mentioned),
              position: (e.mention_position as number | null) ?? null,
              sentiment: (e.sentiment as string | null) ?? null,
            }))
          : undefined,
        topCompetitors: Array.isArray(rd.leaderboard)
          ? (rd.leaderboard as Array<Record<string, unknown>>)
              .filter((e) => !e.is_user)
              .slice(0, 5)
              .map((e) => ({ name: String(e.name ?? ''), score: Number(e.score ?? 0) }))
          : undefined,
        brandAttributes: rd.brand_attributes as { associated_qualities?: string[]; missing_qualities?: string[] } | undefined,
        quickWins: Array.isArray(rd.quick_wins)
          ? (rd.quick_wins as Array<Record<string, unknown>>).map((w) => ({
              title: String(w.title ?? ''),
              description: String(w.description ?? ''),
            }))
          : undefined,
      }
    }
  }

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

  // 6. Hold credits BEFORE running the agent (skip for unlimited agents)
  if (!config.isUnlimited) {
    try {
      await holdCredits(user.id, config.dbType, execution.id)
    } catch (err) {
      await supabase
        .from('agent_jobs')
        .update({ status: 'failed', error_message: 'Credit hold failed' })
        .eq('id', execution.id)

      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: 'Not enough AI Runs to use this agent.' },
          { status: 402 }
        )
      }
      return NextResponse.json({ error: 'Failed to reserve credits' }, { status: 500 })
    }
  }

  // 7. Run real LLM agent
  let agentOutput: AgentOutput
  try {
    agentOutput = await runAgentLLM(
      config,
      {
        name: businessName,
        websiteUrl: business.website_url ?? undefined,
        industry: business.industry ?? undefined,
        location: business.location ?? undefined,
        scanData: scanContext,
      },
      input,
    )
  } catch (err) {
    // Release credits on failure so they're not locked
    if (!config.isUnlimited) {
      await releaseCredits(execution.id)
    }
    await supabase
      .from('agent_jobs')
      .update({ status: 'failed', error_message: String(err) })
      .eq('id', execution.id)
    console.error('[executeAgent] LLM execution failed:', err)
    return NextResponse.json(
      { error: config.isUnlimited ? 'Agent execution failed. Please try again.' : 'Agent execution failed. Your AI Run has been refunded.' },
      { status: 500 },
    )
  }

  const completedAt = new Date().toISOString()
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()

  // QA gate (Fix LG-2): run for content-type outputs, warn but never block the agent
  let qaScore: number | undefined
  if (agentOutput.type === 'content') {
    try {
      const qaResult = await runQAGate(agentOutput.content, { businessName })
      qaScore = qaResult.score
      if (!qaResult.passed) {
        console.warn(
          `[executeAgent] QA gate did not pass for job ${execution.id}. Score: ${qaResult.score}/100`,
        )
      }
    } catch (qaErr) {
      console.warn('[executeAgent] QA gate threw, skipping:', qaErr)
    }
  }

  // Steps 8-10 wrapped in try/catch so credits are released on any post-LLM failure
  try {
    // 8. Update agent_jobs status = 'completed'
    // qa_score column may not exist in DB yet — ignore column errors gracefully
    const jobUpdate: Record<string, unknown> = {
      status: 'completed',
      output_data: agentOutput as unknown as Json,
      completed_at: completedAt,
      runtime_ms: durationMs,
    }
    if (qaScore !== undefined) {
      jobUpdate.qa_score = qaScore
    }
    await supabase.from('agent_jobs').update(jobUpdate).eq('id', execution.id)

    // 9. Insert into content_items (for content-producing agents)
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
    // Structured outputs are stored in agent_jobs.output_data (set in step 8).

    // 10. Confirm credits after successful completion (skip for unlimited agents)
    if (!config.isUnlimited) {
      await confirmCredits(execution.id)
    }
  } catch (postErr) {
    // Release credits so they are not locked permanently
    if (!config.isUnlimited) {
      await releaseCredits(execution.id)
    }
    await supabase
      .from('agent_jobs')
      .update({ status: 'failed', error_message: String(postErr) })
      .eq('id', execution.id)
    console.error('[executeAgent] Post-LLM step failed, credits released:', postErr)
    return NextResponse.json(
      { error: 'Failed to save agent output. Credits have been refunded.' },
      { status: 500 },
    )
  }

  // Return result
  return NextResponse.json({
    execution_id: execution.id,
    status: 'completed',
    agent_type: config.dbType,
    credits_cost: config.cost,
    output: agentOutput,
  })
}

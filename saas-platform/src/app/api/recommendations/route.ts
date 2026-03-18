import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentClient, MODELS } from '@/lib/openrouter'

// ---------------------------------------------------------------------------
// GET — fetch existing recommendations
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  let query = supabase
    .from('recommendations')
    .select(
      'id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    const validStatuses = ['pending', 'in_progress', 'done', 'dismissed'] as const
    const statusList = status.split(',').filter((s): s is typeof validStatuses[number] =>
      (validStatuses as readonly string[]).includes(s)
    )
    if (statusList.length > 0) {
      query = query.in('status', statusList)
    }
  }

  if (priority) {
    const validPriorities = ['high', 'medium', 'low'] as const
    const priorityList = priority.split(',').filter((p): p is typeof validPriorities[number] =>
      (validPriorities as readonly string[]).includes(p)
    )
    if (priorityList.length > 0) {
      query = query.in('priority', priorityList)
    }
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// ---------------------------------------------------------------------------
// POST — generate new recommendations from latest scan data (A4 agent)
// ---------------------------------------------------------------------------

interface GeneratedRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  recommendation_type: string
  suggested_agent: string | null
  credits_cost: number
  effort: string
  impact: string
  evidence: string
}

export async function POST(_request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch primary business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, website_url, industry, location')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Primary business not found. Complete onboarding first.' }, { status: 400 })
  }

  // Fetch latest scan results
  const { data: latestScan } = await supabase
    .from('scans')
    .select('id, overall_score, created_at')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Deduplication: if recommendations already exist for this scan, return them immediately
  if (latestScan) {
    const { data: existing } = await supabase
      .from('recommendations')
      .select('id')
      .eq('user_id', user.id)
      .eq('scan_id', latestScan.id)
      .limit(1)

    if (existing && existing.length > 0) {
      const { data: allExisting } = await supabase
        .from('recommendations')
        .select('id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at')
        .eq('user_id', user.id)
        .eq('scan_id', latestScan.id)
        .order('created_at', { ascending: false })
      return NextResponse.json(allExisting ?? [], { status: 200 })
    }
  }

  const { data: engineResults } = latestScan
    ? await supabase
        .from('scan_engine_results')
        .select('engine, is_mentioned, rank_position, sentiment_score')
        .eq('scan_id', latestScan.id)
    : { data: [] }

  // Build scan context for the prompt
  const scanContext = latestScan
    ? `Overall visibility score: ${latestScan.overall_score ?? 'N/A'}/100
Engine results:
${(engineResults ?? []).map((r) => `- ${r.engine}: ${r.is_mentioned ? `mentioned (rank ${r.rank_position ?? '?'}, sentiment ${r.sentiment_score ?? '?'}/100)` : 'NOT mentioned'}`).join('\n')}`
    : 'No scan data available yet.'

  // Generate recommendations using Claude Haiku via OpenRouter
  if (!(process.env.OPENROUTER_AGENT_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const client = getAgentClient()
  const location = business.location ? ` in ${business.location}` : ''
  const industry = business.industry ?? 'local business'

  const prompt = `You are an AI search optimization strategist. Based on the scan data below, generate 4-5 prioritized recommendations for improving ${business.name}'s visibility in AI search engines (ChatGPT, Gemini, Perplexity).

Business: ${business.name} — ${industry}${location}
Website: ${business.website_url ?? 'N/A'}

Current AI Visibility Scan:
${scanContext}

Return ONLY a JSON array with this exact structure (no other text):
[
  {
    "title": "Short action title (max 60 chars)",
    "description": "2-3 sentence explanation of what to do and why it matters for AI visibility",
    "priority": "high|medium|low",
    "recommendation_type": "content|technical|citation|profile|schema",
    "suggested_agent": "content_writer|blog_writer|faq_agent|schema_optimizer|null",
    "credits_cost": 1-5,
    "effort": "low|medium|high",
    "impact": "low|medium|high",
    "evidence": "One sentence citing the specific scan evidence that triggered this recommendation"
  }
]

Prioritize recommendations with the highest AI visibility impact. Focus on actionable, specific improvements.`

  let recommendations: GeneratedRecommendation[]

  try {
    const response = await client.chat.completions.create({
      model: MODELS.haiku,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse recommendations from AI' }, { status: 500 })
    }

    recommendations = JSON.parse(jsonMatch[0]) as GeneratedRecommendation[]
  } catch (err) {
    console.error('[recommendations POST] Generation failed:', err)
    return NextResponse.json({ error: 'Recommendation generation failed' }, { status: 500 })
  }

  // Store recommendations in DB
  const toInsert = recommendations.map((rec) => ({
    user_id: user.id,
    business_id: business.id,
    scan_id: latestScan?.id ?? null,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    recommendation_type: rec.recommendation_type,
    suggested_agent: rec.suggested_agent as ('content_writer' | 'blog_writer' | 'faq_agent' | 'schema_optimizer' | 'review_analyzer' | 'social_strategy' | 'competitor_intelligence' | null),
    credits_cost: rec.credits_cost,
    effort: rec.effort,
    impact: rec.impact,
    evidence: rec.evidence,
    status: 'pending' as const,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('recommendations')
    .insert(toInsert)
    .select('id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at')

  if (insertError) {
    console.error('[recommendations POST] Insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to save recommendations' }, { status: 500 })
  }

  return NextResponse.json(inserted, { status: 201 })
}

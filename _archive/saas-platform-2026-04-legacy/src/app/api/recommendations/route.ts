import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAndStoreRecommendations } from '@/lib/recommendations'

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
    const validStatuses = ['new', 'in_progress', 'completed', 'dismissed'] as const
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

  // Check API key availability
  if (!(process.env.OPENROUTER_AGENT_KEY ?? process.env.OPENROUTER_API_KEY)) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  // Fetch engine results for the scan
  const { data: engineResults } = latestScan
    ? await supabase
        .from('scan_engine_results')
        .select('engine, is_mentioned, rank_position, sentiment_score')
        .eq('scan_id', latestScan.id)
    : { data: [] }

  // Generate and store via shared function (includes Zod validation of LLM output)
  const recommendations = await generateAndStoreRecommendations({
    userId: user.id,
    businessId: business.id,
    scanData: {
      scanId: latestScan?.id ?? null,
      overallScore: latestScan?.overall_score ?? null,
      engineResults: (engineResults ?? []).map((r) => ({
        engine: r.engine,
        is_mentioned: r.is_mentioned,
        rank_position: r.rank_position,
        sentiment_score: r.sentiment_score,
      })),
    },
    business: {
      name: business.name,
      websiteUrl: business.website_url,
      industry: business.industry,
      location: business.location,
    },
    supabase,
  })

  if (recommendations.length === 0) {
    return NextResponse.json({ error: 'Recommendation generation failed' }, { status: 500 })
  }

  // Re-fetch inserted rows to return full data with IDs and timestamps
  const { data: inserted } = await supabase
    .from('recommendations')
    .select('id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at')
    .eq('user_id', user.id)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json(inserted ?? [], { status: 201 })
}

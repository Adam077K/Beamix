import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendTrialStartEmail } from '@/lib/email/events'
import { getAgentClient, MODELS } from '@/lib/openrouter'
import type { Json } from '@/lib/types/database.types'

const onboardingSchema = z.object({
  business_name: z.string().min(2).max(100),
  industry: z.string().min(1),
  location: z.string().min(2),
  url: z.string().url(),
  scan_id: z.string().optional(),
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

  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { business_name, industry, location, url, scan_id } = parsed.data

  // 1. Create primary business record.
  //    Check first so a double-submit (back button / retry) returns the
  //    existing record instead of failing with a duplicate error.
  const { data: existingBiz } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .maybeSingle()

  let business: { id: string } | null = existingBiz

  if (!existingBiz) {
    const { data: newBiz, error: bizError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: business_name,
        website_url: url,
        industry,
        location,
        is_primary: true,
      })
      .select('id')
      .single()

    if (bizError) {
      return NextResponse.json(
        { error: 'Failed to create business', details: bizError.message },
        { status: 500 }
      )
    }
    business = newBiz
  } else {
    // Update existing business with latest values
    await supabase
      .from('businesses')
      .update({ name: business_name, website_url: url, industry, location })
      .eq('id', existingBiz.id)
  }

  if (!business) {
    return NextResponse.json({ error: 'Failed to resolve business record' }, { status: 500 })
  }

  // 2. Link free scan and convert results.
  //    Priority: scan_id (if provided) → email match → skip.
  let convertedScanId: string | null = null
  {
    const serviceSupa = await createServiceClient()

    if (scan_id) {
      // scan_id path: link the specific free scan to this user
      const { data: freeScan, error: scanLinkError } = await serviceSupa
        .from('free_scans')
        .update({ converted_user_id: user.id })
        .eq('id', scan_id)
        .is('converted_user_id', null)
        .select('*')
        .single()

      if (scanLinkError) {
        // Non-fatal — business was created, scan just didn't link
        console.error('Failed to link free scan by scan_id:', scanLinkError.message)
      } else if (freeScan?.results_data && freeScan.status === 'completed') {
        convertedScanId = await convertFreeScanResults(serviceSupa, freeScan, user.id, business.id)
      }
    } else if (user.email) {
      // Email match path: find the most recent completed scan with this email
      const { data: freeScan, error: emailMatchError } = await serviceSupa
        .from('free_scans')
        .select('*')
        .eq('email', user.email)
        .is('converted_user_id', null)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (emailMatchError) {
        console.error('Failed to find free scan by email:', emailMatchError.message)
      } else if (freeScan) {
        // Link the matched scan to this user
        const { error: linkError } = await serviceSupa
          .from('free_scans')
          .update({ converted_user_id: user.id })
          .eq('id', freeScan.id)
          .is('converted_user_id', null)

        if (linkError) {
          console.error('Failed to link email-matched free scan:', linkError.message)
        } else if (freeScan.results_data) {
          convertedScanId = await convertFreeScanResults(serviceSupa, freeScan, user.id, business.id)
        }
      }
    }
  }

  // 3. Mark onboarding as completed.
  //
  //    UPSERT instead of UPDATE because the handle_new_user trigger creates
  //    user_profiles at signup, but if it didn't run (e.g. existing users,
  //    local dev without the trigger), UPDATE would match 0 rows silently,
  //    return no error, and leave onboarding_completed_at as null — causing
  //    the dashboard layout to redirect back to /onboarding forever.
  const now = new Date().toISOString()
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        onboarding_completed_at: now,
        updated_at: now,
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('Failed to upsert onboarding status:', profileError.message)
    return NextResponse.json(
      { error: 'Failed to complete onboarding', details: profileError.message },
      { status: 500 }
    )
  }

  // 4. Ensure subscription row exists with trial dates set.
  //    The trigger creates the row but leaves trial_ends_at null.
  //    Set it here so the 7-day countdown starts when onboarding completes.
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: user.id,
        status: 'trialing',
        plan_tier: null,
        trial_started_at: now,
        trial_ends_at: trialEnd,
        updated_at: now,
      },
      { onConflict: 'user_id' }
    )

  if (subError) {
    // Non-fatal — user can still reach the dashboard, trial just won't show
    console.error('Failed to upsert subscription trial:', subError.message)
  }

  // 5. Send welcome + trial-start emails (non-blocking, non-fatal)
  const userName = (user.user_metadata?.full_name as string | undefined) ?? business_name
  const userEmail = user.email

  if (userEmail) {
    // Fire both emails in parallel — failures are logged but do not block onboarding
    const emailResults = await Promise.allSettled([
      sendWelcomeEmail(userEmail, {
        name: userName,
        scanId: scan_id,
      }),
      sendTrialStartEmail(userEmail, {
        name: userName,
        planName: 'Starter',
        trialEndDate: new Date(trialEnd).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        unlockedFeatures: [
          'AI visibility scanning across 3 engines',
          'Smart recommendations',
          '5 AI agent credits',
          'Weekly digest reports',
        ],
      }),
    ])

    for (const result of emailResults) {
      if (result.status === 'rejected') {
        console.error('[ONBOARDING] Email send failed:', result.reason)
      } else if (!result.value.success) {
        console.error('[ONBOARDING] Email send error:', result.value.error)
      }
    }
  }

  // Fire-and-forget: generate recommendations from scan data (non-blocking)
  if (convertedScanId) {
    generateRecommendationsAsync(user.id, business.id, convertedScanId, supabase).catch((err) =>
      console.error('[ONBOARDING] Recommendation generation failed (non-blocking):', err)
    )
  }

  const response = NextResponse.json({ success: true, business_id: business.id })
  response.cookies.set('beamix-onboarding-complete', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // must be readable by middleware
    sameSite: 'lax',
  })
  return response
}

interface FreeScanRow {
  id: string
  website_url: string
  business_name: string
  industry: string
  location: string
  overall_score: number | null
  results_data: Json | null
  status: string
}

interface FreeScanEngineResult {
  engine: string
  is_mentioned: boolean
  mention_position: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  competitors_mentioned: string[]
  response_snippet: string
}

 
type SupabaseClient = Awaited<ReturnType<typeof createServiceClient>>

async function convertFreeScanResults(
  supabase: SupabaseClient,
  freeScan: FreeScanRow,
  userId: string,
  businessId: string
): Promise<string | null> {
  if (!freeScan.results_data || typeof freeScan.results_data !== 'object' || Array.isArray(freeScan.results_data)) return null
  const resultsData = freeScan.results_data as Record<string, Json | undefined>

  let queryId: string | null = null
  let scanResultId: string | null = null

  try {
    // Create a tracked query for the free scan
    const { data: query, error: queryError } = await supabase
      .from('tracked_queries')
      .insert({
        user_id: userId,
        business_id: businessId,
        query_text: `AI visibility scan for ${freeScan.business_name}`,
        query_category: 'general',
        target_url: freeScan.website_url,
        priority: 'high' as const,
      })
      .select('id')
      .single()

    if (queryError || !query) {
      console.error('Failed to create tracked query:', queryError?.message)
      return null
    }
    queryId = query.id

    // Create scan_result
    const rawEngines = resultsData.engines
    const engines = (Array.isArray(rawEngines) ? rawEngines : []) as unknown as FreeScanEngineResult[]
    const mentionCount = engines.filter((e) => e.is_mentioned).length
    const { data: scanResult, error: scanError } = await supabase
      .from('scans')
      .insert({
        query_id: query.id,
        user_id: userId,
        business_id: businessId,
        scan_type: 'free' as const,
        overall_score: freeScan.overall_score,
        mentions_count: mentionCount,
      })
      .select('id')
      .single()

    if (scanError || !scanResult) {
      console.error('Failed to create scan result:', scanError?.message)
      return null
    }
    scanResultId = scanResult.id

    // Create scan_result_details for each engine
    const engineMap: Record<string, string> = {
      chatgpt: 'chatgpt',
      gemini: 'gemini',
      perplexity: 'perplexity',
      claude: 'claude',
      google_ai_overviews: 'google_ai_overviews',
    }

    const details = engines
      .filter((e) => engineMap[e.engine])
      .map((e) => ({
        scan_id: scanResult.id,
        business_id: businessId,
        engine: engineMap[e.engine],
        is_mentioned: e.is_mentioned,
        rank_position: e.mention_position,
        sentiment: e.sentiment,
      }))

    if (details.length > 0) {
      const { error: detailsError } = await supabase
        .from('scan_engine_results')
        .insert(details)

      if (detailsError) {
        console.error('Failed to create scan result details:', detailsError.message)
      }
    }
  } catch (err) {
    console.error('convertFreeScanResults failed:', err)
    // Attempt cleanup: delete the scan_result if it was created (details cascade or orphan)
    if (scanResultId) {
      const { error: cleanupScanErr } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanResultId)
      if (cleanupScanErr) {
        console.error('Cleanup: failed to delete scan_result:', cleanupScanErr.message)
      }
    }
    // Attempt cleanup: delete the tracked_query if it was created
    if (queryId) {
      const { error: cleanupQueryErr } = await supabase
        .from('tracked_queries')
        .delete()
        .eq('id', queryId)
      if (cleanupQueryErr) {
        console.error('Cleanup: failed to delete tracked_query:', cleanupQueryErr.message)
      }
    }
    return null
  }

  return scanResultId
}

/**
 * Generate AI recommendations from scan results (non-blocking).
 * Called after free scan conversion during onboarding.
 */
async function generateRecommendationsAsync(
  userId: string,
  businessId: string,
  scanId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const apiKey = process.env.OPENROUTER_AGENT_KEY ?? process.env.OPENROUTER_API_KEY
  if (!apiKey) return

  // Fetch business + scan + engine results
  const [{ data: business }, { data: scan }, { data: engineResults }] = await Promise.all([
    supabase.from('businesses').select('name, website_url, industry, location').eq('id', businessId).single(),
    supabase.from('scans').select('id, overall_score').eq('id', scanId).single(),
    supabase.from('scan_engine_results').select('engine, is_mentioned, rank_position, sentiment_score').eq('scan_id', scanId),
  ])

  if (!business || !scan) return

  // Check deduplication
  const { data: existing } = await supabase
    .from('recommendations')
    .select('id')
    .eq('user_id', userId)
    .eq('scan_id', scanId)
    .limit(1)
  if (existing && existing.length > 0) return

  const scanContext = `Overall visibility score: ${scan.overall_score ?? 'N/A'}/100
Engine results:
${(engineResults ?? []).map((r) => `- ${r.engine}: ${r.is_mentioned ? `mentioned (rank ${r.rank_position ?? '?'})` : 'NOT mentioned'}`).join('\n')}`

  const location = business.location ? ` in ${business.location}` : ''
  const industry = business.industry ?? 'local business'

  const client = getAgentClient()
  const response = await client.chat.completions.create({
    model: MODELS.haiku,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are an AI search optimization strategist. Based on the scan data below, generate 4-5 prioritized recommendations for improving ${business.name}'s visibility in AI search engines.

Business: ${business.name} — ${industry}${location}
Website: ${business.website_url ?? 'N/A'}

Current AI Visibility Scan:
${scanContext}

Return ONLY a JSON array with this exact structure (no other text):
[{"title":"Short action title","description":"2-3 sentence explanation","priority":"high|medium|low","recommendation_type":"content|technical|citation|profile|schema","suggested_agent":"content_writer|blog_writer|faq_agent|schema_optimizer|null","credits_cost":1,"effort":"low|medium|high","impact":"low|medium|high","evidence":"One sentence citing scan evidence"}]`
    }],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return

  const recs = JSON.parse(jsonMatch[0]) as Array<{
    title: string; description: string; priority: string
    recommendation_type: string; suggested_agent: string | null
    credits_cost: number; effort: string; impact: string; evidence: string
  }>

  const toInsert = recs.map((rec) => ({
    user_id: userId,
    business_id: businessId,
    scan_id: scanId,
    title: rec.title,
    description: rec.description,
    priority: rec.priority as 'high' | 'medium' | 'low',
    recommendation_type: rec.recommendation_type as 'content' | 'technical' | 'citation' | 'profile' | 'schema',
    suggested_agent: rec.suggested_agent as 'content_writer' | 'blog_writer' | 'faq_agent' | 'schema_optimizer' | null,
    credits_cost: rec.credits_cost,
    effort: rec.effort as 'low' | 'medium' | 'high',
    impact: rec.impact as 'low' | 'medium' | 'high',
    evidence: rec.evidence,
    status: 'new' as const,
  }))

  if (toInsert.length > 0) {
    await supabase.from('recommendations').insert(toInsert)
  }
}

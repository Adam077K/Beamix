import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, PLAN_FEATURES, COMPETITOR_LIMITS, getDailyCapUsage } from '@/lib/plan/features'

const DAILY_CAP_AGENTS = [
  'schema_generator',
  'faq_builder',
  'offsite_presence_builder',
  'performance_tracker',
] as const

export async function GET() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }, { status: 401 })
  }

  const tier = await getUserTier(user.id)
  const features = tier ? PLAN_FEATURES[tier] : null
  const competitorLimit = tier ? COMPETITOR_LIMITS[tier] : 0
  const dailyCaps = DAILY_CAP_AGENTS.map(agentType => ({
    agentType,
    cap: getDailyCapUsage(tier, agentType),
  }))

  return NextResponse.json({
    planTier: tier,
    features,
    competitorLimit,
    dailyCaps,
  })
}

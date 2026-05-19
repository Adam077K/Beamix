import type { PlanTier } from '@/lib/types/shared'
import { createClient } from '@/lib/supabase/server'

export type FeatureKey =
  | 'blog_strategist'
  | 'automation'
  | 'bulk_approve'
  | 'competitors_page'
  | 'max_schedules'
  | 'blog_cap'

export type PlanFeatures = {
  blog_strategist: boolean
  automation: boolean
  bulk_approve: boolean
  competitors_page: boolean
  max_schedules: number  // -1 means unlimited
  blog_cap?: number
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  discover: { blog_strategist: false, automation: false, bulk_approve: false, competitors_page: false, max_schedules: 0 },
  build:    { blog_strategist: true,  automation: true,  bulk_approve: false, competitors_page: true,  max_schedules: 3 },
  scale:    { blog_strategist: true,  automation: true,  bulk_approve: true,  competitors_page: true,  max_schedules: -1, blog_cap: 40 },
}

export const COMPETITOR_LIMITS: Record<PlanTier, number> = {
  discover: 3,
  build: 5,
  scale: 20,
}

export async function getUserTier(userId: string): Promise<PlanTier | null> {
  const supabase = (await createClient()) as any
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .maybeSingle()
  if (!sub) return null
  if (sub.status !== 'active' && sub.status !== 'trialing') return null
  return (sub.plan_id ?? null) as PlanTier | null
}

export async function canAccess(userId: string, feature: FeatureKey): Promise<boolean> {
  const tier = await getUserTier(userId)
  if (!tier) return false
  const features = PLAN_FEATURES[tier]
  const val = features[feature]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  return false
}

export function canAccessSync(tier: PlanTier | null, feature: FeatureKey): boolean {
  if (!tier) return false
  const val = PLAN_FEATURES[tier][feature]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  return false
}

export function getDailyCapUsage(tier: PlanTier | null, agentType: string): number | null {
  // Daily caps by agent type per tier — matches DB seed.
  const caps: Record<string, Record<PlanTier, number | null>> = {
    schema_generator:          { discover: 20, build: 20, scale: 20 },
    faq_builder:               { discover: 3,  build: 5,  scale: 10 },
    offsite_presence_builder:  { discover: 3,  build: 5,  scale: 10 },
    performance_tracker:       { discover: null, build: null, scale: null },
  }
  if (!tier) return 0
  return caps[agentType]?.[tier] ?? null
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActionCenterView } from '@/components/dashboard/action-center-view'

export default async function ActionCenterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: recommendations },
    { data: creditPool },
    { data: recentJobs },
    { data: business },
  ] = await Promise.all([
    supabase
      .from('recommendations')
      .select(
        'id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('credit_pools')
      .select('base_allocation, topup_amount, rollover_amount, used_amount')
      .eq('user_id', user.id)
      .eq('pool_type', 'monthly')
      .single(),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('businesses')
      .select('name, website_url, industry, services')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
  ])

  const pool = creditPool
  const totalCredits = pool
    ? Math.max(0, pool.base_allocation + pool.topup_amount + pool.rollover_amount - pool.used_amount)
    : 0
  const usedCredits = pool?.used_amount ?? 0

  return (
    <ActionCenterView
      recommendations={recommendations ?? []}
      recentJobs={recentJobs ?? []}
      totalCredits={totalCredits}
      usedCredits={usedCredits}
      businessName={business?.name ?? 'My Business'}
      industry={business?.industry ?? null}
    />
  )
}

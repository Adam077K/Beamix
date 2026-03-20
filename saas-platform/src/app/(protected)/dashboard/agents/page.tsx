import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgentsView } from '@/components/dashboard/agents-view'

export default async function AgentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [creditsResult, recentExecutionsResult] = await Promise.all([
    supabase
      .from('credit_pools')
      .select('base_allocation, topup_amount, rollover_amount, used_amount')
      .eq('user_id', user.id)
      .eq('pool_type', 'monthly')
      .single(),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, credits_cost, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <AgentsView
      totalCredits={creditsResult.data ? (creditsResult.data.base_allocation + creditsResult.data.topup_amount + creditsResult.data.rollover_amount - creditsResult.data.used_amount) : 0}
      recentExecutions={recentExecutionsResult.data ?? []}
    />
  )
}

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
      .from('credits')
      .select('total_credits')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('agent_executions')
      .select('id, agent_type, status, credits_charged, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <AgentsView
      totalCredits={creditsResult.data?.total_credits ?? 0}
      recentExecutions={recentExecutionsResult.data ?? []}
    />
  )
}

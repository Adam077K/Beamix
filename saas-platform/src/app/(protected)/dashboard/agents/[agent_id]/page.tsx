import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AgentChatView } from '@/components/dashboard/agent-chat-view'

const VALID_AGENTS = [
  'content_writer',
  'blog_writer',
  'faq_agent',
  'review_analyzer',
  'schema_optimizer',
  'social_strategy',
  'competitor_intelligence',
]

export default async function AgentChatPage({
  params,
}: {
  params: Promise<{ agent_id: string }>
}) {
  const { agent_id } = await params

  if (!VALID_AGENTS.includes(agent_id)) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [businessResult, creditsResult, existingJobResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, website_url, industry, services')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('credit_pools')
      .select('base_allocation, topup_amount, rollover_amount, used_amount')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('agent_jobs')
      .select('id, status, agent_type, created_at')
      .eq('user_id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('agent_type', agent_id as any)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const business = businessResult.data
  const credits = creditsResult.data
  const totalCredits = credits
    ? credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount
    : 0

  return (
    <AgentChatView
      agentType={agent_id}
      agentId={agent_id}
      businessName={business?.name ?? 'My Business'}
      businessUrl={business?.website_url ?? null}
      industry={business?.industry ?? null}
      services={Array.isArray(business?.services) ? (business.services as string[]) : []}
      existingJob={existingJobResult.data ?? null}
      totalCredits={totalCredits}
    />
  )
}

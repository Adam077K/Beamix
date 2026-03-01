import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AgentChatView } from '@/components/dashboard/agent-chat-view'

const VALID_AGENTS = [
  'content_writer',
  'blog_writer',
  'review_analyzer',
  'schema_optimizer',
  'social_strategy',
  'competitor_research',
  'query_researcher',
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

  const [businessResult, creditsResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, website_url, industry, location')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('credits')
      .select('total_credits')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <AgentChatView
      agentType={agent_id}
      businessName={businessResult.data?.name ?? 'My Business'}
      businessId={businessResult.data?.id ?? ''}
      totalCredits={creditsResult.data?.total_credits ?? 0}
    />
  )
}

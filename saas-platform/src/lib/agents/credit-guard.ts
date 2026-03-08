import { createClient } from '@supabase/supabase-js'

export class InsufficientCreditsError extends Error {
  constructor() {
    super('Insufficient credits')
    this.name = 'InsufficientCreditsError'
  }
}

const AGENT_COSTS: Record<string, number> = {
  content_writer: 2,
  blog_writer: 3,
  schema_optimizer: 1,
  recommendations: 1,
  faq_agent: 1,
  review_analyzer: 2,
  social_strategy: 2,
  competitor_intelligence: 2,
  citation_builder: 2,
  llms_txt: 1,
  ai_readiness: 1,
  content_voice_trainer: 1,
  content_pattern_analyzer: 1,
  content_refresh: 1,
  brand_narrative_analyst: 2,
}

export function getAgentCreditCost(agentType: string): number {
  return AGENT_COSTS[agentType] || 1
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function holdCredits(userId: string, agentType: string): Promise<string> {
  const supabase = getServiceClient()
  const cost = getAgentCreditCost(agentType)
  const { data, error } = await supabase.rpc('hold_credits', {
    p_user_id: userId,
    p_amount: cost,
  })
  if (error || !data) throw new InsufficientCreditsError()
  return data as string
}

export async function confirmCredits(holdId: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('confirm_credits', { p_hold_id: holdId })
  if (error) console.error('confirm_credits error:', error)
}

export async function releaseCredits(holdId: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('release_credits', { p_hold_id: holdId })
  if (error) console.error('release_credits error:', error)
}

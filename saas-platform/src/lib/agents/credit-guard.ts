import { createClient } from '@supabase/supabase-js'
import { AGENT_CONFIG } from './config'

export class InsufficientCreditsError extends Error {
  constructor() {
    super('Insufficient credits')
    this.name = 'InsufficientCreditsError'
  }
}

function getAgentCreditCost(agentType: string): number {
  // Find config entry by dbType (underscore form) — config keys are slug form
  const entry = Object.values(AGENT_CONFIG).find((c) => c.dbType === agentType)
  return entry?.cost ?? 1
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Hold credits for an in-progress agent job.
 * The jobId serves as the hold reference — pass it to confirmCredits/releaseCredits.
 */
export async function holdCredits(userId: string, agentType: string, jobId: string): Promise<void> {
  const supabase = getServiceClient()
  const cost = getAgentCreditCost(agentType)
  const { data, error } = await supabase.rpc('hold_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_job_id: jobId,
  })

  if (error) {
    // RPC-level error (network, missing function, etc.) — not a credit issue
    console.error('[holdCredits] RPC error:', error)
    throw new Error(`Credit hold failed: ${error.message}`)
  }

  const result = data as { success: boolean; error?: string } | null
  if (!result?.success) {
    // Explicit insufficient credits returned from the DB function
    if (result?.error === 'insufficient_credits') {
      throw new InsufficientCreditsError()
    }
    throw new Error(`Credit hold returned failure: ${result?.error ?? 'unknown'}`)
  }
}

/**
 * Confirm held credits after successful agent completion.
 * Moves held credits to consumed — idempotent.
 */
export async function confirmCredits(jobId: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('confirm_credits', { p_job_id: jobId })
  if (error) console.error('confirm_credits error:', error)
}

/**
 * Release held credits after agent failure or cancellation.
 * Returns held credits to available balance — idempotent.
 */
export async function releaseCredits(jobId: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('release_credits', { p_job_id: jobId })
  if (error) console.error('release_credits error:', error)
}

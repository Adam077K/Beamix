/**
 * credit-guard.ts — Credit hold / confirm / release wrappers.
 *
 * The hold_credits RPC uses SELECT FOR UPDATE internally — race conditions
 * are handled DB-side. Callers must always confirm OR release after hold.
 */

import { createClient } from '@/lib/supabase/server';

export async function holdCredits(
  userId: string,
  _agentType: string,
  jobId: string,
  amount: number,
): Promise<{ held: boolean; reason?: string }> {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase.rpc('hold_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_job_id: jobId,
  });
  if (error) return { held: false, reason: error.message };
  if (!data) return { held: false, reason: 'insufficient credits' };
  return { held: true };
}

export async function confirmCredits(jobId: string): Promise<void> {
  const supabase = (await createClient()) as any;
  const { error } = await supabase.rpc('confirm_credits', { p_job_id: jobId });
  if (error) throw new Error(`confirm_credits: ${error.message}`);
}

export async function releaseCredits(jobId: string): Promise<void> {
  const supabase = (await createClient()) as any;
  const { error } = await supabase.rpc('release_credits', { p_job_id: jobId });
  if (error) throw new Error(`release_credits: ${error.message}`);
}

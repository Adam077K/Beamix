/**
 * Beamix Agent System — Credit Guard
 *
 * Thin, typed wrappers over the DB credit RPCs (`hold_credits`, `confirm_credits`,
 * `release_credits`). Per `12-AGENT-BUILD-SPEC.md` §Credit System Integration:
 *
 *   - The `jobId` IS the hold reference — there is no separate `holdId`.
 *   - `hold_credits` is TOCTOU-safe (`SELECT … FOR UPDATE` inside the RPC, H1 fix)
 *     and returns `{ held: bool, reason: text }` so callers branch deterministically.
 *   - Free agents (`creditCost === 0`) skip the credit hold entirely — they are gated
 *     by the daily-cap layer instead.
 */

import { getAdminClient } from '../db/admin-client';
import { getAgentConfig } from '../config/registry';
import { InsufficientCreditsError } from '../errors';
import type { AgentType } from '../types';

/** Shape of the JSON returned by the `hold_credits` RPC. */
interface HoldResult {
  held: boolean;
  reason: string;
}

/**
 * Hold credits before starting the pipeline. Throws `InsufficientCreditsError` if the
 * credit pool cannot cover the agent's `creditCost`. No-op for free agents.
 *
 * @param userId    Owner of the credit pool.
 * @param agentType Determines `creditCost` via the registry.
 * @param jobId     `agent_jobs.id` — doubles as the hold reference.
 */
export async function holdCredits(
  userId: string,
  agentType: AgentType,
  jobId: string,
): Promise<void> {
  const config = getAgentConfig(agentType);
  if (config.isFree) return;

  const { data, error } = await getAdminClient().rpc('hold_credits', {
    p_user_id: userId,
    p_agent_type: agentType,
    p_amount: config.creditCost,
    p_job_id: jobId,
  });

  if (error) {
    throw new Error(`hold_credits RPC failed for job ${jobId}: ${error.message}`);
  }

  const result = (data ?? { held: false, reason: 'rpc returned null' }) as unknown as HoldResult;
  if (!result.held) {
    throw new InsufficientCreditsError(agentType, jobId);
  }
}

/**
 * Confirm a hold after a successful pipeline run — moves the held credits into
 * `used_amount`. No-op for free agents (nothing was held).
 */
export async function confirmCredits(jobId: string, agentType: AgentType): Promise<void> {
  if (getAgentConfig(agentType).isFree) return;

  const { error } = await getAdminClient().rpc('confirm_credits', { p_job_id: jobId });
  if (error) {
    throw new Error(`confirm_credits RPC failed for job ${jobId}: ${error.message}`);
  }
}

/**
 * Release a hold on failure — restores the held credits to the pool. No-op for free
 * agents. Safe to call even if no hold exists (the RPC is idempotent on missing holds).
 */
export async function releaseCredits(jobId: string, agentType: AgentType): Promise<void> {
  if (getAgentConfig(agentType).isFree) return;

  const { error } = await getAdminClient().rpc('release_credits', { p_job_id: jobId });
  if (error) {
    throw new Error(`release_credits RPC failed for job ${jobId}: ${error.message}`);
  }
}

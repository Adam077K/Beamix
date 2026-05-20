/**
 * Beamix Agent System — Daily Cap Middleware
 *
 * The enforcement hook the API route layer (Wave 1 BE-3) calls before enqueuing an
 * agent job. Wave 1 TRIGGERS this — it does NOT edit the cap files. Daily-cap
 * enforcement is fully owned by the agent system (Worker 2).
 *
 * `enforceDailyCap` is a guard: it resolves silently when the run is allowed, and
 * throws `CapExceededError` when the user has hit their daily cap. Credit-gated
 * agents (`null` cap) always pass — their throttle is the credit pool.
 */

import { checkDailyCap } from '../credits/daily-cap';
import { getAgentConfig } from '../config/registry';
import { CapExceededError } from '../errors';
import type { AgentType, PlanTier, DailyCapStatus } from '../types';

/** Outcome of a non-throwing daily-cap pre-check. */
export interface DailyCapDecision {
  allowed: boolean;
  status: DailyCapStatus;
  /** Human-readable reason when `allowed` is false — surfaced in the API response. */
  reason?: string;
}

/**
 * Enforce the daily cap for an agent run. Resolves silently if the run is permitted;
 * throws `CapExceededError` if the cap is reached. Intended to be `await`-ed inside an
 * API route handler before the Inngest event is sent.
 *
 * @param userId    The user attempting the run.
 * @param agentType The agent being run.
 * @param planTier  The user's current plan tier.
 * @param jobId     Optional `agent_jobs.id` — attached to the thrown error for tracing.
 */
export async function enforceDailyCap(
  userId: string,
  agentType: AgentType,
  planTier: PlanTier,
  jobId = '',
): Promise<void> {
  // `checkDailyCap` throws `CapExceededError` itself when the cap is reached.
  await checkDailyCap(userId, agentType, planTier, jobId);
}

/**
 * Non-throwing variant. Returns a `DailyCapDecision` so an API route can render an
 * inline "cap reached" state instead of surfacing an exception. Use this for the
 * pre-flight UI check; use `enforceDailyCap` for the hard gate at run time.
 */
export async function checkDailyCapDecision(
  userId: string,
  agentType: AgentType,
  planTier: PlanTier,
): Promise<DailyCapDecision> {
  try {
    const status = await checkDailyCap(userId, agentType, planTier);
    return { allowed: true, status };
  } catch (err) {
    if (err instanceof CapExceededError) {
      const cap = err.capStatus.cap;
      return {
        allowed: false,
        status: err.capStatus,
        reason:
          cap === null
            ? 'Daily cap reached.'
            : `Daily cap reached — ${err.capStatus.usedToday}/${cap} runs used today. Resets at midnight UTC.`,
      };
    }
    throw err;
  }
}

/**
 * Returns `true` if the agent is subject to a finite daily cap on the given tier.
 * Credit-gated agents (`null` cap) return `false` — the API layer skips the cap check
 * for them and relies on the credit guard instead.
 */
export function isDailyCapped(agentType: AgentType, planTier: PlanTier): boolean {
  return getAgentConfig(agentType).dailyCap[planTier] !== null;
}

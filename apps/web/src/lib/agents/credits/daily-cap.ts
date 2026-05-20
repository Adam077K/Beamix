/**
 * Beamix Agent System — Daily Cap Enforcement
 *
 * Free agents (`creditCost === 0`) are unlimited but daily-capped per tier. This module
 * reads and writes the `daily_cap_usage` table, keyed by `(user_id, agent_type,
 * usage_date)`. The counter resets at midnight UTC — a fresh `usage_date` row is
 * created lazily on the first run of a new day.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Daily Cap Enforcement. Credit-gated agents always have
 * a `null` cap (unlimited) — their throttle is the credit pool, not the daily cap.
 */

import { getAdminClient } from '../db/admin-client';
import { getAgentConfig } from '../config/registry';
import { CapExceededError } from '../errors';
import type { AgentType, PlanTier, DailyCapStatus } from '../types';

/** Today's date as a `YYYY-MM-DD` string in UTC. */
function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Check whether the user has remaining daily-cap budget for this agent. Returns the
 * current `DailyCapStatus`. Throws `CapExceededError` when the cap has been reached.
 *
 * For agents with a `null` cap on the user's tier, this resolves immediately with
 * `cap: null, capReached: false` — no DB read needed.
 */
export async function checkDailyCap(
  userId: string,
  agentType: AgentType,
  planTier: PlanTier,
  jobId = '',
): Promise<DailyCapStatus> {
  const config = getAgentConfig(agentType);
  const cap = config.dailyCap[planTier];

  if (cap === null) {
    return { agentType, planTier, usedToday: 0, cap: null, capReached: false };
  }

  const { data, error } = await getAdminClient()
    .from('daily_cap_usage')
    .select('used_today')
    .eq('user_id', userId)
    .eq('agent_type', agentType)
    .eq('usage_date', utcDateKey())
    .maybeSingle();

  if (error) {
    throw new Error(`daily_cap_usage read failed for user ${userId}: ${error.message}`);
  }

  const usedToday = data?.used_today ?? 0;
  const capReached = usedToday >= cap;
  const status: DailyCapStatus = { agentType, planTier, usedToday, cap, capReached };

  if (capReached) {
    throw new CapExceededError(agentType, jobId, status);
  }
  return status;
}

/**
 * Increment the daily-cap usage counter for a free agent. Called after a successful
 * DO step. No-op for agents with a `null` cap on the user's tier.
 *
 * Uses an upsert keyed by `(user_id, agent_type, usage_date)` so the first run of a
 * day creates the row and subsequent runs increment it.
 */
export async function incrementDailyCap(
  userId: string,
  agentType: AgentType,
  planTier: PlanTier,
): Promise<void> {
  const config = getAgentConfig(agentType);
  const cap = config.dailyCap[planTier];
  if (cap === null) return;

  const client = getAdminClient();
  const today = utcDateKey();

  // Read-modify-write. `daily_cap_usage` carries a unique constraint on
  // `(user_id, agent_type, usage_date)` so a concurrent double-run will collide on
  // upsert and the loser's increment is folded in on the next read.
  const { data, error: readError } = await client
    .from('daily_cap_usage')
    .select('used_today')
    .eq('user_id', userId)
    .eq('agent_type', agentType)
    .eq('usage_date', today)
    .maybeSingle();

  if (readError) {
    throw new Error(`daily_cap_usage read failed for user ${userId}: ${readError.message}`);
  }

  const nextCount = (data?.used_today ?? 0) + 1;
  const { error: writeError } = await client
    .from('daily_cap_usage')
    .upsert(
      {
        user_id: userId,
        agent_type: agentType,
        usage_date: today,
        used_today: nextCount,
        daily_cap: cap,
      },
      { onConflict: 'user_id,agent_type,usage_date' },
    );

  if (writeError) {
    throw new Error(`daily_cap_usage upsert failed for user ${userId}: ${writeError.message}`);
  }
}

/**
 * Read-only daily-cap status without throwing. Used by the API layer to render the
 * "X of Y runs left today" indicator before a run is attempted.
 */
export async function getDailyCapStatus(
  userId: string,
  agentType: AgentType,
  planTier: PlanTier,
): Promise<DailyCapStatus> {
  try {
    return await checkDailyCap(userId, agentType, planTier);
  } catch (err) {
    if (err instanceof CapExceededError) {
      return err.capStatus;
    }
    throw err;
  }
}

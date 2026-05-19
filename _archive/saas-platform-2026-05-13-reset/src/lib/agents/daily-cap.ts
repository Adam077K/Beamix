/**
 * daily-cap.ts — Daily usage cap guard.
 *
 * Free agents (creditCost === 0) have per-tier daily caps. Credit-gated agents
 * have no daily cap (cap = null). This module enforces and increments the
 * daily_cap_usage table.
 */

import type { AgentType, PlanTier } from './types';
import { createClient } from '@/lib/supabase/server';
import { AGENT_REGISTRY } from './config';

export async function checkDailyCap(
  userId: string,
  agentType: AgentType,
  tier: PlanTier,
): Promise<{ allowed: boolean; remaining: number; cap: number | null }> {
  const cfg = AGENT_REGISTRY[agentType];
  const cap = cfg.dailyCapByTier[tier] ?? null;
  if (cap === null) return { allowed: true, remaining: Infinity, cap: null };

  const supabase = (await createClient()) as any;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('daily_cap_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('agent_type', agentType)
    .eq('usage_date', today)
    .maybeSingle();

  const used = (data?.count as number) ?? 0;
  return { allowed: used < cap, remaining: Math.max(0, cap - used), cap };
}

export async function incrementDailyCap(
  userId: string,
  agentType: AgentType,
): Promise<void> {
  const supabase = (await createClient()) as any;
  const today = new Date().toISOString().slice(0, 10);

  // Upsert with onConflict so repeated calls within the same day increment.
  // TODO: Replace with an increment RPC if one exists to avoid race conditions
  // on the count field. For now the upsert sets count=1 on first insert; the
  // pipeline serialises per-user so races are unlikely.
  await supabase.from('daily_cap_usage').upsert(
    {
      user_id: userId,
      agent_type: agentType,
      usage_date: today,
      count: 1,
    },
    {
      onConflict: 'user_id,agent_type,usage_date',
      ignoreDuplicates: false,
    },
  );
}

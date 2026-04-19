import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTier, getDailyCapUsage } from '@/lib/plan/features';

const UNAUTHENTICATED = {
  error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
} as const;

const AGENT_TYPES = [
  'schema_generator',
  'faq_builder',
  'offsite_presence_builder',
  'performance_tracker',
] as const;

function getNextMidnightUtc(): string {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return next.toISOString();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json(UNAUTHENTICATED, { status: 401 });
  }

  const tier = await getUserTier(user.id);
  const nextMidnightUtc = getNextMidnightUtc();

  const { data: pool } = await (supabase as any)
    .from('credit_pools')
    .select('base_allocation, rollover_amount, topup_amount, used_amount')
    .eq('user_id', user.id)
    .maybeSingle();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: capRows } = await (supabase as any)
    .from('daily_cap_usage')
    .select('agent_type, used')
    .eq('user_id', user.id)
    .gte('date', todayStart.toISOString());

  const capUsageMap: Record<string, number> = {};
  for (const row of capRows ?? []) {
    capUsageMap[row.agent_type] = (capUsageMap[row.agent_type] ?? 0) + (row.used ?? 0);
  }

  return NextResponse.json({
    balance: {
      runsUsedThisMonth: pool?.used_amount ?? 0,
      runsCapThisMonth:
        (pool?.base_allocation ?? 0) +
        (pool?.rollover_amount ?? 0) +
        (pool?.topup_amount ?? 0),
      rolloverAmount: pool?.rollover_amount ?? 0,
      topupAmount: pool?.topup_amount ?? 0,
      planTier: tier,
    },
    dailyCapStatus: AGENT_TYPES.map((agentType) => ({
      agentType,
      used: capUsageMap[agentType] ?? 0,
      cap: getDailyCapUsage(tier, agentType),
      resetsAt: nextMidnightUtc,
    })),
  });
}

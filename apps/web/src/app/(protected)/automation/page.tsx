import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { AutomationStatus, AutomationSchedule, AutomationRecentRun } from '@/lib/types/shared'
import { AutomationClient } from '@/components/automation/AutomationClient'
import { Button } from '@/components/ui/button'

// Map DB automation_configs row → AutomationSchedule for the client
function mapDbRowToSchedule(row: Record<string, unknown>): AutomationSchedule {
  const isPaused = row['paused_at'] != null || row['is_active'] === false
  return {
    id: String(row['id']),
    userId: String(row['user_id']),
    agentType: row['agent_type'] as AutomationSchedule['agentType'],
    cadence: (row['cadence'] ?? 'weekly') as AutomationSchedule['cadence'],
    nextRunAt: (row['next_run_at'] as string | null) ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
    lastRunAt: (row['last_run_at'] as string | null) ?? null,
    isPaused,
    createdAt: (row['created_at'] as string | undefined) ?? undefined,
    lastRunResult: null,
    runHistory7: [],
  }
}

export default async function AutomationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

  // Parallel fetches
  const [schedulesRes, creditsRes, settingsRes, jobsRes] = await Promise.all([
    supabase
      .from('automation_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('credit_pools')
      .select('base_allocation, rollover_amount, topup_amount, used_amount')
      .eq('user_id', user.id)
      .eq('pool_type', 'monthly')
      .maybeSingle(),

    supabase
      .from('automation_settings')
      .select('automation_paused, credit_cap')
      .eq('user_id', user.id)
      .maybeSingle(),

    supabase
      .from('agent_jobs')
      .select('agent_type, status, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  // --- Schedules ---
  const schedules: AutomationSchedule[] = (schedulesRes.data ?? []).map((row) =>
    mapDbRowToSchedule(row as Record<string, unknown>)
  )

  // --- Credits ---
  const creditsRow = creditsRes.data as {
    base_allocation: number | null
    rollover_amount: number | null
    topup_amount: number | null
    used_amount: number | null
  } | null
  const usedAmount = creditsRow?.used_amount ?? 0
  const totalCap =
    (creditsRow?.base_allocation ?? 0) +
    (creditsRow?.rollover_amount ?? 0) +
    (creditsRow?.topup_amount ?? 0)
  const creditsUsedPercent = totalCap > 0 ? Math.round((usedAmount / totalCap) * 100) : 0

  // --- Kill-switch ---
  const settingsRow = settingsRes.data as { automation_paused: boolean | null } | null
  // If no row exists yet, automation is not paused
  const globalKillSwitch = settingsRow?.automation_paused ?? false

  // --- Days in billing cycle (approximate 30-day cycle) ---
  const now = new Date()
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - cycleStart.getTime()) / 86_400_000))
  const daysRemaining = Math.max(0, Math.ceil((cycleEnd.getTime() - now.getTime()) / 86_400_000))

  // --- Sparkline: daily run counts last 14 days ---
  const jobs = (jobsRes.data ?? []) as Array<{ status: string | null; created_at: string | null; agent_type: string | null }>
  const dailyRunsMap = new Map<string, number>()
  for (const job of jobs) {
    if (!job.created_at) continue
    const day = job.created_at.slice(0, 10)
    dailyRunsMap.set(day, (dailyRunsMap.get(day) ?? 0) + 1)
  }
  const dailyRunsLast14: number[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const key = d.toISOString().slice(0, 10)
    dailyRunsLast14.push(dailyRunsMap.get(key) ?? 0)
  }

  // --- Recent run history (last 10) ---
  const runHistoryRecent: AutomationRecentRun[] = jobs.slice(0, 10).map((job) => ({
    agentType: job.agent_type as AutomationRecentRun['agentType'],
    status:
      job.status === 'completed'
        ? 'success'
        : job.status === 'failed'
        ? 'failed'
        : 'skipped',
    completedAt: job.created_at ?? new Date().toISOString(),
  }))

  // Content funnel from agent_jobs statuses
  const contentFunnel = {
    draft: jobs.filter((j) => j.status === 'running').length,
    in_review: jobs.filter((j) => j.status === 'pending').length,
    approved: jobs.filter((j) => j.status === 'completed').length,
    published: 0,
  }

  const status: AutomationStatus = {
    globalKillSwitch,
    creditsUsedThisMonth: usedAmount,
    creditsCapThisMonth: totalCap,
    creditsUsedPercent,
    dailyRunsLast14,
    daysElapsed,
    daysRemaining,
    schedules,
    contentFunnel,
    runHistoryRecent,
  }

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Zap size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">No schedules yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Schedules you configure will appear here. Accept a suggestion from your inbox to get
          started.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">View suggestions</Link>
        </Button>
      </div>
    )
  }

  return <AutomationClient status={status} />
}

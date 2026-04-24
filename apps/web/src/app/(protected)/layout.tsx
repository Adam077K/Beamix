import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/shell/DashboardShell'
import { TrialBanner } from '@/components/layout/TrialBanner'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id, trial_starts_at, trial_ends_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = ((sub?.plan_id as string | undefined) ?? null) as
    | 'discover'
    | 'build'
    | 'scale'
    | null

  return (
    <>
      <TrialBanner
        planTier={plan}
        trialStartsAt={(sub?.trial_starts_at as string | null) ?? null}
        trialEndsAt={(sub?.trial_ends_at as string | null) ?? null}
      />
      <DashboardShell user={{ email: user.email! }} plan={plan ?? undefined}>
        {children}
      </DashboardShell>
    </>
  )
}

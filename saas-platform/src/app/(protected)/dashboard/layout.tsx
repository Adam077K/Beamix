import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  const [profileResult, businessResult, subscriptionResult, notificationsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('onboarding_completed_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('businesses')
      .select('name')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('subscriptions')
      .select('status, trial_ends_at, plan_tier')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('notifications')
      .select('id, title, body, type, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Only redirect to onboarding if we have a profile row AND onboarding is not completed.
  // If the query errored (e.g. network issue), do NOT redirect — let the user see the dashboard.
  if (profileResult.data && !profileResult.data.onboarding_completed_at) {
    redirect('/onboarding')
  }
  if (!profileResult.data && !profileResult.error) {
    redirect('/onboarding')
  }

  const businessName = businessResult.data?.name ?? 'My Business'
  const sub = subscriptionResult.data
  const planTier = sub?.plan_tier ?? null
  const trialEnd = sub?.trial_ends_at
  const isTrialing = sub?.status === 'trialing'

  let trialDaysLeft: number | null = null
  if (isTrialing && trialEnd) {
    const diff = new Date(trialEnd).getTime() - Date.now()
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const notifications = (notificationsResult.data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    is_read: n.is_read,
    created_at: n.created_at,
  }))

  return (
    <DashboardShell
      businessName={businessName}
      planTier={planTier ?? (isTrialing ? 'trial' : 'free')}
      trialDaysLeft={trialDaysLeft}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  )
}

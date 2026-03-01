import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

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

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Fetch sidebar data in one batch
  const [businessResult, subscriptionResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('name')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan_tier, status, trial_end')
      .eq('user_id', user.id)
      .single(),
  ])

  const businessName = businessResult.data?.name ?? 'My Business'
  const planTier = subscriptionResult.data?.plan_tier ?? 'free'
  const trialEnd = subscriptionResult.data?.trial_end
  const isTrialing = subscriptionResult.data?.status === 'trialing'

  let trialDaysLeft: number | null = null
  if (isTrialing && trialEnd) {
    const diff = new Date(trialEnd).getTime() - Date.now()
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <DashboardShell
      businessName={businessName}
      planTier={planTier}
      trialDaysLeft={trialDaysLeft}
    >
      {children}
    </DashboardShell>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // The parent (protected) layout already verifies the user via getUser()
  // and redirects to /login if unauthenticated. Use getSession() here to
  // read the user ID from the cookie without a redundant auth round-trip.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id

  // Check if onboarding is completed, and fetch sidebar data in one batch
  const [profileResult, businessResult, subscriptionResult] = await Promise.all([
    supabase
      .from('users')
      .select('onboarding_completed')
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
      .select('plan_tier, status, trial_end')
      .eq('user_id', userId)
      .single(),
  ])

  if (!profileResult.data?.onboarding_completed) {
    redirect('/onboarding')
  }

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

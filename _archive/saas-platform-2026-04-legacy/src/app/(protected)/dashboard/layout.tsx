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

  // getUser() validates the token server-side against Supabase Auth,
  // unlike getSession() which only reads the JWT from the cookie without
  // verification. Always use getUser() for auth decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  // Check if onboarding is completed, and fetch sidebar data in one batch
  const [profileResult, businessResult, subscriptionResult] = await Promise.all([
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
  ])

  if (!profileResult.data?.onboarding_completed_at) {
    redirect('/onboarding')
  }

  const businessName = businessResult.data?.name ?? 'My Business'
  const sub = subscriptionResult.data
  const planTier = sub?.plan_tier ?? null
  const trialEnd = sub?.trial_ends_at
  const isTrialing = sub?.status === 'trialing'

  let trialDaysLeft: number | null = null
  if (isTrialing && trialEnd) {
    // Server component — Date.now() is safe here (runs once per request)
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(trialEnd).getTime() - Date.now()
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <DashboardShell
      businessName={businessName}
      planTier={planTier ?? 'free'}
      trialDaysLeft={trialDaysLeft}
    >
      {children}
    </DashboardShell>
  )
}

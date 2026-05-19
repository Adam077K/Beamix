import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/settings/SettingsClient'
import type { SettingsUser } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = (await createClient()) as any

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch all 4 data sources in parallel
  const [
    { data: profile },
    { data: business },
    { data: subscription },
    { data: notifPrefs },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('businesses').select('*').eq('user_id', user.id).eq('is_primary', true).maybeSingle(),
    supabase.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).maybeSingle(),
    supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  // Map DB rows → SettingsUser shape (fall back to sensible defaults)
  const settingsUser: SettingsUser = {
    email: user.email ?? '',
    timezone: (profile as any)?.timezone ?? 'Asia/Jerusalem',
    language: ((profile as any)?.locale === 'he' ? 'he' : 'en') as 'en' | 'he',
    planTier: ((subscription as any)?.plan_tier ?? null) as SettingsUser['planTier'],
    business: {
      name: (business as any)?.name ?? '',
      url: (business as any)?.website_url ?? '',
      industry: (business as any)?.industry ?? '',
      location: (business as any)?.location ?? '',
      services: (business as any)?.services ?? [],
    },
    notifications: {
      inboxReady: (notifPrefs as any)?.inbox_ready ?? true,
      scanComplete: (notifPrefs as any)?.scan_complete ?? true,
      budgetAlerts: (notifPrefs as any)?.budget_alerts ?? true,
      competitorMovement: (notifPrefs as any)?.competitor_movement ?? false,
      dailyDigestHour: (notifPrefs as any)?.daily_digest_hour ?? 9,
    },
  }

  return <SettingsClient user={settingsUser} />
}

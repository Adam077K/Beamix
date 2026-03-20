import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScanLauncher } from './scan-launcher'

export default async function DashboardScanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, website_url, industry, location')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  if (!business) redirect('/onboarding')

  return (
    <ScanLauncher
      businessId={business.id}
      businessName={business.name}
      websiteUrl={business.website_url ?? ''}
      industry={business.industry ?? ''}
      location={business.location ?? ''}
      userId={user.id}
    />
  )
}

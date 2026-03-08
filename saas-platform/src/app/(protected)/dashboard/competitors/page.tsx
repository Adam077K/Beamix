import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompetitorsView } from '@/components/dashboard/competitors-view'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [competitorsResult, businessResult] = await Promise.all([
    supabase
      .from('competitors')
      .select('id, name, domain, source, created_at, business_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
  ])

  return (
    <CompetitorsView
      competitors={competitorsResult.data ?? []}
      businessId={businessResult.data?.id ?? null}
    />
  )
}

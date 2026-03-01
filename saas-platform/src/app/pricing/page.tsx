import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PricingPageClient } from '@/components/pricing/pricing-page-client'

export const metadata: Metadata = {
  title: 'Pricing — Beamix',
  description:
    'Start free. Upgrade when you see results. Compare Beamix plans — Starter, Pro, and Business.',
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ scan_id?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <PricingPageClient
      isLoggedIn={!!user}
      scanId={params.scan_id ?? null}
    />
  )
}

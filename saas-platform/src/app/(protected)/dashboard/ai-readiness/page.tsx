// HIDDEN: Per founder decision 2026-03-20. AI Readiness Auditor disabled until real implementation built. Navigation links removed.
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AiReadinessView } from '@/components/dashboard/ai-readiness-view'

export default async function AiReadinessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's primary business first
  const businessResult = await supabase
    .from('businesses')
    .select('id, website_url')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  // Then get latest readiness for that business
  let readinessData = null
  if (businessResult.data) {
    const readinessResult = await supabase
      .from('ai_readiness_history')
      .select('*')
      .eq('business_id', businessResult.data.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (readinessResult.data) {
      const breakdown = (readinessResult.data.score_breakdown || {}) as Record<string, unknown>
      readinessData = {
        id: readinessResult.data.id,
        user_id: user.id,
        overall_score: readinessResult.data.score,
        crawlability: breakdown.crawlability as { score: number; description: string } | null ?? null,
        schema_markup: breakdown.schema_markup as { score: number; description: string } | null ?? null,
        content_quality: breakdown.content_quality as { score: number; description: string } | null ?? null,
        faq_coverage: breakdown.faq_coverage as { score: number; description: string } | null ?? null,
        llms_txt: breakdown.llms_txt as { score: number; description: string } | null ?? null,
        created_at: readinessResult.data.recorded_at,
      }
    }
  }

  return (
    <AiReadinessView
      readiness={readinessData}
      websiteUrl={businessResult.data?.website_url ?? null}
    />
  )
}

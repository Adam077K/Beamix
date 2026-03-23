import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Lightbulb, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: recommendations }, { data: subscription }] = await Promise.all([
    supabase
      .from('recommendations')
      .select(
        'id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('plan_tier, status')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const items = recommendations ?? []

  // Show upsell only for users with no plan (free tier) or cancelled subscription.
  // Trialing users have full access during their 7-day trial — don't show upsell to them.
  const hasAccess =
    subscription?.plan_tier != null &&
    subscription.status !== 'cancelled'

  const impactClass = (impact: string | null) => {
    if (impact === 'high') return 'bg-red-100 text-red-700'
    if (impact === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  const statusClass = (status: string | null) => {
    if (status === 'pending' || status === 'new') return 'bg-muted text-muted-foreground'
    if (status === 'in_progress') return 'bg-amber-50 text-amber-700'
    if (status === 'done' || status === 'completed') return 'bg-green-50 text-[#10B981]'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recommendations"
        description="AI-powered suggestions to improve your search visibility"
      />

      {!hasAccess && (
        <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[#FF3C00]/20 bg-[#FF3C00]/5 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-5 w-5 shrink-0 text-[#FF3C00]" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Unlock more recommendations and AI agents</span>
              {' '}to improve your visibility — upgrade to a paid plan to run agents and get deeper insights.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-4 py-1.5 rounded-lg bg-[#FF3C00] text-white text-sm font-medium hover:bg-[#e03500] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
          >
            Upgrade
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-card rounded-[20px] border border-border">
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description="Run a scan to get personalized recommendations for your business."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((rec) => (
            <div
              key={rec.id}
              className="bg-card rounded-[20px] border border-border shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-foreground">{rec.title}</h3>
                    {rec.impact && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          impactClass(rec.impact),
                        )}
                      >
                        {rec.impact} impact
                      </span>
                    )}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        statusClass(rec.status),
                      )}
                    >
                      {rec.status === 'in_progress' ? 'in progress' : rec.status}
                    </span>
                    {rec.priority && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {rec.priority} priority
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{rec.description}</p>
                  {rec.evidence && (
                    <p className="text-muted-foreground text-xs mt-2">Evidence: {rec.evidence}</p>
                  )}
                </div>
                {rec.suggested_agent && (
                  <Link
                    href={`/dashboard/agents/${rec.suggested_agent}?topic=${encodeURIComponent(rec.title)}`}
                    className="ml-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Run Agent
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

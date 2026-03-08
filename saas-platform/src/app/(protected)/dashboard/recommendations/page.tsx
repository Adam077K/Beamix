import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: recommendations } = await supabase
    .from('recommendations')
    .select(
      'id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost, effort, impact, evidence, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = recommendations ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#141310] mb-6">Recommendations</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500 text-lg">No recommendations yet.</p>
          <p className="text-stone-400 mt-2">
            Run a scan to get personalized recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-stone-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[#141310]">{rec.title}</h3>
                    {rec.impact && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rec.impact === 'high'
                            ? 'bg-red-100 text-red-700'
                            : rec.impact === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {rec.impact} impact
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.status === 'pending'
                          ? 'bg-blue-100 text-blue-700'
                          : rec.status === 'in_progress'
                            ? 'bg-purple-100 text-purple-700'
                            : rec.status === 'done'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {rec.status === 'in_progress' ? 'in progress' : rec.status}
                    </span>
                    {rec.priority && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                        {rec.priority} priority
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600 text-sm">{rec.description}</p>
                  {rec.evidence && (
                    <p className="text-stone-400 text-xs mt-2">
                      Evidence: {rec.evidence}
                    </p>
                  )}
                </div>
                {rec.suggested_agent && (
                  <a
                    href="/dashboard/agents"
                    className="ml-4 px-3 py-1.5 bg-[#141310] text-white text-sm rounded-lg hover:bg-stone-800 whitespace-nowrap"
                  >
                    Run Agent
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ================================================
// Dashboard Data Hook
// ================================================

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  avg_ranking: number | null
  mention_count: number
  citation_count: number
  trend: 'up' | 'down' | 'stable'
  by_llm: Record<string, {
    avg_ranking: number | null
    mention_count: number
    citation_count: number
  }>
  date_range: string
}

export function useDashboardData(dateRange: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['dashboard', 'overview', dateRange],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }
      
      const res = await fetch(`/api/dashboard/overview?date_range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const json = await res.json()
      return json.data as DashboardData
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

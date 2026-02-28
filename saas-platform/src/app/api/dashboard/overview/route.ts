// ================================================
// Dashboard Overview API
// GET /api/dashboard/overview
// ================================================

import { NextRequest } from 'next/server'
import { successResponse, withErrorHandler } from '@/lib/api/responses'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  // Authenticate user
  const user = await getAuthenticatedUser()
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const dateRange = searchParams.get('date_range') || '30d'
  
  // Calculate date threshold
  const daysMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }
  const days = daysMap[dateRange] || 30
  
  const supabase = await createClient()
  
  // Get ranking data for the period
  const { data: rankings, error } = await supabase
    .from('llm_rankings')
    .select('llm_engine, ranking_position, is_mentioned, is_cited')
    .eq('user_id', user.id)
    .gte('checked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
  
  if (error) {
    console.error('[Dashboard API] Error fetching rankings:', error)
    // Return empty state instead of error for better UX
    return successResponse({
      avg_ranking: null,
      mention_count: 0,
      citation_count: 0,
      trend: 'stable',
      by_llm: {},
      date_range: dateRange,
    })
  }
  
  // Calculate aggregates
  const rankingsWithPosition = rankings?.filter(r => r.ranking_position !== null) || []
  const avg_ranking = rankingsWithPosition.length > 0
    ? rankingsWithPosition.reduce((sum, r) => sum + (r.ranking_position || 0), 0) / rankingsWithPosition.length
    : null
  
  const mention_count = rankings?.filter(r => r.is_mentioned).length || 0
  const citation_count = rankings?.filter(r => r.is_cited).length || 0
  
  // Group by LLM
  const by_llm: Record<string, any> = {}
  const llmEngines = ['chatgpt', 'claude', 'perplexity', 'gemini']
  
  for (const engine of llmEngines) {
    const engineRankings = rankings?.filter(r => r.llm_engine === engine) || []
    const engineRankingsWithPosition = engineRankings.filter(r => r.ranking_position !== null)
    
    by_llm[engine] = {
      avg_ranking: engineRankingsWithPosition.length > 0
        ? engineRankingsWithPosition.reduce((sum, r) => sum + (r.ranking_position || 0), 0) / engineRankingsWithPosition.length
        : null,
      mention_count: engineRankings.filter(r => r.is_mentioned).length,
      citation_count: engineRankings.filter(r => r.is_cited).length,
    }
  }
  
  // TODO: Calculate trend (requires historical data comparison)
  const trend = 'stable'
  
  return successResponse({
    avg_ranking: avg_ranking ? Math.round(avg_ranking * 100) / 100 : null,
    mention_count,
    citation_count,
    trend,
    by_llm,
    date_range: dateRange,
  })
}

export const GET = withErrorHandler(handler)

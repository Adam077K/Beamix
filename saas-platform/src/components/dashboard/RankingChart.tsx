// ================================================
// Rankings Chart Component
// ================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RankingChartProps {
  data: Record<string, {
    avg_ranking: number | null
    mention_count: number
    citation_count: number
  }>
  isLoading?: boolean
}

export function RankingChart({ data, isLoading = false }: RankingChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LLM Rankings Breakdown</CardTitle>
          <CardDescription>Average ranking position by AI engine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = Object.entries(data).map(([llm, metrics]) => ({
    name: llm.charAt(0).toUpperCase() + llm.slice(1),
    ranking: metrics.avg_ranking ? Math.round(metrics.avg_ranking * 10) / 10 : null,
    mentions: metrics.mention_count,
    citations: metrics.citation_count,
  }))

  // Check if we have data
  const hasData = chartData.some(d => d.ranking !== null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Rankings Breakdown</CardTitle>
        <CardDescription>Average ranking position by AI engine (lower is better)</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis reversed domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ranking" fill="#3b82f6" name="Avg Position" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No ranking data yet</p>
              <p className="text-sm mt-2">Complete onboarding to see your first rankings</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

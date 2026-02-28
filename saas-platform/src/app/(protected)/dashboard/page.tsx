'use client'

import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { useCreditsBalance } from '@/lib/hooks/useCredits'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { RankingChart } from '@/components/dashboard/RankingChart'
import { TrendingUp, MessageSquare, Link2, Award, Plus, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import Link from 'next/link'

type DateRange = '7d' | '30d' | '90d'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData(dateRange)
  const { data: creditsData } = useCreditsBalance()

  const dateRangeLabel = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor your AI visibility across ChatGPT, Claude, Perplexity, and Gemini
          </p>
        </div>
        
        {/* Credits Badge */}
        {creditsData && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available Credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditsData.credits_remaining}</div>
              <div className="text-xs text-gray-400">
                of {creditsData.credits_total} monthly ({creditsData.tier})
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Time period:</span>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {dateRangeLabel[range]}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Average Ranking"
          value={dashboardData?.avg_ranking !== null && dashboardData?.avg_ranking !== undefined
            ? `#${Math.round(dashboardData.avg_ranking * 10) / 10}` 
            : 'No data'
          }
          subtitle="Across all LLMs (lower is better)"
          icon={TrendingUp}
          trend={dashboardData?.trend}
          isLoading={dashboardLoading}
        />
        
        <MetricsCard
          title="Total Mentions"
          value={dashboardData?.mention_count || 0}
          subtitle={dateRangeLabel[dateRange]}
          icon={MessageSquare}
          isLoading={dashboardLoading}
        />
        
        <MetricsCard
          title="Citations with URL"
          value={dashboardData?.citation_count || 0}
          subtitle="URL references in responses"
          icon={Link2}
          isLoading={dashboardLoading}
        />
        
        <MetricsCard
          title="Best Ranking"
          value={
            dashboardData?.by_llm
              ? (() => {
                  const rankings = Object.values(dashboardData.by_llm)
                    .map(llm => llm.avg_ranking)
                    .filter((r): r is number => r !== null)
                  return rankings.length > 0 
                    ? `#${Math.round(Math.min(...rankings) * 10) / 10}`
                    : 'No data'
                })()
              : 'No data'
          }
          subtitle="Your highest performing engine"
          icon={Award}
          isLoading={dashboardLoading}
        />
      </div>

      {/* Ranking Chart */}
      <RankingChart
        data={dashboardData?.by_llm || {}}
        isLoading={dashboardLoading}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/queries">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 h-32">
              <Plus className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Add Query</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Track new search terms
              </span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/content">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 h-32">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Generate Content</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Create optimized articles
              </span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/recommendations">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 h-32">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">View Recommendations</span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                See actionable insights
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Getting Started Guide (shown when no data) */}
      {!dashboardLoading && (!dashboardData?.avg_ranking && dashboardData?.mention_count === 0) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Complete these steps to start tracking your AI visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Add queries to track</div>
                <div className="text-sm text-gray-600">
                  Add search terms relevant to your business
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Wait for initial analysis</div>
                <div className="text-sm text-gray-600">
                  We'll check your rankings across 4 LLM engines (takes 2-5 minutes)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Review recommendations</div>
                <div className="text-sm text-gray-600">
                  Get actionable insights to improve your visibility
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

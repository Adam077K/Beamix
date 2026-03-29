'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Circle,
  Calendar,
  Download,
  PlusSquare,
  Settings,
  BarChart2,
  HardDrive,
  ChevronRight,
  Database,
  Shield,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  business: { name: string; website_url: string | null; industry: string | null } | null
  credits: { base_allocation: number; topup_amount: number; rollover_amount: number; used_amount: number } | null
  scans: Array<{ id: string; overall_score: number | null; mentions_count: number | null; created_at: string; scan_type: string | null }>
  latestEngineResults: Array<{ engine: string; is_mentioned: boolean; rank_position: number | null; sentiment: string | null }>
  recommendations: Array<{ id: string; title: string; priority: string; status: string; suggested_agent: string | null }>
  recentAgentJobs: Array<{ id: string; agent_type: string; status: string; created_at: string; completed_at: string | null }>
  subscription: { plan_tier: string | null; status: string | null; trial_ends_at: string | null } | null
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  business: _business,
  credits,
  scans,
  latestEngineResults,
  recommendations,
  recentAgentJobs,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription: _subscription,
}: DashboardOverviewProps) {
  const latestScan = scans[0] ?? null
  const previousScan = scans[1] ?? null
  const score = latestScan?.overall_score ?? null
  const scoreDelta =
    latestScan?.overall_score != null && previousScan?.overall_score != null
      ? latestScan.overall_score - previousScan.overall_score
      : null

  const mentionedEngines = latestEngineResults.filter((e) => e.is_mentioned).length
  const totalEngines = latestEngineResults.length

  const creditsRemaining = credits
    ? credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount
    : null

  // Chart date labels — last 6 periods from scan data or fallback
  const chartLabels = useMemo(() => {
    if (scans.length >= 2) {
      const ordered = [...scans].reverse().slice(-6)
      return ordered.map((s) => format(new Date(s.created_at), 'dd MMM').toUpperCase())
    }
    return ['01 SEP', '07 SEP', '14 SEP', '21 SEP', '28 SEP', 'TODAY']
  }, [scans])

  // Top 2 recommendations for display
  const topRecs = recommendations.slice(0, 2)

  // Recent agent jobs mapped to activity items
  const activityItems = useMemo(() => {
    if (recentAgentJobs.length > 0) {
      return recentAgentJobs.slice(0, 4).map((job) => ({
        id: job.id,
        color:
          job.status === 'completed'
            ? '#10B981'
            : job.status === 'failed'
              ? '#EF4444'
              : '#3370FF',
        title:
          job.status === 'completed'
            ? `${job.agent_type.replace(/_/g, ' ')} completed`
            : job.status === 'failed'
              ? `${job.agent_type.replace(/_/g, ' ')} failed`
              : `${job.agent_type.replace(/_/g, ' ')} running`,
        badge:
          job.status === 'completed'
            ? { text: 'Done', color: '#10B981' }
            : job.status === 'failed'
              ? { text: 'Failed', color: '#EF4444' }
              : null,
        time: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
        detail: null as string | null,
      }))
    }
    // Default activity items matching Stitch design
    return [
      {
        id: '1',
        color: '#10B981',
        title: 'Weekly Scan Completed',
        badge: { text: 'Done', color: '#10B981' },
        time: '2 hours ago · 14,022 objects',
        detail: 'Blog: 1,240 words, quality 85',
      },
      {
        id: '2',
        color: '#EF4444',
        title: 'Competitor Track Sync',
        badge: { text: 'Failed', color: '#EF4444' },
        time: '4 hours ago · Connection timeout',
        detail: null,
      },
      {
        id: '3',
        color: '#3370FF',
        title: 'Member Added: Sarah Connor',
        badge: null,
        time: '5 hours ago · Admin Rights',
        detail: null,
      },
      {
        id: '4',
        color: '#10B981',
        title: 'Documentation Re-index',
        badge: { text: 'Done', color: '#10B981' },
        time: 'Yesterday · 45 pages updated',
        detail: null,
      },
    ]
  }, [recentAgentJobs])

  const displayScore = score ?? 72

  return (
    <div className="px-10 py-8 max-w-7xl mx-auto space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Overview</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">Your AI search visibility at a glance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
            Last 30 days
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
            Export
          </button>
        </div>
      </section>

      {/* ── Getting Started Checklist ──────────────────────────────────────── */}
      <section className="bg-white border border-[#E5E7EB] rounded-[8px] p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[13px] font-semibold">Getting Started</h2>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-[#3370FF] h-full w-1/2" />
              </div>
              <span className="text-[11px] font-medium text-[#6B7280]">2 of 4 complete</span>
            </div>
          </div>
          <button className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            Dismiss
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] fill-[#10B981] shrink-0" aria-hidden="true" />
            View your visibility score
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] fill-[#10B981] shrink-0" aria-hidden="true" />
            Read your recommendations
          </div>
          <Link href="/dashboard/action-center" className="flex items-center gap-2 text-[12px] text-[#3370FF] hover:underline">
            <Circle className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
            Run your first agent
          </Link>
          <Link href="/dashboard/rankings" className="flex items-center gap-2 text-[12px] text-[#3370FF] hover:underline">
            <Circle className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
            Track a competitor
          </Link>
        </div>
      </section>

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* AI Visibility Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">AI Visibility Score</div>
            <Info className="w-3.5 h-3.5 text-[#9CA3AF] cursor-help" aria-label="Info about visibility score" />
          </div>
          <div className="text-[40px] font-semibold tabular-nums leading-none tracking-tight">{displayScore}</div>
          <div className="mt-1 text-[11px] text-[#9CA3AF]">Industry avg: 55 · Top performer: 91</div>
          {scoreDelta !== null ? (
            <div className={cn('mt-4 flex items-center gap-2 text-[12px]', scoreDelta >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]')}>
              {scoreDelta >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {scoreDelta >= 0 ? '+' : ''}{scoreDelta}% change
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-[12px] text-[#10B981]">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              12.5% increase
            </div>
          )}
        </div>

        {/* AI Engines */}
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">AI Engines</div>
            <Info className="w-3.5 h-3.5 text-[#9CA3AF] cursor-help" aria-label="Info about AI engines" />
          </div>
          <div className="text-[40px] font-semibold tabular-nums leading-none tracking-tight text-[#3370FF]">
            {totalEngines > 0 ? `${mentionedEngines}/${totalEngines}` : '98.2'}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6B7280]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            Optimal Performance
          </div>
        </div>

        {/* Active Nodes — credits remaining */}
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6">
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Agent Credits</div>
          <div className="text-[40px] font-semibold tabular-nums leading-none tracking-tight">
            {formatNumber(creditsRemaining ?? 42)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6B7280]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            All systems operational
          </div>
        </div>

        {/* Scan Count */}
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6">
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Total Scans</div>
          <div className="text-[40px] font-semibold tabular-nums leading-none tracking-tight">
            {formatNumber(scans.length)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6B7280]">
            {latestScan ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                Last: {formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })}
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" aria-hidden="true" />
                <span className="text-[#EF4444]">No scans yet</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Two-column layout: chart+recs (8) | activity+actions (4) ─────────── */}
      <div className="grid grid-cols-12 gap-8 items-start">

        {/* Left: Chart + Recommendations */}
        <div className="col-span-12 lg:col-span-8 space-y-10">

          {/* Visibility Score Chart */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-[#111827]">Visibility Score over time</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#6B7280]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3370FF]" aria-hidden="true" />
                  Active
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#6B7280]">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200" aria-hidden="true" />
                  Benchmark
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 h-[320px] relative flex flex-col justify-between">
              {/* Agent Ran Annotation */}
              <div className="absolute top-[15%] left-[62%] z-10 flex flex-col items-center pointer-events-none">
                <div className="bg-[#111827] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-medium">Agent ran</div>
                <div className="w-px h-6 bg-[#111827] opacity-20" />
              </div>

              {/* SVG Chart */}
              <div className="flex-1 w-full relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label="Visibility score trend chart">
                  <line x1="0" x2="100" y1="10" y2="10" stroke="#F1F4F7" strokeWidth="0.2" />
                  <line x1="0" x2="100" y1="20" y2="20" stroke="#F1F4F7" strokeWidth="0.2" />
                  <line x1="0" x2="100" y1="30" y2="30" stroke="#F1F4F7" strokeWidth="0.2" />
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3370FF" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3370FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 Q10,30 20,32 T40,20 T60,25 T80,10 T100,15 L100,40 L0,40 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,35 Q10,30 20,32 T40,20 T60,25 T80,10 T100,15"
                    fill="none"
                    stroke="#3370FF"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="32" r="0.6" fill="#3370FF" />
                  <circle cx="40" cy="20" r="0.6" fill="#3370FF" />
                  <circle cx="80" cy="10" r="0.6" fill="#3370FF" />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-4 text-[11px] text-[#9CA3AF] font-medium tabular-nums">
                {chartLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Top Recommendations */}
          <section>
            <h2 className="text-sm font-semibold text-[#111827] mb-6">Top Recommendations</h2>
            <div className="grid grid-cols-1 gap-4">
              {/* Primary recommendation */}
              {topRecs.length > 0 ? (
                topRecs.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {i === 0 ? (
                          <Database className="w-5 h-5 text-[#3370FF]" aria-hidden="true" />
                        ) : (
                          <Shield className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pr-8">
                        <div className="text-[13px] font-semibold">{rec.title}</div>
                        {rec.suggested_agent && (
                          <div className="text-[12px] text-[#6B7280] leading-relaxed mt-0.5">
                            The <span className="text-[#3370FF] font-medium">{rec.suggested_agent.replace(/_/g, ' ')}</span> agent can help fix this.
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/dashboard/action-center"
                      className="text-[12px] font-semibold text-[#3370FF] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      Launch Agent →
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  {/* Fallback Stitch-design cards when no real data */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-[#3370FF]" aria-hidden="true" />
                      </div>
                      <div className="pr-8">
                        <div className="text-[13px] font-semibold">Implement Structured Schema Data</div>
                        <div className="text-[12px] text-[#6B7280] leading-relaxed mt-0.5">
                          Your website has no structured data — ChatGPT and Gemini can&apos;t understand what your business does. The{' '}
                          <span className="text-[#3370FF] font-medium">Schema Optimizer</span> can fix this in ~15 minutes.
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/action-center"
                      className="text-[12px] font-semibold text-[#3370FF] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      Launch Optimizer →
                    </Link>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">Security Patch V2.4 Deployment</div>
                        <div className="text-[12px] text-[#6B7280]">Mitigate high-risk credential vulnerability</div>
                      </div>
                    </div>
                    <button className="text-[12px] font-semibold text-[#3370FF] opacity-0 group-hover:opacity-100 transition-opacity">
                      Deploy Now →
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right: Recent Activity + Quick Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-10">

          {/* Recent Activity */}
          <section>
            <h2 className="text-sm font-semibold text-[#111827] mb-6">Recent Activity</h2>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
              <div className="p-6 space-y-6">
                {activityItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="mt-1">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-[12px] font-semibold">{item.title}</div>
                        {item.badge && (
                          <span
                            className="text-[10px] font-bold uppercase"
                            style={{ color: item.badge.color }}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] tabular-nums">{item.time}</div>
                      {item.detail && (
                        <div className="mt-1.5 p-2 bg-gray-50 rounded border border-gray-100 text-[10px] text-[#6B7280]">
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 border-t border-[#E5E7EB] text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                View Full Audit Log
              </button>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-semibold text-[#111827] mb-6">Quick Actions</h2>
            <div className="space-y-1">
              <Link
                href="/dashboard/action-center"
                className="flex items-center justify-between p-3 rounded-[6px] text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <PlusSquare className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#3370FF] transition-colors" aria-hidden="true" />
                  Create New Project
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between p-3 rounded-[6px] text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#3370FF] transition-colors" aria-hidden="true" />
                  Manage API Keys
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/rankings"
                className="flex items-center justify-between p-3 rounded-[6px] text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#3370FF] transition-colors" aria-hidden="true" />
                  View Performance Reports
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/scan"
                className="flex items-center justify-between p-3 rounded-[6px] text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#3370FF] transition-colors" aria-hidden="true" />
                  Manual Backup
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>

    </div>
  )
}

import {
  LayoutDashboard,
  BarChart3,
  Bot,
  FileText,
  ScanSearch,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

/**
 * Temporary preview page — no auth required.
 * Visit /preview-dashboard to see the redesigned dashboard with demo data.
 * DELETE THIS FILE before merging to main.
 */

const NAV_MAIN: Array<{ icon: typeof LayoutDashboard; label: string; href: string; active?: boolean; badge?: string }> = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
  { icon: BarChart3, label: 'Rankings', href: '/dashboard/rankings' },
  { icon: Bot, label: 'Agents', href: '/dashboard/agents', badge: '3' },
  { icon: FileText, label: 'Content', href: '/dashboard/content' },
  { icon: ScanSearch, label: 'Scan', href: '/dashboard/scan' },
]

const NAV_BOTTOM: Array<{ icon: typeof Settings; label: string; href: string }> = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '#' },
]

export default function PreviewDashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Sidebar ── */}
      <div className="hidden lg:flex w-[240px] flex-col border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center px-5 h-14">
          <img
            src="/logo/beamix_logo_blue_Primary.png"
            alt="Beamix"
            className="w-[160px] object-contain"
          />
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3370FF]/30 focus:border-[#3370FF] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              aria-label="Search"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <span className="block px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </span>
          {NAV_MAIN.map((item) => (
            <div
              key={item.label}
              className={cn(
                'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer',
                item.active
                  ? 'bg-[#3370FF]/8 text-[#3370FF] dark:bg-blue-950/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              {item.active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#3370FF]" />
              )}
              <item.icon className={cn('h-[18px] w-[18px]', item.active ? 'text-[#3370FF]' : 'text-slate-400')} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {'badge' in item && item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3370FF] px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Upgrade card */}
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-gradient-to-br from-[#3370FF]/10 to-blue-50 border border-[#3370FF]/15 p-3.5 dark:from-blue-950/40 dark:to-blue-950/20 dark:border-blue-800/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#3370FF]" />
              <span className="text-[11px] font-semibold text-[#3370FF]">5 days left in trial</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5 dark:text-slate-400">
              Upgrade to unlock all 7 AI engines and unlimited agent runs.
            </p>
            <button className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#3370FF] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#2B5FDB] transition-colors">
              <Zap className="h-3 w-3" />
              Upgrade plan
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-3 pb-2 space-y-0.5">
          {NAV_BOTTOM.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <item.icon className="h-[18px] w-[18px] text-slate-400" aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>

        {/* User section */}
        <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3370FF] to-blue-400 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-900 truncate dark:text-white">Acme Coffee</p>
              <p className="text-[11px] text-slate-400 truncate">Free trial</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Top bar (above main content) ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-900 font-medium dark:text-white">Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Overview</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors dark:hover:bg-slate-800" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors dark:hover:bg-slate-800" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <DashboardOverview
              businessName="Acme Coffee"
              businessUrl="https://acmecoffee.com"
              score={null}
              scoreDelta={null}
              mentionCount={0}
              mentionDelta={null}
              lastScanned={null}
              totalCredits={10}
              monthlyCredits={15}
              usedCredits={0}
              enginesMentioning={null}
              totalEngines={null}
              trendData={[]}
              recommendations={[
                {
                  id: '1',
                  title: 'Optimize your Google Business Profile for AI search',
                  description:
                    'Your Google Business Profile is missing key information that AI engines use to recommend businesses.',
                  priority: 'critical',
                  recommendation_type: 'seo',
                  status: 'new',
                  suggested_agent: 'content_writer',
                  credits_cost: 1,
                },
                {
                  id: '2',
                  title: 'Add FAQ schema markup to your website',
                  description:
                    'FAQ schema helps AI engines understand your services and include you in relevant answers.',
                  priority: 'high',
                  recommendation_type: 'schema',
                  status: 'new',
                  suggested_agent: 'schema_optimizer',
                  credits_cost: 1,
                },
                {
                  id: '3',
                  title: 'Create content targeting "best coffee shop near me" queries',
                  description:
                    'This query has high AI search volume but you have no optimized content for it.',
                  priority: 'medium',
                  recommendation_type: 'content',
                  status: 'new',
                  suggested_agent: 'content_writer',
                  credits_cost: 2,
                },
              ]}
              recentAgents={[
                {
                  id: 'a1',
                  agent_type: 'content_writer',
                  status: 'completed',
                  credits_cost: 1,
                  created_at: '2026-03-28T10:00:00Z',
                  completed_at: '2026-03-28T10:05:00Z',
                },
                {
                  id: 'a2',
                  agent_type: 'schema_optimizer',
                  status: 'completed',
                  credits_cost: 1,
                  created_at: '2026-03-27T14:00:00Z',
                  completed_at: '2026-03-27T14:03:00Z',
                },
                {
                  id: 'a3',
                  agent_type: 'competitor_intelligence',
                  status: 'running',
                  credits_cost: 2,
                  created_at: '2026-03-30T08:00:00Z',
                  completed_at: null,
                },
              ]}
              recentScans={[]}
              engineResults={[]}
              demoMode={true}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

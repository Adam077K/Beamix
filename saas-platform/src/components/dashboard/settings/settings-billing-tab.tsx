'use client'

import {
  CreditCard,
  ExternalLink,
  FileText,
  Plus,
  Zap,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ── Mock data ──────────────────────────────────────────────

const BILLING_HISTORY = [
  { date: 'March 1, 2026', amount: '$149.00', status: 'Paid' },
  { date: 'February 1, 2026', amount: '$149.00', status: 'Paid' },
]

const TOP_UPS = [
  { uses: 5, price: '$15', label: 'Add 5 Uses', icon: Zap },
  { uses: 15, price: '$35', label: 'Add 15 Uses', icon: TrendingUp },
]

const USAGE_ITEMS = [
  { label: 'Tracked Queries', used: 18, total: 25, icon: BarChart3 },
  { label: 'Agent Uses', used: 8, total: 15, icon: Zap },
  { label: 'Scans', used: 12, total: null, icon: BarChart3 },
]

// ── Section wrapper ─────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
      <h2 className="text-base font-semibold text-[#111827] mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ── Billing Tab ─────────────────────────────────────────────

export function SettingsBillingTab() {
  return (
    <div className="space-y-4">

      {/* Integration notice */}
      <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm">
        <p className="font-medium text-[#92400E]">Billing integration in progress</p>
        <p className="mt-0.5 text-[#A16207]">
          Subscription details and payment history will appear here once your plan is active.
        </p>
      </div>

      {/* Current Plan */}
      <Section title="Current Plan">
        <div className="space-y-4">

          {/* Plan info row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF0FF] border border-[#BFCFFF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3370FF]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[#3370FF]">Pro</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-[#111827]">$149</span>
                <span className="text-sm text-[#6B7280]">/ month</span>
              </div>
            </div>
            <span className="text-xs text-[#6B7280] bg-[#F6F7F9] px-3 py-1.5 rounded-lg shrink-0">
              Next billing: April 1, 2026
            </span>
          </div>

          <div className="h-px bg-[#F3F4F6]" />

          {/* Usage metrics */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Usage This Month
            </p>

            <div className="space-y-2">
              {USAGE_ITEMS.map((item) => {
                const pct =
                  item.total !== null
                    ? Math.round((item.used / item.total) * 100)
                    : 48
                const isHighUsage = pct >= 80

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] px-4 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#111827]">{item.label}</span>
                      <span
                        className={
                          isHighUsage
                            ? 'font-semibold tabular-nums text-[#EF4444]'
                            : 'font-medium tabular-nums text-[#6B7280]'
                        }
                      >
                        {item.total !== null
                          ? `${item.used} / ${item.total}`
                          : `${item.used} / unlimited`}
                      </span>
                    </div>
                    {item.total !== null && (
                      <Progress
                        value={pct}
                        className="h-1.5 bg-[#E5E7EB] [&>div]:bg-[#3370FF]"
                        aria-label={`${item.label}: ${pct}% used`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </Section>

      {/* Agent Top-Ups */}
      <Section title="Agent Top-Ups">
        <div className="grid gap-3 sm:grid-cols-2">
          {TOP_UPS.map((topUp) => {
            const Icon = topUp.icon
            return (
              <div
                key={topUp.uses}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] p-4 transition-colors hover:bg-[#F3F4F6]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF0FF]">
                    <Icon className="h-4 w-4 text-[#3370FF]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {topUp.uses} extra uses
                    </p>
                    <p className="text-sm font-medium text-[#3370FF]">{topUp.price}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 shrink-0 rounded-lg border-[#E5E7EB] text-[#111827] hover:bg-white"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Billing History */}
      <Section title="Billing History">
        <div className="rounded-lg border border-[#E5E7EB] overflow-hidden divide-y divide-[#F3F4F6]">
          {BILLING_HISTORY.map((item) => (
            <div
              key={item.date}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F6F7F9] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
                  <FileText className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-sm font-medium text-[#111827]">{item.date}</span>
                  <div className="mt-0.5">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-[#D1FAE5] text-[#065F46] border-0"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums text-[#111827]">
                  {item.amount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-[#6B7280] hover:text-[#111827] h-8 px-2"
                  aria-label={`Download invoice for ${item.date}`}
                >
                  Invoice
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Payment Method */}
      <Section title="Payment Method">
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] px-4 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
              <CreditCard className="h-4 w-4 text-[#6B7280]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827]">Visa ending in 4242</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Expires 12/2027</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg border-[#E5E7EB] text-[#111827] hover:bg-white"
            >
              Update
            </Button>
          </div>

          <div className="h-px bg-[#F3F4F6]" />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-lg border-[#E5E7EB] text-[#111827] hover:bg-[#F6F7F9]"
            >
              Change Plan
            </Button>
            <Button
              variant="outline"
              className="rounded-lg border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Section>

    </div>
  )
}

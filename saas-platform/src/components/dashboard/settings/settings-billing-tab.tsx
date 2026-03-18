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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

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

// ── Billing Tab ────────────────────────────────────────────

export function SettingsBillingTab() {
  return (
    <div className="space-y-5">

      {/* Placeholder notice */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
        <p className="font-medium">Billing integration in progress</p>
        <p className="mt-1 text-orange-600">
          Subscription details and payment history will appear here once your plan is active.
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Plan info */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Plan badge + price */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-primary">Pro</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground metric-value">$149</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg shrink-0">
              Next billing: April 1, 2026
            </span>
          </div>

          <Separator />

          {/* Usage metrics */}
          <div className="space-y-3">
            <p className="section-eyebrow">Usage This Month</p>

            <div className="space-y-3">
              {USAGE_ITEMS.map((item) => {
                const pct =
                  item.total !== null
                    ? Math.round((item.used / item.total) * 100)
                    : 48
                const isHighUsage = pct >= 80

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-muted/20 px-4 py-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span
                        className={
                          isHighUsage
                            ? 'font-semibold tabular-nums text-primary'
                            : 'font-medium tabular-nums text-muted-foreground'
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
                        className="h-1.5 bg-primary/10 [&>div]:bg-primary"
                        aria-label={`${item.label}: ${pct}% used`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Top-Ups */}
      <Card className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Agent Top-Ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOP_UPS.map((topUp) => {
              const Icon = topUp.icon
              return (
                <div
                  key={topUp.uses}
                  className="flex items-center justify-between rounded-[14px] border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40 hover:border-border/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {topUp.uses} extra uses
                      </p>
                      <p className="text-sm font-medium text-primary">{topUp.price}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0 rounded-lg"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
            {BILLING_HISTORY.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.date}</span>
                    <div className="mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-0"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {item.amount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    aria-label={`Download invoice for ${item.date}`}
                  >
                    Invoice
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method + Actions */}
      <Card className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Visa ending in 4242
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Expires 12/2027
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg"
            >
              Update
            </Button>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-lg">
              Change Plan
            </Button>
            <Button
              variant="outline"
              className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { CreditCard, Zap, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// ── Usage data (mock — will be wired to live data post Paddle integration) ─────

const USAGE_ITEMS = [
  { label: 'Tracked Queries', used: 18, total: 25,   icon: BarChart3 },
  { label: 'Agent Uses',      used: 8,  total: 15,   icon: Zap },
  { label: 'Scans',           used: 12, total: null, icon: BarChart3 },
]

// ── Billing Tab ────────────────────────────────────────────

export function SettingsBillingTab() {
  return (
    <div className="space-y-5">

      {/* ── Placeholder banner ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Billing coming soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Subscription management, payment history, and plan upgrades will be available here once
          billing is integrated with Paddle.
        </p>
      </div>

      {/* ── Current Plan card ───────────────────────────────────────────── */}
      <Card className="bg-card rounded-lg border border-border shadow-[var(--shadow-card)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Plan badge + price */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded">
                Pro
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-foreground">$149</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg shrink-0">
              Next billing: April 1, 2026
            </span>
          </div>

          <Separator />

          {/* Usage metrics — simple text, no fake progress bars */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Usage This Month
            </p>
            <div className="space-y-2">
              {USAGE_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {item.total !== null
                      ? `${item.used} / ${item.total}`
                      : `${item.used} / unlimited`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

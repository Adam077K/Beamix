'use client'

import { CreditCard, ExternalLink, FileText, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// ── Mock data ──────────────────────────────────────────────

const BILLING_HISTORY = [
  { date: 'March 1, 2026', amount: '$149.00' },
  { date: 'February 1, 2026', amount: '$149.00' },
]

const TOP_UPS = [
  { uses: 5, price: '$15', label: 'Add 5 Uses' },
  { uses: 15, price: '$35', label: 'Add 15 Uses' },
]

// ── Billing Tab ────────────────────────────────────────────

export function SettingsBillingTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
              Pro
            </Badge>
            <span className="font-sans font-medium text-2xl text-foreground">
              $149
            </span>
            <span className="text-muted-foreground">/ month</span>
            <span className="text-muted-foreground text-sm">
              Next billing: April 1, 2026
            </span>
          </div>

          <Separator />

          {/* Usage metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Usage This Month
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Tracked Queries</span>
                <span className="font-medium text-foreground">18/25</span>
              </div>
              <Progress value={(18 / 25) * 100} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Agent Uses</span>
                <span className="font-medium text-foreground">8/15</span>
              </div>
              <Progress value={(8 / 15) * 100} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Scans</span>
                <span className="font-medium text-foreground">12 / unlimited</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Top-Ups */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Agent Top-Ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {TOP_UPS.map((topUp) => (
              <div
                key={topUp.uses}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {topUp.uses} extra uses
                  </p>
                  <p className="text-sm text-muted-foreground">{topUp.price}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {topUp.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-medium text-lg text-foreground">
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BILLING_HISTORY.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {item.amount}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
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
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Payment Method
              </p>
              <p className="text-sm text-muted-foreground">
                Visa ending in 4242
              </p>
            </div>
            <Button variant="outline" size="sm" className="ms-auto">
              Update Payment Method
            </Button>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Change Plan</Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import {
  Building2,
  CreditCard,
  Settings2,
  Puzzle,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SettingsBusinessTab } from '@/components/dashboard/settings/settings-business-tab'
import { SettingsBillingTab } from '@/components/dashboard/settings/settings-billing-tab'
import { SettingsPreferencesTab } from '@/components/dashboard/settings/settings-preferences-tab'
import { SettingsIntegrationsTab } from '@/components/dashboard/settings/settings-integrations-tab'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-up">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account, billing, and preferences
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        {/* Pill-style tab navigation */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          <TabsList className="bg-transparent p-0 gap-1 h-auto">
            <TabsTrigger
              value="business"
              className="gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-150 h-auto"
            >
              <Building2 className="h-3.5 w-3.5" />
              Business
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-150 h-auto"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-150 h-auto"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-150 h-auto"
            >
              <Puzzle className="h-3.5 w-3.5" />
              Integrations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="business">
          <SettingsBusinessTab />
        </TabsContent>

        <TabsContent value="billing">
          <SettingsBillingTab />
        </TabsContent>

        <TabsContent value="preferences">
          <SettingsPreferencesTab />
        </TabsContent>

        <TabsContent value="integrations">
          <SettingsIntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

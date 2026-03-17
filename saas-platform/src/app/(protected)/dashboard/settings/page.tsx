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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-sans font-medium text-2xl text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, billing, and preferences
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList
          className="w-full justify-start border-b border-border bg-transparent p-0"
          variant="line"
        >
          <TabsTrigger
            value="business"
            className="gap-1.5 data-[state=active]:text-primary"
          >
            <Building2 className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-1.5 data-[state=active]:text-primary"
          >
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="gap-1.5 data-[state=active]:text-primary"
          >
            <Settings2 className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="gap-1.5 data-[state=active]:text-primary"
          >
            <Puzzle className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

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

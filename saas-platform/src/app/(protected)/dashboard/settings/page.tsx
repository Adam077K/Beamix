'use client'

import { useState } from 'react'
import {
  Building2,
  CreditCard,
  SlidersHorizontal,
  Puzzle,
} from 'lucide-react'
import { SettingsBusinessTab } from '@/components/dashboard/settings/settings-business-tab'
import { SettingsBillingTab } from '@/components/dashboard/settings/settings-billing-tab'
import { SettingsPreferencesTab } from '@/components/dashboard/settings/settings-preferences-tab'
import { SettingsIntegrationsTab } from '@/components/dashboard/settings/settings-integrations-tab'
import { cn } from '@/lib/utils'

const SETTINGS_TABS = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
] as const

type TabId = (typeof SETTINGS_TABS)[number]['id']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('business')

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="text-display text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account, billing, and preferences
        </p>
      </div>

      {/* Two-column layout: vertical nav + content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical settings nav */}
        <nav className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible border-b md:border-b-0 pb-2 md:pb-0">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content area */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'business' && <SettingsBusinessTab />}
          {activeTab === 'billing' && <SettingsBillingTab />}
          {activeTab === 'preferences' && <SettingsPreferencesTab />}
          {activeTab === 'integrations' && <SettingsIntegrationsTab />}
        </div>
      </div>
    </div>
  )
}

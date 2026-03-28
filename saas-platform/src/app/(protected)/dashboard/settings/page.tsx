'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SettingsBusinessTab } from '@/components/dashboard/settings/settings-business-tab'
import { SettingsBillingTab } from '@/components/dashboard/settings/settings-billing-tab'
import { SettingsPreferencesTab } from '@/components/dashboard/settings/settings-preferences-tab'
import { SettingsIntegrationsTab } from '@/components/dashboard/settings/settings-integrations-tab'

// ── Types ───────────────────────────────────────────────────

type SettingsTab = 'business' | 'billing' | 'preferences' | 'integrations'

interface TabItem {
  id: SettingsTab
  label: string
}

// ── Tab config ──────────────────────────────────────────────

const TABS: TabItem[] = [
  { id: 'business', label: 'Business' },
  { id: 'billing', label: 'Billing' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'integrations', label: 'Integrations' },
]

// ── Settings Page ───────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business')

  return (
    <div className="max-w-[800px] mx-auto py-8 px-0 animate-fade-up">

      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight">Settings</h1>
      </header>

      {/* Tab Navigation — horizontal underline style */}
      <nav
        className="flex gap-6 border-b border-[#E5E7EB] mb-8"
        aria-label="Settings sections"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 text-[13px] font-medium transition-colors focus-visible:outline-none',
                isActive
                  ? 'border-b-2 border-[#3370FF] text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      {activeTab === 'business' && <SettingsBusinessTab />}
      {activeTab === 'billing' && <SettingsBillingTab />}
      {activeTab === 'preferences' && <SettingsPreferencesTab />}
      {activeTab === 'integrations' && <SettingsIntegrationsTab />}

    </div>
  )
}

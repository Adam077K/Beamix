'use client'

import { useState } from 'react'
import { Building2, CreditCard, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsBusinessTab } from '@/components/dashboard/settings/settings-business-tab'
import { SettingsBillingTab } from '@/components/dashboard/settings/settings-billing-tab'
import { SettingsPreferencesTab } from '@/components/dashboard/settings/settings-preferences-tab'

// ── Types ───────────────────────────────────────────────────

type SettingsTab = 'business' | 'billing' | 'preferences'

interface NavItem {
  id: SettingsTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// ── Nav config ──────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
]

// ── Settings Page ───────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business')

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#6B7280]">
          Manage your account, billing, and preferences
        </p>
      </div>

      {/* Two-column layout: left nav + content */}
      <div className="flex gap-6 items-start">

        {/* Left sidebar nav */}
        <nav
          className="shrink-0 w-[200px] flex flex-col gap-1"
          aria-label="Settings navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/40',
                  isActive
                    ? 'bg-[#EBF0FF] text-[#3370FF]'
                    : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'business' && <SettingsBusinessTab />}
          {activeTab === 'billing' && <SettingsBillingTab />}
          {activeTab === 'preferences' && <SettingsPreferencesTab />}
        </div>

      </div>
    </div>
  )
}

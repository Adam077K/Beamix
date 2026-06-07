'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { ProfileTab } from './_components/ProfileTab'
import { BrandFingerprintTab } from './_components/BrandFingerprintTab'
import { BillingTab } from './_components/BillingTab'
import { ApprovalPreferencesTab } from './_components/ApprovalPreferencesTab'
import { PublishingIntegrationsTab } from './_components/PublishingIntegrationsTab'
import { CancelTab } from './_components/CancelTab'

/**
 * Settings — six-tab console surface.
 *
 * Structure: horizontal underline tabs (TabsList variant="underline") flush under
 * the page header. Tab bodies are one or more .card-console panels.
 *
 * Color law: blue = you (#3370FF) — CTAs, links, active tab.
 *            violet = agents (#6E56F0) — Approval preferences tab identity only.
 *            Violet NEVER on a button.
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, brand, billing, and agent preferences."
      />

      <Tabs defaultValue="profile" className="w-full">
        {/* Top-mounted horizontal tab rail */}
        <TabsList
          variant="underline"
          className="mb-6 flex-nowrap overflow-x-auto scrollbar-hide"
          aria-label="Settings sections"
        >
          <TabsTrigger variant="underline" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger variant="underline" value="brand">
            Brand fingerprint
          </TabsTrigger>
          <TabsTrigger variant="underline" value="billing">
            Billing
          </TabsTrigger>
          <TabsTrigger variant="underline" value="approvals">
            Approval preferences
          </TabsTrigger>
          <TabsTrigger variant="underline" value="integrations">
            Publishing integrations
          </TabsTrigger>
          <TabsTrigger variant="underline" value="cancel">
            Cancel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="brand">
          <BrandFingerprintTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalPreferencesTab />
        </TabsContent>

        <TabsContent value="integrations">
          <PublishingIntegrationsTab />
        </TabsContent>

        <TabsContent value="cancel">
          <CancelTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

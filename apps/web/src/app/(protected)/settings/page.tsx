import { SettingsClient } from '@/components/settings/SettingsClient'

const mockUser = {
  email: 'adam@beamix.tech',
  timezone: 'Asia/Jerusalem',
  language: 'en' as 'en' | 'he',
  planTier: 'build' as 'discover' | 'build' | 'scale' | null,
  business: {
    name: 'Beamix',
    url: 'https://beamix.tech',
    industry: 'SaaS / Software',
    location: 'Tel Aviv, Israel',
    services: ['AI visibility', 'GEO optimization', 'Content generation'],
  },
  notifications: {
    inboxReady: true,
    scanComplete: true,
    budgetAlerts: true,
    competitorMovement: false,
    dailyDigestHour: 9,
  },
}

export default function SettingsPage() {
  return <SettingsClient user={mockUser} />
}

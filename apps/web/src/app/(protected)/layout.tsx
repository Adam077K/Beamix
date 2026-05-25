import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'

// import { NotificationBell } from '@/components/dashboard/NotificationBell'   // Wave 1 FE-1 un-comments this line
// import { PreviewBanner } from '@/components/dashboard/PreviewBanner'         // Wave 1 FE-3 un-comments this line
// import { KillSwitchBanner } from '@/components/dashboard/KillSwitchBanner'   // Wave 1 FE-3 un-comments this line

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      notificationBell={undefined}
      previewBanner={undefined}
      killSwitchBanner={undefined}
    >
      {children}
    </DashboardShell>
  )
}

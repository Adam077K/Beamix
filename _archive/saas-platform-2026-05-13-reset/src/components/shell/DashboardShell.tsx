import { DashboardShellClient } from './DashboardShellClient'

interface DashboardShellProps {
  children: React.ReactNode
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
}

export function DashboardShell({ children, user, plan }: DashboardShellProps) {
  return (
    <DashboardShellClient user={user} plan={plan}>
      {children}
    </DashboardShellClient>
  )
}

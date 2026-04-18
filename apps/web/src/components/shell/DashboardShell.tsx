import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
}

export function DashboardShell({ children, user, plan }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar user={user} plan={plan} />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  )
}

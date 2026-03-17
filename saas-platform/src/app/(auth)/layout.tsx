import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LanguageToggle } from '@/components/auth/language-toggle'
import { BeamixLogo } from '@/components/shared/beamix-logo'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect logged-in users away from auth pages
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle background accent — radial glow top-center */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Language toggle — top-end corner */}
      <div className="absolute end-4 top-4">
        <LanguageToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <BeamixLogo size="lg" href="/" />
      </div>

      {/* Form area */}
      <div className="relative w-full max-w-[400px]">{children}</div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Beamix. All rights reserved.
      </p>
    </div>
  )
}

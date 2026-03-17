import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LanguageToggle } from '@/components/auth/language-toggle'

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute end-4 top-4">
        <LanguageToggle />
      </div>
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-medium text-2xl font-bold text-foreground">
            Beam<span className="text-primary">ix</span>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-[400px]">{children}</div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Beamix. All rights reserved.
      </p>
    </div>
  )
}

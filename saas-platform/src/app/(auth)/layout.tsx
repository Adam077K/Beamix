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
    <div className="min-h-screen flex">
      {/* Left panel — brand statement, desktop only */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-[#0A0A0A] text-white p-12 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle orange radial glow in top-right corner */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,60,0,0.15),transparent_70%)]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="h-5 w-5 rounded-[4px] bg-primary" />
          <span className="font-sans text-lg font-semibold text-white">
            Beam<span className="text-primary">ix</span>
          </span>
        </div>

        {/* Brand statement — Fraunces italic */}
        <div className="relative z-10">
          <p className="font-[var(--font-fraunces)] text-3xl font-light italic leading-snug text-white/90 mb-4">
            &ldquo;Stop being invisible to AI search.&rdquo;
          </p>
          <p className="text-sm text-white/50">
            Scan. Diagnose. Fix. Repeat.
          </p>
        </div>

        {/* Social proof snippet */}
        <div className="relative z-10 text-xs text-white/30">
          Trusted by 400+ SMBs
        </div>
      </div>

      {/* Right panel — form (full width on mobile, flex-1 on desktop) */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 relative">
        {/* Language toggle — top-end corner */}
        <div className="absolute end-4 top-4">
          <LanguageToggle />
        </div>

        {/* Mobile logo — hidden on lg+ */}
        <div className="lg:hidden mb-8 text-center">
          <span className="font-sans text-2xl font-semibold text-foreground">
            Beam<span className="text-primary">ix</span>
          </span>
        </div>

        {/* Form area */}
        <div className="w-full max-w-[400px]">{children}</div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Beamix. All rights reserved.
        </p>
      </div>
    </div>
  )
}

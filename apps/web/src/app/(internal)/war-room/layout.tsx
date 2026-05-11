import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// F2: Fail-closed at REQUEST time when ADAM_EMAIL is missing, not at module load.
// Module-load throws break Vercel's `next build` (collect-page-data step runs in
// NODE_ENV=production but Vercel injects runtime secrets only at runtime, not build).
// In dev, a missing env var still warns at console + redirects on access.
export const metadata = {
  title: 'War Room — Beamix Internal',
  robots: 'noindex,nofollow',
}

export default async function WarRoomLayout({ children }: { children: React.ReactNode }) {
  const ADAM_EMAIL = process.env['ADAM_EMAIL'] ?? ''
  if (!ADAM_EMAIL) {
    if (process.env.NODE_ENV === 'production') {
      // Production runtime: fail-closed loud + visible. Don't 500; redirect home.
      console.error('[war-room] ADAM_EMAIL env var missing in production — access denied')
    } else {
      console.warn('[war-room] ADAM_EMAIL not set — access disabled in dev')
    }
    redirect('/')
  }

  // F1: Remove `as any` — let TypeScript infer the properly typed Supabase client.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Must be authenticated
  if (!user) {
    redirect('/')
  }

  // Must be Adam's email — war room is Adam-only.
  // F1: Destructure email from the typed user object directly (no cast needed).
  const { email } = user
  if (!email || email.toLowerCase() !== ADAM_EMAIL.toLowerCase()) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-11 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-6">
        <span className="font-mono text-xs font-semibold tracking-widest uppercase text-foreground/60">
          WAR ROOM
        </span>
        <span className="text-border">·</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          internal observability surface — {email}
        </span>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] dark:bg-[#34D399]" aria-hidden="true" />
            <span className="font-mono text-[10px] text-muted-foreground">production</span>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
        {children}
      </main>
    </div>
  )
}

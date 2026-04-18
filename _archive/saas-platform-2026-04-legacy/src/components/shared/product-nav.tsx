import Link from 'next/link'
import { BeamixLogo } from './beamix-logo'
import { Button } from '@/components/ui/button'

export function ProductNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <BeamixLogo href="/scan" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

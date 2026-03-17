'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { User, Settings, Moon, Sun, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface UserMenuProps {
  businessName?: string
  planTier?: string
}

export function UserMenu({ businessName, planTier }: UserMenuProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {businessName && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{businessName}</p>
              {planTier && <p className="text-xs text-muted-foreground capitalize">{planTier} plan</p>}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          <Settings className="me-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="me-2 h-4 w-4" /> : <Moon className="me-2 h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="me-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

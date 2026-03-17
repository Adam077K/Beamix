'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Trash2, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

interface Competitor {
  id: string
  name: string
  domain: string | null
  source: string | null
  created_at: string
  business_id: string
}

interface CompetitorsViewProps {
  competitors: Competitor[]
  businessId: string | null
}

export function CompetitorsView({ competitors, businessId }: CompetitorsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !domain.trim()) return
    if (!businessId) {
      setError('No business found. Complete onboarding first.')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), domain: domain.trim(), business_id: businessId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to add competitor')
        return
      }

      setName('')
      setDomain('')
      startTransition(() => router.refresh())
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        startTransition(() => router.refresh())
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitors"
        description="Track how you compare in AI search"
      />

      {/* Add competitor form */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-medium text-foreground">Add Competitor</h2>
          <form onSubmit={handleAdd}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  'flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2'
                )}
                required
                aria-label="Competitor company name"
              />
              <input
                type="text"
                placeholder="domain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={cn(
                  'flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2'
                )}
                required
                aria-label="Competitor domain"
              />
              <Button
                type="submit"
                disabled={isAdding || isPending}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAdding ? 'Adding...' : 'Add Competitor'}
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Competitor list or empty state */}
      {competitors.length === 0 ? (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No competitors tracked yet"
              description="Add your first competitor to start tracking their AI visibility and see how you compare."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {competitors.map((comp) => (
            <Card
              key={comp.id}
              className="bg-card rounded-[20px] border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground font-semibold text-sm">
                      {comp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{comp.name}</h3>
                      {comp.domain && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">{comp.domain}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {comp.source && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {comp.source}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(comp.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      disabled={deletingId === comp.id || isPending}
                      className={cn(
                        'rounded-lg p-1.5 text-muted-foreground transition-colors duration-150',
                        'hover:bg-red-50 hover:text-destructive',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2',
                        'disabled:opacity-50 disabled:pointer-events-none'
                      )}
                      aria-label={`Remove ${comp.name}`}
                      title={`Remove ${comp.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

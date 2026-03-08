'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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
    try {
      const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        startTransition(() => router.refresh())
      }
    } catch {
      // Silently fail — user can retry
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#141310] mb-6">Competitors</h1>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl border border-stone-200 p-5 mb-6"
      >
        <h2 className="font-semibold text-[#141310] mb-3">Add Competitor</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            required
          />
          <input
            type="text"
            placeholder="domain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            required
          />
          <button
            type="submit"
            disabled={isAdding || isPending}
            className="px-4 py-2 bg-[#141310] text-white text-sm rounded-lg hover:bg-stone-800 disabled:opacity-50 whitespace-nowrap"
          >
            {isAdding ? 'Adding...' : 'Add Competitor'}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {competitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500 text-lg">No competitors tracked yet.</p>
          <p className="text-stone-400 mt-2">
            Add your first competitor to start tracking their AI visibility.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500 font-semibold text-sm">
                  {comp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-[#141310]">{comp.name}</h3>
                  <p className="text-stone-400 text-sm">{comp.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {comp.source && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                    {comp.source}
                  </span>
                )}
                <span className="text-stone-400 text-xs">
                  {new Date(comp.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(comp.id)}
                  className="text-stone-400 hover:text-red-500 text-sm p-1"
                  title="Remove competitor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

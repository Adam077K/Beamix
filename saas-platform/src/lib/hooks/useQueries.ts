// ================================================
// Queries Hook
// ================================================

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface TrackedQuery {
  id: string
  query_text: string
  source: 'auto-generated' | 'user-added'
  category: string | null
  priority: 'high' | 'medium' | 'low' | null
  is_active: boolean
  avg_ranking: number | null
  last_checked_at: string | null
  created_at: string
}

async function fetchWithAuth(url: string, options?: RequestInit) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || 'Request failed')
  }
  
  return res.json()
}

export function useQueries() {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['queries'],
    queryFn: async () => {
      const json = await fetchWithAuth('/api/queries')
      return json.data.queries as TrackedQuery[]
    },
  })
  
  const addQuery = useMutation({
    mutationFn: async (queryData: { query_text: string; category?: string; priority?: string }) => {
      return fetchWithAuth('/api/queries', {
        method: 'POST',
        body: JSON.stringify(queryData),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
    },
  })
  
  const updateQuery = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<TrackedQuery> }) => {
      return fetchWithAuth(`/api/queries/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
    },
  })
  
  const deleteQuery = useMutation({
    mutationFn: async (id: string) => {
      return fetchWithAuth(`/api/queries/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
    },
  })
  
  return {
    queries: data || [],
    isLoading,
    error,
    addQuery,
    updateQuery,
    deleteQuery,
  }
}

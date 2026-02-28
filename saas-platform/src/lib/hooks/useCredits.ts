// ================================================
// Credits Hook
// ================================================

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface CreditsBalance {
  credits_remaining: number
  credits_total: number
  monthly_allocation: number
  rollover_credits: number
  bonus_credits: number
  reset_date: string | null
  tier: 'starter' | 'professional' | 'enterprise'
}

interface CreditTransaction {
  id: string
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

async function fetchWithAuth(url: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  
  return res.json()
}

export function useCreditsBalance() {
  return useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: async () => {
      const json = await fetchWithAuth('/api/credits/balance')
      return json.data as CreditsBalance
    },
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function useCreditTransactions(page: number = 1, per_page: number = 20) {
  return useQuery({
    queryKey: ['credits', 'transactions', page, per_page],
    queryFn: async () => {
      const json = await fetchWithAuth(`/api/credits/transactions?page=${page}&per_page=${per_page}`)
      return {
        transactions: json.data.transactions as CreditTransaction[],
        pagination: json.data.pagination,
      }
    },
  })
}

'use client'

import { useCreditsBalance, useCreditTransactions } from '@/lib/hooks/useCredits'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, TrendingDown, ArrowLeft, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

export default function CreditsPage() {
  const { data: balance, isLoading: balanceLoading } = useCreditsBalance()
  const [page, setPage] = useState(1)
  const { data: transactions, isLoading: transactionsLoading } = useCreditTransactions(page, 20)

  const getTransactionColor = (type: string) => {
    if (type === 'debit') return 'destructive'
    if (type === 'credit' || type === 'bonus') return 'default'
    if (type === 'monthly_allocation') return 'secondary'
    return 'outline'
  }

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Coins className="h-8 w-8 text-primary" />
          Credits
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your credit balance and view transaction history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Available Credits</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
            ) : (
              <div className="text-4xl font-bold">{balance?.credits_remaining || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Allocation</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold">{balance?.monthly_allocation || 0}</div>
                <Badge variant="secondary" className="mt-2">
                  {balance?.tier || 'starter'}
                </Badge>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rollover Credits</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-600">
                  {balance?.rollover_credits || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">20% max from last month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bonus Credits</CardDescription>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-600">
                  {balance?.bonus_credits || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Promotional credits</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Date */}
      {balance?.reset_date && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Next Credit Reset</div>
              <div className="text-sm text-gray-600">
                {formatDate(balance.reset_date)} - You'll receive {balance.monthly_allocation} credits
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Notice */}
      {balance?.tier === 'starter' && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="py-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Need more credits?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upgrade to Professional (500 credits/month) or Enterprise (2000 credits/month)
                </p>
                <Button>Upgrade Plan</Button>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">500</div>
                <div className="text-sm text-gray-600">Professional</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All credit usage and allocations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : transactions?.transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransactionColor(tx.transaction_type)}>
                          {tx.transaction_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {getTransactionIcon(tx.amount)}
                          <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {tx.balance_after}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {transactions && transactions.pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {transactions.pagination.page} of {transactions.pagination.total_pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === transactions.pagination.total_pages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Credit Costs Info */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Costs</CardTitle>
          <CardDescription>
            How many credits each AI agent costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Content Writer</span>
              <Badge>3 credits</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Competitor Research</span>
              <Badge>2 credits</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Query Researcher</span>
              <Badge>1 credit</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

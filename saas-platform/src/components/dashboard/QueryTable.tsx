// ================================================
// Query Table Component
// ================================================

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Power, PowerOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Query {
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

interface QueryTableProps {
  queries: Query[]
  onEdit: (query: Query) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export function QueryTable({ queries, onEdit, onDelete, onToggleActive }: QueryTableProps) {
  if (queries.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">No tracked queries yet</p>
        <p className="text-sm text-gray-400">
          Add your first query to start tracking LLM rankings
        </p>
      </div>
    )
  }

  const getPriorityColor = (priority: string | null) => {
    if (priority === 'high') return 'destructive'
    if (priority === 'medium') return 'default'
    return 'secondary'
  }

  const getSourceColor = (source: string) => {
    return source === 'auto-generated' ? 'secondary' : 'outline'
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Query</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Avg Ranking</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.id}>
              <TableCell className="font-medium">{query.query_text}</TableCell>
              <TableCell>
                <Badge variant={getSourceColor(query.source)} className="text-xs">
                  {query.source === 'auto-generated' ? 'Auto' : 'Manual'}
                </Badge>
              </TableCell>
              <TableCell>
                {query.priority && (
                  <Badge variant={getPriorityColor(query.priority)} className="text-xs">
                    {query.priority}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {query.avg_ranking !== null ? (
                  <span className="font-semibold">#{Math.round(query.avg_ranking)}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {query.last_checked_at ? formatDate(query.last_checked_at) : 'Never'}
              </TableCell>
              <TableCell>
                <Badge variant={query.is_active ? 'default' : 'secondary'} className="text-xs">
                  {query.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(query.id, !query.is_active)}
                    title={query.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {query.is_active ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(query)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(query.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

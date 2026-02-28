'use client'

import { useQueries } from '@/lib/hooks/useQueries'
import { QueryTable } from '@/components/dashboard/QueryTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function QueriesPage() {
  const { queries, isLoading, addQuery, updateQuery, deleteQuery } = useQueries()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuery, setEditingQuery] = useState<any>(null)
  
  // Add query form state
  const [newQueryText, setNewQueryText] = useState('')
  const [newQueryPriority, setNewQueryPriority] = useState('medium')
  const [newQueryCategory, setNewQueryCategory] = useState('')

  const handleAddQuery = async () => {
    if (!newQueryText.trim()) return
    
    await addQuery.mutateAsync({
      query_text: newQueryText,
      priority: newQueryPriority,
      category: newQueryCategory || undefined,
    })
    
    // Reset form
    setNewQueryText('')
    setNewQueryPriority('medium')
    setNewQueryCategory('')
    setIsAddDialogOpen(false)
  }

  const handleEditQuery = (query: any) => {
    setEditingQuery(query)
    setIsEditDialogOpen(true)
  }

  const handleUpdateQuery = async () => {
    if (!editingQuery) return
    
    await updateQuery.mutateAsync({
      id: editingQuery.id,
      updates: {
        query_text: editingQuery.query_text,
        priority: editingQuery.priority,
        category: editingQuery.category,
      },
    })
    
    setIsEditDialogOpen(false)
    setEditingQuery(null)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateQuery.mutateAsync({
      id,
      updates: { is_active: isActive },
    })
  }

  const handleDeleteQuery = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      await deleteQuery.mutateAsync(id)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" />
            Tracked Queries
          </h1>
          <p className="text-gray-500 mt-1">
            Manage search terms you want to track across LLM engines
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Query
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Query</DialogTitle>
              <DialogDescription>
                Add a search term to track across ChatGPT, Claude, Perplexity, and Gemini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Query Text</label>
                <Textarea
                  placeholder="e.g., best CRM software for small businesses"
                  value={newQueryText}
                  onChange={(e) => setNewQueryText(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Minimum 10 characters, maximum 200 characters
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={newQueryPriority} onValueChange={setNewQueryPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category (Optional)</label>
                <Input
                  placeholder="e.g., Product, Service, Brand"
                  value={newQueryCategory}
                  onChange={(e) => setNewQueryCategory(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddQuery}
                disabled={newQueryText.trim().length < 10 || addQuery.isPending}
              >
                {addQuery.isPending ? 'Adding...' : 'Add Query'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{queries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {queries.filter(q => q.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">
              {queries.filter(q => !q.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <QueryTable
          queries={queries}
          onEdit={handleEditQuery}
          onDelete={handleDeleteQuery}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Query</DialogTitle>
            <DialogDescription>
              Update the query details
            </DialogDescription>
          </DialogHeader>
          {editingQuery && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Query Text</label>
                <Textarea
                  value={editingQuery.query_text}
                  onChange={(e) => setEditingQuery({
                    ...editingQuery,
                    query_text: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={editingQuery.priority || 'medium'}
                  onValueChange={(value) => setEditingQuery({
                    ...editingQuery,
                    priority: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category (Optional)</label>
                <Input
                  value={editingQuery.category || ''}
                  onChange={(e) => setEditingQuery({
                    ...editingQuery,
                    category: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateQuery}
              disabled={updateQuery.isPending}
            >
              {updateQuery.isPending ? 'Updating...' : 'Update Query'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

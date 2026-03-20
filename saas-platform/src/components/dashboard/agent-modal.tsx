'use client'

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentName: string
  agentSlug: string
  creditCost: number
  totalCredits: number
  onExecute: (params: AgentExecuteParams) => void
  isLoading?: boolean
}

export interface AgentExecuteParams {
  topic: string
  tone: 'professional' | 'casual' | 'technical' | 'friendly'
  targetLength: 'short' | 'medium' | 'long'
  language: 'en' | 'he'
  targetKeyword?: string
}

export function AgentModal({
  open,
  onOpenChange,
  agentName,
  creditCost,
  totalCredits,
  onExecute,
  isLoading = false,
}: AgentModalProps) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<AgentExecuteParams['tone']>('professional')
  const [targetLength, setTargetLength] = useState<AgentExecuteParams['targetLength']>('medium')
  const [language, setLanguage] = useState<AgentExecuteParams['language']>('en')
  const [targetKeyword, setTargetKeyword] = useState('')

  const canAfford = totalCredits >= creditCost
  const canSubmit = topic.trim().length >= 3 && canAfford && !isLoading

  function handleSubmit() {
    if (!canSubmit) return
    onExecute({
      topic: topic.trim(),
      tone,
      targetLength,
      language,
      targetKeyword: targetKeyword.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans font-medium">{agentName}</DialogTitle>
          <DialogDescription>
            Configure and run {agentName}. Output will appear in the chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="agent-topic" className="text-sm font-medium text-foreground">
              Topic / Prompt
            </Label>
            <Textarea
              id="agent-topic"
              placeholder={`Tell ${agentName} what to work on...`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[88px] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Tone + Length row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="agent-tone" className="text-sm font-medium text-foreground">
                Tone
              </Label>
              <Select
                value={tone}
                onValueChange={(v) => setTone(v as AgentExecuteParams['tone'])}
                disabled={isLoading}
              >
                <SelectTrigger id="agent-tone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-length" className="text-sm font-medium text-foreground">
                Target Length
              </Label>
              <Select
                value={targetLength}
                onValueChange={(v) => setTargetLength(v as AgentExecuteParams['targetLength'])}
                disabled={isLoading}
              >
                <SelectTrigger id="agent-length" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language + Target Keyword row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="agent-language" className="text-sm font-medium text-foreground">
                Language
              </Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as AgentExecuteParams['language'])}
                disabled={isLoading}
              >
                <SelectTrigger id="agent-language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="he">Hebrew</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-keyword" className="text-sm font-medium text-foreground">
                Keyword{' '}
                <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="target-keyword"
                placeholder="e.g., best dentist in Tel Aviv"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Credit cost display */}
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border px-4 py-3',
              canAfford
                ? 'border-border bg-muted/40'
                : 'border-destructive/30 bg-destructive/5',
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-foreground">
                {creditCost === 0 ? (
                  <strong className="font-semibold">Free (Unlimited)</strong>
                ) : (
                  <>
                    This will use{' '}
                    <strong className="font-semibold">{creditCost}</strong>{' '}
                    AI Run
                  </>
                )}
              </span>
            </div>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                canAfford ? 'text-muted-foreground' : 'text-destructive'
              )}
            >
              {totalCredits} AI Runs available
            </span>
          </div>

          {!canAfford && (
            <p className="text-xs text-destructive -mt-2">
              Not enough AI Runs. You need {creditCost} but only have {totalCredits}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="me-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

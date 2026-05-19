'use client'

import { useState, useCallback, useTransition, useEffect } from 'react'
import type { AuditLogRow, TraceNode } from '../lib/queries'

function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return '—'
  return `$${cost.toFixed(2)}`
}

function formatRuntime(secs: number | null): string {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m`
}

// F9: Dark-mode variants for all status dot colors.
function statusDotClass(status: string): string {
  switch (status) {
    case 'complete':
      return 'bg-[#10B981] dark:bg-[#34D399]'
    case 'blocked':
    case 'timeout':
    case 'rule_violation':
    case 'over_budget':
      return 'bg-[#EF4444] dark:bg-[#F87171]'
    case 'anomaly':
      return 'bg-[#F59E0B] dark:bg-[#FBBF24]'
    case 'running':
    case 'accepted':
      return 'bg-[#3370FF] dark:bg-[#5A8FFF] animate-pulse'
    default:
      return 'bg-muted-foreground/50'
  }
}

type TreeNodeProps = {
  node: TraceNode
  depth: number
  isLast: boolean
  prefix: string
}

function TreeNode({ node, depth, isLast, prefix }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const [children, setChildren] = useState<TraceNode[]>(node.children)
  const [loaded, setLoaded] = useState(node.children.length > 0 || depth === 0)
  const [isPending, startTransition] = useTransition()

  const hasChildren = node.children.length > 0

  const handleToggle = useCallback(async () => {
    if (!loaded) {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/war-room/trace/${node.id}`, { cache: 'no-store' })
          if (res.ok) {
            const data: TraceNode = await res.json()
            setChildren(data.children ?? [])
            setLoaded(true)
          }
        } catch {
          // silently ignore — UI stays collapsed
        }
      })
    }
    setExpanded((v) => !v)
  }, [loaded, node.id])

  const connector = isLast ? '└── ' : '├── '
  const childPrefix = prefix + (isLast ? '    ' : '│   ')
  const lineLabel = `${prefix}${connector}${node.agent} (${node.status}, ${formatCost(node.cost_usd)}, ${formatRuntime(node.runtime_s)})`

  return (
    <div>
      <button
        type="button"
        onClick={hasChildren || !loaded ? handleToggle : undefined}
        className="flex w-full items-center gap-2 py-0.5 px-3 hover:bg-muted/30 transition-colors rounded-sm text-left group focus-visible:ring-2 focus-visible:ring-[#3370FF] dark:focus-visible:ring-[#5A8FFF] focus-visible:ring-offset-1 outline-none"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={lineLabel}
        disabled={isPending}
      >
        {/* Tree line prefix */}
        <span
          className="select-none font-mono text-xs text-muted-foreground/40 whitespace-pre shrink-0"
          aria-hidden="true"
        >
          {prefix}
          {depth > 0 ? connector : ''}
        </span>

        {/* Status dot */}
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(node.status)}`}
          aria-hidden="true"
        />

        {/* Agent + ticket */}
        <span className="font-mono text-xs font-medium text-foreground truncate">
          {node.linear_ticket ? (
            // F9: dark-mode accent variant
            <span className="text-[#3370FF] dark:text-[#5A8FFF] mr-1">{node.linear_ticket}</span>
          ) : null}
          ({node.agent}
        </span>

        {/* Stats */}
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {node.status}, {formatCost(node.cost_usd)}, {formatRuntime(node.runtime_s)})
        </span>

        {/* Truncation indicator — shown when depth or children were capped */}
        {node.truncated && (
          <span
            className="font-mono text-[10px] text-[#F59E0B] dark:text-[#FBBF24] ml-1"
            title="Tree truncated — depth or child limit reached"
            aria-label="truncated"
          >
            …
          </span>
        )}

        {/* Expand/collapse indicator */}
        {(hasChildren || !loaded) && (
          <span
            className={`ml-auto font-mono text-[10px] text-muted-foreground/40 transition-transform duration-150 ${expanded ? '' : 'group-hover:text-muted-foreground/70'}`}
            aria-hidden="true"
          >
            {isPending ? '…' : expanded ? '▾' : '▸'}
          </span>
        )}
      </button>

      {/* Children */}
      {expanded && children.length > 0 && (
        <div>
          {children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={i === children.length - 1}
              prefix={childPrefix}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type RootRowProps = {
  row: AuditLogRow
  selected: boolean
  onSelect: () => void
}

function RootRow({ row, selected, onSelect }: RootRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-1.5 text-left rounded-sm transition-colors font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] dark:focus-visible:ring-[#5A8FFF] focus-visible:ring-offset-1 ${
        selected
          ? 'bg-[#3370FF]/10 dark:bg-[#5A8FFF]/10 text-[#3370FF] dark:text-[#5A8FFF]'
          : 'hover:bg-muted/40 text-muted-foreground'
      }`}
      aria-pressed={selected}
      aria-label={`Select trace for ${row.agent}${row.linear_ticket ? ` — ${row.linear_ticket}` : ''}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotClass(row.status)}`}
        aria-hidden="true"
      />
      <span className="truncate">
        {row.linear_ticket ? (
          <span className="font-medium">{row.linear_ticket} </span>
        ) : null}
        <span className="text-foreground/70">{row.agent}</span>
      </span>
      <span className="ml-auto whitespace-nowrap text-[10px] text-muted-foreground/60">
        {new Date(row.ts).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </span>
    </button>
  )
}

type Props = {
  roots: AuditLogRow[]
}

export function TraceTree({ roots }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    roots.length > 0 ? roots[0].id : null
  )
  const [traceNode, setTraceNode] = useState<TraceNode | null>(null)
  const [loadingTrace, setLoadingTrace] = useState(false)
  const [traceError, setTraceError] = useState<string | null>(null)

  const loadTrace = useCallback(async (id: string) => {
    setSelectedId(id)
    setLoadingTrace(true)
    setTraceError(null)
    try {
      const res = await fetch(`/api/war-room/trace/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: TraceNode = await res.json()
      setTraceNode(data)
    } catch (e) {
      setTraceError(e instanceof Error ? e.message : 'Failed to load trace')
      setTraceNode(null)
    } finally {
      setLoadingTrace(false)
    }
  }, [])

  // F4: Replace useState initializer misuse with useEffect.
  // useState initializer fires synchronously during render (wrong for async side effects)
  // and misfires twice in React Strict Mode. useEffect is the correct primitive here.
  useEffect(() => {
    if (roots.length > 0) {
      loadTrace(roots[0].id)
    }
  }, [roots, loadTrace])

  return (
    <section aria-label="Trace view">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 pb-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground/60">
          TRACE VIEW
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground/50">
          cross-routine flow tree
        </span>
      </div>

      <div className="mb-1 border-t border-border/50" />

      {roots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-muted-foreground">No traces to show today</p>
        </div>
      ) : (
        <div className="flex gap-4 min-h-0">
          {/* Root selector panel */}
          {/* F8: Replaced style={{ maxHeight: '380px' }} with Tailwind arbitrary value */}
          <div
            className="w-56 shrink-0 border-r border-border/50 pr-3 space-y-0.5 overflow-y-auto [max-height:380px]"
            role="listbox"
            aria-label="Root traces"
          >
            {roots.map((row) => (
              <RootRow
                key={row.id}
                row={row}
                selected={selectedId === row.id}
                onSelect={() => loadTrace(row.id)}
              />
            ))}
          </div>

          {/* Tree panel */}
          <div className="flex-1 overflow-x-auto min-w-0">
            {loadingTrace ? (
              <div className="space-y-1.5 py-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3">
                    <div
                      className="h-3 animate-pulse bg-muted rounded"
                      style={{ width: `${60 + i * 40}px` }}
                    />
                  </div>
                ))}
              </div>
            ) : traceError ? (
              <p className="px-3 py-4 font-mono text-xs text-destructive">
                Error loading trace: {traceError}
              </p>
            ) : traceNode ? (
              <div className="py-1">
                <TreeNode
                  node={traceNode}
                  depth={0}
                  isLast={true}
                  prefix=""
                />
              </div>
            ) : (
              <p className="px-3 py-4 font-mono text-xs text-muted-foreground">
                Select a trace to inspect
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

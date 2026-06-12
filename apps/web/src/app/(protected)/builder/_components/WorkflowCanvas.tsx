'use client'

import { useMemo } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Workflow, WorkflowNode } from '@/lib/demo/surfaces'
import {
  NODE_VOCAB,
  layoutSpine,
  edgePath,
  type NodeBox,
} from './node-vocab'

/**
 * WorkflowCanvas — the hand-built spatial node graph (the TIER-1 focal).
 *
 * Spatial law made literal:
 *   - Node body = VIOLET agent (bg-agent-tint ground + 3px violet top-accent).
 *     The node IS an agent that does the work.
 *   - Selection chrome = BLUE focus ring (#3370FF). Selecting is a YOU action.
 *   - Trigger node at the head = BLUE structure (white card, blue accent). Your
 *     input/trigger, visually distinct from the violet agents downstream.
 *   - Edges = thin ink SVG paths with directional arrow markers.
 *
 * Dotted-grid background uses --color-data-grid (#EAEAEA). Violet never on a
 * button — the only blue here is selection + the trigger accent.
 */

interface WorkflowCanvasProps {
  workflow: Workflow
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  /** Node ids flagged with a validation error (critical hairline) */
  errorNodeIds?: string[]
  /** Dims + disables the canvas while the dry-run ledger streams over it */
  dimmed?: boolean
}

const CONTENT_WIDTH = 360 // logical content width the spine centres within

export function WorkflowCanvas({
  workflow,
  selectedNodeId,
  onSelectNode,
  errorNodeIds = [],
  dimmed = false,
}: WorkflowCanvasProps) {
  const nodeIds = workflow.nodes.map((n) => n.id)
  const layout = useMemo(
    () => layoutSpine(nodeIds, CONTENT_WIDTH),
    // node ids identity is stable per workflow
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflow.name, nodeIds.join(',')],
  )

  const totalHeight = layout.height + 24

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-auto rounded-[var(--radius-card)] border border-[#E5E7EB] bg-white transition-[opacity,filter] duration-300',
        dimmed && 'pointer-events-none opacity-40 blur-[1px]',
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle, var(--color-data-grid) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '12px 12px',
      }}
      aria-label="Workflow canvas"
    >
      <div
        className="relative mx-auto"
        style={{ width: CONTENT_WIDTH, minHeight: totalHeight, padding: '32px 0 48px' }}
      >
        {/* Edges layer (under nodes) */}
        <svg
          className="pointer-events-none absolute inset-x-0"
          style={{ top: 32, width: CONTENT_WIDTH, height: totalHeight }}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="builder-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#D1D5DB" />
            </marker>
          </defs>

          {/* trigger → first node */}
          {workflow.nodes[0] && (
            <EdgeLine
              from={layout.trigger}
              to={layout.nodes[workflow.nodes[0].id]}
            />
          )}

          {workflow.edges.map((e) => {
            const from = layout.nodes[e.from]
            const to = layout.nodes[e.to]
            if (!from || !to) return null
            return <EdgeLine key={`${e.from}-${e.to}`} from={from} to={to} />
          })}
        </svg>

        {/* Trigger node — BLUE structure (your input) */}
        <TriggerNode box={layout.trigger} />

        {/* Agent nodes — VIOLET (the work) */}
        {workflow.nodes.map((node) => {
          const box = layout.nodes[node.id]
          if (!box) return null
          return (
            <AgentNode
              key={node.id}
              node={node}
              box={box}
              selected={selectedNodeId === node.id}
              hasError={errorNodeIds.includes(node.id)}
              onSelect={() => onSelectNode(node.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edge
// ---------------------------------------------------------------------------

function EdgeLine({ from, to }: { from: NodeBox; to: NodeBox }) {
  // y origin offset matches the svg's top:32 / content padding
  const shift = (b: NodeBox): NodeBox => ({ ...b, y: b.y })
  return (
    <path
      d={edgePath(shift(from), shift(to))}
      fill="none"
      stroke="#E5E7EB"
      strokeWidth={1.5}
      markerEnd="url(#builder-arrow)"
    />
  )
}

// ---------------------------------------------------------------------------
// Trigger node — blue structure
// ---------------------------------------------------------------------------

function TriggerNode({ box }: { box: NodeBox }) {
  return (
    <div
      className="card-console absolute flex items-center gap-3 border-l-2 border-l-[#3370FF] px-4"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3370FF]">
        <Play className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#3370FF]">
          Trigger
        </p>
        <p className="mt-1 truncate text-[13px] font-medium text-[#0A0A0A]">
          Manual run
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent node — violet agent
// ---------------------------------------------------------------------------

function AgentNode({
  node,
  box,
  selected,
  hasError,
  onSelect,
}: {
  node: WorkflowNode
  box: NodeBox
  selected: boolean
  hasError: boolean
  onSelect: () => void
}) {
  const meta = NODE_VOCAB[node.type]
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'card-console absolute flex flex-col justify-center gap-1.5 overflow-hidden px-4 text-left transition-[box-shadow,transform] duration-200',
        'bg-agent-tint hover:-translate-y-[1px]',
        'focus-visible:outline-none',
        // selection chrome = BLUE (a YOU action)
        selected &&
          'ring-2 ring-[#3370FF] ring-offset-2 ring-offset-white',
        hasError && 'ring-2 ring-[#DC2626] ring-offset-2 ring-offset-white',
      )}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      {/* 3px violet top-accent */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-[#6E56F0]"
        aria-hidden="true"
      />

      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/70 text-[#6E56F0]">
          <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-[#6E56F0]">
          {meta.eyebrow}
        </span>
        <span className="flex-1" />
        <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#6B7280]">
          {meta.stepHint}
        </span>
      </div>

      <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
        {node.label.replace(/^[A-Za-z]+:\s*/, '')}
      </p>

      {hasError && (
        <p className="font-[var(--font-mono)] text-[11px] text-[#DC2626]">
          needs a target
        </p>
      )}
    </button>
  )
}

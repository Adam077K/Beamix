'use client'

import { useMemo } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Workflow, WorkflowNode } from '@/lib/demo/surfaces'
import {
  NODE_VOCAB,
  layoutSpine,
  edgeStub,
  nodeWeight,
  RAIL_X,
  type NodeBox,
  type NodeWeight,
} from './node-vocab'

/**
 * WorkflowCanvas — the hand-built spatial node graph (the TIER-1 focal).
 *
 * uix-p-builder rethink (P1-1 + P1-2):
 *   - The flow is LEFT-ANCHORED, not a dead-center ribbon in a void. A single
 *     violet connector trunk runs down the left gutter; cards stub off it. The
 *     canvas reads as one continuous agent pipeline, weighted to the left, so
 *     the persistent rail (BuilderSurface) earns the right ~40%.
 *   - Node hierarchy is FELT: the dominant DO node is the TIER-1 hero (taller,
 *     hero shadow, promoted Geist Mono figure); single-step utility nodes recede
 *     to a quieter, shorter card. Never five co-equal cards.
 *   - The whole agent flow sits on the agent-zone violet ground (M6) so it reads
 *     as "the agents at work" from across the room. Violet never on a button.
 *
 * Spatial law: blue = your structure (trigger + selection); violet = the agents.
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

export function WorkflowCanvas({
  workflow,
  selectedNodeId,
  onSelectNode,
  errorNodeIds = [],
  dimmed = false,
}: WorkflowCanvasProps) {
  const types = useMemo(
    () => workflow.nodes.map((n) => ({ id: n.id, type: n.type })),
    [workflow.nodes],
  )
  const layout = useMemo(
    () => layoutSpine(types),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflow.name, types.map((t) => `${t.id}:${t.type}`).join(',')],
  )

  const contentTop = 32
  const totalHeight = layout.height + contentTop + 48
  // The trunk runs from just below the trigger to the last node's vertical mid.
  const lastNode = workflow.nodes.at(-1)
  const trunkTop = layout.trigger.y + layout.trigger.h
  const trunkBottom = lastNode
    ? layout.nodes[lastNode.id].y + layout.nodes[lastNode.id].h / 2
    : trunkTop

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-auto rounded-[var(--radius-card)] border border-agent-hairline transition-[opacity,filter] duration-300',
        'agent-zone', // M6: the whole flow is the violet agent zone
        dimmed && 'pointer-events-none opacity-40 blur-[1px]',
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(110,86,240,0.10) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        backgroundPosition: '12px 12px',
      }}
      aria-label="Workflow canvas"
    >
      <div
        className="relative"
        style={{
          minWidth: layout.width + 48,
          minHeight: totalHeight,
          padding: `${contentTop}px 0 48px`,
        }}
      >
        {/* Connector layer (under nodes) — one continuous violet gutter trunk */}
        <svg
          className="pointer-events-none absolute inset-0"
          style={{ width: layout.width + 48, height: totalHeight }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="builder-trunk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(110,86,240,0.55)" />
              <stop offset="100%" stopColor="rgba(110,86,240,0.30)" />
            </linearGradient>
          </defs>

          {/* Vertical trunk down the left gutter */}
          {lastNode && (
            <line
              x1={RAIL_X}
              y1={contentTop + trunkTop}
              x2={RAIL_X}
              y2={contentTop + trunkBottom}
              stroke="url(#builder-trunk)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}

          {/* Trigger stub */}
          {workflow.nodes[0] && (
            <path
              d={shiftPath(edgeStub(layout.trigger), contentTop)}
              fill="none"
              stroke="rgba(51,112,255,0.55)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}

          {/* Per-node stubs from the trunk into each card's left edge */}
          {workflow.nodes.map((node) => {
            const box = layout.nodes[node.id]
            if (!box) return null
            return (
              <g key={node.id}>
                {/* connection dot on the trunk */}
                <circle
                  cx={RAIL_X}
                  cy={contentTop + box.y + box.h / 2}
                  r={3.5}
                  fill="#6E56F0"
                />
                <path
                  d={shiftPath(edgeStub(box), contentTop)}
                  fill="none"
                  stroke="rgba(110,86,240,0.45)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            )
          })}
        </svg>

        {/* Trigger node — BLUE structure (your input) */}
        <TriggerNode box={shiftBox(layout.trigger, contentTop)} />

        {/* Agent nodes — VIOLET (the work), with felt hierarchy + entrance stagger */}
        {workflow.nodes.map((node, i) => {
          const box = layout.nodes[node.id]
          if (!box) return null
          return (
            <AgentNode
              key={node.id}
              node={node}
              box={shiftBox(box, contentTop)}
              weight={nodeWeight(node.type)}
              index={i}
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
// Geometry helpers — shift content boxes/paths by the top padding offset
// ---------------------------------------------------------------------------

function shiftBox(box: NodeBox, dy: number): NodeBox {
  return { ...box, y: box.y + dy }
}

function shiftPath(path: string, dy: number): string {
  // Stubs are horizontal at a single y; bump the absolute y coords.
  return path.replace(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g, (_m, x, y) => {
    return `${x} ${Number(y) + dy}`
  })
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
// Agent node — violet agent, weight-tiered
// ---------------------------------------------------------------------------

const ENTER_STAGGER = [
  'craft-enter-2',
  'craft-enter-3',
  'craft-enter-4',
  'craft-enter-5',
  'craft-enter-6',
  'craft-enter-7',
  'craft-enter-8',
]

function AgentNode({
  node,
  box,
  weight,
  index,
  selected,
  hasError,
  onSelect,
}: {
  node: WorkflowNode
  box: NodeBox
  weight: NodeWeight
  index: number
  selected: boolean
  hasError: boolean
  onSelect: () => void
}) {
  const meta = NODE_VOCAB[node.type]
  const Icon = meta.icon
  const isHero = weight === 'hero'
  const isUtility = weight === 'utility'

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group absolute flex flex-col justify-center overflow-hidden rounded-[var(--radius-card)] text-left',
        'craft-enter',
        ENTER_STAGGER[Math.min(index, ENTER_STAGGER.length - 1)],
        'transition-[box-shadow,transform] duration-200 focus-visible:outline-none',
        // hierarchy: hero commands (white card + hero shadow + violet left rail),
        // standard is a calm white card, utility recedes to the inset weight.
        isHero && 'card-console-hero border-l-[3px] border-l-[#6E56F0] bg-white px-5',
        weight === 'standard' &&
          'card-console border-l-[3px] border-l-[rgba(110,86,240,0.55)] bg-white px-4',
        isUtility &&
          'card-inset border-l-[3px] border-l-[rgba(110,86,240,0.30)] px-4',
        'hover:-translate-y-[1px] hover:shadow-card-hover',
        selected && 'ring-2 ring-[#3370FF] ring-offset-2 ring-offset-[#F3F0FE]',
        hasError && 'ring-2 ring-[#DC2626] ring-offset-2 ring-offset-[#F3F0FE]',
      )}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md text-[#6E56F0]',
            isHero ? 'h-8 w-8 bg-[#EEEAFD]' : 'h-7 w-7 bg-[#EEEAFD]',
          )}
        >
          <Icon
            className={isHero ? 'h-4.5 w-4.5' : 'h-4 w-4'}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-[#6E56F0]">
          {meta.eyebrow}
        </span>
        {isHero && (
          <span className="rounded-full bg-[#EEEAFD] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#6E56F0]">
            heaviest step
          </span>
        )}
        <span className="flex-1" />
        <span
          className={cn(
            'font-[var(--font-mono)] tabular-nums text-[#6B7280]',
            isHero ? 'text-[13px] font-medium text-[#0A0A0A]' : 'text-[11px]',
          )}
        >
          {isHero ? meta.steps : meta.stepHint}
          {isHero && <span className="ml-1 text-[11px] font-normal text-[#9CA3AF]">steps</span>}
        </span>
      </div>

      <p
        className={cn(
          'truncate font-medium text-[#0A0A0A]',
          isHero ? 'mt-2 text-[15px]' : 'mt-1.5 text-[13px]',
        )}
      >
        {node.label.replace(/^[A-Za-z]+:\s*/, '')}
      </p>

      {hasError && (
        <p className="mt-0.5 font-[var(--font-mono)] text-[11px] text-[#DC2626]">
          needs a target
        </p>
      )}
    </button>
  )
}

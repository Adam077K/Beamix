/**
 * node-vocab — the small, deliberate node vocabulary (Linear-grade restraint).
 *
 * Five step types only: plan · research · do · qa · summarize.
 * Each carries a Lucide glyph + a one-word eyebrow. No more affordances than
 * the workflow needs.
 */

import {
  Compass,
  Search,
  Wand2,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import type { WorkflowNode } from '@/lib/demo/surfaces'

export type NodeType = WorkflowNode['type']

export interface NodeTypeMeta {
  /** Lucide glyph for the node type */
  icon: LucideIcon
  /** Short eyebrow word for the node card */
  eyebrow: string
  /** Quiet step-count hint shown in Geist Mono */
  stepHint: string
  /** Numeric step estimate — drives hierarchy + resting cost figure */
  steps: number
}

export const NODE_VOCAB: Record<NodeType, NodeTypeMeta> = {
  plan: { icon: Compass, eyebrow: 'PLAN', stepHint: '~1 step', steps: 1 },
  research: { icon: Search, eyebrow: 'RESEARCH', stepHint: '~2 steps', steps: 2 },
  do: { icon: Wand2, eyebrow: 'DO', stepHint: '~4 steps', steps: 4 },
  qa: { icon: ShieldCheck, eyebrow: 'QA', stepHint: '~1 step', steps: 1 },
  summarize: { icon: FileText, eyebrow: 'SUMMARISE', stepHint: '~1 step', steps: 1 },
}

/**
 * Node weight tiers drive felt hierarchy (M1): the highest-cost DO node reads as
 * the TIER-1 hero card, multi-step nodes sit at TIER-2, single-step utility nodes
 * recede toward TIER-3 .card-inset weight. The eye must land on DO first.
 */
export type NodeWeight = 'hero' | 'standard' | 'utility'

export function nodeWeight(type: NodeType): NodeWeight {
  const steps = NODE_VOCAB[type].steps
  if (steps >= 4) return 'hero'
  if (steps >= 2) return 'standard'
  return 'utility'
}

// ---------------------------------------------------------------------------
// Canvas geometry — hand-built layout (no React Flow at MVP).
//
// uix-p-builder rethink: the flow is LEFT-ANCHORED inside the canvas (not a
// dead-center ribbon in a void) and runs down a spine rail with a left gutter
// for the connector. The freed right ~40% of the frame is the persistent
// inspector/cost rail (owned by BuilderSurface). Node heights are NOT uniform:
// the dominant DO node is taller (hero), single-step utility nodes shorter, so
// the eye lands on the center of gravity. React Flow stays the documented
// escape hatch only if pan/zoom + 30+ node graphs become load-bearing.
// ---------------------------------------------------------------------------

export const NODE_W = 360 // wider — the flow now fills its column, not a ribbon
export const TRIGGER_H = 60
export const ROW_GAP = 40 // vertical gap between node cards (tighter rhythm)
export const RAIL_X = 26 // x of the vertical connector rail (left gutter)
export const NODE_X = 64 // top-left x of every card (left-anchored)

/** Per-weight card heights — felt hierarchy (M1). */
const HEIGHT_BY_WEIGHT: Record<NodeWeight, number> = {
  hero: 116,
  standard: 96,
  utility: 80,
}

export function nodeHeight(type: NodeType): number {
  return HEIGHT_BY_WEIGHT[nodeWeight(type)]
}

export interface NodeBox {
  id: string
  /** top-left x within the canvas content box */
  x: number
  /** top-left y within the canvas content box */
  y: number
  w: number
  h: number
}

/**
 * Lay nodes out on a LEFT-ANCHORED vertical flow beneath the trigger node.
 * The connector rail sits in the left gutter (RAIL_X); cards align at NODE_X.
 * Returns absolute boxes (relative to the canvas content origin) keyed by id,
 * with per-node type metadata so the renderer can pick its weight.
 */
export function layoutSpine(
  types: { id: string; type: NodeType }[],
): {
  trigger: NodeBox
  nodes: Record<string, NodeBox>
  width: number
  height: number
} {
  const triggerY = 0
  const trigger: NodeBox = {
    id: '__trigger__',
    x: NODE_X,
    y: triggerY,
    w: NODE_W,
    h: TRIGGER_H,
  }

  const nodes: Record<string, NodeBox> = {}
  let y = triggerY + TRIGGER_H + ROW_GAP
  for (const { id, type } of types) {
    const h = nodeHeight(type)
    nodes[id] = { id, x: NODE_X, y, w: NODE_W, h }
    y += h + ROW_GAP
  }

  return {
    trigger,
    nodes,
    width: NODE_X + NODE_W,
    height: y - ROW_GAP,
  }
}

/**
 * SVG path from the connector rail to a node's left edge — a calm right-angle
 * elbow that reads as one continuous pipeline down the gutter. The vertical
 * trunk is drawn separately; this returns the short horizontal stub into each
 * card's left-middle.
 */
export function edgeStub(box: NodeBox): string {
  const y = box.y + box.h / 2
  return `M ${RAIL_X} ${y} L ${box.x} ${y}`
}

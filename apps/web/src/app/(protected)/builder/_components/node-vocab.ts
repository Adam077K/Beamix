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
}

export const NODE_VOCAB: Record<NodeType, NodeTypeMeta> = {
  plan: { icon: Compass, eyebrow: 'PLAN', stepHint: '~1 step' },
  research: { icon: Search, eyebrow: 'RESEARCH', stepHint: '~2 steps' },
  do: { icon: Wand2, eyebrow: 'DO', stepHint: '~4 steps' },
  qa: { icon: ShieldCheck, eyebrow: 'QA', stepHint: '~1 step' },
  summarize: { icon: FileText, eyebrow: 'SUMMARISE', stepHint: '~1 step' },
}

// ---------------------------------------------------------------------------
// Canvas geometry — hand-built layout (no React Flow at MVP).
//
// Nodes lay out on a single vertical spine, each row centred. Edges are SVG
// paths between consecutive nodes. This is intentionally simple: the MVP node
// set is plan→research→do→qa→summarize (linear), and a hand-built layout is
// lighter and fully on-brand. React Flow is the documented escape hatch only if
// free pan/zoom + 30+ node graphs become load-bearing post-MVP.
// ---------------------------------------------------------------------------

export const NODE_W = 320
export const NODE_H = 96
export const ROW_GAP = 56 // vertical gap between node cards
export const TRIGGER_H = 64

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
 * Lay nodes out on a centred vertical spine beneath the trigger node.
 * Returns absolute boxes (relative to the canvas content origin) keyed by id.
 */
export function layoutSpine(
  nodeIds: string[],
  contentWidth: number,
): { trigger: NodeBox; nodes: Record<string, NodeBox>; height: number } {
  const cx = contentWidth / 2
  const triggerY = 0
  const trigger: NodeBox = {
    id: '__trigger__',
    x: cx - NODE_W / 2,
    y: triggerY,
    w: NODE_W,
    h: TRIGGER_H,
  }

  const nodes: Record<string, NodeBox> = {}
  let y = triggerY + TRIGGER_H + ROW_GAP
  for (const id of nodeIds) {
    nodes[id] = { id, x: cx - NODE_W / 2, y, w: NODE_W, h: NODE_H }
    y += NODE_H + ROW_GAP
  }

  return { trigger, nodes, height: y - ROW_GAP }
}

/**
 * SVG cubic path between the bottom-centre of a source box and the top-centre
 * of a target box — a calm vertical S-curve.
 */
export function edgePath(from: NodeBox, to: NodeBox): string {
  const x1 = from.x + from.w / 2
  const y1 = from.y + from.h
  const x2 = to.x + to.w / 2
  const y2 = to.y
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
}

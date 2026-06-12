'use client'

import { useState } from 'react'
import {
  Play,
  FlaskConical,
  CalendarClock,
  LayoutGrid,
  Table2,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DEMO_BUILDER } from '@/lib/demo/surfaces'
import type { Workflow } from '@/lib/demo/surfaces'
import { TemplateGallery } from './TemplateGallery'
import { WorkflowCanvas } from './WorkflowCanvas'
import { NodeConfigPanel } from './NodeConfigPanel'
import { DryRunLedger } from './DryRunLedger'
import { SheetsView } from './SheetsView'

export type BuilderState = 'empty' | 'success' | 'error'

interface BuilderSurfaceProps {
  state: BuilderState
}

type View = 'canvas' | 'sheets'

/**
 * BuilderSurface — the /builder client orchestrator.
 *
 * Template-first: the gallery is shown until a template (or blank) is chosen,
 * then the spatial canvas reveals. The dry-run ledger overlay is the signature
 * moment. Tabs toggle canvas ↔ Sheets (run orchestration).
 *
 * blue = your structure (selection, Run, schedule); violet = agent nodes +
 * dry-run ledger. Exactly ONE Fraunces beat: the workflow name in the header.
 */
export function BuilderSurface({ state }: BuilderSurfaceProps) {
  const data = DEMO_BUILDER

  // Demo users (success) open straight onto the seeded workflow; real users
  // (empty) start at the template gallery; error replays the seeded workflow
  // with a flagged node.
  const [workflow, setWorkflow] = useState<Workflow | null>(
    state === 'empty' ? null : data.workflow,
  )
  const [view, setView] = useState<View>('canvas')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [dryRunOpen, setDryRunOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Error state flags the QA node (index 3) as missing a target.
  const errorNodeIds = state === 'error' && workflow ? [workflow.nodes[3]?.id ?? ''] : []
  const dryRunErrorStep = state === 'error' ? 3 : null

  const selectedNode = workflow?.nodes.find((n) => n.id === selectedNodeId) ?? null

  function pickTemplate(_templateId: string) {
    // Design-only: every template seeds the same demo workflow shape.
    setWorkflow(data.workflow)
    setView('canvas')
  }

  function startBlank() {
    setWorkflow({ name: 'Untitled workflow', nodes: [], edges: [] })
    setView('canvas')
  }

  // ----- Template gallery (empty state) -----
  if (!workflow) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-6 py-8 sm:px-8 lg:py-12">
        <PageHeader
          eyebrow="WORKFLOW BUILDER"
          title="Compose a workflow"
          subtitle="Sequence your crew into a reusable run. Pick a proven template or start from a blank canvas — then dry-run it before a single credit is spent."
        />
        <TemplateGallery
          templates={data.templates}
          onPick={pickTemplate}
          onBlank={startBlank}
        />
      </div>
    )
  }

  const isBlank = workflow.nodes.length === 0

  return (
    <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col px-6 py-8 sm:px-8">
      {/* Header — ONE Fraunces beat: the workflow name (verdict word) */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
            WORKFLOW BUILDER
          </p>
          <h1 className="font-[var(--font-serif)] text-[28px] font-medium italic leading-[1.1] tracking-[-0.01em] text-[#0A0A0A] sm:text-[30px]">
            {workflow.name}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[15px] font-normal leading-[1.5] text-[#6B7280]">
            <span>Composed with your crew.</span>
            <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
              saved 12:04
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setDryRunOpen(true)}
            disabled={isBlank}
          >
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Dry run
          </Button>
          <Button
            className="gap-2"
            onClick={() => setConfirmOpen(true)}
            disabled={isBlank}
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Run
          </Button>
        </div>
      </header>

      {/* View toggle + schedule affordance */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="canvas" className="gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="sheets" className="gap-1.5">
              <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
              Sheets
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Schedule strip — honest manual-first (no "coming soon" tease) */}
        <button
          type="button"
          className="card-inset inline-flex items-center gap-2 px-3.5 py-2 text-left transition-colors hover:border-[#3370FF]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
        >
          <CalendarClock className="h-4 w-4 text-[#3370FF]" aria-hidden="true" />
          <span className="text-[13px] font-medium text-[#0A0A0A]">
            Set a schedule
          </span>
          <span className="text-[12px] text-[#9CA3AF]">— runs manually for now</span>
        </button>
      </div>

      {/* Body */}
      {view === 'canvas' ? (
        <div className="flex min-h-[480px] flex-1 gap-5">
          <div className="relative min-h-[480px] flex-1">
            <WorkflowCanvas
              workflow={workflow}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              errorNodeIds={errorNodeIds}
              dimmed={dryRunOpen}
            />

            {/* Empty blank canvas hint */}
            {isBlank && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[15px] font-medium text-[#6B7280]">
                    A blank canvas
                  </p>
                  <p className="mt-1 text-[13px] text-[#9CA3AF]">
                    Add your first agent to begin composing.
                  </p>
                </div>
              </div>
            )}

            {/* Error banner — names the recovery */}
            {state === 'error' && !dryRunOpen && (
              <div className="absolute inset-x-0 bottom-4 mx-auto w-fit max-w-[90%] rounded-full border border-[#FDECEC] bg-white px-4 py-2 shadow-card">
                <p className="text-[13px] font-medium text-[#DC2626]">
                  QA step needs a target brand. Open it to fix, then re-run.
                </p>
              </div>
            )}
          </div>

          {/* Dry-run ledger overlay column (signature) */}
          {dryRunOpen && (
            <div className="craft-enter craft-enter-1 w-full max-w-[420px] shrink-0">
              <DryRunLedger
                workflow={workflow}
                steps={data.dryRun.steps}
                estCost={data.dryRun.estCost}
                errorAtStep={dryRunErrorStep}
                onClose={() => setDryRunOpen(false)}
              />
            </div>
          )}
        </div>
      ) : (
        <SheetsView savedWorkflows={data.savedWorkflows} />
      )}

      {/* Node config panel */}
      <NodeConfigPanel
        node={selectedNode}
        open={selectedNodeId != null && view === 'canvas'}
        onClose={() => setSelectedNodeId(null)}
      />

      {/* Run-for-real confirm — shows the same honest cost */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Run this workflow?</DialogTitle>
            <DialogDescription className="text-[14px] leading-[1.5]">
              All {workflow.nodes.length} steps will execute against your live
              data. This consumes credits.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-[#E5E7EB] bg-[#F7F6F2] px-4 py-3">
            <span className="text-[13px] text-[#6B7280]">Estimated cost</span>
            <span className="font-[var(--font-mono)] text-[15px] font-medium tabular-nums text-[#0A0A0A]">
              ~{data.dryRun.estCost}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => setConfirmOpen(false)}>
              <Check className="h-4 w-4" aria-hidden="true" />
              Run for real
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  CalendarClock,
  LayoutGrid,
  Table2,
  Check,
  Plus,
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
import { BuilderRail } from './BuilderRail'
import { SheetsView } from './SheetsView'
import { TEMPLATE_WORKFLOWS } from './template-seeds'

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

  function pickTemplate(templateId: string) {
    // Use a distinct workflow shape per template id; fall back to the hero workflow.
    const seeded = TEMPLATE_WORKFLOWS[templateId] ?? data.workflow
    setWorkflow(seeded)
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
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

        {/* Schedule strip — honest manual-first (no "coming soon" tease) */}
        <button
          type="button"
          className="card-inset inline-flex shrink-0 items-center gap-2 px-3.5 py-2 text-left transition-colors hover:border-[#3370FF]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
        >
          <CalendarClock className="h-4 w-4 text-[#3370FF]" aria-hidden="true" />
          <span className="text-[13px] font-medium text-[#0A0A0A]">
            Set a schedule
          </span>
          <span className="text-[12px] text-[#9CA3AF]">— runs manually for now</span>
        </button>
      </header>

      {/* View toggle */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
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
      </div>

      {/* Body */}
      {view === 'canvas' ? (
        // M3 asymmetry: dominant left flow + persistent right rail (~360px).
        // The rail earns the freed width — at rest it shows the resting cost
        // figure; on dry-run it becomes the streaming ledger in place.
        <div className="grid min-h-[520px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Dominant flow column */}
          <div className="craft-enter craft-enter-2 relative min-h-[520px] min-w-0">
            <WorkflowCanvas
              workflow={workflow}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              errorNodeIds={errorNodeIds}
              dimmed={dryRunOpen}
            />

            {/* Empty blank canvas hint */}
            {isBlank && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-[320px] text-center">
                  <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEEAFD] text-[#6E56F0]">
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-[15px] font-medium text-[#0A0A0A]">
                    A blank canvas
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-[#6B7280]">
                    Add your first agent — plan, research, do, QA, summarise — to
                    begin composing your pipeline.
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

          {/* Persistent right rail — resting cost OR streaming ledger (signature) */}
          <aside className="craft-enter craft-enter-3 min-w-0 lg:sticky lg:top-6 lg:self-start">
            {dryRunOpen ? (
              <DryRunLedger
                workflow={workflow}
                steps={data.dryRun.steps}
                estCost={data.dryRun.estCost}
                errorAtStep={dryRunErrorStep}
                onClose={() => setDryRunOpen(false)}
              />
            ) : (
              <BuilderRail
                workflow={workflow}
                estCost={data.dryRun.estCost}
                onDryRun={() => setDryRunOpen(true)}
                onRun={() => setConfirmOpen(true)}
                disabled={isBlank}
              />
            )}
          </aside>
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
              All {workflow.nodes.length} stages will execute against your live
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

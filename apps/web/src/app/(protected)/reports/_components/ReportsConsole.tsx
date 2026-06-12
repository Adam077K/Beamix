'use client'

/**
 * ReportsConsole — the Reports & Exports compose-and-share surface.
 *
 * Three-zone shell on a max-w-[1200px] grid:
 *   [Left rail 240px: block library] | [Center: report canvas] | [Right drawer 320px]
 * <1024px: rail → "+ Add block" Sheet; drawer → bottom Sheet.
 *
 * Routes all four states (loading / empty / error / success) and owns the
 * composing state: the list of active block ids, the editable title, add /
 * remove / reorder. Pure client state — ZERO backend (Phase 1B design surface).
 *
 * Design laws applied:
 *  M1  — depth staging: TIER-1 cover hero · TIER-2 viz tiles · TIER-3 inset rail
 *  M2  — type contract: ONE 64px mono figure (the cover) on the surface
 *  M3  — asymmetry: cover full-width, then weighted [1fr_360px] 2-up — never an N-equal grid
 *  M4  — signature detail: EngineMicroSparkline on engine tiles
 *  M5  — ONE Fraunces beat: the cover verdict word (SerifVerdict)
 *  M6  — violet structure: agent blocks carry a violet hairline + dot; never a button
 *  M9  — craft-enter stagger on tiles; reduced-motion safe
 *  M11 — every number / timestamp Geist Mono tabular-nums
 *  M12 — 40px rhythm between block clusters, not a global space-y
 *  Signature moment — the cover's 64px mono figure + single Fraunces verdict word.
 */

import { useMemo, useState } from 'react'
import { Plus, PanelRightOpen, Layers } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DEMO_REPORTS } from '@/lib/demo/surfaces'
import { cn } from '@/lib/utils'

import { BlockLibrary } from './BlockLibrary'
import { ReportCover } from './ReportCover'
import { ReportTile } from './ReportTile'
import { SavedReportsLedger } from './SavedReportsLedger'
import { ExportDrawer } from './ExportDrawer'
import { RailSkeleton, CanvasSkeleton } from './ReportsSkeleton'
import { tileForBlock } from './block-content'

export type ReportsState = 'loading' | 'empty' | 'error' | 'success'

interface ReportsConsoleProps {
  state: ReportsState
}

const HEADER = {
  title: 'Reports & Exports',
  subtitle: 'Compose a custom report, then export, schedule, or share it.',
}

const SAVED_META = 'Saved 11 Jun 2026 · 14:23'

// Starter blocks used by the empty-state "Use the Visibility starter" CTA.
const STARTER_BLOCKS = [
  'blk-visibility-score',
  'blk-engine-breakdown',
  'blk-rank-deltas',
  'blk-ai-summary',
]

export function ReportsConsole({ state: initialState }: ReportsConsoleProps) {
  const fixture = DEMO_REPORTS
  const [state, setState] = useState<ReportsState>(initialState)

  // The cover (Visibility Score) is the TIER-1 focal and not part of the
  // re-orderable body block list — the body starts after it.
  const [title, setTitle] = useState(fixture.activeReport.title)
  const [blocks, setBlocks] = useState<string[]>(
    initialState === 'success'
      ? fixture.activeReport.blocks.filter((b) => b !== 'blk-visibility-score')
      : [],
  )
  const [railOpen, setRailOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const catalogById = useMemo(
    () => new Map(fixture.blockCatalog.map((b) => [b.id, b])),
    [fixture.blockCatalog],
  )

  // Active ids include the implicit cover so the library marks it "added".
  const activeIds = useMemo(() => ['blk-visibility-score', ...blocks], [blocks])

  function addBlock(id: string) {
    if (id === 'blk-visibility-score' || blocks.includes(id)) return
    setBlocks((prev) => [...prev, id])
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b !== id))
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function applyStarter() {
    setTitle('Visibility Report — Draft')
    setBlocks(STARTER_BLOCKS.filter((b) => b !== 'blk-visibility-score'))
    setState('success')
  }

  function startBlank() {
    setTitle('Untitled report')
    setBlocks([])
    setState('success')
  }

  const hasCanvas = state === 'success'
  const totalBlocks = activeIds.length

  // -------------------------------------------------------------------------
  // Shared rail (desktop column + mobile Sheet body)
  // -------------------------------------------------------------------------
  const railBody = (
    <BlockLibrary
      blocks={fixture.blockCatalog}
      activeIds={activeIds}
      onAdd={(id) => {
        addBlock(id)
        setRailOpen(false)
      }}
    />
  )

  // -------------------------------------------------------------------------
  // CENTER — canvas body per state
  // -------------------------------------------------------------------------
  let canvas: React.ReactNode

  if (state === 'loading') {
    canvas = <CanvasSkeleton />
  } else if (state === 'error') {
    canvas = (
      <ErrorState
        title="Couldn’t save this report"
        description="Your blocks are safe. Retry the save — it usually clears right up."
        onRetry={() => setState('success')}
        retryLabel="Retry save"
      />
    )
  } else if (state === 'empty') {
    canvas = (
      <EmptyState
        illustration="workspace"
        align="top"
        title="Build your first report"
        description="Pick a block from the left to start, or use a starter."
        action={
          <div className="flex flex-col items-center gap-3">
            <Button onClick={applyStarter}>Use the Visibility starter</Button>
            <button
              type="button"
              onClick={startBlank}
              className="text-sm font-medium text-[#6B7280] underline-offset-4 transition-colors hover:text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Start blank
            </button>
          </div>
        }
      />
    )
  } else {
    // POPULATED canvas
    canvas = <PopulatedCanvas
      title={title}
      onTitleChange={setTitle}
      blocks={blocks}
      catalogById={catalogById}
      totalBlocks={totalBlocks}
      onRemove={removeBlock}
      onMove={moveBlock}
      savedReports={fixture.savedReports}
      onOpenSaved={() => setState('success')}
    />
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title={HEADER.title}
        subtitle={HEADER.subtitle}
        action={
          hasCanvas ? (
            <Button onClick={startBlank} className="gap-2">
              <Plus className="h-4 w-4" /> New report
            </Button>
          ) : undefined
        }
      />

      {/* Mobile controls — rail + drawer become Sheets <1024px */}
      {hasCanvas && (
        <div className="mb-5 flex items-center gap-2 lg:hidden">
          <Sheet open={railOpen} onOpenChange={setRailOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="h-4 w-4" /> Add block
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  Blocks
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4">{railBody}</div>
            </SheetContent>
          </Sheet>

          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelRightOpen className="h-4 w-4" /> Export &amp; share
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="sr-only">Export and share</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ExportDrawer
                  shareUrl={fixture.savedReports[1]?.shareUrl ?? null}
                  connectors={fixture.connectors}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Three-zone grid */}
      <div
        className={cn(
          'grid grid-cols-1 gap-x-8 gap-y-6',
          'lg:grid-cols-[240px_minmax(0,1fr)]',
          hasCanvas && 'xl:grid-cols-[240px_minmax(0,1fr)_320px]',
        )}
      >
        {/* LEFT RAIL (desktop) */}
        <aside className="hidden lg:block">
          {state === 'loading' ? <RailSkeleton /> : railBody}
        </aside>

        {/* CENTER CANVAS */}
        <main className="min-w-0">{canvas}</main>

        {/* RIGHT DRAWER (desktop xl, only when canvas has blocks) */}
        {hasCanvas && (
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <ExportDrawer
                shareUrl={fixture.savedReports[1]?.shareUrl ?? null}
                connectors={fixture.connectors}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Populated canvas — cover + body tiles + saved-reports ledger
// ---------------------------------------------------------------------------

interface PopulatedCanvasProps {
  title: string
  onTitleChange: (v: string) => void
  blocks: string[]
  catalogById: Map<string, { id: string; label: string; kind: 'user' | 'agent' }>
  totalBlocks: number
  onRemove: (id: string) => void
  onMove: (index: number, dir: -1 | 1) => void
  savedReports: typeof DEMO_REPORTS.savedReports
  onOpenSaved: () => void
}

function PopulatedCanvas({
  title,
  onTitleChange,
  blocks,
  catalogById,
  totalBlocks,
  onRemove,
  onMove,
  savedReports,
  onOpenSaved,
}: PopulatedCanvasProps) {
  return (
    <div>
      {/* Title + mono meta */}
      <div className="mb-6">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="Report title"
          className="w-full bg-transparent font-[var(--font-display)] text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:text-[#0A0A0A] sm:text-[30px]"
          placeholder="Untitled report"
        />
        <p className="mt-2 font-mono text-[13px] tabular-nums text-[#9CA3AF]">
          {SAVED_META} · {totalBlocks} blocks
        </p>
      </div>

      {/* TIER-1 cover — full width, the ONE Fraunces beat */}
      <div className="craft-enter craft-enter-1 mb-10">
        <ReportCover figure="68" unit="/ 100" verdict="improving" />
      </div>

      {/* Body tiles — asymmetric, 40px cluster rhythm */}
      {blocks.length > 0 ? (
        <BodyGrid
          blocks={blocks}
          catalogById={catalogById}
          totalBlocks={totalBlocks}
          onRemove={onRemove}
          onMove={onMove}
        />
      ) : (
        <div className="card-inset flex flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-[15px] font-medium text-[#0A0A0A]">
            Add a block to build out this report
          </p>
          <p className="max-w-[320px] text-[13px] text-[#6B7280]">
            Your cover is set. Pick blocks from the library to add data, agent
            activity, and a summary.
          </p>
        </div>
      )}

      {/* Saved-reports ledger */}
      <SavedReportsLedger reports={savedReports} onOpen={onOpenSaved} />
    </div>
  )
}

/**
 * BodyGrid — lays the body tiles out asymmetrically (M3): the first tile takes
 * the wide column, paired with the second in a [1fr_360px] 2-up; remaining tiles
 * stack full-width. Never an N-equal grid.
 */
function BodyGrid({
  blocks,
  catalogById,
  totalBlocks,
  onRemove,
  onMove,
}: {
  blocks: string[]
  catalogById: Map<string, { id: string; label: string; kind: 'user' | 'agent' }>
  totalBlocks: number
  onRemove: (id: string) => void
  onMove: (index: number, dir: -1 | 1) => void
}) {
  const renderTile = (id: string, index: number, staggerIndex: number) => {
    const meta = catalogById.get(id)
    const tile = tileForBlock(id, meta?.label ?? id, meta?.kind ?? 'user')
    const stagger = Math.min(staggerIndex + 2, 8)
    return (
      <div className={cn('craft-enter', `craft-enter-${stagger}`)}>
        <ReportTile
          tile={tile}
          // +1 for the implicit cover at position 0 in the full report.
          index={index}
          total={totalBlocks - 1}
          onRemove={() => onRemove(id)}
          onMove={(dir) => onMove(index, dir)}
        />
      </div>
    )
  }

  const [first, second, ...rest] = blocks

  return (
    <div className="flex flex-col gap-10">
      {/* Weighted 2-up: first wide, second narrow */}
      {second ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          {renderTile(first, 0, 0)}
          {renderTile(second, 1, 1)}
        </div>
      ) : (
        first && renderTile(first, 0, 0)
      )}

      {/* Remaining tiles — full-width stack */}
      {rest.map((id, i) => (
        <div key={id}>{renderTile(id, i + 2, i + 2)}</div>
      ))}
    </div>
  )
}

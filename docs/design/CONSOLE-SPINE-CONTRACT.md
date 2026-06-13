# Console Spine Contract
**Status:** CANONICAL for Phase 1 surface workers.
**Source:** `CONSOLE-SPINE-DIRECTION.md` + `CRAFT-SYSTEM.md` + `DESIGN-VISION.md`.
**Integration base branch:** `feat/surface-design-phase1`

---

## 1. Component prop signatures

All shared components live at `apps/web/src/components/console/`.
Surface workers MUST NOT modify these files.

### ToolPage (`console/ToolPage.tsx`)

```typescript
type ToolPageState = 'idle' | 'running' | 'success' | 'empty' | 'error'

interface ToolPageProps {
  // Zone 1 — Context Header (TIER-3 .card-inset)
  eyebrow: string                  // STEP-3: business name / context label
  title: string                    // STEP-2: 30px InterDisplay-Medium tool heading
  whatThisDoes: string             // STEP-4: 15px #6B7280 one-line description
  contextStat: ReactNode           // right rail: <ContextStat> or custom

  // Zone 2 — Input Panel (TIER-2 .card-console or .card-inset when collapsed)
  inputPanel: ReactNode            // full expanded input form
  collapsedSummary?: ReactNode     // <InputSummaryBar> after a successful run
  inputCollapsed?: boolean         // true → show collapsedSummary instead
  onToggleInput?: () => void       // called when user wants to re-expand

  // Zone 3 — Run Control
  runControl: ReactNode            // <RunControl> or custom

  // Zone 4 — Pipeline Ledger (running state only)
  ledger?: ReactNode               // <PipelineLedger> while state='running'

  // Zone 5 — Output Zone (TIER-1 .card-console-hero when success)
  output?: ReactNode               // result content, EmptyState, or ErrorState

  // State routing
  state: ToolPageState

  // Zone 6 — History link
  historyHref?: string             // '/archive' by default
}
```

State routing:
- `idle` → Zones 1, 2 (expanded), 3
- `running` → Zones 1, 2 (any), 3, 4 (ledger)
- `success` → Zones 1, 2 (collapsed), 3, 5 (TIER-1 output)
- `empty` → Zones 1–3, 5 (EmptyState — no card wrapper)
- `error` → Zones 1–3, 5 (ErrorState — no card wrapper)

### ContextStat (`console/ContextStat.tsx`)

```typescript
interface ContextStatProps {
  value: string | number           // STEP-1: 64px Geist Mono tabular hero figure
  label: string                    // STEP-3: 12px uppercase muted label
  sparklinePoints: number[] | null // last ~5 scores; null = flat baseline, never fake
  currentScore: number | null      // for color band; null = no color on sparkline
}
```

### InputSummaryBar (`console/InputSummaryBar.tsx`)

```typescript
interface InputSummaryBarProps {
  summary: string                  // e.g. "3 pages · ChatGPT, Gemini"
  onExpand: () => void             // called on "Change inputs" click
}
```

Renders as a 44px `.card-inset` bar. Mono text + blue "Change inputs" link.

### SerifVerdict (`console/SerifVerdict.tsx`)

```typescript
interface SerifVerdictProps {
  children: ReactNode              // exactly ONE Fraunces italic word
}
```

Usage: `<p>Your visibility is <SerifVerdict>climbing</SerifVerdict> this week.</p>`
NEVER standalone. NEVER in nav, cards, tables, or forms. One per screen.

### ModeToggle (`console/ModeToggle.tsx`)

```typescript
type RunMode = 'myself' | 'beamix'

interface ModeToggleProps {
  mode: RunMode
  onChange: (mode: RunMode) => void
  allotmentLabel?: string          // e.g. "6 of 10 autonomous runs left"
  uncapped?: boolean               // true → shows "uncapped · concierge"
  disabled?: boolean
}
```

Color contract (LAW — do not override):
- Left "Run it myself" ACTIVE → `bg-[#3370FF]` fill + white text (blue = you)
- Right "Let Beamix handle it" ACTIVE → `bg-[#EEEAFD]` fill + `ring-1 ring-inset ring-[#6E56F0]` (VIOLET NEVER SOLID)
- INACTIVE segments → neutral `#6B7280`

### RunControl (`console/RunControl.tsx`)

```typescript
type RunState = 'enabled' | 'cap-exhausted' | 'tier-locked'

interface RunControlProps {
  mode: RunMode
  onModeChange: (mode: RunMode) => void
  onRun: () => void
  runLabel?: string                // default 'Run'
  runState: RunState
  allotmentLabel?: string
  uncapped?: boolean
  scheduleHref?: string            // default '/automation'
  lockedTierCta?: ReactNode        // upgrade link for tier-locked state
}
```

Consequence matrix:
- `mode=myself` + `enabled` → blue `<Button variant="default">`
- `mode=myself` + `cap-exhausted` → disabled button + quiet routing link to beamix mode
- `mode=myself` + `tier-locked` → `<Button variant="tier-locked">` + `lockedTierCta`
- `mode=beamix` → "Configure schedule →" link + allotment explainer (no run button)

### PipelineLedger + StageRow (`console/PipelineLedger.tsx`, `console/StageRow.tsx`)

```typescript
// From console/pipeline-contract.ts
type StageStatus = 'queued' | 'active' | 'done' | 'error'

interface StageState {
  id: PipelineStage                // from lib/agents/types
  label: string
  status: StageStatus
  substep?: string | null          // live substep string while active
}

interface PipelineLedgerProps {
  stages: StageState[]
  agentLabel: string               // e.g. "Content Optimizer"
  currentSubstep: string | null    // streams under the ledger (cross-fade)
  clearing?: boolean               // true = run completion handoff
  onCleared?: () => void           // called after lift-out completes
}
```

Violet structure (M6 law):
- Ground: `bg-[#EEEAFD]` (--color-agent-tint)
- Border: `rgba(110,86,240,0.12)` hairline
- Top accent: 4px `#6E56F0` bar
- DONE glyph: filled `#6E56F0` check circle
- ACTIVE glyph: spinning `border-t-[#6E56F0]` ring + scan-shimmer
- QUEUED: hollow `#E5E7EB` ring, `#9CA3AF` text
- ERROR: `#9CA3AF` "couldn't reach {label}"

Completion handoff (verbatim from ScanningLedger): `clearing=true` → 250ms hold → lift-out → `onCleared()`.

---

## 2. Reuse table

| Need | Use (do NOT duplicate) |
|------|------------------------|
| Loading skeleton | `components/loading-state.tsx` → `<Skeleton>` / `<LoadingState>` |
| Empty state | `components/empty-state.tsx` → `<EmptyState>` |
| Error state | `components/error-state.tsx` → `<ErrorState>` |
| Page title / breadcrumb | `components/page-header.tsx` → `<PageHeader>` |
| Sidebar nav | `components/sidebar.tsx` (DO NOT EDIT) |
| Sparkline | `components/dashboard/EngineMicroSparkline.tsx` |
| All Shadcn/UI | `components/ui/*` |
| Card shadows | `.card-console` / `.card-console-hero` / `.card-inset` (globals.css) |
| Entrance animation | `.craft-enter` + `.craft-enter-{1..8}` (globals.css) |
| Scan animations | `scan-spin`, `scan-shimmer` keyframes (globals.css — reused by StageRow) |
| Button variants | `components/ui/button.tsx` incl. `variant="tier-locked"` |
| Agent types | `lib/agents/types.ts` → `PipelineStage`, `PlanTier`, `AgentType` |
| Demo business | `lib/demo/surfaces/types.ts` → `DEMO_BUSINESS` |

---

## 3. Fixtures convention

### Barrel exports — FROZEN

`apps/web/src/lib/demo/surfaces/index.ts` exports all 8 surface consts:

```typescript
export { DEMO_PROMPTS }    // prompts.ts
export { DEMO_CONTENT }    // content.ts
export { DEMO_SCHEMA }     // schema.ts
export { DEMO_RUNS }       // archive.ts
export { DEMO_COMPETITORS }// competitors.ts
export { DEMO_AUTOMATION } // automation.ts
export { DEMO_OFFSITE }    // offsite.ts
export { DEMO_BLOG }       // blog-studio.ts
```

These export names are frozen. Do not rename or add new exports to `index.ts`.

### Adding data

Surface workers add richer fixture data by editing their own fixture file only:
- `prompts.ts` for the Prompts surface worker
- `content.ts` for the Content surface worker
- etc.

Do NOT add fields to `types.ts` without design-lead approval (it affects every surface).

### Shape contract

Each fixture is typed `as const` (or explicitly typed) against the interfaces in `types.ts`.
If `types.ts` doesn't have the field you need, add it to `types.ts` in a separate PR and get
approval — do not use `any` or untyped objects.

---

## 4. Violet recolor note

The `PipelineLedger` + `StageRow` are a direct violet-recolor of the shipped scan ledger
(`ScanningLedger` + `EngineRow`). Every instance of `#3370FF` → `#6E56F0`, every
`--color-accent` → `--color-agent`, every blue tint → violet tint `#EEEAFD`.

The scan-spin + scan-shimmer keyframes are SHARED (defined in globals.css) — StageRow
reuses them with violet colors, not new keyframes.

---

## 5. File ownership for surface workers

Each surface worker owns EXACTLY:
1. Their route directory: `apps/web/src/app/(protected)/<surface>/`
2. Their fixture file: `apps/web/src/lib/demo/surfaces/<surface>.ts`

### DO NOT TOUCH (owned by the integration base / shared infra)

| File | Owner |
|------|-------|
| `apps/web/src/components/console/*` | Integration base |
| `apps/web/src/components/sidebar.tsx` | Integration base |
| `apps/web/src/app/globals.css` | Integration base |
| `apps/web/src/lib/demo/surfaces/index.ts` | Integration base (FROZEN) |
| `apps/web/src/lib/demo/surfaces/types.ts` | Design-lead approval required |
| `apps/web/src/lib/demo/surfaces/<other>*.ts` | The surface worker who owns it |
| Any shipped component (`empty-state`, `error-state`, `loading-state`, `page-header`, `ui/*`) | Integration base |
| `apps/web/src/lib/agents/types.ts` | ai-engineer |
| `apps/web/src/lib/agents/config/registry.ts` | ai-engineer |

Violation of this ownership table → PR returned BLOCKED by QA-Lead.

---

## 6. Design laws (summary — see DESIGN-VISION.md for full text)

1. `#3370FF` is the only primary/CTA color. One per surface.
2. Blue = you, violet = the agents. Violet NEVER on a button.
3. Product headings: InterDisplay-Medium 30px / -0.02em.
4. 8pt grid. `rounded-lg` utility radius.
5. All four states designed: loading, empty, error, success.
6. Motion is minimal. `prefers-reduced-motion` fallback always.
7. Every number is Geist Mono tabular-nums (M11).
8. One Fraunces beat per screen via `<SerifVerdict>`. Never in chrome.
9. The PipelineLedger is the only animated set-piece per surface (M9).
10. No N-equal grids (M3). Dominant column + rail asymmetry inside zones.

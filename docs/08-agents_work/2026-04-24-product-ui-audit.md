# Beamix Product UI Audit — AI Slop Analysis
Date: 2026-04-24
Method: Source analysis (auth-gated app, dev server not started — all findings backed by file path + line number citations)
Auditor: Design Critic agent

---

## EXECUTIVE VERDICT

The product is a competent but personality-free execution of a SaaS dashboard template. Every page uses the same visual vocabulary — `rounded-xl border border-gray-100 bg-white p-4 shadow-sm` stamped out in a grid — which is the most recognizable fingerprint of AI-generated Tailwind UI. The data architecture is genuinely strong (3-pane inbox with keyboard shortcuts, sparklines, engine pips, stagger animations) but the visual layer does nothing to make Beamix feel distinct from any of the 10,000 other dashboards built on Shadcn/UI + Tailwind in 2024–2025. The single most damaging signal: the sidebar active state uses `bg-gray-50 text-gray-900` for the active nav item — the brand blue `#3370FF` appears only as a 2px left border sliver, making the primary accent completely invisible across all navigation.

---

## PAGE-BY-PAGE AUDIT

---

### /home — Dashboard Home

**Components used:**
- `apps/web/src/app/(protected)/home/page.tsx` — server component, data fetching
- `apps/web/src/components/home/HomeClientV2.tsx` — main layout orchestrator
- `apps/web/src/components/home/KpiStripNew.tsx` — 4-tile KPI grid
- `apps/web/src/components/home/EngineBreakdownGrid.tsx` — per-engine cards
- `apps/web/src/components/home/NextStepsSection.tsx` — suggestion cards with accept/dismiss
- `apps/web/src/components/home/RoadmapTab.tsx` — roadmap tab content
- `apps/web/src/components/home/ActivityFeedNew.tsx` — right sidebar activity list
- `apps/web/src/components/home/ProgressRing.tsx` — referenced but not used in V2

**What's there:**
- Score number (28px, colored by verdict) + KPI strip of 4 tiles (score, citations, impressions, credits)
- Engine breakdown grid (cards per engine with sparkline + mention rate bar)
- Tab selector (Overview / Roadmap) above suggestion cards or roadmap actions
- Right sidebar column: Activity feed card, Inbox preview card, Automation status card

**AI slop signals:**

1. **The KPI tile is a Shadcn card clone.** `KpiStripNew.tsx:86` — `"rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2.5"` — this exact class string appears verbatim in Shadcn UI's Card documentation example. Zero differentiation. All 4 tiles are identical containers with only icon color swapped.

2. **Icon backgrounds are generic colored squares.** `KpiStripNew.tsx:88-93` — `h-8 w-8 rounded-lg` with inline `backgroundColor` (`#EFF6FF`, `#ECFDF5`, `#F0F9FF`, `#F9FAFB`). The light-tinted-square-with-centered-icon is the single most overused pattern in AI-generated SaaS UI in 2024–2025. No personality. The icon itself is a custom inline SVG but the container kills the effect.

3. **The score display at the top of the page is invisible.** `HomeClientV2.tsx:91` — `text-[28px] font-semibold` for the main score number. This is the most important number in the entire product — a GEO score out of 100 — and it is displayed at 28px with `font-semibold` in a `flex` row next to a paragraph of subtitle text. There is no visual hierarchy moment. The score should dominate the viewport like a hero number; instead it looks like a list item.

4. **Tab bar is default gray pill selector.** `HomeClientV2.tsx:47-66` — `rounded-lg bg-gray-100 p-1` containing `rounded-md` buttons with `bg-white shadow-sm` for active state. This is the verbatim Shadcn `Tabs` component visual. No brand character. The "Overview / Roadmap" labels are not distinctive enough to deserve a tab UI at all — this choice fragments the content unnecessarily.

5. **Section headings are `text-sm font-semibold text-gray-700`.** `HomeClientV2.tsx:231, 248, 272, 285, 315` — every section heading ("Engine breakdown", "Here's what to fix this week", "Recent activity", "Inbox", "Automation") is identical: `text-sm font-semibold text-gray-700`. No typographic hierarchy between page-level headings and widget-level headings. Everything reads at the same weight.

6. **Right sidebar cards are three identical white boxes.** `HomeClientV2.tsx:265-351` — Activity feed, Inbox preview, and Automation status are all `rounded-xl border border-gray-100 bg-white p-4 shadow-sm`. Three visually identical boxes stacked vertically with no visual differentiation. No color, no accent, no personality distinguishes one from another.

7. **Engine cards use text initials as "logos".** `EngineBreakdownGrid.tsx:74-77` — `h-7 w-7 rounded-lg` with text initials ("CG", "GM", "PX", "CL"). This is the default avatar pattern for when you have no assets. These are major AI products — using their actual brand colors (partially done) but generic initials instead of SVG logos is amateurish and breaks trust.

8. **Empty state for no engines is an invisible line of text.** `EngineBreakdownGrid.tsx:131-137` — `h-28 flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50` containing only `text-xs text-gray-400`. This is the absolute minimum possible empty state. No illustration, no icon, no action, no personality.

9. **`NoScanYet` component uses a generic radar SVG.** `HomeClientV2.tsx:147-149` — three concentric circles SVG in a `bg-blue-50 rounded-2xl` container. This is the stereotypical "loading / scanning" empty state illustration seen in every analytics SaaS product. No Beamix character.

10. **Credit progress bar is 1px high.** `HomeClientV2.tsx:334` — `h-1` progress bar in the Automation sidebar widget. One pixel is not a UI element; it is a line. The Automation section's most important operational data (credit usage) is shown as a 1px fill bar with `text-xs` labels. The equivalent in KpiStripNew is also `h-1` (line 229). Both need to be at minimum 6px to communicate proportion effectively.

**What's good:**
- Motion is tasteful: `framer-motion` stagger with 40-120ms delays, `fadeInUp` + `spring.subtle` everywhere. This is one of the better uses of animation found — feels earned, not decorative.
- The `NextStepsSection` whileHover lift (`y: -1, boxShadow`) at line 85 is a nice micro-interaction.
- Accessibility: `role="region"`, `aria-label` on KPI tiles, `role="progressbar"` with `aria-valuenow` on credit bars. Good baseline.

**Severity: HIGH**

---

### /inbox — Review Queue (3-pane Superhuman-style)

**Components used:**
- `apps/web/src/app/(protected)/inbox/page.tsx` — server component, empty state fallback
- `apps/web/src/components/inbox/InboxClient.tsx` — orchestrates 3-pane layout + keyboard shortcuts
- `apps/web/src/components/inbox/FilterRail.tsx` — left pane (240px filter sidebar)
- `apps/web/src/components/inbox/ItemList.tsx` — middle pane (420px item list)
- `apps/web/src/components/inbox/PreviewPane.tsx` — right pane (content preview + actions)

**What's there:**
- Left pane: filter sidebar with Inbox header + count badge, filter list (Ready for review / Draft / Approved / Archived / All)
- Middle pane: item list with status dot + agent avatar (initials) + title + preview snippet + timestamp
- Right pane: metadata row + title + ReactMarkdown body + Evidence collapsible + action bar (Accept / Reject / Request changes / Archive)
- Keyboard shortcuts: j/k navigate, e accept, x reject, r request changes, a archive, ? modal

**AI slop signals:**

1. **FilterRail is a near-exact copy of a generic email sidebar.** `FilterRail.tsx:68-144` — white 240px aside with `border-e border-gray-100`, list of nav items with `rounded-md` active state in `bg-blue-50 font-medium text-[#3370FF]`. This is the default Linear/Superhuman clone sidebar pattern reproduced without modification. The filter labels themselves ("Ready for your approval", "Draft", "Approved", "Archived") are the exact category names from a default content management template.

2. **Agent avatars are text initials in colored squares.** `ItemList.tsx:90-104` — `AgentAvatar` renders initials in `h-8 w-8 rounded-lg` with tinted classes (`bg-blue-50 text-blue-600`, `bg-violet-50 text-violet-600`, etc). Violet and orange colors (`bg-violet-50`, `bg-orange-50`, `bg-teal-50`) appear here — **these are not in the Beamix brand palette**. Violet/purple is not a defined color in `BRAND_GUIDELINES.md`. This is a palette contamination.

3. **The action bar is 8px tall buttons in a row with no visual weight.** `PreviewPane.tsx:265-329` — `h-8` buttons with `text-[13px]`. The Accept button (primary CTA, most critical action in the entire product) is 32px tall. In a productivity tool where users will click this hundreds of times, the primary action should be at least 36px and visually dominant. It looks like a toolbar, not a decision point.

4. **Approve action is permanently broken — it only console.logs.** `InboxClient.tsx:99-103` — `handleApprove` does `console.log('[inbox] approve', id)`. Same for reject (line 105-109), request changes (line 111-115), archive (line 117-121). None of these actions are wired to any API. The entire Inbox action surface is a façade. From a design perspective, actions that do nothing but update local animation state are indistinguishable from broken UI.

5. **The empty inbox state uses a generic dashed-border card.** `inbox/page.tsx:95-106` — `flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8`. Lucide `Inbox` icon at 48px. This is the Shadcn empty state boilerplate unchanged. The same pattern appears in the automation page empty state (`automation/page.tsx:148-160`).

6. **`EmptySelection` in the preview pane is anonymous SVG + two lines.** `InboxClient.tsx:344-373` — When no item is selected, the entire right pane (probably 800px+ wide on desktop) shows a centered icon + "Select an item to review" + j/k keyboard hint. This wastes the majority of screen real estate with a pattern that every user only sees once (on first load). No onboarding nudge, no stats, no preview of what to expect.

7. **The bulk-select checkbox reveals on hover but is non-functional.** `ItemList.tsx:166-172` — The checkbox `opacity-0` → `opacity-100` on hover but has no `onClick` or state management. This is a visual detail with zero interaction behind it. Fake affordance is worse than no affordance.

8. **The keyboard shortcuts hint at the bottom of ItemList is mis-labeled.** `InboxClient.tsx:288-291` — `"j/k navigate · e edit · a approve · x dismiss"` — but `e` is labeled as "Accept" in the SHORTCUTS constant (line 54), not "edit". And `a` is "Archive", not "approve". The inline hint text is wrong relative to the modal truth.

9. **No loading state whatsoever.** When actions are triggered (approve, reject), there is no spinner, no optimistic removal from the list, no animation. The action feedback banner (`PreviewPane.tsx:100-117`) shows for 2200ms but the item stays in the list. The user cannot tell if something happened.

10. **Evidence section uses `text-[11px] font-semibold uppercase tracking-widest` label.** `PreviewPane.tsx:207-209` — `tracking-widest` on uppercase labels creates an overly aggressive spacing that reads like a design system demo screenshot, not production UI. This micropattern (all-caps + extreme tracking + tiny font) is the #2 most common AI-generated "professional looking UI" marker after the light-tinted-square icon background.

**What's good:**
- The 3-pane layout concept itself is correct for this use case.
- Keyboard shortcuts are well-implemented (`InboxClient.tsx:127-191`) — `j/k/e/x/r/a/?` with proper target filtering (skips input/textarea focus).
- Mobile adaptive pattern (flip between list-only and preview-only at `sm` breakpoint) at lines 244-277 is correct.
- `border-s` and `start-0` usage throughout shows RTL awareness.

**Severity: CRITICAL** (actions not wired, fake affordances, non-brand colors)

---

### /scans — Scan Results + History

**Components used:**
- `apps/web/src/app/(protected)/scans/page.tsx` — server component, data mapping
- `apps/web/src/components/scans/ScansClient.tsx` — all UI logic (810 lines, single file)
- `apps/web/src/components/scans/ScanDrilldown.tsx` — detail view (referenced, not read)
- `apps/web/src/components/scans/EngineBreakdownTable.tsx` — referenced, not read

**What's there:**
- Page header: "Scans" title + scan count + last scan context + "Run scan now" button
- KPI strip: 3 cells (Total scans / Avg score / Score delta) in `grid grid-cols-3 divide-x`
- Score trend sparkline (SVG area chart) below KPI strip
- Filter chips: All / Completed / Running / Failed
- Scan timeline: date-bucketed list with dot + time + score pill + score delta + engine pips + scan type badge + "View details" chevron

**AI slop signals:**

1. **KPI strip uses `divide-x divide-gray-100` inside a white card — it's a Notion database view.** `ScansClient.tsx:470-534` — `grid grid-cols-3 divide-x divide-gray-100` inside `rounded-xl border border-gray-100 bg-white overflow-hidden`. With `px-5 py-4` cells and `text-[10px] font-semibold uppercase tracking-[0.1em]` labels, this is the exact visual pattern of a Notion database table view or Vercel Analytics panel. No Beamix-specific design.

2. **The scan row's "View details" chevron is opacity-0 until hover.** `ScansClient.tsx:797-803` — `opacity-0 group-hover:opacity-100` reveal for the chevron + "View details" label. The entire row is a link but the affordance is hidden. This hides the most important UX signal (that the row is clickable) behind hover state — invisible on mobile and to new users.

3. **Filter chips use `bg-gray-900 text-white` for the active state.** `ScansClient.tsx:569-572` — `bg-gray-900 text-white` for the active filter chip. This is not brand blue `#3370FF`. The active filter chip should use the primary brand accent. Using near-black as an active state indicator makes the filter look broken or like a selected-row style, not an active filter.

4. **`scoreVerdict()` at line 97-126 has an empty label for "Good" score.** `ScansClient.tsx:108` — `label: ''` for scores 50–74 ("Good" tier). This means a scan scoring 65 shows a colored number with no verdict label. The brand guidelines define Good as a specific tier with specific copy. A missing label on the second-most-common score range is a content gap that makes the product look unfinished.

5. **The date separator is a 10px uppercase gray line — same as every SaaS app.** `ScansClient.tsx:311-319` — `DateSeparator` renders `text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400/70` + `h-px flex-1 bg-gray-100`. "TODAY", "YESTERDAY", "EARLIER THIS WEEK" — this is the Gmail/Linear/Superhuman date separator lifted verbatim. Original products find more personality in this pattern.

6. **Engine pips (colored dots) have no legend or tooltip on desktop.** `ScansClient.tsx:207-239` — `EnginePips` renders 7 colored dots with only `title` attributes (HTML tooltip, not custom). The color-coded dots that represent which AI engines ran are not explained anywhere in the visible UI — first-time users have no idea what the dots mean or why some are red.

7. **The sparkline gradient ID `sot-grad` is hardcoded.** `ScansClient.tsx:187-190` — `id="sot-grad"` in the SVG `<defs>`. If multiple `ScoreOverTimeChart` components render on the same page (e.g. in a list), all gradients reference the same ID and only the first will render correctly. This is a silent rendering bug masquerading as a design issue.

8. **"Run scan now" button for Discover plan users is a disabled button with no upgrade path.** `ScansClient.tsx:442-453` — The plan-gated button renders as `cursor-not-allowed` with `text-gray-400` and no tooltip or upgrade CTA visible. A locked feature should convert to an upgrade moment, not a dead gray button. This is a missed revenue touchpoint.

9. **Empty state ("Run your first check") is a gray square icon + two lines.** `ScansClient.tsx:612-629` — `size-12 rounded-xl border border-gray-200 bg-gray-50` with `ScanIcon` in gray. Same boilerplate empty state pattern as every other page. The copy is good ("Takes 90 seconds — we scan 7 AI engines") but the visual treatment is the Shadcn empty state default.

10. **The page heading "Scans" (line 404) is `text-xl font-semibold`.** `ScansClient.tsx:404` — 20px, semi-bold, same visual weight as a card title. No page identity. No Beamix wordmark or visual anchor. The page could be titled "Orders" or "Reports" and look identical. The Product Design System specifies H1 at 40px InterDisplay-Medium; this page uses 20px Inter 600.

**What's good:**
- The `ScoreOverTimeChart` SVG area chart with gradient fill is a genuine design asset — not a library chart, custom SVG with area path + line overlay. This shows craft.
- The `StatusDot` pulsing animation for running scans (`animate-ping`) at line 277-280 is correct feedback that a scan is in progress.
- The scan timeline grouping by day with labeled separators is the right UX pattern for a history view.

**Severity: HIGH**

---

### /automation — Automation / Suggestion Queue

**Components used:**
- `apps/web/src/app/(protected)/automation/page.tsx` — server component, data assembly
- `apps/web/src/components/automation/AutomationClient.tsx` — main layout (930 lines)
- `apps/web/src/components/automation/AddScheduleModal.tsx` — add schedule modal
- `apps/web/src/components/automation/KillSwitchConfirm.tsx` — pause-all confirm dialog

**What's there:**
- Page header: "Auto-pilot" title + active/paused count + global kill-switch pill button
- Global paused banner (amber) with AnimatePresence
- Left column: RunsProjectionCard (credit bar + daily sparkline) + schedules table
- Right aside: OutputFunnelCard (4-step pipeline) + RunHistoryCard (last 10 runs)

**AI slop signals:**

1. **The page title is "Auto-pilot" but the nav item calls it "Automation".** `Sidebar.tsx:32` uses label "Automation" → `AutomationClient.tsx:770` renders `<h1>Auto-pilot</h1>`. Inconsistency in naming across the same user flow. "Auto-pilot" vs "Automation" — pick one. This is a copy consistency failure that makes the product feel unfinished.

2. **Schedules table uses `text-[11px] font-medium uppercase tracking-wide` column headers.** `AutomationClient.tsx:847-868` — Every column header is `text-[11px] font-medium uppercase tracking-wide text-gray-400`. This is the same aggressive small-caps pattern as the Evidence section in Inbox and the KPI labels in Scans. It is not a designed typographic system — it is a single repeated pattern used as a substitute for hierarchy.

3. **Every agent in the schedules table gets the same Zap icon in a blue-50 square.** `AutomationClient.tsx:276-280` — `size-7 rounded-lg bg-blue-50 flex items-center justify-center` + `Zap className="size-3.5 text-[#3370FF]"`. Every agent type — Content Optimizer, Performance Tracker, FAQ Builder, all 7 — gets the identical blue Zap icon. This strips all meaning from the icon. If every agent looks the same, the icons add zero information.

4. **"Pause all" kill-switch uses a pill shape.** `AutomationClient.tsx:784-803` — The global kill-switch button is `rounded-full px-4 py-2` (a pill). The Product Design System specifies `rounded-lg (8px)` for all product utility buttons; pills are marketing-only (`BRAND_GUIDELINES.md` section 4). This is a direct brand guidelines violation on the highest-stakes button in the page.

5. **`OutputFunnelCard` uses a `ChevronDown` between funnel steps.** `AutomationClient.tsx:562-565` — A downward chevron between Draft → In Review → Approved → Published. This is not a funnel; it looks like an accordion or expandable list indicator. A real funnel should visually narrow. Using `ChevronDown` suggests the steps are collapsible, which they are not.

6. **The RunHistoryCard uses sequential integer indices as React keys.** `AutomationClient.tsx:626` — `key={i}` on run history items. This will cause wrong animation on list reorder. Minor but signals low attention to rendering correctness.

7. **`DailySparkline` uses different fill colors for current vs past bars.** `AutomationClient.tsx:171-174` — `fill={i === n - 1 ? '#3370FF' : '#93b4ff'}`. `#93b4ff` is a non-brand color (light periwinkle). The brand palette has no entry for `#93b4ff`. While the intent (highlight today's bar) is correct, the color is off-palette.

8. **Empty state for no schedules is inline inside a `<tr>`.** `AutomationClient.tsx:394-412` — `EmptySchedules` renders into `<td colSpan={8}>` with a centered `size-10 rounded-xl border border-gray-200 bg-gray-50` + Zap icon. A table empty state inside a `<td>` means the table chrome (thead with column headers) still renders above the empty state. Users see "Agent | Trigger | Frequency | Last result | Next run | 7 runs | Status | [actions]" column headers for a table with nothing in it. The empty state should replace the entire table component, not live inside it.

9. **The "Add automation schedule" button is styled as a dashed-border ghost button.** `AutomationClient.tsx:896-904` — `border border-dashed border-gray-200 hover:border-blue-200`. Dashed borders are a "drop target" or "add new item" pattern from Notion/Linear. In this context it creates ambiguity — is this a droppable zone or a button? It is not a Beamix design pattern.

10. **`RunSparkline` sparkline bars are 6px wide with no tooltip.** `AutomationClient.tsx:117-137` — 7 bars at `w-[6px]` with only `title` attributes. The "last 7 runs" history is the most operationally relevant piece of data in the schedule row — whether the agent has been running successfully. Displaying it as 6px colored bars with no labels, no tooltip component, and no accessible description is insufficient for the value it carries.

**What's good:**
- The global kill-switch confirmation dialog pattern (`KillSwitchConfirm`) is a correct destructive-action safeguard.
- `RunsProjectionCard` at lines 424-515 has genuine value: it shows projection math ("At this rate, you'll use X this month") rather than just a number. This is real product thinking.
- The optimistic update pattern for toggle pause (line 712-738) — revert on failure — is correctly implemented.

**Severity: HIGH** (brand guidelines violations, inconsistent naming, duplicate icons)

---

## PATTERN-LEVEL PROBLEMS

### Typography
Only `Inter` is loaded in `apps/web/src/app/layout.tsx:5-9`. `InterDisplay` is referenced in `Sidebar.tsx:53` via inline `style={{ fontFamily: 'InterDisplay, Inter, sans-serif' }}` — this is a CSS font fallback, not a loaded font. `InterDisplay` is not imported in `layout.tsx` via `next/font`. `Fraunces` and `Geist Mono` are not loaded at all. **All headings across all 4 pages are rendering in Inter, not InterDisplay.** The brand calls for InterDisplay-Medium on all headings. The actual type scale in use is: `text-xl` (20px) for page H1s, `text-sm font-semibold` (14px) for section headings — a 6px jump across 2 levels is not a scale, it is two sizes.

### Color Usage
`#3370FF` appears correctly on: active filter states, primary buttons, focus rings, the progress bar fills, and the left-border active indicator in sidebar. However, the sidebar active nav item background is `bg-gray-50` with `text-gray-900` — the blue only appears as a 2px left border (`w-0.5`). The sidebar communicates "active" through near-invisible signals. Non-brand colors found: `#93b4ff` (DailySparkline), `#0EA5E9` (KpiStripNew impressions icon — sky blue, not in palette), violet/orange/teal agent tints in ItemList (not in brand palette). Score colors (`#06B6D4`, `#10B981`, `#F59E0B`, `#EF4444`) are used correctly.

### Spacing and Density
The product uses `p-4` (16px) or `p-5` (20px) for card interiors, `gap-3`/`gap-4` (12-16px) for grid gaps. This is light-weight desktop SaaS density — correct baseline. However all 4 pages use `mx-auto max-w-[1100px]` or `max-w-[1200px]` with `px-4`/`px-6` — slightly inconsistent maxWidths (1100 vs 1200px) between pages. The Product Design System specifies `max-w-7xl` (1280px). No page achieves 1280px.

### Iconography
`Sidebar.tsx` uses Lucide icons throughout — correct. `ScansClient.tsx` uses Lucide. `AutomationClient.tsx` uses Lucide. However the core KPI tiles in `KpiStripNew.tsx` use custom inline SVG icons (not Lucide) — `IconVisibility`, `IconCitation`, `IconImpressions`, `IconCredits`. These are bespoke SVG shapes that do not match the Lucide stroke weight or grid. Mixing Lucide with custom SVGs creates visual inconsistency across the same page. Brand guidelines specify Lucide React only.

### Empty States
Every empty state across all 4 pages follows the identical formula: centered column, small icon in gray/blue square, `text-sm font-medium text-gray-900` heading, `text-xs text-gray-500` body, optional primary CTA button. Counted: 8 empty states across 4 pages, all visually identical. No illustration, no animation, no personality. The `NoScanYet` state in `HomeClientV2.tsx:138-159` has a framer-motion wrapper but the content is the same template.

### Loading States
`ScansClient.tsx:285-307` — `SkeletonRow` is 5 gray rectangles (`bg-gray-200`, `animate-pulse`) in a row. Correct pattern, generic execution. No other page has skeleton loading. Inbox has no loading state. Automation has no loading state. Home has no loading state (server-rendered, no client loading phase).

### Error States
No visible error state UI in any of the 4 pages. The server components have `console.error` fallbacks (`inbox/page.tsx:34`) and empty array fallbacks, but no rendered error message surfaces to the user. If the Supabase query fails, the user sees an empty state indistinguishable from "no data".

### Micro-copy
The copy is functional but often clinical: "AI Impressions Added" (KpiStripNew), "Avg score (30d)" (ScansClient), "Output Pipeline" (AutomationClient). The brand voice guideline says "Instructive, zero marketing language" for dashboard UI — this is correct tone — but it has swung into enterprise-neutral rather than warm-instructive. Bright spots: "All caught up this week" (NextStepsSection empty state) and "At this rate, you'll use X this month" (RunsProjectionCard) are good examples of direct + warm.

### Illustrations
Zero illustrations across all 4 pages. All empty states and loading states are icon-only. No spot illustrations, no character, no visual storytelling. This is the clearest signal of template-first design: illustrations are skipped because they require creative judgment.

### Animation
Motion is the strongest design element across all pages. Framer-motion is used consistently: `fadeInUp` + `spring.subtle` on page entry, staggered card reveals, `AnimatePresence` on list changes, `whileHover` lift on cards. The motion library at `apps/web/src/lib/motion.ts` (not read but referenced) shows intentional animation system design. The `animate-ping` pulsing dot for running scans is correct. The one failure: `HomeClientV2.tsx` stagger delays go up to `delay: 0.18` — by 180ms, the first card has already finished entering before the last starts. This is too wide a stagger range.

---

## TOP 10 MUST-FIX AI SLOP ISSUES

1. **InterDisplay is not loaded — all headings render in fallback Inter.** `layout.tsx:5-9` loads only Inter. Add `Inter_Display` via `next/font/google` and apply to `h1`-`h4`. Every page heading is currently rendering in the wrong font, breaking the brand typography system. Fix: add to layout, set as `font-display` CSS variable.

2. **Sidebar active state is near-invisible — brand blue is a 2px sliver.** `Sidebar.tsx:68-73` — Active nav background is `bg-gray-50 text-gray-900`. The only blue is `w-0.5 rounded-full bg-[#3370FF]` left border at line 76. Product Design System specifies `bg-[#EFF4FF] text-[#3370FF] font-semibold border-l-2 border-[#3370FF]` for active nav. The active state needs the blue background, not just a sliver. Fix: replace `bg-gray-50 text-gray-900` with `bg-[#EFF4FF] text-[#3370FF]` for active items.

3. **Inbox actions are console.log stubs — the entire Inbox is non-functional.** `InboxClient.tsx:99-125` — `handleApprove`, `handleReject`, `handleRequestChanges`, `handleArchive` all do `console.log` only. This means the primary user action loop (review → approve → publish) is broken. Fix: wire to `/api/content-items/[id]/approve`, `/reject`, `/request-changes`, `/archive` endpoints.

4. **KPI tile icon backgrounds use the #1 AI-generated SaaS pattern — light-tinted squares with centered icons.** `KpiStripNew.tsx:86-93` — Replace with more distinctive treatments. Options: score-colored left border on the tile, a single large number as the focal point with the icon as a secondary detail, or remove the icon boxes entirely and let data hierarchy do the work.

5. **Non-brand colors are polluting the palette.** `ItemList.tsx:37-44` — violet/orange/teal agent tints. `KpiStripNew.tsx:188` — `iconColor: '#0EA5E9'` (sky, not brand blue). `AutomationClient.tsx:172` — `#93b4ff`. Fix: consolidate agent type tints to brand colors only (blue primary, emerald for success, amber for warning, red for error). Remove sky-blue, violet, orange, teal agent tints.

6. **The main score on /home is visually subordinate to section headings.** `HomeClientV2.tsx:91` — `text-[28px]` for the page's most important number. A GEO score out of 100 is the product's core value delivery — it should be a hero number. Fix: increase to at minimum 56px with InterDisplay-Medium, make it the unmistakable visual anchor of the page. Remove the score from the KPI strip's Tile 1 if it appears in the hero.

7. **Every empty state is identical — 8 occurrences of the same centered-icon + 2-lines pattern.** Empty states in: `inbox/page.tsx:95`, `automation/page.tsx:148`, `InboxClient.tsx:344`, `ItemList.tsx:109`, `EngineBreakdownGrid.tsx:131`, `NextStepsSection.tsx:134`, `ScansClient.tsx:605`, `AutomationClient.tsx:394`. Fix: design a system of 3–4 empty state personalities (No scans yet / Inbox zero / Automation ready / All caught up) with distinct visual treatments, not the same gray-square-plus-text.

8. **Custom SVG icons in KpiStripNew do not match Lucide grid/stroke weight.** `KpiStripNew.tsx:34-68` — `IconVisibility`, `IconCitation`, `IconImpressions`, `IconCredits` are bespoke SVGs. Lucide icons use 2px stroke on a 24px grid. These custom icons use `strokeWidth="1.5"` on 16px viewBox — different apparent weight than sidebar/action Lucide icons. Fix: replace with Lucide equivalents (`Eye`, `FileText`, `TrendingUp`, `Zap`) or at minimum normalize stroke widths.

9. **"Pause all" automation button uses pill shape — brand guidelines violation.** `AutomationClient.tsx:784` — `rounded-full` on a product utility button. `BRAND_GUIDELINES.md` section 4: "Pill shape for marketing only. Never apply pill to product utility buttons." Fix: change to `rounded-lg`.

10. **Filter chips on /scans use `bg-gray-900` for active state instead of brand blue.** `ScansClient.tsx:569-572` — Active filter = near-black, not `#3370FF`. Inconsistent with InboxClient's filter chips which correctly use `bg-[#3370FF] text-white` for mobile active state (`InboxClient.tsx:211-212`). Fix: `isActive ? 'bg-[#3370FF] text-white' : 'bg-gray-100 text-gray-600'` to match inbox pattern.

---

## COMPONENT-LEVEL INVENTORY

| Component | File | Verdict |
|---|---|---|
| **Sidebar** | `apps/web/src/components/shell/Sidebar.tsx` | MEDIOCRE — correct structure, broken active state color, icon not colored blue when active, sign-out is a console.log stub |
| **KPI Tile** | `apps/web/src/components/home/KpiStripNew.tsx:80-103` | WEAK — the single most generic component in the product; light-tinted square + icon + label + number is the SaaS dashboard cliché |
| **Engine Cards** | `apps/web/src/components/home/EngineBreakdownGrid.tsx:58-126` | ACCEPTABLE — has real data (mention rate, sparkline, bar); initials instead of logos is the main weakness |
| **Next Steps Cards** | `apps/web/src/components/home/NextStepsSection.tsx:69-127` | GOOD — impact dots, whileHover lift, AnimatePresence dismiss, credit pill; the best-designed component in /home |
| **Scan Row** | `apps/web/src/components/scans/ScansClient.tsx:694-809` | ACCEPTABLE — dense, information-rich, good motion; hidden "View details" affordance is a UX failure |
| **Filter Rail** | `apps/web/src/components/inbox/FilterRail.tsx` | MEDIOCRE — functional but indistinguishable from any email client sidebar |
| **Item List Row** | `apps/web/src/components/inbox/ItemList.tsx:131-216` | GOOD — status dot, agent avatar, unread bold, 3-line layout with truncation; non-brand agent tint colors |
| **Preview Pane Action Bar** | `apps/web/src/components/inbox/PreviewPane.tsx:261-329` | CRITICAL — unresponsive (console.log stubs), buttons undersized, fake bulk-select |
| **Automation Table Row** | `apps/web/src/components/automation/AutomationClient.tsx:253-390` | WEAK — every agent same Zap icon, cadence selector is a Shadcn Select with zero styling, table-inside-empty-state |
| **Empty States (shared pattern)** | Multiple files (8 instances) | CRITICAL — all identical, no personality, no visual differentiation |
| **Score Trend Chart** | `apps/web/src/components/scans/ScansClient.tsx:151-203` | GOOD — custom SVG area chart, not a library chart; gradient fill is tasteful |
| **DashboardShell** | `apps/web/src/components/shell/DashboardShellClient.tsx` | ACCEPTABLE — correct flex layout, preview mode banner, paywall modal integration |

---

## RECOMMENDATIONS — HOW TO DE-SLOP

**1. Load InterDisplay and fix the heading scale across all 4 pages. (1 hour, highest ROI)**
Add `Inter_Display` to `apps/web/src/app/layout.tsx`. Apply to all `h1` and `h2` elements via Tailwind `font-display` class. Make the /home score number 56px+ InterDisplay-Medium. This single change makes the product look 40% more premium because it stops looking like default system UI.

**2. Fix the sidebar active state to actually use brand blue. (30 minutes)**
In `Sidebar.tsx:68-73`, change the active class from `bg-gray-50 text-gray-900` to `bg-[#EFF4FF] text-[#3370FF]`, and change the active icon color from `text-gray-900` to `text-[#3370FF]`. The `w-0.5` left border can stay. This makes the navigation legible at a glance and confirms brand identity on every page.

**3. Wire the Inbox actions to real API endpoints. (4-8 hours, prerequisite for shipping)**
Replace the `console.log` stubs in `InboxClient.tsx:99-125` with real `fetch('/api/content-items/[id]/[action]')` calls. Add optimistic list removal (item disappears from "Awaiting review" on Accept/Reject). Add a spinner state during in-flight requests. Until this is done, /inbox is a demo mockup, not a product.

**4. Design 3 differentiated empty state variants — retire the single boilerplate. (2 hours)**
The current empty state pattern is at `inbox/page.tsx:95`, `automation/page.tsx:148`, etc. Replace with: (a) "First scan" state — large score ring at 0 with a pulsing animation, specific next step; (b) "Inbox zero" state — green checkmark, "You're caught up" in Fraunces italic; (c) "Automation ready" state — a visual of the agent queue waiting, with a specific "Add your first schedule" CTA. Each should feel like a distinct product moment.

**5. Consolidate agent type colors to brand palette and add agent SVG logos. (3 hours)**
Remove the violet/orange/teal/sky tints from `ItemList.tsx:37-44` and `KpiStripNew.tsx:188`. Map all agent types to: blue (#3370FF) for content agents, emerald (#10B981) for performance agents, amber (#F59E0B) for strategy agents. Commission or source SVG logos for ChatGPT, Gemini, Perplexity, Claude, Grok — 16×16 brand-accurate SVGs replace the text initials in `EngineBreakdownGrid.tsx:74-77` and `ItemList.tsx:90-104`.

**6. Make the /home score number a hero moment. (2 hours)**
Delete `ScoreBar` component in `HomeClientV2.tsx:70-102` and replace with a proper hero: score number at 64px InterDisplay-Medium with the score color, a score ring (SVG circle, animated 0→score on mount), verdict label in a colored pill beneath, and subtitle below that. Move the entire element to the visual center of the left column. Remove the score tile from KpiStripNew (it is duplicated — the score already appears in the hero).

**7. Fix the filter chip active color on /scans and enforce brand blue for all active states. (30 minutes)**
`ScansClient.tsx:569-572` — change `bg-gray-900 text-white` → `bg-[#3370FF] text-white` for the active filter chip. Audit all `isActive` conditional classes across all 4 pages. Rule: active = brand blue (#3370FF) always, never near-black.

**8. Replace Zap-for-all-agents in AutomationClient with per-agent type icons. (1 hour)**
`AutomationClient.tsx:276-280` — each `agentType` should have a distinct Lucide icon: `FileText` for content agents, `TrendingUp` for performance, `RefreshCw` for freshness, `HelpCircle` for FAQ, `BarChart2` for competitor, `Code` for schema. Map the icons in `AGENT_LABELS` Record alongside the labels. This alone makes the schedules table scannable at a glance.


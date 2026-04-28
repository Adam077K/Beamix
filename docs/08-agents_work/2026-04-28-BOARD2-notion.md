# Beamix Board 2 — The Notion / Ivan Zhao Lens

**Date:** 2026-04-28
**Author:** Notion-perspective alternative-vision pressure-test (Ivan Zhao voice)
**Status:** Pressure-test, not redesign. The output is a forced-frame critique that asks Adam to consciously confirm the locked fixed-page-spine OR reframe to a hybrid. Five locked Board 2 decisions are NOT relitigated. The 9-page surface roster, the Brief-as-constitution, and the single-character "Beamix" voice all remain in scope; what's being challenged is the *composition model* underneath them.
**Inputs:** FRAME-5-v2-FULL-VISION (LOCKED), PRD-wedge-launch-v3 (CANONICAL), DESIGN-BOARD2-CEO-SYNTHESIS, DESIGN-workflow-builder-canvas-v1, DESIGN-SYSTEM-v1, HOME-design-v1.

---

## Prelude — what Notion sees that no one else on this board sees

Every board seat so far has refined surfaces. Rams cut chrome. Ive added ceremony. Tufte added density. Kare locked the sigil function. Linear, Stripe, and Vercel would refine motion, structure, and craft. None of them would ask the foundational question:

**Why is /home a page?**

In Notion's worldview, "page" is the wrong unit. The unit is the *block*. A page is a stack of blocks that happens to live at a URL. /home is just the default arrangement of certain blocks. /workspace is a database view. /scans is a database with a different view. /crew is a gallery of agent-blocks. /reports is a published page.

The Beamix team is locking 9 surfaces. Notion would ship 18 primitives and let customers compose their own surfaces, with Beamix shipping 5 hero templates as the calm default. The defining question for Adam: *is the rigidity of the spine the moat, or is it a self-imposed cage?*

This document runs the alt-vision honestly. Then I tell Adam where I'd actually land.

---

## §1 — The 18 Beamix block primitives

Every Beamix surface today is built from a finite set of cell-types. Below is what I'd extract as the canonical primitive set if Beamix were composable. Each primitive: the data shape it consumes, the size dimensions (default + min + max in 12-col grid units), the parameters that drive variation, and the surfaces it would embed into.

### 1.1 ActivityRingBlock
**Job:** Renders the AI Visibility Score with the gap-close motion (F23 Cycle-Close Bell hooks here).
**Data shape:** `{ score: 0–100, delta: number, cycleState: 'open' | 'closing' | 'closed', methodology_link: URL }`
**Default:** 6 cols × 320px tall · **Min:** 4 cols × 200px (terminus dot drops, ring becomes 96px) · **Max:** 12 cols × 480px (hero treatment, methodology footnote inline)
**Parameters:** `size: hero | medium | mark` · `pulse: never` (locked per Board 2 #2 — ring stays still) · `showDelta: boolean` · `showMethodology: boolean`
**Embeddable in:** /home (default), /reports, /scans/[id] detail, customer-published OG image, custom Workspace pages.

### 1.2 SparklineBlock
**Job:** A single engine × time × metric path. The atomic unit of /home's depth shelf and Monthly Update Page 2.
**Data shape:** `{ engine: enum(11), timeframe: '7d'|'30d'|'12w'|'1y', metric: 'rank'|'mentions'|'citations', points: number[] }`
**Default:** 3 cols × 96px tall · **Min:** 1 col × 48px (table-row inline) · **Max:** 6 cols × 240px (drill-down view)
**Parameters:** `engine` · `timeframe` · `metric` · `colorBand: brand | semantic` · `pathDraw: false` (locked per Board 2 #2 — renders at full state at t=0)
**Embeddable in:** /home, /scans row expansion, /competitors Rivalry Strip, Monthly Update Page 2 small-multiples grid, custom dashboards.

### 1.3 CartogramBlock (F22)
**Job:** The 50-queries × 11-engines = 550-cell visibility frontier. The John Snow move.
**Data shape:** `{ queries: Query[50], engines: Engine[11], cells: { rank: number | null, competitor: string | null, sentiment: enum }[][] }`
**Default:** 12 cols × 600px · **Min:** 6 cols × 320px (compresses to 25 queries × 11 engines, scrollable) · **Max:** full-bleed 16:9 OG image at 1200×630
**Parameters:** `queries: count` · `groupBy: vertical | category | priority` · `colorMap: 4-band default` · `glyphLayer: rank | competitor-initial | none`
**Embeddable in:** /scans/[id] detail (canonical home), Monthly Update Page 2, OG share card, /home (Scale-tier customer's choice).

### 1.4 BriefClauseBlock
**Job:** A single Brief clause rendered in cream paper + Fraunces 300 italic. The constitutional cell.
**Data shape:** `{ clause_id: uuid, text: string, version: int, signed_at: timestamp, signed_by: 'Beamix', approved_at: timestamp }`
**Default:** 8 cols × auto-height · **Min:** 4 cols (mobile) · **Max:** 12 cols (Brief approval surface)
**Parameters:** `mode: read | edit | sign-ready` · `showCitation: boolean` (renders inline F30 citation pattern) · `paperOpacity: 100% | 30%` (canvas mode per Workflow Builder §3)
**Embeddable in:** /onboarding step 3 (default home), Workflow Builder Inspector grounding cell, /settings → Brief tab, F31 binding line at every product page bottom, customer-published Brief permalink.

### 1.5 AgentRowBlock
**Job:** Monogram + 2-letter ID + status + last action sentence + (optional) autonomy chip. The atomic /crew row.
**Data shape:** `{ agent_id: uuid, monogram: '2-letter', color: hex, status: enum, last_action: { verb, noun, timestamp }, autonomy: enum }`
**Default:** 12 cols × 56px tall · **Min:** 4 cols × 56px (drops last-action text) · **Max:** 12 cols × 88px (expands to inline sparkline + provenance link)
**Parameters:** `density: comfortable | dense` · `showProvenance: boolean` · `showAutonomy: boolean` · `traceBehavior: on | off` (per Board 2 #19 — Trace as behavior, not mark)
**Embeddable in:** /crew (default), /workspace narration column row, /home Crew-at-Work strip (compact mode), Monday Digest email body, Yossi multi-client cockpit.

### 1.6 InboxRowBlock
**Job:** A single review item — agent + action + before/after diff + Brief citation + ActionBar (Approve `A` / Reject `X` / Request Changes `R`).
**Data shape:** `{ inbox_item_id, agent_id, action_type, draft_hash, brief_clause_ref, validator_token, diff: { before, after }, autonomy_setting }`
**Default:** 12 cols × 96px (collapsed) / auto (expanded) · **Min:** 4 cols × 88px · **Max:** 12 cols × 480px (expanded with cartogram preview if relevant)
**Parameters:** `expanded: boolean` · `bulkSelectable: boolean` · `sealCeremony: 'on-click' | 'never'` (locked per Board 2 #4 — never on hover)
**Embeddable in:** /inbox (default), /workspace step output, agent-deep-link permalinks, custom triage views (e.g., "by agent", "by Brief clause").

### 1.7 ReceiptBlock (paper-fold card, F25)
**Job:** A 96px-tall cream-paper card with Rough.js fold mark, date stamp in Geist Mono, one Fraunces line. The morning-of artifact.
**Data shape:** `{ artifact_type: 'monthly_update'|'scan'|'cycle_close'|'brief_signed', date, headline, permalink }`
**Default:** 12 cols × 96px · **Min:** 6 cols × 96px · **Max:** 12 cols × 144px (expanded with thumbnail of artifact)
**Parameters:** `state: 'fresh' | 'archived'` · `paperFoldMotion: 600ms once-only on first appearance` · `temporalDecay: 100% week 1, 20% prior month, 6% archived`
**Embeddable in:** /home (above Evidence Strip on artifact-generation day), /reports list, customer's Receipt timeline (custom page), Monday Digest header.

### 1.8 CompetitorRowBlock
**Job:** A single competitor's name + score delta vs customer + last citation move + 5-engine sparkbar.
**Data shape:** `{ competitor_domain, score: 0–100, delta_vs_customer: signed_int, last_citation_move: { engine, query, timestamp }, sparkbar_5: number[] }`
**Default:** 12 cols × 64px · **Min:** 6 cols × 64px (sparkbar drops) · **Max:** 12 cols × 240px (expanded to Rivalry Strip dual-sparkline view)
**Parameters:** `sparkbarStagger: 0` (locked per Board 2 #7) · `expanded: boolean` · `showRivalryStrip: boolean`
**Embeddable in:** /competitors (default), /home KPI shelf (Top Competitor Delta card), /scans row context, custom "rivalry watchlist" pages.

### 1.9 TwilioNumberBlock
**Job:** The lead-attribution surface — phone number, last call timestamp, this-month tally, recording playback (if consented).
**Data shape:** `{ twilio_number, last_call: { from, duration, recording_url, timestamp }, this_month_count, this_month_delta_vs_prior }`
**Default:** 6 cols × 160px · **Min:** 4 cols × 96px (drops recording) · **Max:** 12 cols × 320px (full call log)
**Parameters:** `vertical_aware: boolean` (SaaS customers see UTM-first variant; e-comm sees Twilio-first) · `showRecordings: boolean` · `groupBy: 'day' | 'week' | 'month'`
**Embeddable in:** /home above-fold lead-attribution headline (canonical), /reports/lead-attribution detail, custom Yossi-per-client attribution-by-source page.

### 1.10 StatusBlock
**Job:** The single rewrite-once status sentence — *"Healthy and gaining"* / *"Cycle closed. 6 changes shipped this week."* / *"Beamix is working on 3 things."* (Board 2 #25 hooks here.)
**Data shape:** `{ state: enum, sentence: string, lastUpdated: timestamp, cycleState: 'open'|'closing'|'closed' }`
**Default:** 8 cols × 32px · **Min:** 4 cols × 32px · **Max:** 12 cols × 48px (hero status mode for /home)
**Parameters:** `rewriteAnimation: 'rewrite-once' | 'never'` (rewrite once on cycle close per F23) · `voiceMode: 'declarative' | 'progress'`
**Embeddable in:** /home (default position adjacent to Activity Ring), Topbar status pulse (compact 11px variant), Monday Digest H1, /workspace narration footer.

### 1.11 EvidenceStripBlock
**Job:** 3 cards (Build) / 5 cards (Scale) of timestamped Beamix-action evidence. The proof shelf.
**Data shape:** `{ items: [{ agent_id, action_verb_noun, timestamp, permalink, brief_clause_ref }] }`
**Default:** 12 cols × 200px (3-up) · **Min:** 6 cols × 320px (vertical stack 3-up) · **Max:** 12 cols × 240px (5-up Scale)
**Parameters:** `count: 3 | 5 | N` · `sortBy: 'recency' | 'impact'` · `showBriefCitation: boolean` (per F30)
**Embeddable in:** /home (default just below score), Monthly Update Page 1 (3-up), email digest body, Yossi multi-client cockpit row hover-state.

### 1.12 SealBlock
**Job:** The 4-pointed asterisk OR chamfered plus, stamped at moments of authorship. Per Board 2 #4 + #20 + #21 + #22.
**Data shape:** `{ context: enum(5), seed: customer_uuid, stampTimestamp, signature_text: 'Beamix' }`
**Default:** 32×32 px · **Min:** 16×16 (favicon, separately tuned) · **Max:** 96×96 (Brief approval ceremony, Monthly Update PDF top)
**Parameters:** `motion: 'stamp-540ms' | 'static'` · `signatureLine: 'Beamix' | none` (per Board 2 #3 — one ceremony, not two)
**Embeddable in:** Only 5 contexts per Board 2 #22 — PDF top, PDF bottom, Brief approval, OG share card, Monthly Update email header. Not embeddable elsewhere; scarcity is the rule.

### 1.13 NarrationBlock (replaces walking figure per Board 2 D)
**Job:** Plain-English execution sentences that briefly push a line per node during /workspace dry-run or live execution.
**Data shape:** `{ run_id, current_node, sentence: string, duration_ms, completed_steps: string[] }`
**Default:** 4 cols × auto (right column of /workspace) · **Min:** 4 cols × 240px (last 6 sentences) · **Max:** 6 cols × full canvas height (full transcript)
**Parameters:** `density: 'compact' | 'verbose'` · `autoScroll: boolean` · `keepHistory: boolean`
**Embeddable in:** /workspace (default), Workflow Builder dry-run mode, /scans live-run progress strip.

### 1.14 BriefBindingLineBlock (F31)
**Job:** The 13px Fraunces 300 italic line rotating daily through Brief clauses. Silent furniture, 24px above footer chrome.
**Data shape:** `{ brief_clauses: BriefClause[4], today_index: 0–3, ink: 'ink-3' }`
**Default:** 12 cols × 32px · **Min:** 8 cols × 32px (truncates with ellipsis) · **Max:** 12 cols × 48px
**Parameters:** `rotation: 'daily' | 'session'` · `align: 'center' | 'left'` · `clickBehavior: 'open-brief' | 'none'`
**Embeddable in:** Every product page footer (canonical, MUST be present per F31), customer-created custom pages (auto-included), share permalinks.

### 1.15 CitationGroundingBlock (F30)
**Job:** Inline `Authorized by your Brief: "[clause text]" — clause N · Edit Brief →`. Renders at every agent action, every node, every Inbox row.
**Data shape:** `{ brief_clause_ref: clause_id, clause_text_snapshot: string, brief_version: int, edit_link: URL }`
**Default:** 12 cols × auto (40-72px) · **Min:** 8 cols × 56px · **Max:** 12 cols × auto
**Parameters:** `register: '1px-rule + Inter italic' | 'cream-cell + Fraunces'` (cream only inside Workflow Builder Inspector per Board 2 #17) · `clauseSnapshot: at-creation-time` (immutable per Tier 0 #12)
**Embeddable in:** /inbox row detail, /workspace step output, /scans Done lens, Workflow Builder node inspector, agent action permalinks.

### 1.16 KPICardBlock
**Job:** Single number + delta + 28-day micro-spark. The KPI shelf atom.
**Data shape:** `{ label: string, value: number, unit: string, delta: signed_pct, micro_spark: number[28] }`
**Default:** 3 cols × 120px · **Min:** 2 cols × 96px (drops spark) · **Max:** 6 cols × 200px (expanded with year-over-year context)
**Parameters:** `metric: enum(Mentions | Citations | Credits | CompetitorDelta | EngineCoverage | LeadAttribution)` · `format: 'integer' | 'currency' | 'percent'`
**Embeddable in:** /home KPI row (default), /reports per-metric drill, custom dashboards, Monthly Update Page 1.

### 1.17 EngineMicroStripBlock
**Job:** Per /scans row: 56px-wide × 11-column sparkbar where each column's height encodes that engine's delta on the scan. Tufte's Hans Rosling at row scale, per Board 2 #37.
**Data shape:** `{ scan_id, engine_deltas: { engine: enum, delta: signed_int, rank_position: int }[11] }`
**Default:** 56×16 px (inline-row) · **Min:** 56×12 (compressed row) · **Max:** 12 cols × 96px (drilldown to per-engine values labeled)
**Parameters:** `direction: 'horizontal' | 'vertical'` · `showLabels: boolean (only at expanded)` · `colorMap: 'brand' | 'semantic'`
**Embeddable in:** /scans row (canonical, replaces 11 colored dots), Monthly Update Page 3 timeline rows, OG card thumbnail strip.

### 1.18 WorkflowBuilderCanvasBlock
**Job:** The cream-paper DAG canvas itself. Already block-flavored — it composes Trigger + Agent + Condition + Action + Notify nodes onto a sheet.
**Data shape:** `{ workflow_id, nodes: Node[], edges: Edge[], canvas_state: { pan, zoom }, dry_run_token, brief_version }`
**Default:** Full-bleed canvas (1440×900 minus topbar) · **Min:** Not embeddable below 800px width · **Max:** Full-bleed
**Parameters:** `mode: 'edit' | 'dry-run' | 'execution-replay'` · `gridSnap: 24×24 invisible math` · `paperOpacity: 30% cream over white`
**Embeddable in:** /crew/workflows/[id] (canonical), Workflow template gallery preview (read-only thumbnail), customer-published workflow permalink.

---

### What the primitive set tells us

Eighteen blocks. Three families:

- **Editorial artifact blocks** (BriefClause, Receipt, Seal, BriefBindingLine, CitationGrounding) — cream + Fraunces register. Constitutional weight.
- **Working blocks** (ActivityRing, Sparkline, Cartogram, KPICard, EngineMicroStrip, AgentRow, InboxRow, CompetitorRow, TwilioNumber, EvidenceStrip, Status, Narration) — white product chrome. Operating-system instruments.
- **Composition blocks** (WorkflowBuilderCanvas) — the surface where customers compose. *Currently exactly one. The Notion question: should there be more?*

The three-register typology (Artifact / Working / Disclosure, per Board 2 #35) maps cleanly onto block families. The system is *already* a block system; it just doesn't expose the API.

---

## §2 — The composable /home (with the 5 hero templates)

### 2.1 The default is the current /home

Notion's discipline: ship the calm default, expose composition only when the customer reaches for it. The current /home (HOME-design-v1) is already the right *default arrangement*. What changes in the composable model:

- The 8 sections become 8 block instances on a 12-col grid.
- A `+` button appears below the last block (only visible when the customer scrolls to the bottom — discoverability without intrusion).
- A `/` slash command opens the block palette anywhere on the page.
- Drag-handle on hover for reorder. Right-click for resize/duplicate/delete.
- "Reset to Beamix default" button in page settings (the safety net).

### 2.2 The 5 hero templates

The cost of composition is brand consistency. The mitigation is what Notion learned in 2018: most customers never compose from scratch. They pick a template, tweak two things, and stop. **Templates are the moat — not composability itself.**

Beamix ships these 5 hero templates, hand-designed by the product team:

1. **The Founder** (Marcus default) — Lead Attribution headline + Score Ring + 3 Top Fixes + Evidence Strip + 12-week trend + Monday Receipt slot. Calm, glanceable, 6 minutes a week. The shipping default for B2B SaaS founders.

2. **The Agency Cockpit** (Yossi) — 12-row multi-client table at the top (each row: client name, score delta, /inbox count, agent errors, monthly update status, attribution headline), then a single shared per-client drill-in panel below. Replaces the per-client `/home` switcher with a native cockpit. **This template alone might be worth the 2.6× price step from Build to Scale.**

3. **The E-comm Channel View** (Dani) — Lead Attribution at top with Twilio + UTM split, Revenue-attributed-to-AI KPI card prominent, per-product-category sparkline grid (8 categories × 12 weeks small-multiples), Monthly Update Receipt. The Klaviyo dashboard equivalent.

4. **The CTO Audit View** (Aria, the hidden buyer) — Brief grounding at top, every recent agent action with full provenance envelope expanded, Truth File integrity status, Validator availability uptime, Cryptographic signature audit. The page Aria opens in month 3 to decide if Marcus's renewal lives.

5. **The Local Operator** (post-MVP — vertical 3) — Twilio call log dominant, 5-engine local-pack rank strip, Google Business Profile signal panel, "Beamix is calling on Tuesday" Monday Digest preview. Reserved for the local-services vertical when it ships.

### 2.3 The grid

12-column responsive grid. Blocks span 1–12 cols, 8 / 12 / 16 / 24 / 32 row-units (8px base). Drag-to-reorder uses visual snap-zones. Mobile collapses to 1-col stack with a saved per-customer mobile order.

### 2.4 The cost — Wix-Christmas-tree risk

Eight in ten Notion customer pages are ugly. That's not a slur on Notion users — it's the price of giving people composition tools. Beamix's calm-defaults aesthetic could become Wix-circa-2014 in three days of customer composition.

**Mitigations Notion would ship:**
- Templates are the dominant entry point — "blank canvas" is reachable but the second-class CTA.
- Block palette has a **register lock** — Editorial blocks (cream + Fraunces) cannot be placed adjacent to >2 Working blocks without the system silently rebalancing. This is the design system enforced as code.
- The top-of-grid gets a "Beamix recommends this layout for B2B SaaS founders" inline nudge that re-applies the template if the customer wants to bail out.
- A `Beautify` action in page settings re-applies typography rhythm + spacing rules without changing content.

### 2.5 What composability would unlock

Two things the current fixed /home cannot do:

- **Per-vertical default that learns.** Marcus's /home auto-applies The Founder template. Six months later, after observing he never opens the per-engine strip but always scrolls to the Receipt slot, Beamix proposes: *"You read the Receipt slot 28× last quarter and scrolled past the per-engine strip. Move it up?"* The Brief gets a clause; the page evolves.
- **Customer's brand-appropriate /home.** Aria the CTO wants a forensic /home; Sarah wants a billboard. They're the same persona at different attention budgets. Composability serves both without forcing the team to build two pages.

---

## §3 — Customer-created surfaces (5 example custom pages)

The deeper Notion move: *customer creates new pages from primitives.* `/new-page` opens the template gallery + blank canvas. Each customer-page gets the F31 BriefBindingLine at bottom (system canon survives composition).

### 3.1 /partners
Customer adds CompetitorRowBlocks for their *partners* (positive-relationship view). Tracks if partners cite each other in AI engines, watches their score delta as a co-marketing signal. Marcus uses this for his 3 integration partners (Linear-style: tracks if Vercel mentions him in *their* pricing-page comparisons).

### 3.2 /content-calendar
Customer composes a calendar view of upcoming planned content with FAQ-Agent suggestions per date. Each day-cell is a small AgentRowBlock + draft preview. Dani uses this — she runs a content calendar in Notion today; bringing it into Beamix where the FAQ-Agent already lives is a force-multiplier.

### 3.3 /lead-attribution-by-source
Yossi's custom view aggregating TwilioNumberBlocks by client. 12 rows, one per client, each showing this-month's calls + UTM clicks + month-over-month delta. **This is the page Yossi would build himself in 11 minutes if Beamix gave him the blocks. It's also the page Beamix can never anticipate, because Yossi's specific 12-client cockpit shape is unique to him.**

### 3.4 /press-mentions
Customer tracks mentions in publications (different from AI engines) with Reporter-Agent's findings. Composed from CompetitorRowBlock variants (extended to "publication entity") + a news-feed widget. Tracks brand mentions at TechCrunch, Verge, niche industry pubs. Reputation Layer (Year 1.5) materializes here.

### 3.5 /experiments
Marcus's hypothesis log. Each row: hypothesis + agent action that tests it + Brief-clause grounding + outcome metric. *"If we change the homepage H1 to mention 'API platform' instead of 'developer platform', will Schema Doctor's perception shift in Claude?"* Run as a 30-day experiment, page renders the result. The Linear-experiment-tracker pattern, native to Beamix's data.

### 3.6 The slash command
`/` anywhere opens the command palette: insert block · run agent · search docs · open page · create new page · jump to setting · search Brief clauses · open template gallery · invoke dry-run on selected node. **The slash command is the universal entry point.** Yossi's Cmd-K becomes `/` consistently across surfaces. The keyboard discipline that Linear got right.

### 3.7 Each customer-page gets the Brief grounding line at bottom (F31)
The system canon survives composition. Even on a customer's hand-rolled /partners page, the F31 BriefBindingLineBlock auto-mounts at the footer. Composability of the body; rigidity of the constitutional fixture. This is the Notion lesson: *be radically flexible everywhere, except where the brand is the point.*

---

## §4 — The Brief as composable

Today the Brief is 4 fixed clauses. The Notion alternative: Brief is a stack of BriefClauseBlocks. Customer adds clauses, removes, reorders. The Brief becomes a Notion-style page with cream-paper background and Fraunces clauses as block content.

### 4.1 The mechanics

- BriefClauseBlock is the primitive (already specified in §1.4).
- Each clause carries a clause_id + version + signed_at. Adding a clause requires a fresh Seal stamp (the constitution is amended, not rewritten).
- Customer can **fork an industry-template Brief** — B2B SaaS template (8 default clauses), e-commerce template (10 default clauses), agency template (12 default clauses). Forking copies the clauses; the customer edits.
- The Seal still stamps at signing — at the bottom of the entire Brief, not per-clause. One ceremony, not N.

### 4.2 The trade

Adam locked 4 clauses for editorial reasons — a constitution must be terse. A 47-clause Brief reads like SaaS terms-of-service, not a constitution. The structural commitment of "I have read all 4 clauses" is meaningfully different from "I have not read the 47-clause document."

The Notion-pure version would push for unlimited clauses + clause-grouping (sections). The mitigation: **soft cap at 12 clauses, with a UI nudge at clause 8 that says "constitutions get weaker after 8 clauses — consider grouping or pruning."** The cap respects Adam's editorial weight; the composability respects Yossi's need for per-vertical-client clauses.

### 4.3 What this unlocks

- Yossi's 12-client agency: each client's Brief inherits from his agency's master Brief + adds client-specific clauses. The composition model maps directly to the agency relationship.
- Vertical-3 (local services) Brief template can be authored independently of code releases — the Brief is data, not surface.
- A library of public Brief templates (with permission) becomes a recruiting / SEO surface — *"see how Vercel's Beamix Brief is structured."*

### 4.4 What this risks

The constitutional weight of the Brief comes partly from its terseness. If every customer can balloon their Brief to 47 clauses, the average customer's Brief reads like a SaaS TOS — and the Seal-on-signing ceremony becomes a checkbox click. **The cap and the Beamix-authored default protect this.**

---

## §5 — /workspace as Database View

Today /workspace is a fixed step-by-step pipeline (each agent runs through 10 steps, narration column on the right per Board 2 D). The Notion alternative: /workspace is a **Database View** on `agent_jobs` rows, and the customer can create alternative views.

### 5.1 The database

`agent_jobs` is already the underlying table:
- agent_id, status, started_at, completed_at, output_type, brief_clause_ref, validator_token, business_id (Yossi's multi-client), provenance_envelope, draft_hash.

### 5.2 The view types

- **List view** — current /workspace. Default for Marcus.
- **Kanban (by status)** — Pending / Validating / Awaiting-approval / Approved / Live / Failed. Default for Sarah's at-a-glance.
- **Calendar (by scheduled-run-date)** — how Yossi sees his weekly pack. *"Mondays are heavy. Wednesdays are light. Move the Schema Doctor run to Tuesday."*
- **Gallery (cards with monogram + status + last action sentence)** — beautiful for screenshots; useless for operations. The default for OG share.
- **Timeline (Gantt over the week)** — Yossi's instrumentation. Visualizes the parallel fan-out of his Mon-7am workflow.

### 5.3 Filters / sorts

By agent, status, output-type, business-domain (Yossi-multi-client filter), Brief-clause, vertical, autonomy-setting, "needed Aria's review", "modified in last 24h" (Trace filter).

### 5.4 Saved views per customer

Marcus saves "what's failing right now" — kanban view filtered to status=Failed, sorted by recency. Sarah saves "this week" — list view filtered to last 7 days. Yossi saves "Acme.com only" — list view filtered to business_id=acme.

### 5.5 The trade

Opinionated default vs flexible-power-user. The current /workspace is opinionated — it tells you the story Beamix wants to tell. The database-view version makes /workspace a tool, not a narrative. **The narration column (per Board 2 D) might survive as a default *list-view-only* feature; the kanban/calendar/timeline views would render without narration because they have different jobs.**

### 5.6 The Notion-pure version

Keep the narration column on List view as the default. Add three other views as escape hatches. Saved views become per-customer LocalStorage + Postgres preference. This is a 2-week build, not a 2-month build, and it solves a real Yossi pain (he can't see his weekly pack as a calendar today).

---

## §6 — Slash command + template gallery

This is Notion's growth engine. The two together turn customers into distribution channels.

### 6.1 The slash command

`/` opens the universal palette anywhere:
- **Insert block** — all 18 primitives, fuzzy-searchable.
- **Run agent** — invoke any agent on a target URL/section without leaving the page.
- **Search docs** — Brief clauses, Truth File, House Memory, Citation Vault.
- **Open page** — any product surface or customer-created page.
- **Create new page** — opens template gallery + blank canvas.
- **Jump to setting** — every settings sub-page reachable in 2 keystrokes.
- **Search Brief clauses** — "show me clause about competitor mentions" → instant nav.
- **Dry-run** — invoke validator + dry-run on the currently-focused agent or workflow node.

The keyboard discipline that's missing from PRD-v3. Cmd-K is mentioned for /crew/workflows (Yossi's quick-add); a system-wide `/` makes Beamix feel like Linear, Notion, Cursor — the tools the wedge already loves.

### 6.2 The Beamix Template Gallery

Public-indexed-by-Google. Every published template is an SEO surface. The first 12 templates Beamix ships:

**4 industry Briefs:**
- B2B SaaS Founder Brief (8 clauses)
- E-commerce Operator Brief (10 clauses)
- Agency Owner Brief (12 clauses, multi-client patterns)
- Local Services Brief (post-MVP, 8 clauses)

**3 dashboard layouts × 4 verticals = 12 hero layouts:**
- The Founder (B2B SaaS)
- The Agency Cockpit (Yossi)
- The E-comm Channel View (Dani)
- The CTO Audit View (Aria)
- The Local Operator (post-MVP)
- ... and 7 more sub-templates per vertical.

**Workflow Builder templates:**
- Yossi's Competitor → Fix → Review → Ship workflow
- Marcus's Schema Doctor + FAQ Agent weekly check
- Dani's Pre-Black-Friday content audit
- Aria's compliance review workflow
- ... and ship with 3-6 per Board 2 + Architect §3 spec

### 6.3 The viral loop

Yossi publishes "Yossi's 12-Client Agency Cockpit" template to the public gallery (his choice, opt-in). The page is:
- Title + Yossi's portrait (or his agency's logo)
- "Composed by Yossi at [agency]. Used by 14 agencies."
- 1-line description.
- Live preview (read-only).
- "Use this template" button → forks into the user's Beamix workspace.

It gets 200 page views from agency Twitter; 30 trial signups; 12 of those become Scale-tier customers; Yossi gets a "Featured Composer" badge on his /crew page.

**This is the growth motor that Frame 5 v2's Worldbuilder Channel #2 (Beamix Sessions) and #3 (/scan-as-content) implicitly want but don't quite reach.** The template gallery is the asymmetric channel that costs $0 of acquisition spend and earns evangelism on every share.

---

## §7 — The verdict — defend or override

After running the alternative, here's the steel-man on both sides.

### 7.1 Steel-man: "Frame 5 v2 fixed-page-spine is right"

1. **Editorial control = brand consistency.** Notion's 8-out-of-10-pages-are-ugly tax is real. Beamix is a billion-dollar-quality product per the locked vision; the calm defaults that Sarah screenshots come from rigorous design-team curation, not customer composition. The locked spine protects the brand at the moment when the brand is the moat.

2. **Cognitive load discipline for the wedge.** Marcus, Dani, and Yossi are tech-native — but their *attention budget for Beamix* is 6-10 minutes/week. Composition is a power-user feature that costs every customer the navigation overhead of "where is the thing I want?" The fixed spine means *every Marcus knows where /inbox is.* Composability fragments that.

3. **MVP scope discipline.** Beamix ships in weeks, not quarters. Building 18 primitives + grid system + slash command + template gallery + per-block embedding logic + permission model is a 6-month project. Frame 5 v2 has 31 features already; adding composability to MVP would knock out 5 of them. The locked spine is the MVP-shaped decision.

### 7.2 Steel-man: "Beamix should be composable"

1. **The Workflow Builder already proved composability has product-fit.** Yossi pays 2.6× for the right to compose his own DAG. The same logic applies to dashboards: agency operators have unique cockpit shapes that no fixed /home can serve. Workflow Builder is composable for power users; /home is fixed for Marcus. **Why is the discrimination at this layer correct?** A Notion answer: it isn't — the discrimination should be defaults vs. composition, not surface-by-surface.

2. **The data flywheel needs surface flexibility.** Frame 5 v2 promises a data flywheel + 12 vertical KGs + 18 agents + Reputation Layer + Citation Vault + Predictive Layer. Each of these will produce *new data shapes* the team didn't anticipate at launch. Fixed pages will lag the data by months; composable surfaces let the data find its display the day it lands. This is the Notion-vs-Linear distinction: Linear knows what an issue is forever; Notion accommodates whatever you decide a database is.

3. **Composability is the moat against Profound and incumbents.** Profound copies execution agents in 6-9 months. They cannot copy a 12,000-template gallery composed by 200 Yossi-types. The compounding moat at Year 3 isn't the agents — it's the *customer-composed surface library*. This is the Frame 5 Architect's "5 spin-out products from accumulated data" claim made tangible.

### 7.3 My call as Notion / Ivan

**Hybrid. Composable on /reports + customer-created surfaces only. Keep /home, /inbox, /scans, /workspace, /crew, /competitors, /security, /settings fixed for MVP. Ship the slash command system-wide.**

The hybrid sweet spot:

- **Core surfaces stay fixed for MVP.** Marcus needs /inbox to be /inbox. Sarah needs /home to be calm-by-default. The wedge customer is not asking for composition; they're asking for "make AI search visibility legible in 6 minutes a week." The fixed spine serves that wedge.

- **Customer-created pages exist as a separate surface family.** `/new-page` + slash command + 18 primitives + template gallery. Yossi gets his cockpit; Dani gets her content calendar; Marcus's Aria gets her audit view. **None of these compete with the core surfaces — they extend them.** This is the "Workflow Builder pattern extended to other surfaces": Workflow Builder exists alongside /crew; customer-pages exist alongside /home.

- **/reports specifically becomes composable at MVP.** Reports are inherently customer-shaped: the metrics they care about, the date ranges they audit, the slices they show their CEO. /reports today is a fixed Monthly Update artifact + on-demand exports. Make /reports the *first* composable surface — customer composes a report from blocks, schedules it to email, publishes to a permalink. The Monthly Update is *one template in the gallery*.

- **System-wide slash command at MVP.** Cheap to build (~2 weeks), massive UX win, signals the wedge that Beamix belongs in their Linear/Notion/Cursor toolbelt. Doesn't require composability of surfaces.

- **Defer full /home composability to MVP-1.5 or Year 1.** When the team has 100+ paying customers and hard data on which sections of /home they ignore, then ship the composable /home with the 5 hero templates. The 5 hero templates above become canonical, hand-designed defaults — composability is the escape hatch, not the front door.

This hybrid honors Adam's locked spine (the MVP ships with 9 surfaces fixed). It opens the *one* surface where composition is genuinely customer-shaped (/reports). It ships the slash command for the keyboard-first wedge. And it sets up the path to composable /home in MVP-1.5 or Year 1 *without* refactoring the fixed surfaces — they become "templates of blocks" rather than "page components" over time, with no breaking change to customers.

The Frame 5 v2 trajectory and the Notion trajectory aren't actually orthogonal. **Frame 5 v2 is the locked default; Notion is the unlock.**

---

## §8 — The 3 things Notion would steal from Beamix

The exchange runs both ways. Here's what Ivan would ask his team to study.

### 8.1 The Brief grounding inline citation (F30)

Notion has nothing this structurally committed. Every Notion page is a free-form composition; *what authorized this page to exist* is not a concept Notion has architecturally. Beamix's "every action carries an inline citation back to the Brief clause that authorized it" is a constitutional move — the page knows *why it exists*. **This is the move I'd steal first.** Notion's AI features specifically would benefit from "this AI action was authorized by [your workspace policy clause]" — the structural commitment Rams flagged would be foundational for AI in any system.

### 8.2 The Cycle-Close Bell (F23)

Notion would steal this for completed projects. Today, when a Notion project is marked Done, nothing happens — the page goes quiet. The Beamix move is to *announce closure* with a 2-second curtain-close: the rings settle, the status sentence rewrites once, the artifact is generated. Notion's "completed projects" deserve this resolution moment. **Ivan would commission a v2 of this for the Notion Tasks roadmap.**

### 8.3 The Seal

Notion's signing moments are weak. "Send for approval" is a button click; the Notion equivalent of Beamix's Seal-stamp doesn't exist. The Seal as an uncopyable signature canon — the 4-pointed asterisk, the 540ms stamp, the per-customer-seed deterministic geometry — is the kind of *brand-as-function* move that Apple's chime, Twitter's like-heart-burst, or Stripe's checkout-success-shimmer represent. **Notion would commission a Seal-equivalent for every workspace's signing moments — approvals, document finalization, contract acceptance.**

A bonus 4th: **the per-agent deterministic seed-to-fingerprint function** (Board 2 #23 / Kare's MoMA move). Notion has 60+ workspace icon types but no *function-spine* — no rule that produces icons from UUIDs. The function-as-brand-canon is the move Beamix is shipping that even Notion's design team would study.

---

## §9 — The one thing Adam should re-confirm or reframe

After the alt-vision, the question that needs Adam's conscious confirmation:

> **Are the 9 fixed surfaces a *feature* of Beamix, or a *constraint* of Beamix's launch?**

The locked-spine answer (Frame 5 v2 / PRD v3 / Board 2): **feature.** The opinionated calm of every Beamix page is the brand. The wedge customer is not asking for composition; they're asking for legibility. The team's craft labor goes into perfecting 9 surfaces, not into building a meta-system for composing N surfaces.

The Notion answer: **constraint.** The 9 surfaces are an MVP shape that compresses information into pages because pages are how SaaS shipped circa 2010-2025. The actual architecture is 18 primitives that already exist as cells inside those pages. The bigger company Beamix becomes is the one where the primitives are the API and customers' compositions are the moat at Year 3.

**My recommendation:** Adam should confirm "feature" for MVP — the spine is right for the wedge, the timeline, and the brand discipline. AND should reframe to "constraint" for Year 1 — meaning: build the MVP with the fixed-spine UX, but architect the underlying components as a primitive library from day one. Ship the slash command at MVP. Make /reports the first composable surface. Treat the other 8 surfaces as *the team's hand-designed default templates*, not as page-shaped one-offs. The customer-composed future is unlocked one surface at a time, not all at once, not never.

Reframing this consciously now changes how the Build Lead specs each component for MVP: every block-equivalent gets a clean prop interface, a stable data shape, and a registry entry. The fixed spine ships. The composable future is loaded in the chamber.

---

## Closing — Ivan to Adam

Adam,

We ran the alt. Here's the strongest version: 18 primitives + slash command + template gallery + 5 hero /home templates + customer-created pages + composable Brief + /workspace as database view. It would take Beamix from "great vertical SaaS app" to "category-defining operating system for AI search visibility" in the same way Notion took us from "good wiki" to "platform people compose their company on." It would also take 6 months you don't have, blow the Trust Architecture lock-before-MVP commitment, and risk the brand discipline that's the actual moat of your locked spine.

Here's why we wouldn't ship the full alt at MVP: you're not Notion. You're Beamix at the wedge. Marcus needs /inbox to be /inbox. Sarah needs /home to be calm. The fixed spine you locked is the right MVP shape — for the wedge, the timeline, the team, the trust budget. The Notion-version of Beamix is correct in 18 months when there are 200 Yossi-types asking for cockpit composition and the 12 vertical KGs are producing data shapes the team can't anticipate.

Here's what we *would* ship now, even at MVP: the slash command system-wide, /reports as the first composable surface, and the architectural commitment to building the 9 fixed surfaces as compositions of named primitives — so when MVP-1.5 or Year 1 arrives and the data starts wanting more shapes than the team can manually design, the unlock is a feature flag away, not a 6-month refactor.

Lock the spine for MVP. Architect the primitives now. Ship the slash command. Make /reports composable. Steal back from Notion the three moves we'd steal from you. Your Brief grounding citation is the single best structural commitment I've seen in a SaaS product since we shipped Notion AI's source-citing — and you committed harder than we did. The constitution survives composition. That's the move.

— Ivan

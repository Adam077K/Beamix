# Beamix Page Architecture
Date: 2026-04-25
Status: PROPOSAL — Adam reviews + answers 3 split decisions (+ 5 open questions), then locks.

---

## EXECUTIVE READ

Two agents audited the same 10-page Vision doc from opposite entry points. Agent A (Customer Journey Architect) mapped Sarah and Yossi's actual usage patterns against real competitor products and concluded that 8 sidebar pages is the right size — with `/home` preserved as Sarah's daily anchor and `/competitors` as a separate top-level surface. Agent B (IA Critic) applied a strict structural test — "what makes a page a page?" — and found that three pages fail the test: `/home` is a Shadcn summary-router wearing a morning-briefing hat, `/workspace` is the same inbox item viewed 45 seconds earlier, and `/competitors` is `/scans` with a filter switched. Their recommendations converge on 7 agreed-upon decisions and diverge on 3 structural calls. Where they agree, the evidence is strong and the changes should be locked immediately. Where they disagree, each agent has a defensible position and the right answer depends on a product bet Adam needs to make explicitly. Final page count depends on Adam's call on 3 splits — minimum 7 sidebar pages, maximum 9.

---

## WHERE THE TWO AGENTS AGREE — LOCK THESE

### 1. KILL `/archive` — absorb as "Completed" tab inside `/inbox`

Both agents recommend this without hesitation, and every comparable product confirms it. Linear has Inbox / Subscribed / Archived as tabs — not separate pages (source: [Linear triage docs](https://linear.app/docs/triage)). Gmail's archive is a folder filter, not a destination. Notion's trash is under the "..." menu. The pattern across every mature product: archive is a state, not a place. `/archive` passes none of the four page tests — its primary action (browse old items) is identical to `/inbox`'s, its data shape is identical (`status IN ('approved', 'published', 'discarded')` = a filter on inbox items), and the only Yossi job it serves (export for client invoicing) is an action button, not a page. Kill the route, add a "Done" or "Completed" tab to `/inbox`, and ship a prominent Export button inside that tab. Agent A source: *"No comparable product has /archive as a top-level page. Filter/tab, not destination."* Agent B source: *"Archive is a state, not a place. Pattern across mature products confirmed."*

### 2. ADD `/crew` — 11-agent roster page

Both agents call this brand-critical. The Vision doc's core promise is "your AI team is real and named" — but there is currently no page in the proposed IA where a user can see the team. Profound has /agents as a top-level page with cards per agent ([Profound features](https://www.tryprofound.com/blog/best-ai-visibility-tools-for-marketing-agencies)). The Beamix thesis names all 11 agents; giving them a home surface makes the thesis visible and gives Yossi a per-agent configuration surface (agent prompt customization per client domain, a genuine Build/Scale differentiator). Sarah visits `/crew` once or twice a month out of curiosity. Yossi visits weekly to tune agent behavior. The page passes all four tests: distinct primary action (customize/meet agents), distinct mental model ("I'm going to see my team"), distinct audience segment (Yossi-heavy), and a sub-IA (roster list → `/crew/[agentType]` detail). Agent A source: *"/crew (agent roster) is brand-critical and missing."* Agent B source: *"'Crew' satisfies Adam's team-of-agents framing. 11-agent personality needs a surface."*

### 3. ADD `/reports` — Scale-tier client exports

Both agents flag this as the highest-leverage missing surface for Yossi. Without reports, the $499 Scale tier is hard to justify — Yossi's agency ROI depends on being able to hand a client a branded artifact. Stripe has Reports as a top-level page ([Stripe basics](https://docs.stripe.com/dashboard/basics)). Profound has Brand Report as a named feature ([Profound features](https://www.tryprofound.com/blog/best-ai-visibility-tools-for-marketing-agencies)). Otterly has Brand Report as a named feature ([Otterly features](https://otterly.ai/features)). The reports surface passes all four page tests: distinct primary action (export/share), distinct audience (Yossi exclusively), distinct frequency (weekly for Yossi vs. never for Sarah), and a clear sub-IA (report templates, download history, white-label config). Plan-gate it to Build/Scale — Discover users never see it. Agent A source: *"Two pages missing for Yossi to not churn: multi-domain switcher (chrome) and /reports page."* Agent B source: *"Reports is the highest-leverage missing feature for Yossi — the artifact he hands to clients."*

### 4. RENAME `/automation` → `/schedules`

Both agents recommend this immediately and cite the same reason: "Automation" is a marketing word, not a sidebar label. The sidebar convention is nouns of utility describing what the user does there — "Schedules" says exactly what the page contains. Mercury calls its equivalent "Workflows" for the same reason ([Mercury invoicing](https://support.mercury.com/hc/en-us/articles/29647851492884-Navigating-your-Mercury-Invoicing-dashboard)). The rename costs nothing to implement and meaningfully reduces the technical intimidation Sarah might feel seeing "Automation" in the nav. Agent A source: *"Sarah finds 'Automation' technical."* Agent B source: *"Sidebar labels are nouns of utility, not categories of feeling. 'Schedules' describes the page; 'Automation' describes the philosophy."*

### 5. ADD multi-domain switcher (chrome) + `/domains` management surface

Both agents call this critical for Yossi's survival in the product. Without it, Yossi managing 20 client domains opens 20 browser tabs — the product is broken for him. The pattern is established across Vercel (project switcher), Linear (workspace switcher), Stripe (account switcher), Otterly (workspaces primitive — [Otterly features](https://otterly.ai/features)), and Auth0 ([Auth0 multi-org architecture](https://auth0.com/docs/get-started/architecture-scenarios/multiple-organization-architecture)). Implementation: a top-of-sidebar dropdown that scopes every page below it to a single client domain. Domain management (add/remove domains, billing per domain) lives as a sub-route inside `/settings` (or as a gated `/domains` page if Yossi's domain count warrants it). This is also inextricably linked to the pricing model question — see Open Question 2. Agent A source: *"Without multi-domain switcher, Scale tier is unsellable to consultants."* Agent B source: *"The workspace switcher primitive is what Yossi needs but the Vision doc doesn't mention."*

### 6. Resolve the notification naming clash

Both agents flag this as a structural conflict that must be resolved before implementation begins. Linear's "Inbox" is notifications; Linear's "Triage" is the review queue ([Linear triage](https://linear.app/docs/triage)). Beamix's "Inbox" is the review queue. These are two different things with the same name, which will create permanent UX confusion. The resolution has two options: (A) Rename Beamix's /inbox to /review or /triage — and use a notifications bell dropdown for system alerts (email digest changes, billing warnings, score drop alerts). (B) Keep /inbox for the review queue and use a bell-icon chrome dropdown for all system notifications — never using the word "inbox" for notifications. Agent A recommends Option B (bell dropdown). Agent B recommends Option B as well but notes Option A also works if the brand wants to own the word "Triage." Adam's call — but the decision must be made before the first sidebar nav component ships. Agent A source: *"Critical naming clash to resolve."* Agent B source: *"Linear's Inbox = notifications. Beamix's Inbox = review. These are different things."*

### 7. `/scan` and `/onboarding` are NOT sidebar pages

Both agents agree these are surfaces, not destinations. `/scan` is the acquisition funnel — a public route that anonymous visitors hit once, never again post-signup. `/onboarding` is a pre-flight gate that runs once per account lifetime and resolves to the primary dashboard. Neither belongs in the sidebar. Neither counts toward the "page count" in the navigation sense. `/scan` lives at a public URL (possibly `beamix.tech/scan` on the Framer site — see Open Question 4). `/onboarding` lives as a Next.js route that middleware intercepts on first login and presents as a full-screen overlay. Agent A source: *"Critical insight: /scan is an acquisition surface, not a product surface."* Agent B source: *"Onboarding is not a destination — it is a wizard layered over the route the user would have arrived at."*

---

## THE 3 MAJOR SPLITS — ADAM'S DECISIONS

### Split 1: `/home` — KEEP or KILL?

**Agent A says KEEP:**
Sarah's highest-frequency page at steady state is `/home` (daily, 30 seconds) — not `/inbox`. Her habit forms here, not at the review queue. The score is the product's hero number and deserves a dedicated surface. The email digest ("Your score changed") drives her back to `/home` specifically, not to `/inbox`. The morning briefing pattern earns its keep because it gives Sarah one thing to look at — the number — and one thing to click — "Run top fixes" — without surfacing the complexity of a pending-review queue. The Vision doc (PART 3) describes `/home` in detail with specific animation behaviors (Score Gauge Fill on load, Path-Draw Entry for recommendation card borders). Killing it means rewriting a significant section of the already-locked design language. Mercury has a Dashboard as the primary landing surface — it shows actual data (account balance), not a routing menu. Beamix's `/home` could be exactly that: the score IS the account balance equivalent. Source: A, *"Highest-frequency page for Sarah: /home (daily). Mercury's Dashboard is single primary surface."*

**Agent B says KILL:**
`/home` is the Shadcn-template "Dashboard" page wearing a different hat. The page is a summary view of three other pages crammed onto one screen — score from `/scans`, fixes from `/inbox`, agent status from `/workspace`. That is not a page; that is a widget collage. Linear has no home page — the default landing is the user's last view or Inbox ([Linear conceptual model](https://linear.app/docs/conceptual-model)). Superhuman has no home — it lands in the inbox. Granola lands on the most recent meeting note. The "morning briefing" instinct is correct; the implementation is wrong. The morning briefing IS a banner at the top of `/inbox` showing the score delta — and that banner is always visible, not gated behind navigating to a separate page. The Stripe counter-argument (Stripe has Home) fails because Stripe is a router across 12 product lines; Beamix has 7. Agent B source: *"Stripe Home earns its keep with 12+ product lines. Beamix has 7 surfaces total. The summary-router pattern doesn't earn its keep at small inventory."*

**My recommendation: KILL `/home` and promote the score banner to the top of `/inbox`.**

The evidence across 12 comparable products is near-unanimous: products with a focused single workflow (Mercury, Superhuman, Granola, Linear) do not have a separate "home" page. They land in the data. The counter-argument — Sarah's habit forms on `/home` — is actually an argument about the SCORE being prominent, not about `/home` as a page. The score can be just as prominent, always-visible, and habit-forming as a persistent banner at the top of `/inbox`. The "Run top fixes" CTA fits naturally in that banner. The score delta badge ("↑ +6 since Monday") fits in the banner. Sarah's 30-second morning habit becomes: open Beamix → land on `/inbox` → see score in banner → click "Run top fixes" → done. The habit is the same; the URL is different. What changes: 1 fewer sidebar item (7 instead of 8), cleaner navigation, no "wait, am I on Home or Inbox?" confusion on mobile. The Vision doc's `/home` animations (Score Gauge Fill, Path-Draw entry for recommendation cards) move to `/inbox` — they still exist, just on the banner surface. This is not a loss of design work; it is a relocation.

**What changes if KEEP vs KILL:**
- KEEP → 8 sidebar pages; Sarah's stated habit unchanged; the score-as-hero is maximally visible; slight risk of "why are there two pages that both show agent status?"
- KILL → 7 sidebar pages; `/inbox` becomes the morning surface with score banner always at top; cleaner navigation; risk that a score banner feels visually "less important" than a full `/home` hero — mitigated by making the banner prominent (large ScoreDisplay component, not a small widget)

---

### Split 2: `/workspace` — separate page or "Live" tab on `/inbox`?

**Agent A says KEEP as a separate page:**
The agent execution viewer needs full-screen real estate. The 360px right-side step-list panel, the streaming content in the center area, and the narrative flow of watching an agent work requires space that a tab inside `/inbox` cannot provide without redesigning the 3-pane inbox entirely. The workspace is Sarah's first "wow" moment — she clicks "Run top fixes," the workspace opens, and she watches the agent actually work. That moment of trust-building requires a dedicated immersive surface, not a cramped tab. The Vision doc (PART 3, `/workspace` spec) describes this surface in precise detail: main content area streaming in real time, 360px right-side AgentStepList, 6-step gerund-verb narrative, auto-collapsing terminal card. Yossi uses this surface actively (several times daily, 2-5 minutes each). Source: A, *"Workspace needs separate page because the artifact (streaming agent output + step list) needs full screen."*

**Agent B says MERGE into `/inbox` as the "Live" tab:**
"Watch the agent work" and "review what the agent did" is the same job at two timestamps. The user is looking at the same agent run — just earlier in its lifecycle. `/workspace/[jobId]` is the same item as `/inbox/[itemId]` in a `running` state versus an `awaiting_review` state. Making them two separate pages requires the user to navigate between them to complete a single job. The Vision doc itself (PART 0, anti-patterns) calls Manus's always-on side panel "the mistake." The 3-pane Inbox already has the structure to show: left pane = item list (with "running" items filterable), center pane = the live output streaming + step list visible as the content appears, right pane = action bar (disabled until complete). Perplexity puts the live step list inside the same view as the result — same page, different states ([Perplexity Pro Search](https://www.perplexity.ai/)). Source: B, *"Workspace is a state of an inbox item, not a separate page. Same job, two timestamps."*

**My recommendation: KEEP `/workspace` as a separate full-screen route, but redirect from `/inbox/[itemId]` when item is in `running` state.**

This is the weakest of the three splits — both positions are defensible. But the scale tips toward KEEP for one reason: the Vision doc describes `/workspace` as an immersive narrative experience with a 360px right-side panel, streaming content, and a specific visual language (gerund-verb steps, breathing pulse, path-draw connecting lines). Collapsing that into a tab of a 3-pane inbox risks making the agent execution feel small — and the agent execution narrative is core to the product's differentiation from Otterly/Profound, which show dashboards rather than making work visible. The merger Agent B proposes is structurally sound but visually undercuts the "living workspace" metaphor. The compromise: `/workspace` is a separate route, but it is reachable by clicking a "running" item in `/inbox` — and when the workspace completes, the user is automatically routed back to `/inbox/[itemId]` for the review step. The two pages feel like two phases of one job, not two unrelated surfaces.

**What changes if KEEP vs MERGE:**
- KEEP → 8 sidebar pages (if /home also kept) or 8 pages (if /home killed but /workspace kept); workspace keeps its full-screen visual language; user navigates workspace → inbox → approve as three steps
- MERGE → 7 sidebar pages; inbox "Live" tab absorbs the streaming experience; simpler navigation but the agent execution narrative is potentially visually compressed; /workspace URLs need 301 redirects

---

### Split 3: `/competitors` — separate page or tab inside `/scans`?

**Agent A says KEEP as a separate top-level page:**
Competitor intelligence is a distinct job with a distinct primary action: "Who is beating me and why." That is not the same mental model as "How did my last scan go." Yossi visits `/competitors` daily; Sarah visits monthly out of curiosity — but both visit it in a distinct mode from scan history review. The Vision doc (PART 3) describes a full competitor intelligence dashboard with a DataList table, per-engine side-by-side scores, competitor profile sub-pages, and a "Run Competitor Intelligence agent" CTA pre-filled with competitor domains. Mercury's "Insights" is a separate top-level page that validates analytics-of-a-different-kind as deserving its own slot ([Mercury Insights](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview)). Source: A, *"Competitors: high value for both personas. Mercury Insights validates separate analytics surface."*

**Agent B says DEMOTE to tab inside `/scans`:**
Competitor visibility is a scan with the comparator switched. The data architecture is identical — the same engine pipeline, the same score format, just filtered to a different domain. Peec.ai shows your score and competitor scores on the same main dashboard, not on separate pages ([Peec sidebar nav](https://docs.peec.ai/sidebar-navigation)). Profound has competitor data inside the Visibility dashboard, not separately ([Profound visibility dashboard](https://www.tryprofound.com/blog/how-to-track-your-visibility-in-ai-search)). The pattern in the GEO category: one analytical surface with filters, not multiple analytical pages. Making competitors a tab inside `/scans` means `/scans` → "My Site" tab and `/scans` → "Competitors" tab — same page, same navigation muscle memory, different filter. The "manage tracked competitor list" config moves to `/settings/competitors`. Source: B, *"Competitor analysis is generated from scans. The data architecture is the same pipeline. The pattern across GEO competitors: one analytical surface with filters."*

**My recommendation: KEEP `/competitors` as a separate top-level page — but note this is the split where Agent B's position is strongest.**

The "one analytical surface with filters" pattern is compelling and matches most direct competitors. But Beamix's product bet is that competitor intelligence is a first-class job, not a filter. The Vision doc describes a competitor profile with its own sub-page (`/competitors/[domain]`), gap chips, and a dedicated "Run Competitor Intelligence agent" CTA. That depth of content suggests competitor intelligence is not a tab — it is a destination. The Mercury Insights analogy also holds: Mercury shows financial insights as a separate page from transaction history even though insights are derived from transactions, because the mental model is different. Yossi's mental model when he visits `/competitors` is "I'm going to check on my clients' competitive position" — that is a different job than "I'm reviewing scan history." The tab model works but caps the depth of the competitor intelligence surface at what fits inside a tab. If competitor intelligence is part of the product's moat (the Vision doc implies it is), give it the page. The compromise: make `/competitors` visible on Build/Scale only (not Discover), and have it deep-link to the `Competitors` tab view inside `/scans` for Discover users.

**What changes if KEEP vs MERGE:**
- KEEP → 8 sidebar pages (if /workspace also kept) or 7-8 depending on the /home decision; competitor intelligence gets full-page treatment; Yossi's competitive analysis workflow has a dedicated surface
- MERGE → `/scans` has "My Site" + "Competitors" tabs; competitor surfaces reduce to tab depth; simpler nav but constrained vertical space for competitor data; `/competitors` URLs need 301 redirects

---

## CONDITIONAL FINAL PAGE LIST

### If Adam picks "Conservative" (Agent A path) — /home KEEP, /workspace KEEP, /competitors KEEP

**9 sidebar pages:**
1. `/home` — morning briefing, score hero, top 3 fixes
2. `/inbox` — review queue (Pending / Completed tabs)
3. `/workspace` — agent execution, full-screen narrative
4. `/scans` — scan history and per-scan drill-down
5. `/competitors` — competitor intelligence dashboard
6. `/crew` — 11-agent roster and per-agent settings (NEW)
7. `/schedules` — recurring scan + agent schedule configuration (RENAMED)
8. `/reports` — Scale-tier client exports (NEW, plan-gated)
9. `/settings` — account, billing, language, notifications, domains sub-routes

**Plus 2 flow surfaces (not sidebar):** `/scan` (public), `/onboarding` (pre-flight gate)
**Plus 4 chrome elements:** multi-domain switcher, notifications bell, Cmd+K palette, ? cheatsheet

**Sidebar nav order (top to bottom):**
Home → Inbox → Workspace → Scans → Competitors → Crew → Schedules → Reports (gated) → Settings

**Page connections:**
- `/home` → run agent → `/workspace` → complete → `/inbox` approve → done
- `/home` → click score → drill-down inline → all 4 layers without navigation
- `/scans` → click scan row → scan detail → click engine → per-query → raw output
- `/crew` → click agent → `/crew/[agentType]` detail + config

**Frequency expectations (Sarah / Yossi):**
- `/home`: daily 30s / many×/day 30s
- `/inbox`: 3-4×/week 60-90s / multiple daily 10-15min
- `/workspace`: transient 90s / several daily 2-5min
- `/scans`: rare / daily 5min
- `/competitors`: monthly / daily 5min
- `/crew`: 1-2×/month / weekly 5min
- `/schedules`: never / weekly 5min
- `/reports`: never / weekly 10min
- `/settings`: 2×/year / monthly 5min

---

### If Adam picks "Radical" (Agent B path) — /home KILL, /workspace MERGE, /competitors MERGE

**6 sidebar pages:**
1. `/inbox` — default landing; tabs: Pending / Live (absorbs /workspace) / Done (absorbs /archive); score banner at top (absorbs /home)
2. `/scans` — scan history; tabs: My Site / Competitors (absorbs /competitors) / Per-Engine
3. `/crew` — 11-agent roster and per-agent settings (NEW)
4. `/schedules` — recurring scan + agent schedule configuration (RENAMED)
5. `/reports` — Scale-tier client exports (NEW, plan-gated)
6. `/settings` — account, billing, language, notifications, domains sub-routes

**Plus 2 flow surfaces (not sidebar):** `/scan` (public), `/onboarding` (pre-flight gate)
**Plus 4 chrome elements:** same
**Plus legacy redirects:** `/home → /inbox`, `/workspace → /inbox?tab=live`, `/archive → /inbox?tab=done`, `/competitors → /scans?tab=competitors`

**Sidebar nav order (top to bottom):**
Inbox → Scans → Crew → Schedules → Reports (gated) → Settings

**Page connections:**
- `/inbox` (Pending tab) → click running item → transitions to Live tab view in-place → complete → Pending tab for approval
- `/inbox` top banner → score → "Run top fixes →" CTA inline
- `/scans` → "Competitors" tab → competitor row click → `/scans/competitors/[domain]` sub-route

**Frequency expectations (Sarah / Yossi):**
- `/inbox`: daily 45s (Sarah: banner glance + 1 approve) / multiple daily 10-15min
- `/scans`: rare / daily 5min
- `/crew`: 1-2×/month / weekly 5min
- `/schedules`: never / weekly 5min
- `/reports`: never / weekly 10min
- `/settings`: 2×/year / monthly 5min

---

### If Adam picks "Hybrid" (recommended synthesis)

Recommended split: KILL `/home` + KEEP `/workspace` + KEEP `/competitors`.

**7 sidebar pages:**
1. `/inbox` — default landing; tabs: Pending / Live / Done; score banner prominent at top
2. `/workspace` — full-screen agent execution (reached from clicking running item in /inbox Live tab, or from "Run top fixes" CTA)
3. `/scans` — scan history and per-scan drill-down
4. `/competitors` — competitor intelligence (plan-gated: Build/Scale only)
5. `/crew` — 11-agent roster (NEW)
6. `/schedules` — schedule configuration (RENAMED)
7. `/reports` — client exports (NEW, Scale-only)
8. `/settings` — sub-routed

**Total for Hybrid:** 8 sidebar slots (including /settings) vs 9 for Conservative and 6 for Radical.

**Sidebar nav order (top to bottom):**
Inbox → Workspace → Scans → Competitors → Crew → Schedules → Reports (gated) → Settings

**Legacy redirects needed:** `/home → /inbox`, `/archive → /inbox?tab=done`

---

## PER-PAGE SPEC

---

## `/scan` (public, pre-signup)

**Purpose:** Convert anonymous visitors into paying users by showing them their AI visibility score before requiring signup or payment.

**Who uses it:** Both — Sarah and Yossi arrive here the same way, read different things, and convert via the same CTA.
**Frequency:**
- Sarah: once-ever (acquisition only, never revisits post-signup)
- Yossi: once during evaluation (tests one client domain as proof)
**Time per visit:**
- Sarah: 3-4 minutes (watches animation, reads score, reads recommendations, decides)
- Yossi: 90 seconds (skips to per-engine data, confirms multi-domain is possible, converts)

**Jobs supported:**
- "Am I visible in AI search?" — anonymous visitor self-assessment
- "What is Beamix?" — product comprehension without signup friction
- "Is this worth $79?" — conversion justification via seeing real results first
- "Can I manage multiple domains?" (Yossi-specific) — agency use case confirmation

**What it CONTAINS:**
- Section 1: Domain input — single centered input with Rough.js drawn border; the only thing visible above the fold on page load
- Section 2: First Scan Reveal animation — 15-17s, 10 sequential frames (full storyboard from Vision doc PART 1); the product's acquisition moment
- Section 3: Score display — ScoreDisplay component with one-sentence diagnosis ("You're mentioned in 3 of 9 AI engines — your FAQ schema is missing")
- Section 4: Top 3 recommendations — RecommendationCard components; Sarah reads the surface label, Yossi expands for detail
- Section 5: EnginePill row — per-engine scores visible without login; Gemini pill clickable for Yossi
- Section 6: Sticky bottom CTA bar — "Save these results and let Beamix fix them → $79/mo, 14-day money-back"; secondary "Email me a copy" option

**What it DOES NOT contain:**
- Login gate before results (the category wedge — every competitor requires signup; Beamix does not)
- More than 3 recommendations above the fold (full list is behind "See all recommendations →" — Yossi territory)
- Multi-domain UI — this is Sarah's page; Yossi evaluates on one domain and learns about multi-domain via the pricing page or onboarding

**Connections:**
- IN: Any channel — direct URL, referral link, email campaign, Framer marketing site CTA
- OUT: Primary → `/onboarding?scan_id=UUID` on CTA click; Secondary → email link to `/scan/[scanId]` result page; No-action → result expires in 30 days, email re-engagement flow triggers at day 7

**Empty state:** Input is the empty state — the page renders with just the domain input until user submits.
**Loading state:** The First Scan Reveal animation IS the loading state — it plays for 15-17 seconds while the real scan runs in the background.
**Error state:** "Couldn't scan that domain — check the URL and try again" with the input re-focused; no hand-drawn accents here, plain and direct.

**Plan-gating:**
- All plans: Full access (this is a public, pre-auth page)
- Note: `/scan/[scanId]` (emailed result link) is a second public route that deserves explicit acknowledgment in the IA. See Open Question 5.

**Key microcopy (EN + HE):**
- EN: "See how AI search sees your business — no signup required"
- HE: "בדוק איך מנועי ה-AI רואים את העסק שלך — ללא הרשמה"
- EN: "Save these results and let Beamix fix them →"
- HE: "שמור את התוצאות ותן ל-Beamix לתקן →"
- EN: "Email me a copy"
- HE: "שלח לי עותק במייל"

---

## `/onboarding` (first-run flow — NOT in sidebar)

**Purpose:** Convert a paid subscriber into an active product user by linking their public scan, capturing business context, setting language preference, and routing them to their first agent run in under 90 seconds.

**Who uses it:** Both — Sarah and Yossi complete this once, then never return.
**Frequency:**
- Sarah: once per account lifetime
- Yossi: once per account lifetime (per his personal account; per-domain context is set inside the product)
**Time per visit:**
- Sarah: 3-5 minutes (reads each step, deliberate)
- Yossi: 60-90 seconds (fastest path through all 4 steps, skips the recommended agent)

**Jobs supported:**
- Link public scan result to new account (zero re-work for user)
- Capture business name, industry, location (seeds all subsequent agent content)
- Set language/locale preference as the first act of the product (Hebrew feels native from minute one)
- Select first agent to run (gets user to value in the same session)

**What it CONTAINS:**
- Step 1: Business profile — name, industry, location; Notion-style morphing preview of dashboard sketches itself in Rough.js as user types
- Step 2: Language preference — EN / HE toggle; selecting HE immediately previews RTL layout and Rubik/Heebo fonts; moment of delight for Israeli users
- Step 3: First agent selection — "We recommend Content Optimizer for your homepage" (Sarah path); full 11-agent grid visible for Yossi
- Step 4: Credit confirmation — "You have 20 credits. Your first fix is ready." with "Let's go →" CTA

**What it DOES NOT contain:**
- More than 4 steps (friction death at step 5+)
- Any configuration of schedules, competitor domains, or settings (those are product surfaces, not onboarding)
- A "skip" that routes to a blank dashboard (empty state at dashboard start is a retention risk)

**Connections:**
- IN: Paddle checkout success webhook → redirect to `/onboarding?scan_id=UUID` (if public scan was completed) or `/onboarding` (if direct signup)
- OUT: Step 4 CTA → `/inbox` (Hybrid/Radical path) or `/home` (Conservative path) with first agent pre-queued

**Empty state:** N/A — this is a flow, not a data surface.
**Loading state:** Between steps: path-draw arrow connecting step indicators animates; "Getting your workspace ready..." in Excalifont during the backend user-creation step.
**Error state:** "Something went wrong during setup — your account is ready but we'll set up your first scan together. Continue →" — never block entry to the product.

**Plan-gating:**
- All plans: Same flow; only the agent roster in Step 3 varies by plan (Discover shows 3 agents; Build/Scale shows all 11)

**Key microcopy (EN + HE):**
- EN: "Let's set up your Beamix workspace"
- HE: "בואו נגדיר את סביבת העבודה שלך ב-Beamix"
- EN: "We recommend starting with Content Optimizer"
- HE: "אנחנו ממליצים להתחיל עם אופטימיזציית תוכן"
- EN: "Let's go →"
- HE: "בואו נתחיל →"

---

## `/home` (Conservative path only — spec becomes irrelevant if Adam kills it)

**NOTE: This spec is ONLY relevant if Adam picks the Conservative path (KEEP /home). In the Radical or Hybrid paths, /home redirects 301 to /inbox and this spec is abandoned. The score banner, recommendation cards, and agent status row all migrate to the top of /inbox.**

**Purpose:** Give Sarah a 30-second morning briefing — score, top 3 fixes, one button to click — so her daily habit forms around a single number, not a complex review queue.

**Who uses it:** Sarah-primary; Yossi as per-client landing when switching domains.
**Frequency:**
- Sarah: daily, 30 seconds
- Yossi: many times per day (landing surface after each domain switch), 30 seconds
**Time per visit:**
- Sarah: 30 seconds (look at score, click "Run top fixes" or close tab)
- Yossi: 30 seconds (scan score delta, decide whether to drill down)

**Jobs supported:**
- "What is my current AI visibility score?" — the daily check-in
- "What should I do right now?" — surfacing the top 3 highest-impact recommendations
- "Did anything change since last time?" — score delta from most recent scan
- "Is anything running?" — agent queue status for Yossi's awareness

**What it CONTAINS:**
- Section 1: ScoreDisplay — large count-up animation; delta badge "↑ +6 since Monday"; semantic color by score range; clickable for Score Drill-down flow (4 layers inline)
- Section 2: Top 3 RecommendationCards — highest estimated-impact items; "Run →" CTA on each; "Show details" disclosure for Yossi
- Section 3: Agent queue status — compact row: "Content Optimizer running · started 2m ago" or "All agents idle" if nothing running
- Section 4: Last scan timestamp — "Last scan: Tuesday 9:14am · Scan now →" link for Yossi who wants fresh data

**What it DOES NOT contain:**
- Per-engine score breakdown (that is /scans territory, accessible via drill-down click)
- Full agent output previews (that is /inbox territory)
- Marketing copy, upgrade banners, or plan upsell prompts (reserved for /settings/billing)

**Connections:**
- IN: Default landing post-onboarding (Conservative path); email digest "Your score changed" → /home; toast notification from completed scan
- OUT: "Run →" on recommendation card → `/workspace` with agent pre-loaded; score click → Score Drill-down inline (no navigation); "Scan now →" → triggers scan → back to /home with new score on completion

**Empty state (no scan yet):** Hand-drawn URL bar illustration + Excalifont "Run your first scan →" CTA routing to `/scan`; no score, no recommendations shown.
**Loading state:** ScoreDisplay shows skeleton arc (Rough.js outline, not animated) while score loads from API; "Loading your score..." in Excalifont.
**Error state:** Score display shows "--" with "Score unavailable — last successful scan: Tuesday" and a "Re-try →" link.

**Plan-gating:**
- Discover: Full access (this is the primary surface for Discover users)
- Build: Same, with additional recommendation cards from Build-tier agents visible
- Scale: Same, with multi-domain switcher in sidebar header showing which client is active

**Key microcopy (EN + HE):**
- EN: "Your AI Visibility Score"
- HE: "ציון הנראות שלך ב-AI"
- EN: "Run top fixes — [N] credits"
- HE: "הפעל תיקונים — [N] קרדיטים"
- EN: "↑ +6 since Monday"
- HE: "↑ +6 מאז יום שני"

---

## `/inbox` (both paths — spec differs between Conservative and Hybrid/Radical)

**Purpose:** Let Sarah approve or reject agent output in under 60 seconds; let Yossi manage a multi-client review queue with keyboard efficiency.

**Who uses it:** Both — Sarah's second-highest-frequency page; Yossi's highest-frequency page.
**Frequency:**
- Sarah: 3-4×/week; 60-90 seconds per visit
- Yossi: multiple times daily; 10-15 minutes per visit
**Time per visit:**
- Sarah: 60-90 seconds (read 1-2 items, approve, close)
- Yossi: 10-15 minutes (batch review across clients using J/K navigation and A shortcut)

**Jobs supported:**
- "What needs my approval?" — primary job for both personas
- "Is this output good?" — center pane diff view enables informed approval
- "What's currently running?" — Live tab (Hybrid/Radical path) or navigation to /workspace (Conservative path)
- "Show me what was already done" — Done/Completed tab absorbs /archive

**CONSERVATIVE PATH spec:**
- Tabs: Pending (default) / Completed (absorbs /archive)
- No score banner (that lives on /home)
- 3-pane: left (280px) item list → center (flexible) preview + diff → right (sticky) ActionBar
- "Running" items show spinner badge in Pending tab; clicking routes to /workspace

**HYBRID/RADICAL PATH spec:**
- Tabs: Pending (default) / Live (running agent jobs — absorbs /workspace for Radical; links to /workspace for Hybrid) / Done (absorbs /archive)
- Score banner at top: persistent ScoreDisplay with delta badge + "Run top fixes →" CTA (absorbs /home for Radical; replicated banner for Hybrid)
- Same 3-pane layout

**What it CONTAINS:**
- Section 1: Score banner (Hybrid/Radical only) — ScoreDisplay with delta, "Run top fixes →" CTA, "Last scan" timestamp
- Section 2: Tab row — Pending / Live (or link to /workspace) / Done
- Section 3: Item list (left pane, 280px) — agent type icon, first line of content, timestamp, J/K navigation
- Section 4: Preview pane (center, flexible) — diff view for content items; JSON-LD syntax-highlighted in Geist Mono for schema items
- Section 5: ActionBar (right, sticky footer) — Approve (A) / Reject / Request Changes; Cmd+A for "Approve all"
- Section 6: Empty state (Pending tab empty) — Excalifont caption "Nothing to review" + "Run an agent →" CTA

**What it DOES NOT contain:**
- Score drill-down (that is /home or the banner — expanding inline to per-engine; /inbox center pane is not the right surface for 4-layer drill-down)
- Schedule configuration (that is /schedules)
- Raw scan history (that is /scans)

**Connections:**
- IN: Toast notification "Your homepage copy is ready for review"; sidebar nav; email digest link; from /workspace on completion
- OUT: Approve → item fades to Done tab, next item auto-focuses; "Request Changes" → item returns to agent queue; "Run an agent →" CTA (empty state) → Cmd+K palette or /crew roster

**Empty state:** "Nothing to review — you're all caught up" with path-draw agent illustration and "Run an agent →" CTA.
**Loading state:** SkeletonBlock cascade (Rough.js outlines snap in, content stagger-fades in per emilkowal/framer-motion pattern).
**Error state:** "Couldn't load your inbox — " with retry link; item-level error: "This output failed QA — " with re-run option.

**Plan-gating:**
- Discover: Pending tab + Done tab; Live tab shows max 3 concurrent running jobs
- Build: Same + multi-client filtering via domain switcher in header
- Scale: Same + bulk-approve across all domains + client-grouped view

**Key microcopy (EN + HE):**
- EN: "Nothing to review — you're all caught up"
- HE: "אין מה לבדוק — עשית את כולם"
- EN: "Approve" / "Reject" / "Request Changes"
- HE: "אישור" / "דחייה" / "בקשת שינויים"
- EN: "Approve all (Cmd+A)"
- HE: "אשר הכל (Cmd+A)"

---

## `/workspace` (Conservative and Hybrid paths; Radical merges into /inbox "Live" tab)

**NOTE: In the Radical path, this page is eliminated and its functionality becomes the "Live" tab inside /inbox. The spec below is for Conservative and Hybrid paths only.**

**Purpose:** Give the user a dedicated full-screen surface to watch an agent work — building trust through transparency, letting Sarah understand the work without needing to know the technical details, letting Yossi drill into raw data.

**Who uses it:** Both — but in different modes.
**Frequency:**
- Sarah: transient (lands here when she initiates an agent run, leaves when it completes); ~90 second sessions; 1-2×/month when manually triggering
- Yossi: active and purposeful; several daily; 2-5 minutes watching and expanding step details
**Time per visit:**
- Sarah: 90 seconds total (watches first 2 steps, trusts it, opens another tab, returns for toast)
- Yossi: 2-5 minutes (reads every step, expands chevrons for raw output, diagnoses QA gate results)

**Jobs supported:**
- "Is the agent actually doing something?" — trust-building for Sarah; the 6-step step list makes progress visible
- "What is the agent doing at each step?" — narrative transparency; Yossi expands every chevron
- "Let me see the intermediate data" — raw engine queries, QA gate verdict, gap analysis (Yossi-only depth)
- "Is it done? What did it produce?" — terminal "Ready for your approval" state routes to /inbox

**What it CONTAINS:**
- Section 1: AgentStepList panel (right, 360px fixed) — 6-step vertical gerund-verb list; breathing pulse on active step; progressive connecting line; completed steps show muted checkmarks; each step expandable via chevron for Yossi
- Section 2: Main content area (center, flexible) — streaming agent output (character-by-character in step 4); loading state for pre-content steps; full output for review post-completion
- Section 3: Status copy — plain-language rotating messages below active step: "Asking ChatGPT what it knows about your practice..." cycling every 1.5s
- Section 4: Terminal card — "Done in 47s" summary card visible 8 seconds after completion; auto-collapses to 48px rail; primary CTA "Review in Inbox →"
- Section 5: Breadcrumb — "Inbox → Content Optimizer" or "Home → Content Optimizer" (where user came from)

**What it DOES NOT contain:**
- The 3-pane inbox layout (this is a single-focus execution surface, not a review queue)
- Always-on step list wider than 360px (explicitly called out in Vision doc anti-patterns: "Manus's mistake")
- Raw JSON or console output by default (Yossi expands it; it is never shown by default)

**Connections:**
- IN: "Run →" on RecommendationCard from /inbox or /home (Conservative) / /inbox banner (Hybrid); Cmd+K "Run [Agent]"; clicking a "running" item in /inbox Live tab (Hybrid path)
- OUT: "Review in Inbox →" terminal CTA → `/inbox/[itemId]`; breadcrumb → previous page; sidebar nav for escape

**Empty state:** N/A — this page is only accessible when an agent run is in progress or has just completed.
**Loading state:** Step 1 starts immediately as "active" (breathing pulse) before first data returns; "Reading your website..." status copy begins rotation.
**Error state:** Active step shows error icon; step label changes to "Something went wrong on this step"; "Retry from this step →" CTA; toast: "Agent run failed — we're looking into it."

**Plan-gating:**
- Discover: 3-step simplified step list; chevron expand disabled (no raw data access)
- Build: Full 6-step list; chevron expand enabled; per-engine breakdown in step 2 visible
- Scale: Same as Build + multi-agent parallel runs visible in separate panels

**Key microcopy (EN + HE):**
- EN: "Asking ChatGPT what it knows about your practice..."
- HE: "שואל את ChatGPT מה הוא יודע על העסק שלך..."
- EN: "Done in [N]s — ready for your approval"
- HE: "הושלם ב-[N] שניות — מוכן לאישור שלך"
- EN: "Review in Inbox →"
- HE: "בדוק בתיבת הביקורת →"

---

## `/scans` (both paths — spec consistent)

**Purpose:** Let Yossi drill into the data behind every scan; let Sarah confirm the score is trending upward over time.

**Who uses it:** Yossi-primary; Sarah rarely (only if score crashes or out of curiosity).
**Frequency:**
- Sarah: 1-2×/year (investigative; triggered by score drop)
- Yossi: daily; 5 minutes per session (per-client audit review)
**Time per visit:**
- Sarah: 2-3 minutes (looks at score chart, reads top finding, leaves)
- Yossi: 5-15 minutes (exports audit log, drills per-engine, compares to competitors tab)

**Jobs supported:**
- "Is my score trending up over time?" — score history chart for both personas
- "What changed in the latest scan?" — delta view: what improved, what regressed
- "Why did my score change?" — per-engine drill-down (Yossi-level depth)
- "What did each AI engine say about me?" — per-query raw output in Geist Mono (Yossi's 4th layer)
- "How do I compare to my competitors?" — Competitors tab (Hybrid/Radical: tab here; Conservative: separate /competitors page)

**What it CONTAINS:**
- Section 1: Scan history list — DataList with date, score, delta-from-previous, trigger type (manual/scheduled/agent-triggered); J/K keyboard navigation
- Section 2: Per-scan detail view (on row click) — ScoreDisplay (instant fill, no animation since this is historical), per-engine breakdown using EnginePill components, recommendations generated by that scan
- Section 3: Per-engine drill-down (on EnginePill click) — 25 queries run, each with mention/not-mentioned indicator and text excerpt
- Section 4: Per-query raw output (on query row click) — raw model output in Geist Mono; the 4th layer of the Stripe summary→detail→raw pattern
- Section 5: Tab row — "My Site" (default) / "Competitors" (Hybrid/Radical path; Conservative path users go to /competitors in sidebar)
- Section 6: Export CTA — "Export audit log →" button visible for Build/Scale users

**What it DOES NOT contain:**
- Agent execution monitoring (that is /workspace)
- Scheduling configuration (that is /schedules)
- Content approval queue (that is /inbox)

**Connections:**
- IN: Sidebar nav (G then S shortcut); "Last scan: Tuesday →" link from /home (Conservative) or /inbox score banner (Hybrid/Radical); toast "Scan completed" notification
- OUT: Per-scan export → CSV download; "Run Competitor Intelligence →" CTA pre-filled with domain (links to /competitors on Conservative path or opens drawer on Hybrid/Radical); Cmd+K from anywhere

**Empty state:** "No scans yet — run your first scan →" with path-draw arrow pointing to the "Scan now" CTA (or sidebar /scan link).
**Loading state:** SkeletonBlock cascade on scan list load; DataList rows skeleton until data arrives.
**Error state:** "Couldn't load scan data — " with retry; per-scan detail: "This scan didn't complete — re-run it →"

**Plan-gating:**
- Discover: Full scan history visible; per-engine breakdown visible; per-query drill-down NOT available (Discover sees top 5 queries only)
- Build: Full access including per-query raw output; export enabled; Competitors tab enabled
- Scale: Same as Build + bulk export across all client domains

**Key microcopy (EN + HE):**
- EN: "AI Visibility Score over time"
- HE: "ציון נראות ב-AI לאורך זמן"
- EN: "Export audit log →"
- HE: "ייצוא לוג ביקורת →"
- EN: "No scans yet — run your first scan →"
- HE: "אין סריקות עדיין — הפעל סריקה ראשונה →"

---

## `/competitors` (Conservative path as separate page; Hybrid/Radical as tab inside /scans)

**NOTE: In the Hybrid and Radical paths, this content becomes the "Competitors" tab inside /scans. The spec below describes the content, which applies in both cases — only the URL and chrome change.**

**Purpose:** Give Yossi a dedicated competitive intelligence surface; give Sarah one sentence that answers "who's beating me and why."

**Who uses it:** Yossi-primary for deep analysis; Sarah occasionally for curiosity.
**Frequency:**
- Sarah: 1×/month (curiosity; 2-3 minutes)
- Yossi: daily (5 minutes; one of his highest-frequency surfaces)
**Time per visit:**
- Sarah: 2-3 minutes (reads the top competitor's name and score gap, closes)
- Yossi: 5 minutes (checks per-engine gap, adds new competitors, routes to agent run)

**Jobs supported:**
- "Who is outranking me in AI answers?" — primary discovery job for both personas
- "On which engines and for which queries are they beating me?" — per-engine, per-query gap analysis (Yossi-depth)
- "How big is the gap?" — gap score differential, trend over time
- "Run an agent to close this gap" — "Run Competitor Intelligence →" CTA pre-filled with competitor domain

**What it CONTAINS:**
- Section 1: Hero sentence (for Sarah) — "Here's who's beating you in AI search and why." One sentence above the DataList
- Section 2: Competitor DataList — competitor name, their AI Visibility Score, your score, gap (+/-), per-engine summary pill row; tabular numerals throughout
- Section 3: Competitor profile (on row click) — per-engine score, top-ranking queries for that competitor, the gap between their mentions and yours
- Section 4: "Run Competitor Intelligence →" CTA — pre-filled with competitor domain; primary action for Yossi
- Section 5: "Add competitor" action — manual domain entry for competitors not auto-discovered
- Section 6: Gap chips (linking to /workspace step 3 context) — the specific gap sources the agent found

**What it DOES NOT contain:**
- Scan history for my own domain (that is /scans "My Site" tab)
- Content approval queue (that is /inbox)
- Configuration of which competitors to track at scale (that moves to /settings/competitors or /settings/team for Yossi's agency mode)

**Connections:**
- IN: Sidebar nav (G then C shortcut) [Conservative path]; /scans "Competitors" tab click [Hybrid/Radical]; gap chip click in /workspace step 3
- OUT: "Run Competitor Intelligence →" → /workspace with agent pre-loaded; competitor name click → /competitors/[domain] or /scans/competitors/[domain] sub-route

**Empty state:** "No competitors tracked yet — we'll suggest some based on your scan results" + "Add competitor →" CTA.
**Loading state:** SkeletonBlock cascade on DataList rows.
**Error state:** "Couldn't load competitor data — " with retry.

**Plan-gating:**
- Discover: NOT visible (Discover users see a "Competitor intelligence is available on Build and Scale →" upsell in /scans or sidebar)
- Build: Full access; competitor add/remove; per-engine breakdown
- Scale: Same as Build + multi-domain competitor comparison (my 20 clients vs. their competitors)

**Key microcopy (EN + HE):**
- EN: "Here's who's beating you in AI search and why."
- HE: "הנה מי שמנצח אותך בחיפוש AI ולמה."
- EN: "Run Competitor Intelligence →"
- HE: "הפעל ניתוח מתחרים →"
- EN: "Add competitor domain"
- HE: "הוסף דומיין מתחרה"

---

## `/crew` (NEW — both paths)

**Purpose:** Make the 11 Beamix agents visible, named, and trustworthy — the brand promise "your AI team" becomes a navigable roster instead of a dropdown.

**Who uses it:** Sarah for curiosity and trust-building; Yossi for per-agent configuration per client domain.
**Frequency:**
- Sarah: 1-2×/month (exploration; "I heard there are 11 agents, let me see them")
- Yossi: weekly (per-agent config, checking agent stats, customizing prompts for specific clients)
**Time per visit:**
- Sarah: 2-3 minutes (scrolls the roster, reads one agent description, closes)
- Yossi: 5-10 minutes (clicks through agent detail pages, saves custom prompts for client domains)

**Jobs supported:**
- "What agents does Beamix have?" — roster discovery for both personas
- "What does [agent] do?" — one-paragraph plain-language description per agent
- "How has [agent] performed for me?" — per-agent stats: runs completed, average quality score, last run timestamp
- "Customize [agent] for [client]" — Yossi-specific: per-agent prompt customization per domain (Build/Scale)

**What it CONTAINS:**
- Section 1: 11-agent roster — card grid; each card: agent illustration (hand-drawn, per Vision doc — no tinted-square icons), agent name, one-sentence description, usage stats (runs this month, quality score), "Configure →" or "Run →" CTA
- Section 2: Per-agent detail page (`/crew/[agentType]`) — full agent description, example output, per-domain prompt customization form (Build/Scale), run history for this agent, "Run now →" CTA

**What it DOES NOT contain:**
- Schedule configuration (that lives in /schedules — /crew shows who the agents ARE, not when they run)
- Billing or plan information (that is /settings/billing)
- Raw agent logs (that is /workspace step chevron expand and /scans per-query view)

**Connections:**
- IN: Sidebar nav; onboarding step 3 "See all agents" link; empty state in /inbox "Run an agent →" CTA; Cmd+K "Open crew" or "Run [agent name]"
- OUT: "Run →" → /workspace with that agent pre-loaded; "Configure →" → /crew/[agentType] detail + customization; "Add to schedule →" → /schedules new-schedule drawer pre-filled

**Empty state:** N/A — roster is always pre-populated with all 11 agents (they exist even before a user has run them; the card shows "0 runs" not an empty state).
**Loading state:** 11 SkeletonBlock cards cascade in; agent illustrations snap in immediately (Rough.js outlines, content stagger).
**Error state:** "Couldn't load agent stats — the crew is still here →" (roster renders without stats rather than failing entirely).

**Plan-gating:**
- Discover: 3 agents visible and runnable; remaining 8 shown as locked cards with "Available on Build →" tooltip
- Build: All 11 agents visible; per-agent configuration enabled for 1 domain
- Scale: All 11 agents; per-agent config per domain across all tracked domains

**Key microcopy (EN + HE):**
- EN: "Your Crew"
- HE: "הצוות שלך"
- EN: "Meet the agents working for your business"
- HE: "הכר את הסוכנים שעובדים בשביל העסק שלך"
- EN: "[N] runs this month · Quality score: [N]%"
- HE: "[N] הפעלות החודש · ציון איכות: [N]%"
- EN: "Available on Build →"
- HE: "זמין במסלול Build →"

---

## `/schedules` (RENAMED from /automation — both paths)

**Purpose:** Let Yossi configure Beamix to work without him; let the product fulfill the "Beamix does the work for you" promise automatically.

**Who uses it:** Yossi exclusively for setup; Sarah never visits this page.
**Frequency:**
- Sarah: never (she has no reason to configure automation)
- Yossi: weekly (checks that scheduled scans ran; monthly for new-schedule setup)
**Time per visit:**
- Sarah: N/A
- Yossi: 5 minutes (reviews active schedules, creates one new schedule, confirms)

**Jobs supported:**
- "Run this agent every Monday without me remembering to" — primary recurring job for Yossi
- "Scan my clients automatically on a cadence" — recurring scan scheduling
- "Run an agent only when the score drops" — conditional trigger configuration
- "What schedules are currently active?" — oversight of all active automations

**What it CONTAINS:**
- Section 1: Active schedule list — DataList with agent/scan type, frequency, last-run time, next-run time, enabled/disabled toggle, "Edit" and "Delete" actions
- Section 2: "Add schedule →" CTA — opens a form drawer from inline-end; agent selection (searchable 11-agent list), frequency picker (daily/weekly/monthly/custom cron with live plain-language preview), trigger condition (optional: "only run if score drops > N points")
- Section 3: Frequency selector — minimal hand-drawn calendar widget for day selection; Geist Mono cron expression input for custom with live preview ("Every Monday and Thursday at 9am")

**What it DOES NOT contain:**
- Per-agent configuration (that is /crew)
- Review of agent output (that is /inbox)
- Billing information (that is /settings)

**Connections:**
- IN: Sidebar nav; "Add to schedule →" CTA from /crew agent detail page; Cmd+K "New schedule"
- OUT: Schedule list → edit drawer; "View results →" on schedule row → /scans filtered by trigger type "scheduled"

**Empty state:** "No schedules yet — let Beamix run in the background →" with path-draw illustration of a clock and arrow, "Add schedule →" CTA.
**Loading state:** SkeletonBlock cascade on schedule list rows.
**Error state:** "Couldn't load schedules — " with retry; failed schedule row: "Last run failed — " with "Retry →" and "View error →"

**Plan-gating:**
- Discover: Page is visible but schedule creation limited to 1 active schedule; "More schedules available on Build →" upsell
- Build: Up to 10 active schedules; all frequency options available; conditional triggers enabled
- Scale: Unlimited schedules; multi-domain schedule templates; bulk schedule creation

**Key microcopy (EN + HE):**
- EN: "Schedules"
- HE: "לוח זמנים"
- EN: "Add schedule →"
- HE: "הוסף לוח זמנים →"
- EN: "Every Monday at 9am"
- HE: "כל יום שני ב-9 בבוקר"
- EN: "No schedules yet — let Beamix run in the background →"
- HE: "אין לוחות זמנים עדיין — תן ל-Beamix לרוץ ברקע →"

---

## `/settings` (both paths — sub-routed)

**Purpose:** Handle account configuration, billing, language preference, notifications, and domain/team management — visited rarely, but critical when needed.

**Who uses it:** Both — Sarah 2×/year; Yossi monthly.
**Frequency:**
- Sarah: 2×/year (billing email triggered, language change)
- Yossi: monthly (API key check, team seats, billing, domain management)
**Time per visit:**
- Sarah: 5 minutes (finds billing tab, clicks "Manage subscription", done)
- Yossi: 10-15 minutes (team management, domain list, API key rotation, notification config)

**Jobs supported:**
- "Update my business profile" — profile sub-route
- "Manage my subscription" — billing sub-route (Paddle portal handoff)
- "Switch to Hebrew" — language sub-route (the moment of delight for Israeli users)
- "Configure notification frequency" — notifications sub-route
- "Add or remove tracked domains" — domains sub-route (Yossi-critical)
- "Invite team members" — team sub-route (Build/Scale only)

**What it CONTAINS:**
Sub-routes (each has its own URL for deep linking and browser back/forward):
- `/settings/profile` — business name, industry, location, logo upload; loaded from DB on page render (known issue: was broken, now fixed per MEMORY.md)
- `/settings/billing` — current plan badge, next invoice date, "Manage subscription →" Paddle portal handoff; no custom billing UI
- `/settings/language` — EN / HE toggle; selecting HE immediately previews RTL layout and Rubik/Heebo fonts as a live preview before saving; the Israeli delight moment
- `/settings/notifications` — email digest frequency (daily/weekly/monthly/off), agent-complete alerts toggle, score-drop alerts toggle
- `/settings/competitors` — manage tracked competitor domain list (add/remove/bulk import); this moves the "config" aspect of /competitors here
- `/settings/team` — Build/Scale only: workspace members, domain assignment per member, role management
- `/settings/integrations` — marked "coming soon" stub; do not show if nothing is shippable; kill if deferred indefinitely

**What it DOES NOT contain:**
- Agent configuration (that is /crew)
- Schedule management (that is /schedules)
- Billing deep analytics (Paddle portal handles this)

**Connections:**
- IN: Sidebar nav (G then comma shortcut); upgrade CTA from locked features; billing email link → `/settings/billing`; onboarding language step → `/settings/language` on return
- OUT: "Manage subscription →" → Paddle portal (external); Language switch confirmed → full app re-renders in selected locale

**Empty state:** N/A — settings always has data (user account always exists at this point).
**Loading state:** Settings sub-page content renders instantly (static config forms with DB values pre-loaded via server component); no visible loading state needed.
**Error state:** Sub-route form: "Couldn't save your changes — " with retry; billing: "Couldn't connect to billing portal — contact support if this continues"

**Plan-gating:**
- Discover: Profile + Billing + Language + Notifications sub-routes visible; Team and Integrations hidden
- Build: Above + Team sub-route (up to 3 members) + Competitors sub-route
- Scale: All sub-routes; unlimited team members; bulk domain management in team sub-route

**Key microcopy (EN + HE):**
- EN: "Business Profile"
- HE: "פרופיל עסקי"
- EN: "Language" / "English" / "Hebrew"
- HE: "שפה" / "אנגלית" / "עברית"
- EN: "Manage subscription →"
- HE: "ניהול מנוי →"
- EN: "Save changes"
- HE: "שמור שינויים"

---

## `/reports` (NEW — Scale-tier; plan-gated — both paths)

**Purpose:** Give Yossi a branded artifact he can deliver to clients — the thing that justifies the $499/month Scale subscription.

**Who uses it:** Yossi exclusively (Sarah has no use for client-formatted exports).
**Frequency:**
- Sarah: never
- Yossi: weekly (generating reports for client deliverables); monthly for summary reports
**Time per visit:**
- Yossi: 10-15 minutes (generates report, configures white-label header, downloads, attaches to client email)

**Jobs supported:**
- "Generate a client-ready report for [client domain]" — primary job; the artifact that makes Yossi's Scale tier worth $499/month
- "White-label with my agency branding" — logo, agency name on cover page
- "Download historical reports" — audit trail for past client deliverables
- "Schedule automated report generation" — monthly client reports run automatically (links to /schedules)

**What it CONTAINS:**
- Section 1: Report generation form — select domain (from multi-domain switcher context), select date range, select content type (visibility summary / detailed audit / competitor comparison / all)
- Section 2: White-label configuration — agency logo upload, agency name, color accent override for PDF output
- Section 3: Download history — list of past generated reports: date, domain, type, download link; tabular numerals throughout
- Section 4: "Schedule monthly reports →" CTA — opens /schedules drawer pre-filled with "monthly report" template

**What it DOES NOT contain:**
- The underlying scan data (that is /scans — reports are formatted views of scan data, not a data surface)
- Agent execution (that is /workspace)
- Billing for report credits (that is /settings/billing — reports consume credits from the plan allocation)

**Connections:**
- IN: Sidebar nav (Scale/Build only); "Export audit log →" CTA from /scans (links here for Build/Scale users); Cmd+K "Generate report"
- OUT: "Download report →" → PDF/CSV file download; "Schedule monthly reports →" → /schedules drawer

**Empty state:** "No reports generated yet — create your first client report →" with a path-draw illustration of a document with an agency logo.
**Loading state:** Report generation: progress indicator with plain-language steps ("Pulling scan data... Formatting competitor section... Rendering PDF...") — mini step list, not a spinner.
**Error state:** "Couldn't generate this report — " with retry; individual report download: "File unavailable — regenerate →"

**Plan-gating:**
- Discover: Page NOT visible in sidebar; linked from locked-feature upsell
- Build: Visible; reports for 1 domain; no white-label (agency branding not available); download history kept for 90 days
- Scale: Full access; white-label; reports for all tracked domains; unlimited download history; scheduled generation

**Key microcopy (EN + HE):**
- EN: "Reports"
- HE: "דוחות"
- EN: "Generate client report →"
- HE: "צור דוח לקוח →"
- EN: "White-label with your agency branding"
- HE: "הוסף את מיתוג הסוכנות שלך"
- EN: "No reports yet — create your first →"
- HE: "אין דוחות עדיין — צור את הראשון →"

---

## THE NAVIGATION TAXONOMY

### Sidebar order (top to bottom)

**Conservative path (9 items):**
```
[domain switcher — top of sidebar header]
────────────────
Home
Inbox
Workspace
Scans
Competitors
Crew
Schedules
Reports  [gated: Build/Scale only]
────────────────
Settings  [bottom, always]
```

**Hybrid path (8 items — recommended):**
```
[domain switcher — top of sidebar header]
────────────────
Inbox             ← default landing; score banner at top
Workspace
Scans
Competitors       [gated: Build/Scale only]
Crew
Schedules
Reports           [gated: Scale only]
────────────────
Settings          [bottom, always]
```

**Radical path (6 items):**
```
[domain switcher — top of sidebar header]
────────────────
Inbox             ← default landing; score banner; Live tab; Done tab
Scans             ← Competitors tab inside
Crew
Schedules
Reports           [gated: Scale only]
────────────────
Settings          [bottom, always]
```

### Chrome elements (top bar)

- Multi-domain switcher — top of sidebar header (Vercel/Linear pattern); invisible dropdown until user has 2+ domains
- Notifications bell — top-right of app chrome; bell-icon dropdown for system alerts (billing, score drop, agent failure); NOT the review queue (the review queue is /inbox)
- Cmd+K palette — available from everywhere; covers: run agent, find scan, go to page, approve top N, search competitors, switch domain
- ? cheatsheet — overlay triggered by `?` key; shows all single-letter shortcuts and Cmd+K commands; dismisses on Escape or second `?`

### Mobile adaptation (< 768px)

**Bottom tab bar (max 5 visible):**
- Hybrid: Inbox / Scans / Crew / Schedules / More (ellipsis → Reports, Settings)
- Conservative: Home / Inbox / Scans / More (ellipsis → Workspace, Competitors, Crew, Schedules, Reports, Settings)
- Radical: Inbox / Scans / Crew / Schedules / More

**Mobile-specific patterns:**
- Workspace step panel (360px right panel on desktop) → bottom drawer with peek state showing current active step name
- 3-pane Inbox → single-column with swipe-stack pattern (Superhuman mobile model)
- RTL: bottom tabs reverse order; rightmost tab is the primary destination
- Domain switcher: collapses to compact pill in top bar on mobile

### Keyboard navigation rules

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Universal command palette |
| `?` | Cheatsheet overlay |
| `J` / `K` | Navigate item lists (inbox, scan history, competitor list) |
| `A` | Approve selected inbox item |
| `Cmd+A` | Approve all pending inbox items |
| `R` | Run agent on hovered recommendation card |
| `S` | Skip First Scan animation (on /scan only) |
| `G then I` | Go to Inbox |
| `G then S` | Go to Scans |
| `G then C` | Go to Competitors (Conservative/Hybrid) |
| `G then ,` | Go to Settings |
| `Escape` | Dismiss cheatsheet; close drawers; cancel command palette |

### Cmd+K palette routes covered

- "Run [agent name]" → /workspace with agent pre-loaded
- "Go to [page name]" → navigate to any sidebar page
- "Find scan [date/domain]" → /scans filtered
- "Approve top [N] items" → bulk-approve in /inbox
- "Switch to [domain name]" → domain switcher context change
- "Add schedule" → /schedules drawer pre-filled
- "Generate report" → /reports generation form
- "Open crew" → /crew roster

---

## OPEN QUESTIONS FOR ADAM

Prioritized by decision dependency — earlier questions unblock later work.

**1. Which path: Conservative (9 pages), Radical (6 pages), or Hybrid (7-8 pages)?**
This is the master question — it determines which of the 3 splits above are resolved and whether /home, /workspace, and /competitors survive as pages. Recommendation is Hybrid (kill /home, keep /workspace, keep /competitors). But your instinct on whether Sarah needs a dedicated /home surface overrides the IA argument.

**2. Multi-domain pricing model — per-domain or multi-domain Scale tier?**
Agent A raised this first. It is the single most important commercial question: is Scale tier ($499/mo) sold as "one account, up to 20 domains" OR as "$499 per domain × however many Yossi has"? At $499 × 20 = $9,980/month, Yossi doesn't buy. At $499 for up to N domains, Yossi is the best customer on the platform. This pricing decision determines whether Yossi exists as a real persona or a theoretical one — and therefore determines how much of /reports, /crew configuration, and the multi-domain switcher earns its design and development budget. Source: A, *"This pricing decision drives the entire Yossi journey."* Source: B, *"Workspace switcher for agency mode — is this MVP-1 or MVP-2?"*

**3. Notification naming clash — resolve before sidebar ships.**
Beamix's /inbox is the review queue. "Inbox" elsewhere (Linear, Gmail, Notion) usually means notifications. Pick one of two resolutions before the first nav component is built: (A) Rename /inbox to /review or /triage; use /inbox or a bell dropdown for system notifications. (B) Keep /inbox for review queue; use bell-icon dropdown only for system notifications; never use the word "inbox" for the notification system. Recommendation: Option B — keep /inbox (warmer name, matches Hebrew "לבדיקה שלך"), add bell dropdown for system alerts. Source: A + B.

**4. Does `/scan` stay in this Next.js repo or move to Framer?**
CLAUDE.md is explicit: marketing lives in Framer, product lives in Next.js. `/scan` is currently in this repo. The question is whether the public scan page is a marketing surface (lives at `beamix.tech/scan` in Framer) or a product surface (lives at `app.beamix.tech/scan` in Next.js). Arguments for Framer: it is an acquisition page, visited by anonymous users who are not yet customers; it should be updatable by marketing without a code deploy. Arguments for Next.js: the scan engine runs server-side; the real-time animation and score reveal require the same backend the product uses; `/onboarding?scan_id=` links are tightly coupled. Recommendation: keep in Next.js for now, but treat it as a standalone public route with no authenticated chrome — `beamix.tech/scan` can be a Framer redirect to `app.beamix.tech/scan`. Source: A, *"/scan is an acquisition surface. Should it move to Framer?"*

**5. Does `/scan/[scanId]` (the emailed result link) get treated as a real page?**
The Vision doc mentions "Email me a copy" as a secondary CTA on /scan. That email contains a link to a public, non-authenticated page that shows the same scan result for 30 days. That page is implicitly a second public route — an 11th page in the IA — with its own UX requirements: no signup required, score visible, "Save these →" CTA, expiry warning if near 30 days. Both Agent A and Agent B flag this. Either acknowledge it explicitly as `/scan/[scanId]` in the final page list, or kill the "Email me a copy" feature. Source: B, *"The email-copy feature is silently the 11th page. It deserves explicit treatment."*

**6. Sarah-or-Yossi primary tilt — what is the expected customer split at launch?**
The evidence suggests Sarah is the majority: Discover ($79) is the volume tier, Build ($189) is the growth tier, Scale ($499) is the retention tier. If 80%+ of customers are Sarah-shaped, then /reports + agency features + multi-domain switcher are correct to gate at Build/Scale and to ship simpler in MVP-1. If the expected launch mix is 40% Sarah / 40% Yossi / 20% other, then /reports and the agency features deserve higher priority and earlier shipping. This affects the rollout order of /reports and the multi-domain switcher scope. Source: A (journey frequency tables) + B (plan-gating recommendations).

**7. Crew + Schedules: split or merged?**
Both agents recommend keeping them separate: /crew = who the agents are + per-agent configuration; /schedules = when they run + trigger conditions. The alternative is merging them into a single "/crew" or "/agents" page where you can see agent stats AND set schedules for each agent on the same surface. The split is cleaner structurally (distinct jobs, distinct frequencies), but the merge makes Yossi's "set up this agent to run every Monday" workflow one-stop rather than two-stop. Recommendation: keep split — the merge risks a cluttered page that tries to be both a roster and a scheduling tool. Source: B, *"Crew = roster page, Schedules = configure when crew runs. Split has more room for the 11-named-agents personality."*

---

## NEXT STEPS

1. Adam answers the 3 splits (Q1 above) and the 7 open questions — this locks the final page list.
2. Per-page deep dive begins: each page's spec sections above become the brief for the frontend-developer implementing that page.
3. After all pages are locked: move to colors + palettes + spacing + fonts + component library spec (Adam's stated order from DECISIONS-CAPTURED.md).
4. Implementation order (once locked): /scan (acquisition wedge, brand-critical first impression) → /inbox (Sarah's highest-frequency surface) → /workspace (the differentiation moment) → /crew (brand identity surface) → /schedules → /scans → /competitors → /reports.
5. /settings and /onboarding are parallel implementation tracks — not blocking, but required before launch.

---

*Sources: docs/08-agents_work/2026-04-25-PAGE-ARCH-A-customer-journey.md · docs/08-agents_work/2026-04-25-PAGE-ARCH-B-ia-audit.md · docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md · docs/08-agents_work/2026-04-25-BEAMIX-VISION.md · linear.app/docs · docs.stripe.com/dashboard/basics · tryprofound.com · otterly.ai/features · peec.ai/sidebar-navigation · mercury.com · granola.ai · superhuman.com*

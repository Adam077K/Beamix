# Audit 2 — Build Feasibility Audit

**Date:** 2026-04-27
**Author:** Build Feasibility Auditor (senior staff engineer lens)
**Scope:** All 9 Frame 5 v2 specs + Architect L0–L8 stack
**Posture:** What is NOT actually buildable as spec'd. Where data shapes contradict. Where the design assumes infrastructure nobody has spec'd. Where the bundle budget gets blown.
**Status:** v1 — input to Build Lead Tier 0 planning.

---

## Executive read

The 9 specs are unusually coherent at the design layer. The motion vocabulary is locked, the typography is locked, the four sigils travel cleanly, and the page-job framing is sharp. **The problem is below the design layer.** Every page spec assumes infrastructure that the Architect document treats as "Year 1" or later: a real-time event bus, a durable agent runtime, a versioned site-integration layer with rollback, a vector-indexed House Memory store, a provenance envelope schema that is canonical across surfaces. The page specs reference these as if they exist; they do not.

The result is roughly 35–40% of acceptance criteria across the PRD that I cannot greenlight as buildable in MVP without a Tier 0 backend sprint that the PRD doesn't budget. The feasibility risk is not "this design is too ambitious for one quarter" — it's "the design is buildable, but only if the Build Lead spends ~3 weeks on plumbing before any worker writes a React component."

This document covers six areas. Severity is BLOCKER (must resolve before MVP build), SHOULD-FIX (will hurt MVP if ignored, but can ship around), NICE-TO-HAVE (post-MVP).

---

## 1. Unbuildable-as-spec'd items

### 1.1 The /workspace walking-figure animation — BLOCKER

**Spec says** (INBOX-WORKSPACE §B3): a small (~80×80px) hand-drawn character with a Rough.js-rendered body, no facial features, a toolbelt, **5 tool sprites** (magnifying glass, book, wrench, letter, lightbulb), **3 gesture types** (reading, writing, thinking), 8–12 fps gait animation, walking down the courier line, position updated every 100ms, `position: fixed` while scrolling, with reduced-motion fallback. Sprite sheets are pre-rendered Rough.js. Performance budget: <60kb gzipped JS + <80kb sprite assets.

**What's actually required to ship that:**

1. Rough.js renders to canvas/SVG at runtime — you cannot trivially "pre-render to PNG sprites" because Rough.js's stochastic output depends on its runtime; what you can do is run Rough.js once at build-time in a Node + JSDOM context, snapshot to SVG, and ship those SVG strings. That works, but the SDK does not currently do this — someone has to build the build-time sprite generator.
2. 4 frames per gesture × 3 gestures × 5 tool variants × ~11 agent colors = up to 660 unique sprite combinations. Even at SVG-as-string compression that is well over 80kb.
3. The 100ms position-update loop on `position: fixed` with vertical interpolation while the user scrolls is a guaranteed jank source on mid-tier Android. You will need `requestAnimationFrame` + `transform: translate3d` (not `top`) or it will not hit 60fps.
4. The "follow the figure" auto-scroll (`f` key) is buildable but introduces a non-trivial scroll-listener interaction with React's scroll restoration on route change.
5. The figure is supposed to be coupled to the agent's *real* runtime progress. That means the Agent Runtime must emit step-completion events that the frontend subscribes to. The Architect spec'd this as L5 + a real-time bus; PRD does not commit to which (Inngest? Supabase Realtime? raw WS?).

**What's missing:** the build-time sprite generator, the agent step-progress event channel, and a runtime decision on canvas-vs-SVG.

**Recommendation:** SHOULD-FIX. Ship MVP with a *static* agent figure at the active step (no walking gait, no gesture animation). Tool sprite swaps via 200ms cross-fade. Use a single SVG per agent color × 5 tools = 55 SVGs (~25kb total). Defer the walking gait to MVP-1.5. The page is *still* the page Adam wants — the courier line + step circles + microcopy rotation does most of the cinematic work. Re-introduce the gait once the runtime event channel is solid.

### 1.2 Activity Ring "agents working" pulse — BLOCKER

**Spec says** (DESIGN-SYSTEM §2.1; HOME §2.2.1): the Ring's gap terminus pulses (`motion/ring-pulse`) **continuously while any agent is acting**, infinite loop, idle when no agent is acting. The Topbar status dot pulses at 1600ms whenever the system is acting. /home Section 6 (Crew at Work) shows 18 monogram circles, each with its own pulsing ring when that specific agent is active.

**What's actually required to ship that:** a real-time work-cycle signal from backend → frontend. Three options:

- WebSocket subscription per customer (`/api/scans/active?user_id=X`) — what /home spec actually mentions
- Server-Sent Events (SSE)
- Supabase Realtime channel per `(account_id, agent_id)` — what /crew spec mentions

**What's missing:** the canonical decision on which transport. /home spec says "WebSocket subscription, falls back to polling at 10s." /crew spec says "Supabase Realtime channels, throttle UI updates to 4Hz." These are different transports. They will not share an implementation if the spec stays this way.

**Recommendation:** BLOCKER. Pick one — Supabase Realtime is the path of least resistance because it's already in the stack and doesn't need a separate WS server. Document in DECISIONS.md. All "agent is acting" UI signals (Ring pulse, Topbar pulse, Crew at Work pulses, /scans table "Acting" status pill, /workspace walking figure) subscribe to the same channel schema: `agent_run_state` with fields `(run_id, agent_id, customer_id, status: 'queued|running|completed|failed', started_at, current_step, total_steps)`.

### 1.3 Path-draw race on /competitors Rivalry Strip — SHOULD-FIX

**Spec says** (SCANS-COMPETITORS §B3.4): two perfect-freehand sparklines drawn at runtime, your line first, theirs at 80ms stagger, 1200ms first-load with `cubic-bezier(0.4,0,0.2,1)`, gap polygon fills between them at 12% opacity recoloring per-segment if lines cross.

**Issues:**

1. `perfect-freehand` produces a stroke as a list of points; turning that into an SVG `<path>` with stable `pathLength` for `clip-path: inset()` reveal is straightforward. **But:** the gap polygon between two perfect-freehand lines is *not* a standard SVG `<polygon>` — both edges are jittered curves, not straight segments. To compute the polygon, you need to take the two stroke point-lists, interleave them, and build a `<path>` that follows top-edge then bottom-edge-reversed. That is custom geometry code; nobody has written it.
2. "Recolor per segment if lines cross within the window" requires detecting crossover points and splitting the polygon into sub-polygons of different fills. That is more custom geometry.
3. SSR vs CSR: perfect-freehand is a client library. The /competitors page must render the table on the server, which means the sparkline points either render server-side (using perfect-freehand in a Node context, which works) or hydrate client-side with a brief flash. The spec doesn't say which.

**Recommendation:** SHOULD-FIX. Ship MVP with two perfect-freehand lines drawn in sequence, **no gap polygon fill**. Use a single semantic-color fill on the area beneath your line only (your line wins → green at 12%, your line loses → red at 12%, no per-segment crossover logic). Add the dual-color crossover polygon in MVP-1.5 once someone has time to write the geometry helper. The visual loss is minor; the engineering save is ~3 days.

### 1.4 Onboarding Step 3 Brief approval ceremony — SHOULD-FIX

**Spec says** (ONBOARDING §2.3): cream-paper transition (800ms layered cross-fade), chip mechanic with 6 chip types each with their own picker UI, Seal-draw 800ms via `stroke-dasharray` on a per-user Rough.js path generated from `seed = hash(user_id)`, signature-stroke 600ms via `opentype.js` extracting SVG outlines from Fraunces font file at build-time. Total ceremony 2.5s.

**Issues:**

1. **The Seal as per-user Rough.js path is feasible but expensive.** Generating a Rough.js path server-side once at signup, persisting as raw SVG in `users.seal_svg`, then animating `stroke-dashoffset` on it client-side — that works. But the path needs `getTotalLength()` to drive the dasharray, which requires the path to be in the DOM. This is a one-time cost per user; fine.
2. **opentype.js for the signature stroke is the riskier piece.** The spec says "pre-extracted SVG outline of the text 'your crew' rendered in Fraunces italic 300 at 22px (or 18px on mobile). Outline extracted at build time using opentype.js from the licensed Fraunces font file; persisted as a static SVG in `public/onboarding/signature-stroke.svg`." This is a build-time step nobody has written. opentype.js is ~150kb gzipped which we do *not* want to ship to clients; doing it at build time means a Node script in the build pipeline that produces a static SVG. **That script does not exist.** Someone has to write it, validate the Fraunces license permits font-outline extraction (most OFL licenses do, but verify), and integrate it into the Vercel build.
3. **Mobile chip-edit performance.** On mobile, clicking a chip opens a bottom sheet for dropdowns. The spec says inline expansion otherwise. With 6 chip types and the Brief block scrolling to keep the active chip in upper-third of viewport (auto-scroll, 200ms), the iOS/Android keyboard interaction is a known minefield (the keyboard pushes the viewport up, which can fight your auto-scroll). This needs explicit testing on iOS Safari + Chrome Android.
4. **The Brief composition is an Inngest job triggered on Step 1 submit, with 60s timeout on Step 3 mount.** This is buildable but requires Claude Sonnet API integration, prompt template versioning, deterministic post-generation chip-slot extraction (template-fitting), and a fallback-to-template Brief if the deeper scan fails. PRD does not specify the chip-slot extraction algorithm. Without it, the chip mechanic doesn't work.

**Recommendation:** Two SHOULD-FIX items:
- **Build-time signature-stroke generator.** Tier 0 task (~1 day). Document Fraunces licensing decision in DECISIONS.md.
- **Chip-slot extraction algorithm.** This is a product spec gap, not just engineering. Product Lead + AI Engineer needs to define: given a Claude-generated Brief paragraph, how do we deterministically map prose to `{template_id, slot_values}`? Either (a) Claude generates the structured object directly with a strict schema, or (b) post-generation regex/NLP extraction. (a) is the right answer.

### 1.5 React Flow for Workflow Builder — SHOULD-FIX

**Spec says** (CREW §4.3): React Flow as the canvas primitive. Battle-tested, MIT-licensed.

**Issues:**

1. React Flow's bundle is ~80kb gzipped + dependencies. That is acceptable on the `/crew/workflows/[id]` route specifically because no Sarah-archetype customer ever loads it, but it MUST be code-split. Next.js App Router with dynamic import works.
2. The spec's validation rules (Tarjan's cycle detection, per-agent + per-resource conflict locks, per-tier node limits) are non-trivial. Tarjan is a 30-line algorithm but the *resource lock detection* requires a static analysis of agent manifests — what resources does each agent mutate? That is metadata that does not exist in the system today.
3. The "test this step" feature in the right inspector requires a sandbox that can run a single agent step with mock upstream data. That is a non-trivial backend addition.

**Recommendation:** SHOULD-FIX. Workflow Builder is correctly phased to MVP-1.5 in the PRD ("Workflow Builder (DAG-style): Year 1") despite the /crew spec describing it in full detail. **Build Lead must enforce this phasing.** The /crew spec writes a Year-1 feature as if it ships at MVP. Don't.

### 1.6 Firecracker microVM sandbox for marketplace agents — BLOCKER (for opening to third parties)

**Spec says** (MARKETPLACE §2.4): every third-party agent runs inside a per-tenant Firecracker microVM (or "Cloudflare Workers + Durable Objects for cheap agents, Fly Machines for heavy"). Hard isolation between tenants. No filesystem access, no arbitrary network egress, capped per-run egress at 50 MB, 1 GB RAM, 2 vCPU, 60s wall clock.

**Issues:**

1. Firecracker microVMs are operationally heavy — they are AWS's Lambda/Fargate substrate but running them yourself requires a Firecracker host fleet, a control plane (firecracker-containerd or Kata), image orchestration, and cold-start mitigation. This is a 4–6 week infrastructure project for a senior platform engineer who has done it before.
2. Cloudflare Workers is the right answer at MVP-1.5 (V8 isolates already give per-request isolation, no fleet to operate, $5/month base). But Workers are CPU-time-bounded (50ms / 30s on paid), no full Node API, no arbitrary network without `fetch` proxy. The `ctx.fetch` allowlist concept is buildable on Workers; the 60s wall clock is not (you'd need Durable Objects + Workflows).
3. **At MVP, the Marketplace does NOT open to third parties** (per the Marketplace spec §0: "MVP: Beamix-authored only. No third-party agents."). So the sandbox is not MVP-blocking for v1. It IS blocking for MVP-1.5 when the SDK opens.
4. The "smoke-test pass on the sandbox before listing" step in the Beamix review pipeline (§2.8) does not exist as infrastructure.

**Recommendation:** BLOCKER for MVP-1.5, NICE-TO-HAVE for MVP. At MVP, all "marketplace" agents are first-party Beamix code running in the same trusted runtime as the 6 MVP agents. Tag this loudly in Marketplace spec — the spec currently reads as if third-party isolation infrastructure exists at launch. It does not.

### 1.7 Twilio phone number provisioning at signup — SHOULD-FIX

**Spec says** (PRD Feature 12; ONBOARDING §2.2): Twilio number provisioned within 2 minutes of customer enabling Lead Attribution. In Step 2, **3 phone numbers issued live** with staggered fade-ins. Numbers fade in at t=700ms, 1000ms, 1300ms.

**Issues:**

1. **Twilio number provisioning latency is wildly variable**. Local US numbers: usually <2s. International (especially Israel/UK): can take 30s–5min, sometimes requires regulatory bundle approval (Israeli numbers require Hebrew name and address verification). The spec's "fade in by 1300ms" assumption that 3 numbers are provisioned synchronously inside an animation budget is wrong.
2. **Cost per provisioned number** is ~$1/mo standing + per-minute outbound. Issuing 3 numbers at signup × 1000 trial customers × $1/mo × no-show rate ~30% = $300/mo of dead-weight numbers within 60 days. Acceptable but should be modeled.
3. **Regional availability**: Israel Twilio numbers require Twilio's regulatory bundle process (KYC docs, registered address). Cannot be self-served at scale.
4. The provisioning-failure fallback ("we'll keep trying in the background. Continue without — we'll surface them in Settings when ready.") is correct UX but assumes a background job runner with a retry queue. PRD does not specify Inngest as the runner; this needs to be locked.

**Recommendation:** SHOULD-FIX. Three sub-decisions:
- **Provision 1 number at Step 2, not 3.** Build/Scale tiers issue additional numbers asynchronously after onboarding (visible in /settings within 30min). The animation budget supports 1 number cleanly.
- **Lock Israeli regulatory bundle ahead of MVP launch** if Israel is a launch market.
- **Provision lazily for Discover tier** — Discover ($79) does NOT get a phone number until the first scan completes. Cuts dead-weight cost.

### 1.8 PDF generation (Monthly Update) — SHOULD-FIX

**Spec says** (EDITORIAL §3.3): `@react-pdf/renderer` for the PDF, with the same React components reused on the web permalink. Fonts loaded into React-PDF runtime via `Font.register()`. Fraunces uses variable axes (opsz, soft, wonk) — "React-PDF supports variable fonts as of v3."

**Issues:**

1. **React-PDF v3 variable-font support is partial.** The `opsz` axis works; `soft` and `wonk` (Fraunces-specific custom axes) are not guaranteed. You will likely lose the WONK axis in PDF rendering. Verify with a smoke test before committing.
2. **Rough.js elements pre-rendered as SVG strings server-side using Node.js + JSDOM + Rough.js, then embedded into React-PDF as `<Svg>` elements.** This works but the JSDOM dependency is heavy in serverless environments. On Vercel, this means the Inngest job that generates the PDF runs in a Node Lambda, not an Edge Function. Document accordingly.
3. **perfect-freehand sparkline pre-rendered to SVG server-side and embedded.** Same Node-runtime requirement.
4. **6-page PDF rendering at scale**: ~25,000 customers × 1 monthly update × full layout reflow + custom font rendering = ~25,000 × 3-5s of Node CPU = 21-35 hours of compute per month, fanned out via Inngest. Cost: trivial. Latency: trivial. But the *render farm* concept is a thing — a single Vercel function timeout (300s on Pro, 900s on Enterprise) is enough headroom but back-pressure on the Inngest queue is not currently spec'd.

**Recommendation:** SHOULD-FIX. Build Lead spike: 2 days to validate React-PDF + Fraunces variable axes + Rough.js SVG embedding. If WONK axis fails, fall back to fixed-axis Fraunces (lose 5% of editorial polish, save 100% of debugging).

### 1.9 OG share card image rendering — NICE-TO-HAVE → SHOULD-FIX

**Spec says** (EDITORIAL §1.6): Vercel OG (`next/og`) generates the OG share card the moment the scan completes. 1200×630, cream paper, Activity Ring drawn, Fraunces domain name, score, diagnosis line, Beamix wax-seal, Geist Mono URL.

**Issues:**

1. **Vercel OG uses Satori under the hood.** Satori does not support arbitrary SVG `<path>` rendering — it works on a subset of CSS and basic SVG. **Rough.js paths render as Satori-compatible `<path>` strings**, but I'd budget a 1-day spike to verify the wax-seal Rough.js render works in Satori.
2. **Variable fonts in Satori**: limited. You cannot pass `font-variation-settings` to Satori; you'd need to pre-render Fraunces with baked axes into a static font subset.
3. **perfect-freehand sparklines in OG cards**: Satori doesn't run JavaScript, so perfect-freehand cannot generate at OG-render time. You'd pre-compute the SVG points at scan time and pass them as static path data to Satori.

**Recommendation:** SHOULD-FIX. The OG card is the viral acquisition surface — it cannot be skipped. Day-1 spike to nail the Satori-compatible composition. If the wax-seal in Rough.js doesn't render in Satori, fall back to a hand-drawn-static SVG of the seal that's NOT Rough.js-stochastic but still hand-feel.

---

## 2. Data-shape conflicts

These are gaps where two specs reference the same data structure with different shapes, or where the shape is implied but never canonically defined.

### 2.1 The Evidence Card — BLOCKER

**Conflict:** the Evidence Card appears on /home (HOME §2.5), as a primitive in the Design System (§4.6), in the /scans inline expansion (SCANS-COMPETITORS §A2.6), and in the Inbox preview (INBOX-WORKSPACE §A2.6).

| Spec | Field shape |
|---|---|
| Design System §4.6 | `agentType, verb, object, timestamp, hasTrace?` |
| HOME §2.5 | `timestamp, verb, object, +/- delta, "BEAMIX" signature, agent monogram color` |
| SCANS expansion §A2.6 | bullet list — `verb (Inter 500), object (ink-2)`, no timestamp, no delta |
| /workspace step output | streamed text, not card-shaped at all |

**Shape questions unspec'd:**
- Is `agentType` an enum (`'schema_doctor' | ...`) or a UUID FK to an `agents` table?
- Is `delta` always present? On /home it's "+0.4 SCORE"; on /scans expansion it's missing.
- Does `signature` (the "BEAMIX" caps line) always render or only on /home?
- Is `hasTrace` derived from a `last_modified_at` field on the source action, or computed elsewhere? HOME §9.3 says "each entity in API response carries `last_modified_at`."

**Recommendation:** Build Lead defines a canonical `EvidenceCard` data shape in `apps/web/types/evidence.ts` BEFORE any page worker starts. Single source. All pages render variants of this one shape with `display: 'compact' | 'home' | 'scans-row' | 'inbox-row'` discriminator.

### 2.2 Brief schema — BLOCKER

**Conflict:** the Brief is referenced as both prose and structured object across specs.

- ONBOARDING §2.3: structured — `{sentences: [{template_id, slot_values: {...}, free_text: null}]}`
- INBOX §A2 ("references your Brief: '...'"): the Brief is queried by clause-text, implying clauses are addressable strings
- /crew §3.9 ("Clauses in your Brief I answer to"): Brief clauses have IDs (`clause_id: clause_03`) and are linked-to from agents
- EDITORIAL Monthly Update Page 4: agents reference Brief clauses by content
- Architect §223 (provenance envelope): `brief_clauses: [{clause_id: clause_03, text: "..."}]`

**Shape questions unspec'd:**
- Are clauses sentences? Or paragraphs? ONBOARDING says one Brief = 4-6 sentences; /crew §3.9 implies clauses live inside sections (`Section 'Schema integrity' · clause 2`).
- Is the Brief versioned? Architect implies yes (`v3`). ONBOARDING implies yes. CREW says yes ("Brief v3 · ..."). But there's no canonical schema.
- When a customer edits one chip on one sentence, does that bump the Brief version? Add a draft version that becomes v(N+1) on save?
- How does the agent runtime *consume* a Brief clause? Does it get the clause text as a system-prompt fragment? Or is it semantic-searched at runtime?

**Recommendation:** BLOCKER. Build Lead + AI Engineer spec the Brief schema in DECISIONS.md before onboarding work begins:
```
brief: { id, customer_id, version, status: draft|signed, created_at, signed_at,
         sections: [{ id, title, clauses: [{ id, template_id, slot_values, 
                                              free_text, prose_rendered, last_edited_at }] }] }
```
Every agent run cites `brief_clause_ids[]` in its provenance envelope.

### 2.3 House Memory — BLOCKER

**Conflict:** House Memory is referenced as multiple different things.

- HOME §3.7: "The Receipts list (House Memory rendered)" — a chronological list of digests, scans, monthly updates
- /inbox A6: notes attached to highlighted text in items, queryable by source agent
- Architect §286-290: "per-customer per-agent context object that persists across runs: prior decisions, learned constraints, local feature flags, calibrated confidence thresholds. Stored in Postgres with vector indexes."
- Frame 5 v2 (cited in CREW): "House Memory as queryable archive (natural-language search over history) — Year 1.5"

**These are three different things:**
1. **Customer-facing artifact log** (HOME's Receipts list): the chronological feed of artifacts.
2. **Inbox margin notes** (/inbox A6): customer annotations attached to specific items.
3. **Per-agent runtime memory** (Architect §286): vector-indexed prior runs/decisions/constraints fed back as agent context.

The specs blur these. The /home Receipts list is just a `SELECT * FROM artifacts ORDER BY created_at DESC`. The Inbox margin notes are a `notes` table. The agent runtime memory is a pgvector store. They are NOT one system.

**Recommendation:** BLOCKER (semantic, not engineering). Pick three names:
- **Artifact Ledger** — the Receipts list on /home.
- **Margin Notes** — the customer's annotations on Inbox items.
- **Agent Memory** — the per-agent vector store for runtime context.

Stop calling all three "House Memory." It is causing the data-model to be unspec'd.

### 2.4 Truth File — SHOULD-FIX

**Conflict:** Truth File is structured per ONBOARDING §2.4 (hours, services, areas, claims, voice, never-say). But:

- PRD Feature 3 says "vertical-specific schemas: SaaS asks integrations/pricing-model/target-company-size; e-commerce asks shipping/return-policy/product-categories — not 'service area'."
- ONBOARDING §2.4 ships ONE schema with "WHAT DO YOU OFFER?", "WHERE DO YOU SERVE?", "WHAT'S TRUE ABOUT YOU?" — generic for everyone.
- Architect Section 6 Q2 explicitly asks: "is there one universal schema with vertical extensions, or does each vertical need its own template?"

**This is an unresolved product question, not just an engineering gap.**

**Recommendation:** SHOULD-FIX. Product Lead decides. Engineering build either (a) a single base schema with a `vertical_extensions: jsonb` column, or (b) per-vertical schema versions. Lock before onboarding work begins.

### 2.5 Provenance envelope — SHOULD-FIX

**Conflict:** Architect §215-240 specs the canonical envelope (the JSON block with `action_id`, `agent`, `agent_version`, `model`, `inputs.truth_file_refs[]`, `inputs.brief_clauses[]`, `validation`, `output.diff`, `decision`, `rollback`). This is the single best-spec'd schema in the entire stack. **However:** /crew §3.7 renders this envelope in a 6-tab drawer (Summary / Input / Output / Validation / Brief grounding / Rollback). /inbox preview renders only some fields. /scans audit log renders some. 

The envelope schema is fine. The issue is **which fields are MVP-required vs Year-1 nice-to-have**. Specifically: `validation.brand_voice_match: 0.94 (threshold 0.85)` requires the Brand Voice Guard agent to compute fingerprint match scores. PRD says Brand Voice Guard ships as "validation layer at MVP, standalone agent at MVP-1.5." So `validation.brand_voice_match` should be optional in MVP envelopes.

**Recommendation:** SHOULD-FIX. Mark all envelope fields as required/optional at MVP. AI Engineer owns this schema, with Build Lead review.

### 2.6 Lead Attribution — SHOULD-FIX

**Conflict:** the link from "AI engine cites you" → "phone rang" is more complex than the PRD admits.

- PRD Feature 12 says: "Twilio dynamic phone number" + "UTM-tagged URL" with "calls to this number are logged as AI-attributed leads."
- HOME §2.1: "This month: 23 calls + 8 form submissions through Beamix."
- Architect L1: separate layer with "calls, forms, sessions, conversions" data model + integrations to CallRail / WhatConverts / GA4 / GBP.

**Unspec'd:**
- How is a CALL attributed to a SPECIFIC AI ENGINE? Twilio gives you "this number rang at this time." It does not tell you which engine the customer was on when they got the number. The PRD implies this attribution is automatic; it is not. You need a referral map (customer typed query → got number → called).
- Form fills: if a customer fills out a contact form on the customer's website, what makes that a "Beamix-attributed form submission"? The UTM tag tracks click-through, but most direct organic traffic from AI engines does NOT carry a UTM tag (ChatGPT and Perplexity citations are bare links).
- The Monthly Update headline "47 calls and 12 form submissions" assumes per-engine attribution that the data model does not support without significantly more wiring.

**Recommendation:** SHOULD-FIX. Product Lead clarifies what counts as "Beamix-attributed":
- Calls to the dedicated Twilio number = trivially attributed (customer saw the number on the customer's site, which Beamix optimized → call).
- Form submissions = require a hidden form field auto-populated with the entry referrer. Beamix injects a tracking script on the customer's site that captures `document.referrer` at form-submission time. This is a JS snippet that has to be added to the customer's site (per L2 site integration).

Without this clarification, the lead-attribution claim ("4× vs March") is a marketing aspiration, not a buildable feature.

### 2.7 The 4 lenses (Done/Found/Researched/Changed) — SHOULD-FIX

**Conflict:** SCANS-COMPETITORS §A3 specifies which agents contribute to which lens:
- Done: Schema Doctor, Citation Fixer, FAQ Agent, Content Refresher, Brand Voice Guard
- Found: Competitor Watch, Trend Spotter, Visibility Monitor, Mention Tracker
- Researched: Trend Spotter (queries), Competitor Watch (deep dives), Citation Fixer (source verification)
- Changed: Schema Doctor, Content Refresher, FAQ Agent, Brand Voice Guard

**But:** PRD Feature 7 ships only 6 MVP agents (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter). The agents the lenses reference (Trend Spotter, Content Refresher, Visibility Monitor, Mention Tracker) are deferred to MVP-1.5+.

So at MVP:
- **Done lens** has 3 agents (Schema Doctor, Citation Fixer, FAQ Agent).
- **Found lens** has 1 agent (Competitor Watch).
- **Researched lens** has 1 agent (Citation Fixer for source verification only).
- **Changed lens** has 3 agents (same as Done — and the lenses overlap).

**Recommendation:** SHOULD-FIX. Implement the lenses as **action-classification tags** on every action, not as agent-attribution buckets. Each agent action emits `lenses: ['done', 'changed']` (an array — actions can be in multiple lenses). When new agents ship, they add their lens tags. The /scans filter queries by tag, not by agent.

---

## 3. Missing infrastructure dependencies

These are pieces of infrastructure the design assumes exists but no spec commits to building.

### 3.1 Real-time bidirectional channel — BLOCKER (covered in 1.2 above)

Pick Supabase Realtime. Document the channel schema. All "live" UI subscribes.

### 3.2 Email send infrastructure — SHOULD-FIX

**Spec says** (EDITORIAL §2.7): "From: `beamix@notify.beamix.tech`. Reply-to: `hello@beamix.tech`. DKIM/SPF/DMARC: full alignment on `notify.beamix.tech`. Per Resend best practices: domain verified, separate from transactional flow if scale demands."

**Missing:**
- Resend account setup, domain verification, DKIM key generation — operational tasks that have to be done before Day 1 of customer signups (because the Monday Digest must send 7 days after the first customer signs).
- **Send-volume planning**: 25k customers × 1 Monday Digest/week = 25k/week + ~3 transactional/customer/month = 100k/week total. Resend's free tier is 3,000/month. You need a paid plan at the right tier from Day 1.
- **Bounce/complaint handling**: who reads `bounces@`? What auto-unsubscribes a hard-bounced email? PRD does not say.
- **Per-domain warmup pool for white-label Scale tier** (Yossi sends Monthly Updates from `reports.yossiagency.com`) — this is a 4-6 week warmup process per agency subdomain. Not buildable in the same week as launch.

**Recommendation:** SHOULD-FIX. DevOps Lead spikes Resend setup BEFORE first customer signup. Tier 0 task.

### 3.3 Background job runner — BLOCKER

**Spec says** (multiple places): "Inngest job composes the Brief", "Inngest job that generates the PDF", "background scan running during Steps 1-2", "agent runtime executes via Inngest". 

**But:** PRD does not commit to Inngest. The Architect says "the right primitive is Inngest / Temporal / Trigger.dev — every agent execution is a function with named steps, and every step is durably checkpointed."

The legacy Beamix codebase (per `MEMORY.md`) used Inngest. So Inngest IS the assumed default.

**Missing:**
- Inngest is a paid product above modest free tier ($20/mo at minimum for production usage). Contract & quota approved?
- Inngest's serverless model means agent runs are 30s/300s/900s budget. The Architect spec'd p99 60s for agent runs. Verify the Inngest tier supports 60s+ runs.
- Step-level provenance: does Inngest provide the per-step log we need for audit-grade provenance, or do we need to write our own per-step audit table that Inngest writes to?

**Recommendation:** BLOCKER. DevOps Lead validates Inngest contract + quotas. Document the agent runtime architecture decision in DECISIONS.md.

### 3.4 Customer-site integration (the L2 layer) — BLOCKER

**Spec says** (Architect L2): WordPress plugin, Shopify app, Webflow integration, generic JS snippet, Edge Worker proxy, Git-mode (PR to repo). Every change is a Git-style commit with 30-day TTL.

**Missing in PRD entirely.** PRD Feature 7 (Schema Doctor, Citation Fixer, FAQ Agent, etc.) all assume the customer's site is *writable*. PRD does not commit to a single integration mode at launch.

**The blocker question:** how does the FAQ Agent actually push 11 FAQ entries onto `/services/emergency-plumbing` on the customer's WordPress site?

Three options:
1. **Manual paste** (Discover-tier reality): customer copies the proposed FAQ from /inbox into their CMS by hand. No L2 needed but invalidates the "Beamix does the work" claim.
2. **WordPress plugin** (the Architect's recommendation): 1-week build per CMS variant. Plugin needs to be reviewed and listed in WordPress.org plugin directory (3-week review process).
3. **Edge Worker proxy**: customer points DNS to Beamix, who proxies and rewrites HTML. Most powerful, most operationally sensitive. Requires SOC 2 (you are now in the customer's request path).

**Recommendation:** BLOCKER. Product Lead picks the launch mode. My recommendation:
- **MVP launch with manual paste only** (Discover tier accepts this).
- **MVP-1.5 with WordPress plugin + Shopify app** (covers ~70% of SMB sites).
- **MVP-2 with Edge Worker for power users.**
- Mark "Beamix does the work" as aspirational at MVP launch. The honest message is "Beamix proposes the work, drafts the schema/FAQ, and you paste it. WordPress and Shopify customers get one-click in MVP-1.5."

This is the single biggest gap in the PRD.

### 3.5 UTM tag system + form attribution — SHOULD-FIX (covered in 2.6)

The "form fill attribution" half of Lead Attribution requires a customer-site JS snippet. Architect L1 covers this; PRD does not.

### 3.6 Scan engine cost ceiling — SHOULD-FIX

**Spec says** (PRD Feature 15): 11 engines × daily/weekly schedules × growing customer count. Risk 4 in PRD: "infrastructure costs could outpace revenue."

**Missing:**
- **Per-engine cost model**: ChatGPT API ~$10/M tokens (input), ~$30/M (output). Perplexity ~$1/1k queries. Browser-simulation engines (residential proxies) ~$0.10-$0.50/scan. A daily scan of 11 engines × 10 queries × 25k customers = ~80M API calls/month at maybe $0.005/call = $400k/month. **At scale this exceeds revenue.**
- **No spec'd budget ceiling per customer.** Risk 4 mentions it but PRD does not commit to "Discover tier gets 3 engines weekly = ~$5/customer/month in scan costs out of $79 revenue."

**Recommendation:** SHOULD-FIX. Data Lead + DevOps Lead build cost-per-scan instrumentation in MVP. Per-customer monthly scan-cost ceiling enforced at runtime. Discover tier capped at $10/month scan spend.

### 3.7 SOC 2 / E&O insurance — NICE-TO-HAVE → SHOULD-FIX (depending on Edge Worker)

If the Edge Worker site-integration mode ships at MVP-2, SOC 2 Type II becomes blocking before any enterprise customer signs. 9-12 month process. Plan now.

### 3.8 Brand Voice Fingerprint — SHOULD-FIX

PRD: Brand Voice Guard ships as "validation layer at MVP" and has a `brand_voice_match: 0.94` field in provenance envelopes. This requires:
- Initial fingerprint training on customer's existing content (~30 days of blog/site copy).
- Per-output match-score calculation.
- A model — this is not "call Claude with a prompt"; this is a learned embedding or stylistic feature classifier.

**Missing:** the actual algorithm. Is it cosine-similarity on text-embedding-3 over the customer's corpus? Is it a custom classifier? Either is buildable but neither is spec'd.

**Recommendation:** SHOULD-FIX. AI Engineer specs this in 1 day. At MVP, simplest viable: text-embedding-3 cosine sim over a corpus of 50+ customer-content samples. Threshold 0.85.

---

## 4. Bundle size + performance budget

The design system uses Rough.js + perfect-freehand + Framer Motion + React Flow + Tailwind + Shadcn + opentype.js + React-PDF. Let me estimate each route's JS budget at MVP.

### 4.1 Library sizes (gzipped)

| Library | Size | Used on |
|---|---|---|
| React 19 + Next.js 16 baseline | ~80kb | every page |
| Tailwind (CSS, not JS) | 0 | every page |
| Shadcn/UI primitives (tree-shaken) | ~10–15kb | every page |
| Framer Motion (tree-shaken with `m.` API) | ~25kb (60kb if full) | most pages |
| Rough.js | ~17kb | /home, /onboarding, /inbox, /workspace, /scans, /competitors, /crew, editorial surfaces |
| perfect-freehand | ~6kb | /home, /scans, /competitors, /workspace, editorial PDFs |
| opentype.js | ~150kb | NEVER ship to client; build-time only |
| React Flow + dependencies | ~80kb | /crew/workflows ONLY (lazy-load) |
| @react-pdf/renderer | ~200kb | NEVER ship to client; server-only |
| Lucide icons (tree-shaken) | ~2kb/icon × maybe 30 | every page |

### 4.2 Per-route budget estimate

**Budget target:** 200kb gzipped JS per route (per HOME §9.4: "≤80kb compressed for /home" is unrealistic; 200kb is the realistic ceiling).

| Route | Estimated JS | Verdict |
|---|---|---|
| `/home` | ~150kb (React + Framer Motion + Rough.js + perfect-freehand + Shadcn + page-specific) | OK (under 200kb) |
| `/onboarding/[step]` | ~140kb (no React Flow, no perfect-freehand on most steps; Step 3 adds Rough.js) | OK |
| `/inbox` | ~145kb | OK |
| `/workspace` | ~165kb (sprite assets are images, not JS — counted separately as ~80kb assets) | OK |
| `/scans` | ~150kb | OK |
| `/competitors` | ~155kb | OK |
| `/crew` | ~140kb (without Workflow Builder) | OK |
| `/crew/workflows/[id]` | ~240kb (with React Flow lazy-loaded) | OVER — but lazy-loaded so first paint is OK |
| `/scan` (public) | ~170kb (Rough.js heavy on this surface) | OK |

**Overall verdict:** the bundle budget is achievable IF:
1. opentype.js stays build-time only.
2. @react-pdf/renderer stays server-only.
3. React Flow is lazy-loaded (dynamic import) only on workflow editor route.
4. Framer Motion is imported via the `m.` (LazyMotion) API, not the full `motion.` API.
5. Rough.js sprite assets for /workspace are PNG/SVG static assets, not JS.

**Recommendation:** SHOULD-FIX. Build Lead enforces these 5 rules in lint config (eslint-plugin-import-restrictions can ban full-Framer-Motion imports). Add bundle-size CI check (size-limit or @next/bundle-analyzer) with route-level budget assertions.

### 4.3 First Contentful Paint budgets

HOME §9.4: FCP ≤1200ms on 4G mid-tier laptop, LCP ≤1800ms.

These are achievable but require:
- Skeleton-state SSR (HOME spec confirms).
- Font preloading for InterDisplay + Fraunces (critical — Fraunces is 100kb+ and FOUT will blow the budget).
- Image optimization for the only-image-asset (the agent monogram sprites on /workspace).

**Recommendation:** Achievable as spec'd. Verify with Playwright + Lighthouse CI on every PR.

---

## 5. Severity ratings — consolidated

| # | Item | Severity |
|---|---|---|
| 1.1 | /workspace walking-figure animation as spec'd | SHOULD-FIX (ship static at MVP, gait at MVP-1.5) |
| 1.2 | Real-time "agent is acting" channel — pick transport | BLOCKER |
| 1.3 | /competitors path-draw race with cross-coloring polygon | SHOULD-FIX |
| 1.4 | Onboarding Brief signature-stroke (opentype.js build pipeline) | SHOULD-FIX |
| 1.4 | Brief chip-slot extraction algorithm | BLOCKER (product gap) |
| 1.5 | React Flow Workflow Builder at MVP | SHOULD-FIX (defer to MVP-1.5 per PRD) |
| 1.6 | Firecracker microVM sandbox at MVP | NICE-TO-HAVE (at MVP — first-party only); BLOCKER at MVP-1.5 |
| 1.7 | Twilio 3-number provisioning during Step 2 animation | SHOULD-FIX (provision 1 sync, rest async) |
| 1.8 | React-PDF Fraunces variable-axis support | SHOULD-FIX (1-day spike) |
| 1.9 | Vercel OG / Satori compatibility for Rough.js seal | SHOULD-FIX (1-day spike) |
| 2.1 | EvidenceCard data shape canonical | BLOCKER |
| 2.2 | Brief schema canonical | BLOCKER |
| 2.3 | "House Memory" semantic split (Artifact Ledger / Margin Notes / Agent Memory) | BLOCKER (semantic) |
| 2.4 | Truth File single vs vertical-extension schema | SHOULD-FIX |
| 2.5 | Provenance envelope MVP-required vs Year-1 fields | SHOULD-FIX |
| 2.6 | Lead Attribution: how engines link to calls/forms | SHOULD-FIX (product clarification) |
| 2.7 | 4 lenses as agent-attribution vs action-tags | SHOULD-FIX (action-tags is the right model) |
| 3.1 | Real-time channel transport | (= 1.2) BLOCKER |
| 3.2 | Resend setup + send-volume tier + bounce handling | SHOULD-FIX |
| 3.3 | Inngest contract + quotas + step-level audit | BLOCKER |
| 3.4 | L2 site integration mode at launch (manual paste vs plugin vs edge worker) | BLOCKER |
| 3.5 | Form-attribution snippet on customer site | SHOULD-FIX |
| 3.6 | Per-customer scan-cost ceiling | SHOULD-FIX |
| 3.7 | SOC 2 / E&O (only blocking if Edge Worker ships) | NICE-TO-HAVE |
| 3.8 | Brand Voice Fingerprint algorithm | SHOULD-FIX |

**BLOCKERS (must resolve in Tier 0): 7**
**SHOULD-FIX (must address in MVP plan): 14**
**NICE-TO-HAVE: 2**

---

## 6. Recommended Tier 0 engineering tasks before build

Before any worker writes a React component or a backend route, the Build Lead must make and document these 5–7 decisions in `.claude/memory/DECISIONS.md`:

### Tier 0 — Task 1: Lock the runtime stack

- **Background jobs:** Inngest (contract + quota validated, pay-tier confirmed for 60s+ runs).
- **Real-time channels:** Supabase Realtime. Define one canonical channel: `agent_run_state` with the schema in §1.2. ALL "live" UI subscribes here.
- **Email:** Resend, paid tier matched to volume, domain verification done, bounce handler wired.
- **PDF generation:** React-PDF in Node Lambda. WONK-axis fallback decision documented after spike.
- **OG cards:** Vercel OG / Satori. Rough.js seal compatibility validated.
- **Vector store:** pgvector in Supabase (per Architect — defer dedicated vector DB to Year 1).

### Tier 0 — Task 2: Define the canonical data shapes

In `apps/web/types/`:
- `EvidenceCard.ts` — single shape, display-variant discriminator.
- `Brief.ts` — `{id, customer_id, version, status, sections[], clauses[]}`.
- `ProvenanceEnvelope.ts` — Architect §215 schema, fields marked MVP-required vs optional.
- `TruthFile.ts` — base schema + `vertical_extensions: jsonb`.
- `AgentRunState.ts` — Realtime channel payload schema.

These are blocking dependencies. No worker starts until these exist.

### Tier 0 — Task 3: Pick the L2 site-integration mode for launch

Product Lead + Build Lead decision. My recommendation:
- **MVP:** Manual paste only. /inbox shows the diff; customer copies to their CMS.
- **MVP-1.5:** WordPress plugin + Shopify app.
- **MVP-2:** Edge Worker.

Document in PRD update. Adjust marketing copy ("Beamix does the work" → "Beamix drafts the work, applies on supported platforms.")

### Tier 0 — Task 4: Resolve the "House Memory" semantic split

Three names, three systems. Documented in DECISIONS.md. Schema for each owned by AI Engineer (Agent Memory) and Build Lead (Artifact Ledger, Margin Notes).

### Tier 0 — Task 5: Define lens-as-action-tag model

Every agent action emits `lenses: string[]` array. /scans filter queries on this array, not on agent_id. AI Engineer + Product Lead lock the canonical lens taxonomy:
- `done` — agent executed something
- `found` — agent surfaced a gap or signal
- `researched` — agent consulted external evidence
- `changed` — agent modified an artifact

### Tier 0 — Task 6: Build-time pipeline for design assets

- opentype.js script that extracts "— your crew" Fraunces signature outline → static SVG.
- Rough.js Node + JSDOM script that generates per-agent monogram SVGs at build time → 11 static SVG strings.
- Rough.js Node script that generates per-customer Beamix Seal at signup (Inngest-triggered post-signup, persisted to `users.seal_svg`).

Owned by frontend-developer; ~3 days of work. Tier 0 because /onboarding Step 3 cannot ship without it.

### Tier 0 — Task 7: Cost ceiling instrumentation

- Per-scan cost recorder (engine API cost + browser-sim cost).
- Per-customer monthly cost rollup.
- Hard ceiling per tier (Discover $10/month scan budget; Build $30; Scale unlimited but instrumented).
- Alarm if any customer's monthly scan cost exceeds 30% of their MRR.

DevOps Lead + Data Lead. ~2 days.

---

## Closing

The 9 specs are designed by people who care. The page-level designs are achievable with the design system as locked. The risks are not in the design layer — they are in the unstated infrastructure assumptions, the unspec'd canonical data shapes, and the L2 site-integration gap that the PRD does not address.

If the Build Lead invests ~3 weeks in Tier 0 (the 7 tasks above), MVP is buildable in the next 6–8 weeks of worker time. If Tier 0 is skipped, expect ~3 weeks of refactoring during MVP build to retrofit canonical data shapes — and a hard pivot in MVP-1.5 when the L2 site-integration question can no longer be deferred.

The 4 BLOCKER items in §5 are the ones that, left unresolved, will cost the most. Pick those 4 first.

Word count: ~4,200.

— *the build feasibility auditor*

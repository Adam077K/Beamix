# Flow Architecture Recommendation — Scan ↔ Onboarding Integration
**Date:** 2026-05-04
**Author:** CEO (architectural integrator)
**Status:** Independent recommendation. To be cross-checked against parallel user-flow-architecture and acquisition-funnel-critique outputs.
**Decision sought:** What is the right structural relationship between `/scan` (acquisition) and `/onboarding` (Brief ceremony)? Are they two flows, one flow, or a flow with a hinge?
**Locked predecessors:** Q1–Q5 from the 2026-05-04 audit synthesis (Heebo, Brief grounding preview, activation = first /inbox approval 24h, /trust footer link).

---

## §1 — Diagnose the current spec

### What PRD v4 actually says today

PRD v4 §F1 and §F2 specify two surfaces with a thin string between them. Free /scan is "the acquisition surface" — public, anonymous, shareable, default-private permalink, two-column tier picker, "Start free" CTA links to signup with `?scan_id=`. Onboarding is "the 4-step Brief approval ceremony" that happens **after Paddle** — gated, post-purchase, one-time per account, with cinematic Seal-draw at Step 3 and mandatory Truth File at Step 4.

The string between them is `?scan_id=`: PRD v4 acceptance criteria for F2 explicitly says *"Onboarding detects `?scan_id=` — skips redundant scan, imports data, pre-fills business profile."* The 2026-04-27 onboarding spec §4.1 corroborates: *"`scan_id` is appended to the Paddle return URL. On `/onboarding/1` mount, the server fetches the scan record and pre-fills website, business_name, industry, primary_location, and a snapshot of the public scan's findings (used by Step 3's Brief composition)."*

So the **answer to "is scan part of onboarding?"** under the current spec is: **No, scan is a marketing acquisition surface that hands off a foreign key to onboarding.** The hand-off is `scan_id`. Onboarding pre-fills from it but is a structurally separate flow with its own page chrome, its own state machine, its own DB tables (`briefs`, `truth_files`, `subscriptions`), and crucially its own paywall in front of it (Paddle).

### What about §4.2 — direct signup with no prior scan?

The 2026-04-27 spec §4.2 covers this: a fifth "Step 0" prepended ("Where can we find you?") with a URL field, autofocus, "Scan and continue." The scan runs in the background while the customer advances to a *condensed* Step 1, where the URL is pre-filled and the other 3 fields populate progressively as the scan completes (5s, 15s, 25s). By Step 3, the scan is complete and the Brief is drafted from it.

This is a workable fallback but it's a tucked-away variation in §4.2, not a first-class architectural surface. It implies the team has already implicitly agreed that **scan must always exist before Brief authoring** — but the path through it is different depending on whether the customer arrived with a scan_id or without.

### Where activation lives (per Q4 lock)

Activation is locked as **first /inbox approval within 24h post-Brief-signing**. Trial clock anchor = Paddle checkout. Brief signing is the *constitutional* event but not the *activation* event. The magic-moment landing on /home (per onboarding spec §3) is engineered to surface a notification dot on /inbox within 90 seconds — Citation Fixer's 11 FAQ entries waiting for approval. **That dot click is the activation event.**

This matters for the architecture decision: if activation is the first /inbox approval, then the work of onboarding is not "complete the 4 steps" — it's "get the customer to a state where /inbox has something approvable, and they approve it." That reframes the whole flow.

### Gaps and inconsistencies in the current spec

1. **The Paddle paywall is invisible in both specs.** /scan ends with "Start free — fix this" CTA. /onboarding starts at Step 1 ("post-Paddle"). Where does Paddle live? It is an unspecified hand-off between F1 and F2. Marcus and Dani encounter a credit card form inserted between "I just saw my problem" and "Beamix is solving my problem." That moment is the highest-friction point in the entire flow and **no design spec governs it.** This is the single biggest hole.

2. **Scan re-running on direct-signup is in §4.2 (a "variation") but it's actually a primary path.** Marketing-site CTAs from Framer go to `/signup` directly. Cold outreach links go to `/signup` directly. Yet §4.2 is pages from the top of the spec and reads like an afterthought. The spec under-weights direct signup as a flow class.

3. **The scan results page and onboarding Step 1 do mostly the same job.** /scan shows the customer their score, engines, gaps. Onboarding Step 1 confirms the same business identity Beamix already pulled from the scan. There is real cognitive redundancy: the customer sees their domain and business name on /scan, signs up, pays, and is then asked to *re-confirm* their domain and business name on Step 1. Per the 2026-04-28 vertical-aware redesign, Step 1 leads with the vertical confidence indicator — but the customer could plausibly be saying *"I already told you this on /scan."*

4. **The Brief grounding preview (Q3 lock) implies the scan must produce Brief-grade evidence.** Adam locked: "ship Brief grounding inline citation preview during onboarding Step 2 (or Step 3 — there is some ambiguity)." This means by the time the customer is co-authoring the Brief, the system already has scan data deep enough to render a preview citation. **The scan and the Brief are not independent — the Brief is computationally downstream of the scan.** This dependency is real but is not architecturally surfaced.

5. **What happens to the public scan permalink after signup?** /scan generates a public-by-default-private permalink at `beamix.tech/s/{scan_id}` (now `beamixai.com/s/{scan_id}` per domain update). After signup, does the scan get re-parented to the customer's account? Does the customer see it on /scans as their scan #1? The spec is silent. This is small but important: the customer's first /scans table row should be the public scan they ran 4 minutes ago — that's the continuity proof.

6. **No "skip scan" path is specified.** A direct-signup customer in §4.2 *must* run a scan during onboarding. There is no "I already know I'm invisible — just take my money and start working" path. This may be correct (the scan is the demo and we shouldn't let customers skip it) but it's not stated as a deliberate decision.

The current spec is workable but has the architectural fingerprint of "two separate teams designed two separate surfaces and bolted them together with a query parameter." The scan does not know it is the front door of a 4-minute ceremony. The ceremony does not know how to behave gracefully when the scan didn't happen.

---

## §2 — Pressure-test each option

### Option A — Separate flows, query-param hand-off (current spec)

**Marcus:** Sees Beamix on Hacker News → /scan → enters acme.dev → 17s reveal shows him in 2 of 11 engines, competitor in 7 → sees price card → clicks "Start on Build $189" → Paddle checkout → returns to /onboarding/1 with scan_id → confirms profile → vertical-conditional Step 2 (UTM-first for SaaS) → Brief co-authoring → Seal stamps → Truth File → /home with Evidence Card. **Flow works.** Friction point is Paddle: he has to type a credit card after the demo and before the resolution.

**Dani:** Same as Marcus but slower. She lingers on /scan reading her gaps before signing up. The CTA "Start free" is misleading because there is no free trial — there is a 14-day money-back guarantee. She may bounce at the Paddle form. If she gets through, the onboarding works for her (e-comm Twilio path, services chips on Step 4).

**Yossi:** /scan with client #1 → signup → onboarding (8 min full ceremony) → adds client #2 via /settings → second 8-minute ceremony → ... → 96 minutes for 12 clients. He activates client #1 fine but Yossi-friction kills him by client #4. Audit O-1 caught this; agency batch mode is at MVP+30.

**Aria:** Doesn't sign up. She receives the signed Brief PDF + Seal that Marcus forwards. With the audit's locked /trust footer link, she can click through to the security page from inside the signed Brief if it surfaces a /trust URL. The current PDF doesn't.

**Conversion impact (vs baseline = Option A itself):** Baseline.

**Brand + voice impact:** Cream-paper register fires twice in this flow — once on /scan, once on Step 3. The two cream moments are not connected; the customer experiences them as "two cream surfaces" rather than one continuous artifact. Mild dilution of the editorial register.

**Build effort:** Already specced. The work is to ship what's written. Effort is the per-feature build, not architectural rework. **Effort: S (already in plan).**

**Failure modes:**
- Paddle hand-off failure: customer pays, Paddle webhook fires after a delay, customer hits /onboarding/1 before the subscription record exists, gets a confusing error.
- scan_id expiry: free scans live 30 days; customer scans, takes 31 days to sign up, scan_id is gone, onboarding Step 1 is empty.
- The "Start free" copy mismatch: the customer reads "free" on /scan, sees Paddle, feels misled.
- Direct-signup customers (no scan_id) get a different flow (§4.2) that the team didn't pixel-test as carefully.
- Customer sees their score on /scan, then Step 3's Brief contains the same competitor names — feels redundant rather than continuous.

### Option B — Unified flow (scan IS Step 0 of onboarding)

One linear experience: URL entry → scan reveal → "want us to fix it?" → Paddle → continues into Brief authoring → Seal → Truth File → /home. The customer experiences a single arc, no surface boundary between marketing and product.

**Marcus:** Lands on /onboarding (or /start, or /scan — same surface) → enters acme.dev → scan reveals → CTA "Approve a fix plan and start" → Paddle (inline modal, not page redirect) → without re-loading, continues into Brief co-authoring on the same page (the cream-paper register transitions from "scan results" into "Brief" smoothly) → Seal → Truth File → /home. Total time: 5 minutes including the 17s scan. **Conversion benefit: there is no "you left and came back" moment.** The scan output is *visibly the source* of the Brief — customer sees the same gaps named in the Brief that were exposed in the scan.

**Dani:** Same arc. The cream-paper register is sustained the whole way through. Mobile experience is one continuous scroll of a single-page app.

**Yossi:** Bigger problem. He cannot run an unauthenticated scan against client #1 if he's already signed in. The unified flow assumes anonymous → authenticated transition. For Yossi, every additional client needs to start at "anonymous /scan" but he is signed in and authenticated. Either we bypass the scan-first flow for him, which fragments the unified design, or we let signed-in users run /scan for arbitrary domains — which then has to be re-parented to the right client account.

**Aria:** Doesn't enter this flow at all. She receives the artifact later. No change vs Option A.

**Conversion impact:** **Much better at the top of funnel** (no leaving and coming back; no redundant "confirm your business name" Step 1). Estimated +15-25% on the scan→activation conversion vs Option A. The reason: in Option A there is a cognitive break between scan-reveal and onboarding-Step-1 that lets Marcus close the tab. In Option B, the Brief authoring follows directly from the scan reveal in the same scroll context — there is no "leave the surface" moment.

**Brand + voice impact:** Strongest possible adherence to Frame 5 v2's "single-character externally" voice canon. The customer experiences one continuous Beamix voice across one surface. Cream-paper register fires once and sustains. The Seal stamps in the same surface where the scan was revealed — beautifully cinematic.

**Build effort:** **L.** This is a significant rework. /scan and /onboarding currently are different routes, different chrome (no sidebar / pre-Paddle on /scan; no sidebar / post-Paddle on /onboarding), different state machines. Unifying means: shared URL space (e.g., a single `/start` route with internal phases), shared state machine, inline Paddle (Paddle Overlay or Paddle Inline rather than redirect), and the scan engine has to run from the same surface. This is doable but it's 3-4 weeks of integration work that is not currently in the plan.

**Failure modes:**
- Paddle inline failure (overlay JS doesn't load, browser blocks third-party): the entire flow stalls. Need a "fall back to redirect" path that re-enters the unified flow gracefully.
- Customer abandons mid-arc: where do they re-enter? At the scan? At the Brief? At Paddle? The state machine needs explicit re-entry rules.
- Yossi multi-client problem above: signed-in users running /start for new domains.
- Performance: a single page that hosts scan reveal + Paddle overlay + Brief authoring + Truth File is heavy. Code-splitting becomes critical.
- Loss of public-scan-as-marketing surface: if /scan no longer renders standalone, the public permalink at `beamixai.com/s/{scan_id}` either has to be a different surface (back to A) or a read-only fork of the unified flow without auth state. This complicates the "share your scan publicly" feature.

### Option C — Two flows that converge at Brief authoring

- /scan exists standalone as today (public, anonymous, viral, shareable permalink).
- Direct signup flow exists (`/signup` → Paddle → onboarding) and runs scan during onboarding Step 0/1.
- Both flows converge at Step 2 (Brief authoring) where the scan data has been fetched (from public scan_id or from in-onboarding scan) and the Brief composition draws from it.

This is essentially the current spec PLUS a deliberate first-class commitment that the direct-signup path is not a "variation" but a peer flow. Per Q3 (Adam's lock to ship Brief grounding preview at MVP), the system *already* assumes scan data is fetchable at Brief time regardless of which path got the customer there.

**Marcus:** Two paths. From /scan: same as Option A. From direct signup (e.g., a Framer marketing CTA "Start on Build"): /signup → Paddle → /onboarding/1 with no scan_id → Step 1 has a URL field at top (autofocus), background scan kicks off as soon as he types domain + tabs out, fields populate progressively over 30 seconds → continues to Step 2/3/4. Same end state.

**Dani:** Same. Either path works.

**Yossi:** Direct-signup path is his default. He never uses public /scan because he's signed in. He adds a client via /settings → triggers a per-client scan in the background → enters the per-client onboarding flow. Same friction as Option A for him; agency batch mode at MVP+30 still needed.

**Aria:** Same as Option A.

**Conversion impact:** **Marginally better than A** (+5-10%) because direct-signup customers get a cleaner, intentional flow rather than a §4.2 variation. The Marcus-from-/scan path is unchanged. The Yossi path is unchanged. Where it helps: customers from Framer marketing CTAs (Adam's flagship marketing investment) get a designed flow rather than a variation.

**Brand + voice impact:** Same as Option A but with one fewer "this feels like an afterthought" moment in the direct-signup path. Cream-paper register still fires twice across two surfaces.

**Build effort:** **S-M.** The architectural commitment is small (declare the two paths, design Step 0 of the direct-signup path as a first-class screen, ensure scan-during-onboarding produces the same Brief inputs as scan-before-signup). Most of the engineering is already done; the design lift is articulating Step 0 of the direct flow and ensuring it pixel-matches the public /scan reveal.

**Failure modes:**
- Same Paddle hand-off failures as A.
- Direct-signup customers don't get the public-scan-permalink as a "share your scan" artifact unless we explicitly re-create one for them at /scans on first scan. (This is a small addition but real.)
- The "two paths" can drift — visual design, copy, motion may diverge between /scan-public and /onboarding/Step-0 over time without explicit cross-reference rules.

### Option D — Scan is gated (signup before scan)

No anonymous scans. Signup → Paddle → /onboarding/0 (URL entry) → scan → results inside onboarding → Brief → Truth File.

**Marcus:** Hates this. The whole point of /scan as marketing surface is that he can demo Beamix before paying. Removing anonymous scan removes the wedge demo. He probably bounces at "give us your card before we'll show you the result."

**Dani:** Same. Maybe worse — Dani is comparison-shopping; she will run /scan on five competitors' SEO tools simultaneously, then choose. If Beamix gates the scan behind signup, she scans the competitors and skips Beamix.

**Yossi:** Slight benefit — he doesn't care about the public scan, and he'd prefer scan-after-signup. But the loss of the public scan kills his client acquisition (he uses Beamix's public scan as a sales tool to land new clients).

**Aria:** Unchanged.

**Conversion impact:** **Catastrophic.** -40-60% on top-of-funnel acquisition. Removes the proven wedge mechanic ("type your URL, see the gap") that drives all viral acquisition.

**Brand + voice impact:** Eliminates the public-scan-as-content marketing motion (Frame 5 v2 §"/scan-as-content — every shared public scan is a brand impression"). Kills a brand surface.

**Build effort:** S — actually less work than today, because we delete /scan public.

**Failure modes:** Doesn't matter. We're not picking this.

### Option E — A 5th option: Unified surface for direct-signup, /scan public for marketing wedge (HYBRID)

This is the option I'm proposing. It is **Option C plus a carefully designed Option B for the direct-signup path.**

- **Marketing wedge path (anonymous):** /scan public stays exactly as today. Anonymous URL entry, 17s reveal, public default-private permalink, "Start on Build $189" CTA. Same surface as marketing acquisition.
- **Direct signup path (authenticated):** A unified `/start` flow that is one continuous experience: URL entry → scan reveal → Brief approval → Truth File → /home. Paddle is inline (overlay) at the moment of CTA click, not a page redirect. The customer never leaves the /start surface until they land on /home.
- **Convergence at Brief:** Both paths converge at the Brief authoring moment with scan data already in hand. The Brief composition is identical regardless of how they got there.
- **Scan-first → signup hand-off:** When a customer comes from /scan public via "Start on Build" CTA, they land on `/start?scan_id=xxx` — the unified flow detects the scan_id, skips the URL entry phase, jumps directly to "here's what we'll do" (Brief draft visible immediately, since the scan has already run). This *re-uses* the unified `/start` flow but enters it at phase 2 instead of phase 0.

This option preserves the marketing wedge (Option D would kill), gets the conversion benefit of Option B for direct-signup customers, and makes Option C's "two paths converge at Brief" architectural commitment more rigorous because both paths terminate in the same `/start` flow.

**Conversion impact:** Best of all. +10-20% vs baseline on direct-signup conversion (Option B benefit). Public-scan→signup conversion same or slightly better because the post-Paddle return goes into a unified surface rather than a fresh `/onboarding/1` route.

**Brand + voice impact:** Strongest. The unified `/start` flow is a single sustained surface where the cream-paper register holds across scan reveal AND Brief AND Seal — all in one scroll. Public /scan still exists for the viral acquisition motion.

**Build effort:** **M-L.** Bigger than C, smaller than full-B. The work: build the unified `/start` flow (re-using existing onboarding components), make it accept `?scan_id=` to enter at phase 2, integrate Paddle inline overlay, maintain /scan public as today.

**Failure modes:**
- Paddle inline still has the "overlay didn't load" failure mode. Mitigation: a "fall back to Paddle redirect → return to /start at next phase" path.
- The unified flow is heavier to load than discrete pages. Code-splitting is critical.
- Maintaining two top-of-funnel surfaces (/scan public and /start direct) means the team has to keep them visually and copy-coherent over time.
- Yossi's multi-client problem unchanged (deferred to MVP+30).

---

## §3 — The integration question Adam asked specifically

Adam's question: *"Maybe the onboarding starts after you see the scans and click 'start' — we need to think about this and how we connect all the things, actual user flows..."*

Yes. This is exactly Option E. Here is the page-level spec.

### The unified `/start` flow (Option E spec)

**Surface:** `/start` (single route, internal phase state machine — phases: `enter-url`, `scanning`, `results`, `signup`, `paddle`, `brief-co-author`, `brief-signing`, `truth-file`, `redirect-to-home`).

**Phase 0 — `/start?_=enter-url` (default landing)**
- URL: `/start` (no params) or arrived via Framer "Start free scan" CTA.
- What user sees: Cream-paper full viewport. Single text-h1 "What's your domain?" in InterDisplay. Single 56px input field, autofocus. Geist Mono helper line: "We'll scan you against 11 AI engines in about 17 seconds." Pill button "Scan."
- Action: Customer types domain, clicks Scan or hits Enter.
- Data preserved: domain stored in client state + sent to scan API, returns scan_id.
- State owner: a top-level `<StartFlow>` component holds all phase state in URL params + sessionStorage + an Inngest run id once scan kicks off.

**Phase 1 — `/start?phase=scanning&scan_id=xxx` (10-15s)**
- What user sees: Cream-paper. Same surface. Top of viewport: the engine reveal animation from the locked /scan storyboard — one engine name at a time strikes through then re-writes with the verdict ("ChatGPT — your competitor RotoTel cited 4×, you 0×"). The engines stack vertically as they reveal. Below, a Geist Mono progress line: "Scanning 11 engines · 7 of 11 done · ~6s left."
- Action: None — passive watching. The customer is held on this phase for ~17s.
- Data preserved: scan_id in URL; scan results streaming into client state via Supabase Realtime.

**Phase 2 — `/start?phase=results&scan_id=xxx`**
- What user sees: Cream-paper. Same surface. Top: the AI Visibility Score (e.g., 32) with Ring stroke-drawing. Below: the 11-engine micro-strip. Below that: 3 specific gaps in editorial Fraunces prose (cream paper register doing its work). Below that: a card "Beamix's plan for you" — a 3-bullet summary of what we'd do (preview of the Brief).
- CTA: A single primary pill button "Start on Build $189 — 14-day money-back" (defaulted to Build per F1 acceptance criteria; tier-picker is collapsed below). Secondary ghost "Or pick another tier" reveals the Discover/Build picker.
- Action: Click CTA → Phase 3 (signup overlay).
- Data preserved: scan_id in URL; scan results in client state. The "Start" CTA opens a modal — does NOT navigate.

**Phase 3 — Signup overlay (no URL change)**
- What user sees: Modal over the cream-paper background (background dims to 60% opacity, modal is paper-elev white card 480px wide). Email + password (or magic-link) signup form. Geist Mono footer "By continuing, you agree to ToS. 14-day money-back guarantee. Security & DPA →" (the /trust footer link from Q5 lock).
- Action: Submit → backend creates auth user, creates `user_profiles` row (via the corrected handle_new_user trigger), associates `scan_id` with user, returns session token, dismisses modal, advances to Phase 4.
- Data preserved: scan_id is now linked to the auth user account. The public scan permalink is also re-parented to this user.

**Phase 4 — Paddle inline checkout (`/start?phase=paddle&...`)**
- What user sees: The cream-paper background is still present. Paddle Overlay/Inline opens centered. The user enters card details. Paddle fires its complete callback.
- Action: Paddle webhook fires → subscription row created with trial_started_at = NOW (per Q4 lock: trial clock starts at Paddle checkout). Phase advances.
- Data preserved: subscription_id is now linked to user_id. scan_id is still in URL.

**Phase 5 — `/start?phase=brief-co-author&scan_id=xxx`**
- What user sees: Cream-paper SUSTAINED. The page transitions: the score+gaps from Phase 2 fade upward (translate-y -120px, opacity → 0), and the Brief artifact slides up from below into the same vertical position. The Brief header reads "BRIEF · DRAFT v1 · {date}" in Geist Mono 11px caps. Below it, the Brief paragraph in Fraunces 22px, with chip editing per the locked spec. To the right (desktop) or below (mobile): the Brief Grounding Preview panel from Q3 lock — shows a sample /inbox item with inline citation pattern.
- Action: Customer reads, edits chips, clicks "Approve and start."
- Data preserved: All scan data flows into Brief composition; chip edits are autosaved as `briefs` row drafts; user_id, subscription_id, scan_id all in scope.

**Phase 6 — `/start?phase=brief-signing` (2.5s ceremony)**
- What user sees: The locked Seal-draw ceremony. 540ms stamping curve, "— Beamix" 300ms opacity fade, header line cross-fades to "BRIEF · v1 · SIGNED {date} — {time}." Per the 2026-04-28 PRD v4 amendment, the 1px ink-1 dot beside the Seal during the stamp.
- Action: None — ceremony plays.
- Data preserved: brief committed to `briefs` table with signed_at timestamp.

**Phase 7 — `/start?phase=truth-file`**
- Background transitions BACK from cream to white paper (per locked spec — Step 4 is on white).
- What user sees: The Truth File form. Per the audit O-4 lock: Three Claims pre-filled from scan data (Claude-drafted, customer reviews + edits). Per O-18: hours field vertical-conditional (hidden for SaaS, shown for E-comm/Local).
- Action: Customer fills required fields, clicks "File this and start."
- Data preserved: truth_file row written, truth_file_filed_at = NOW.

**Phase 8 — Redirect to /home**
- The 7-second magic-moment cinema runs as specced. First /inbox notification dot appears within 90s. Activation event fires when customer clicks the dot and approves the first item (per Q4 lock).

### What if the customer can't scan first (direct-link signup)?

Same flow, enters at Phase 0 instead of Phase 2. From a Framer "Start" CTA: lands on `/start` with no params. URL entry phase. Scan runs. Reveal. CTA. Signup. Paddle. Brief. Seal. Truth File. /home. **Identical surface, identical voice canon, identical brand register.** The flow handles both classes of customer with one architecture.

### What if a customer signs up but really doesn't want to scan?

The flow does not provide a "skip scan" path. Per the strategic logic: the scan is the demo and the source of Brief grounding; without it, the Brief is generic and the customer has paid for nothing they can verify. We do not let them skip it. **The 17-second scan is the price of entry.** A customer who refuses is not a Beamix customer.

### What about the public scan permalink?

When a customer enters /start at Phase 0, runs the scan, and then signs up at Phase 3, the public permalink they generated at Phase 1 (which was anonymous) gets re-parented to their account in the signup transaction. They can later share it via /scans → Share modal exactly as today. The customer who arrives via a public permalink (`beamixai.com/s/{scan_id}`) and clicks "This is mine — claim it" is taken to /start at Phase 2 with the scan_id in URL — they bypass URL entry and go straight to results.

### The skipped state I'm explicitly rejecting

A "skip scan" path. A "skip Brief" path. A "skip Truth File" path. **These are the three sacred steps.** The architecture allows pause + resume at any phase boundary, but it does not allow skipping the substance of any step. This is consistent with the locked design principle that the Brief is constitutional and the Truth File is the trust mechanism.

---

## §4 — The 5 critical hand-offs

### Hand-off 1: URL entry → scan running (0-17 seconds)

**Optimal design:** The scan reveal animation IS the wait. Engines reveal one at a time, each with a verdict. The customer is not watching a spinner — they are watching their visibility get evaluated in front of them. This is already specced in the locked /scan 10-frame storyboard. **My recommendation: re-use it inside `/start` Phase 1 verbatim.**

**Failure mode:** Scan API stalls or one of the 11 engine probes times out. Mitigation: each engine has a 5-second timeout; on timeout, that engine renders as "couldn't reach — we'll retry in your next scan" but the reveal continues. The progress line at bottom is honest about which engines completed.

### Hand-off 2: Scan complete → results revealed (the first impression)

**Optimal design:** The score + Ring + 11-engine micro-strip + 3 gap statements arrive together as a composed scene, not piecemeal. Per the 2026-04-26 BOARD3 designer brief, this is the "cinematic peak of acquisition." The cream-paper Fraunces prose for the 3 gaps is the editorial register's first appearance.

**Failure mode:** Scan returns successfully but with no findings (rare — clean site). Per the existing onboarding §5.4 fall-through hierarchy: surface a proactive opportunity finding rather than an empty card. Same applies here.

### Hand-off 3: Results → "Start on Build" CTA → signup

**This is the conversion moment.** Optimal design: a single primary CTA, default-tier Build, with the tier picker collapsed below (per F1 lock: two-column tier picker, Discover vs Build, Scale not shown). The CTA opens a signup overlay — not a page navigation — so the cream-paper background and the scan results stay visible behind the modal.

**Recommendation:** Ship the signup as a modal over the results, not as a redirect. The customer should *see* what they're signing up for behind the form. Per the audit O-3 + Q5 lock: Geist Mono "Security & DPA →" footer link in the signup overlay.

**Failure mode:** Signup fails (email already exists, password weak, network). Modal stays open with inline error; the cream-paper results stay visible behind it. Customer can retry without losing context.

### Hand-off 4: Signup complete → first authenticated state

**Optimal design:** The signup transaction is atomic with scan re-parenting and Paddle initiation. After signup success: scan_id is associated with user_id in DB; the modal cross-fades to the Paddle inline overlay. The customer never sees a blank "loading your account" state.

**Failure mode (the worst one):** handle_new_user trigger fails silently → no user_profiles row → onboarding loop comes back. Per audit O-6 mitigation: deploy-time smoke test + UPSERT guard on the onboarding completion path. **This is a Tier 0 ticket and must be wired.**

### Hand-off 5: Brief co-author → Seal sign → first /home

**Optimal design:** The Brief is composed from scan data + vertical KG + Truth File schema. Customer reads, edits chips, clicks Approve. Seal stamps in 540ms. Background cross-fades to white. Truth File form renders. They fill it. /home magic moment plays. The 90-second post-/home /inbox notification dot is the first interaction handle. Activation = clicking that dot and approving (per Q4 lock).

**Failure mode:** Brief commit fails after Seal animation begins. Per current spec §5.6: button reverts to "Approve and start"; needs-you helper line offers retry. Animation does not replay.

---

## §5 — The big-picture call

**For Beamix at this stage, I recommend Option E (the unified `/start` flow with public /scan preserved as a peer marketing surface) because:** (1) it preserves the viral wedge — public anonymous /scan stays exactly as it is and continues to be the world's most efficient demo of Beamix's value; (2) it eliminates the Paddle-as-cliff problem in Option A by hosting the entire signup-to-Brief arc on one cream-paper surface where the customer never has the "I left, I came back, who am I again" moment; (3) it gives the design system one continuous canvas to honor Frame 5 v2's "single character externally" voice canon — the Seal stamps in the same surface where the score was revealed, which is the strongest possible expression of the editorial register; (4) it makes the direct-signup path (which Adam's Framer marketing investment will increasingly drive) a first-class flow rather than a §4.2 footnote; (5) it surfaces the architectural commitment that scan and Brief are computationally inseparable — the Brief Grounding Preview Q3 lock and the pre-fill Three Claims O-4 fix both *require* this dependency to be honored. **The build cost is M-L** (3-4 weeks of integration work for a frontend specialist, mostly re-using existing onboarding components inside a unified state machine, plus Paddle Overlay integration). **The conversion delta vs current spec is approximately +10-20% on direct-signup conversion and +5-10% on scan-to-paid conversion, driven primarily by removal of the post-Paddle "/onboarding/1 starts cold" moment.** **Implementation requires changes to: a new `/start` route with phase-based state machine; existing /onboarding routes deprecated (their components re-used inside /start); Paddle Inline/Overlay integration replacing redirect checkout; the `?scan_id=` query parameter handling moved from /onboarding/1 mount to /start phase advancement; the public /scan permalink kept as today, but the "claim this scan" CTA on a public permalink now routes to /start at Phase 2.**

### 5 things Adam should do to validate this recommendation before committing to PRD v5

1. **Run a 5-customer guerrilla test on the proposed Option E flow vs the current Option A flow.** Mock-build both flows in Figma or pencil at low fidelity. Two flows × 5 customers each = 10 sessions. Watch for: where do they pause, where do they ask "what's happening," where do they bounce. Look specifically for the moment after Paddle in Option A — is it as cold as I think it is?
2. **Pressure-test Paddle Inline/Overlay on actual SaaS billing flows.** Paddle has reliability quirks at the inline-overlay layer. Run Stripe-like comparison checkouts on a sample of ~20 transactions across iOS Safari, Chrome, Firefox, mobile Safari to confirm overlay reliability. If Paddle Overlay is sketchy, fall back to a "redirect to Paddle, return to /start at next phase" pattern — the unified surface still mostly holds.
3. **Map Yossi's path through Option E explicitly.** Sit with the agency-mode design (deferred to MVP+30) and confirm that the unified /start flow doesn't make Yossi's per-client onboarding harder. The skip-cinema-for-repeat-brief mitigation from O-19 should be sketched into the unified flow to verify it's compatible.
4. **Pixel-spec the Phase 1→2 transition (scan reveal → results → CTA reveal).** This is the single highest-leverage moment in the entire flow and the spec is currently "use the locked /scan storyboard." That's directionally right but the unified flow needs an explicit handoff between scan-reveal (engines stacking) and results-rendered (Score+Ring+gaps+CTA). Get the Senior Designer to ship one frame-precise spec for this transition.
5. **Confirm the "claim this scan" pattern on public permalinks.** A customer arrives at `beamixai.com/s/{scan_id}` from a referrer's share link — what does the page show, what does the CTA say, where does it route? This is a third entry path I gestured at but didn't fully spec. Verify the routing into /start at Phase 2 works for this case before locking architecture.

---

## §6 — The unified state diagram (final deliverable)

```
                                        START STATES
                                        ─────────────

  [public scan permalink share]    [direct signup link from Framer]    [referrer Slack/X link]
            │                                  │                                  │
            ▼                                  ▼                                  ▼
  beamixai.com/s/{scan_id}              beamixai.com/start                   /start (or /)
            │                                  │                                  │
            │ "Claim this — start"             │ (no params)                       │
            ▼                                  ▼                                  ▼
        /start?phase=results              /start?phase=enter-url          /start?phase=enter-url
        scan_id=xxx                                                       
            │                                  │                                  │
            │                                  │ types domain                     │
            │                                  ▼                                  ▼
            │                          /start?phase=scanning  ◄──────────────────┘
            │                            scan_id=yyy
            │                                  │
            │                                  │ scan completes (~17s)
            │                                  ▼
            └────────────────────────► /start?phase=results
                                        scan_id=xxx
                                              │
                                              │ click "Start on Build"
                                              ▼
                                        signup overlay (modal, no URL change)
                                              │
                                              │ creates user, links scan_id
                                              ▼
                                        /start?phase=paddle
                                              │
                                              │ Paddle webhook fires
                                              │ subscription created
                                              │ trial_started_at = NOW (Q4 lock)
                                              ▼
                                        /start?phase=brief-co-author
                                              │
                                              │ Brief composed from scan + vertical KG
                                              │ Brief Grounding Preview visible (Q3 lock)
                                              │ chip edits autosaved
                                              │
                                              │ click "Approve and start"
                                              ▼
                                        /start?phase=brief-signing
                                              │
                                              │ Seal stamps 540ms (locked curve)
                                              │ "— Beamix" 300ms fade (locked Model B voice)
                                              │ brief.signed_at = NOW
                                              ▼
                                        /start?phase=truth-file
                                              │
                                              │ Three Claims pre-filled (O-4 lock)
                                              │ Hours vertical-conditional (O-18 lock)
                                              │ background = paper white
                                              │
                                              │ click "File this and start"
                                              ▼
                                        truth_file_filed_at = NOW
                                              │
                                              ▼
                                        /home (magic moment, 7s cinema)
                                              │
                                              │ first /inbox notif dot at ~90s
                                              ▼
                                        /inbox (customer clicks dot)
                                              │
                                              │ approves first item
                                              ▼
                                        ┌──────────────────────────────┐
                                        │ ACTIVATION EVENT             │
                                        │ first /inbox approval        │
                                        │ within 24h post-Brief-signing│
                                        │ (Q4 lock)                    │
                                        └──────────────────────────────┘


                                  EXIT STATES (any phase)
                                  ──────────────────────

   ┌─ Abandoned at Phase 0/1: no scan_id, no user, no record. Cleanup: none.
   ├─ Abandoned at Phase 2 (results, anonymous): scan_id exists, user does not.
   │  Cleanup: 30-day cron drops anonymous scan rows. Permalink expires.
   ├─ Abandoned at Phase 3 (signup overlay open): partial auth user may exist
   │  if email collected. Cleanup: 30-day no-Paddle-completion → soft delete.
   ├─ Abandoned at Phase 4 (Paddle): user exists, no subscription.
   │  Cleanup: 30-day cron + 3-email recovery sequence (O-13). Twilio numbers
   │  not yet provisioned (Step 2 was deferred per vertical-aware lock).
   ├─ Abandoned at Phase 5 (Brief draft): user, subscription, scan, draft Brief.
   │  Recovery: re-entry restores draft. 3-email sequence (O-13). Lifecycle
   │  trigger if 7d no return.
   ├─ Abandoned at Phase 6 (mid-signing): commit either succeeded or failed.
   │  On return: if signed, jump to Phase 7. If failed, return to Phase 5.
   ├─ Abandoned at Phase 7 (Truth File partial): autosave preserves fields.
   │  /home blocked; redirect back to /start?phase=truth-file on any auth route.
   ├─ Refunded within 14 days: subscription cancelled, account preserved
   │  read-only for 30d (per F35 graceful cancellation), then full delete.
   │  Twilio numbers (if provisioned) released (O-7 cleanup).
   └─ Activated → renewed → paying customer for 18 months. Goal state.


                                  DATA CARRIED FORWARD
                                  ────────────────────

   Phase boundary                     What persists
   ─────────────────────────────────────────────────────────────────
   enter-url → scanning               domain, scan_id (server-issued)
   scanning → results                 scan results JSON (engines, gaps,
                                       score, vertical classification w/
                                       confidence)
   results → signup overlay           scan_id in URL + session
   signup → paddle                    user_id, scan_id (re-parented to user)
   paddle → brief-co-author           subscription_id, trial_started_at,
                                       Brief draft (composed from scan +
                                       vertical KG + tier)
   brief-co-author → brief-signing    brief draft id, all chip edits
   brief-signing → truth-file         brief.signed_at, brief commit version
   truth-file → /home                 truth_file_filed_at, all required fields
   /home → /inbox approval            agent runs queued, first finding ready
   /inbox approval → activation       activation_event_at = first_approval_at


                                  WHAT NEVER CHANGES
                                  ──────────────────

   - Cream-paper register sustained from Phase 0 through Phase 6.
     Background transitions to white at Phase 7 only.
   - Voice canon Model B: "— Beamix" everywhere. Never "your crew" externally.
   - The Seal stamps once, in the same surface where the scan was revealed.
   - public /scan continues to exist at beamixai.com/s/{scan_id} — same route,
     same default-private permalink, same shareability. It is not deleted by
     this architecture. It is a peer marketing surface that ROUTES INTO /start
     when claimed.
```

---

*End of recommendation. ~3700 words. To be cross-checked against parallel user-flow-architecture analysis and acquisition-funnel-critique outputs in the next CEO synthesis pass.*

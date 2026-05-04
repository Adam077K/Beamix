# `/start` — Canonical Pixel + State-Machine Spec (Option E)

**Date:** 2026-05-04
**Owner:** CEO synthesis (Adam locked Q1–Q13 on 2026-05-04)
**Status:** CANONICAL — frontend implements from this document. No follow-up questions required.
**Architecture:** Option E unified `/start` route + peer-public `/scan` (locked Q12, ships at MVP per Q13)
**Source-of-truth lineage:** FLOW-ARCHITECTURE-RECOMMENDATION → FLOW-ARCHITECTURE-SYNTHESIS → USER-FLOW-ARCHITECTURE → PRD-wedge-launch-v4 → ONBOARDING-design-v1 → DESIGN-SYSTEM-v1 → ONBOARDING-AUDIT-SYNTHESIS.
**Voice canon:** Model B. Within `/start`, brand is "Beamix" (single character externally). Agent monograms appear as visual artefact only on Phase 1 scanning copy and Phase 2 results. Seal signs "— Beamix".
**Surface partition:** `/start` is cream-paper-stays-light forever (no dark mode token swap on cream surfaces, per Round 2 lock).

---

## §1 — The architectural overview

### What `/start` is

`/start` is **a single Next.js 16 App Router page** at `apps/web/src/app/start/page.tsx` whose body is rendered by a **phase-driven state machine**. There is no `/start/step-1`, `/start/step-2`, `/start/brief`, `/start/checkout` route family. There is one route. The URL changes only by query string: `?phase=<name>&scan_id=<id>`. Phase content is composed of nine ordered sub-components mounted/unmounted by a Zustand selector. The DOM transition between phases is a 140 ms cross-fade per Vercel motion canon (with two named exceptions: Phase 1→2 results reveal at 1100 ms, and Phase 6 Seal stamping at 540 ms — both spec'd in §2).

### Why a state machine, not separate routes

Three reasons: (1) **Continuity** — separate routes break the cream-paper editorial register because Next.js layout boundaries trigger paint flashes between cream surfaces. A state machine paints once and re-composes within the same document. (2) **Data carry-over** — `scan_id`, `user_id`, `business_id`, `brief_id`, `truth_file_id` cascade as new IDs are minted. A single Zustand store with sessionStorage hydration owns the cascade; multi-route would force serialise/deserialise on every navigation. (3) **The "I left, came back, who am I?" defect** — Adam's locked Q6 insight is that Paddle is deferred outside `/start`. The state machine guarantees the customer never leaves cream paper from Phase 0 through Phase 8.

### Entry paths into `/start`

There are **5 canonical entry paths** (per USER-FLOW-ARCHITECTURE 12-paths reduction):

1. **Anonymous-fresh** — direct hit on `/start` with no params. Lands at Phase 0 (`enter-url`).
2. **From-public-scan-permalink** — visitor on `/scan/[scan_id]` clicks "Claim this scan." Routes to `/start?phase=results&scan_id=[id]`. Lands at Phase 2 with scan data already hydrated.
3. **Direct-signup-link** — Adam's outbound, partner referrals, deep links. Lands at Phase 0 (`enter-url`) and proceeds through the full flow.
4. **Returning-after-abandonment** — recovery email with `/start?phase=<resume-phase>&token=<recovery-token>` rehydrates the abandoned phase from server-stored draft.
5. **Returning-from-day-N-shareback** — boss/CTO clicked the customer's `/home` permalink, came back days later via Day-3/Day-7/Day-14 nurture email. Routes to Phase 8 (`complete`) if onboarding is finished, or to the abandoned phase otherwise.

### Exit states

Three terminal states. **Paid** — Phase 9 succeeded; redirect to `/home` with paid banner. **Free-but-completed** — Phase 8 reached (Brief signed); redirect to `/home` with free-account banner; no Paddle. **Abandoned** — server marks the session ABANDONED_MID_FLOW after 30 minutes of inactivity; recovery emails fire on Day 1, 3, 7, 14.

---

## §2 — The 9 phases — pixel-level spec for each

All phases share **global frame**:
- Background: `--color-paper-cream` (`#F7F2E8`) on Phases 1, 2, 5, 6, 7, 8. `--color-paper` (`#FFFFFF`) on Phases 0, 3, 4, 9 (the "ceremony pause" surfaces). Cream is forever-light; never dark-mode swap.
- Max-width content well: 720 px centered, 24 px outer padding on mobile.
- Top-left: Beamix wordmark + sigil 24 px tall, `--color-ink`. No href during `/start` flow.
- Top-right: 9-dot stepper, 6×6 dots, 6 px gap, `--color-ink-4` for upcoming, `--color-ink-2` for completed, `--color-brand` filled for active. Dots are NOT clickable.
- Right-of-stepper: `STEP N OF 9` in Geist Mono 12 px tnum, `--color-ink-3`.
- No persistent topbar, no sidebar. The ceremony is the page.
- Phase transition motion: 140 ms cross-fade (opacity 0↔1, ease-out) — except Phase 1→2 (1100 ms ribbon-reveal) and Phase 6 Seal stamping (540 ms total ceremony).
- Audio: silent across all phases. No clicks, no chimes.
- Reduced-motion: every motion below has a designed static state surfaced when `prefers-reduced-motion: reduce`.

---

### Phase 0 — `enter-url`

**URL:** `/start?phase=enter-url` (or just `/start` with no params; the router defaults to Phase 0).
**State carried:** none yet — this is the entry point for direct-signup users without a scan_id. URL params: empty. sessionStorage: empty. DB state: anonymous (no row yet).

**Layout:** white paper background (`--color-paper`), 720 px well centered. 120 px top breath on desktop, 48 px on mobile.

**Hero element:**
- H1, 32 px InterDisplay 500, `--color-ink`, single line: **"Show me what AI search sees."**
- 16 px Inter 400, `--color-ink-3`, max-width 480 px, 16 px gap below H1: *"Drop in your domain. We'll scan ChatGPT, Gemini, Claude, and Perplexity, and tell you what they say about you."*
- 48 px gap to form.

**Body:**
- Single text input, 56 px tall, 16 px Inter 400, 12 px horizontal pad, `--color-border-strong` outline, 8 px radius, white background.
- Inline left icon: 16 px globe glyph, `--color-ink-4`.
- Placeholder: `acme-plumbing.com`.
- Right-aligned helper: 13 px Geist Mono `--color-ink-4`: `https:// added automatically`.
- Below input, 24 px gap: `[ Continue ]` primary button — 56 px tall, 240 px wide, `--color-brand` (`#3370FF`), white text, 16 px Inter 500, 12 px radius. Disabled until input is a parseable URL with a TLD.

**CTAs:**
- Primary: "Continue" → submits to `POST /api/scan/start` (anonymous) → mints a `scan_id` → routes to `/start?phase=scanning&scan_id=<id>`.
- Secondary: none.
- Escape hatch: top-left wordmark click is inert; users can navigate away via browser back, but the submission has not yet happened so no DB rows persist.

**Mobile (375 px):** content well becomes full-width minus 24 px gutters. Button stretches to fill width (calc(100% - 48px)). Top breath drops to 48 px. Input remains 56 px tall.

**Hebrew RTL:** input direction flips to RTL; right-aligned helper text flips to left-aligned. Globe glyph swaps to right side. URL string itself remains LTR (URLs are always LTR even in RTL contexts) — input has `dir="ltr"` on the field, `dir="rtl"` on the wrapper.

**Transition out:** 140 ms cross-fade to Phase 1 once the API responds with `{ scan_id }`. While the API is in flight (typically 200–600 ms), the button label swaps to a static "Starting…" with `--color-ink-3` text. No spinner — Beamix doesn't ding.

---

### Phase 1 — `scanning`

**URL:** `/start?phase=scanning&scan_id=abc123`
**State carried:** `scan_id` (URL). sessionStorage: `{ scanStartedAt: <ts>, fromPath: 'direct' | 'public-scan' }`. DB: `anonymous_scans` row exists with status=`running`.

**Layout:** cream paper (`--color-paper-cream`). 720 px well. 160 px top breath (slightly more breath than Phase 0 — the customer is now waiting and Beamix gives them physical room).

**Hero element:**
- H1, 28 px InterDisplay 500, `--color-ink`, single line: **"Scanning your domain across 4 AI engines."**
- 24 px gap below H1: rotating status sentence — 14 px Inter 400, `--color-ink-3`, single line, no pulse:
  - 0–15 s: *"Asking ChatGPT what it knows about you."*
  - 15–35 s: *"Cross-checking Gemini and Claude."*
  - 35–60 s: *"Reading Perplexity's citation graph."*
  - 60–90 s: *"Composing your readout."*
- The sentence cross-fades 280 ms ease-out between updates. Reduced-motion: no fade, instant swap.

**Body:**
- **Agent monogram cycle.** A horizontal strip of 8 monogram tiles (32×32 px each, 16 px gap), centered, 80 px below the status sentence. Each tile renders the agent's mark on cream paper at 70% opacity. Monograms fade in sequentially at 200 ms intervals (first paint), then idle. Order: Schema Doctor → Citation Fixer → FAQ Agent → Competitor Watch → Trust File Auditor → Reporter → Coverage Mapper → Voice Auditor. Each is rendered as a Rough.js mark (hand-drawn sigil) at 16×16 inside the tile.
- Below the strip, 64 px gap: a single line of 11 px Geist Mono tnum, `--color-ink-4`: `SCAN_ID · abc123 · 0:42 ELAPSED`.

**CTAs:** none. The phase is non-interactive. The wordmark at top-left is still inert.
**Escape hatch:** browser back exits. Server-side, the scan continues running for 24 h and can be resumed via `/scan/abc123` permalink.

**Mobile (375 px):** monogram strip becomes 4×2 grid (32 px tiles, 12 px gap). Status sentence and ID line remain centered. Top breath drops to 80 px.

**Hebrew RTL:** layout mirrors. Agent names render in Hebrew transliteration where translations exist; sigils are direction-agnostic.

**Transition out:** when the API emits `scan-complete` via Inngest webhook (or polling fallback every 2 s on `/api/scan/status?scan_id=abc123`), Phase 1 transitions to Phase 2 with the **Phase 1→2 ribbon-reveal**: 1100 ms total. Sequence: (a) 0–200 ms agent strip fades to 0 opacity, (b) 200–500 ms the status H1 morphs to the Phase 2 H1 via height-animated text swap, (c) 500–1100 ms the cartogram and findings fade up from below (translateY 12 px → 0, opacity 0 → 1, ease-out). Reduced-motion: instant swap with both phases composed.

---

### Phase 2 — `results`

**URL:** `/start?phase=results&scan_id=abc123`
**State carried:** `scan_id` (URL). sessionStorage: full scan results blob hydrated from `GET /api/scan/result?scan_id=abc123` (cached). DB: `anonymous_scans.status='completed'`, `anonymous_scans.results_json` populated.

**Layout:** cream paper. Well widens to 880 px on desktop to fit the cartogram. Mobile remains 100% minus gutters.

**Hero element:**
- H1, 32 px InterDisplay 500, `--color-ink`, two-line max: **"Here's what AI search sees about [acme-plumbing.com]."** (domain rendered in Geist Mono 28 px tnum, inline).
- 16 px Inter 400 `--color-ink-3` subheadline below: *"Across 4 engines, 12 prompts, 47 sources."*

**Body:**
- **Cartogram** (the citation map): 720 px wide × 360 px tall on desktop, full-width × 280 px on mobile. Renders nodes for engines (4 large) and citations (~12 medium). Nodes are cream-paper circles with 1 px `--color-border-strong` rings; the edge connecting customer's domain to each engine renders as a hand-drawn Rough.js stroke colored by sentiment (`--color-score-good` / `--color-score-fair` / `--color-score-critical`). Customer domain is the central node, 64 px diameter, 16 px Inter 500 label `--color-ink`.
- 64 px gap below cartogram.
- **Three findings** — three cream-paper cards in a row on desktop, stacked on mobile. Each card: 240 px wide × 160 px tall on desktop, 24 px padding, 1 px `--color-border` outline, 8 px radius. Card composition:
  - Top-left: 11 px Geist Mono caps tracking 0.10 em `--color-ink-4`: `FINDING 01` / `02` / `03`.
  - 13 px gap, then 18 px Fraunces 300, `--color-ink`, 3-line max: the finding sentence (e.g., *"ChatGPT thinks you serve commercial buildings; you're residential."*).
  - Bottom-left: 12 px Geist Mono `--color-ink-3`: `EVIDENCE → 3 citations`.
- 96 px gap, footer line (centered): 12 px Geist Mono `--color-ink-4`: `14-DAY MONEY-BACK · NO CREDIT CARD TO START`. (Per N-3, money-back surfaced before signup.)

**Signup overlay slide-up:** at **T+10 s** of Phase 2 mount, a sticky bottom sheet rises from `translateY(100%)` to `translateY(0)` over 380 ms ease-out, occupying the bottom 33% of the viewport on desktop, bottom 50% on mobile. Sheet background: `--color-paper` (white), 1 px top border `--color-border-strong`, 16 px top radius. Sheet contents are Phase 3 (`signup-overlay`) — see Phase 3.

The 10 s timer is **paused if the user scrolls** (giving them reading time) and resumes when they stop scrolling for 2 s. Hard ceiling at 60 s.

**CTAs (within the results body, not the overlay):**
- Primary (in cartogram footer): `[ Want our agents to fix this? ]` — pill button, 48 px tall, 280 px wide, `--color-brand`, white text, 15 px Inter 500. Clicking forces the signup overlay up immediately (skipping the 10 s wait).
- Secondary: `[ Email me the PDF ]` — ghost button, 13 px Inter `--color-ink-3`. Triggers Phase 3 in "PDF-only" sub-mode (see Phase 3).
- Escape hatch: `Esc` key dismisses the overlay and returns the user to scrollable results. They can re-trigger the overlay via the primary button.

**Mobile (375 px):** cartogram height drops to 280 px. Findings cards stack vertically with 16 px gap. Signup overlay rises to bottom 50%, hits a 90 vh ceiling.

**Hebrew RTL:** cartogram mirrors horizontally. Findings cards stack right-to-left. Sentence flow inside each card is RTL; Geist Mono captions stay LTR (technical-truth canon).

**Transition out:** click on signup overlay's primary CTA → 140 ms cross-fade to Phase 3, except the bottom sheet remains pinned and grows to occupy the full viewport (sheet expands `translateY(0)` → `translateY(0)` with height interpolation from 33% → 100% over 280 ms).

---

### Phase 3 — `signup-overlay`

**URL:** `/start?phase=signup-overlay&scan_id=abc123`
**State carried:** `scan_id` (URL). sessionStorage: scan results blob retained. DB: still anonymous.

**Layout:** the bottom sheet from Phase 2 has expanded to full viewport. Background switches to `--color-paper` (white). 480 px content well centered. 96 px top breath on desktop.

**Hero element:**
- H1, 28 px InterDisplay 500, `--color-ink`, single line: **"Sign up to keep this scan."**
- 16 px Inter 400 `--color-ink-3`, 16 px gap below, max-width 360 px: *"Free account. We'll save your scan, set up a Brief, and show you what we'd do. No credit card."*

**Body — primary auth (Q9 lock: Google OAuth primary):**
- 48 px gap below subheadline.
- **`[ Continue with Google ]`** — 56 px tall, full content-well width (480 px desktop, 100% mobile), white background, 1 px `--color-border-strong` outline, 8 px radius. Left-aligned 20 px Google G logo, then 16 px Inter 500 `--color-ink` label. Hover: background → `--color-paper-elev`. Click → `signInWithOAuth({ provider: 'google', options: { redirectTo: '/start?phase=signup-callback&scan_id=abc123' } })`.
- 24 px gap.
- **Secondary auth — email + password:**
  - 13 px Geist Mono caps tracking 0.10 em `--color-ink-4`: `OR USE EMAIL`.
  - 16 px gap, then a stacked form: email field (56 px tall) → 16 px gap → password field (56 px tall) → 24 px gap → `[ Create account ]` button (56 px tall, full width, `--color-brand`, white text). Form posts to `POST /api/auth/signup` (Supabase Auth) with magic-link disabled — password is required (Q9 fallback).

**Alternative (PDF-only mode):**
- If user reached Phase 3 via "Email me the PDF" secondary CTA, the form is replaced with a single email input + `[ Send me the PDF ]` button. Submitting fires `POST /api/scan/email-pdf?scan_id=abc123` and exits to a thank-you state in-place (no further phases). User receives a Resend nurture sequence.

**Footer (below auth options, 64 px gap):**
- 12 px Geist Mono `--color-ink-4`: `BY CONTINUING YOU AGREE TO TERMS · PRIVACY · DPA` — three inline ghost links, `--color-ink-3` on hover.
- 24 px gap, then a small "Save my results / Email me the PDF" tertiary link (13 px Inter `--color-ink-3` underline-on-hover) for users who don't want to sign up at all. Routes back to Phase 2 with overlay dismissed and a one-shot toast: *"We saved your scan at /scan/abc123 — bookmark it."*

**CTAs:** primary = Google OAuth. Secondary = email+password. Tertiary = PDF-only. Escape hatch: `Esc` dismisses sheet, returns to Phase 2 results.

**Mobile (375 px):** content well becomes 100% minus 24 px gutters. Google button stretches to full width. Email/password fields stretch.

**Hebrew RTL:** form labels flip; Google button label flips (Hebrew Google labels exist in the Google brand kit). Email input remains LTR-text-direction inside an RTL wrapper.

**Transition out:**
- Google OAuth: redirects to Google, then back to `/start?phase=signup-callback`. Server route exchanges the code for a session, mints a `users` row, sets `users.scan_id_at_signup = abc123`, links `anonymous_scans.converted_user_id = user_id`, then 302s to `/start?phase=vertical-confirm&scan_id=abc123`.
- Email + password: same data flow, no redirect — server route returns 200 and client transitions via 140 ms cross-fade.

**Q6 Adam-decision applied:** **Paddle does NOT appear here.** The user is now in `SIGNED_UP_FREE` state and proceeds straight to Phase 4 — no payment.

---

### Phase 4 — `vertical-confirm`

**URL:** `/start?phase=vertical-confirm&scan_id=abc123`
**State carried:** `scan_id` (URL). `user_id` (from Supabase session cookie). sessionStorage: scan results retained. DB: `users` row exists; `businesses` row will be created at end of phase.

**Layout:** white paper (`--color-paper`). 640 px well, 120 px top breath. This is current Step 1 from ONBOARDING-design-v1, kept intact except moved into the unified flow.

**Hero element:**
- H1, 32 px InterDisplay 500, `--color-ink`: **"Confirm your business."**
- 15 px Inter 400 `--color-ink-3`, 24 px below, max-width 480 px: *"We pulled this from your scan. Edit anything that's not right."*
- 48 px gap to body.

**Body — confidence-led pre-fill (per ONBOARDING-design-v1 §2.1):**
- A single horizontal panel, full content-well width, 1 px `--color-border` outline, 12 px radius, 24 px padding, white background.
- Top-left of panel: 11 px Geist Mono caps `--color-ink-4`: `INDUSTRY CLASSIFICATION`.
- Right-aligned: confidence chip — 24 px tall, 8 px horizontal pad, `--color-brand-soft` background, `--color-brand-text` text, 12 px Inter 500: `92% CONFIDENT`.
- Body: 22 px Fraunces 300 `--color-ink`: *"Local home services — Plumbing."* (italic hint not used here; Fraunces upright on form data.)
- Below: 13 px Inter `--color-ink-3`: *"Based on 14 signals from your site, schema, and citation graph."*
- Bottom: two ghost buttons inline — `[ Confirm ]` 48 px primary `--color-brand` (300 px wide) + `[ Change ]` 48 px ghost `--color-ink-3` 13 px Inter. Click `Change` → expands an inline combobox listing the 12 vertical knowledge graphs + "Other" → user picks → confidence chip dims to `RECLASSIFIED` and Confirm becomes the only CTA.

Below the panel, 32 px gap, three smaller fields (collapsed):
- Website (pre-filled from scan, read-only with `(edit)` ghost link)
- Business name (pre-filled, editable, 56 px tall input)
- Primary location (pre-filled or empty, editable, 56 px tall input)

These fields appear at 80 px below the industry panel. They are non-interactive on first paint; clicking `(edit)` on website expands the field for editing. The collapsed default is the fast-path; editing is the courtesy.

**CTAs:** primary `[ Continue ]` 56 px, 240 px wide, `--color-brand`, white text, anchored 96 px below the last form element. Disabled until industry confirmed and business name non-empty. Secondary: `← Back` ghost button, 13 px Inter `--color-ink-3`, returns to Phase 2 results.

**Mobile (375 px):** confidence panel stacks (industry above confidence chip). All inputs stretch to full width minus gutters.

**Hebrew RTL:** flips. Industry classification names appear in Hebrew where the KG has translations.

**Transition out:** server creates `businesses` row with `vertical`, `name`, `location`, `website`, `user_id`, `scan_id`. 140 ms cross-fade to Phase 5.

---

### Phase 5 — `brief-co-author`

**URL:** `/start?phase=brief-co-author&scan_id=abc123`
**State carried:** `scan_id`, `user_id`, `business_id`. sessionStorage: full scan blob + Three Claims pre-fill computed server-side at phase mount. DB: `briefs` row created with status=`draft` on phase mount.

**Layout:** **cream paper enters here** (`--color-paper-cream`). The customer feels the surface change. Well widens to 880 px (Brief needs more room than form steps). 96 px top breath on desktop.

**Hero element:**
- 11 px Geist Mono caps tracking 0.12 em `--color-ink-4`, centered, 32 px above H1: `THE BRIEF`.
- H1, 28 px InterDisplay 500, `--color-ink`, centered, max-width 720 px, 2-line max: **"What we believe Beamix should do for [Acme Plumbing]."**
- 16 px Inter 400 `--color-ink-3`, 16 px below: *"Read it. Edit any sentence. Sign when it's true."*

**Body — two-column on desktop, single-column on mobile:**

**Left column (480 px wide on desktop, full-width mobile)** — the Brief draft:
- Cream paper background (no card outline — the brief IS the page).
- Type: 18 px Fraunces 300, `--color-ink`, line-height 1.6, max-width 480 px.
- Composed of 6 paragraphs, each ~50–80 words. Paragraphs 2, 3, 4 are **the Three Claims** — pre-filled from scan data per Q3 lock. Each Three-Claim paragraph has a small 11 px Geist Mono caps marker at top-left: `CLAIM 01` / `02` / `03`. Within paragraphs, **specific phrases are rendered as chips** — 1.5 px underline `--color-border-strong`, click to edit inline. Edited chips show 1.5 px `--color-brand` underline.
- Example claim 1 (auto-composed): *"Acme Plumbing serves residential customers in Tel Aviv and Ramat Gan. Beamix should make sure ChatGPT, Gemini, Claude, and Perplexity all know this — currently only ChatGPT does."*
- Italic clauses (Fraunces 300 italic) used sparingly — once per paragraph max, on a hedge or condition: *"…where the citation graph supports it."*

**Right column (320 px wide, hidden on mobile, expandable via floating toggle)** — inline-citation grounding preview (per Q3 lock):
- 12 px Geist Mono caps tracking 0.10 em `--color-ink-4`, 24 px above first card: `GROUNDING`.
- 16 px gap, then a stack of small cream-paper cards (1 px `--color-border` outline, 12 px padding, 8 px radius). Each card corresponds to a chip in the left column. Card composition:
  - Top: chip text in 13 px Fraunces 300 `--color-ink-2`.
  - Middle: 11 px Geist Mono `--color-ink-4`: source URL truncated to 40 chars + " · seen 3× in scan."
  - Bottom: small `[ View source ]` ghost link, 11 px Geist Mono `--color-brand-text`.
- Cards re-order so the currently-focused chip's grounding is at top.

**CTAs:** primary `[ This is true — sign it ]` — 56 px tall, 320 px wide, `--color-brand`, white text, 16 px Inter 500, anchored 96 px below the brief body, centered horizontally on the well. Secondary: `← Back` ghost button.

Mobile mirrors with right column collapsed behind a `[ View grounding ]` ghost toggle that opens a bottom sheet.

**Hebrew RTL:** Fraunces is replaced inline by **Heebo 300 italic** for italic clauses (per Q2 lock). Body text in Hebrew uses Heebo 400. Right-column grounding flips to left of the brief on RTL layouts.

**Transition out:** click `[ This is true — sign it ]` → server saves brief draft (POST `/api/brief/draft` returns `brief_id`) → 140 ms cross-fade to Phase 6.

---

### Phase 6 — `brief-signing`

**URL:** `/start?phase=brief-signing&scan_id=abc123&brief_id=xyz789`
**State carried:** `scan_id`, `user_id`, `business_id`, `brief_id`. DB: `briefs.status='ready_to_sign'`.

**Layout:** cream paper. Same 880 px well as Phase 5, same top breath. The Brief from Phase 5 is **still rendered** — Phase 6 is composed atop Phase 5's body, not a fresh paint. Right-column grounding fades to 30% opacity. Left-column brief remains at full opacity.

**Hero element (replaces the Phase 5 H1):**
- A single line of 14 px Inter 400 `--color-ink-3`, centered, 16 px above the brief: *"Signed below by — Beamix."*

**Body — the Seal stamping ceremony (540 ms total):**

The customer arrives at Phase 6 with the brief body intact. At the bottom of the brief, a **signature region** appears: 720 px wide × 160 px tall, cream paper, no border. Within it:

- Bottom-left of region: 22 px Fraunces 300 italic, `--color-ink`, signature line: *"— Beamix"*. Renders at opacity 0 on Phase 6 mount.
- Center of region: the **Seal** — a 96×96 px hand-drawn Rough.js sigil mark. Renders at opacity 0 on mount.
- Bottom-right: 11 px Geist Mono tnum `--color-ink-3`: `SIGNED · 2026-05-04 · BRIEF v1`.

**The 540 ms ceremony** (per Round 1 motion lock + Arc's Hand v4):
- 0–120 ms: Seal opacity 0 → 0.3, scale 0.95 → 1.0, ease-out. The customer sees the seal "press in."
- 120–360 ms: Seal opacity 0.3 → 1.0, then a 1 px Rough.js stroke draws around the seal perimeter (stroke-dashoffset animation, ease-in-out).
- 360–420 ms: **Arc's Hand** — a single 1 px ink-1 dot (`--color-ink`) appears at the seal's center, lingers 60 ms. This is the "the hand was here" moment.
- 420–540 ms: signature line "— Beamix" fades from opacity 0 → 1, ease-out, with a 4 px translateY drift (translateY 4 → 0).

After 540 ms, the ceremony is complete and a `[ Continue ]` button appears 64 px below the signature region — 56 px tall, 240 px wide, `--color-brand`, white text. Below that, a ghost `[ Print the Brief ]` button, 13 px Inter `--color-ink-3` — opens a print-styled PDF version in a new tab. (No auto-dismiss timer per WCAG fix from ONBOARDING-AUDIT-SYNTHESIS.)

Footer line, centered, 32 px below buttons: 12 px Geist Mono `--color-ink-4` ghost link: `SECURITY & DPA →` (per Q5 lock).

**CTAs:** primary `[ Continue ]`. Secondary `[ Print the Brief ]`. No back button — once signed, signed.

**Mobile (375 px):** signature region scales to 100% minus gutters. Seal scales to 72×72 px. Ceremony durations remain identical.

**Hebrew RTL:** signature line flips ("Beamix —" with em-dash on right). Seal centered. Geist Mono date stays LTR.

**Reduced-motion:** the 540 ms ceremony is replaced by an instant static state — seal at full opacity, signature already in place, no Arc's Hand dot.

**Transition out:** click `[ Continue ]` → server marks `briefs.status='signed'`, mints a `brief_versions` v1 row, returns 200 → 140 ms cross-fade to Phase 7.

---

### Phase 7 — `truth-file`

**URL:** `/start?phase=truth-file&scan_id=abc123&brief_id=xyz789`
**State carried:** all prior IDs. DB: `truth_files` row created with status=`draft` on phase mount.

**Layout:** cream paper. 720 px well. 96 px top breath. This is current Step 4 from ONBOARDING-design-v1, kept intact and moved into Phase 7 position.

**Hero element:**
- 11 px Geist Mono caps tracking 0.12 em `--color-ink-4`, centered: `THE TRUTH FILE`.
- H1, 28 px InterDisplay 500, `--color-ink`, centered, max-width 640 px: **"The facts Beamix will check before publishing anything."**
- 16 px Inter 400 `--color-ink-3`, 16 px below: *"This is the source of truth. Every claim, every paragraph, every email — checked against this."*

**Body — vertical-conditional fields per O-18:**

The fields rendered depend on `businesses.vertical` from Phase 4. The schema is the union of:

- **Universal fields** (always rendered): canonical business name, services list (chips, multi-add), pricing notes (textarea, 4-line min), key claims (3 chips, **pre-filled from Phase 5's Three Claims** — customer reviews + edits in place).
- **Local-services vertical fields** (Plumbing, HVAC, etc.): hours (7-day grid), service area (chip multi-select of cities/regions), license/insurance numbers (text fields).
- **B2B SaaS vertical fields** (per O-18): hours field is **hidden**. Replaced by integration list (chips), customer-tier list (chips), pricing-page-URL.
- **Ecommerce vertical fields**: SKU range, shipping notes, return policy URL.
- **Healthcare/legal/regulated fields**: compliance notes textarea, jurisdictions chip list.

Each field block is 1 px `--color-border` outlined, 12 px radius, 24 px padding, cream-paper inner background. Stacked vertically with 32 px gap between blocks.

**Three Claims block — pre-filled (per Q3, carried from Phase 5/6):**
- 11 px Geist Mono caps `--color-ink-4`: `THREE CLAIMS · CARRIED FROM YOUR BRIEF`.
- 3 chip-edit inputs, each 18 px Fraunces 300 `--color-ink`, click-to-edit inline.

**Footer:**
- 12 px Geist Mono `--color-ink-4` ghost link, centered, 64 px below last field: `SECURITY & DPA →` (per Q5).

**CTAs:** primary `[ Save and finish ]` 56 px, 240 px wide, `--color-brand`, white text. Secondary `← Back` ghost — returns to Phase 6 (the signed brief is still there for reference; truth file edits autosave).

**Mobile (375 px):** field blocks stretch to full width. 7-day hours grid becomes a stacked list of 7 rows on mobile.

**Hebrew RTL:** all chip lists flip. Hours grid weekdays render right-to-left (Sunday on the right). Numeric phone/license fields stay LTR within RTL wrappers.

**Transition out:** server saves truth file (POST `/api/truth-file/save`), marks `users.onboarding_completed_at = now()`, fires Inngest `onboarding-complete` event (kicks off first scan-deepening + Resend welcome email). 140 ms cross-fade to Phase 8.

---

### Phase 8 — `complete`

**URL:** `/start?phase=complete`
**State carried:** all prior IDs. DB: `users.onboarding_completed_at` set; `subscriptions` row exists with `tier=null` and `status='free_account'` (NOT trial — trial only starts on Paddle, per Q6 deferral).

**Layout:** cream paper. 720 px well. 160 px top breath (the most breath of any phase — this is the seal of completion).

**Hero element:**
- 11 px Geist Mono caps `--color-ink-4`, centered: `WELCOME`.
- H1, 36 px InterDisplay 500, `--color-ink`, centered, single line: **"Welcome to Beamix."**
- 18 px Fraunces 300 `--color-ink-2`, 24 px below, max-width 560 px, centered, italic clauses inline: *"Your Brief is signed. Your Truth File is filed. We're already scanning the rest of your domain — your /home will populate over the next few minutes."*

**Body:**
- A single cream-paper card, centered, 480 px wide × 160 px tall, 1 px `--color-border` outline, 12 px radius, 32 px padding.
- Card top-left: 11 px Geist Mono caps `--color-ink-4`: `WHAT'S NEXT`.
- 16 px gap, then 15 px Inter 400 `--color-ink`, three short lines:
  - *"1. Your /home will show your scan and our suggestions."*
  - *"2. Review what we'd do — no agents run until you say go."*
  - *"3. When you're ready, activate to start the work."*

**CTAs:**
- Primary `[ Take me to /home ]` — 56 px tall, 320 px wide, `--color-brand`, white text, 16 px Inter 500, centered, 96 px below the card.
- Secondary `[ Share this with my CTO ]` ghost button, 13 px Inter `--color-ink-3` underline-on-hover, 24 px below primary. Click opens a small modal with the customer's `/home/share/[token]` permalink (read-only logged-out view) + Mail/Slack quick-share buttons. (See §5.)

**Mobile (375 px):** card stretches to full width. Buttons stretch.

**Hebrew RTL:** flips. Italic clauses use Heebo 300 italic.

**Transition out:** click `[ Take me to /home ]` → 140 ms cross-fade out, then `router.push('/home')`. The user is now in `FREE_ACCOUNT_EXPLORING` state. **Paddle has not been triggered.** This is the Q6 deferral: free customer can show /home to boss/CTO before paying.

---

### Phase 9 — `paid-activation`

**Important:** Phase 9 is **NOT part of the `/start` flow itself**. It is the post-onboarding payment moment that fires when a free-account customer clicks "Activate agents" on `/home`. It is documented here because it completes the architectural picture.

**URL:** stays on `/home` — Phase 9 is a modal overlay, not a routed phase. No URL change. (Phaseparam optional: `/home?activate=true` to deep-link from emails.)
**State carried:** `user_id`, `business_id`, `brief_id`, `truth_file_id` (all from session). DB: `subscriptions.status='free_account'` is updated to `'active'` on success.

**Trigger:** customer on `/home` clicks the persistent `[ Activate agents ]` banner (top of page) or the inline `[ Activate ]` CTA on a sample /inbox item.

**Layout:** full-screen takeover modal on desktop and mobile. Background: a 60% opacity scrim over `/home` (`rgba(10, 10, 10, 0.60)`). Modal panel: 560 px wide × auto height, white (`--color-paper`), 16 px radius, 1 px `--color-border` outline, 32 px padding, centered vertically. Close X (24 px) top-right, `--color-ink-3`.

**Hero element:**
- H1, 24 px InterDisplay 500, `--color-ink`: **"Activate your agents."**
- 14 px Inter 400 `--color-ink-3`, 12 px below: *"Pick a tier. Cancel anytime. 14-day money-back on Discover and Build · 30-day on Scale."*

**Body — tier selection:**
- Three radio cards, stacked vertically with 8 px gap. Each card 100% wide × 80 px tall, 1 px `--color-border-strong` outline, 8 px radius, 16 px padding, white background. Selected card gets `--color-brand` 2 px outline + `--color-brand-soft` background.
  - **Discover** — `$79/mo` · *"Single domain · 5 agent runs/mo · 14-day money-back."*
  - **Build** (default selected) — `$189/mo` · *"3 domains · 25 runs/mo · 14-day money-back."*
  - **Scale** — `$499/mo` · *"Unlimited domains · 100 runs/mo · **30-day** money-back."*
- Each card: tier name in 16 px Inter 500 `--color-ink`, price in 18 px InterDisplay 500 `--color-ink` right-aligned, description in 13 px Inter `--color-ink-3` below.
- Annual toggle below cards (right-aligned): "Pay annually · save 20%" — 13 px Inter `--color-ink-3` with a 32×16 px brand-blue toggle.

**Paddle.js inline checkout:**
- 24 px gap below tier cards, then the Paddle inline iframe mounts. Container: full modal width × auto height (Paddle determines). Paddle config:
  ```js
  Paddle.Checkout.open({
    settings: { displayMode: 'inline', frameTarget: 'paddle-inline-mount', frameStyle: 'width:100%; min-height:480px; border:none;' },
    items: [{ priceId: <selected-tier-price-id>, quantity: 1 }],
    customer: { email: <user-email> },
    customData: { user_id, business_id, brief_id }
  });
  ```
- 14/14/30 money-back guarantee surfaced inline above the Paddle frame in 12 px Geist Mono `--color-ink-3`.

**Failure modes:**
- **Card declined:** Paddle renders error inline; modal stays open; customer can retry or pick a different tier. No DB change.
- **3DS challenge:** Paddle renders inline (no popup). Customer completes; modal stays open until success or abandonment.
- **Paddle outage:** if Paddle.js fails to load within 8 s, modal shows fallback: *"Checkout is having trouble. Try again or [email us]."* Email link is `support@beamixai.com`.
- **Customer abandons (closes modal):** state stays `FREE_ACCOUNT_EXPLORING`; banner on /home remains; can re-trigger anytime.

**Post-payment confirmation:**
- Paddle webhook fires → server marks `subscriptions.status='active'`, `subscriptions.paddle_subscription_id=<id>`, `subscriptions.tier=<tier>`, `subscriptions.trial_ends_at=now() + 14 days` (or 30 for Scale per Q8).
- Modal dismisses with a 280 ms fade-out + the /home top banner swaps from `[ Activate agents ]` to a one-shot toast: *"Activated. First agent run starts now."*
- /home reloads (`router.refresh()`) with paid state. First agent job is queued via Inngest.
- Activation event clock starts: per Q7, customer has **7 days post-Paddle-checkout** for first /inbox approval to count as "activated."

**Mobile (375 px):** modal becomes a bottom sheet rising to 90 vh. Paddle inline mounts inside the sheet. Tier cards stack identically.

**Hebrew RTL:** modal flips. Paddle frame supports RTL via locale config (`locale: 'he'`).

**Transition out:** success → `/home` paid state. Failure → modal stays. Abandonment → modal closes; user remains on /home free state.

---

## §3 — The state machine

The state machine has **14 named states**. Names are UPPERCASE_SNAKE_CASE in the Zustand store and in DB enum `user_lifecycle_state`.

### State diagram (text-based hierarchy)

- **ANONYMOUS** — entry state. No DB row. URL hits `/start` or `/scan` without session.
  - → `enter-url submit` triggers `POST /api/scan/start` → state becomes **SCANNING**.

- **SCANNING** — anonymous_scans row exists with status=`running`. URL: `/start?phase=scanning&scan_id=X`.
  - → Inngest `scan-complete` event → state becomes **SCAN_RESULTS_VIEWED**.
  - → User closes tab → state stays SCANNING server-side; results expire in 30 days.

- **SCAN_RESULTS_VIEWED** — anonymous_scans row complete. URL: `/start?phase=results&scan_id=X`.
  - → Signup overlay surfaced at T+10s OR primary CTA click → state becomes **SIGNUP_INITIATED**.
  - → User dismisses overlay, scrolls, exits → state stays SCAN_RESULTS_VIEWED; results saved at `/scan/X` permalink for 30 days.

- **SIGNUP_INITIATED** — signup overlay open. URL: `/start?phase=signup-overlay&scan_id=X`.
  - → Google OAuth or email+password success → users row created → state becomes **SIGNED_UP_FREE**.
  - → User picks PDF-only → terminal state **PDF_LEAD_NURTURE**, exits flow.
  - → User dismisses overlay → state reverts to SCAN_RESULTS_VIEWED.

- **SIGNED_UP_FREE** — users row exists; subscriptions.tier=null, status=`free_account`. URL: `/start?phase=vertical-confirm`.
  - → Phase 4–7 progression → state becomes **BRIEF_DRAFTING** (during Phase 5), **BRIEF_SIGNED** (after Phase 6), **ONBOARDING_COMPLETE** (after Phase 7), then **FREE_ACCOUNT_EXPLORING** (Phase 8 reached, /home rendered).

- **BRIEF_DRAFTING** — briefs row exists with status=`draft`. URL: `/start?phase=brief-co-author`.
  - → Sign click → state becomes **BRIEF_SIGNED**.
  - → User abandons mid-edit → state becomes **ABANDONED_MID_FLOW** after 30 min of inactivity. Brief draft persisted 30 days.

- **BRIEF_SIGNED** — briefs.status=`signed`. URL: `/start?phase=truth-file`.
  - → Truth file save → state becomes **ONBOARDING_COMPLETE**.

- **ONBOARDING_COMPLETE** — `users.onboarding_completed_at` set. Brief, truth file, business all exist. URL: `/start?phase=complete`.
  - → Click "Take me to /home" → state becomes **FREE_ACCOUNT_EXPLORING**.

- **FREE_ACCOUNT_EXPLORING** — customer on `/home` with free-account banner. May share with boss, return days later, etc.
  - → Click "Activate agents" → state becomes **PADDLE_INITIATED**.

- **PADDLE_INITIATED** — Paddle modal open on /home. Not yet paid.
  - → Paddle webhook success → state becomes **PAID_ACTIVE**.
  - → Modal closed without payment → state reverts to FREE_ACCOUNT_EXPLORING.

- **PAID_ACTIVE** — subscriptions.status=`active`, trial_ends_at set. Activation event clock running (7 days, per Q7).
  - → First /inbox approval within 7 days → fires `activation_event` analytics row.
  - → Customer requests refund within 14/14/30 window → state becomes **REFUNDED**.
  - → Customer cancels post-window → state becomes **CANCELLED**.

- **ABANDONED_MID_FLOW** — server-marked when 30 min of inactivity in any of Phases 0–7. Stored: last phase reached, all draft data.
  - → Recovery email Day 1, 3, 7, 14 with `/start?token=<recovery>` → server validates token, hydrates Zustand store, resumes at last phase.
  - → After Day 30 of no return → state becomes **EXPIRED**, drafts purged.

- **REFUNDED** — subscriptions.status=`refunded`. Agents stopped. /home read-only. Per Q8: agent-run caps during refund window prevent abuse (Discover: max 2 runs in 14 days; Build: max 5; Scale: max 10 in 30 days).

- **CANCELLED** — subscriptions.status=`cancelled` post-trial. /home accessible read-only until period_end_at.

### Transition events

- **Button clicks:** primary CTAs on each phase trigger named transitions (see §2).
- **Time-based:** Phase 2 signup overlay surfaces at T+10 s. Phase 5/6/7 autosave-on-blur. Recovery emails fire at Day 1/3/7/14 post-abandonment.
- **Webhook-driven:** Paddle webhooks (subscription_created, payment_failed, refund_issued). Inngest events (scan-complete, agent-job-finished).
- **Recovery emails:** sent from `notify@notify.beamix.tech`, cream-paper editorial register, Fraunces 300 italic for one-line italic clauses, voice canon Model B.

### Recovery paths from ABANDONED_MID_FLOW

- **Day 1:** subject *"Your scan is still here."* CTA: `[ Pick up where you left off ]` → resumes phase.
- **Day 3:** subject *"What we found about [domain]."* — embeds top finding as PDF preview. CTA: `[ Read the rest ]`.
- **Day 7:** subject *"Beamix's brief, in case you want it."* — attaches the (unsigned) Brief draft as PDF. CTA: `[ Sign it ]`.
- **Day 14:** subject *"Last note from us."* — graceful close, drafts purged 16 days later.

### Side branch: claim-this-scan from public permalink

- Sarah tweets `/scan/abc123`. Boss visits `/scan/abc123` (public anonymous view).
- Boss sees scan summary + a `[ Claim this scan ]` CTA — pill button, 48 px tall, `--color-brand`.
- Click routes to `/start?phase=results&scan_id=abc123`. Server checks: if scan_id is anonymous (no converted_user_id), proceed to Phase 2. If already converted, route to `/start?phase=enter-url` with toast: *"That scan is taken. Run your own."*
- This is the viral acquisition moment from validation gate #5 (§10).

---

## §4 — Data carry-over contract

For each transition between phases, this is what MUST persist:

### Database tables touched

| Phase | Tables read | Tables written |
|---|---|---|
| 0 → 1 | none | `anonymous_scans` (insert) |
| 1 → 2 | `anonymous_scans` (poll) | `anonymous_scans` (update status, results_json) |
| 2 → 3 | `anonymous_scans` | none until signup |
| 3 → 4 | `anonymous_scans` | `users` (insert via Supabase Auth), `anonymous_scans.converted_user_id` set |
| 4 → 5 | `users`, `anonymous_scans` | `businesses` (insert) |
| 5 → 6 | `businesses`, `anonymous_scans` | `briefs` (insert with status=draft), `brief_versions` (draft v0) |
| 6 → 7 | `briefs` | `briefs.status='signed'`, `brief_versions` v1 |
| 7 → 8 | `briefs`, `businesses` | `truth_files` (insert), `users.onboarding_completed_at` set |
| 8 → /home | all of the above | `subscriptions` row (status='free_account', tier=null) created if not exists |
| 9 (post-/home) | `users`, `subscriptions` | `subscriptions` (update tier, status='active', paddle_subscription_id, trial_ends_at) |

### URL params

- `phase` — required after Phase 0; named state machine state.
- `scan_id` — UUID-v7 minted at Phase 0 → 1. Carries through Phases 1–7. Removed from URL at Phase 8 (no longer needed; the scan is bound to the user).
- `brief_id` — minted at Phase 5; surfaces in URL only at Phase 6, 7 (debug aid).
- `token` — recovery token for ABANDONED_MID_FLOW resumption. JWT signed by server, 14-day expiry.

### sessionStorage keys

- `beamix.start.phaseStore` — Zustand persisted slice. Holds `{ phase, scan_id, business_id, brief_id, truth_file_id, isResuming, lastActivityAt }`. Hydrated on every phase mount.
- `beamix.start.scanResultsCache` — full scan results blob (≤200 KB). Avoids re-fetching when bouncing between Phase 2 ↔ Phase 3.
- `beamix.start.briefDraft` — debounced draft of the brief body (every 800 ms during Phase 5 edits). Server-synced via `POST /api/brief/draft`; sessionStorage is the optimistic cache.
- `beamix.start.truthFileDraft` — same pattern for Phase 7.

All sessionStorage keys are scoped under `beamix.start.*` and cleared on `users.onboarding_completed_at` set.

### localStorage keys

- `beamix.recentDomain` — last domain entered in Phase 0 (90-day TTL). Pre-fills the field on subsequent direct visits.
- `beamix.preferredAuth` — `'google' | 'email'`. Set on first successful auth; biases Phase 3 ordering on subsequent signups (only relevant for users who churn and re-onboard).
- `beamix.locale` — `'en' | 'he'`. Detected from browser, overridable.

### Cookie usage

- `sb-access-token`, `sb-refresh-token` — Supabase Auth (httpOnly, Secure, SameSite=Lax). Set at Phase 3 success.
- `paddle.session` — Paddle.js session cookie (set during Phase 9 modal mount).
- No third-party tracking cookies during Phases 0–8 (anonymous scan must work without consent).

### Specific data flows

- **`scan_id` from anonymous → Brief authoring:** at Phase 5 mount, server fetches `anonymous_scans.results_json` via `scan_id` (still in URL) and runs the Three-Claims pre-fill composer (Claude Sonnet, system prompt: "compose 3 short claims from this scan"). Result is cached in `briefs.draft_body`. The customer sees pre-filled claims as soon as Phase 5 paints. **This is the Q3 lock realised.**
- **`user_id` created at Phase 3:** Supabase Auth callback inserts the row. Client receives session via cookie. From Phase 4 onward, all API calls authenticated via Supabase JWT.
- **`paddle_subscription_id` created at Phase 9:** Paddle webhook is the source of truth. Client never inserts the subscription row directly.
- **Abandonment at Phase 5 — Brief draft persistence:** the brief draft autosaves to `briefs.draft_body` every 800 ms (server-side, debounced). Persists for **30 days**. After 30 days, the draft is purged but the `users` row, `businesses` row, `anonymous_scans` row remain. Recovery email at Day 14 attaches the draft as PDF before purge.

---

## §5 — The "share with boss" flow

This is the new flow from Adam's 2026-05-04 insight. Most users will not pay on first visit — they will want to share with boss/CTO before committing. Phase 8 ends with a free account; the customer has /home with real scan data + sample /inbox items but cannot run agents.

### Two share targets — two different audiences

The customer has **two shareable surfaces** at Phase 8 / on /home:

1. **Public scan permalink** (`/scan/[scan_id]`) — anonymous-public, viewable by anyone with the URL. Renders the cartogram + 3 findings + the OG share card. **No login wall.** This is what the customer shares to social, Slack channels, broad audiences. Shareback metric: viewers + click-through to "Claim this scan" CTA.

2. **/home permalink with read-only token** (`/home/share/[token]`) — purpose-built for "show my CTO." Renders /home in a logged-out, read-only mode. Shows: the customer's score, the scan summary, the **Brief** (signed, read-only), the truth file (redacted: hours, services visible; license/insurance numbers hidden), and **3 sample /inbox items** annotated with what Beamix would do. CTA at top of share view: `[ Activate this account ]` → routes to a magic-link sign-in for the original customer (returns them to /home as a logged-in free user, ready to upgrade).

The Phase 8 secondary CTA `[ Share this with my CTO ]` opens a small modal with both options:
- *"Show them the public scan"* → copies `/scan/[scan_id]` to clipboard.
- *"Show them everything we'd do for you"* → copies `/home/share/[token]` to clipboard.
- Quick-share buttons: Mail, Slack, WhatsApp.

### What the boss sees on `/home/share/[token]`

- Top banner: 32 px tall cream-paper strip, 14 px Inter `--color-ink-2`: *"This is what Beamix would do for [Acme Plumbing]. [Adam] is reviewing."*
- Below: the full /home layout in read-only — score Ring, evidence cards, Crew at Work strip — but every CTA is replaced with a `[ Locked — ask Adam ]` ghost label.
- Bottom: a single sticky 72 px tall cream-paper card, full width: *"Like what you see? [ Tell Adam to activate ]"* — that button mailtos the original customer's email or copies a "tell them" link.

### "Come back later" recovery emails

Sent from `notify@notify.beamix.tech`. Cream-paper editorial register (HTML + cream gradient header strip 32 px tall using `--color-paper-cream`). Fraunces 300 italic for one-clause italic moments. Heebo for Hebrew. Voice canon Model B (signed "— Beamix").

- **Day 3:** subject: *"What your CTO needs to see."* Body: 80-word note explaining what /home/share shows; embedded link.
- **Day 7:** subject: *"3 things we'd ship in week 1."* Body: list of 3 specific findings + sample drafts; CTA: `[ Activate ]`.
- **Day 14:** subject: *"State of [domain]."* Body: a refreshed mini-scan showing how rankings have moved since Day 0 (free re-scan); CTA: `[ Pick a tier ]`.

All emails use Inter for body, Geist Mono for technical inline tokens (the scan_id, the date), Fraunces only for one-italic-clause emphasis.

### "I'm ready to activate" CTA placement on /home

**Both** subtle banner AND persistent button — they serve different moments:

- **Top banner (subtle, dismissable):** 48 px tall, full width, `--color-paper-cream` background, 14 px Inter 500 `--color-ink`: *"Free account · Activate to start running agents."* `[ Activate ]` 32 px ghost button right-aligned, `--color-brand-text`. Dismissable for 7 days via X (24 px).
- **Persistent inline button:** every sample /inbox item has an inline `[ Activate to run ]` chip — 28 px tall, 8 px horizontal pad, `--color-brand-soft` background, `--color-brand-text` text, 12 px Inter 500. Clicking triggers Phase 9 directly with the relevant agent pre-selected.

The reasoning: banners catch the deliberate "I'm ready" moment; inline chips catch the "this specific finding is good — let me run that one" moment.

---

## §6 — Paddle inline integration spec (Phase 9)

(Detailed layout spec'd in §2 Phase 9; this section covers the integration contract.)

### When triggered

- Customer in `FREE_ACCOUNT_EXPLORING` state on `/home` clicks the persistent `[ Activate agents ]` banner OR an inline `[ Activate to run ]` chip on a sample /inbox item.
- Magic link from Day-3/Day-7/Day-14 nurture emails routes to `/home?activate=true` which auto-opens the modal.

### Modal vs full-screen

- **Desktop (≥768 px):** full-screen scrim modal, 560 px panel centered. The user remains contextually on /home (scrim shows it dimmed beneath).
- **Mobile (<768 px):** bottom sheet rising to 90 vh. Sheet drag-to-dismiss is **disabled** during Paddle iframe interaction (preventing accidental dismissals during 3DS).

### Tier selection

- Defaults to **Build** ($189) — Adam's middle-tier strategy. Customer can switch to Discover ($79) or Scale ($499).
- Annual toggle — saves 20% (Discover $63/mo, Build $151/mo, Scale $399/mo).
- 14/14/30 money-back guarantee surfaced inline above Paddle frame in 12 px Geist Mono.

### Paddle.js inline checkout

- Loaded via `<Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="lazyOnload" />` on `/home` (not on `/start` — keep `/start` bundle small).
- `Paddle.Setup({ token: <client-token>, environment: 'sandbox' | 'production' })` runs once on /home mount.
- `Paddle.Checkout.open(...)` triggered on tier-card click.
- Inline mode (NOT redirect) — the iframe mounts inside `<div id="paddle-inline-mount">` inside the modal.

### Post-payment confirmation

- Paddle webhook `subscription_created` → server sets `subscriptions.tier`, `status='active'`, `trial_ends_at=now() + 14 days` (or 30 for Scale per Q8), `paddle_subscription_id`.
- Inngest `paddle-subscription-created` event fires:
  - Schedules first agent run (typically Schema Doctor or Citation Fixer based on top finding).
  - Sends Resend "activation" email (cream paper, Fraunces clauses).
  - Starts the Q7 7-day activation event clock.
- Modal dismisses with 280 ms fade-out.
- /home `router.refresh()` — banner swaps from `[ Activate agents ]` to a one-shot toast: *"Activated. First agent run starts now."* Toast auto-dismisses at 4 s.

### Failure modes

- **Card declined:** Paddle renders inline error in the iframe; modal stays open. No DB change. Customer can edit card or pick a different tier.
- **3DS challenge:** Paddle renders 3DS iframe within the same modal (no popup). Customer completes; on success, Paddle webhook fires and modal dismisses normally.
- **Paddle.js fails to load (8 s timeout):** modal renders fallback panel: *"Checkout is having trouble. Try again or email support@beamixai.com."* User can retry without losing tier selection.
- **Paddle webhook fails:** Inngest retry logic picks up. Customer sees /home in `PADDLE_INITIATED` state for up to 5 min while Inngest retries; if still failed after 5 min, support is paged via PagerDuty.

---

## §7 — Mobile-first considerations

### 375 px viewport per phase

- Phase 0 `enter-url` — input stretches full width; button stretches. Top breath 48 px.
- Phase 1 `scanning` — agent monogram strip becomes 4×2 grid (32 px tiles, 12 px gap). Status line stays single-line; cross-fade durations preserved.
- Phase 2 `results` — cartogram height drops to 280 px. Findings cards stack vertically. Signup overlay rises to bottom 50% of viewport (≤90 vh ceiling).
- Phase 3 `signup-overlay` — bottom sheet expands to full-height. Google button stretches.
- Phase 4 `vertical-confirm` — confidence panel stacks (industry above chip).
- Phase 5 `brief-co-author` — single column. Right-column grounding cards collapse behind a `[ View grounding ]` ghost toggle that opens a bottom sheet covering bottom 60% of viewport.
- Phase 6 `brief-signing` — Seal scales to 72×72 px. Ceremony durations identical.
- Phase 7 `truth-file` — field blocks stretch. Hours grid becomes a stacked list of 7 rows.
- Phase 8 `complete` — card stretches; buttons stretch.
- Phase 9 `paid-activation` — bottom sheet pattern (90 vh).

### One-handed thumb reach

Primary CTAs on every phase are anchored within bottom 50% of the viewport (within a thumb's reach when the device is held one-handed). On scroll-heavy phases (Phase 2 results, Phase 5 brief), CTAs are sticky-bottom on mobile only — not on desktop.

### Bottom-sheet vs modal patterns

- Bottom sheets: Phase 2 signup overlay, Phase 5 grounding panel, Phase 9 Paddle modal.
- Full-screen modals: none — the cream-paper register makes full-screen-modal patterns feel hostile. Bottom sheets are the universal mobile pattern.
- Sheet dismissal: drag handle (4 px tall × 32 px wide bar at top of sheet) + tap-outside on scrim. Drag-to-dismiss DISABLED during Phase 9 Paddle iframe interaction (3DS protection).

### Keyboard avoidance during Brief authoring

- On mobile Phase 5, when a chip-edit input gains focus, the page uses `visualViewport.height` to scroll the focused chip into the visible region above the keyboard. Implementation: `window.visualViewport.addEventListener('resize', () => focusedChip?.scrollIntoView({ block: 'center', behavior: 'smooth' }))`.
- Right-column grounding bottom sheet auto-collapses when keyboard appears.

### Paddle mobile inline support

- Paddle Inline supports mobile Safari, Chrome Android, Samsung Internet (per Paddle docs as of 2026-05).
- Validation gate #2 (§10) requires explicit cross-browser test pass before merging.
- Fallback: if Paddle Inline fails on a specific browser, Paddle Overlay (popup) is the fallback — but this breaks the cream-paper continuity. Acceptable as a safety net only.

### Hebrew RTL on mobile

- Same direction flips as desktop. Drag handle on sheets remains horizontally centered (direction-agnostic).
- Hebrew keyboard display causes a minor visualViewport shift that's handled identically to English keyboard display.

---

## §8 — Accessibility canon

### WCAG 2.1 AA per phase

- All text contrast ratios verified: `--color-ink` on `--color-paper` = 19.5:1; `--color-ink` on `--color-paper-cream` = 16.8:1; `--color-ink-3` (`#6B7280`) on `--color-paper-cream` = 4.6:1 (passes AA for body text). Brand blue text uses `--color-brand-text` (`#2558E5`) which passes AA on white (4.7:1).
- All interactive elements ≥44 px tap targets on mobile (56 px primary buttons, 48 px secondary, 24 px close-X minimum exception with 8 px expanded hit area).
- All form fields have associated `<label>` elements (visually rendered as 11 px Geist Mono caps; programmatically associated via `htmlFor`).
- Form validation errors are announced via `aria-live="polite"` regions inline below the field.

### Keyboard navigation

- **Tab order:** logical, top-to-bottom on every phase.
- **Phase 2 signup overlay:** when overlay rises, focus moves to the first interactive element (Google button) via `useEffect(() => firstButtonRef.current?.focus(), [])`. `Esc` dismisses the overlay and returns focus to the primary CTA on the results body.
- **Phase 5 brief-co-author:** chips are `<button>` elements with `aria-pressed` indicating edit state. Arrow keys navigate between chips when the chip-edit affordance is focused.
- **Phase 6 seal ceremony:** non-interactive during the 540 ms ceremony. Keyboard focus moves to the `[ Continue ]` button when it appears.
- **Phase 9 Paddle modal:** focus trap inside modal. Tab cycles through tier cards and then into the Paddle iframe. Escape closes the modal and returns focus to the trigger button on /home.

### Screen reader announcements

Each phase transition fires an `aria-live="polite"` announcement to a hidden `<div role="status">` element:

- Phase 0 → 1: "Scanning your domain. This will take 30 to 90 seconds."
- Phase 1 → 2: "Scan complete. 3 findings ready to review."
- Phase 2 → 3: "Sign-up form open."
- Phase 3 → 4: "Signed up. Confirming your business."
- Phase 4 → 5: "Brief drafted. Reading mode."
- Phase 5 → 6: "Brief ready to sign."
- Phase 6 → 7: "Brief signed. Truth file open."
- Phase 7 → 8: "Truth file saved. Welcome to Beamix."

Within Phase 1, the rotating status sentence is announced on each update via the same aria-live region (paced 15 s between announcements to avoid overwhelm).

### prefers-reduced-motion

- Phase 1 → 2 ribbon-reveal: replaced by instant swap.
- Phase 2 signup overlay rise: replaced by instant present (sheet appears at final position).
- Phase 6 Seal stamping: instant final state — Seal at full opacity, signature in place, no Arc's Hand dot, no stroke draw.
- All cross-phase 140 ms cross-fades: replaced by instant swap.
- Cartogram Rough.js strokes: rendered statically (no draw-on animation).

### Focus management on phase change

When a phase mounts, focus is moved to the phase's primary heading (`<h1>`) via `headingRef.current?.focus()` with `tabindex="-1"` to make the heading focusable. After 100 ms, focus auto-moves to the first interactive element (input, button) for users who want to start interacting immediately.

---

## §9 — Implementation outline

### Tech stack

- **Framework:** Next.js 16 App Router (RSC where possible; client components for the state machine itself).
- **React:** 19 (Suspense, Actions API for form mutations).
- **TypeScript:** strict mode, no `any`.
- **Styling:** Tailwind CSS with design tokens from DESIGN-SYSTEM-v1 wired via `tailwind.config.ts` `extend.colors` etc.
- **Auth:** Supabase Auth (Google OAuth + email/password). SSR cookie sync via `@supabase/ssr`.
- **Payments:** Paddle.js v2 (Inline mode).
- **Background jobs:** Inngest for scan execution + post-onboarding agent runs.
- **State:** Zustand v5 with `persist` middleware writing to sessionStorage.
- **Validation:** Zod schemas for every form payload.

### File structure

```
apps/web/src/
├── app/
│   ├── start/
│   │   ├── page.tsx              # the unified route — reads ?phase from useSearchParams
│   │   ├── layout.tsx            # cream-paper layout shell, top wordmark + stepper
│   │   └── loading.tsx           # cream skeleton
│   └── scan/
│       ├── page.tsx              # public anonymous /scan tool (entry from Phase 0)
│       └── [scan_id]/
│           └── page.tsx          # public permalink with "Claim this scan" CTA
├── components/
│   └── start/
│       ├── PhaseEnterUrl.tsx
│       ├── PhaseScanning.tsx
│       ├── PhaseResults.tsx
│       ├── SignupOverlay.tsx     # Phase 3, mounts as bottom sheet on Phase 2
│       ├── PhaseVerticalConfirm.tsx
│       ├── PhaseBriefCoAuthor.tsx
│       ├── PhaseBriefSigning.tsx # uses SealStamp component
│       ├── PhaseTruthFile.tsx
│       ├── PhaseComplete.tsx
│       ├── PaddleInlineModal.tsx # Phase 9, lives at /home not /start
│       ├── shared/
│       │   ├── PhaseStepper.tsx
│       │   ├── PhaseTransition.tsx  # 140ms cross-fade wrapper
│       │   ├── SealStamp.tsx
│       │   └── Cartogram.tsx
├── lib/
│   ├── store/
│   │   └── start-store.ts        # Zustand + sessionStorage persist
│   ├── api/
│   │   └── start.ts              # typed fetch wrappers for /api/scan/*, /api/brief/*, etc.
│   └── auth/
│       └── start-auth.ts         # Supabase auth helpers scoped to /start
└── styles/
    └── start.css                 # cream paper paint, Fraunces font-feature-settings
```

### State management

- **Zustand store** at `lib/store/start-store.ts`:
  ```ts
  type StartState = {
    phase: Phase;
    scan_id?: string;
    user_id?: string;
    business_id?: string;
    brief_id?: string;
    truth_file_id?: string;
    isResuming: boolean;
    lastActivityAt: number;
    setPhase: (p: Phase) => void;
    hydrate: (data: Partial<StartState>) => void;
    clear: () => void;
  };
  ```
- Persisted to sessionStorage under `beamix.start.phaseStore`.
- Hydrated on page mount via Zustand `persist` middleware.
- URL params (`?phase`, `?scan_id`) take precedence over sessionStorage on cold load (allows recovery email links to override stale session state).

### URL state

- `useSearchParams()` reads phase + scan_id.
- `useRouter().replace(...)` updates the URL on phase transitions (replace, not push — back-button-friendly: pressing back exits `/start` rather than walking back through phases).
- For Phase 6 → 7 specifically, the URL gets `&brief_id=...` appended for debug/observability. Browser back from Phase 7 → Phase 6 is allowed (signed brief is read-only at that point).

### Component breakdown (12 components)

1. **PhaseEnterUrl** — single-input form.
2. **PhaseScanning** — agent monogram cycle + rotating status sentence + 90 s timeout fallback (if scan stalls, show *"Taking longer than usual — we'll email you when ready"* + email capture).
3. **PhaseResults** — Cartogram + 3 finding cards + signup overlay trigger.
4. **SignupOverlay** — Google OAuth + email/password + PDF-only fallback.
5. **PhaseVerticalConfirm** — confidence panel + form fields.
6. **PhaseBriefCoAuthor** — two-column brief + grounding preview + chip-edit affordances.
7. **PhaseBriefSigning** — composed atop PhaseBriefCoAuthor's body + SealStamp ceremony.
8. **PhaseTruthFile** — vertical-conditional fields + Three Claims chip-edit.
9. **PhaseComplete** — welcome card + take-me-to-home CTA + share-with-cto modal.
10. **PaddleInlineModal** — Paddle inline checkout, lives at /home.
11. **PhaseStepper** — top-right 9-dot indicator.
12. **PhaseTransition** — 140 ms cross-fade wrapper (uses Framer Motion `AnimatePresence`).

### Existing components to reuse

- **Cartogram** — already specced in PRD-wedge-launch-v4 F1 for /scan public surface; reused as-is in Phase 2.
- **SealStamp** — specced in ONBOARDING-design-v1 §2.3; Phase 6 reuses with Arc's Hand v4 enhancement.
- **ScanResultsCard** — the 3 finding cards from /scan; reused.
- **BriefAuthor** — chip-edit affordances from ONBOARDING-design-v1 §2.3 Brief authoring; reused in Phase 5.

---

## §10 — Validation gates before merging

Per FLOW-ARCHITECTURE-SYNTHESIS validation list:

### Pre-build validations (5 gates, all must pass before merging /start to main)

1. **5-customer guerrilla test of A vs E mocks** — show 5 prospective customers (mix of Marcus / Yossi / Aria personas) both flows; measure: which converts higher, where drop-off occurs, qualitative voice notes. Cost: ~$100 incentives. Run before final tier-card pricing copy locks.

2. **Paddle Inline browser compat test** — Paddle.Checkout.open inline mode must work on: Safari iOS 15+, Chrome Android 100+, Samsung Internet, Firefox Desktop, Safari Desktop, Chrome Desktop, Edge. Test with Paddle sandbox + real card (Visa, Mastercard, Amex). 3DS challenge must render inline on at least 2 mobile browsers.

3. **Yossi multi-domain path** — confirm a Yossi-persona user with an existing paid account can reach `/start` to onboard their 8th client domain. Expected: Phase 0 detects logged-in state, fast-paths to Phase 4 with the new domain, Brief authoring kicks off without re-collecting Yossi's auth/payment. (May require a Phase 0.5 "this is a new domain" branch — flag if needed.)

4. **Phase 1→2 motion spec verification** — pixel-precise QA of the 1100 ms ribbon-reveal across desktop + mobile. Frame-by-frame screenshot comparison against this spec. Vercel-grade craft bar — must hit.

5. **Claim-this-scan permalink test** — Sarah scans, tweets `/scan/abc123`. Visitor (anonymous, fresh browser) lands on `/scan/abc123`, clicks `[ Claim this scan ]`, lands on `/start?phase=results&scan_id=abc123` with full data hydrated and signup overlay appearing on schedule. Test edge: scan_id already converted by another user → graceful redirect to Phase 0 with toast.

### Playwright E2E tests required

- **Happy path:** anonymous-fresh → Phase 0 → 8 → /home (free state) → click Activate → Phase 9 → /home (paid state). Asserts on URL, DOM, and DB rows at each step.
- **Edge case 1:** Public-permalink claim. `/scan/[id]` → `/start?phase=results` → completes through Phase 8.
- **Edge case 2:** Abandonment + recovery. User reaches Phase 5, closes tab, recovery email at Day 1 resumes.
- **Edge case 3:** Paddle decline + retry. Phase 9 with declined card → error renders inline → customer retries with valid card → success.

### Speed CI gate (per T63)

- `/start` page boot ≤ **120 ms warm**, ≤ **500 ms cold** (Vercel edge cache hit / miss respectively).
- Initial JS bundle for `/start` route ≤ **180 KB** gzipped (Paddle.js NOT included — it loads on /home).
- Lighthouse Performance score ≥ 95 on `/start?phase=enter-url`.
- CLS = 0 on every phase mount (cream paper paints once; no late-loaded layout shifts).

### Pre-merge checklist

- [ ] All 5 pre-build validations passed.
- [ ] All 4 Playwright tests green.
- [ ] Speed CI gate green on at least 3 consecutive runs.
- [ ] Hebrew RTL screenshot diff approved by Dani-persona reviewer.
- [ ] WCAG AA audit clean (axe-core CLI run on every phase).
- [ ] Reduced-motion screenshots match designed static states.
- [ ] Voice canon Model B lint rule passes (no agent class names in customer-facing copy on Phases 0–8 except agent monogram alt-text on Phase 1).

---

## Closing note

This document is the canonical build spec for Adam's locked Option E architecture. Every pixel, every transition duration, every state-machine name is intentional. If a frontend developer reading this has a follow-up question, **the answer is in this document** — read again. If genuinely missing, the gap is a spec defect and must be raised to CEO before code lands.

Q1–Q13 are locked. Voice canon Model B is locked. Frame 5 v2 is locked. Pricing $79/$189/$499 with 14/14/30 money-back is locked. The activation event is locked at first /inbox approval within 7 days of Paddle checkout.

Build it.

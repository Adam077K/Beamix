# Beamix User-Flow Architecture — State Machine & Walkthrough
**Date:** 2026-05-04
**Author:** User-flow architect
**Predecessors:** PRD v4 (F1, F2, F37), Onboarding v1 + v1.1, /scans /competitors v1, Onboarding Audit Synthesis 2026-05-04
**Status:** Architectural input — one of three parallel inputs to the next-session decision on free-scan ↔ onboarding integration.

---

## §0. Why this exists

Adam's strategic question: *"Is the onboarding process the right approach? The free scan is one of the main customer funnels — they enter a URL, get scanned, see results. Is onboarding separate from the scan, or the same flow, or does onboarding start AFTER the scan?"*

The current spec answers this question one way (Option A: scan and onboarding are separate, joined by a `?scan_id=` parameter at signup). This document maps every entry path, every transition, every hand-off, and pressure-tests that answer against three alternatives. The output is not a redesign — it is the architectural analysis that lets the next session pick a direction with clear eyes.

The Brief is constitutional. The free scan is the demo. How those two ceremonies relate is the deepest UX decision in Beamix.

---

## §1. All entry paths

Below: 12 distinct ways a user can enter Beamix. For each — trigger, first surface, what they see, possible transitions, drop-off risk.

### 1. **Direct URL: `beamixai.com/scan` — anonymous scan**
- **Trigger:** Twitter share, blog post, YC newsletter, "scan your site" CTA on Framer marketing.
- **First surface:** `/scan` public landing — single domain input field, cream paper, Fraunces accent, Seal motif.
- **What's shown:** "See how AI search engines see your site. Free, no signup." Sample scan permalink visible below the fold for proof.
- **Transitions out:** (a) enter URL → 15–17s animated reveal → scan results page; (b) bounce.
- **Drop-off risk:** ~30–40% bounce on landing if the value prop reads as another visibility-checker tool. The 17s scan animation is itself a conversion device.

### 2. **Direct URL: `beamixai.com` (Framer marketing root)**
- **Trigger:** branded search, referral from press, paid ads.
- **First surface:** Framer-built homepage. Hero, social proof, pricing, FAQ.
- **What's shown:** value prop, agent personality, scan CTA in hero + sticky.
- **Transitions out:** (a) "Scan my site" CTA → `/scan`; (b) "Pricing" → `/pricing`; (c) "Sign up" → `app.beamixai.com/signup`; (d) bounce.
- **Drop-off risk:** ~50–60% bounce normal for SaaS marketing root; the scan CTA is the highest-leverage out-link. This is also where Marcus *should* land and click "Scan my site."

### 3. **Direct URL: `app.beamixai.com/signup`**
- **Trigger:** referral with direct app link, customer's "share with a teammate" share, returning visitor who decided after a previous scan.
- **First surface:** Paddle-fronted signup form (email, password, plan selection).
- **What's shown:** plan picker (Discover $79 / Build $189 / Scale $499), 14-day money-back guarantee, "Already scanned? Sign in instead."
- **Transitions out:** (a) submit → Paddle checkout → onboarding Step 1; (b) "Sign in" → `/login`; (c) bounce.
- **Drop-off risk:** highest-friction entry — no scan-as-demo precedes the payment ask. Estimated 8–12% conversion vs ~25–35% for scan-then-signup.

### 4. **Direct URL: `app.beamixai.com/login`**
- **Trigger:** returning customer, magic-link from recovery email.
- **First surface:** Login form.
- **What's shown:** email + password, "Forgot password," magic-link option.
- **Transitions out:** (a) login → `/home` (if onboarding complete) or `/onboarding/[step]` (if mid-flow); (b) signup; (c) password reset.
- **Drop-off risk:** very low for active users; recovery email links should bypass into the right step.

### 5. **TechCrunch / press → marketing → scan (Marcus's canonical path)**
- **Trigger:** Marcus reads a press piece linking to `beamixai.com`.
- **First surface:** marketing root.
- **What's shown:** headline, scan CTA.
- **Transitions:** marketing → `/scan` → enter URL → scan running → scan results → "Fix this — start free" CTA → `/signup?scan_id=...` → Paddle → onboarding Step 1.
- **Drop-off risk:** ~10–15% drop between scan results and signup CTA; ~5% drop in Paddle checkout. By far the most-walked path; everything funnels here.

### 6. **Twitter share of someone else's scan permalink**
- **Trigger:** Marcus tweets "look at my Beamix scan." Aria's procurement deputy clicks.
- **First surface:** `beamixai.com/s/{scan_id}?k={key}` — public scan artifact, cream paper, full results, no chrome.
- **What's shown:** the scan results for *someone else's* domain, with footer CTA "Run your own scan →".
- **Transitions out:** (a) "Run your own scan" → `/scan` (clean state); (b) bounce; (c) Aria-flavored deputy clicks the small "How does Beamix protect customer data?" footer link → `/security` or `/trust`.
- **Drop-off risk:** very low conversion to scan-of-self (~3–5%) but high brand-awareness yield. The artifact is a marketing channel disguised as a result page.

### 7. **Search engine / AI search result for "AI search visibility"**
- **Trigger:** organic SEO or referral citation (the meta-loop — Beamix surfaces because of GEO).
- **First surface:** specific blog post, glossary entry, or `/scan` if SEO targets the tool.
- **What's shown:** content-led entry; CTA to scan.
- **Transitions:** content → `/scan` or marketing root → continues as path 5.
- **Drop-off risk:** content paths convert at half the rate of direct scan paths but compound over time.

### 8. **Existing customer invites teammate (F33 team seats, Build/Scale)**
- **Trigger:** Yossi adds Maya the analyst to his account; she gets an email invite.
- **First surface:** signed magic-link → `app.beamixai.com/invite/{token}` → set password → land on `/home` (Yossi's account).
- **What's shown:** Yossi's already-active dashboard; teammate is read-only or restricted by role.
- **Transitions out:** new user lands directly on `/home` with no onboarding (the account is already onboarded by the principal).
- **Drop-off risk:** very low; teammate is a captive user once Yossi commits.

### 9. **Yossi adds a 2nd–12th client domain (multi-tenant operator)**
- **Trigger:** authenticated Yossi clicks "+ Add client" in `/settings → Clients`.
- **First surface:** new-client modal asking for domain.
- **What's shown:** domain input + a vertical preview ("we'll classify this site automatically"); confirmation that this client gets its own Brief, Truth File, and Lead Attribution.
- **Transitions:** confirm → spawns a fresh per-domain onboarding flow scoped to the new client tenant. **Per the locked decision (Onboarding Audit O-1 + Adam Q1):** no agency batch mode at MVP — every client walks the full ceremony. MVP+30 introduces F48 batch mode.
- **Drop-off risk:** 8min × 12 clients = 96min onboarding tax → highest single source of Yossi-tier churn at MVP. The day-7 recovery email and skip-cinema for repeat-Brief partially soften this.

### 10. **Aria reviews vendor (procurement-mode visitor, never signs up)**
- **Trigger:** Marcus forwards Aria a signed Brief screenshot + a `/security` link.
- **First surface:** `/security` or `/trust` or a signed scan permalink. **Never `/signup`.**
- **What's shown:** SOC 2 status, sub-processor list, DPA download, security.txt, bug bounty link, AES/HMAC details.
- **Transitions:** Aria reads, downloads DPA, replies to Marcus internally with green/yellow/red. No state change in Beamix's system at all (except telemetry on `/security` page views).
- **Drop-off risk:** Aria abandonment = silent veto of Marcus's renewal. The exit is unobservable; we discover it weeks later when Marcus churns. **Aria-grade `/security` content is therefore the most leverage-per-pixel surface in the product.**

### 11. **Returning user, mid-onboarding (abandoned at Step 2 or 3)**
- **Trigger:** day-1 / day-3 / day-7 abandoned-account recovery email (per Onboarding Audit O-13).
- **First surface:** signed link → `app.beamixai.com/onboarding/[abandoned_step]` with a cream-paper banner: "We saved your progress. Pick up where you left off."
- **What's shown:** the exact step they abandoned, with all prior steps marked complete in the stepper. Autosaved field values are pre-populated.
- **Transitions out:** (a) continue → step completes → next step or `/home`; (b) bounce again (cleanup cron triggers at 30 days; F35-extended).
- **Drop-off risk:** without recovery emails, ~70% of abandoners never return. With the 3-email sequence, recovery rate jumps to ~5–10% (audit estimate).

### 12. **Returning user post-cancellation (F35 graceful cancellation, 90-day window)**
- **Trigger:** former customer hits `app.beamixai.com/login` after cancelling within the last 90 days.
- **First surface:** login → "Welcome back. Your data is still here. Reactivate?" page.
- **What's shown:** prior Brief (read-only preview), prior Truth File summary, prior scan history count, "Reactivate plan" primary CTA, "Export and delete forever" secondary.
- **Transitions out:** (a) reactivate → Paddle re-checkout → `/home` (no re-onboarding — Brief and Truth File are restored); (b) hard delete → 30-day cleanup; (c) bounce → silent within 90-day window, then auto-delete.
- **Drop-off risk:** reactivation conversion ~15–20% within 90-day window. After 90 days: hard delete, no path back except fresh signup.

---

## §2. The state diagram

States are nodes; transitions are edges. Italic text denotes data carried in state.

```
                    ┌──────────────────┐
                    │ ANONYMOUS_VISITOR│  carries: nothing
                    └────────┬─────────┘
                             │ (enter URL on /scan)
                             ▼
                ┌────────────────────────────┐
                │ ANONYMOUS_SCANNING (15-17s)│  carries: scan_id (server-issued), domain
                └────────┬───────────────────┘
                         │ (scan completes)
                         ▼
              ┌──────────────────────────────┐
              │ ANONYMOUS_SCAN_RESULTS_VIEWED│  carries: scan_id, results JSON,
              └─┬───────────────┬───────┬────┘  vertical_classification, share_key
                │ (sign-up CTA) │       │ (share/copy permalink)
                │               │       └──→ permalink lives 30 days; viewable until expiry
                ▼               │
         ┌─────────────┐        │ (bounce)
         │  PADDLE_    │        ▼
         │  CHECKOUT   │   [exit; recoverable via re-scan only]
         └────┬────────┘
              │ (payment success, scan_id passed via state)
              ▼
       ┌──────────────────────────────┐
       │ SIGNED_UP_WITH_SCAN_IMPORTED │  carries: user_id, scan_id, plan_tier,
       └────┬─────────────────────────┘  paddle_subscription_id, vertical, pre-fill blob
            │ (auto-redirect; no UI gap)
            ▼
       ┌──────────────────────────┐
       │ ONBOARDING_STEP_1        │  carries: same + (editable prefilled fields)
       │ Confirm vertical (≤30s)  │
       └────┬─────────────────────┘
            │ (Continue)              ┌──── (escape hatch from Step 3 sends user back here)
            ▼                          │
       ┌──────────────────────────┐    │
       │ ONBOARDING_STEP_2        │    │
       │ Lead Attribution (≤30s)  │    │
       │ vertical-aware:          │    │
       │   SaaS → UTM ceremony    │    │
       │   E-comm → Twilio        │    │
       └────┬─────────────────────┘    │
            │ (Continue or Skip)       │
            ▼                          │
       ┌──────────────────────────┐    │
       │ ONBOARDING_STEP_3        │────┘ ↻ "This doesn't describe my business"
       │ Brief approval (≤90s)    │
       │ Seal stamps, "— Beamix"  │
       └────┬─────────────────────┘
            │ (Approve and start)
            ▼
       ┌──────────────────────────┐
       │ ONBOARDING_STEP_4        │  carries: signed Brief, all prior state +
       │ Truth File (≤60s)        │  vertical-discriminated extension fields
       └────┬─────────────────────┘
            │ (File this and start)
            ▼
       ┌──────────────────────────┐
       │ MAGIC_MOMENT_TRANSITION  │  7-second cinema; first-agent-by-vertical kicks off
       └────┬─────────────────────┘
            │ (lands on /home)
            ▼
       ┌──────────────────────────┐
       │ ACTIVATED_NO_INBOX_ITEM  │  Brief signed, agents running, but no /inbox approval yet
       └────┬─────────────────────┘
            │ (first /inbox approval within 24h — per Q4 lock)
            ▼
       ┌──────────────────────────┐
       │ ACTIVATED                │  ← analytics activation event (locked)
       └────┬─────────────────────┘
            │ (Paddle subscription proceeds, no charge in 14-day money-back window)
            │
            ▼
       ┌──────────────────────────┐
       │ PAYING_CUSTOMER          │  steady state; carries everything
       └────┬─────────────────────┘
            │
       (cancel)
            ▼
       ┌──────────────────────────┐
       │ CANCELLED_BUT_RETAINED   │  90-day window; F35 graceful cancel
       └────┬─────────────────────┘
            │ (no reactivation in 90d)
            ▼
       ┌──────────────────────────┐
       │ DELETED                  │
       └──────────────────────────┘

  Side branches not on the spine:
    ABANDONED_MID_ONBOARDING ←─ from Step 1, 2, 3, or 4
       carries: partial state + step_abandoned_at timestamp
       receives recovery emails Day 1, 3, 7
       30-day cleanup cron deletes if untouched (with Twilio number release per FM-19)

    DIRECT_SIGNUP_NO_SCAN ←─ entry path 3
       enters PADDLE_CHECKOUT without a scan_id
       lands in ONBOARDING_STEP_1 with NO pre-fill (empty fields)
       background scan begins running during Steps 1–3 if domain entered
```

### State carry-overs (data plane)

| State | Carries | Time-to-live |
|---|---|---|
| ANONYMOUS_SCANNING | `scan_id` (UUID), `domain` | 30 days; permalink resolves to private detail unless shared |
| SCAN_RESULTS_VIEWED | scan_id, full results JSON, vertical, share_key | 30 days (anonymous), forever (linked to user) |
| SIGNED_UP_WITH_SCAN_IMPORTED | scan_id, user_id, plan_tier, vertical, prefill blob | persistent |
| ONBOARDING_STEP_n | full state + autosaved per-step drafts | 30 days then cleanup if abandoned |
| ABANDONED_MID_ONBOARDING | partial state + provisioned Twilio numbers | 30 days; numbers released on cleanup |
| ACTIVATED | full state + first-inbox-approval timestamp | persistent |
| CANCELLED_BUT_RETAINED | full state + cancelled_at | 90 days; then DELETED |

The most fragile carry-over is **`scan_id` across Paddle checkout**. Paddle is a hosted payment surface; we pass `scan_id` via custom data field on the checkout session and re-attach on webhook. Failure mode: webhook delay > redirect → user lands in Step 1 with no pre-fill. Mitigation: poll for webhook, hold Step 1 in a 2-second skeleton if scan not yet attached.

---

## §3. The 5 critical hand-off moments

### Hand-off 1 — URL entry → scan running → scan results (the demo moment)
- **What MUST carry:** the typed domain. Server-side server-action fires the 11-engine query, classification, gap detection.
- **What SHOULD carry but doesn't (current spec):** progressive disclosure of partial results. The 15–17s reveal is a single batched render — if any one engine times out, the whole render waits. Could stream per-engine results in for tension/payoff cinematography, but this is a v1.5 polish.
- **What user feels:** anticipation → first reveal of score → mild dopamine. The animation is the demo. This is the most-craft-loaded moment in the whole product on a per-second basis.
- **Failure modes:** engine timeout (graceful — render with em-dash for that engine), classification confidence too low (defaults to "Other," surfaces in Step 1 as low-confidence indicator), domain doesn't resolve (inline error, no scan run).

### Hand-off 2 — Anonymous scan results → sign-up CTA (the conversion moment)
- **What MUST carry:** `scan_id`, `vertical_classification`, results blob, share_key. The signup link is `/signup?scan_id={uuid}` and the scan_id must persist through Paddle into the post-checkout webhook.
- **What SHOULD carry:** the *intent signal* — which gap the customer was reading when they clicked the CTA. If scan results show "3 critical schema issues on /pricing," the post-signup magic moment should pin THAT finding as Evidence Card #1 (currently the spec uses vertical-default first agent — Schema Doctor for SaaS, Citation Fixer for e-comm — not last-viewed-finding). This is a craft delta worth ~3–5% activation.
- **What user feels:** "they showed me what's broken; I want them to fix it." Strongest conversion moment in the whole funnel. The CTA copy "Fix this — start free" is currently aligned with this.
- **Failure modes:** Paddle redirect drops `scan_id` (mitigate via Paddle custom data + webhook); user signs up via wrong path (`/signup` direct, no scan_id) → onboarding has no pre-fill, renders empty Step 1 — feels like a different product.

### Hand-off 3 — Sign up → onboarding Step 1 (the activation entry)
- **What MUST carry:** user_id, plan_tier, scan_id (if from path 5). Onboarding skips a redundant fresh scan on `?scan_id=` per the locked spec; pre-fills website, business name, vertical, location.
- **What SHOULD carry but currently doesn't (audit O-2 + O-9 + O-10):** Hebrew typography fallback (Heebo not yet locked at MVP), Brief grounding preview (right column on Step 2), pre-filled Three Claims from scan data (audit O-4 — highest CRO leverage in the funnel).
- **What user feels:** "they recognized me." The 600ms fade-in on Step 1 with all fields populated is the anti-form-fatigue move. **If this hand-off feels like form-filling, the cinematography is broken.**
- **Failure modes:** `handle_new_user` trigger regression (FM-21; deploy-time smoke test required); `scan_id` not yet linked at landing (skeleton hold for 2s); empty pre-fill for direct-signup users (Step 1 feels generic — a known cost of path 3).

### Hand-off 4 — Onboarding Step 3 Seal signed → first dashboard visit (the welcome moment)
- **What MUST carry:** signed Brief (with brief_clause_ref system primed), Truth File (after Step 4), vertical, plan_tier. First-agent-by-vertical job is enqueued in the Inngest scan worker before /home renders.
- **What SHOULD carry:** the freshly-stamped Seal SVG (currently re-rendered on /home — could be passed in state to avoid a flash). The 7-second magic moment is choreographed assuming the agent already has a finding queued; if backend latency exceeds 5s the cinema has a beat of dead air.
- **What user feels:** "they're already working." The Score count-up + Ring draw + Evidence Card #1 slide-up all telegraph past-tense work, not promised work. Strongest activation moment in the post-payment phase.
- **Failure modes:** first-agent finding not ready in 5s (Evidence Card slide is delayed; cinema feels broken); signed Brief not yet propagated to agent context (agent uses pre-Brief defaults — bad for Marcus, fatal for Aria's audit if she's looking).

### Hand-off 5 — First dashboard visit → first inbox approval (the activation moment)
- **What MUST carry:** the user's identity, role, plan tier; the first /inbox item must be present and Brief-grounded with citation.
- **What SHOULD carry:** the customer's earned attention from the magic moment. There's a ~2-minute window where the customer is on /home reading; the first /inbox item should arrive in that window. Currently the spec doesn't enforce a max-latency for first-inbox-arrival; recommend ≤120s P95.
- **What user feels:** "I have to decide something — and the citation tells me why I'm being asked." First Brief-grounded approval is the moment activation locks in. **Per Q4 (Adam-confirmed): activation = first /inbox approval within 24h.** This makes the metric ruthless.
- **Failure modes:** first /inbox item arrives outside 24h (user already drifted); citation cites a Brief clause they don't recognize (Brief drift bug); approval UI doesn't render the citation prominently (audit O-9 — Brief grounding preview during Step 2 fixes this earlier in the funnel).

---

## §4. The free scan ↔ onboarding integration question (the core)

Four architectural options. Each fully walked.

### Option A — Current spec: scan and onboarding are SEPARATE flows joined by `?scan_id=`

**Architecture:** `/scan` is anonymous, public, marketing-flavored cream paper. After viewing, the user clicks "Fix this — start free," lands on `/signup?scan_id=...`, completes Paddle, enters the 4-step onboarding which has its own ceremony (vertical confirmation → Lead Attribution → Brief signing → Truth File). The `scan_id` linkage lets onboarding pre-fill data and skip a redundant scan; Step 1 reads "we pulled this from your scan."

**Walkthrough by persona:**
- **Marcus (TechCrunch path):** scans, reads results 60s, clicks CTA, Paddle 60s, onboarding 4min. Total ~6.5min. Activation when first inbox item is approved within 24h. The vertical pre-fill + UTM ceremony in Step 2 makes him feel SaaS-recognized.
- **Dani (Twitter mobile path):** scans on phone in Hebrew, reads results 90s on mobile, clicks CTA, Paddle on phone 90s, onboarding 4–5min on mobile. Activation when first inbox item approved. Risk: Hebrew Fraunces fallback breaks Step 3 (audit O-2 — Heebo lock fixes).
- **Yossi (direct app, repeat domain):** authenticated, "Add client" → fresh per-domain onboarding ceremony with no preceding scan flow. Path 9. The full ceremony × 12 clients is the audit's #1 churn risk.
- **Aria:** never enters Option A's main spine. She views `/security`, `/trust`, and a forwarded scan permalink (path 6 + 10). Option A's separation actually serves her well — the `/scan` artifact is a defensible procurement document.

**Pros:**
- Clean conceptual separation: scan = marketing, onboarding = constitutional. Two registers, each fully owned.
- Public scan can be shared without leaking customer state.
- Direct signup path (path 3) doesn't break — the onboarding works without `?scan_id=`.
- Yossi's per-domain flow doesn't need a scan-first step (he already knows the domain is his client).
- Aria's procurement read of a scan permalink is a *complete* artifact, not a teaser.

**Cons:**
- Customer enters URL once on `/scan`, then sees vertical re-confirmed in Step 1, *creating cognitive duplication*. Mitigation: Step 1 copy "We pulled this from your scan. Edit anything that's not right" — but it's still a re-touch.
- Two payment-walls of attention: the 17s scan reveal builds momentum; Paddle then breaks it. The customer must sustain enthusiasm across a payment ceremony.
- Pre-fill data that flows from scan → onboarding is *implicit* — the customer can't tell at Step 1 whether the data is freshly fetched or imported. We compensate with copy, not architecture.
- The 4-step onboarding ceremony is **resetting** the trust the scan built. The customer is being asked again "is this you? what's your industry?" instead of being thanked for what they already gave.

**Conversion impact:** baseline. Current spec assumes ~25–30% scan→activated conversion. The audit's CRO concerns (O-4 Three Claims pre-fill; O-9 Brief grounding preview) are improvements *within* this option.

**Build effort:** baseline (already specced in F1 + F2 + onboarding v1.1).

**Brand/voice impact:** Cream paper register appears on `/scan` (acquisition surface) and Step 3 (constitutional surface) but Steps 1, 2, 4 sit on regular paper. The cream is therefore a register *signal*, not a *spine* — appears in two unconnected moments. Acceptable but not coherent.

---

### Option B — Unified flow: scan IS Step 0 of onboarding

**Architecture:** No `/scan` standalone. The customer enters URL → sees scan run → sees results inline → flows directly into a single continuous experience that culminates in Brief signing. Sign-up wall placement becomes the critical decision — either pre-scan (gates the demo, kills acquisition) or post-scan / pre-Brief (after the customer sees value but before they sign anything constitutional). The Paddle checkout becomes one beat in the middle, not a flow boundary.

**Walkthrough by persona:**
- **Marcus:** `beamixai.com` → "Scan my site" → enters URL → 17s reveal → results render in same chrome → "Now let's give your agents authority over this" → Paddle (because we're about to spawn paid work) → continue → Steps 1–4 unify into a 90s-per-step refinement of what the scan already classified. Total ~7min, but feels like ~5min because the same cinematic chrome holds throughout.
- **Dani:** mobile-first version of the above. Hebrew RTL must hold across 7+ minutes of continuous flow rather than 17s + 4min in different surfaces. Higher bar.
- **Yossi:** "Add client" needs a different entry — he can't run a fresh scan as Step 0 each time without doubling his time. Option B forces a forked entry for Yossi (or his clients become a different mental model, not Brief-grade).
- **Aria:** has no entry at all in pure Option B. The shareable scan artifact (path 6) requires a public scan permalink that exists outside the unified flow. We'd need to spawn the artifact as a side-effect of the scan-as-Step-0 — possible but it adds an outside-the-spine output.

**Pros:**
- One continuous narrative — the customer never feels handed off.
- Pre-fill is *explicit* — the data they entered at Step 0 is the same data they confirm in Step 1 (which collapses to a sub-step).
- The cinematic register can hold cream paper from URL entry through Brief signing — coherent register, single voice.
- Trust the scan built carries directly into the constitutional moment with no reset.

**Cons:**
- Long total flow (~7 min from URL entry to first /home paint). Compare to Option A's two ~3-min beats split by Paddle.
- Some customers want only the scan, not the product. Option B without a non-signup branch kills the social-share flywheel (path 6 — one of Beamix's marketing flywheels).
- Sign-up wall placement is fraught. Pre-scan: kills acquisition (D). Post-scan / pre-Brief: forces Paddle into the middle of a continuous cinematic flow, which feels jarring. Mid-Brief: mixes payment with constitutional moment — fatal.
- Yossi's "Add client" path needs a totally different entry — Option B isn't natively multi-tenant.
- Aria's artifact path needs side-channels.

**Conversion impact:** unclear. The continuous flow could lift Marcus-class conversion by ~5–10% (less context-switching) but kill Dani-class mobile conversion by ~3–5% (long mobile flows have higher bounce). Net likely flat or slightly positive — but loses the social-share flywheel which is a longer-term acquisition channel.

**Build effort:** very high. Requires merging two distinct codebases (scan engine ↔ onboarding ceremony), redesigning Paddle integration as a mid-flow modal, building Yossi's separate entry. Easily 3× Option A.

**Brand/voice impact:** strongest possible — a single register holds for 7 minutes. But: only achievable if the cinema is paced *very* carefully. Beamix's quality bar is "billion-dollar feel" — this option requires the most discipline to reach it. Failure mode: feels like a long form, not a ceremony.

---

### Option C — Two flows that converge

**Architecture:** Acquisition flow (`/scan` standalone, anonymous, marketing-flavored) AND direct-signup flow (`/signup`, no preceding scan) both exist. They converge at "first authenticated state" where a unified Brief authoring + Seal signing + activation ceremony plays. If the user came via scan: their classifications + findings are pre-loaded into Brief authoring (per Q3 lock — pre-fill at MVP). If the user came direct: they're prompted to run a first scan during onboarding (or after), and the Brief authoring waits on the scan to complete.

This is structurally what the current spec already aspires to — but it under-commits on the *convergence* point. In Option C, the convergence is explicit: there's a single Brief-signing surface (Step 3) and *everything before it is plumbing*. Steps 1 and 2 become "settle the inputs the Brief needs," and they look different depending on entry path. Path-5 users see a 30s vertical confirmation; direct-signup users see a 60s "tell us your domain so we can scan it" beat.

**Walkthrough by persona:**
- **Marcus (path 5):** `/scan` → results → CTA → Paddle → Step 1 (5–10s, all pre-filled) → Step 2 UTM ceremony → Step 3 Brief (pre-loaded with scan findings) → Step 4 Truth File → /home. Total ~5min. **Identical to Option A in his experience** — but the architecture is honest about the convergence.
- **Dani:** mobile path 5; same as Marcus, on phone, in Hebrew.
- **Yossi (path 9):** "Add client" → mini-scan-trigger UI → scan runs in background → Step 1 of new-client onboarding pre-fills as scan completes → Step 3 Brief authored against new client's domain. The scan beat is invisible (background) but the convergence is the same.
- **Yossi (path 3-equivalent for new-client direct entry):** "Add client without scan" path is also possible — Step 1 collects domain → background scan kicks off → Step 2 UTM/Twilio → by Step 3 the scan is done and Brief authors.
- **Aria:** path 6 + 10 unchanged. Public scan artifact is preserved as a side-effect of the acquisition path.

**Pros:**
- Serves both entry types natively without forcing one into the other's mold.
- Data preservation between scan and Brief is *architectural* — the scan produces a `scan_id` that the Brief author references; the Brief author waits on a scan if not present. No silent pre-fill — explicit dependency.
- The shareable scan artifact lives independently (preserved flywheel).
- Yossi's multi-tenant flow becomes natural — same convergence point, different inputs.
- Direct-signup users get a coherent experience instead of "broken" empty Step 1.

**Cons:**
- More flows to design + maintain. The Step 1 + Step 2 surfaces have two visual states (came-with-scan / came-without-scan).
- Onboarding entry copy must vary by entry path ("we pulled this from your scan" vs "let's get to know you").
- The "Brief author waits on scan" state is a new failure mode — if scan takes longer than Steps 1+2, the Brief beat has to either delay or pre-render with default chips.

**Conversion impact:** Option A baseline + ~3–5% lift on direct-signup path (currently this path has empty Step 1 = bad UX) + ~2% lift on Yossi's path 9 multi-client flow. Net: small but compounding lift.

**Build effort:** ~1.3× Option A. Mostly in handling the "direct signup must trigger a scan in onboarding" path — the rest of the spec is shared with A.

**Brand/voice impact:** strong — the cream-paper register can show up at the scan moment (whichever path triggered it) and at Brief signing, and the customer perceives them as the same product. The `/scan` permalink artifact retains its cream-paper acquisition register.

**Match to Frame 5 v2:** strongest of the four. Frame 5 v2 says "the product IS the onboarding" and "delivered work, not promise." Option C delivers both: scan = past-tense delivery; Brief = authority transfer; first inbox = present-tense delivery. Three beats, one product.

---

### Option D — Scan is gated (signup required to scan)

**Architecture:** Remove anonymous `/scan`. Sign-up is the only door; scan happens inside the onboarding flow.

**Walkthrough by persona:**
- **Marcus:** marketing → sees no scan demo → has to sign up (and pay, since 14-day money-back replaced 7-day trial) before he can see his score. Marcus hits Paddle cold — no demo, no proof of value. ~50–70% of Marcuses bounce here.
- **Dani:** Twitter scroll → Beamix → no scan available → bounce.
- **Yossi:** signup → Add client → scan inside flow. Only persona where Option D is neutral.
- **Aria:** path 6 dies (no public scan permalinks to forward). Aria has no entry at all.

**Pros:**
- Every scanner becomes a registered user (no leaky funnel).
- All data is owned + auditable from minute one.

**Cons:**
- Massive acquisition cost — kills the demo-as-conversion pattern that is the whole flywheel.
- Kills the social-share flywheel (path 6).
- Aria has no entry → procurement reviews fail.
- Competitors (Profound, Otterly, Athena) all offer free scans. Beamix gating its scan is a differentiator in the *wrong* direction.

**Conversion impact:** catastrophic. ~60–70% reduction in top-of-funnel.

**Build effort:** lowest of the four (literally remove `/scan`).

**Brand/voice impact:** breaks "free scan" as a promise we've made publicly. Loss of trust beyond the immediate funnel cost.

**Verdict:** non-starter. Listed only for completeness.

---

## §5. Persona × entry-path matrix

### Marcus
- **Primary path:** TechCrunch → marketing → `/scan` → results → "Fix this" CTA → Paddle → onboarding Step 1 (pre-filled) → Steps 2–4 → /home → first inbox approval within 24h.
- **What he'd change:** the scan-results-to-Paddle gap should feel less like "now pay" and more like "now we get to work for you." Copy can do most of this. Brief grounding preview (audit O-9) on Step 2 would let him see the architectural promise during the moment he's still skeptical.
- **Alternate path:** abandons at Step 2 (didn't have liam@'s email handy) → day-1 recovery email "Beamix saved your tagged URLs" → returns → completes.

### Dani
- **Primary path:** Twitter on phone → mobile `/scan` in Hebrew → results in Hebrew (assumes Heebo locked) → mobile Paddle → mobile onboarding 4–5min in Hebrew RTL.
- **What she'd change:** Step 3 mobile Fraunces 22px wraps every 3–4 words on 327px (audit O-10 — needs 18px/28px responsive rule). Hebrew RTL must hold cleanly across UTM tags (which are LTR Geist Mono — explicit `dir="ltr"` required per audit O-2).
- **Alternate path:** lands on `/scan` from a Hebrew tech blog, scans, reads results, doesn't sign up immediately, comes back 2 days later via the share permalink which expires at 30 days → continues from there.

### Yossi
- **Primary path:** colleague WhatsApp → direct to `app.beamixai.com/signup` → Paddle → onboarding (Yossi himself, his agency domain). Then: "Add client" × 12 = 12 fresh per-domain onboardings. 8min × 12 = 96min onboarding tax.
- **What he'd change:** agency batch mode at MVP+30 (F48); skip-cinema for client #2+ at MVP (audit O-1 partial relief); pre-fill Brief from prior client domain on client-add. The MVP delta from "fix nothing" to "ship 2 partial-relief mitigations" is the difference between Yossi staying or churning at month 2.
- **Alternate path:** signs up self → adds 4 clients in week 1 → abandons clients 5–12 → day-7 recovery email "We saved your progress on 4 of 12 clients" → comes back, finishes 3 more, abandons 5. Eventually only 7 clients onboarded; revenue shortfall vs full-12.

### Aria
- **Primary path:** Marcus forwards her a signed Brief screenshot + `/security` link → Aria visits `/security`, `/trust`, downloads DPA, reviews sub-processor table, checks SOC 2 status, security.txt. Approves conditionally on her 7-fix list (audit O-16 — already in PRD v4 + Build Plan v2).
- **What she'd change:** wants `/security` to be reviewable in <5min by a procurement deputy who isn't Aria-grade — i.e., the page must self-summarize. Also wants the sub-processor table to render the controller/processor column inline (audit O-16).
- **Alternate path:** Marcus sends her the public scan permalink (path 6) → Aria reads it, then navigates to `/security` from the footer link — the small "Security & DPA" footer link on the public artifact (per audit O-3 lock as quiet footer treatment). She never logs in.

---

## §6. Recommendations summary

### Top 3 architectural recommendations for the free-scan ↔ onboarding question

**1. Option C — Two flows that converge at Brief signing.** Best fit for Marcus, Dani, Yossi, and Aria simultaneously. Preserves the public-scan flywheel (path 6 → social shares → demand-gen). Honest about the architecture: scan = past-tense delivery; Brief = constitutional authorship; first inbox approval = present-tense delivery. Convergence point makes the Brief signing surface canonical regardless of entry. Modest build delta over A (~1.3×). Best brand-coherence story.

**2. Option A — Current spec, hardened.** Cheapest path to MVP. Already specced + designed. Audit's 12 highest-leverage fixes (especially O-4 pre-fill Three Claims, O-9 Brief grounding preview, O-2 Heebo lock) lift conversion within Option A by an estimated ~8–12%, which is more than Option C's structural lift on top of an unhardened A. Best fit if calendar pressure is the dominant constraint. Risk: ships an architecture that isn't quite honest about the scan-onboarding relationship; the customer experience is fine but not category-defining.

**3. Option B — Unified continuous flow.** Highest-craft potential, highest-risk delivery. Could be the most cinematic onboarding ever shipped in a B2B SaaS — every second from URL entry to /home paint sustains the same register. But: 3× build effort, breaks Yossi's multi-tenant pattern, requires solving sign-up-wall placement without breaking the cinema. Only viable if Beamix decides the *cinematic moat* is its category-defining wedge — and even then, the social-share flywheel loss is a real cost.

### Single best-fit recommendation: **Option C**

**Reasoning:** Beamix's strategic position requires three things simultaneously — a wide top-of-funnel (free scan as flywheel), a constitutional moment (Brief signing as renewal mechanic), and procurement-grade artifacts (Aria's `/security` and shareable scans). Option A handles the first two well but treats them as unrelated registers; Option B fuses the first two but breaks the third; Option D breaks the first; Option C is the only architecture that preserves all three by making the *convergence* — the Brief signing surface — the explicit canonical gate. Marcus, Dani, Yossi, and Aria each enter through different doors; they all walk into the same Brief.

The build delta vs Option A is modest (~30%) and concentrated in two places: (1) the direct-signup path now triggers a scan during onboarding instead of leaving Step 1 empty; (2) Yossi's "Add client" flow becomes a first-class entry into the same convergence point. Both improvements pay for themselves at the persona level.

The cream-paper register holds at three moments: `/scan` artifact, public scan permalink, Brief signing. The Seal stamps once per principal (per client tenant for Yossi), regardless of how the principal got to the Brief. The signature reads "— Beamix" because the constitution is theirs *with* Beamix, not Beamix's *to* them. Same product, four personas, one constitution.

---

*End of architecture document. This is one of three parallel inputs feeding the next-session decision. Sister inputs cover: the persona-stress test (parallel) and the funnel-economics analysis (parallel). The decision belongs to Adam.*

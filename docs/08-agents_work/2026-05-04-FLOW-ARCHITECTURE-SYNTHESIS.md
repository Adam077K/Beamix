# Scan ↔ Onboarding Architecture — CEO Synthesis
**Date:** 2026-05-04
**Sources:** 3 parallel audits — User Flow Architect (12 entry paths + state diagram), Acquisition Funnel Critic (drop-off analysis vs Profound/Plausible/Stripe Atlas), Architectural Integrator (4 options pressure-tested + 5th proposed).
**Triggering question:** Adam asked whether scan + onboarding are correctly architected, or whether onboarding should start AFTER scan results.
**Status:** Decision-ready. Multiple Adam-decisions surfaced.

---

## TL;DR — The recommendation

**Adopt "Option E" — a unified `/start` route that absorbs both entry paths (anonymous-scan-first AND direct-signup) into one continuous experience, while keeping public `/scan` as a peer marketing surface.**

This is a 5th option neither I nor the original board members initially proposed. Both Agent 1 (Option C) and Agent 3 (Option E) converged independently on the same core insight: the "scan vs onboarding" question is a false binary. The right answer is "both, with one continuous narrative once the user commits."

Beyond the architectural answer, the audit surfaced **6 new critical findings** that change PRD v4 amendments in ways the onboarding audit alone didn't see.

---

## What's actually in the current spec (the diagnosis)

**Current Option A:** Free Scan and Onboarding are separate flows.
- Anonymous user → /scan → enter URL → get results → "Sign up to fix this" CTA → triggers signup form → 4-step onboarding → activation
- The hand-off between "scan-results-viewed" and "onboarding-step-1-vertical-confirmation" is **architecturally invisible** in the current spec
- The Paddle checkout is **completely unspecified** — neither F1 nor F2 mention WHERE it lives in the flow
- `scan_id` carries from anonymous scan to authenticated user via the existing converted_user_id pattern, but the data flow from scan to Brief co-authoring (Step 2) is implicit, not explicit
- Adam confirmed Q3: pre-fill Three Claims from scan data ships at MVP. This **structurally requires** Options B/C/E. Option A doesn't carry scan data into Brief authoring naturally.

The audits found 3-4 specific architectural gaps in PRD v4 that need filling regardless of which option you pick.

---

## The 4 (now 5) architectural options — pressure-tested

### Option A — Current spec (separate flows)
- **Marcus:** activates clean (current spec works for him)
- **Dani:** Hebrew rendering + register issues compound the disconnection between scan and onboarding
- **Yossi:** disconnection forces him through scan + onboarding for each of 12 clients
- **Conversion:** baseline
- **Build effort:** zero (it's the spec)
- **Verdict:** simplest but leaves scan data orphaned on conversion

### Option B — Unified flow (scan IS Step 0)
- One linear ceremony: URL → scan → results → "want us to fix it?" → signup → Brief → Seal → activation
- **Tradeoff:** very long flow (8-12 min combined) for users who only want the free scan
- **Verdict:** strong narrative but kills "scan-as-public-tool" flywheel

### Option C — Two flows that converge (Agent 1's call)
- Public /scan exists standalone (anonymous, shareable)
- Direct-signup flow exists for users who didn't scan first
- Both flows converge at Brief authoring with scan data carried forward
- Per Q3 lock, the "scan data → Brief" pre-fill is already partially built in
- **Verdict:** structurally honest about scan↔Brief relationship; ~1.3× build effort vs A

### Option D — Gated scan (signup required first)
- Massive acquisition cost; kills viral flywheel
- **Verdict:** rejected by all 3 audits

### Option E — Unified `/start` flow + public `/scan` preserved (Agent 3's call) ⭐
- Public `/scan` stays exactly as today (preserves viral wedge)
- Signup-onwards experience collapses into one `/start` route with phase-based state machine
- Phases: `enter-url → scanning → results → signup-overlay → paddle-inline → brief-co-author → brief-signing → truth-file → /home`
- Cream-paper editorial register holds across all phases
- Paddle becomes an inline overlay (not a redirect) — eliminates the "I left, came back, who am I?" hand-off
- Both anonymous-scan-first AND direct-signup paths terminate in same `/start` flow — anonymous enters at Phase 2 with `scan_id`; direct enters at Phase 0
- **Conversion estimate:** +10-20% direct-signup, +5-10% scan→paid vs Option A
- **Build effort:** M-L (3-4 weeks of integration work; mostly reusing existing onboarding components inside unified state machine)
- **Verdict:** the right answer for Beamix's stage

**Why Option E over Option C:** they're not actually contradictory — Option E is a more concrete implementation of Option C's principle. Option E names the route (`/start`), the phases, the inline-Paddle pattern, and the data flow explicitly. Option C is the architectural philosophy; Option E is the execution.

---

## The 6 NEW critical findings beyond the original question

These came out of the funnel + flow analysis and are independent of the "scan vs onboarding" architectural question. They affect PRD v4 amendments regardless of which option you pick.

### N-1. Paddle checkout is invisible in the current spec
**Severity: 🔴 BLOCKER**

The single highest-friction point in the entire funnel — and PRD v4 doesn't say where it lives. Is Paddle:
- Before onboarding (signup form → Paddle → onboarding starts)?
- Mid-onboarding (post-vertical, pre-Brief)?
- Post-onboarding (Brief signed → Paddle → activation)?
- Inline overlay during onboarding (Option E recommendation)?

**Audit recommendation:** Inline overlay between signup-overlay and Brief-co-author phases. User stays on `/start`; Paddle modal appears, completes payment, modal dismisses, Brief authoring begins. No redirect. No "where am I" moment.

**Adam-decision (Q6):** approve inline-overlay Paddle, OR pick a different placement.

### N-2. 24h activation window is too tight
**Severity: 🟡 IMPORTANT**

You confirmed Q4: activation = first /inbox approval within 24h post-Brief-signing. The funnel critic found this systematically under-counts:
- Customers who sign up Friday evening (don't open product until Monday)
- Different timezones (Israeli signup at midnight = activation deadline at 4am next day)
- Slow agent queue runs (if /inbox doesn't have an item ready in 24h, customer literally can't activate)

**Audit recommendation:** Extend activation window to **7 days** (industry standard). Adjust Marcus's Day-14 evangelism trigger accordingly.

**Adam-decision (Q7):** keep 24h / extend to 7 days / extend to 14 days.

### N-3. 14-day money-back guarantee is mismatched with results timeline
**Severity: 🟡 IMPORTANT**

AI search ranking changes take **30-90 days** to materialize. Beamix's 14-day money-back is too short for the customer to see real results before deciding to refund.

**The math:** Stage 3 (scan→signup) gains ~8-12% if money-back is surfaced on scan-results page. But if customers refund at >20% because they didn't see results in 14 days, the gain is wiped.

**Audit recommendation:** 
- Keep 14-day on Discover ($79) — early-feedback tier
- **Extend Scale tier ($499) to 30 days** — bigger commitment, longer evaluation window
- Surface guarantee on scan-results page (before signup), not just during onboarding

**Adam-decision (Q8):** confirm 14/30 split, OR keep uniform 14-day, OR pick another structure.

### N-4. Google OAuth as primary auth (vs email+password)
**Severity: 🟢 HIGH-LEVERAGE FIX**

Current spec uses Supabase Auth with email+password (and confirmation email). Each verification email is a 30-50% drop-off point. Google OAuth eliminates the verification step entirely.

**Audit recommendation:** Make Google OAuth the **primary** auth method on signup. Email+password as fallback for users without Google accounts.

**Adam-decision (Q9):** approve Google OAuth primary, OR keep email+password primary.

### N-5. Lighthouse-style badge embeddable is the missing distribution lever
**Severity: 🟢 HIGH-LEVERAGE / DEFER**

When a customer's Beamix score is high, they want to display a badge on their site: "AI Search Visibility: 87/100 — Verified by Beamix." Click-through goes to public scan permalink. Lighthouse uses this pattern; Beamix doesn't yet.

**Audit recommendation:** Build at MVP+30 (defer slightly to validate metric system first).

**Adam-decision (Q10):** approve MVP+30 ship, OR defer to later, OR ship at MVP.

### N-6. Plausible-style "public stats" dogfooding flywheel
**Severity: 🔵 STRATEGIC**

Plausible publishes their own analytics publicly at plausible.io/plausible.io. Demonstrates confidence + drives organic traffic.

Beamix could do the same: publish your OWN AI visibility data at /scan/beamixai.com (your scan results, public). Pairs with State of AI Search annual report (F47).

**Audit recommendation:** Ship at MVP launch. Symbolic but powerful.

**Adam-decision (Q11):** approve, OR defer.

---

## Page-level architecture for Option E (the recommendation in detail)

If you approve Option E, here's how the unified `/start` flow looks:

### `/scan` (public, unauthenticated)
- Standalone scan tool, exactly as today
- Shareable permalinks at `/scan/[scan_id]` (per F22 OG share card spec)
- "Claim this scan" CTA on public permalinks → routes to `/start?phase=results&scan_id=[id]`
- Free scan is its own entry point + viral wedge

### `/start` (the unified onboarding state machine)
**Phase 0 — `enter-url`** (only if user came direct, no scan_id)
- Single domain field
- Auto-runs scan in background after submit

**Phase 1 — `scanning`**
- 30-90s wait state with engagement copy + agent monogram preview
- Cream paper register starts here (or earlier if direct)

**Phase 2 — `results`**
- Scan results render (cartogram, citations, gap summary)
- Signup-overlay slides up after ~10s of results-reading
- Headline: "Want our agents to fix this?"
- Footer: 14-day money-back guarantee surfaced (per N-3)

**Phase 3 — `signup-overlay`**
- Google OAuth as primary CTA (per N-4)
- Email+password as secondary
- "Skip — just send me the scan" → email scan results PDF, exit flow (cold lead → Resend nurture sequence)

**Phase 4 — `paddle-inline`**
- Paddle modal appears (no redirect)
- Pre-selects Discover ($79) by default
- "Choose tier" link if user wants to upgrade
- Trial clock starts here per Q4 lock

**Phase 5 — `vertical-confirm`** (current Step 1)
- Confidence indicator: "92% sure you're B2B SaaS"
- One click to confirm or change

**Phase 6 — `brief-co-author`** (current Step 2 + Q3 enhancements)
- Three Claims pre-filled from scan data (per Q3 lock)
- Right-column preview of inline Brief grounding (per Q3 lock)
- Cream paper register, Fraunces clauses, Heebo for Hebrew (per Q2 lock)

**Phase 7 — `brief-signing`** (current Step 3)
- Seal stamping ceremony (540ms per Round 1 lock + Arc's Hand at v4)
- "Print the Brief" option (no auto-dismiss timer per WCAG fix)
- "Security & DPA" footer link (per Q5 lock)

**Phase 8 — `truth-file`** (current Step 4)
- Vertical-conditional fields (hours field hidden for SaaS per O-18)
- Mandatory Three Claims already pre-filled from Phase 6 — customer reviews + edits

**Phase 9 — `/home`** (post-onboarding, first dashboard visit)
- Skeleton state until first scan + agent run completes
- Receipt-That-Prints card (F25) for Monthly Update
- Activation gate: first /inbox approval starts the activation timer (per Q4 + N-2 — recommended 7 days)

### Data carried across phases (the integrity contract)
- `scan_id` carries from Phase 1 → all subsequent phases
- `user_id` is created at Phase 3, persists thereafter
- `paddle_subscription_id` created at Phase 4
- `business_id` created at Phase 5 (vertical confirmed)
- `brief_id` created at Phase 7 (Seal signed)
- `truth_file_id` created at Phase 8

---

## The full updated decision list — Q1-Q11 (all open)

Locked from prior session:
- ✅ Q1: Yossi agency mode at MVP+30 (assuming "MVP+3" was typo for "MVP+30" — confirm)
- ✅ Q2: Heebo 300 italic as Fraunces' Hebrew companion
- ✅ Q3: Brief grounding preview during Step 2 ships at MVP
- ✅ Q4: Activation = first /inbox approval within 24h
- ✅ Q5: Quiet "Security & DPA" footer link

NEW from this session:
- ❓ Q6: Approve inline-overlay Paddle placement during `/start` flow?
- ❓ Q7: Extend activation window to 7 days (vs 24h confirmed at Q4)?
- ❓ Q8: Extend Scale tier money-back to 30 days (Discover stays 14)?
- ❓ Q9: Make Google OAuth primary auth method?
- ❓ Q10: Build embeddable score badge at MVP+30?
- ❓ Q11: Publish Beamix's own scan publicly (Plausible-style dogfooding)?
- ❓ Q12: Approve Option E (unified `/start` route + peer-public `/scan`)?

---

## Critical pre-build validations (the 5 things to verify before locking PRD v5)

Per Agent 3's recommendation:

1. **5-customer guerrilla test of A vs E mocks** — show 5 prospective customers both flows, see which converts. Cost: ~$100 in incentives. Time: 1 day.

2. **Pressure-test Paddle Inline reliability across browsers** — Paddle modal needs to work on Safari iOS, Chrome Android, low-end devices. Test with Paddle's sandbox + 5+ browsers.

3. **Map Yossi's path through Option E** — confirm the unified `/start` flow accommodates "I'm already a customer adding my 8th client" without breaking. May need a Phase 0.5 for "is this an additional domain?" branch.

4. **Pixel-spec the Phase 1→2 transition** — scan completion → results reveal. The most consequential motion moment in the entire flow. Must hit Vercel-grade craft bar.

5. **Confirm "claim this scan" pattern on public permalinks** — Sarah tweets her scan; visitor lands on `/scan/[scan_id]`; clicks "scan your own"; should route correctly to `/start?phase=results&scan_id=[id]`. This is the viral acquisition moment.

---

## Build implications (preview for next session's Build Plan v3)

If you approve Q6-Q12 as recommended:

**New Tier 0:**
- Update auth provider config (Supabase Auth: Google OAuth as primary)

**Updated Tier 1:**
- T-NEW: `/start` route + phase state machine (replaces current onboarding routing)
- T-NEW: Paddle inline integration (replaces current Paddle redirect — if any was specced)
- T-NEW: "Claim this scan" pattern on public permalinks
- T-NEW: Scan-results-page — surface 14-day money-back guarantee
- T-NEW: Google OAuth primary signup flow

**New Tier 3:**
- T-NEW: Embeddable Beamix score badge (MVP+30 if Q10 approved)
- T-NEW: Public dogfooding scan at /scan/beamixai.com (MVP if Q11 approved)

**Updated F35:**
- Money-back tiered: Discover 14d, Build 14d, Scale 30d (if Q8 approved)

---

## What I recommend you do RIGHT NOW

**5-minute task:** Answer Q6-Q12. Just paste back inline:

```
Q1: confirm MVP+30 (or correct to MVP+3 if intentional)
Q6: approve inline Paddle
Q7: extend to 7 days
Q8: 14/14/30 split
Q9: Google OAuth primary
Q10: ship MVP+30 (badge)
Q11: ship at MVP (dogfooding)
Q12: approve Option E
```

That unlocks PRD v5 + Build Plan v3 in next session. PRD v5 will reflect the Option E architecture, all 12 Q's locked, and the full set of onboarding fixes from the prior audit.

---

## Open question I'm flagging for you

The unified `/start` route is a **bigger architectural change** than the original onboarding fixes. Estimated 3-4 weeks of build work vs. the current Option A spec.

**The strategic question:** is this work worth doing BEFORE MVP launch, or is it a Frame 5 v2.1 / post-launch refinement?

**My take:** ship Option E at MVP. Reason: the conversion delta (+10-20%) and brand-coherence improvement compound from day 1. If you ship the current Option A spec, every customer that lands week-1 experiences the friction-heavy hand-off and you're rebuilding within 90 days anyway. Better to ship the right architecture once.

But it's your call. If MVP timeline is tight, ship Option A and rebuild as Option E at MVP+30 alongside Yossi agency mode.

**Adam-decision (Q13):** ship Option E at MVP, OR ship Option A and rebuild as Option E at MVP+30?

---

*Source files: `2026-05-04-USER-FLOW-ARCHITECTURE.md`, `2026-05-04-ACQUISITION-FUNNEL-CRITIC.md`, `2026-05-04-FLOW-ARCHITECTURE-RECOMMENDATION.md`.*

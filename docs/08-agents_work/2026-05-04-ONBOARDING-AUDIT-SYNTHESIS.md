# Onboarding Audit — CEO Synthesis
**Date:** 2026-05-04
**Sources:** 4 parallel audits — personas (Marcus/Dani/Yossi/Aria), failure modes (30 cataloged), CRO + craft + trust, form-factors (mobile/Hebrew RTL/a11y)
**Predecessors:** PRD v4 (PR #55), Round 2/3 design board synthesis (PR #54)
**Status:** Action list. PRD v5 amendments derived from this synthesis ship in next session.

---

## TL;DR — what the 4 audits collectively surfaced

The current 4-step onboarding spec is **Marcus-grade** (he activates clean) but breaks down across the other 3 personas:
- **Dani** activates only IF Hebrew RTL works. Fraunces has NO Hebrew Unicode range — Israeli customers currently fall back to Times New Roman. Strategic blocker.
- **Yossi** is the highest-LTV / highest-churn-risk persona. 8min × 12 clients = 96min onboarding tax. Needs agency mode before month-2 churn.
- **Aria** approves conditionally on 7 /security gaps that we've already partially specced (F42 Trust Center) but haven't shipped.

Plus: ~30 failure modes, 5 WCAG 2.1 AA fails, mobile rendering breaks at Step 3.

**Decision-required level:** Yossi multi-client friction is a Frame 5 v2 strategic question — does agency mode ship at MVP, or do we accept Yossi churn + plan for MVP+30? Adam confirms.

---

## STRONG CONVERGENCES (3-4 audits flag the same gap)

### O-1. Yossi onboarding tax — agency batch mode missing
- **Personas:** "highest-LTV / highest-churn-risk persona. 8min × 12 = 96min un-skippable ceremony tax."
- **CRO:** Step 4 mandatory Three Claims field repeated 12 times = single highest cognitive cost in entire flow.
- **Failure modes:** 30-day cleanup cron must handle Yossi's batch-domain orphans differently than single-customer orphans.

**CEO call:** SHIP agency batch onboarding at MVP+30 (not MVP). At MVP, Scale-tier multi-domain (F40) ships per-domain full ceremony per the locked decision. Add a Yossi-specific recovery email at day 7 ("We saved your progress on 4 of 12 clients — finish when ready") to soften abandonment.

**PRD v5 addition:** F48 — Agency Batch Onboarding Mode (MVP+30) — pre-fills Brief from prior client domain, shortens ceremony to 2 min per additional client, optional "skip ceremony, accept defaults" for client #3+ with audit trail.

### O-2. Fraunces has no Hebrew — Israeli customers get fallback typography
- **Form factors:** "Fraunces falls back to Times New Roman for every Israeli customer in the Brief. The cream paper editorial register collapses to default-serif territory."
- **Personas (Dani):** "activates because Hebrew RTL works from line one" — but if Brief register breaks in Hebrew, retention-fragile Dani churns at Week 1.

**CEO call:** SHIP Heebo 300 italic as Fraunces' Hebrew companion at MVP. Lock typography stack:
```css
font-family: 'Fraunces', 'Heebo', serif;
```
With Heebo 300 loaded conditionally on `[lang="he"]` pages. Geist Mono technical content (URLs, phone numbers) must have explicit `dir="ltr"` to prevent mirrored URLs.

**Add to design system canon (PRD v5).** Single Tier 0 ticket — XS effort.

### O-3. /trust crosslink missing during onboarding (Marcus→Aria handoff)
- **Personas (Aria):** Marcus screenshots the signed Brief + Seal + cream paper register, forwards to Aria. Aria approves conditionally on /security review. If onboarding never surfaces /trust or /security, Marcus has nothing to forward beyond a screenshot.
- **CRO/Trust:** "No /trust crosslink, no DPA link visible during onboarding. Marcus has to dig for them after the fact."

**CEO call:** Add a "Forward to your CTO" or "Security details" footer link during Step 3 (post-Brief, pre-activation). Direct link to /trust. Adam-level decision: do we surface this prominently (banner with "Send to your CTO" CTA) or quietly (small link in footer)? My recommendation: small footer link "Security & DPA" — the ones who care will click; the ones who don't aren't disrupted.

**PRD v5 amendment to F2.**

### O-4. Step 4 cognitive overload — mandatory Three Claims kills 12-18% of users
- **CRO:** "Step 4 is the highest-risk step. Three Claims field structurally incompatible with 60-second target for customers without pre-fill."
- **Personas (Marcus):** "small-business DNA leaking into a SaaS flow" (re: Step 4 hours field — same critique).

**CEO call:** SHIP pre-fill mandatory claims from Step 0 free scan data. The free scan already extracted FAQs, services, brand language. Use Claude to draft the Three Claims; customer reviews + edits. Reduces cognitive cost from "type 3 things" to "approve or edit 3 prefilled things."

**PRD v5 amendment to F2.** Highest CRO leverage in entire audit.

### O-5. Activation event misdefinition
- **CRO:** "Activation event = first /inbox item approved within 24h, NOT Brief signed."
- **Failure modes:** Trial clock starts at Paddle checkout, not onboarding completion.

**CEO call:** Lock activation as **first /inbox approval within 24h post-Brief-signing**. Update analytics + lifecycle email triggers. Trial clock anchor = Paddle checkout (per failure-mode audit recommendation).

**PRD v5 architectural canon. Updates F2 + analytics + Marcus's Day-14 evangelism trigger (F12).**

---

## TWO-LEGEND CONVERGENCES (2 audits flag the same gap)

### O-6. The handle_new_user trigger bug — historical risk still live
- **Failure modes (FM-21):** "Historical bug per memory still a live risk. Need deploy-time smoke test + UPSERT guard."
- **Memory file:** Onboarding bug from 2026-03-02 had this exact root cause; was fixed but the trigger could regress on schema migration.

**CEO call:** Tier 0 ticket — add a deploy-time smoke test that creates a test user in staging post-migration and verifies user_profiles + subscriptions + notification_preferences rows exist. Plus UPSERT guard in /api/onboarding/complete (already in place per memory; verify still wired).

### O-7. Orphan Twilio numbers — billing leakage
- **Failure modes (FM-19):** "$1.25/mo per orphan number. 30-day cleanup cron must include Twilio REST DELETE step."
- **CRO/CRO:** "If customer abandons mid-onboarding, the provisioned numbers stay billed."

**CEO call:** Add Twilio cleanup to the abandoned-account 30-day deletion cron. Each Twilio number's `friendly_name` includes the customer_id; cron releases all numbers for accounts marked `deleted_at`.

**PRD v5 addition:** part of F35 graceful cancellation extended to abandoned-mid-onboarding accounts.

### O-8. WCAG 2.1 AA failures — 5 specific blockers
- **Form factors:** 4 token contrast fails (`--color-ink-4` on cream, `--color-score-excellent`, `--color-needs-you`, focus ring at 25% opacity) + auto-dismiss timer on Print-the-Brief fails WCAG 2.2.1.
- **CRO/Trust:** Aria-grade procurement signoff requires AA compliance.

**CEO call:** Tier 0 fixes for all 5. Each is XS effort:
- Add `-text` color variants for failing tokens (e.g., `--color-score-excellent-text` with darker shade)
- Focus ring: solid blue 2px outer ring (not 25% opacity)
- Print-the-Brief auto-dismiss timer: REMOVE entirely (manual dismiss only, persists 24h+)
- Audit `useReducedMotion()` hook coverage on Rough.js JS animations (Seal, Ring, counter)

**Add to PRD v5 design system canon.**

### O-9. Brief grounding invisibility during onboarding
- **CRO/Trust:** "F30 Brief grounding invisible during Brief authorship. The architectural commitment customers will see post-activation isn't visible during the moment they're authoring it."
- **Personas (Aria):** Brief grounding inline citation is part of what makes the system feel structurally committed; if it's invisible during authorship, customers don't know to expect it.

**CEO call:** Add a "Preview" element on the right column during Brief co-authoring (Step 2): shows what an /inbox item will look like with the inline citation pattern (`Authorized by your Brief: "[clause]" — clause N · Edit Brief →`). Teaches the architectural commitment in-context.

**PRD v5 amendment to F2.**

### O-10. Mobile Step 3 typography breaks
- **Form factors:** "Fraunces 22px on 327px readable width wraps every 3-4 words. Editorial register collapses to broken-poetry territory."
- **Personas:** Dani is mobile-first; if Step 3 breaks, she doesn't activate.

**CEO call:** Mobile breakpoint typography table: Fraunces 22px → 18px/28px line-height at <600px. Specific responsive rules in design system.

---

## SINGLE-AUDIT FINDINGS WORTH SHIPPING

### O-11. Dual-tab Brief writes — silent data corruption (FM-04)
**Failure modes only.** Optimistic 90-second tab-lock prevents this. Latest tab "claims" the Brief; older tab shows "another tab is editing — return there or take over."

**CEO call:** SHIP. Single Inngest function + Postgres advisory lock. M effort.

### O-12. Brief consistency check pre-Seal (FM-11)
**Failure modes only.** Customer types contradictory Brief clauses (e.g., "Always use formal voice" + "Always use casual voice"). Currently Beamix signs anyway. Add fast Claude Haiku pre-Seal consistency check; if contradictions detected, surface them before signing.

**CEO call:** SHIP. Single API call to Haiku at Seal moment. S effort.

### O-13. 3-email abandoned-account recovery sequence
**Failure modes only.** Day 1 / Day 3 / Day 7 cream-paper-register emails inviting customer back. Voice canon Model B. Specific copy in audit doc.

**CEO call:** SHIP at MVP. Adds to F47 + Resend template count (15 → 18). S effort per template.

### O-14. 14-day money-back guarantee surfacing
**CRO only.** Currently invisible during onboarding. Add as small footer line during Step 3 (Seal signing) + Step 4 (Three Claims): "All Beamix plans include a 14-day money-back guarantee. No questions asked."

**CEO call:** SHIP at MVP. XS effort copy change.

### O-15. Coming Soon vertical reframe (Yossi-specific)
**Personas only.** Yossi has 12 clients. 4 are not in the 2 MVP verticals (SaaS + E-commerce). Currently shows "Coming Soon" badge — installs trust splinters.

**CEO call:** Reframe as "Generic Beamix mode — full feature set, vertical-tuning shipping in [later release]" without committing to a date. Removes the "this product isn't ready for me" signal. XS copy change.

### O-16. Aria's 7 /security gaps (covered by F42 + F43; verify ship)
**Personas only.** Aria approves conditionally on:
1. Published DPA at /trust/dpa (covered by F42)
2. SOC 2 Type I status (covered by F42)
3. security.txt at /.well-known (covered by T64 in Build Plan v2)
4. Bug bounty live (covered by F43)
5. AES mode unspecified in /security §9 (covered by Aria's 5-fix list in PRD v4)
6. HMAC key storage missing from §9 prose (covered by Aria's 5-fix list)
7. Sub-processor controller/processor column missing (covered by F42 amendment)

**CEO call:** All 7 already in PRD v4 + Build Plan v2. Confirm tickets ship pre-MVP launch.

### O-17. Step 1 vertical confidence indicator works for everyone
**Personas + CRO** both flag this as the strongest Round 1 keep. The 92% / 73% / "best guess" honesty signals "real product." Don't touch it.

**CEO call:** Lock + protect. Add to design system as a "trust pattern to replicate" example.

### O-18. Step 4 hours field — vertical-conditional
**Personas (Marcus, Dani):** "WHEN ARE YOU OPEN?" reads as small-business DNA leaking into SaaS flow.

**CEO call:** Make Step 4 hours field vertical-conditional. Show for E-commerce/Local; HIDE for SaaS. PRD v5 amendment to F2.

### O-19. Magic-moment cinema is unskippable
**Personas (Yossi):** Kills agency users at scale. 96min cumulative.

**CEO call:** Add a "skip cinema" option for users with ≥1 prior signed Brief in their account (i.e., agency users on client #2+). Locks Yossi at MVP partial-relief; full agency mode at MVP+30.

---

## CRITICAL QUESTIONS FOR ADAM

### Q1. Yossi at MVP vs MVP+30
**Audit recommendation:** ship full agency mode at MVP+30; at MVP, ship 1-2 partial-relief mitigations (recovery email, skip-cinema for repeat brief).

**Adam-decision:** Confirm MVP+30 is acceptable, OR push agency mode into MVP scope (would shift other tickets later).

### Q2. Hebrew typography stack
**Audit recommendation:** Heebo 300 italic as Fraunces' Hebrew companion. Lock now; ship at MVP.

**Adam-decision:** Approve Heebo, OR pick alternative (David, Assistant, Frank Ruhl Libre).

### Q3. Brief grounding preview during Step 2
**Audit recommendation:** add right-column preview teaching the inline citation pattern in-context.

**Adam-decision:** Approve preview design + spec it pixel-precise next session, OR defer (lower CRO impact than other items).

### Q4. Activation event redefinition
**Audit recommendation:** activation = first /inbox approval within 24h post-Brief-signing. Updates analytics + lifecycle emails.

**Adam-decision:** Confirm. Materially changes Marcus's Day-14 evangelism trigger timing + retention dashboards.

### Q5. /trust footer link during Step 3
**Audit recommendation:** small footer link "Security & DPA" — the ones who care will click.

**Adam-decision:** Confirm small/quiet treatment, OR push for prominent "Send to your CTO" banner.

---

## TOP 12 HIGHEST-LEVERAGE FIXES (CEO ranking)

| # | Fix | Source | Impact | Effort | Tier |
|---|-----|--------|--------|--------|------|
| 1 | Pre-fill Three Claims from scan data | CRO O-4 | -10% drop-off Step 4 | S | Tier 1 |
| 2 | Heebo 300 as Fraunces' Hebrew companion | Form-factor O-2 | unblocks Israeli market | XS | Tier 0 |
| 3 | handle_new_user trigger smoke test | Failure-mode O-6 | prevents prod outage | XS | Tier 0 |
| 4 | Activation event redefinition (first /inbox approval 24h) | CRO O-5 | clarifies retention metric | XS | Tier 0 |
| 5 | 4 WCAG 2.1 AA token + focus ring + autodismiss fixes | Form-factor O-8 | unlocks Aria signoff | XS | Tier 0 |
| 6 | Yossi skip-cinema for repeat brief at MVP | Personas O-1 | softens Yossi churn risk | S | Tier 1 |
| 7 | Brief grounding preview during Step 2 | CRO O-9 | trust signal + teaches F30 | S | Tier 2 |
| 8 | Dual-tab Brief lock (FM-04) | Failure-mode O-11 | prevents data corruption | M | Tier 1 |
| 9 | Brief consistency check pre-Seal (FM-11) | Failure-mode O-12 | quality bar | S | Tier 1 |
| 10 | Step 4 hours field vertical-conditional | Personas O-18 | reduces SaaS friction | XS | Tier 1 |
| 11 | 3-email abandoned-account recovery | Failure-mode O-13 | recovers ~5-10% drop-offs | S | Tier 2 |
| 12 | 14-day guarantee + /trust footer surfacing | CRO/Trust O-3+O-14 | conversion + Aria handoff | XS | Tier 1 |

Total Tier 0 work: ~5 person-days. Tier 1: ~12 person-days. Tier 2: ~8 person-days.

---

## NEXT SESSION INHERITANCE

1. **PRD v5** — fold these 12 items into PRD v4 → v5. New features F48 (Agency Batch Onboarding MVP+30) + amendments to F2 (vertical-conditional hours, pre-fill claims, /trust footer, skip-cinema, Brief grounding preview).
2. **Build Plan v3** — add ~12 new tickets across Tier 0/1/2.
3. **Adam confirms 5 questions above** — Q1-Q5 are blocking.
4. **Resend template count: 15 → 18** (3 new abandoned-account recovery emails).

---

*End of synthesis. Source files: `2026-05-04-ONBOARDING-AUDIT-personas.md`, `2026-05-04-ONBOARDING-AUDIT-failure-modes.md`, `2026-05-04-ONBOARDING-AUDIT-cro-craft-trust.md`, `2026-05-04-ONBOARDING-AUDIT-form-factors.md`.*

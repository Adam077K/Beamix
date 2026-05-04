# Strategic Completeness Audit — Beamix PRD v5 + Build Plan v3

**Date:** 2026-05-04
**Auditor:** CEO verification agent
**Scope:** PRD v5 (wedge-launch), Build Plan v3, Option E spec, Flow Architecture Synthesis, Onboarding Audit Synthesis, Round 2/3 Design Board synthesis, Frame 5 v2 Full Vision
**Verdict:** See §11 for severity-ranked issue list and final verdict.

---

## §1 — Frame 5 v2 Alignment Check

Frame 5 v2 positions Beamix as a vertical AI Operating System for AI Search Visibility. Six architectural commitments underpin that positioning.

### 6 MVP agents

| Agent | In PRD v5 (F7)? | Build ticket? | Status |
|-------|----------------|---------------|--------|
| Schema Doctor | Yes | T1.x (v1) | CONFIRMED-PRESENT |
| Citation Fixer | Yes | T1.x (v1) | CONFIRMED-PRESENT |
| FAQ Agent | Yes | T1.x (v1) | CONFIRMED-PRESENT |
| Competitor Watch | Yes | T1.x (v1) | CONFIRMED-PRESENT |
| Trust File Auditor | Yes | T1.x (v1) | CONFIRMED-PRESENT |
| Reporter | Yes | T1.x (v1) | CONFIRMED-PRESENT |

All 6 MVP agents have PRD spec in F7 and v1 build tickets. **CONFIRMED-PRESENT.**

### 18 agent monograms (2-letter codes, deterministic Rough.js seed)

PRD v5 F11 (/crew) specifies: "2-letter monograms: SD, CF, FA, CW, TF, RP." Build Plan v1 (Tier 0 T0.13) specifies the per-customer seal generator. The Option E spec (Phase 1, scanning component) shows 8 agent monograms in the agent monogram strip. The Build Plan v3 T0 entry specifies "per-agent Rough.js monogram generator (deterministic seed-per-agent UUID)" as Tier 0 infrastructure item 7. F11 acceptance criteria locks "18 agent colors locked and tested at 12px on cream paper before MVP launch."

Gap: PRD v5 F7 specs only 6 MVP agents with 2-letter codes (SD, CF, FA, CW, TF, RP). The monogram spec says 18 agent colors must be locked and tested — but only 6 agents are active at MVP. The other 12 "coming soon" rows in /crew need their monograms pre-seeded even if the agents are inactive. No ticket explicitly covers the 12 non-MVP agent monogram seeds. **PARTIAL** — 6 MVP agent monograms are covered. 12 non-MVP agent monogram seed generation is not covered by any ticket.

### Editorial register (cream paper + Fraunces 300 italic)

The Option E spec defines cream paper (`#F7F2E8`) as the register for Phases 1, 2, 5, 6, 7, 8 of /start. PRD v5 F11 (/crew), F44 (/changelog), F46 (error pages) all specify cream paper register. Design Board Round 2/3 synthesis locks "cream-paper-stays-light partition" as canon (8 surfaces forever light). Build Plan v3 T0 (Tier 0 quality gates) and T94 (phase-transition motion) reference the cream paper system.

The register is consistent across: /start (Option E spec), /inbox (F6), /changelog (F44), error pages (F46), Monthly Update PDF (F14), /reports (F37), /scan public (F1). **CONFIRMED-PRESENT.**

### Brief constitutional architecture (4-clause Brief + Seal + grounding citations)

| Element | Covered? |
|---------|---------|
| 4-clause Brief structure | F2 v5 + T106 spec — confirmed |
| Seal signing (540ms ceremony) | F2 v5 + T107 spec — confirmed |
| Brief grounding inline citations (F30) | F30 amendment v5 + T106 right-column preview — confirmed |
| `brief_clause_ref` on provenance envelope | Tier 0 item 11 — confirmed |
| Brief clause snapshot stored at action creation | Tier 0 item 12 — confirmed |
| Brief binding line on every product page | F31 + acceptance criteria on F5/F6/F8/F9/F10/F11/F13 — confirmed |
| 10-minute undo window | F32 — confirmed |
| Brief Re-Reading quarterly trigger | F24 — confirmed |

**CONFIRMED-PRESENT** across all elements.

### State of AI Search annual report (F47) — data instrumentation start at MVP

F47 specifies MVP+90 ship. T129 (Build Plan v3) is a Tier 5 tracking ticket that explicitly states: "The observation period MUST start at MVP launch for the 90-day observation to be valid." The data instrumentation required for F47 depends on real scan data accumulation starting from Day 1 of launch. PRD v5 F47 calls this out.

Gap: No Tier 0 or Tier 1 ticket specifies the specific data schema required for F47 charts. The synthesis document (Round 2/3) mentions "6 hero charts requiring ≥60-90 days of repeated scans" — but no ticket defines what those charts are, what columns they need, or which Supabase tables need instrumentation from Day 1. If the schema is wrong at MVP launch, 90 days of data will be useless. **PARTIAL** — F47 is specced, T129 is a tracking note, but the data instrumentation schema for F47 hero charts is not defined in any ticket. This is a gap.

---

## §2 — Persona Coverage Check

### Marcus (B2B SaaS Founder)

Marcus's full journey: free scan → /start (direct or claim-this-scan) → Phase 3 signup (Google OAuth) → Phase 4 Paddle modal (dismiss → Free Account OR complete → Paid) → Phase 5-8 onboarding → /home → email nudges → "Activate agents" → first /inbox approval → activation event → Day-14 lead attribution email → Monthly Update PDF → renewal.

All touchpoints are buildable:
- Free scan: F1 + T1.x (v1)
- /start flow: F2 v5 + T100–T110
- Google OAuth: T95
- Paddle inline: T114 (Free Account path) or Phase 4 inline during /start (partially spec'd in PRD v5 §4 — though the Phase 4 inline Paddle is in PRD v5 flow description but T114 is the Free Account /home activation modal, not the in-flow Phase 4 component)
- Brief + Seal: T106, T107
- Truth File: T108
- /home Free Account state: T112, T113
- Recovery emails: T115
- Activation event: T118
- Lead Attribution: F12 + existing v1 tickets

Gap: Phase 4 of /start is described in PRD v5 §4 as "Paddle modal appears as inline overlay within /start." But Build Plan v3 does NOT have a dedicated ticket for Phase 4 (paddle-inline component). T100–T109 cover Phases 0–8 except there is no T104 equivalent for Phase 4 (the paddle-inline phase). T104 is the signup-overlay (Phase 3). T114 is the Free Account /home modal (a separate surface). Phase 4 of /start — the inline Paddle that appears mid-flow for direct-signup users — has no dedicated build ticket. This is a gap.

**Gaps found:** Phase 4 /start paddle-inline component missing from Build Plan v3 tickets. Minor risk: the Phase 4 component may be assumed to be handled by T114's PaddleActivationModal.tsx reused inline — but T114 is explicitly tied to the /home "Activate agents" trigger path, not the /start Phase 4 path. The two entry points are architecturally different.

### Dani (E-Commerce Operator)

Dani's critical path: same as Marcus but Hebrew RTL, mobile-first, Fraunces → Heebo fallback.

- Heebo 300 italic: T93 — confirmed
- Mobile Step 3 typography: T127 — confirmed
- Hebrew RTL throughout /start: T101 (Phase 0), T102 (Phase 1), T103 (Phase 2 cartogram mirrors), T104 (Phase 3 auth form), T105 (Phase 4), T106 (Phase 5/6 Heebo), T107 (Phase 6/7 signature RTL), T108 (Phase 7/8 hours grid) — all specced in Option E pixel spec

Gap: No ticket covers Hebrew RTL for /home, /inbox, /crew, /scans, or /reports. The Option E spec covers /start extensively for RTL, but once Dani is inside the dashboard, RTL behavior is unspecified. If Dani accesses /home in Hebrew, the layout may break. **PARTIAL** — RTL is confirmed for /start only. Persistent dashboard RTL is an open gap with no ticket.

**Gaps found:** Persistent dashboard Hebrew RTL (post-onboarding surfaces: /home, /inbox, /crew, /scans) has no coverage.

### Yossi (Agency Owner)

Yossi's MVP path: scan → /start → Free Account → tries to add client #2.

At MVP, F48 (Agency Batch Onboarding) is MVP+30. MVP partial relief is:
- T121 (skip-cinema for repeat-Brief users) — confirmed, Tier 3
- Multi-client cockpit on /home shown when ≥2 active domains (F48 mentions this is present at MVP — "cockpit shown when ≥2 active domains, not waiting for full batch mode")

Gap: PRD v5 F48 says "multi-client cockpit at /home for Scale accounts (table view — already in F40). In v5 at MVP: cockpit shown when ≥2 active domains." But F40 spec is "unchanged from v4" and no Build Plan v3 ticket covers the MVP cockpit for ≥2 domains. It is referenced in T130 (Yossi batch — MVP+30), which depends on T100 and T121, but T130 is Tier 5. The MVP cockpit that appears when Yossi has ≥2 domains is not assigned to any MVP-tier ticket.

**Gaps found:** Yossi's multi-client cockpit (available at MVP per F48 spec) has no MVP-tier build ticket. Yossi's /inbox bulk-approve (Cmd+A within single-client view — stated as critical in persona spec) has no dedicated MVP ticket either; F6 acceptance criteria includes "Cmd+A selects all visible items in current filter view" and "Approve N items button" — this is covered at the /inbox feature level, but cross-client bulk-approve is explicitly deferred to MVP-1.5. Within-client bulk-approve should be confirmed explicitly.

### Aria (Hidden CTO Co-Founder)

Aria's surfaces: /trust, /security, /trust/dpa, /trust/compliance, /trust/sub-processors.

| Surface | Covered? |
|---------|---------|
| /trust landing page | F42 — confirmed |
| /trust/compliance (SOC 2 status) | F42 + T66 (v2) — confirmed |
| /trust/sub-processors (5 Aria columns) | F42 — confirmed |
| /trust/dpa (ungated public DPA) | F42 — confirmed |
| /.well-known/security.txt | T64 (v2) — confirmed |
| /security public page (Aria's 5 fixes) | F20 + Round 2/3 R2-16 — confirmed |
| Bug bounty live (HackerOne) | F43 — confirmed at MVP+30 |
| Public DPA liability cap | F21 — confirmed (legal advisor task) |

Gap: F43 (bug bounty) is specced at MVP+30, not MVP. But Aria's evaluation checklist requires "Bug bounty program live." If Aria reviews at month-3, MVP+30 will have shipped and this is fine. However, it is a risk: if Marcus shows Aria the product at Week 2, the bug bounty won't be live. The /.well-known/security.txt at MVP + F43 at MVP+30 creates a window where Aria's checklist is partially incomplete. Manageable but worth flagging.

**Gaps found:** bug bounty window (MVP to MVP+30) is a soft Aria-risk. DPA indemnification cap is an Adam-only action (legal advisor call) with no ticket — confirmed below in §8.

---

## §3 — The "Happy Path" Gap Check

| Step | In PRD v5 + Build Plan v3? | Buildable? |
|------|---------------------------|------------|
| 1. Visit beamixai.com → click "Free scan" | F1, Framer marketing site (separate) | Yes — F1 specced. Framer is out of scope for this repo. |
| 2. Enter URL → scan runs → results render | F1 + T1.x (v1) scan infrastructure | Yes |
| 3. Sign up via Google OAuth → Free Account | T95 (Google OAuth), T104 (signup-overlay), T109 (complete phase) | Yes |
| 4. Vertical confirmed → Brief co-authored → Seal signed → Truth File → Welcome screen | T105, T106, T107, T108, T109 | Yes |
| 5. /home loads in Free Account state (sample data + real scan) | T112, T113 | Yes |
| 6. Customer shows boss; comes back days later | Session restoration via URL params + Zustand store (T100) | Yes — /start phase bookmark is specced |
| 7. Day 3 / Day 7 / Day 14 recovery emails (if not yet activated) | T115 (F53) | Yes |
| 8. Customer clicks "Activate agents" → Paddle inline → Trial starts | T114 (PaddleActivationModal.tsx) | Yes |
| 9. First Inngest scan + first agent recommendation in /inbox | F7 agents + T0.3 (Inngest) + Tier 0 realtime | Yes |
| 10. Customer approves first /inbox item → activation event fires within 7d | T118 + F12 | Yes |
| 11. /home shows Monthly Update card (Receipt-That-Prints F25) | F25 + existing v1 tickets | Yes |
| 12. Day 14 lead-attribution email sent if first attribution event recorded | F12 + F14 | Yes |
| 13. Day 30 first Monthly Update PDF generated, sent, public permalink with OG share card | F14 + F37 + F22 (cartogram on PDF) | Yes |
| 14. Customer continues monthly | Ongoing agent cycle, existing v1 tickets | Yes |
| 15. Day 90+ State of AI Search 2026 report ships | F47, T129 (tracking) | Partially — data instrumentation gap noted in §1 |

**Happy path verdict:** Steps 1–14 are fully buildable per the spec corpus. Step 15 has the data instrumentation gap (§1). One gap worth noting: Step 3 says "Google OAuth → Free Account" — but the architectural question of whether Phase 4 (Paddle inline) appears before or after Phase 5 (vertical confirm) is somewhat ambiguous. PRD v5 §4 shows Phase 4 as the Paddle step occurring before vertical confirm — meaning the customer sees Paddle before the Brief ceremony. If the customer dismisses Paddle at Phase 4, they proceed as Free Account through Phases 5–8. This is correct per Q6 lock. However, the Phase 4 component itself (the in-flow Paddle modal within /start) has no build ticket — only T114 (the post-onboarding modal from /home) exists. This is the same Phase 4 ticket gap identified in §2.

---

## §4 — Edge Cases Not Covered

### Customer signs up but doesn't sign Brief in 30 days (auto-cleanup? recovery email?)

PRD v5 F35 (Graceful Cancellation) amendment covers "abandoned-mid-onboarding Twilio cleanup" — accounts in `free_account` state inactive for 30 days are included in the cleanup cron (T126). But the specific recovery mechanism for someone who completed signup (Phase 3) but never reached Phase 7 (Brief signing) is not explicitly covered. T115 covers Day-3/7/14 recovery emails for Free Account users (post-Brief). There are no recovery emails for users who abandoned between Phase 3 and Phase 7. The Option E spec lists entry path 4 as "Returning-after-abandonment" with recovery email `/start?phase=<resume-phase>&token=<recovery-token>` — but no ticket builds the abandonment detection + recovery email for mid-flow dropouts (pre-Brief). This is a gap between the conceptual description and the ticket inventory.

**Status: NOT COVERED** — pre-Brief abandonment recovery email has no build ticket.

### Paddle declines the card during checkout (retry? manual invoice?)

No ticket or PRD feature covers Paddle card decline handling. Paddle's own checkout handles the UI for retries within the payment flow, so the primary UI is handled at the Paddle layer. However, T114 (PaddleActivationModal.tsx) does not specify behavior when `checkout.failed` fires (as opposed to `checkout.completed`). No post-failure state in /home is specced — does the customer remain Free Account? Does a banner appear? This is an open question in the spec.

**Status: NOT COVERED** — Paddle `checkout.failed` event handling in T114 is unspecified.

### Customer pays Discover ($79) then immediately upgrades to Build ($189) (pro-rate? switch trial clock?)

PRD v5 F35 specifies refund windows per tier (14/14/30) but does not address mid-trial upgrade behavior. If Marcus pays $79 and 3 days later upgrades to $189, does the trial clock reset? Does the $79 refund window close immediately? Does he get pro-rated? Paddle supports subscription upgrades natively, but the business rules for trial clock + agent-run caps + refund window during an upgrade are not specified. No ticket covers this.

**Status: NOT COVERED** — mid-trial tier upgrade business rules are unspecified.

### Customer is in Israel and IL Twilio bundle is unavailable for 24h (defer attribution? UTM-only fallback?)

F12 (Lead Attribution) mentions both Twilio and UTM-tagged URLs as attribution methods. PRD v5 F12 acceptance criteria states the Phase 6 brief-co-author shows "UTM panel first for SaaS-classified customers, Twilio-first for e-commerce." There is no specified fallback if Twilio provisioning fails. T126 handles orphan cleanup, but not provisioning failure. If Twilio fails, does Beamix fall back to UTM-only silently? Does it queue a retry? Does it surface a /home banner? Unspecified.

**Status: NOT COVERED** — Twilio provisioning failure fallback is unspecified.

### Customer's domain is offline when Inngest tries the next scan (skip + log? retry with backoff?)

F15 (engine coverage) specifies "Scan failures retried automatically within 2 hours." This covers engine-level failures (e.g., one engine times out). But if the customer's own domain is offline (500 error, DNS failure), the schema audit and content agents will hit the domain directly. No failure mode spec covers domain-offline behavior: does the agent skip, log to /inbox, retry, or alert the customer? This is not addressed in any ticket or PRD feature.

**Status: NOT COVERED** — customer domain offline handling for agent-initiated crawls is unspecified.

### Customer cancels mid-trial-window (apply tier-split refund logic? denial because trial period?)

PRD v5 F35 specifies agent-run caps during refund window and the refund window duration per tier. However, the actual refund mechanics when a customer requests a refund are not specified. Does Beamix process the refund automatically via Paddle? Is there a manual review step? Is the refund denied if >N agent runs were consumed? The spec mentions caps to "mitigate refund risk" (F54) but does not specify the actual refund processing workflow. PRD v5 simply says "money-back guarantee" without specifying the process for honoring it.

**Status: NOT COVERED** — refund processing workflow is unspecified (Adam-only business process, but not documented).

---

## §5 — Compliance + Legal Completeness

| Item | Covered? | Ticket? | Gap? |
|------|---------|---------|------|
| DPA published at /trust/dpa (F42) | Yes | T66 (v2) | None |
| SOC 2 Type I observation start at MVP launch (T129) | Yes — tracking note | T129 (Tier 5 tracking) | Auditor must be engaged before MVP launch; no code deliverable |
| Tech E&O insurance disclosed | No ticket, Adam-only | None | Gap — see §8 |
| GDPR Article 15 (access) / 17 (erasure) / 20 (portability) / 33 (breach notification) | F34 (DSAR + Self-Service export) + F42 (48h breach SLA in DPA) | v2 tickets | Confirmed present |
| Cookie consent banner | Not mentioned in PRD v5, v4, or Build Plan | None | GAP — no ticket |
| Israeli Privacy Protection Law compliance | Not mentioned anywhere | None | GAP — legal advisory needed |
| HIPAA applicability | Not applicable — B2B SaaS GEO product, no healthcare data handling at MVP | N/A | Correct exclusion |
| PCI-DSS applicability | Not applicable — Paddle handles all card data; Beamix stores no PAN | N/A | Correct exclusion |
| `/.well-known/security.txt` | F43 + T64 (v2) | Confirmed | None |
| Sub-processor table (5 Aria columns) | F42 | Confirmed | None |
| IP indemnification via Anthropic/OpenAI terms flowing through DPA | Aria requirement confirmed in F42 | Confirmed in prose; verify DPA draft includes this clause | Legal advisory |

**Two compliance gaps:**

1. **Cookie consent banner** — no ticket exists. If Beamix uses any analytics (Plausible? Mixpanel? Vercel Analytics?), EU cookie law applies to beamixai.com and app.beamixai.com. The Build Plan does not mention a consent management platform. Given the Israeli SMB focus + EU GDPR applicability for any EU visitor, this is a legal gap that needs at minimum a ticket.

2. **Israeli Privacy Protection Law (PPL)** — Israel's PPL was substantially amended in 2023, and new regulations (data security regulations, data subject rights) are in force. Adam is in Israel; many early customers may be Israeli businesses. PPL compliance is separate from GDPR compliance. No PRD or Build Plan document addresses it. A legal advisory check is needed.

---

## §6 — Infrastructure Readiness Check

| Item | In Build Plan? | Status |
|------|---------------|--------|
| Sentry / observability | Not mentioned in any Build Plan v1/v2/v3 ticket | GAP |
| Structured logging | Not mentioned | GAP |
| Database backup strategy | Supabase provides automatic daily backups (Pro plan); F18 Truth File integrity job covers agent-specific integrity | Adequate for MVP — Supabase handles it |
| Disaster recovery / runbook | F18 specifies incident runbook written pre-launch | Confirmed — no ticket for it but it is an acceptance criterion in F18 |
| Customer support tooling | Not mentioned in Build Plan | Intentional omission (email support at MVP scale) — acceptable |
| Resend transactional email capacity | Tier 0 item 9 specifies Resend setup + "send-volume tier" | Partial — no explicit ticket verifying Resend free tier limits (3,000/mo emails) vs. expected send volume at MVP launch with 18 templates. If 100 customers hit the nurture sequence, volume could exceed free tier within Week 2. |
| Playwright + Lighthouse CI gate | R2-13 (Round 2/3 synthesis) → "SHIP CI gate at MVP" | GAP — this was approved but no Build Plan v2 or v3 ticket explicitly covers the GitHub Actions workflow for Playwright + Lighthouse CI gate. T97 covers the signup smoke test only. |
| Speed CI gate (`/home boot ≤100ms warm, ≤400ms cold`) | R2-13 in Build Plan v1 as "Tier 0 amendment" | No dedicated ticket in v1, v2, or v3. GAP. |

**Key infrastructure gaps:**

1. **Sentry (or equivalent error monitoring)** — not ticketed. Without error tracking, production failures are invisible until a customer emails support. This is a Tier 0 prerequisite that is missing.

2. **Structured logging** — no ticket. Debugging Inngest job failures, agent run errors, and scan engine timeouts requires structured logs. Without this, production debugging is ad hoc.

3. **Playwright + Lighthouse CI gate** — approved by Adam in Round 2/3 (R2-13) as "SHIP CI gate at MVP" but never translated into a Build Plan ticket. It is referenced in Round 2/3 synthesis under "Architectural Additions" but has no corresponding T-number.

4. **Resend volume check** — the Tier 0 note says "send-volume tier" but this needs explicit verification. At 100 paying customers with 18-email sequences + weekly digests, Resend free tier (3,000/mo) will be exceeded in the first two weeks of launch. An explicit ticket to confirm the paid Resend plan is provisioned before launch is missing.

---

## §7 — "Billion-Dollar Feel" Final Check

Adam's quality bar: Stripe/Linear/Apple/Anthropic-grade craft. Scoring each dimension:

| Dimension | Spec coverage | Score | Gap |
|-----------|--------------|-------|-----|
| Brand consistency at every scale | F11 (/crew) sizes: 16px disc / 16-32px monogram / 48px+ name. Error pages (F46) cream paper. /changelog (F44) cream paper. All 8 cream surfaces defined. | ✅ Strong | None |
| Voice canon Model B | F7 (agent names internal only), F14 (emails signed "— Beamix"), F48 (recovery emails voice canon), acceptance criteria on multiple features | ✅ Strong | None |
| Editorial register (cream paper + Fraunces 300 italic) | Defined in Option E spec for all 9 /start phases. Design system partition locked. | ✅ Strong | None |
| Motion craft (10 named easing curves) | T58 (v2) locks 10 named curves. T94 locks phase-transition canon (140ms). T128 covers reduced-motion. R2-4 in synthesis. | ✅ Strong | None |
| Typography (Variable Inter + Subset Fraunces + Heebo + Geist Mono) | T60 (variable Inter, v2). Subset Fraunces in R2-5. T93 (Heebo). | ✅ Strong | None |
| Speed canon (16ms render target, Linear-grade) | Playwright CI gate — APPROVED but NOT TICKETED (§6 gap). No T-number. | 🟡 Partial | CI gate not ticketed |
| Trust signals (Aria's /security + DPA + Trust Center + bug bounty) | F20, F42, F43 — confirmed. Bug bounty MVP+30. | ✅ Strong (minor bug bounty timing gap) | None critical |
| Editorial artifacts (Brief, Monthly Update, /changelog, State of AI Search) | All present in PRD v5 (F2 v5, F14, F44, F47). | ✅ Strong | F47 data instrumentation gap |
| Hand-drawn discipline (Beamix-internal Rough.js only; engines clean) | F7 acceptance criteria: deterministic seed per agent. T128 covers Rough.js. No mention of Rough.js on engine-facing content (correct). | ✅ Strong | None |
| Anti-pattern bans (no chartjunk, no path-draw entrance, no microcopy-rotate, no gradient) | F5: "no ring-draw entrance animation." F9: "single 1.5px brand-blue stroke, no gradient." F10: "rivalry strip: both lines render simultaneously at t=0, no stagger, no path-draw." F8: "static step-verb-noun summary — no microcopy-rotate." | ✅ Strong | None |

**Specific gaps against the billion-dollar bar:**

1. **Speed CI gate missing from Build Plan** — Linear's 16ms/100ms/400ms targets are specified verbally but have no enforcement mechanism in the ticket backlog. Without the GitHub Actions gate, regressions will ship to production undetected. This is the single most important craft-enforcement gap.

2. **No Storybook or visual regression testing strategy** — several tickets reference "Storybook story or Playwright snapshot" for phase components (T100–T109 quality gates) but no ticket creates the Storybook setup or base snapshot infrastructure. Visual regressions on cream paper surfaces (the most brand-critical surfaces) have no automated catch.

3. **18 agent colors tested at 12px on cream paper before MVP launch** — F11 acceptance criteria requires this. But no ticket assigns who does this test or what "passes" looks like. It is an acceptance criterion without an assigned build step.

---

## §8 — Adam-Only Items Still Needed

These are not build tickets but are blocking or near-blocking:

| Item | Status | Urgency |
|------|--------|---------|
| DPA indemnification cap legal call (F21) | Not yet decided | Blocking F21 — must happen before launch |
| Tech E&O insurance bound | Not confirmed | Should be bound before first paid customer |
| Status page vendor pick and account creation (Better Stack) | T99 requires Adam to create the Better Stack account — "Adam account action" noted in ticket | Non-blocking for code build; blocking for T99 completion |
| 5 pre-build validations from architectural synthesis | None of the 5 have been scheduled or completed | High urgency (see below) |
| Browser-control agent infrastructure report (Twilio + Paddle + GitHub OAuth setup) | Mentioned in synthesis as pending | Blocks F12 (Twilio provisioning) and T95 (GitHub OAuth client credentials) |
| Customer beta list (5 customers for guerrilla test) | Not assembled | Validation #1 in synthesis — blocks option E conversion hypothesis |
| Israeli PPL legal advisory | Not mentioned anywhere | Should happen before first Israeli paying customer |
| Cookie consent platform decision | Not mentioned | Blocks legal compliance for EU visitors |
| Refund processing business process | Not documented | Blocks F54 (agent-run caps) implementation because the cap logic depends on knowing when a refund is requested |

**5 pre-build validations — current status:**

1. 5-customer guerrilla test of Option A vs Option E mocks — **NOT SCHEDULED**
2. Paddle inline overlay reliability across browsers — **NOT SCHEDULED**
3. Map Yossi's path through Option E for client #2+ — **NOT SCHEDULED** (T130 ticket exists but is MVP+30, not pre-build validation)
4. Pixel-spec the Phase 1→2 transition (scan completion → results reveal) — **DONE** (Option E spec §2 covers this in detail: 1100ms ribbon-reveal)
5. Confirm "claim this scan" pattern on public permalinks routes correctly — **DONE** (T111 tickets this explicitly)

Two of the five validations are resolved. Three are not scheduled. Validation #1 (guerrilla test) is a conversion hypothesis test that de-risks Option E's +10-20% conversion claim before the team builds 41 tickets on top of it.

---

## §9 — Build Readiness Assessment

### Frontend Developer (T93–T111 scope)

**Can start tomorrow?** Mostly yes, with one gap.

**Ready:** T93 (Heebo), T94 (motion canon), T95 (Google OAuth config), T96 (account state tokens), T98 (WCAG fixes), T99 (status page redirect), T100 (/start route), T101–T109 (phase components), T110 (animation orchestration), T111 (claim this scan CTA). All have explicit acceptance criteria and file paths.

**Blocking gap:** T95 requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables. These require Adam to create a Google Cloud OAuth app and provide credentials. No ticket assigns this setup to Adam; T95 simply says "documented in `apps/web/.env.example`." Until Adam provides the Google OAuth credentials, T95 cannot be completed and T104 (signup-overlay) cannot be tested end-to-end.

**Design tokens:** T93, T94, T96, T98 all touch `tokens.css` and `motion.css`. T0.12 (design system token scaffold from v1) must exist before these can be implemented. If T0.12 is not yet complete in the codebase, the frontend developer needs to verify it exists before starting T93.

### Backend Developer (schema migrations + API routes)

**Can start tomorrow?** Yes, with caveats.

**Ready:** Tier 0 infrastructure items 1–18 are fully specced. T119 (pre-fill claims API using Claude Haiku), T120 (hours field vertical-conditional logic), T124 (Postgres advisory lock for Brief), T125 (Brief consistency check API).

**Blocking gap:** Paddle sandbox credentials needed for T114. Adam must provide Paddle sandbox + production API keys before T114 can be built or tested.

**Schema gap:** T113 requires adding `status = 'sample'` as a new enum value on `inbox_items.status`. This requires a schema migration. The migration dependency chain (T113 depends on schema; T112 depends on T113) means the database engineer must run this migration before T112 can be tested.

### Database Engineer (schema + migrations)

**Can start tomorrow?** Yes.

**Ready:** All Tier 0 table requirements are specified in PRD v5 Tier 0 item 2: `briefs`, `truth_files`, `artifact_ledger`, `margin_notes`, `agent_memory` (pgvector), `provenance_steps`, `agent_run_state`, `marketplace_listings`, `marketplace_installs`, `marketplace_reviews`, `workflows`, `workflow_nodes`, `workflow_edges`, `workflow_versions`. Plus v5-specific columns: `free_account_state` on subscriptions, `activation_event_at` on subscriptions, `refund_window_runs_used` on subscriptions.

**Prerequisite before T100 /start can function:** The `briefs` table, `truth_files` table, and `subscriptions.free_account_state` column must exist before any /start phase components can be integration-tested. The database engineer should prioritize these three elements on Day 1.

**T97 smoke test** must run and pass before any Tier 1 work begins. This is correctly ordered in the dependency graph.

**Build readiness verdict:** Build CAN start tomorrow for most Tier 0 tickets. Two hard blockers for Tier 1 integration:
1. Google OAuth credentials from Adam (T95/T104 dependency)
2. Paddle sandbox keys from Adam (T114 dependency)

These are Adam-only administrative actions that should be completed within 24 hours of build start.

---

## §10 — Risk Register

### Risk 1 — Phase 4 (/start inline Paddle) has no build ticket

**Severity: HIGH**

The architectural decision (Q6) places a Paddle inline modal as Phase 4 of /start (before Brief authoring, dismissable into Free Account). PRD v5 §4 describes it in detail. But Build Plan v3 tickets T100–T109 cover Phases 0–8 with one gap: there is no T104.5 or equivalent for Phase 4 (paddle-inline within /start). T114 (PaddleActivationModal.tsx) is the Free Account /home modal — a different surface.

**Mitigation in spec:** Partial. T114 creates a reusable Paddle modal component. But its acceptance criteria are anchored to the /home trigger path, not the /start Phase 4 path. The phase state machine (T100) needs a Phase 4 component that either reuses T114's modal or has its own build ticket.

**Mitigation needed:** Add a Tier 1 ticket covering Phase 4 of /start — the in-flow Paddle inline modal with its dismiss-to-Free-Account path.

### Risk 2 — 5 pre-build validations not scheduled

**Severity: MEDIUM**

The architectural synthesis explicitly requires 5 validations before locking the final build. Three are unscheduled. Most critical: the guerrilla test of Option E vs Option A with 5 customers. Option E adds ~41 new tickets (significant build cost). If the guerrilla test reveals that Option E doesn't convert better than Option A, the team will have built unnecessary complexity.

**Mitigation in spec:** The synthesis acknowledges the risk: "If MVP timeline is tight, ship Option A and rebuild as Option E at MVP+30." Adam locked Q13 (ship Option E at MVP) which supersedes this, but the validations were listed as prerequisites.

**Mitigation needed:** Schedule guerrilla test (1 day, ~$100 cost) before build begins. Validate Paddle inline reliability across browsers (can run in parallel with Day 1 build).

### Risk 3 — State of AI Search data instrumentation gap

**Severity: MEDIUM**

F47 (State of AI Search 2026, MVP+90) requires 90 days of repeated scan data for 6 hero charts. No ticket defines what specific metrics, columns, or aggregations the charts need. If the wrong data is captured from MVP launch, 90 days of data is wasted and F47 cannot ship on schedule.

**Mitigation in spec:** T129 is a tracking note that says "observation period must start at MVP launch." But there is no data schema specification for F47.

**Mitigation needed:** Before MVP launch, define the 6 hero chart requirements and verify Supabase schema stores the necessary data. 1-day research task.

### Risk 4 — Resend volume capacity at launch

**Severity: MEDIUM**

18 Resend templates. If 200 customers onboard in Week 1, the Day 0 welcome + Day 2 + Day 4 + Day 5 + Day 7 nurture sequence generates ~1,000 emails in 7 days from those customers alone. With Free Account recovery emails (Day 3, 7, 14 per T115) added, the volume could exceed 3,000 in the first two weeks. Resend free tier is 3,000/month. Resend Starter tier ($20/mo) covers 50,000/month.

**Mitigation in spec:** Tier 0 item 9 says "Resend setup + send-volume tier" but does not specify which tier is provisioned.

**Mitigation needed:** Confirm Resend Starter plan is provisioned before launch. Cost: $20/month. This is a 5-minute admin action.

### Risk 5 — Twilio provisioning failure has no fallback spec

**Severity: LOW-MEDIUM**

F12 (Lead Attribution) depends on Twilio number provisioning within 2 minutes of Paddle checkout. If Twilio API is unavailable, rate-limited, or the IL number pool is exhausted, the customer's lead attribution setup fails silently. No fallback spec exists for this failure mode.

**Mitigation in spec:** F12 specifies UTM-tagged URLs as a parallel attribution method (not Twilio-dependent). The UTM path provides partial mitigation: SaaS customers default to UTM-first per F12 acceptance criteria. E-commerce customers default to Twilio-first — these customers lose lead attribution if Twilio fails at provisioning time.

**Mitigation needed:** T126 (orphan cleanup) handles the cleanup side. A separate failure mode needs spec: if Twilio provisioning fails, queue a retry (Inngest step), notify Adam via admin email, and surface a /home banner to the customer: "We're setting up your call tracking — it'll be ready within 24h." This is a 1-day backend task.

---

## §11 — Severity-Ranked Issue List

🔴 = Blocking build or launch
🟡 = Important, should resolve before build begins
🟢 = Recommended before launch
✅ = Confirmed present, no gap

### 🔴 RED — Blocking

1. **Phase 4 /start paddle-inline component has no build ticket.** The in-flow Paddle modal within /start (Phase 4, pre-Brief, dismissable to Free Account) is architecturally specified in PRD v5 §4 and Option E spec but has no corresponding T-number in Build Plan v3. Add a Tier 1 ticket before build begins.

2. **Google OAuth credentials not yet provided by Adam.** T95 requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`. These are an Adam administrative action. T104 (signup-overlay) cannot be end-to-end tested without them. Must be provided on Day 1 of build.

3. **Paddle sandbox + production keys not provided.** T114 (PaddleActivationModal.tsx) requires Paddle sandbox credentials for testing. Without them, the entire activation flow is untestable. Must be provided on Day 1 of build.

4. **Cookie consent banner missing — no ticket.** Legal requirement for EU visitors. No PRD feature, no build ticket. Must be added before launch.

### 🟡 YELLOW — Important

5. **5 pre-build validations: 3 of 5 unscheduled.** Guerrilla test (Option E vs A), Paddle inline browser compatibility, Yossi path through Option E. These were synthesis prerequisites. Schedule before or in parallel with Week 1 build.

6. **State of AI Search data instrumentation gap.** F47 needs 90 days of data from MVP launch. No ticket defines the 6 hero chart schemas. Must be resolved before any schema migrations lock the data structure.

7. **Sentry (or equivalent) error monitoring — not ticketed.** Production failures will be invisible without error tracking. Add a Tier 0 ticket for Sentry integration before launch.

8. **Playwright + Lighthouse CI gate — approved but not ticketed.** R2-13 approved "SHIP CI gate at MVP" but no Build Plan ticket implements the GitHub Actions workflow. This is a craft-enforcement gap against the billion-dollar feel bar.

9. **Yossi multi-client cockpit (/home, ≥2 domains) — no MVP ticket.** F48 says "cockpit shown when ≥2 active domains at MVP" but no MVP-tier ticket covers this. T130 is MVP+30.

10. **DPA indemnification cap legal call — Adam-only, not yet decided.** F21 (Scale-tier DPA + agency indemnification) depends on Adam making this legal call. Blocking F21.

11. **Pre-Brief abandonment recovery (mid-flow, Phase 3–7 dropout) — not covered.** Option E spec describes the recovery path conceptually but no ticket implements the abandonment detection + recovery email for users who signed up but never signed their Brief.

12. **Persistent dashboard Hebrew RTL (post-onboarding) — no ticket.** T93 + Option E spec cover /start RTL. /home, /inbox, /crew, /scans RTL behavior is unspecified for Dani.

### 🟢 GREEN — Recommended Before Launch

13. **Resend volume tier — confirm Starter plan provisioned.** Tier 0 item 9 says "send-volume tier" but doesn't specify which. Confirm Starter ($20/mo) is active before launch. 5-minute action.

14. **Twilio provisioning failure fallback — unspecified.** F12 has no failure path when Twilio provisioning fails. Add a failure mode spec: retry queue + admin email + customer banner.

15. **Refund processing business process — not documented.** F54 (agent-run caps) mitigates risk but the actual refund honoring workflow is not documented. Adam should document the internal process before first paying customer.

16. **Israeli Privacy Protection Law — legal advisory.** Adam is in Israel, early customers likely Israeli. PPL compliance is separate from GDPR. A legal advisory is needed.

17. **Structured logging — not ticketed.** Debugging Inngest and agent run errors in production requires structured logs. No ticket.

18. **12 non-MVP agent monogram seeds — no explicit ticket.** F11 requires "18 agent colors locked and tested at 12px on cream paper." Only 6 MVP agents have 2-letter monogram codes. A ticket should assign the 12 non-MVP monogram seeds even if the agents are inactive at MVP.

19. **Tech E&O insurance — not yet bound.** Should be bound before first paying customer. Adam-only action.

20. **Paddle `checkout.failed` handling in T114 — unspecified.** The PaddleActivationModal.tsx spec describes `checkout.completed` but not `checkout.failed`. Add error handling to T114 acceptance criteria.

21. **Mid-trial tier upgrade (Discover → Build) — business rules unspecified.** No ticket or PRD feature covers this edge case. Should be specced before launch.

22. **Storybook or visual regression baseline — not ticketed.** Several quality gates reference "Storybook story" but no ticket establishes the Storybook infrastructure. Add before cream paper surfaces ship.

### ✅ CONFIRMED PRESENT — No Gap

- All 6 MVP agents: Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter
- Brief constitutional architecture: 4-clause Brief, Seal ceremony, grounding citations, binding line on every page
- Aria's surface set: /trust, /security, /trust/dpa, /trust/compliance, /trust/sub-processors
- Google OAuth as primary auth (T95, Q9 lock)
- Two-tier activation model (F51, Q6 lock)
- Free Account recovery emails (T115, F53)
- Heebo 300 italic as Hebrew companion (T93, Q2 lock)
- Activation window 7 days (T118, Q7 lock)
- Money-back tier split: 14/14/30 (T117, Q8 lock)
- Yossi skip-cinema partial relief (T121, Q1 lock)
- Agent-run caps during refund window (T116, F54)
- Dual-tab Brief lock (T124)
- Brief consistency check pre-Seal (T125)
- WCAG 2.1 AA fixes (T98)
- Reduced-motion coverage (T128)
- GDPR DSAR + self-service export (F34)
- DPA at /trust/dpa (F42)
- SOC 2 observation period note (T129)
- /.well-known/security.txt (T64 v2)
- Status page vendor (T99, Better Stack)
- Handle_new_user trigger smoke test (T97)
- Domain infrastructure: beamixai.com, app.beamixai.com, notify.beamixai.com — all LIVE

---

## Final Verdict: NEEDS-WORK-BEFORE-BUILD

Build CANNOT start cleanly tomorrow due to 3 confirmed blockers:

1. Phase 4 /start paddle-inline component — missing ticket (must be added to Build Plan v3 before dev begins)
2. Google OAuth credentials — must be provided by Adam on Day 1
3. Paddle sandbox keys — must be provided by Adam on Day 1

The spec corpus is 90–95% complete. The PRD v5 + Build Plan v3 + Option E spec represent a comprehensive and buildable foundation. The architecture is sound. The 41 new tickets (T93–T133) are well-specified with clear acceptance criteria, file paths, and dependency graphs.

The gaps are real but addressable in 1–2 days:
- Add 1 missing Tier 1 ticket (Phase 4 paddle-inline component in /start)
- Add 2 missing Tier 0 tickets (Sentry monitoring, cookie consent banner)
- Adam provides credentials (Google OAuth, Paddle) — same-day action
- Schedule 3 remaining pre-build validations — can run in parallel with early Tier 0 build

Once these items are resolved, the build can proceed. The strategic completeness is high: Frame 5 v2 positioning is held, all 4 personas have buildable paths, the happy path is end-to-end covered, and the design system canon is locked with enforcement mechanisms. The gaps are operational (missing ticket for one flow segment, three unscheduled validations, two missing credential handoffs from Adam) rather than strategic.

**Estimated time to resolve all blockers: 1–2 business days. Build can begin at full capacity by Day 3.**

---

*Source documents reviewed: PRD v5 (2026-05-04), Build Plan v3 (2026-05-04), Option E Start Flow Spec (2026-05-04), Flow Architecture Synthesis (2026-05-04), Onboarding Audit Synthesis (2026-05-04), Design Board Round 2/3 Synthesis (2026-04-28), Frame 5 v2 Full Vision (2026-04-26).*

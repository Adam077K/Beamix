# Board Meeting Synthesis — 2026-04-27

**STATUS: ALL 23 DECISIONS LOCKED BY ADAM ON 2026-04-28.** This document is now the canonical record of those decisions. Subsequent spec amendments (PRD v2, design specs, etc.) cascade from this lock. See `.claude/memory/DECISIONS.md` for the formal log entry.

**Format:** 9 board seats across 3 rounds. CEO synthesis for Adam.
**Source reports:**
- Round 1: customer-voice / designer / product-lead / brand-distribution
- Round 2: ai-engineer-truth-file / architect / trust-safety
- Round 3: yossi-simulator / marcus-simulator

---

## 1. Decisions where the board UNANIMOUSLY converged

These have 3+ seat agreement plus user-simulator ratification. Recommend Adam confirms as-is.

| # | Decision | Lock | Strength |
|---|---|---|---|
| 1 | **Monthly Update permalink default** | **Private** with explicit "Generate share link" button. Forwarding still works via PDF email attachment. T&S explicitly rejects Brand Lead's hybrid-redaction model as new attack surface. | 9/9 |
| 2 | **/crew layout grammar** | **Stripe-style table** as default. Yearbook DNA preserved in ceremonial states only: empty/first-load animation + per-agent profile page hero (96px monogram). Update CREW spec §1 prose to remove "yearbook" framing. | 9/9 |
| 3 | **White-label digest signature** | **Both, tier-gated.** Discover/Build = "Beamix" signed (non-removable). Scale = agency-primary with "Powered by Beamix" footer in Geist Mono 9pt at `--color-ink-4`. Cream paper survives. | 9/9 (with critical correction in §2) |
| 4 | **Voice canon model** | **Model B.** Agents named in product (`/home`, `/crew`, `/workspace`). "Beamix" on all external surfaces (emails, PDFs, permalinks, OG cards). Onboarding seal changes from "— your crew" to "— Beamix." | 8/9 (Designer's "spatial" model is a refinement, not dissent) |
| 5 | **Workspace tier-gating** | **All tiers, including Discover.** Workspace IS the "Beamix is alive" thesis. Gating it kills retention. | 9/9 |
| 6 | **Marketplace install** | **Gated to Build+.** Discover sees catalog read-only with "Upgrade to install" CTA. Yossi insight: Build-tier installs ARE the marketplace's gravity. | 9/9 |
| 7 | **Workflow Builder access** | **Scale-only** to build/edit workflows. Build can install pre-built workflows from marketplace. | 9/9 |
| 8 | **Truth File schema architecture** | **Shared base schema + vertical-extensions** as Zod `discriminatedUnion` keyed by `vertical_id`. Per-vertical schema versioning. Single Postgres row + JSONB. | 9/9 |
| 9 | **AI agent "Full-auto" semantics** | **Conservative.** Even on Full-auto, validator's `uncertain` outcome routes to /inbox, never publishes. Trust Architecture overrides autonomy preference. | 9/9 |
| 10 | **Pre-publication validator binding** | **Cryptographic signed-token pattern** binds `validate()` to `propose()` (60s TTL, draft-hash bound). Capability-based runtime; no `ctx.publish()` escape. Beamix's first-party agents subject to identical sandbox as future third-party. | T&S + Architect strong, no dissent |
| 11 | **L2 site-integration launch mode** | **Manual paste + Git-mode (GitHub PR) at MVP.** WordPress plugin builds in parallel during MVP sprint, ships at MVP-1.5. Marketing copy: *"Beamix writes the work. You apply it in one paste — or accept the GitHub PR."* | 8/9 (Marcus + Yossi explicitly endorse) |
| 12 | **Real-time channel transport** | **Supabase Realtime, broadcast mode.** One canonical channel per customer (`agent:runs:{customer_id}`). Polling fallback at 10s. All "agent acting" UI subscribes here. | Architect strong, no dissent |
| 13 | **Inngest contract** | **Inngest free tier at MVP launch** (50K steps/month, shorter wall-clock). Migrate to Pro ($150/mo) at ~5 paying customers OR ≥75-80% free-tier usage. One shared `runAgent` function with per-agent strategy injection. Step-level provenance to `provenance_steps` table. `emitRunState()` after each step. **Build constraint:** MVP agents must fit inside free-tier wall-clock — chunk longer work across multiple steps. *(Adam locked 2026-04-27, revising Architect's Pro-from-day-1 assumption.)* | Adam locked |
| 14 | **Day 1-6 silence cadence** | **4 emails in plain-text Monday Digest register**, all signed "— Beamix": Day 0 T+10min welcome ("Beamix is working"), Day 2 first-finding deep-link, Day 4 review-debt nudge (only if no login), Day 5 pre-Monday teaser (only if D4 unopened). Suppress any email if customer opens product on that day. **Marcus mod: skip Saturday/Sunday — productivity-tool emails on weekends feel spammy.** | 9/9 (with weekend mod) |
| 15 | **/security public page** | **YES, ship at MVP.** Stripe-style 6-minute-readable security doc covering: storage region, retention, DSAR flow, encryption, audit logs, no-training-on-customer-content DPA clause, sub-processors. **Marcus identified this as the "hidden CTO buyer" gate** for B2B SaaS sales. Trivial to build; massive deal-closer. | 9/9 |

---

## 2. Critical corrections the simulators surfaced

These are NOT relitigations — they're load-bearing details the strategic round missed. Recommend confirm.

### 2.1 — White-label is PER-CLIENT, not per-account
Yossi's churn-line. Customer Voice flagged in Round 1; Yossi simulator made it explicit: *"If `/settings/whitelabel` is one config for all my clients, Scale isn't worth $499 and I cancel before month 2."*

**Lock:** White-label config lives inside the multi-client switcher (per-client Brief tab + per-client Truth File + per-client agency branding). NOT in account-level /settings.

### 2.2 — Bulk-approve in /inbox at MVP
Yossi churn-trigger #2: *"At 12 clients, 35-minute /inbox sweeps every morning kill me by month 4."*

**Lock:** Add bulk-approve action with shift-click multi-select + Cmd+A across single-client /inbox. Cross-client bulk-approve is MVP-1.5 (needs cross-tenant safety review).

### 2.3 — Plumber DNA leakage in onboarding + /home
Marcus pain: Step 2 phone-number ceremony, /home "Connect a number" empty state, Truth File hours/service-area fields all read like local-services UX bolted onto SaaS.

**Lock:** Vertical-aware UI from Step 1. SaaS path leads with UTM tracking (no Twilio); e-commerce path leads with Twilio. Truth File required-field set differs per vertical (already covered by vertical-extensions schema in §1).

### 2.4 — Truth File integrity tripwire
T&S surfaced this as a missing pre-MVP requirement: *"Detection of Truth File corruption (Scenario C) currently has a 6-7 day gap. >50% field loss in 24h must trigger Sev-1 alert."*

**Lock:** Nightly Truth File integrity-hash comparison job. Sev-1 alert + auto-pause-all-agents on detected corruption. Add to PRD F18 (incident runbook).

### 2.5 — Agency liability / indemnification DPA clause
Yossi: *"My client sues ME, not Beamix. Without explicit indemnification in the Scale-tier DPA, I'm carrying agency-liability tax I can't price into my retainer."*

**Lock:** Scale-tier DPA includes mutual indemnification: Beamix indemnifies agency for content/factual errors that pass our pre-publication validation. Cap at lesser of (3× monthly subscription) or ($25K/incident). Legal advisor + business-lead to draft.

### 2.6 — Workflow Builder dry-run mode (Architect's elegant solution)
PM was nervous about sandbox engineering. Architect solved it: dry-run uses **real LLM execution with `dry_run: true` flag on the proposal envelope**. No mock customer site needed. The output renders as a preview in /workspace; nothing writes to customer's CMS. Saves ~3 weeks vs. building a full mock-site sandbox.

**Lock:** This is the dry-run pattern at MVP.

---

## 3. The genuine tension Adam needs to resolve

### Tension A — Workflow Builder MVP scope

Three positions on what ships at MVP day 1:

| Position | Who holds it | Argument |
|---|---|---|
| **Full DAG editor + dry-run + 3 templates day 1** | PM, Yossi, Designer | Without visual editor, Scale tier isn't worth $499. Yossi simulator explicit: "viewer-only is a stub." |
| **Viewer + template-runner only at MVP; full DAG editor MVP-1.5** | Architect | 6-week build competes with core agent runtime. Don't slip everything for one feature. |
| **Hybrid: full DAG editor + dry-run at MVP day 1; defer event triggers + workflow PUBLISHING to MVP-1.5** | T&S + Yossi (combined view) | Visual editor ships (Yossi's value). Event triggers (`competitor.published`) are extra complexity that can wait. Publishing requires cross-tenant Truth File binding currently untested — defer to MVP-1.5 after binding has 4-6 weeks of production telemetry. |

**My recommendation:** **Hybrid (position 3).** This honors Adam's "Workflow Builder in MVP" directive AND respects the T&S risk on workflow publishing. Yossi explicitly endorses this exact cut. Marcus indifferent. The Architect's deferral concern is real but the hybrid scope is achievable in MVP.

What ships day 1:
- React Flow DAG editor with hand-built nodes (clinical canvas — not Rough.js per Designer's call)
- Manual + scheduled triggers
- Dry-run mode (real LLM execution, `dry_run: true` flag)
- 3-6 Beamix-curated workflow templates as starters
- Brief grounding visible per node (Fraunces 300 on cream in inspector — Designer's distinctive move)
- Workflow versioning (linear, not semver)

What's MVP-1.5:
- Event triggers (webhooks, `competitor.published`, `score-change`)
- Publishing workflows TO marketplace (cross-tenant Truth File binding ships first)
- Workflow templates marketplace as a separate tab

### Tension B — Workflow publishing at MVP vs MVP-1.5

Adam's stated directive: *"Marketplace + ability to publish workflows there"* stays at MVP.

T&S + Yossi both recommend deferring **publishing** to MVP-1.5. Adam's marketplace stays — users can browse, install Beamix-curated workflows, see install counts. But user-published workflows wait until cross-tenant safety binding has runtime telemetry.

**My recommendation:** **Defer publishing to MVP-1.5** against Adam's stated direction. This is the only synthesis recommendation that contradicts Adam's prior word — surfacing it explicitly so Adam can override or accept.

Reasoning: every other safety mechanism we ship is theatre if a published workflow can compose claims that no single agent could publish alone. T&S's "single biggest under-weighted risk on the current spec set." Yossi (the user this would serve) explicitly fine with the deferral.

If Adam INSISTS on publishing at MVP: T&S requires the cross-tenant Truth File binding test ship 4 weeks before workflow publishing opens, and the first 30 days of publishing is "Yossi-only invite-list" not open. This adds ~2 weeks to MVP timeline.

---

## 4. Open questions only Adam can lock

1. **Workflow Builder MVP scope** — confirm hybrid (position 3 above)?
2. **Workflow publishing at MVP or defer to MVP-1.5** — confirm deferral, or insist on MVP with the Yossi-only invite-list constraint?
3. **Agency indemnification DPA clause** — comfort with the cap I proposed (lesser of 3× monthly or $25K/incident), or different number?
4. **/security public page** — confirm ship at MVP, requires DevOps + technical-writer ~3 person-days?
5. **Day 4 weekend-skip rule** — confirm we don't send Day 4 cadence email on Saturday/Sunday?

---

## 5. PRD + spec amendments required

When Adam confirms, the following docs need updates:

| Doc | What changes |
|---|---|
| **PRD-wedge-launch-v1.md** | F1 (permalink private locked); F3 (Truth File schema = shared base + vertical-extensions); F5/new-F19 (Workflow Builder MVP scope = full DAG editor, no event triggers/publishing); F12 (Lead Attribution Step 2 vertical-aware: SaaS=UTM-first, e-comm=Twilio-first); F14 (Day 1-6 cadence added, weekend rule); F17 (Marketplace re-spec without rewards; install gated Build+); F18 (incident runbook adds Truth File integrity tripwire); new F20 (/security public page); new F21 (Scale-tier DPA + indemnification clause) |
| **CREW-design-v1.md** | §1 prose update (drop "yearbook" framing — yearbook is ceremonial state only); §2.5 confirms table; §4 Workflow Builder updated to MVP-locked scope |
| **EDITORIAL-surfaces-design-v1.md** | §3.2 Monthly Update private-default override removed; §3.3 white-label tier-gated rendering spec'd; signature line "— Beamix" canonical |
| **DESIGN-SYSTEM-v1.md** | §2.4 agent monogram colors clarified (Margin = data surface, AI-purple ban applies to chrome only); §1.3 /inbox max-width 1280 (matches /inbox spec); voice canon Model B noted as cross-spec rule |
| **ONBOARDING-design-v1.md** | §2.2 vertical-aware Step 2 (SaaS-UTM-first / e-comm-Twilio-first); §2.4 Truth File required-fields per vertical; signature changes from "— your crew" to "— Beamix" |
| **INBOX-WORKSPACE-design-v1.md** | A2 max-width 1280 confirmed; A4 bulk-approve action with multi-select + Cmd+A ships at MVP |
| **MARKETPLACE-spec-v1.md** | §3 Reward system removed; §1 Discovery without leaderboards re-spec; §2.8 review pipeline simplified to 3 stages at MVP; publishing flow deferred to MVP-1.5 (depending on Adam) |
| **HOME-design-v1.md** | Tier badge string locked: "Discover · 3 engines · 4 agents" / "Build · 6 engines · 6 agents" / "Scale · 11 engines · 6 agents (+ 12 locked)" — eliminates agent-count contradiction; vertical-aware empty state for Lead Attribution |
| **SCANS-COMPETITORS-design-v1.md** | 4 lenses re-spec'd as action-tags (audit §2.7) not agent-attribution buckets |
| **AUDIT-CONSOLIDATED.md** | Mark resolved: BLOCKERS #1, 2, 3, 4 (with Truth File schema lock), 16, 17, 18, 19. Remaining BLOCKERS: 5, 6, 7-11 (journey seams), 13 (L2 mode confirmed manual+Git), 14 (Inngest confirmed), 15 (chip-slot extraction still product gap) |

---

## 6. Tier 0 must-do-first list (Build Lead's pre-build sprint)

Before any frontend or backend worker writes a component:

1. **Canonical type files** (`apps/web/types/`): `EvidenceCard.ts`, `Brief.ts`, `TruthFile.ts`, `ProvenanceEnvelope.ts`, `AgentRunState.ts` — 1 day
2. **Supabase schema migration** (all Tier 0 tables + RLS): briefs / truth_files / artifact_ledger / margin_notes / agent_memory (pgvector) / provenance_steps / agent_run_state / marketplace_listings / marketplace_installs / marketplace_reviews / workflows / workflow_nodes / workflow_edges / workflow_versions — 3 days
3. **Inngest free-tier setup + `runAgent` skeleton + smoke test** + free-tier usage telemetry to dashboard for migration trigger — 1 day
4. **Supabase Realtime channel + client hook + polling fallback** — 1 day
5. **Pre-publication validator service** (separate process; cryptographic signed-token primitive) — 3 days
6. **Truth File integrity-hash nightly job** — 1 day
7. **Build-time pipeline:** opentype.js Fraunces signature extractor + per-agent Rough.js monogram generator + per-customer seal generator (Inngest job at signup) — 3 days
8. **Cost ceiling instrumentation** (per-customer monthly scan-cost ledger + alarm) — 2 days
9. **Resend setup + send-volume tier + bounce handler + DKIM/SPF/DMARC on notify.beamix.tech** — 1 day
10. **DPA + /security page + privacy posture documentation** (technical-writer + legal advisor) — 3 days

**Total:** 19 person-days of plumbing before MVP build sprint. Quality bar holds; foundation makes the next 6-8 weeks of feature work safe.

---

## 7. What the simulators changed about my model of Beamix

- **Marcus's hidden CTO buyer (Aria) is a load-bearing persona.** /security page is not a polish item — it's the gate to Marcus's renewal. Future board rounds need an "Aria simulator" as a fourth voice.
- **Yossi's churn-trigger isn't /crew or marketplace — it's /inbox volume at 12 clients.** Bulk-approve is THE retention feature for the Scale tier, not white-label or Workflow Builder. Both still matter; bulk-approve is just the floor.
- **The Day 14 attributed-click email beats the Day 30 Monthly Update for evangelism** (Marcus). Build a library of 4-6 event-triggered emails (first attributed click, first signup, first competitor displaced, threshold crossings) — cheaper to ship than the Monthly Update, hits harder per dollar. Add to PRD F14.
- **The Lead Attribution Loop's claim "47 calls and 12 form submissions" is not buildable as spec'd.** Audit §2.6 + Marcus's walkthrough confirm: form attribution requires a customer-site JS snippet not yet specified. Honest copy at MVP: "23 calls + 12 UTM-attributed clicks" — drop "form submissions" until the snippet ships at MVP-1.5.

---

*End of synthesis. Ready for Adam's confirms.*

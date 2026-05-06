---
date: 2026-04-28
lead: ceo
task: board-meeting-locks
outcome: COMPLETE
agents_used: [research-lead, design-lead, product-lead, growth-lead, ai-engineer, backend-developer, security-engineer, general-purpose-yossi, general-purpose-marcus]
decisions:
  - key: permalink_default
    value: PRIVATE with explicit "Generate share link"
    reason: 9/9 board converged; T&S rejected hybrid-redaction model as new attack surface; PDF email attachment preserves forwarding mechanic
  - key: crew_layout
    value: Stripe-style table; yearbook DNA preserved as ceremonial state only
    reason: Designer + Yossi + Marcus + Customer Voice all converged; cards force chunking that costs comprehension at 18-row scale
  - key: white_label_signature
    value: Both, tier-gated; Discover/Build = Beamix-only; Scale = agency-primary with "Powered by Beamix" footer in Geist Mono 9pt; cream paper survives white-labeling; config is PER-CLIENT not per-account
    reason: Yossi explicit churn-trigger if per-account; Designer's contested cream-survives position accepted by board
  - key: voice_canon_model
    value: Model B — agents named in product (/home, /crew, /workspace); "Beamix" on emails/PDFs/permalinks; onboarding seal "— Beamix" not "— your crew"
    reason: Brand-tight on most-forwarded artifacts; agents-as-characters wins inside product where customer is oriented
  - key: workspace_tier
    value: All tiers including Discover
    reason: Workspace is the "Beamix is alive" thesis; gating kills retention
  - key: marketplace_install_tier
    value: Build+ only; Discover sees catalog read-only with upgrade CTA
    reason: Customer Voice insight — Build-tier installs ARE the marketplace's gravity
  - key: workflow_builder_tier
    value: Scale-only to build/edit; Build can install pre-built workflows
    reason: $499 tier needs killer feature; Yossi-archetype primary user
  - key: workflow_builder_mvp_scope
    value: Hybrid — full React Flow DAG editor + dry-run + 3-6 templates + manual/scheduled triggers ship day 1; defer event triggers + workflow publishing to MVP-1.5
    reason: PM (full) vs Architect (viewer-only) tension; Yossi's exact ask is the cut; T&S backed publishing deferral
  - key: workflow_publishing_defer
    value: Defer to MVP-1.5 (cross-tenant Truth File binding ships first; 4 weeks production telemetry then publishing opens)
    reason: T&S non-negotiable cross-tenant safety; Yossi explicitly fine with deferral; Adam confirmed against his prior "publishing stays" direction
  - key: truth_file_schema
    value: Shared base + vertical-extensions (Zod discriminatedUnion keyed by vertical_id, per-vertical schema versioning, single Postgres row + JSONB)
    reason: AI Engineer's deep dive; supports 12-vertical scale + Yossi's multi-vertical agency clients
  - key: full_auto_semantics
    value: Conservative — uncertain → /inbox always, even on Full-auto
    reason: AI Engineer's hardest open question; Trust Architecture overrides autonomy preference
  - key: validator_binding
    value: Cryptographic signed-token (60s TTL, draft-hash bound) binds validate() to propose(); first-party agents in same sandbox as future third-party
    reason: T&S — "the SDK refuses to publish without conformance" must be runtime-enforced not aspirational
  - key: l2_site_integration_mvp
    value: Manual paste + Git-mode (GitHub PR) at MVP; WordPress plugin parallel-build, ships MVP-1.5
    reason: Marcus + Yossi both endorse; honest copy "Beamix writes the work; you apply it in one paste — or accept the GitHub PR"
  - key: realtime_channel
    value: Supabase Realtime broadcast, one channel per customer (agent:runs:{customer_id}), polling fallback at 10s
    reason: Architect strong, no dissent
  - key: inngest_tier
    value: Free tier at MVP launch (50K steps/month); migrate to Pro at ~5 paying customers OR 75-80% free-tier usage
    reason: Adam locked separately on 2026-04-27 to override Architect's Pro-from-day-1 assumption
  - key: day_1_6_cadence
    value: 4 emails plain-text Beamix register (D0+10min welcome / D2 first-finding / D4 review-debt nudge / D5 pre-Monday teaser); skip Saturday/Sunday; suppress if customer logged in that day
    reason: Marcus walkthrough surfaced Saturday/Sunday emails feel spammy from productivity tools
  - key: security_public_page
    value: Ship at MVP; Stripe-style 6-min readable security/privacy page covering storage, retention, DSAR, encryption, audit, DPA, sub-processors
    reason: Marcus identified as "hidden CTO buyer" gate for B2B SaaS sales; ~3 person-days build; deal-closer
  - key: per_client_white_label
    value: White-label config lives inside multi-client switcher per-client; NOT per-account
    reason: Yossi explicit churn-trigger if per-account
  - key: bulk_approve_inbox_mvp
    value: Bulk-approve at MVP within single-client view (multi-select + Cmd+A); cross-client bulk = MVP-1.5
    reason: Yossi churn-trigger #2 — at 12 clients 35-min /inbox sweeps kill agency by month 4
  - key: vertical_aware_onboarding
    value: Vertical-aware UI from Step 1; SaaS = UTM-first Step 2 (no Twilio); e-comm = Twilio-first; Truth File required-fields differ per vertical
    reason: Marcus surfaced "plumber DNA leakage" — phone numbers and hours/service-area read SaaS-hostile
  - key: truth_file_integrity_hash
    value: Nightly Truth File integrity-hash comparison job; Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h
    reason: T&S surfaced 6-7 day detection gap on TF corruption (Scenario C)
  - key: agency_indemnification_dpa
    value: Scale-tier DPA includes mutual indemnification — Beamix indemnifies for content errors passing pre-pub validation; cap lesser of (3× monthly) or ($25K/incident)
    reason: Yossi flag — agency carries client-liability without explicit DPA clause
  - key: workflow_dry_run_pattern
    value: Real LLM execution with dry_run:true flag on proposal envelope; output renders in /workspace; nothing writes to customer CMS
    reason: Architect's elegant solve; saves 3 weeks vs full mock-site sandbox
context_for_next_session: "All 23 board decisions locked 2026-04-28. PRD v2 filed at docs/08-agents_work/2026-04-28-PRD-wedge-launch-v2.md (12K words). Build is unblocked for Tier 0 sprint (~19 person-days plumbing). Remaining cascade: 9 design specs need small surgical edits to remove contradictions (deferred — synthesis doc is authoritative). Branch ceo-1-1777310663; PR #52 still open with prior CEO's commits — needs to be either merged or closed and a fresh PR opened from this branch. Recommend next CEO: (a) commit + push the board outputs + PRD v2 to a new PR, (b) ask Adam if he wants the design-spec cascade done now or as Build Lead encounters them, (c) hand to Build Lead to start Tier 0 sprint."
---

# CEO Session — Board Meeting Locks
2026-04-28

## What happened

Adam asked for a multi-seat board meeting to discuss six explicitly-named topics + my additions. I deployed 9 specialized agent seats across 3 rounds:

**Round 1 (4 parallel — strategic decisions):** research-lead as Customer Voice composite (Marcus + Dani + Yossi voices) · design-lead · product-lead · growth-lead.

**Round 2 (3 parallel — system depth):** ai-engineer (Truth File deep architecture) · backend-developer (Workflow Builder + marketplace-without-rewards + infra) · security-engineer (privacy + enforcement + incident scenarios).

**Round 3 (2 parallel — user simulators):** general-purpose as Yossi simulator · general-purpose as Marcus simulator.

Each agent filed a structured report. Total output: ~25,000 words across 9 reports + my synthesis.

Adam then confirmed all 23 board decisions on 2026-04-28. PRD v2 cascaded all changes into a refreshed canonical spec.

## Files written this session

**Reports (9):**
- `docs/08-agents_work/2026-04-27-BOARD-customer-voice.md`
- `docs/08-agents_work/2026-04-27-BOARD-designer.md`
- `docs/08-agents_work/2026-04-27-BOARD-product-lead.md`
- `docs/08-agents_work/2026-04-27-BOARD-brand-distribution.md`
- `docs/08-agents_work/2026-04-27-BOARD-ai-engineer-truth-file.md`
- `docs/08-agents_work/2026-04-27-BOARD-architect.md`
- `docs/08-agents_work/2026-04-27-BOARD-trust-safety.md`
- `docs/08-agents_work/2026-04-27-BOARD-yossi-simulator.md`
- `docs/08-agents_work/2026-04-27-BOARD-marcus-simulator.md`

**Synthesis + cascade:**
- `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md` (CEO synthesis; status: LOCKED)
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v2.md` (~12,000 words; supersedes v1)
- `docs/08-agents_work/sessions/2026-04-28-ceo-board-meeting-locks.md` (this file)

**Memory + decisions:**
- `.claude/memory/DECISIONS.md` updated with consolidated 2026-04-28 board lock entry
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_inngest_tier_strategy.md`
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_voice_canon_model_b.md`
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_white_label_per_client.md`
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_workflow_builder_mvp_scope.md`
- `docs/00-brain/log.md` appended

## Build status

Tier 0 unblocked. ~19 person-days of plumbing before MVP build sprint can start. Build Lead can dispatch from PRD v2 + the synthesis doc.

## Open follow-ups

1. **Design-spec cascade deferred** — 6 design docs still have small surgical edits to apply (drop "yearbook" framing in CREW §1, mark Monthly Update private in EDITORIAL §3.2, signature → "— Beamix" in ONBOARDING, max-width 1280 in INBOX-WORKSPACE, tier badge canonical strings in HOME, lenses as action-tags in SCANS-COMPETITORS, voice canon Model B as cross-spec rule in DESIGN-SYSTEM). Synthesis doc is authoritative for now; specs catch up at Build Lead's pace.

2. **PR #52 status** — currently still open from prior CEO's branch. Either merge or close + open fresh PR for this branch's outputs. Adam to decide.

3. **Cancel + post-cancel + data export flow (Q6 from T&S)** — fully spec'd in T&S report but not yet folded into PRD v2 as a feature. Add as F22 in v2.1.

4. **Aria simulator (Marcus's CTO co-founder) recommended for next board round** — surfaced as a hidden persona controlling B2B SaaS Build → Scale upgrade decisions.

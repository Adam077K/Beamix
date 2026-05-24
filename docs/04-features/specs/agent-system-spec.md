# Beamix Agent System — INDEX

> **Updated 2026-05-23 — agency pivot.** This file is an INDEX pointing to the 7 net-new customer-facing agent PRDs locked in the agency-pivot grill (DECISIONS.md 2026-05-23 entry, decision #15). The pre-rethink 16-agent A1–A16 system is archived at `docs/_archive/2026-04-pre-rethink/specs/agent-system-spec.md`.

## Customer-facing agent fleet (post agency pivot)

**7 NEW agents** (this index links to each PRD), **4 REPURPOSED** existing agents (Content/FAQ, Schema, Citation, Visibility Tracker — see `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`), **1 KEPT but de-emphasized** (Competitor Intelligence).

The customer never sees agent names. Per Voice Canon Model B, all customer-facing surfaces sign as "— Beamix" (singular). Agent names exist only in internal docs, code, and Adam's internal review tooling.

### Wave 1 (foundation)

1. **[Discovery Agent](./agent-discovery.md)** — 30-min onboarding voice+chat call. Captures brand fingerprint, voice samples, ICP, service catalog, competitors, approval style, hard-nos. Generates Draft Brand Brief. Adam-reviews through customer #50.
2. **[Brand-Brief Manager Agent](./agent-brand-brief-manager.md)** — Single source of truth for every customer's voice + identity + ICP. Versions the brief; serves canonical reads to every downstream agent; detects drift; YMYL-field guarded.

### Wave 2 (deliverable flow)

3. **[Approval-Gate Writer Agent](./agent-approval-gate-writer.md)** — Turns finished work into 1-click approve/reject cards. Drafts email-as-them outreach bodies. Auto-skip-on-deadline for outreach; auto-publish-on-deadline configurable for content.
4. **[Digest Writer Agent](./agent-digest-writer.md)** — Composes weekly digest email. Outcomes, approvals, "how we got this" traceability. Voice Canon Model B. The single most refund-critical artifact.
5. **[Customer Success Agent](./agent-customer-success.md)** — In-product chat. Full context (brief + work_log + scans + billing). De-escalates refund-considering panics. Read-only on billing; routes mutation to Paddle portal + Adam (≤50).

### Wave 3 (publishing + strategy)

6. **[Publisher Agent](./agent-publisher.md)** — Hands-on-keyboard: pushes approved work to WordPress / Shopify / Webflow / Ghost / GBP / Yelp / Apple Maps / SendGrid sub-account / Schema-via-GTM. Paste-ready instructions for Wix / Squarespace / custom. **Irreversible** risk tier.
7. **[Strategy Agent](./agent-strategy.md)** — Monthly strategy memo (Professional tier $2,499) + customer-call agenda. Adam-led through customer #50, then agent-led with sample audit. Opus 4.7 reasoning.

## Cross-fleet rules

- Every artifact carries `generated_against_brief_version_id` for traceability.
- Voice Canon Model B: customer-facing surfaces sign "— Beamix". Internal logs use agent names.
- YMYL content (medical/legal/financial) is `always_human` approval regardless of tier or customer preference.
- Outreach emails are NEVER auto-sent. Explicit Approval-Gate Writer approval required.
- No emojis. No AI disclosure / no AI labels. (Adam memory rules)
- No credit counters or "AI Runs" UI fragments visible to customer.

## Authority

- **Locked decisions:** `.claude/memory/DECISIONS.md` 2026-05-23 entry (decisions #2, #3, #4, #7, #8, #9, #11, #15)
- **Source session:** `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`
- **Pricing matrix:** `docs/product-rethink-2026-04-09/06-PRICING-V2.md`
- **Agent roster (full, including repurposed):** `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md`
- **UX architecture:** `docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md`
- **Brand voice (Canon Model B):** `.claude/skills/beamix-voice-canon/SKILL.md`

## Pre-rethink reference (archived)

- Old 16-agent A1–A16 fleet under self-serve $79/$189/$499 framing: `docs/_archive/2026-04-pre-rethink/specs/agent-system-spec.md`
- 11-agent rethink fleet under pre-agency-pivot 14-day money-back framing: `docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md` (historical sections — see banner)

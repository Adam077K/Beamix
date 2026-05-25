---
date: 2026-05-23
agent: cmo
session_slug: agency-pivot-copy-update
status: COMPLETE
qa_verdict: PENDING (Adam to review before Framer publish)
linear_ticket: n/a
source_decisions: DECISIONS.md [2026-05-23] agency pivot
---

# CMO Session — Agency Pivot Copy Update

## Task

Update all existing marketing assets to reflect the 15 locked decisions from the 2026-05-23 agency-pivot grill session. Rewrite done-for-you positioning, 3 vertical landing pages, DM templates, FAQ architecture, content playbook, GTM strategy, channels, and USER-INSIGHTS.

## Files edited (in place)

1. `docs/05-marketing/MESSAGING.md` — Master messaging framework rewritten for agency category, done-for-you positioning, 3 vertical value propositions, updated pricing ($499/$999/$1,499/$2,499), 60-day guarantee locked copy
2. `docs/05-marketing/GTM_STRATEGY.md` — Redirect stub replaced with full GTM strategy: beachhead motion customers 1–50, warm network + cold DM + content + referral, discovery call funnel, no paid until #50
3. `docs/05-marketing/CHANNELS.md` — Redirect stub replaced with channel mix: LinkedIn (Adam's profile), Israeli warm network, cold DMs, vertical communities (Dentaltown/Above the Law/IndieHackers/SaaStr)
4. `docs/05-marketing/CONTENT_PLAYBOOK.md` — Updated: 3 posts/week cadence (one per vertical), State of AI Search report (MVP+90), agency framing requirements, no agent names in content, updated content hooks for cold DMs
5. `docs/05-marketing/CONTENT_STYLE_GUIDE.md` — Added agency framing rules section, no AI disclosure rule, updated vertical voice adaptations for 3 launch ICPs
6. `docs/05-marketing/SEO_STRATEGY.md` — Redirect stub replaced with full SEO strategy: GEO agency keywords, 3-vertical keyword clusters, content architecture, technical GEO requirements
7. `docs/05-marketing/TOPIC_MAP.md` — Restructured: 3 vertical pillar pages (SaaS/Legal/Dental), 60-day guarantee cluster, State of AI Search data cluster, deprecated v1.0 tool-era articles
8. `docs/05-marketing/FAQ_ARCHITECTURE.md` — Hub 2 fully rewritten for agency flow, Hub 3 updated for new pricing and 60-day guarantee, Hub 4 rewritten for 3 launch ICPs, new questions added for done-for-you model
9. `docs/05-marketing/page-copy-how-it-works.md` — FULL REWRITE: agency flow (scan → discovery call → onboarding → autopilot delivery → weekly digest → outcomes dashboard)
10. `docs/05-marketing/page-copy-why-beamix.md` — FULL REWRITE: done-for-you positioning, 3 vertical proofs, 60-day guarantee anchor, updated pricing comparison
11. `.claude/memory/USER-INSIGHTS.md` — Appended 5 research findings from 2026-05-23: legal CPL $649-$784, 73% B2B buyers use AI, 14% SaaS mature AI strategy, Footbridge 90-day analog, Profound $1B Series C

## Files created (new)

12. `docs/05-marketing/landing/saas.md` — B2B SaaS landing page copy (founder + VP Marketing voice)
13. `docs/05-marketing/landing/legal.md` — Solo/small law firm landing page copy (managing partner voice)
14. `docs/05-marketing/landing/dental.md` — Single-location dental landing page copy (owner-dentist voice)
15. `docs/05-marketing/handoff/discovery-dm-templates.md` — 3 cold DM templates (one per vertical) + follow-up + instructions

## Consistency findings (contradictions flagged and resolved)

- **$79/$189/$499 pricing** — appeared in MESSAGING.md, FAQ_ARCHITECTURE.md, page-copy-why-beamix.md. All updated to $499/$999/$1,499/$2,499.
- **7-day trial / 14-day money-back** — appeared in FAQ_ARCHITECTURE.md (Q23, Q24, Q25) and MESSAGING.md. All replaced with 60-day no-questions money-back guarantee.
- **Agent names in customer-facing copy** — appeared in page-copy-how-it-works.md ("Content Writer," "Schema Optimizer," "FAQ Agent," "Competitor Intelligence"). All replaced with outcomes language ("we publish schema markup," "we write FAQ content").
- **"Platform" and "tool" framing** — appeared throughout prior versions. Replaced with "agency" and "service" framing across all files.
- **"No agency required" subheadline** — appeared in MESSAGING.md v1.0 pricing section. Removed. Beamix is the agency.
- **"Scan every 3 days / Daily scans" language** — old product scan frequency from tool era. Removed from FAQ and replaced with agency delivery cadence language.
- **"AI Runs" credit system** — appeared in FAQ_ARCHITECTURE.md Hub 3. Removed. Agency model has no credit counters.

## Customer language used (from USER-INSIGHTS.md)

- "I have no idea if ChatGPT mentions us" — used in SaaS value prop framing
- "I'm paying for SEO and it's not reaching AI" — used in dental value prop section 3
- "My competitor is getting calls I should be getting" — used in legal hero and value prop
- "Just do it for me" — used as the organizing principle for all done-for-you framing
- Legal CPL $649–$784 — used verbatim in legal landing page and MESSAGING.md
- 73% B2B buyers use AI — used verbatim in SaaS landing hero and MESSAGING.md

## Decisions made

- **CTAs updated across all pages** — from "Start Free Trial" to "Get a Free Scan →" — the free scan is the top of funnel; the CTA drives to scan + discovery call, not checkout
- **Guarantee language used verbatim per locked copy** — EN and HE versions appear in: MESSAGING.md, FAQ_ARCHITECTURE.md (Q19, Q22), page-copy-how-it-works.md (Section 8), page-copy-why-beamix.md (Section 6), all 3 landing pages
- **DM templates file placed in `handoff/` (not `landing/`)** — operational assets go in handoff, copy assets in landing
- **USER-INSIGHTS.md: 5 bullet max enforced** — did not exceed the cap

## Brand voice check

- No buzzwords present in any file
- No agent names exposed in customer-facing copy
- No "AI-generated," "AI-powered," or disclosure labels
- No "$79/$189/$499" pricing references remaining
- No "7-day trial" or "14-day money-back" language remaining
- "We" framing used throughout for agency actions
- HE guarantee copy present verbatim in all appropriate locations
- All CTAs are specific: "Get a Free Scan →" not "Get started"

## QA note

These are documentation/copy files, not code. No PR or Framer publish required for this session. Adam reviews before the Framer marketing site is updated to reflect this copy. QA-Lead should review before any Framer page updates go live.

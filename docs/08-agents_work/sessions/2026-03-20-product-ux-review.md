date: 2026-03-20
agent: product-lead
task: product-ux-review
status: complete

summary: >
  Full product UX review of the Beamix user journey (scan → signup → onboarding → dashboard → agents → recommendations).
  Found 18 issues across 6 categories. 4 are P1 blockers that break core loops.

files_reviewed:
  - src/app/scan/page.tsx
  - src/components/scan/scan-results-client.tsx
  - src/app/api/scan/start/route.ts
  - src/components/onboarding/onboarding-flow.tsx
  - src/app/api/onboarding/complete/route.ts
  - src/components/dashboard/dashboard-overview.tsx
  - src/components/dashboard/agents-view.tsx
  - src/components/dashboard/agent-modal.tsx
  - src/lib/agents/config.ts
  - src/lib/scan/tier-config.ts
  - src/app/(protected)/dashboard/recommendations/page.tsx
  - src/app/(protected)/dashboard/settings/page.tsx

key_findings:
  - GAP-1: "Run Scan" button links to /dashboard/scan which does not exist (404)
  - CREDIT-2: Trialing users see "upgrade" banner on recommendations page due to plan_tier=null check
  - GAP-3: "Run Agent" on recommendations links to generic /dashboard/agents, not the specific agent
  - GAP-5: Engine name case mismatch (DB=lowercase, map key=PascalCase) causes all engine bars to show "not mentioned"
  - CREDIT-3: Pro-only agents (social-strategy, competitor-intelligence) not gated for Starter users
  - MISSING-3: No trial countdown visible anywhere in the dashboard

output: docs/04-features/specs/product-ux-review-2026-03-20.md

handoff_to: build-lead
handoff_note: >
  Full review doc at docs/04-features/specs/product-ux-review-2026-03-20.md.
  P1 fixes require no design work and can be shipped in 3 days.
  Start with CREDIT-2 (1-line fix, high trust impact) and GAP-1 (core loop blocker).

---
date: 2026-04-20
agent: product-lead
task: wave3-page-inventory
status: COMPLETE
---

## Summary
Produced complete Wave 3 page inventory and IA rethink for Beamix dashboard. Audited all 12 routes in apps/web (7 protected, 3 auth, 2 public), Wave 2 branches, DATABASE_SCHEMA.md, UX-ARCHITECTURE.md, and board decisions. Identified that all 7 protected pages are 100% mock data with zero Supabase queries.

## Files Written
- `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md`

## Key Findings
1. Every protected page (Home, Inbox, Scans, Automation, Archive, Competitors, Settings) serves mock data only. Product cannot be trusted as real until DB wiring lands.
2. Workspace route exists on feat/rebuild-inbox-workspace-v2 but is not on main and not wired from Inbox PreviewPane. This is the "Workspace Adam remembers."
3. /onboarding is missing from apps/web entirely — critical for Day-1 auto-trigger pipeline.
4. Score display in free scan uses 0-10 scale (mock 6.7); board spec says 0-100.
5. 10 PRD gaps (G1-G10) identified that need Adam decisions before full Wave 3 implementation.

## Top RICE Changes
- Consequence copy replacement (RICE 360) — near-zero effort, massive perception change
- Merge Workspace + wire Inbox button (RICE 204)
- Wire /home to Supabase (RICE 180)
- Add /onboarding route (RICE 180)

## PRD Gaps Requiring Adam Decision (3 hardest)
- G1: Suggestions table schema (blocks Home suggestions queue)
- G3: Competitors table schema (blocks Add Competitor flow)
- G8: Preview account routing mechanism (blocks Onboarding gate)

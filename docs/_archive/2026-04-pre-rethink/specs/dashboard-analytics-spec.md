# Dashboard & Analytics Technical Spec [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** Old page map (Rankings, Recommendations, Brand Narrative, Content Performance Widget, `/dashboard/ai-readiness`, `/dashboard/recommendations`) replaced by the new 7-page dashboard. Route map and component architecture described here are superseded.
> **Current docs:** `docs/product-rethink-2026-04-09/` · `docs/04-features/specs/dashboard-7-pages.md`

---

Original document: Beamix — Dashboard & Analytics Technical Spec
Original author: Atlas (CTO)
Original date: 2026-03-08

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- Full route map including `/dashboard/rankings`, `/dashboard/recommendations`, `/dashboard/ai-readiness`, `/dashboard/content`
- Rankings page: per-query per-engine drill-down table, sparkline trend charts, competitor positions per query
- Recommendations system: `recommendations` table, `suggested_agent` column, "Run Agent" buttons
- Prompt Volume Analytics, Citation Analytics, Content Performance Widget
- Brand Narrative Analytics (A16)
- Real-time updates via Supabase Realtime on `scans` and `content_items`
- React Query stale times per widget zone

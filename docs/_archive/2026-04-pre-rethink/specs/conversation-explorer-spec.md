# Conversation Explorer Technical Spec [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** "Conversation Explorer" / Ask Beamix feature (`/dashboard/explore`) killed in April 2026 rethink. Old tier names (Starter/Pro/Business) and pricing ($49/$149/$349) replaced, though spec had a pricing update note at top.
> **Current docs:** `docs/product-rethink-2026-04-09/`

---

Original document: Beamix — Conversation Explorer Technical Spec
Original author: Atlas (CTO)
Original date: 2026-03-08
Original status: Ready for implementation (build after F3)

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- `/dashboard/explore` page: Pro/Business tier, LLM-generated query exploration
- `exploration_cache` table: SHA-256 cache key, 24h TTL, shared across users
- `POST /api/analytics/explore` — Haiku pipeline (~$0.003/session), Perplexity Live pipeline (Business tier, 0.5 credits)
- `ExploreForm`, `ExploreResultsGrid`, `ExploreResultsCard`, `RelevanceBadge` components
- Location normalization: Hebrew/English city name aliases → canonical slug
- Phase 2: Perplexity Sonar Pro pipeline, source toggle, credit deduction

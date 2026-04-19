# Competitive Intelligence Feature Specification [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** Competitor Intelligence Agent (A8) from the old 16-agent system replaced. Old tier limits (Starter:3/Pro:5/Business:10 competitors) and old tier names replaced. The Competitors page concept survives in the new 7-page dashboard but with different agent architecture.
> **Current docs:** `docs/product-rethink-2026-04-09/` · `docs/04-features/specs/dashboard-7-pages.md`

---

Original document: Competitive Intelligence Feature Specification
Original author: Atlas (CTO)
Original date: 2026-03-08
Original status: Ready for implementation

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- A8 Competitor Intelligence Agent: multi-engine scan, comparative analysis (Sonnet), strategic report — ~$3–6 per run
- 24h competitor research cache (shared across users by domain)
- `competitors`, `competitor_scans`, `competitor_share_of_voice` tables
- Stage 5 scan pipeline: Haiku extracts competitor names from AI responses, fuzzy matching
- Tier limits: Starter 3, Pro 5, Business 10 tracked competitors
- `/dashboard/competitors` page: share of voice chart, gap analysis view, comparison table
- Competitor Weakness Alert + workflow chain (Competitor Alert Response)

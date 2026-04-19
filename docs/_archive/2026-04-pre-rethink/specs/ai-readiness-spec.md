# AI Readiness Feature Spec [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** `/dashboard/ai-readiness` as a standalone nav page removed in April 2026 rethink. New 7-page dashboard (Home, Inbox, Scans, Automation, Archive, Competitors, Settings) does not include a dedicated AI Readiness page.
> **Current docs:** `docs/product-rethink-2026-04-09/` · `docs/04-features/specs/dashboard-7-pages.md`

---

Original document: AI Readiness Feature Spec
Original author: Atlas (CTO)
Original date: March 2026
Original status: Launch Critical

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- `/dashboard/ai-readiness` page with 5-category scoring (Content Quality 30%, Technical Structure 25%, Authority Signals 20%, Semantic Alignment 15%, AI Accessibility 10%)
- AI Readiness Auditor agent (A11), `agent_type = 'ai_readiness'`, 1 credit
- 3-stage pipeline: cheerio deep crawl → algorithmic scoring → Claude Sonnet report generation
- `ai_readiness_history` table for score time series
- "Fix with Agent" button mapping to specific agent types
- Moat Builder phase: milestone system, celebration UX (confetti)

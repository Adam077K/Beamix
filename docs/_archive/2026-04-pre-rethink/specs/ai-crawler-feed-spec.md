# AI Crawler Feed Technical Spec [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** LLMS.txt generator (A10) and AI Crawler Feed feature killed in April 2026 rethink. Cloudflare bot detection feature deprioritized. Old tier names (Starter/Pro/Business at $49/$149/$349) replaced.
> **Current docs:** `docs/product-rethink-2026-04-09/`

---

Original document: Beamix — AI Crawler Feed Technical Spec
Original author: Atlas (CTO)
Original date: 2026-03-08
Original status: Ready for implementation

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- `ai_crawler_events` table: per (business, bot, page_path, day) aggregated crawl counts
- Cloudflare Analytics GraphQL polling via daily Inngest cron
- 10 AI bot user-agent patterns in `src/constants/ai-bots.ts`
- `CrawlerFeedWidget`, `CrawlerFeedTable`, `CrawlerBotBadge`, `UncrawledPagesAlert` components
- Tier gate: Pro/Business only
- Phase 2: Vercel log drain, Haiku narrative summary

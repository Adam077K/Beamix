# Blog Infrastructure Spec [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** Blog is now on the Framer marketing site, not in the Next.js product repo. BlogAgent (old `blog_writer` A2) is part of the archived 16-agent system. The `/dashboard/blog` CMS and programmatic SEO templates described here are no longer the active approach.
> **Current docs:** `docs/product-rethink-2026-04-09/` — marketing site is Framer (separate project)

---

Original document: Beamix — Blog Infrastructure Spec
Original author: Iris (CEO) + Founder
Original date: 2026-02-28, updated 2026-03-06
Original status: Updated — Blog is built (Phase 11 complete)

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- `blog_posts` table schema with ISR, MDX rendering, sitemap
- `/dashboard/blog` CMS (list, create/edit, publish flow)
- BlogAgent (A2 — `blog_writer`) auto-draft integration
- 5 programmatic SEO templates (geo-ranking-engine-industry-city, geo-audit-industry-city, invisible-engine-industry, vs-competitor-ai-search, ai-search-guide-industry)
- `/blog`, `/blog/[slug]`, `/blog/category/[cat]` Next.js routes

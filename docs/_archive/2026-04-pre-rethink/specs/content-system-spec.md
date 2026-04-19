# Content System Feature Specification [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** Content Library as a standalone nav page (`/dashboard/content`) removed in April 2026 rethink. In the new 7-page dashboard, generated content surfaces through Inbox (pending review) and Archive (published/dismissed). Old agents A13/A14/A15 and `content_type` column references archived.
> **Current docs:** `docs/product-rethink-2026-04-09/` · `docs/04-features/specs/dashboard-7-pages.md`

---

Original document: Content System Feature Specification
Original author: Atlas (CTO)
Original date: 2026-03-08

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- `/dashboard/content` as a dedicated nav item (Content Library)
- `/dashboard/content/[id]` single content item view with inline editor
- Content Voice Trainer (A13), Content Pattern Analyzer (A14), Content Refresh Agent (A15)
- `content_type` column (replaced by `agent_type` in live DB)
- Content performance tracking, voice profiles
- Content library filters (All, Blog Posts, Web Pages, Schema, Social)

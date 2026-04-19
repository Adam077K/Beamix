# Agent System Feature Specification [ARCHIVED]

> **Archived:** 2026-04-19
> **Reason:** 16-agent generic system (A1–A16) replaced by 11 GEO-specialized agents in April 2026 rethink. Agent Hub page killed — replaced by Inbox + Automation model. Old tier names (Starter/Pro/Business) and 7-day trial replaced.
> **Current docs:** `docs/product-rethink-2026-04-09/` · `docs/04-features/specs/dashboard-7-pages.md` · `docs/04-features/specs/proactive-automation-model.md`

---

Original document: Agent System Feature Specification
Original author: Atlas (CTO)
Original date: 2026-03-08
Original status: Engineering Reference — Implementation Ready

This file is a historical reference. Full content is preserved in git history.

Key archived concepts:
- 16 agents: content_writer (A1), blog_writer (A2), schema_optimizer (A3), recommendations (A4), faq_agent (A5), review_analyzer (A6), social_strategy (A7), competitor_intelligence (A8), citation_builder (A9), llms_txt (A10), ai_readiness (A11), ask_beamix (A12), content_voice_trainer (A13), content_pattern_analyzer (A14), content_refresh (A15), brand_narrative_analyst (A16)
- Agent Hub page at `/dashboard/agents` with 16 agent cards
- Agent Chat page at `/dashboard/agents/[agentType]` with SSE streaming
- Credit system: hold/confirm/release pattern, trial pool (5 credits / 7 days), Starter 30/mo, Pro 50/mo, Business 100/mo
- Workflow automation toggles (4 pre-built chains)

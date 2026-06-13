# Spec — Citation / Off-Site Manager

**Priority:** Tier 2 #8 · **Route:** `/offsite` (new) · **Backing agents:** `offsite_presence_builder`, `entity_builder`, `review_presence_planner`, `reddit_presence_planner`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound Citations + Earned/Owned/Social, Athena Sources/Outreach, Otterly Citation Report (monitor-only)

## Why
Four hidden agents collapse into one cockpit. This is where Beamix's "we act, not just observe" advantage is sharpest: Otterly shows citation tables and stops; Beamix builds the citations/entities/reviews/community presence. Surface that.

## What the user can DO
- See citation tables: top domains/pages citing you, citation share/rank, earned/owned/social categorization.
- Click-to-track a domain/URL.
- **Run Off-Site Presence Builder** → build directory/citation presence (auto-publish).
- **Run Entity Builder** → strengthen entity/knowledge-graph signals (auto-publish).
- **Run Review Presence Planner** → get a reputation plan (internal report).
- **Run Reddit/Community Presence Planner** → community plan (internal report).
- Source → outreach brief generation.

## Tabs
1. **Citations** (read: tables from scan evidence + offsite output).
2. **Directories / Off-Site** (`offsite_presence_builder`, auto-publish, capped 3/5/10).
3. **Entities** (`entity_builder`, auto-publish).
4. **Reputation** (`review_presence_planner`, internal report).
5. **Community** (`reddit_presence_planner`, internal report).

## Wiring
- Trigger each: `POST /api/agents/run` with the agent type.
- Mixed gating: offsite/entity auto-publish (no approval); review/reddit are internal reports. None route to `/approvals` (none are content-gated).
- Reads: scan citation evidence, agent outputs.

## States
Empty · Loading · Populated · Error / cap-exhausted (offsite capped).

## QA tier
Full (multiple agents, publish-adjacent for offsite/entity).

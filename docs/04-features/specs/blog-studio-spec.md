# Spec — Blog Studio

**Priority:** Tier 3 #10 (gated, heaviest, build last) · **Route:** `/blog-studio` (new) · **Backing agent:** `authority_blog_strategist`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound Net-New Content, Athena Content Agents (deep research)

## Why
Long-form authority content is the heaviest editor surface and `authority_blog_strategist` is `build`/`scale`-only with `ymylRisk: high`. Build it last, after the lighter content surfaces prove the pattern.

## What the user can DO
- Pick a topic/cluster → **Run Authority Blog Strategist** → review the full draft → edit in a long-form editor → send to `/approvals` → publish.
- Discover users see a locked/upgrade state (agent is `build`/`scale` only).

## Panels
1. Topic/brief input (`requiresTopicLedger`, `requiresPageLock`), `customInstructions`.
2. Run control + mode toggle; tier-lock state for Discover.
3. Live 5-step ledger.
4. Long-form markdown editor with the draft; **gated** → "Send to approvals" (`resolveArtifactType` → blog_post). YMYL-high: always gated, even in manual mode.

## Wiring
- Trigger: `POST /api/agents/run` `{ agentType: 'authority_blog_strategist', businessId, queryCluster, customInstructions? }`.
- Tier gate: `availableOnTiers: ['build','scale']` — enforce; Discover → upgrade prompt.
- Approval: existing gate.

## States
Empty · Loading · Populated (editor) · Error · **Locked** (Discover tier).

## QA tier
Full (gated YMYL-high content + publish path).

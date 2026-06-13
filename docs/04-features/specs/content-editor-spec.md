# Spec — Content Editor (Optimize · Refresh · FAQ)

**Priority:** Tier 1 #2 (core "do the work" surface) · **Route:** `/content` (new) · **Backing agents:** `content_optimizer`, `freshness_agent`, `faq_builder`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Athena Content Agents, Profound Agents (Content Refresh / FAQ templates), Otterly (suggest-only — Beamix beats this)

## Why
This is Beamix's core strength — agents that produce publishable content — and it is entirely invisible today (auto + background). Surfacing it as a manual editor is the highest-value reframe move. Otterly stops at "here's a suggestion"; Beamix drafts and routes to publish. Make that visible.

## What the user can DO (manual surface)
- Pick a page/URL → **Run Content Optimizer** → see the proposed diff → edit → send to `/approvals`.
- Pick a stale page → **Run Freshness Agent** ("Refresh") → same review/edit/approve flow.
- **Run FAQ Builder** against a topic → review generated FAQs → approve.
- Toggle mode per task: Run it myself vs Let Beamix handle it.

## Tabs
1. **Optimize** (`content_optimizer`, `requiresPageLock`) — URL picker → diff editor.
2. **Refresh** (`freshness_agent`, `requiresPageLock`) — stale-page list → refresh diff.
3. **FAQ** (`faq_builder`, `requiresTopicLedger`, free/daily-capped) — topic input → FAQ set.

## Panels (per tab)
- Input panel: target URL / topic (pre-filled from scan gaps where possible), `customInstructions`.
- Run control + mode toggle; **page-lock indicator** (content_optimizer/freshness require `requiresPageLock` — show lock state, prevent concurrent runs on same page).
- Live 5-step ledger (faq_builder is 3-step).
- Output: diff/preview editor (markdown). **Gated** — all three are `requiresApproval: true` → "Send to approvals" routes to the EXISTING `/approvals` queue (do not build a new approval surface). YMYL content stays gated in manual mode too.

## Wiring
- Trigger: `POST /api/agents/run` with `{ agentType, businessId, targetUrl|queryCluster, targetContent?, customInstructions? }`.
- Approval: output → `gated_publish.requested` via existing `resolveArtifactType()` (content→blog_post, faq→faq). No new gate logic.
- Daily cap: `faq_builder` capped (discover 3 / build 5 / scale 10) — show remaining; disable run + upsell when exhausted.

## States
Empty (no page selected) · Loading (ledger) · Populated (diff + approve) · Error (run fail / page-lock conflict / cap exhausted).

## QA tier
Full (touches the approval/publish path; gated content). Standard P1/P2 + ensure gating is never bypassed in manual mode.

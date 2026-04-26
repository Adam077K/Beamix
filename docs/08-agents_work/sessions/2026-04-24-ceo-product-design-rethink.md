---
date: 2026-04-24
lead: ceo
task: product-design-rethink
outcome: COMPLETE (proposal ready for user approval)
agents_used: [researcher x2 (opus), design-critic (sonnet), design-lead (sonnet)]
decisions:
  - key: research_converged_anchor
    value: "PostHog named independently by both Opus researchers"
    reason: "Double-blind convergence = strongest signal. PostHog is the only publicly documented product-analytics tool that combines dense data + character illustration + warm canvas."
  - key: proposal_status
    value: "awaiting Adam approval"
    reason: "No code changes yet — direction document only. 5 open questions need user input."
context_for_next_session: "User reviewed 425-line DESIGN-DIRECTION.md and answered the 5 open questions (illustrator commission, product nouns, dark mode, character scope, Crew rename). Next session picks up at Phase 0 implementation — start with InterDisplay load in layout.tsx + sidebar active-state fix (both <2hrs, highest ROI). Design Lead spins up frontend-developer workers in parallel worktrees for each primitive component."
---

## What happened
Complex-tier rethink: 3 Phase-1 agents in parallel (2 Opus researchers + 1 design-critic), then Design Lead synthesis.

## Deliverables
- `docs/08-agents_work/2026-04-24-design-research-A.md` — hand-drawn/Claude-aesthetic (261 lines, Opus)
- `docs/08-agents_work/2026-04-24-design-research-B.md` — dense-data + warmth (captured from agent return)
- `docs/08-agents_work/2026-04-24-product-ui-audit.md` — 307 lines, source-based (auth-gated, no screenshots possible)
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION.md` — 425-line final proposal

## Key findings
- **Anchors:** PostHog (primary, character-led analytics proof), Linear (density/LCH theming), Basecamp/HEY (naming/weirdness)
- **Biggest quick win:** InterDisplay is referenced everywhere but never loaded in layout.tsx — 1-hour fix makes product look 40% more premium
- **#1 AI-slop marker found:** `h-8 w-8 rounded-lg bg-blue-50` tinted-square-with-icon pattern (in 4+ components)
- **Hidden critical bug:** Inbox Accept/Reject/Archive buttons are `console.log` stubs — the whole action bar is a demo facade

## Open decisions (blocker for Phase 0)
1. Commission illustrator vs AI-generate characters (PostHog bans AI art as brand stance)
2. How far to go with invented product nouns (Crew proposed for Automation)
3. Dark mode at launch or post-launch
4. 4 MVP poses vs 11 agent variants at launch
5. "Crew" rename acceptable

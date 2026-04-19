---
date: 2026-04-19
agent: frontend-developer
task: inbox-rebuild-exec
branch: main (committed directly, worktree: rebuild-inbox)
status: COMPLETE
---

# Inbox 3-Pane Rebuild

## What was built
Full Superhuman/Linear/Missive-quality 3-pane inbox review workflow. All 4 components rebuilt from scratch to production quality.

## Components changed
- `apps/web/src/components/inbox/FilterRail.tsx` — sticky header with count badge, nav items with icons + counts, active accent bar (RTL-safe border-s), keyboard shortcuts link at bottom
- `apps/web/src/components/inbox/ItemList.tsx` — 72px rows, agent avatar with deterministic color tints, status dot (verdict-color), top/middle/bottom line layout, selected state with start-side accent bar, hover-reveal bulk-select checkbox, per-filter empty states
- `apps/web/src/components/inbox/PreviewPane.tsx` — metadata row (agent + status pill + date + YMYL badge), 22px semibold title, scrollable content, evidence collapsible, pinned bottom action bar (Accept primary + kbd hint, Reject outline-danger, Request changes ghost, Archive icon-only), action feedback banner
- `apps/web/src/components/inbox/InboxClient.tsx` — keyboard shortcuts: j/k navigate, e accept, x reject, r request changes, a archive, ? opens shortcut modal, Esc clears; Dialog-based shortcuts modal; mobile single-pane (chip filter bar + list/preview toggle via state)

## Design decisions
- RTL-safe: used `border-s`, `start-0`, `ms-auto` throughout (Hebrew audience)
- Agent avatar uses deterministic color tints per agent type (not generic gray)
- Status dot colors: amber=awaiting, green=approved, red=rejected, gray=archived/draft
- Action bar keyboard hints visible inline on buttons (e/x/r/a)
- Mobile: chip filter bar replaces sidebar, tapping row transitions to full-screen preview
- Typecheck: clean (0 errors)

## Commits
1. `feat(inbox): rebuild FilterRail with counts + active state`
2. `feat(inbox): rebuild ItemList with 72px rows + selection states`
3. `feat(inbox): rebuild PreviewPane with pinned action bar`
4. `feat(inbox): wire j/k/e/x/r/a/? keyboard shortcuts + mobile single-pane navigation`

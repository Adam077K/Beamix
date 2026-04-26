---
date: 2026-04-24
lead: ceo
task: design-rethink-v2-character-motion-flow
outcome: COMPLETE (v2 proposal ready for user approval)
agents_used: [researcher x4 (3 Opus, 1 Sonnet), design-lead (Sonnet)]
decisions:
  - key: v1_superseded
    value: "Round-1 PostHog-anchored direction rejected; marked SUPERSEDED in file"
    reason: "User wanted character-inside-UI + agent-flow-visualization + motion-as-communication, not static mascot"
  - key: category_gaps_validated
    value: "3 unclaimed gaps: animated agent execution, character companion, proactive Inbox"
    reason: "15 competitors audited (Peec, Profound, Scrunch, Otterly, AthenaHQ, etc.) — 0 have any"
  - key: v2_direction_structure
    value: "Motion + character + flow FIRST as Part 1 (behavior layer); color/font/spacing SECOND as Part 2 (the stage); welcome moment + implementation plan last"
    reason: "Inverse of v1. Motion is the identity, static design serves it."
context_for_next_session: "Adam reviewed DESIGN-DIRECTION-v2.md (651 lines, 651 lines) and answered the 5 open questions (Rive creator, Beamie name, First Scan Reveal signup gate, Crew rename, Rive licensing). Phase 0 can ship immediately — 10 quick wins, 3-4 days of focused work. Phase 1 (motion foundation) starts after Adam's answers. Beamie character file is the long-pole item — needs illustrator commission or self-learn Rive."
---

## Round-2 deliverables on disk
- `docs/08-agents_work/2026-04-24-R2-research-companion-character.md` (366 lines) — Granola mechanic + Notion AI register + ElevenLabs aliveness
- `docs/08-agents_work/2026-04-24-R2-research-flow-visualization.md` (391 lines) — Perplexity plan + Devin workspace + tldraw character + 8-frame 7-engine storyboard
- `docs/08-agents_work/2026-04-24-R2-competitor-audit.md` — 15 GEO tools audited, 3 category gaps unclaimed
- `docs/08-agents_work/2026-04-24-R2-research-motion-pmf.md` (530 lines) — Rauno/Emil/Linear motion anchors + 10 PMF rules + First Scan Reveal
- `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` (651 lines) — master synthesis

## 12 companion behavior rules (enforceable)
1. Default: 56×56px bottom-right, 4s idle breathe, silver-neutral tint, eyes alert
2. Appearance: 400ms fade+scale entry first-time, already-present for returning (Rauno frequency rule)
3. Active: 1.2s fast pulse + brow wave + 40% blue tint
4. **Gaze-not-glow: companion looks at target, target glows — not companion** (anti-Clippy core)
5. Nudge/point: 800ms drift, dashed arc line, 10s silence timeout, never repeats same nudge that session
6. Silent by default. Click → 320×auto inline text field (not modal, not drawer)
7. Draggable whole-body with 8px threshold, position persists across sessions, no snap-back
8. Right-click → "Hide Beamie" → 24h hidden → re-appear button
9. First-hour 3-step tour (score, inbox, first agent run), never again
10. 5 distinct state visuals: idle / thinking / succeeded / blocked / error (table in doc)
11. 10s silence timeout + 3-dismissal-per-element 7-day minimum
12. 5 anti-Clippy clauses: never auto-speak, never repeat past 3x, never block flow, always 1-click dismissible, never anthropomorphize beyond face (no arms/mouth)

## 5 open decisions blocking Phase 1+
1. Beamie creator: contractor ($3-8K), AI-first + polish, or Adam learns Rive?
2. Final character name (Beamie placeholder)
3. First Scan Reveal without signup gate — confirmed?
4. Confirm "Crew" for /automation
5. Rive commercial licensing fit

## Phase 0 (ships this week, no designs needed)
10 fixes, 3-4 days engineering:
- Load InterDisplay in layout.tsx (still broken)
- Load Geist Mono
- Delete non-brand colors (#93b4ff, #0EA5E9, violet/orange/teal)
- Fix sidebar active state → bg-[#3370FF]/08
- Kill tinted-square-with-icon in 4 components
- Enforce rounded-lg cap
- Rename "Auto-pilot" H1 to match sidebar nav
- Replace identical Zap icons with 7 distinct per-agent Lucide
- Make /home score hero visual (28px → 72px)
- Wire Inbox action stubs to real API

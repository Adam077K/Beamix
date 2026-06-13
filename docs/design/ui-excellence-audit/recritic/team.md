# RE-CRITIC — /team (Team & Roles)

**Verdict: NEEDS_WORK** (one precise remaining issue — close it and this is a clean PASS)

Graded the polished `populated-desktop.png` against the competitor bar (Profound / Otterly) and the 8 tells / 12 moves.

## What's strong (preserve)
- **M1 depth staging** — ONE TIER-1 focal (Members card, soft shadow) over TIER-3 inset zones (invite field, pending invites, REFERENCE). Felt depth, single hero. No uniform-depth tell.
- **M3 earned asymmetry** — real 3-column roster table (Member dominant / Role / Last Active), not an N-equal grid. Card header split title-left vs seats+avatar-stack+"Add seats" right. Tell #2 absent.
- **M2 type contract** — 30px display title; stepped 12px uppercase tracked eyebrows (MEMBER, ROLE, LAST ACTIVE, INVITE A TEAMMATE, PENDING INVITES, SEATS, REFERENCE); 13–15px body. Gaps obvious.
- **M11 mono for truth** — timestamps ("12 Jun 2026 · 08:41"), seat count "4 of 5" read tabular mono.
- **Blue=you law held** — blue only on you-actions (active Team nav, seat avatars, Add seats, Resend link). No violet on a button; no violet at all on this user-surface (correct — no agent zone here).
- **States designed** — owner-locked vs editable role dropdowns, pending invite with Resend/Revoke recovery, seat-capacity indicator with empty 5th seat slot. Sits beside the competitor refs as one hand.

## Remaining findings
- **P2 — M5 Fraunces serif beat absent.** No Fraunces italic verdict word anywhere on the visible render; the subtitle "Invite your team and control what each person can do." is plain Inter. The binding checklist item (a) requires exactly one Fraunces beat per screen. Fix: set ONE editorial word in `Fraunces` italic inline in a sans sentence — e.g. the subtitle's "control" → *control*, or a small seats-status line ("4 of 5 seats — one *open*"). Never in chrome (nav/labels/rows/buttons).

## Notes / limitations
- Capture is **viewport-only (1440×900)**, not full-page — the "REFERENCE" inset section is clipped at the bottom edge and could not be fully verified. It reads as a designed TIER-3 inset from what's visible.
- No `populated-mobile` or `empty-desktop` screenshot was provided in `screenshots-final/team/` — mobile reflow and the designed-empty (zero-teammates) state were NOT graded. Recommend capturing both before final PASS.
- M4 micro-sparkline correctly omitted (no time-series data on a roster screen) — not a finding.

---
date: 2026-08-09
role: ceo
session: ceo-agent-system-rebuild
task: Restore missing PreToolUse + Stop hook registrations in .claude/settings.json.proposed
tier: irreversible
qa_verdict: PASS
pr: 196
branch: fix/proposed-settings-hook-gap
---

# PR #196 — settings.json.proposed hook gap

## The defect

`.claude/settings.json.proposed` carried a `hooks` block with only `SessionStart` and `PostToolUse` — **zero
`PreToolUse` and zero `Stop` registrations**, while the live `.claude/settings.json` has both. CLAUDE.md documents
the proposed file as the Bash allowlist, *"pending apply."*

Applying it as written would have:
- unwired `.claude/hooks/pre-tool-use.sh` — the **only hook in this repo that can block anything** (`exit 2`,
  line 38), and the file rebuild-plan component 2 designates as the single depth-invariant enforcement point;
- unwired `.claude/hooks/stop.sh` — component 5's designated run-log append path.

One apply would have deleted the entire enforcement surface and the observability write path together.

## The fix

Brought the `hooks` block to parity with the live `settings.json`. The worker also found and fixed a third gap in
scope: `PostToolUse` was missing its `post-edit-typecheck.sh` entry. `permissions` / the Bash allowlist — the part
that is deliberately different and the reason the file exists — is byte-unchanged.

Verified by command: the two `hooks` blocks are **deep-equal after key-sorted normalization**. The target state is
"byte-identical to what is already running live," which is the strongest correctness argument available for a
change of this kind.

Evidence that the divergence was oversight rather than design: the file's own `_NOTE` field states its purpose is
the narrower Bash allowlist per "decision H.3" — it says nothing about hooks.

## QA — irreversible tier, 3-of-3 coverage

| Reviewer | Verdict | Findings |
|---|---|---|
| QA-Lead | PASS | none. Diff confirmed additive-only (+25/-0), 0 lines touching `permissions` |
| security-engineer | PASS | none. `.proposed` files are not loaded by Claude Code, so no runtime behaviour changes until a human copies it over; parity with live introduces no trust delta |
| code-reviewer | PASS | 1× P3 — the `PostToolUse` entry has no `matcher`, so `post-edit-typecheck.sh` fires after every tool call. Pre-existing in live settings; backfilled here, not introduced |
| adversary-engineer | PASS | none. Adds no new hook script content — only JSON entries pointing at hooks already invoked by live settings |

All three hook scripts confirmed present at the exact referenced paths with mode `100755`.

## Follow-up filed

The `PostToolUse` no-`matcher` P3 is a real design question — it belongs in a separate PR against the live
`settings.json`, not here, since fixing it in the proposed file alone would recreate the divergence this PR closes.

## Note on tiering

This PR was labelled `risk:irreversible` **by a human, not derived by the tier map** — `.claude/qa-tier-floor.yml`
matched `.claude/settings.json` as an exact string with no glob, so `.proposed` resolved to `lite`. That gap is
closed by PR #198, which merges first.

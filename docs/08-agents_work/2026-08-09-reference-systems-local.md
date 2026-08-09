# Reference agent systems — cloned locally, 2026-08-09

**Location:** `~/VibeCoding/_reference/` — outside every repo, so nothing here is tracked by Beamix or synced.
**Why:** the 2026-08-09 skill harvest produced 510 path-verified *descriptions* from 12 sources. Descriptions cannot
be read, run, diffed, or copied from. These are the implementations behind them.
**Provenance:** all 24 repos are third-party content. This is exactly the `provenance: untrusted` case rebuild-plan
component 1 was designed for. **Reading is free. Copying content into `.claude/skills/` or `.claude/memory/` is the
gated path**, and must stay gated even when the source looks authoritative.

Cloned `--depth 1`. 24 of 25 succeeded; `hamelsmu/prompts` 404s (renamed or private). 406M total,
**1,150 `SKILL.md` files** against Beamix's 146.

---

## Harness systems — `~/VibeCoding/_reference/harness/`

| Repo | Skills | Agents | Cmds | Hooks | Workflows | Study it for |
|---|---|---|---|---|---|---|
| `open-gsd/gsd-core` | 71 | 39 | 88 | **78** | 220 | **The hook library.** Largest of any system surveyed, 11x Beamix. Our doctrine is "name a hook, not a rule" — this is the biggest available answer key. |
| `gsd-build/get-shit-done` | 0 | 38 | 77 | **54** | 147 | Second hook library; command surface (77 vs our 13). Beamix archived GSD's *agents* in 2026-05-16 and never took its hooks — the transferable half. |
| `cloudflare/agents` | 9 | 279 | 0 | 41 | 62 | Framework/SDK patterns; hook count is high but many files are examples. Verify before citing. |
| `NeoLabHQ/context-engineering-kit` | 136 | 47 | 13 | 15 | 4 | Skill-corpus scale comparable to ours; context-engineering patterns. |
| `bmad-code-org/BMAD-METHOD` | 58 | 16 | 5 | 0 | 18 | **`files-manifest.csv` per-file sha256 install integrity** — the mechanism `gsa-sync --apply` lacks (component 9 adopts it). |
| `PrimeIntellect-ai/prime-agent` | 32 | 5 | 0 | 1 | 3 | Cross-check against `2026-08-09-prime-agent-research-brief.md` — what to take and what to refuse. |
| `earendil-works/pi` | 17 | 4 | 0 | 1 | 10 | — |
| `github/spec-kit` | 1 | 0 | 36 | 5 | 68 | Spec-driven command surface. |
| `cloudflare/cloudflare-os` | 1 | 2 | 0 | 2 | 4 | **Gatekeeper** — capability-scoped credential brokering (gap-map #5's verified reference implementation). |
| `cloudflare/cloudflare-os-starter` | 1 | 3 | 0 | 0 | 0 | Minimal template of the above. |
| `yc-software/qm` | 27 | **0** | 0 | **0** | 5 | **Correction to a prior assumption:** QM has no agents and no hooks. It is a skill-*format* innovation — `requiredCapabilities: [egress:<host>, ...]` in SKILL.md frontmatter — not an agent organization. Decision 6 was right to copy the mechanism and nothing else. |
| `obra/superpowers` | 14 | 2 | 6 | 6 | 0 | SessionStart hook enforcing mandatory skill invocation. |
| `buildermethods/agent-os` | 0 | 0 | 5 | 0 | 2 | **Confirms the 2026-08-08 finding:** 22 files total, roster deliberately retired in v3.0. Nothing to harvest. |

> **Correction, same session.** The Hooks column above counts every file under a `*hook*` path — including docs,
> configs, tests and JSON. It is **not** a count of executable hooks and must not be quoted as one. Verified counts
> of executable hook files (`.sh`/`.js`/`.mjs`/`.ts`/`.py`), and of those that can actually block (`exit 2`,
> `permissionDecision`, `deny`, `hookSpecificOutput`):
>
> | | Executable hooks | Can block |
> |---|---|---|
> | `open-gsd/gsd-core` | 31 | **15** |
> | `gsd-build/get-shit-done` | 16 | **8** |
> | **Beamix** | 7 | **3** |
>
> The real enforcement gap is **23 blocking hooks across the two GSD libraries against Beamix's 3** — a 3-7x gap,
> not the 11x the raw file count implied. Still the largest single actionable gap found, and now correctly sized.

## Skill corpora — `~/VibeCoding/_reference/skills/`

| Repo | Files | Note |
|---|---|---|
| `NVIDIA/skills` | 4,223 | Largest corpus cloned. |
| `daymade/claude-code-skills` | 941 | |
| `akin-ozer/cc-devops-skills` | 589 | DevOps-specific. |
| `Jeffallan/claude-skills` | 563 | |
| `google/skills` | 507 | |
| `anthropics/skills` | 411 | **Same `SKILL.md` format we already use** — no corpus migration needed. Ships production `docx`/`pdf`/`xlsx`/`pptx` (gap-map #13: adopt, don't build). |
| `LambdaTest/agent-skills` | 291 | |
| `phuryn/pm-skills` | 147 | Product-management skills. |
| `hesreallyhim/awesome-claude-code` | 56 | Index, not a corpus. |
| `VoltAgent/awesome-agent-skills` | 4 | Index, not a corpus. |
| `bdnhost/claude-skills` | 4 | Index, not a corpus. |

---

## What these unblock

1. **The hook gap is the headline** — 23 blocking hooks across the two GSD libraries against Beamix's 3 (see the
   correction above; the raw file counts in the table overstate it). The entire rebuild doctrine rests on "a rule
   enforced by prose is not a rule — name a hook, a CI job, a resolver, or a data file." We have the least of the one
   thing our own design says is load-bearing, and two readable answer keys now sit on disk. Audit dispatched
   2026-08-09 → `docs/08-agents_work/2026-08-09-hook-audit/`.
2. **Decision 12's cut test becomes runnable against real breadth.** "Useless in *every* project" can be tested
   against 1,150 external `SKILL.md` files plus the 9 live sibling repos, instead of against Beamix alone.
3. **Three mechanisms the plan already committed to adopt now have readable source:** BMAD's `files-manifest.csv`
   (component 9), Cloudflare's Gatekeeper (gap-map #5), QM's `requiredCapabilities` (gap-map #6, decision 18's
   envelope shape).

## Refresh

Shallow clones go stale. Re-run `scratchpad/clone-refs.sh` (idempotent — skips existing checkouts) or
`git -C <repo> pull --depth 1`. Nothing here is tracked by Beamix, so a stale clone is a study hazard, not a build one.

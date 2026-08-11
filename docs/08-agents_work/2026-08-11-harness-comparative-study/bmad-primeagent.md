# Harness Comparative Study — BMAD-METHOD, agent-os, prime-agent, pi

Status: IN PROGRESS — scaffold written first per instructions, filling in as I go.

Repos studied (read-only, local clones):
- `~/VibeCoding/_reference/harness/bmad-code-org_BMAD-METHOD`
- `~/VibeCoding/_reference/harness/buildermethods_agent-os`
- `~/VibeCoding/_reference/harness/PrimeIntellect-ai_prime-agent`
- `~/VibeCoding/_reference/harness/earendil-works_pi`

Every claim below is tagged VERIFIED (file opened and read) or ESTIMATED (grep/pattern-match only, not opened). Untagged claims should be treated as ESTIMATED.

---

## 1. BMAD-METHOD

**Shape.** BMAD is not agent-hierarchy software in the classic sense — it's a filesystem-based skills library conforming to the "Agent Skills open standard" (`tools/skill-validator.md`, VERIFIED). "Agents" (bmad-agent-pm, bmad-agent-dev/"Amelia", bmad-agent-analyst, bmad-agent-architect, bmad-agent-ux-designer at `src/bmm-skills/agents/*/SKILL.md`, VERIFIED) are personas expressed as SKILL.md files with a `name`/`description` frontmatter and markdown body — loaded on demand by whatever LLM harness reads them (Claude Code, or anything else that can read files and run `uv`). There is no agent-spawning runtime shipped by BMAD itself for the core PM/dev/architect roster — those are single-persona prompt-swaps, not subagents.

**1. ORCHESTRATION.** The one place BMAD does spawn multiple concurrent agents is `bmad-party-mode` (`src/core-skills/bmad-party-mode/SKILL.md`, VERIFIED), a roundtable/panel skill. It has four modes set by `{workflow.party_mode}` or a `--mode` flag: `session` (one LLM voices every persona inline — the default fallback), `auto` (voice inline for ordinary exchanges, spawn real subagents "only when independent thinking changes the outcome" — decision logic lives in `references/mode-auto.md`, not yet read), `subagent` (`references/mode-subagent.md`, VERIFIED — spawns one agent per persona, keeps the cast alive across turns "where your harness can supports it", weaves parallel replies into conversational order afterward), and `agent-team` ("Claude Code only", stands personas up as a persistent team). This is the only place in BMAD where "how much machinery a task gets" is a real decision, and it is NOT recorded anywhere durable — `mode-subagent.md` explicitly says the fallback (`session`) is used "without comment" when a harness lacks spawn capability, and there is no manifest/log entry of which mode ran. The rest of BMAD's "orchestration" is a human or top-level LLM picking which single-persona skill to invoke next (e.g. bmad-agent-pm → bmad-prd skill); there is no dispatcher agent deciding tier/scope programmatically.

**2. ENFORCEMENT — nothing blocks at runtime.** `grep -rn "settings.json\|PreToolUse\|PostToolUse"` across the whole repo (excluding node_modules) returns zero hits (VERIFIED), and there is no hooks directory outside `.git/hooks`. BMAD ships zero PreToolUse/PostToolUse-style hooks — everything is prose instruction to the LLM (e.g. STEP-04 "Halt Before Menu" in the skill validator is a *convention checked by an LLM validator*, not a programmatic gate). The one real, code-enforced mechanism in the whole repo is the installer's file-integrity/backup logic (see Target #1 below) — that runs at `bmad install`/`bmad update` time, not during agent execution. A second quasi-enforcement layer is CI: `npm run validate:skills` runs `tools/validate-skills.js` deterministically (13 of 26 rules — SKILL-01..07, PATH-02, STEP-01/06/07, SEQ-02, TPL-01) plus an LLM-inference pass for the rest (`tools/skill-validator.md`, VERIFIED), wired into `.github/workflows/quality.yaml` per `AGENTS.md` ("Rules" section, VERIFIED) — this blocks a PR merge, not an agent's live action.

**3. CAPABILITY DECLARATION — does not exist.** `grep -rln "allowed-tools\|allowed_tools"` across the entire repo returns 0 matches (VERIFIED). No skill or agent declares which tools it may use; there is no capability manifest to check against, decorative or otherwise. This is a genuine absence, not a hidden-and-unchecked field.

**4. MEMORY/STATE.** Two independent mechanisms: (a) `src/scripts/memlog.py` (VERIFIED, read first 60 lines) — an append-only, atomic (temp-file + fsync + rename), write-only `.memlog.md` log used by party-mode and other skills to persist session state across runs. Its own doc explicitly states the "write-only / blind" invariant: "the caller never re-reads the file mid-session — the one time the file is read is on resume, and the caller reads it itself, not via this script." There is no resolver that checks a memlog claim against current repo/filesystem reality — it is trusted verbatim. (b) `_bmad/_config/manifest.yaml` / `config.toml` — installer-owned state about what's installed (modules, versions, agent roster), regenerated on every install, explicitly documented as "installer-managed... direct edits will be overwritten" (`manifest-generator.js` lines 497-524, VERIFIED).

**5. PROPAGATION/INSTALL — real per-file SHA256 manifest, partial protection for edits.** See Target #1 below for the full mechanism (VERIFIED by reading `tools/installer/core/manifest-generator.js` and `tools/installer/core/installer.js`).

**6. OBSERVABILITY — none found.** No run log, telemetry, or `.jsonl` event stream anywhere in `tools/` or `src/` (grep for `run_log|telemetry|\.jsonl` across `.js`/`.py`/`.md`, 0 hits, VERIFIED). The closest thing is the memlog above, which is write-mostly narrative state, not structured telemetry, and nothing reads it except the skill that wrote it on its own resume.

**7. STEAL / REFUSE.** Steal: the `files-manifest.csv` per-file SHA256 hash + "diff against last-known-good before overwrite" pattern in `tools/installer/core/installer.js::detectCustomFiles()` — cheap, deterministic, and it correctly separates "file the user never touched" (silently updated) from "file the user edited" (flagged and backed up) without needing any semantic understanding of the file. Refuse: shipping an entire methodology as pure prose convention with zero programmatic enforcement (Q2 above) while using CRITICAL/HIGH/MEDIUM severity language in `tools/skill-validator.md` that reads like a real gate — the severity labels imply consequences that don't exist at runttime; only a CI lint catches violations, and only for repo-committed skills, never for an agent's live behavior mid-session.

### Target #1 — BMAD per-file manifest: generation, checking, and modified-file handling (the whole point)

**Generation:** `ManifestGenerator.writeFilesManifest()` in `tools/installer/core/manifest-generator.js:681-741` (VERIFIED, read in full) writes `_bmad/_config/files-manifest.csv` with columns `type,name,module,path,hash` on **every** install and update. The hash is `crypto.createHash('sha256').update(fileContent).digest('hex')` computed fresh over every installed file (`calculateFileHash()`, lines 669-676).

**When checked:** On update only (not on fresh install — there's nothing to diff against). `Installer._prepareUpdateState()` (`installer.js:590-619`, VERIFIED) calls `readFilesManifest()` to load the *previous* run's CSV, then `detectCustomFiles(bmadDir, existingFilesManifest)` (`installer.js:844-955`, VERIFIED) walks the live `_bmad/` directory and classifies every file into one of three buckets **before any files are overwritten**:
  - **Custom** (not present in the previous manifest at all — i.e., the user added it): fully preserved. Backed up to a temp dir, and after the update completes, copied back verbatim to its original path (`_restoreUserFiles()`, `installer.js:519-551`, VERIFIED) — `overwrite: true` on the restore, so the user's net-new file wins completely.
  - **Modified** (present in the previous manifest, but its live SHA256 no longer matches the recorded hash — i.e., the user edited a file BMAD shipped): backed up to a temp dir, but **NOT restored to the live path**. After the update overwrites the file with the new shipped version, the *old, user-edited* content is written out as a sibling `<path>.bak` (`installer.js:553-568`, VERIFIED: `const bakPath = modifiedFile.path + '.bak'`). The message shown to the user is literally "Restoring N modified files as .bak..." — restoring the backup, not the live file.
  - **Unchanged** (hash matches): silently overwritten with the new version, no fanfare.

**Answer to "how does it handle a legitimately modified file":** it does **not** preserve the live edit in place. The new shipped version always wins at the original file path; the user's prior edit survives only as a `.bak` file next to it, which the user must notice and manually re-apply/diff. This is a real, working conflict *detector* (SHA256 diff before overwrite) but only a partial conflict *resolver* — it never attempts a merge and never leaves the user's version live. Net-new files (true "custom files," e.g. a whole file the user added that BMAD never shipped) get the strictly better treatment: those ARE fully restored verbatim. One more wrinkle: `manifestHasHashes` gates modification-detection — if an old manifest was written before the hash column existed, `detectCustomFiles` silently skips modification detection entirely for that upgrade path (line 855-858, `manifestHasHashes = existingFilesManifest.some(f => f.hash)`), so a manifest without hashes provides zero protection, not a fail-safe warning.

---

## 2. buildermethods/agent-os

**Shape.** Confirmed by direct file count (VERIFIED — `find . -path ./.git -prune -o -type f -print | wc -l` = 22): agent-os v3.0 ships exactly 22 files total. There is no `agents/` directory anywhere in the repo, and `grep -rln "subagent" .` across every file returns exactly one hit — `CHANGELOG.md` — a historical reference to the old system, not a live one (VERIFIED). The whole product is: `config.yml` (profile config), 3 shell scripts (`scripts/project-install.sh`, `sync-to-profile.sh`, `common-functions.sh`), 5 Claude Code slash-command prompt files (`commands/agent-os/{plan-product,shape-spec,discover-standards,inject-standards,index-standards}.md`), and one seed standards file (`profiles/default/global/tech-stack.md`). This is a **standards-injection tool**, not an orchestration framework.

**1. ORCHESTRATION — none; explicitly delegated to the host tool.** There is no dispatcher, no roster, no spawn logic anywhere in the repo. `install_commands()` in `project-install.sh:384-411` (VERIFIED, read in full) literally just `cp`s the 5 command `.md` files into `.claude/commands/agent-os/` in the target project — that's the entire "orchestration install." `inject-standards.md` (VERIFIED, read in full) is representative of the whole command set: it's a prose runbook that tells the calling LLM to check if it's in Claude Code's plan mode, ask the user via `AskUserQuestion` when uncertain, read `index.yml`, and paste standards into context. No decision about "how much machinery a task gets" exists to record, because the framework does not touch task/agent scoping at all — v3's own changelog states this is deliberate (see Target below).

**2. ENFORCEMENT — none.** `grep -n "allowed-tools\|tools:" commands/agent-os/*.md` returns zero hits (VERIFIED). No hooks, no settings.json, no PreToolUse/PostToolUse anywhere (only the standard git sample hooks under `.git/hooks`, unmodified). The closest thing to a gate is a single interactive shell prompt in `project-install.sh::confirm_standards_overwrite()` (lines 164-189, VERIFIED) — "Existing standards folder detected... overwrite? (y/N)" — a whole-folder yes/no, not a per-file check, and it only fires at install time, never at agent runtime.

**3. CAPABILITY DECLARATION — does not exist.** Same as BMAD: no frontmatter field anywhere restricts what a command/agent may use. Commands are plain prose read by whatever tool invokes them.

**4. MEMORY/STATE.** `agent-os/standards/index.yml`, generated by `create_index()` in `project-install.sh:278-382` (VERIFIED) — an AWK-scanned description index that preserves prior human/LLM-written descriptions across re-index runs (looks up the old index by folder/filename before falling back to "Needs description - run /index-standards"). That's the only persistent state agent-os introduces; specs/product docs are the user's own files, not framework-managed state. No resolver checks a memory claim against repo reality — `index.yml` descriptions are trusted as written.

**5. PROPAGATION/INSTALL — blunt, whole-folder, no per-file protection.** `install_standards()` (`project-install.sh:204-276`, VERIFIED) walks each profile in the inheritance chain and does a straight `cp "$file" "$dest_file"` for every `.md` — no hash, no diff, no per-file conflict detection at all. The only safety net is the single confirm-or-abort prompt covering the *entire* standards folder (`confirm_standards_overwrite()`) — a customization to one file gives the same warning, and same fate, as a customization to fifty. This is markedly weaker than BMAD's per-file SHA256 approach (see BMAD section above): agent-os protects nothing at file granularity, only offers an all-or-nothing bail-out before the whole folder is clobbered.

**6. OBSERVABILITY — none found.** No log file, no run history, nothing written that isn't `index.yml` (a content index, not telemetry).

**7. STEAL / REFUSE.** Steal: `inject-standards.md`'s three-scenario detection (conversation / building a Claude Skill / in plan mode) with an explicit "ask, don't assume" rule when the scenario is ambiguous — a small, well-scoped pattern for injecting the right amount of context without over- or under-loading it. Refuse: the whole-folder single-prompt overwrite in `install_standards()` — a project with even one customized standards file gets an all-or-nothing choice between "lose my edit" and "block the whole update," which is strictly worse than doing nothing at file granularity; BMAD's per-file hash diff (same problem domain) is directly copy-able and better.

### Target #2 — the roster removal, verified, and why (their words, not a summary)

**Verified fact:** current `main` (VERIFIED via file listing above) has zero agent-roster files of any kind. This is not merely "moved" — there is no `agents/`, `roles/`, `implementers.yml`, or `verifiers.yml` anywhere in the tree.

**The history, from `CHANGELOG.md` (VERIFIED, read in full through v2.1.0 and v3.0 entries) — two separate removals, four months apart:**

- **v2.1.0 (2025-10-21) retired the first roster** — a "Roles" system (`roles/implementers.yml` and `roles/verifiers.yml`, "convoluted lists of agents that could be assigned to implement tasks," plus a script for adding more roles). Their stated reason, verbatim: *"That system added no real benefit over simply using available tooling (like Claude Code's own subagent generator) for spinning up your subagents."* They replaced it with an `orchestrate-tasks` phase for ad hoc multi-agent work, keeping a lighter-weight `use_claude_code_subagents: true/false` boolean rather than a curated roster.
- **v3.0 (2026-01-20) removed orchestration/implementation entirely**, not just the roster. Their stated reason, verbatim: *"AI coding tools have evolved significantly since Agent OS's original release in mid-2025. Claude Code's plan mode, extended thinking, and improved models now handle much of the scaffolding that earlier versions provided... Implementation/orchestration phases retired — frontier models handle this well on their own now."* The v3 changelog frames this explicitly as *not reinventing what the host tool already does well* — the framework "refocuses... on what it does best — establishing and injecting standards — while deferring to modern AI tools for the parts they now handle better."

**Reading:** this reads as an explicit, twice-repeated bet that model capability improvements (plan mode, extended thinking, native subagent generation) obsoleted hand-rolled task-decomposition and roster machinery faster than the roster paid for itself — not a claim that rosters never work, but that *this team's* roster stopped earning its keep relative to what Claude Code's own primitives already did. It is evidence FOR the "rosters are often premature scaffolding" position, but it's a single vendor's self-report of their own reasoning, not an independent before/after study.

---

## 3. PrimeIntellect-ai/prime-agent

(filling in below)

---

## 4. earendil-works/pi

(filling in below)

---

## Cross-repo comparison

(filling in below)

## Headline claims

(filling in below)

## What I did not get to

(filling in below)

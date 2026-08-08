---
date: 2026-08-08
role: ceo
session: ceo-gsa-kit-audit
task: Field audit of the GSA Startup Kit — locate every install on this machine, assess quality, compare against Beamix's own agent system, before any update work begins
tier: n/a
qa_verdict: n/a
qa_note: Research-only session, no code changed, no PR opened — QA gate does not apply.
pr: n/a
branch: n/a
---

# CEO Session — GSA Startup Kit field audit

## Outcome
Adam asked for a full-terrain survey of the "GSA Startup Kit" agent system across this machine — where it lives, what agents/skills/workflows/commands it defines, how good the skills are, and how it compares to Beamix's own `.claude/` system — as the required first step before any update work. Ran 4 parallel read-only research forks (no writes) and synthesized into an artifact report.

**Headline finding — the premise flips.** Beamix's own agent system is not the stale thing; it's the reference. `~/VibeCoding/gsa-core` (v6.3.0, a fleet-sync tool with a core/fit precedence model) was literally seeded from Beamix's 2026-05-16 C-suite rethink, and the two are currently content-identical (`ceo.md` diffs by exactly 3 lines — pure `{{PROJECT_NAME}}` tokenization).

The real staleness:
- **Global `~/.claude` install is stale and actively broken.** The old 12-persona roster (Iris/Atlas/Axiom/etc.) was disabled 2026-05-18 in favor of a functional-role roster, but `~/CLAUDE.md` and `~/.cursor/rules/gsa-startup-kit.mdc` were never updated to match, and three active slash commands (`/daily`, `/debug`, `/ship`) still invoke agents (Iris, Atlas, Scout) that no longer exist in the roster.
- **gsa-core's sync tool has never been applied anywhere.** All 8 registered fleet projects (including Beamix) are missing the `gsa-project.json` the tool requires; everything is dry-run only. Beamix alone has 54 pending updates sitting unapplied (new `AGENT-SYSTEM.md`, 2 new CI workflows, a hooks security-hardening pass). A real bug was found in the process: `gsa-launcherize.js` would corrupt Beamix's `~/bin/beamix` launcher if ever run against it — flagged do-not-run.
- **A second, undocumented sync mechanism exists.** `~/VibeCoding/GSA/GSA_startup_kit` is a separate live repo kept current by hand-porting Beamix's commits directly — its latest commit is identical to Beamix's current HEAD. Two lineages both claim to be "the" canonical kit without knowing about each other.
- **Fleet stragglers:** aiclub/ghostb/noam-website are 1 workflow behind; `test1`/`ml2`/`hitstampjavagame` are dead pre-cleanup snapshots (400+ orphaned skills each) from before the 2026-05-16 curation; `adamos`/`evalove` have drifted off gsa-core's `fleet.json` registry; `etsyc` has 3 custom agents beyond the standard template worth a manual look.
- **Cleanup debris in Beamix itself:** a dead `gsa-file-manifest.json` from a retired, unrelated tool; 2 stray non-skill directories; `MANIFEST.json`'s `totalSkills: 145` vs. the live skill-directory count drifting apart; Beamix's own `CLAUDE.md` still quotes "117 curated skills," which is now wrong.

## Deliverable
Published as an artifact: system-map diagram + per-system status cards + fleet health table + 5 prioritized decisions for the next phase. https://claude.ai/code/artifact/7077187b-574a-4910-902e-93cd63f7871f

## Next step
Awaiting Adam's call on scope/priority for the actual update phase (global install fix vs. formal gsa-core sync vs. reconciling the two lineages vs. cleanup vs. etsyc's custom agents) — this session was discovery only, no changes made anywhere.

# QM (Quartermaster) — yc-software/qm

resolved: yes · https://github.com/yc-software/qm
Description (from GitHub): "Multiplayer agent harness for work" · MIT license · created 2026-07-29 · last push 2026-08-08
stats: 12,528 stars · 1,434 forks · 67 open issues · 84 open PRs · TypeScript/Node
resolution note: single unique match, no ambiguity — confirmed via GitHub API, matches the brief exactly (harness, Node/TS, pluggable Claude Code/OpenCode/Codex/Pi backends).

enumeration_method: GitHub REST API via `gh api repos/yc-software/qm/contents/<path>` for directory listings (root, `skills-seed/`, `.claude/`, `.codex/`, `plugins/`, `docs/`, and each of the 17 `skills-seed/` subdirectories) plus reading + base64-decoding every `SKILL.md` and the full `README.md`. All paths below were directly listed or read, not inferred or recalled from memory.

ships: skills, commands/workflows (plugins), cli — **does NOT delegate its skill format to the underlying harness.** QM defines and owns its own skill corpus (`skills-seed/`) and layers a governance/distribution model on top (scope-owned, grantable, org-promotable, git-importable skill packs). The pluggable harnesses (Claude Code, OpenCode, Codex, Pi) are swappable execution engines behind an interface, chosen at the org/admin config level, independent of the skill corpus QM itself authors.

## Items

### Product skill corpus — `skills-seed/<name>/SKILL.md` (17 skills, Claude-Code-compatible frontmatter + optional `requiredCapabilities: [egress:<host>, ...]`)

| name | kind | path | purpose |
|------|------|------|---------|
| admin | skill | skills-seed/admin/SKILL.md | Act for an org admin via the admin API (scope directory, config, memory, transcripts, roster, audit/metrics/egress) when the chatting user is an org admin. |
| browse | skill | skills-seed/browse/SKILL.md | Drive a real stealth browser from the shell to act on websites, with per-person persistent sign-ins via Kernel, Anchor, or Browserbase. |
| browse provider doc: anchor | other (bundled ref) | skills-seed/browse/providers/anchor.md | Provider-specific reference bundled under the browse skill. |
| browse provider doc: browserbase | other (bundled ref) | skills-seed/browse/providers/browserbase.md | Provider-specific reference bundled under the browse skill. |
| browse provider doc: kernel | other (bundled ref) | skills-seed/browse/providers/kernel.md | Provider-specific reference bundled under the browse skill. |
| cloud-cli | skill | skills-seed/cloud-cli/SKILL.md | Sign the agent computer into a cloud provider CLI (AWS/GCP/Azure/other) via device-code flow and run it as the requesting user. |
| connect-apps | skill | skills-seed/connect-apps/SKILL.md | Connect an admin-enabled SaaS app for a user via a one-time OAuth consent link. |
| dropbox | skill | skills-seed/dropbox/SKILL.md | Browse, search, read, upload, and share the user's Dropbox (incl. team folders) via per-user OAuth. |
| email-draft-in-voice | skill | skills-seed/email-draft-in-voice/SKILL.md | Draft Gmail in the user's own voice using the profile built by email-voice-profile. |
| email-voice-profile | skill | skills-seed/email-voice-profile/SKILL.md | Build/refresh a voice profile of how the user writes email from their sent Gmail. |
| github-gitlab | skill | skills-seed/github-gitlab/SKILL.md | Work with GitHub/GitLab repos via resident gh/glab/git auth on the agent computer. |
| google-drive-sheets | skill | skills-seed/google-drive-sheets/SKILL.md | Find, read, export, edit, and manage the user's Drive, Docs, Sheets, and Slides via per-user OAuth. |
| google-workspace | skill | skills-seed/google-workspace/SKILL.md | Read and act on the user's Gmail, Calendar, and Tasks via per-user OAuth. |
| interactive-login | skill | skills-seed/interactive-login/SKILL.md | Complete browser/interactive logins (aws/gh/glab/gcloud) with a backgrounded login poller. |
| linear | skill | skills-seed/linear/SKILL.md | Search, read, create, and update the user's Linear issues/projects/comments via per-user OAuth. |
| memory | skill | skills-seed/memory/SKILL.md | Deliberately search, add to, or curate long-term memory beyond automatic per-turn recall/capture. |
| morning-digest | skill | skills-seed/morning-digest/SKILL.md | Assemble and deliver a short morning digest of overnight changes across connected sources. |
| popular-web-designs | skill | skills-seed/popular-web-designs/SKILL.md | 54 real-world design systems (Stripe, Linear, Vercel, Notion, Apple...) as ready-to-paste HTML/CSS. |
| publish | skill | skills-seed/publish/SKILL.md | Publish a long-lived internal web app/site/dashboard from the agent computer, scope-bound with rollback. |
| taste-skill | skill | skills-seed/taste-skill/SKILL.md | Design taste and process for anything browsable — landing page, dashboard, prototype, deck; anti-slop visual-language playbook. Ships its own separate MIT LICENSE with a different copyright holder ("Leonxlnx") than the repo's own — vendored from an external/upstream skill pack, not authored in-house. Worth tracing further if Adam wants that skill's origin. |
| taste-skill reference | other (bundled ref) | skills-seed/taste-skill/references/tasteskill.md | Bundled reference doc for the taste-skill. |
| use-shared-credential | skill | skills-seed/use-shared-credential/SKILL.md | Call a service via an org shared credential by proxy through the credential broker — agent never sees the secret. |

Other bundled resources noted alongside SKILL.md (progressive-disclosure pattern): `email-voice-profile/scripts/`, `google-workspace/scripts/` (not individually enumerated by name in the source transcript).

### Harness/contributor meta-skills — NOT part of the product corpus, scoped to developing QM itself

| name | kind | path | purpose |
|------|------|------|---------|
| .claude dev-instance meta-skill | skill | .claude/skills/dev-instance/SKILL.md | Run the current worktree as a production-shaped local dev instance of QM itself, reachable in Slack — contributor tooling. |
| .claude update-qm meta-skill | skill | .claude/skills/update-qm/SKILL.md | Merge upstream qm into a fork/deployment — contributor tooling. |
| .claude upstream-pr meta-skill | skill | .claude/skills/upstream-pr/SKILL.md | Open a PR back upstream to qm — contributor tooling. |
| .codex deploy-qm meta-skill | skill | .codex/skills/deploy-qm/SKILL.md | Codex-harness contributor skill for deploying QM. |
| .codex dev-instance meta-skill | skill | .codex/skills/dev-instance/SKILL.md | Codex-harness copy of dev-instance, kept description-equivalent to the .claude version per its own text. |
| .codex update-qm meta-skill | skill | .codex/skills/update-qm/SKILL.md | Codex-harness copy of update-qm. |
| .codex upstream-pr meta-skill | skill | .codex/skills/upstream-pr/SKILL.md | Codex-harness copy of upstream-pr. |

### Structural / non-skill product surfaces

| name | kind | path | purpose |
|------|------|------|---------|
| plugins (admin/auth/chassis/onboarding/portal/web-ui) | workflow | plugins/ | Optional first-party surfaces over the core HTTP API (admin panel, auth, web UI, onboarding, public portal) — structural product plugins, not skills. |
| cli | other | cli/ | `qm` CLI for validating/deploying a company's deployment directory (config, skills, sandbox image, infra). |

## Format notes

Two distinct things ship, and they matter differently for a redesign:

1. **Product skill corpus** — `skills-seed/<name>/SKILL.md`. This is the seed library a QM deployment ships to end users/orgs. Standard Claude-Code-compatible shape: YAML frontmatter with `name`, `description`, and an optional `requiredCapabilities: [egress:<host>, ...]` array declaring network domains the skill needs (QM's own security-posture/capability-grant mechanism layered on top of the vanilla Claude Code Skills format), then a markdown instructions body. Several skills bundle extra resources alongside SKILL.md following the same progressive-disclosure pattern Claude Code uses: `browse/providers/{anchor,browserbase,kernel}.md`, `email-voice-profile/scripts/`, `google-workspace/scripts/`, `popular-web-designs/templates/`, `taste-skill/references/tasteskill.md` (+ its own vendored LICENSE).

2. **Harness/contributor meta-skills** — `.claude/skills/*` (3 dirs) and `.codex/skills/*` (4 dirs), same SKILL.md shape, but scoped to developing QM itself (spin up a local production-shaped dev instance, merge upstream, open upstream PRs, deploy) — not part of what a QM deployment offers its own users.

**Does it delegate skills to the underlying harness? NO.** QM defines and OWNS its skill format and ships a first-party corpus (`skills-seed/`), and per README exposes a full runtime skill-management model on top: "Shared skills. Skills are scope-owned and shareable by grant, with admin-gated promotion to the whole org and skill packs imported from git repositories." Skills are per-user/per-scope by default, promotable to org-wide by an admin, and importable as packs from arbitrary git repos — a governance/distribution layer vanilla Claude Code doesn't define. The underlying coding harnesses (Claude Code, OpenCode, Codex, Pi) are swappable execution engines behind an interface: harness choice is an org/admin-level config knob ("Admin control ... which harnesses and models are available"), independent of the skill corpus, which QM itself authors and owns. `.claude/` and `.codex/` in the repo root exist only because QM's own dev workflow happens to run under those two harnesses for CONTRIBUTOR tooling — that is not the product delegating its skill format to them.

## Quality read

Real, active, substantial project — not a stub. 12.5k stars / 1.4k forks, MIT, created 2026-07-29, pushed as recently as 2026-08-08, 67 open issues / 84 PRs, full README with architecture description, ADRs directory, CONTRIBUTING.md. The product-facing skill corpus (skills-seed/, 17 skills) is small in count but dense and clearly production-tuned: each is a tight single-purpose connector (SaaS OAuth integrations, cloud CLI login, stealth browser automation, admin API, credential brokering, design taste, email-voice ghostwriting) written in terse, operationally precise prose with explicit `requiredCapabilities: egress:<host>` declarations — reads like skills actually exercised in a running product, not padding. One skill (taste-skill) ships its own separate MIT LICENSE with a different copyright holder ("Leonxlnx") than the repo's own — meaning it was vendored in from an external/upstream skill pack rather than authored in-house, worth tracing further if Adam wants that skill's origin. Net: this is a small, curated, high-signal corpus rather than a large library — its main interest for a redesign is the FORMAT (identical to Claude Code Skills' SKILL.md progressive-disclosure shape) and the RUNTIME MODEL (skills as scope-owned, grantable, org-promotable, git-importable objects) more than raw skill count.

## Unresolved / caveats

- None flagged by the original agent (unresolved: []). Repo match was unambiguous.
- Origin of `taste-skill` (vendored from an external pack, copyright "Leonxlnx") not traced further — flagged as worth following up if Adam wants that skill's specific provenance.
- The original agent's final StructuredOutput calls failed with a schema error ("must NOT have additional properties") — the rich payload above is recovered from the second-to-last tool_use call (the actual research output), not a successful tool return. Content is otherwise complete and directly sourced from the agent's own enumeration.

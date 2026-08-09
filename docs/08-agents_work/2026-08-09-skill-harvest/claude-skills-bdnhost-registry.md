# claude-skills.bdnhost.net registry

**resolved:** yes
**repo:** https://github.com/bdnhost/claude-skills (backing/origin repo for the live site claude-skills.bdnhost.net)
**stats:** MIT license · 1 star · 0 forks · 0 open issues · not archived · created 2026-04-22 · last content push 2026-04-25 (the repo's `updated_at` of 2026-06-09 is a metadata-only touch, not new content) · repo size 17KB.

Named upstream sources the README claims to aggregate, independently verified live via GitHub API in this pass:
- `anthropics/skills` — 167,054 stars, pushed 2026-08-07
- `obra/superpowers` — 269,285 stars, pushed 2026-08-08
- `Jeffallan/claude-skills` ("66 Specialized Skills for Full-Stack Developers") — 10,922 stars, pushed 2026-08-07 — numerically matches the homepage's "66 full-stack development skills" stat, corroborating the aggregation claim
- `akin-ozer/cc-devops-skills` — 290 stars, pushed 2026-07-26
- `daymade/claude-code-skills` — 1,323 stars, pushed 2026-08-08

Live site: `sitemap.xml` lists only 2 URLs (`/` and `/?lang=en`) — a client-rendered SPA with no server-rendered per-skill pages reachable by a crawler/fetcher. `robots.txt` disallows `/api/`. Guessed API paths (`/api/skills`, `/api/skills.json`, `/api/registry.json`) all returned 404. The `claude-in-chrome` browser tool needed to render the JS SPA was not connected in this environment ("Browser extension is not connected"), so the live catalog of 151–250+ claimed entries could **not** be enumerated at all.

## enumeration_method

Located the site's backing project via GitHub API search (`gh api search/repositories?q=bdnhost`), which surfaced `bdnhost/claude-skills`, whose README self-identifies as the origin for claude-skills.bdnhost.net. Enumerated that repo directly and exhaustively via the GitHub Contents API (`gh api repos/bdnhost/claude-skills/contents/...`): root has `LICENSE`, `README.md`, and `skills/` (2 subdirectories total, each containing exactly one `SKILL.md` — both paths confirmed, one read in full for its frontmatter schema). This is a **complete** enumeration of everything the GitHub repo itself hosts.

The live website's claimed 151–250+ catalog entries could **not** be enumerated: WebFetch of the homepage (HTML-to-markdown, no JS execution) returned only marketing/summary copy, not individual rows, even when explicitly asked for a full per-skill table. Sitemap confirms an SPA shell with no server-rendered per-skill pages. `robots.txt` blocks `/api/`, and direct guesses at likely API paths all 404'd. The browser tool needed to render the SPA was unavailable.

## ships

`index_only` + `skills` — i.e., this is two things layered together:
1. A tiny (2-skill) genuine `SKILL.md` corpus that BDNHOST directly authors and hosts in its own repo.
2. A much larger (claimed 151–250+ entry) **index/aggregator layer** — a searchable discovery hub pointing at other people's repos, plus an "automated daily discovery across GitHub" pipeline with no PR/human gate. The aggregator layer's actual entries were not inspectable (SPA + blocked API + no browser tool).

## Items

Only items that were directly path-verified via GitHub Contents API. The site's claimed 151–250+ aggregated entries are **not** included here — they were never enumerated (see above), and the two skills below are genuinely BDNHOST-authored/hosted, not aggregated from elsewhere.

| name | kind | path | purpose |
|---|---|---|---|
| lahav433 | skill | `skills/lahav433/SKILL.md` (repo: github.com/bdnhost/claude-skills) | Investigative-journalism/OSINT engine — FBI-grade intelligence-cycle methodology, forensic accounting (Benford's Law), pre-publication legal review; bilingual EN/HE; one of only two skills the registry hosts directly. 16,609 bytes. |
| journalism-legal-il | skill | `skills/journalism-legal-il/SKILL.md` (repo: github.com/bdnhost/claude-skills) | Israeli press-law advisor — defamation, privacy, FOIA, source protection, safe-to-publish edits; bilingual EN/HE. 6,957 bytes. |
| anthropics/skills | other (named upstream source) | `github.com/anthropics/skills` | Named upstream source #1 the registry claims to aggregate from (official Anthropic Agent Skills repo; verified live, 167,054 stars, pushed 2026-08-07). Not itself enumerated in this pass — see the dedicated `anthropics/skills` harvest file if one exists. |
| obra/superpowers | other (named upstream source) | `github.com/obra/superpowers` | Named upstream source #2 (agentic skills framework + dev methodology; verified live, 269,285 stars, pushed 2026-08-08). Not itself enumerated in this pass. |
| Jeffallan/claude-skills | other (named upstream source) | `github.com/Jeffallan/claude-skills` | Named upstream source #3 ("66 Specialized Skills for Full-Stack Developers" — matches the registry homepage's "66 full-stack development skills" stat, corroborating the aggregation claim; verified live, 10,922 stars). Not itself enumerated in this pass. |
| akin-ozer/cc-devops-skills | other (named upstream source) | `github.com/akin-ozer/cc-devops-skills` | Named upstream source #4 (DevOps skills for Claude Code/Codex; verified live, 290 stars, pushed 2026-07-26). Not itself enumerated in this pass. |
| daymade/claude-code-skills | other (named upstream source) | `github.com/daymade/claude-code-skills` | Named upstream source #5 ("Professional Claude Code skills marketplace"; verified live, 1,323 stars, pushed 2026-08-08). Not itself enumerated in this pass. |
| bdnhost/claude-skills | other (registry's own origin repo) | `github.com/bdnhost/claude-skills` | Named upstream source #6 = the registry's own GitHub repo. Hosts the site's README/manifesto plus the 2 skills above; the live site's actual ~150-250 catalog entries are **not** stored in this repo — the README states the rest come from "automated daily discovery across GitHub [code search]," i.e. arbitrary, unvetted-beyond-frontmatter-presence third-party repos. |

## Format notes

`bdnhost/claude-skills` repo layout is flat: `skills/<skill-id>/SKILL.md` — one markdown file per skill directory, no `references/`/`scripts/`/`resources/` subfolders in either of the two skills present.

Observed YAML frontmatter schema (from `skills/lahav433/SKILL.md`): `name`, `description` (long folded block scalar containing bilingual trigger phrases — used as the activation/search text), `license`, `author`, `version` (semver), `tags` (list), `category` (one of the registry's 15 taxonomy buckets), `language` (comma-separated, e.g. "Hebrew, English").

This is richer than Anthropic's minimal name+description `SKILL.md` spec — the extra fields (license/author/version/tags/category/language) exist specifically to feed the registry's indexing/filtering UI, not because Claude Code requires them.

**Important caveat:** this schema is BDNHOST's own convention for the 2 skills it directly authors/hosts. The other ~150-250 entries the site claims to index each keep their SOURCE repo's native frontmatter (anthropics/skills, obra/superpowers, jeffallan/claude-skills, etc. each have their own conventions) — the registry normalizes/classifies on ingestion (assigns category + language tags) rather than requiring contributors to adopt BDNHOST's schema. No unified corpus format exists at the aggregator level, only at the two-skill origin repo.

## Quality read

Thin, mostly-derivative aggregator wearing a "registry" label. The **only** content this source directly authors and hosts is 2 skills (lahav433, journalism-legal-il) in a 17KB GitHub repo with 1 star, created 2026-04-22, last content push 2026-04-25 (repo `updated_at` of 2026-06-09 is a metadata touch, not new content) — despite the site's own claim of "auto-discovered daily." Everything else presented on claude-skills.bdnhost.net is a pointer/classification layer over OTHER people's repos (anthropics/skills, obra/superpowers, jeffallan/claude-skills, akin-ozer/cc-devops-skills, daymade/claude-code-skills — all independently verified live and active) PLUS an open-ended "automated daily discovery across GitHub [code search]" pipeline that the README says needs "no PR" for a new skill to get picked up within 24h.

Internal inconsistency is notable for a site whose entire value proposition is being a trustworthy index: one homepage fetch reported "151 verified skills," while the repo's own README and shields.io badges say "250+"; one homepage fetch named 5 sources (including "skills-il," not mentioned anywhere in the README), the README says "one of nine sources" but only names 6. Neither number could be reconciled because the live page is a client-rendered SPA (sitemap.xml lists exactly 2 URLs — "/" and "/?lang=en" — confirming no server-rendered per-skill pages are exposed to crawlers/fetchers) and the backing API is explicitly blocked from crawlers (robots.txt: `Disallow: /api/`) and returned 404 on every path guessed (`/api/skills`, `/api/skills.json`, `/api/registry.json`). The claude-in-chrome browser tool needed to actually render and read the SPA was not connected in this environment, so the live catalog of 151-250+ entries could not be enumerated at all — only the 2 skills that exist as real files in the backing GitHub repo could be verified with a path.

**Trust / supply-chain assessment:** treat this as LOW-TRUST for direct skill installation. It is run by a small, low-visibility Israeli SaaS shop (BDNHOST — EduManage, Israel Estates, LegalNexus, etc., 1-star flagship repo) with an explicit "not affiliated with Anthropic" disclaimer — it reads as an SEO/lead-gen discovery hub for that business, not a security-reviewed registry. Its own README markets "verification" as checking that SKILL.md frontmatter parses and the repo isn't abandoned — a purely structural check, not a review of what the skill's instructions actually tell an agent to do. Combined with an "automated daily discovery across GitHub" ingestion path (any public repo with a plausible SKILL.md can be picked up within 24h, no PR/human gate), this is exactly the shape of supply-chain surface Anthropic's own docs warn about: a skill can be discovered, indexed, and served to an agent-installer with no semantic vetting that its instructions match its stated purpose. The two directly-authored BDNHOST skills read as legitimate (coherent, on-topic, journalism/OSINT domain content) but that says nothing about the ~150-250 auto-discovered entries, which were not inspectable in this pass.

**Recommendation for the redesign:** do not source-install skills from this registry sight-unseen; if using it at all, use it only as a DISCOVERY layer to find candidate upstream repos (which are themselves legitimate and independently verifiable, e.g. anthropics/skills, obra/superpowers), then vet and pull from those primary repos directly rather than through bdnhost's aggregation/classification layer.

## Unresolved / caveats

- **Exact live count of registry entries:** one homepage fetch said "151 verified skills"; the repo README and its shields.io badges say "250+" — could not reconcile without rendering the client-side SPA (browser tool unavailable, extension not connected).
- **Exact composition of the README's claimed "nine sources":** only 6 are named in the README (anthropics/skills, obra/superpowers, jeffallan/claude-skills, akin-ozer/cc-devops-skills, daymade/claude-code-skills, bdnhost/claude-skills itself) with the remainder attributed to unlisted "automated daily discovery." A separate homepage fetch surfaced a 5th named source ("skills-il, Israeli-focused") that does not appear in the README at all — unreconciled discrepancy between the site's own marketing surfaces.
- **The live API/data endpoint actually backing the site's search+filter UI:** path is unknown (robots.txt disallows `/api/`, and `/api/skills`, `/api/skills.json`, `/api/registry.json` all returned 404), so the freshness, schema, and true entry count of the live registry could not be independently confirmed — only the 2 skills physically present in the GitHub repo could be verified with a path.

## Recovery provenance

This file was reconstructed from a failed harvester agent's transcript (5 StructuredOutput attempts, all schema-rejected — missing `enumeration_method` or extra top-level properties not permitted by the schema). The richest content came from attempt 4 of 5 (the fullest payload, `format_notes`/`quality_read`/`stats`/`resolution_note`/`unresolved` all populated); the last 3 attempts were the agent stripping fields down to probe the schema shape and are NOT a source of additional content (they degenerated to a single test item). All facts above are drawn from that richest attempt, cross-checked against the raw GitHub API tool-call results in the same transcript (root contents listing, `skills/` directory listing, README.md raw content, and lahav433 SKILL.md frontmatter), which matched it exactly.

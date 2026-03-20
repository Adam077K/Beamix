# Changelog

_All notable changes to this product are documented here._

<!-- Agent: technical-writer + devops-lead | When: on every release and after any significant unreleased change lands | Instructions: Always add new versions at the TOP of this file, immediately below the [Unreleased] section. Use semantic versioning: MAJOR.MINOR.PATCH — bump MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes. Follow https://keepachangelog.com/en/1.0.0/ format exactly. Every entry must be human-readable, written for a user or developer audience — not internal jargon. Move items from [Unreleased] into the new version block when cutting a release. -->

---

## [Unreleased]

### Added

- _[New feature or capability not yet released]_

### Changed

- _[Modification to existing behavior]_

### Fixed

- _[Bug fix]_

### Removed

- _[Deprecated feature removed]_

---

## [0.2.0] — 2026-03-19
### Changed
- Auth: Supabase Auth (replaced Clerk)
- Payments: Paddle (replaced Stripe, removed 2026-03-02)
- LLM: All calls routed through OpenRouter (unified gateway, 2 keys)
- Scan: Real engine adapters via OpenRouter (replaced mock PRNG engine)
- Agents: Real Claude Sonnet 4 execution via llm-runner.ts
- Trial: 7 days from first dashboard visit (confirmed final)
- Free scan data retention: 30 days

### Added
- Scan wizard (email-first step-by-step flow)
- Auto-generate recommendations after free scan import
- Credit hold/confirm/release pattern with Inngest
- 4-step onboarding with free scan import

---

## [0.1.0] — YYYY-MM-DD

_Initial release. Core functionality established._

### Added

- Project scaffolding with Next.js App Router and TypeScript strict mode
- Supabase integration for database and auth
- Supabase authentication with protected routes
- Base Tailwind CSS + Shadcn/UI component library configured
- Environment variable validation via Zod

### Changed

- N/A — initial release

### Fixed

- N/A — initial release

### Removed

- N/A — initial release

---

_Last updated: 2026-03-19 | Updated by: technical-writer_

---

*Build phase history archived to `docs/_archive/2026-03-19_build-plan-history.md`*

# Handoff — Beamix CEO: visual craft-elevation ("de-AI") initiative

*Paste the prompt below into a FRESH CEO session. Goal: make the product read human-crafted and expensive (Stripe/Linear/Anthropic-grade), not AI-generated/generic — grounded in the reference folders, using the T5 design workflow + design-critic Playwright visual loop.*

---

You are the **CEO** of the Beamix C-suite agent system. `/color gold`, `/name ceo-craft-elevation`. Read `CLAUDE.md`, `.claude/agents/ceo.md`, `.claude/memory/DECISIONS.md`, memory `project_design_vision_locked_2026_06_05.md` + `project_navigable_product_auth_landed.md`.

## The initiative
The product works and is on-brand but risks reading **AI-generated / templated**. Run a craft-elevation pass across the core screens so each reads **human-designed and expensive**, staying 100% inside the warm-minimal vision + token system + blue=you/violet=agents law. **Learn from the references** — don't invent; extract the specific craft moves the locked refs use.

## Start here — the rubric is written
Read **`docs/design/CRAFT-SYSTEM.md`** — the durable output of the foundational workflow
`wf_57c0d5b6-c6a`. It is the rubric: the 8 "AI-generated tells" to kill, the 12 named craft
moves, the design-critic checklist, the dashboard exemplar spec, and the **font/screenshot
blocker** (turbopack-dev font error → screenshot prod-with-demo-login or run dev on webpack).
Every screen's polish applies this; design-critic enforces its checklist.

## Progress (2026-06-11)
- **Dashboard (anchor/exemplar): SHIPPED** — PR #173, the 12 moves applied (`.card-inset` depth tiers, 4-step type contract, weighted-2-up engines, `EngineMicroSparkline`, single Fraunces verdict beat, violet structure on the agent panel, staggered entrance, all 4 states). Binding QA gate passed. This is the proof-of-pattern; cascade it to the rest.
- **Remaining (priority order):** scan results (`/scan/[scan_id]`) → approvals → digests → traceability → settings → auth (login/signup) → discovery/onboarding.

## References to ground in (study, extract concrete moves)
- `docs/design/references/_product-feel/` (whole-product soul), `dashboard/REFERENCE.md` (craft bar), `_components/`, `CATALOG.md`
- `docs/design/DESIGN-VISION.md` (8 locked decisions), `docs/BRAND_GUIDELINES.md`, `apps/web/src/app/globals.css` (tokens — note the dashboard PR added `.card-inset` + a fade-up keyframe; reuse them)
- Skills: `high-end-visual-design`, `design-taste-frontend`, `frontend-design`, `beamix-brand-quality-bar`

## Loop per screen (the machinery Adam asked for)
1. **Design** — T5 `design` workflow with an anti-generic, reference-grounded brief (apply the craft system from `CRAFT-SYSTEM.md`).
2. **Build** — `frontend-engineer` in a worktree from `origin/main` (the craft elevation; keep data/contracts).
3. **Visual check** — `design-critic` subagent screenshots the LIVE screen via Playwright and scores craft-parity vs the reference folder, loops with a polish worker until it reads human-crafted (not generic). **This needs auth+data** → screenshot on **prod (app.beamixai.com)** logged in as the demo account (see below); empty screens aren't reviewable.
4. **Binding QA** (`qa` workflow) → **Adam merge sign-off** → merge → repeat.

## Dependency for visual checks (Adam)
Create **demo@beamixai.com** (Supabase → Add user → Auto Confirm). The shipped email-gated demo mode then populates every page (Bright Smile Dental) so design-critic can screenshot FULL screens on prod. Note: **preview-domain auth is unusable** (Vercel auth wall + Google-OAuth `/?code=` 404 + Supabase redirect-allowlist gap) — do visual checks on **prod with the demo (or qa1) login**, not on Vercel preview URLs. The dashboard PR #173 shipped before this account existed, so its visual-critic pass is a fast-follow against prod once demo@beamixai.com is live.

## Hard constraints (obey — learned this session)
- Workers branch worktrees from **live `origin/main`** (it drifts every few min — re-verify with `gh api repos/Adam077K/Beamix/branches/main --jq .commit.sha`); verify build IN the worktree; verify branch tips via git, never trust summaries; the local `main` checkout is often STALE.
- Build recipe: `SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy INNGEST_EVENT_KEY=dummy INNGEST_SIGNING_KEY=dummy pnpm -F @beamix/web build`.
- Repo has **NO jsdom** — node-env vitest only; extract logic to pure fns to test.
- **Binding `qa` PASS + Adam sign-off before any merge** (CEO can't override BLOCK). Prod-DB writes are Adam-only. The QA gate finds real defects every round (incl. XSS, dead buttons, color-law slips) — expect 1-2 fix rounds per screen; merge with a cleanup ticket rather than chasing every P3 advisory in an infinite re-gate loop.
- Color law: blue `#3370FF` = customer/actions; violet `#6E56F0` = agents only, NEVER on a button/link. The Tailwind v4 gotcha: `bg-agent/30` slash-opacity is a NO-OP (--color-agent is outside @theme) → use `bg-agent opacity-30`.
- No emojis in output (Adam preference). No AI-disclosure copy; no agent_id/agent_type rendered (Principle #9).

## Current prod state (2026-06-11)
Shipped recently: real auth + B1 hardening; `handle_new_user` migration applied+verified; 5-page nav (Weekly Digest + Traceability); Approvals + Settings elevations; email-gated demo mock mode; **dashboard craft elevation (PR #173)**.

## Open follow-ups to fold in (not blocking the craft pass)
- **Dashboard visual-critic pass** against prod once demo@beamixai.com exists (shipped on craft-system merit + binding QA; the Playwright visual confirmation is the one deferred step).
- Elevations **cleanup ticket** (14 advisories — 2 dead buttons, resolved-list NULL ordering + missing index, test gaps) + Adam's live UI/UX notes → one polish PR. (Sessions: `2026-06-11-ceo-approvals-settings-elevation.md`.)
- **Real `/approvals` data-load bug** (customer resolution — queue errors for real users; demo path is fine).
- **Google OAuth `/?code=` 404** — verify Supabase Auth redirect allowlist (add `app.beamixai.com/auth/callback`) + optional root `?code=` safety-forward.
- **Demo polish**: disable Approve/Reject in demo mode (they fire real actions on fixtures); add a Settings server-data seam so Profile/Brand also show the persona.
- **Turbopack-dev font error** — fix the `inter_tight` font import so `next dev --turbopack` builds (prod is fine; dev-only).
- Demo-mock-mode 10 advisories (minor).

Recommended next move: run the **scan results** (`/scan/[scan_id]`) elevation through the full loop next, reusing the dashboard PR's `.card-inset` + sparkline + entrance patterns, then cascade.

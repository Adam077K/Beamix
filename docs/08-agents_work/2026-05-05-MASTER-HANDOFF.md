# Beamix Master Handoff — Everything We Built
**Date:** 2026-05-05
**Author:** CEO agent
**Purpose:** Comprehensive record of every decision, every session, every change. Single source of truth for the next contributor / future Adam / future agent.
**Verified by:** 3 sonnet agents — V1 (decisions traceability), V2 (AC preservation), V3 (cross-doc consistency). All verdicts: 🟡 MINOR — safe to commit. No critical losses.

---

## TL;DR

Beamix is a vertical AI Operating System for AI Search Visibility (GEO). Production infrastructure is **LIVE** at `app.beamixai.com`. PRD v5.1+v5.2 is canonical with **56 features** locked. Build Plan v3.1+v3.2 has **151 tickets** across 5 tiers. Hard reset of `apps/web/src/` is approved + planned, awaiting Adam's 8-item confirmation. **Tier 0 build can begin immediately upon Adam's confirmation.**

Strategic positioning (Frame 5 v2): vertical AI OS for SMBs scanning AI search visibility, then fixing it via 6 MVP agents. Wedge persona: Marcus (B2B SaaS founder, $400K-$5M ARR). Voice canon Model B: single-character externally ("Beamix"); agents named only on /crew page. Brand: cream paper editorial register, billion-dollar-feel quality bar.

---

## Timeline of sessions (chronological)

### 2026-04-15 — Product rethink approved
Locked decisions in `docs/product-rethink-2026-04-09/` folder:
- 11-agent GEO-specialized roster (was 7 generic)
- Pricing: Discover $79 / Build $189 / Scale $499 (was $49/$149/$349)
- Proactive automation UX: suggestions → approve → agents run → review in Inbox

### 2026-04-26 — Frame 5 v2 strategic positioning locked
- Vertical AI OS for AI Search Visibility (not generic AI marketing)
- Editorial-artifact-as-moat thesis (Brief, Monthly Update, /changelog, State of AI Search annual)
- Trust architecture: Truth File + pre-publication validator + review-debt counter

### 2026-04-27 — Board Meeting (Round 1)
**23 strategic decisions confirmed** in `2026-04-27-BOARD-MEETING-SYNTHESIS.md`. Including:
- Voice canon Model B locked
- 4-mark sigil system (3 marks + 1 behavior + 1 host)
- Cream paper editorial register (#F4ECD8)
- 6 MVP agents
- Brief constitutional architecture (4 clauses + Seal stamping ceremony)

### 2026-04-27 — First Design Board (Round 1: Rams + Ive + Tufte + Kare + Linear + Stripe)
**65 surgical edits** applied to design specs. Margin column cut from product chrome; ring-pulse motion cut; AI Overviews engine renamed to AO.

### 2026-04-28 — Round 2/3 Design Board + Aria 4th persona + State of AI Search research
**17 actionable additions** beyond Round 1. Aria added as 4th canonical persona. State of AI Search timing locked at MVP+90.

### 2026-04-28 — PRD v3 → v4 → v5 + Build Plan v1 → v2 → v3
- PRD v4 consolidated: 47 features F1-F47
- PRD v5: added F48-F56 (Yossi agency, score badge, dogfooding, two-tier activation, sample data, recovery emails, agent caps, pre-Brief recovery, cookie consent)
- Build Plan v3: 133 tickets across Tier 0-5

### 2026-04-29 → 2026-05-05 — Domain + Infrastructure setup (Comet browser agent)
- `beamixai.com` purchased + DNS configured
- `app.beamixai.com` Vercel custom domain LIVE
- `notify.beamixai.com` Resend verified
- Inngest keys rotated; sync verified
- Google Search Console + Bing Webmaster Tools indexing
- Google OAuth wired (Vercel + Supabase)
- Paddle (PRODUCTION) — 4 products + 7 prices live
- **Security incident 2026-05-05**: Comet leaked 3 live API keys in chat. All rotated; old keys revoked; new prompts include explicit "never print secrets" rule.

### 2026-05-04 — Onboarding multi-angle audit (4 lenses)
- Personas (Marcus/Dani/Yossi/Aria)
- Failure modes (30 cataloged)
- CRO + craft + trust
- Form-factors (mobile + Hebrew RTL + a11y)

### 2026-05-04 — Scan↔Onboarding flow architecture
**Option E approved**: unified `/start` route with 9 phases. Two-tier activation model: Free Account (signed up + Brief signed) → Paid Customer (Paddle complete). Q1-Q13 locked.

### 2026-05-05 — Red-team audit + R1-R7 decisions + customer simulator
- Red-team flagged 7 highest-leverage rethinks
- Adam answered all 7
- 12-persona customer simulator validated Q6 (Placement A wins 92% vs 58%)
- Hard reset approved
- PRD v5.1 + v5.2 amendments
- 4 new tickets T148-T151
- QA gate process designed (4 agents, 16 waves)
- Public scan permalink design pixel-spec'd

---

## Q1-Q13 — All 13 architectural decisions LOCKED

| # | Decision | Status | Doc reference |
|---|---|---|---|
| Q1 | Yossi agency mode at MVP+30 | ✅ LOCKED | F48; PRD v5.1 |
| Q2 | Heebo 300 italic for Hebrew | ✅ LOCKED | Design system canon; T93 |
| Q3 | Brief grounding preview during Step 2 ships at MVP | ✅ LOCKED | F30 + F2 Phase 5; T106 |
| Q4 | Activation = first /inbox approval within 7d post-Paddle-checkout | ✅ LOCKED | F2 + F4; T118 |
| Q5 | Quiet "Security & DPA" footer link | ✅ LOCKED | F2 Phase 7; T108 |
| Q6 | Paddle inline overlay on /home post-Brief opt-in | ✅ LOCKED + VALIDATED | F4 + F51-F54; T114; **R2 simulator confirmed 92% vs 58%** |
| Q7 | 7-day activation window | ✅ LOCKED | F4; T118 |
| Q8 | 14/14/30 money-back tier split + agent-run caps | ✅ LOCKED | F35 + F54; T116 + T117 |
| Q9 | Google OAuth as primary signup | ✅ LOCKED + LIVE | F2 Phase 3; T95; Vercel env vars set |
| Q10 | Embeddable score badge ships at MVP+30 | ✅ LOCKED | F49; T131 |
| Q11 | Public dogfooding scan built MVP, published MVP+30 | ✅ LOCKED | F50; T132a/T132b |
| Q12 | Option E approved (unified /start route) | ✅ LOCKED | F2 v5; OPTION-E-START-FLOW-SPEC |
| Q13 | Option E ships at MVP | ✅ LOCKED | T100-T110 in Tier 1 |

---

## R1-R7 — Red-team decisions (today, 2026-05-05) LOCKED

| # | Decision | Status | Action |
|---|---|---|---|
| R1 | SaaS-only at MVP; e-commerce → MVP+30 | ✅ LOCKED | F16 amended in v5.2; T148 added |
| R2 | Validate Q6 via 12-persona simulator | ✅ DONE | Placement A wins decisively; Q6 holds |
| R3 | Workflow Builder → Build + Scale tiers | ✅ LOCKED | F19 amended in v5.2; broader value |
| R4 | Multi-wave QA gate (4 agents) | ✅ LOCKED | QA-GATE-PROCESS-v1.md; T151 |
| R5 | Inngest tier — keep ~5 customer trigger | ✅ RE-CONFIRMED | Auto-memory updated |
| R6 | Israeli PPL compliance | ⏸️ PENDING | Adam-only lawyer call |
| R7 | Public scan permalink design | ✅ DONE | DESIGN-public-scan-permalink-v1.md; T149 |

---

## Pricing + monetization (LOCKED)

| Tier | Monthly | Annual | Money-back | Features |
|---|---|---|---|---|
| **Discover** | $79/mo | $63/mo ($756/yr) | 14 days | 6 MVP agents; 3 AI engines (ChatGPT, Perplexity, AI Overviews); free scan |
| **Build** | $189/mo | $151/mo ($1812/yr) | 14 days | 6 agents + Workflow Builder + Agent Builder; 7 engines (+Claude, Gemini, Grok, You.com); /workspace + /reports + advanced agents |
| **Scale** | $499/mo | $399/mo ($4788/yr) | **30 days** | All Build + multi-domain (5 included) + white-label per-client + agency cockpit; 11 engines (+Bing Copilot, Mistral, DeepSeek, Llama) |
| **Scale Add-on** | $49/mo per domain | n/a | per-tier | Each additional client domain on Scale |

**Paddle infrastructure LIVE 2026-05-05:**
- All 4 products active in Paddle production
- Webhook live at `https://app.beamixai.com/api/webhooks/paddle`
- Old wrong products archived (Starter/Pro/Business at $49/$149/$349)
- All 7 price IDs in Vercel env

**Refund risk math (verified):** at <20% refund rate, math works. Mitigation: agent-run caps during refund window (Discover 5 / Build 10 / Scale 20).

---

## Personas (4 canonical)

1. **Marcus** — Founder, Acme SaaS (B2B dev-tooling, $1.8M ARR, 30 employees). Wedge persona.
2. **Dani** — Owner, Tel Aviv coffee roaster (e-commerce + retail, $400K ARR, **Hebrew speaker**). Mobile-first. **Deferred to MVP+30** per R1.
3. **Yossi** — Multi-client agency owner (12 clients, white-label per-client). MVP+30 partial relief; full agency mode at MVP+30.
4. **Aria** — Marcus's hidden CTO co-founder. Procurement-grade reviewer. Added 2026-04-28. Use simulator on any vendor-facing surface.

---

## Locked design choices (Round 1 + Round 2 + Round 3)

### Sigil typology
- 3 marks (Ring, Seal, Monogram) + 1 behavior (Trace) + 1 host (Margin)
- Margin column CUT from product chrome (kept on artifact surfaces with temporal decay)
- Favicon = Seal at 16×16 (NOT Ring)

### Motion canon
- 10 named easing curves (per Vercel review §1)
- ESLint rule blocks `transition-all` and shared cubic-bezier
- Phase-transition: 140ms cross-fade default
- Seal stamping: 540ms with **Arc's Hand** (1px ink-1 dot)
- Cycle-Close Bell: 800ms ring-close + 600ms hold + re-open + **Arc's Wave** (60ms stagger)

### Typography
- Variable Inter (drop separate InterDisplay file — saves 70KB)
- Subset Fraunces 300 italic (~40 chars — saves 375KB)
- **Heebo 300 italic** companion for Hebrew (Q2 lock)
- Geist Mono for technical content (URLs, dates, codes)
- Total font payload: 225KB → ~85KB

### Editorial register
- Cream paper #F4ECD8 (8 surfaces forever; not dark mode)
- Cream-paper-stays-light partition LOCKED — Brief, Monthly Update, /changelog, /trust/*, Onboarding, /reports, OG share cards, /state-of-ai-search
- 6 admin-utility surfaces ship dark mode at MVP+30

### Agent canon
- 18 monograms locked (2-letter + color disc below 16px)
- Deterministic seed-per-agent fingerprint (Kare's MoMA move)
- Brand canon: `seed(agentUuid) → path` is one function generating each agent's fingerprint everywhere
- All 18 agent colors locked

### Voice canon Model B
- Single-character "Beamix" externally (emails, PDFs, OG cards, /changelog, /security)
- Agent names ONLY on /crew page
- 6 internal names NEVER appear customer-facing: Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter
- Brand name "Beamix" stays Latin-script in Hebrew RTL

---

## Frame 5 v2 strategic positioning

**Beamix is a vertical AI Operating System for AI Search Visibility (GEO) for SMBs.**

- 11 text AI engines coverage (Discover 3, Build 7, Scale 11)
- 6 MVP agents (Schema Doctor, Citation Fixer, FAQ Agent, Competitor Watch, Trust File Auditor, Reporter)
- 2 vertical knowledge graphs at MVP — **REVISED TO 1 (SaaS only)** per R1; e-commerce KG ships at MVP+30
- Brief grounding inline citation everywhere (F30 — structural commitment)
- Cartogram visualization (550 cells; Tufte's John Snow move)
- State of AI Search 2026 annual report (F47, MVP+90)
- Editorial artifacts as moat: Brief, Monthly Update, /changelog, State of report

**Quality bar:** Stripe / Linear / Apple / Anthropic-grade. NOT "good" — category-defining. Every space, button, letter intentional.

---

## Infrastructure state (LIVE)

| Service | Status | Detail |
|---|---|---|
| Domain | ✅ | `beamixai.com` (Cloudflare DNS) |
| Marketing | ✅ | `beamixai.com` apex on Framer |
| Product | ✅ | `app.beamixai.com` Vercel PRODUCTION READY |
| Email | ✅ | `notify.beamixai.com` Resend Verified; tracking subdomain `links.notify.beamixai.com` |
| Async | ✅ | Inngest synced (keys rotated 2026-05-04) |
| Auth | ✅ | Google OAuth + Supabase Auth provider configured |
| Billing | ✅ | Paddle production with 4 products + 7 prices + webhook |
| LLMs | ✅ | Anthropic + OpenRouter keys set |
| SEO | ✅ | Google Search Console + Bing Webmaster Tools indexing |
| Vercel env vars | ✅ | 27 variables set; 12 marked Sensitive |
| Email-from address | ✅ | `noreply@notify.beamixai.com` (canonical) |

**No Stripe, no n8n** — Paddle + Inngest only.

---

## Codebase state + hard reset plan

### Current `apps/web/`
- 32,225 lines (mix of correct infra + pre-rethink features)
- Already clean: pricing correct ($79/$189/$499); no Stripe; no n8n
- Pre-rethink junk: old 2-step onboarding; standalone `/signup`; mock-only `/scan`; 5 dead home variants; 40+ `beamix.tech` strings

### Hard reset approved
Adam confirmed 2026-05-05: hard reset of `apps/web/src/` (not surgical). Reasoning: the rethink + planning is "completely different" from original; agent-driven development means time/effort is near-zero.

**Caveats applied:**
- Tag snapshot: `git tag mvp-cleanup-snapshot-2026-05-05` BEFORE deletion
- Cloudflare Worker maintenance page deployed BEFORE wipe
- Keep platform-level config (Vercel project, env vars, custom domain, OAuth callbacks)
- Wipe Supabase schema; recreate fresh from PRD v5.1 migrations
- 14-step execution sequence with rollback paths per `2026-05-05-HARD-RESET-EXECUTION-PLAN.md`

### Adam's 8-item confirmation checklist (pending)
1. 0-customer state confirmed
2. Maintenance page copy approved
3. Snapshot tag agreed
4. Database schema can be wiped
5. OK to start Tier 0 build immediately after wipe
6. Cloudflare Worker route deployment OK
7. Resend audience for "we're back" email list OK to create
8. Vercel project + env vars stay (only `apps/web/src/` deleted)

---

## QA gate process (LOCKED — runs after every build wave)

4 parallel QA agents after every wave (3-6 tickets per wave):
| Agent | Model | Catches |
|---|---|---|
| Design QA | Opus | Pixel drift, token violations, voice canon, motion craft |
| Backend QA | Sonnet | API security, RLS, webhook signatures, idempotency |
| Code Quality QA | Opus | Architecture, naming, abstractions, tests, ESLint, TS strict |
| Frontend QA | Sonnet | A11y, mobile, Hebrew RTL, motion smoothness, hydration |

Severity tiers: 🔴 P1 blocks merge / 🟡 P2 fix this wave / 🟢 P3 backlog. 36 example findings spec'd. 16 QA waves mapped to Build Plan v3.1.

---

## Public scan permalink design

`/scan/[scan_id]` — the marketing flywheel surface. ~11.7K word pixel spec at `2026-05-05-DESIGN-public-scan-permalink-v1.md`.

**Cartogram comprehension fix:** Tufte-style progressive disclosure
- Section A: Hero + 96px score number
- **Section B: 11-engine stacked-bar ONRAMP** (the 3-second gist)
- Section C: Full 550-cell cartogram (now reads as deep dive, not overwhelm)
- Section D: 3 Fraunces 300 italic editorial findings (cream paper)
- Section E: Beamix self-scan + Stripe-style trust strip
- Section F: Closer + share affordances

OG share card spec, mobile + Hebrew RTL, A/B test plan all included.

---

## Outstanding Adam-only items

| Item | Time | Triggers what |
|---|---|---|
| Hard reset 8-item confirmation | 2 min | Tier 0 build dispatch |
| GitHub OAuth credentials | 5 min via Comet | T19 Workflow Builder Git-mode |
| Twilio account + IL/US number | 10 min via Comet | T75 Lead Attribution F12 |
| DPA cap legal call | 30 min lawyer | T66 /trust publishes |
| **Israeli PPL compliance discussion** | 30 min lawyer | Launch-blocker for primary market |
| E&O insurance binding | 1 hr broker | T66 publishes |
| **SOC 2 Type I auditor engagement** | 2 hr vetting | Must engage ~2 weeks BEFORE MVP launch for MVP+90 ship |
| Status page vendor pick (Better Stack default) | 5 min | T68 |
| HackerOne bug bounty program | 1 day setup | T88 (MVP+30) |
| 5 pre-build validations | 1-2 days | Optional pre-Option-E PR validation |

---

## Pending/deferred decisions

- **Q6 Paddle placement** — VALIDATED by simulator; locked. Real 100-customer A/B test post-MVP+30 to validate with humans.
- **R6 Israeli PPL** — pending Adam's lawyer call.
- **SOC 2 Type I timing** — pending Adam's auditor engagement decision.
- **Email design system** — deferred per Adam ("don't talk about until we got to it").
- **Cream paper application breadth** — deferred per Adam ("if designers say so we'll change later").

---

## Canonical doc set (current source of truth)

| Doc | Purpose |
|---|---|
| `2026-05-04-PRD-wedge-launch-v5.1.md` | Canonical PRD (54 features F1-F56 ACs in full) |
| `2026-05-05-PRD-AMENDMENTS-v5.2.md` | v5.2 amendments (R1 SaaS-only, R3 WB Build+Scale, T148-T151) |
| `2026-05-04-BUILD-PLAN-v3.1.md` | Canonical Build Plan (133 tickets) |
| `2026-05-04-OPTION-E-START-FLOW-SPEC.md` | Unified /start architecture (9 phases pixel-precise) |
| `2026-05-04-FLOW-ARCHITECTURE-SYNTHESIS.md` | Q1-Q13 lock + Option E recommendation |
| `2026-05-05-CUSTOMER-SIMULATOR-PADDLE-PLACEMENT.md` | 12-persona Q6 validation (92% vs 58%) |
| `2026-05-05-DESIGN-public-scan-permalink-v1.md` | F1 + T149 marketing flywheel surface |
| `2026-05-05-QA-GATE-PROCESS-v1.md` | 4-agent QA gate spec |
| `2026-05-05-HARD-RESET-EXECUTION-PLAN.md` | 14-step reset sequence |
| `2026-05-05-INFRA-STATE-COMPLETE.md` | Production infrastructure state |
| `2026-05-05-CANONICAL-DOCS-INDEX.md` | MOC of all relevant docs |
| `2026-05-05-CODEBASE-CLEANUP-PLAN.md` | (superseded by hard reset plan) — kept for context |
| `2026-05-05-RED-TEAM-AUDIT.md` | The 7 red-team findings (R1-R7 source) |
| `2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` | Round 1 design legend critique |
| `2026-04-28-DESIGN-BOARD-ROUND2-3-SYNTHESIS.md` | Round 2/3 + alternative-vision pressure-test |
| `2026-04-27-BOARD-MEETING-SYNTHESIS.md` | 23 strategic decisions |
| `2026-04-26-FRAME-5-v2-FULL-VISION.md` | Strategic positioning |

### Auto-memory files (cross-session canon)
At `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/`:
- `MEMORY.md` — index
- `project_pricing_v2.md` — pricing locked
- `project_voice_canon_model_b.md` — voice canon
- `project_quality_bar_billion_dollar.md` — quality bar
- `project_aria_4th_persona.md` — Aria simulator usage
- `project_state_of_ai_search_timing.md` — MVP+90
- `project_inngest_tier_strategy.md` — ~5 customer trigger
- `project_white_label_per_client.md` — Yossi multi-client
- `project_workflow_builder_mvp_scope.md` — WB scope
- `project_beamie_deferred.md` — character deferred
- `project_domain.md` — beamixai.com + infra state
- `project_vision_company_not_tool.md`
- `project_framer_marketing_after_product.md`
- `project_red_team_decisions_2026_05_05.md` — R1-R7 locked
- (Several feedback files for Adam preferences)

---

## All PRs merged (chronological — for git history reference)

| PR | Date | Subject |
|---|---|---|
| #52 | 2026-04-28 | Audit baseline |
| #53 | 2026-04-28 | Round 1 design board + 65 cuts |
| #54 | 2026-04-28 | Round 2/3 + Aria persona + State of AI Search |
| #55 | 2026-04-29 | PRD v4 + Build Plan v2 |
| #56 | 2026-05-04 | Onboarding multi-angle audit (4 lenses) |
| #57 | 2026-05-04 | Scan↔Onboarding architecture (Option E) |
| #58 | 2026-05-04 | PRD v5 + Build Plan v3 + Option E spec |
| #59 | 2026-05-04 | Verification audits + fix-plan |
| #60 | 2026-05-05 | Apply fix-plan → v5.1 + v3.1 patches |
| #61 | 2026-05-05 | Final feature AC restoration (F4-F18) |
| #62 | 2026-05-05 | Production infrastructure complete |
| #63 | 2026-05-05 | Red-team audit + canonical docs index + cleanup plan |
| #64 | 2026-05-05 | R1-R7 lockdown + customer simulator + hard reset plan |

---

## What the next contributor (or future Adam) does

### Path 1 — Execute hard reset (recommended)
1. Confirm 8-item hard-reset checklist
2. Dispatch hard reset execution per `2026-05-05-HARD-RESET-EXECUTION-PLAN.md`
3. ~2 hours wall-clock: maintenance page deploys → src/ wipes → Tier 0 build dispatches
4. Tier 0: T58-T65, T93-T99, T135-T137, T140 (~19 tickets, mostly XS)
5. After Tier 0 + QA gate pass: Tier 1 begins (T100-T111: /start route + 9 phases)

### Path 2 — Pause for manual confirmations
Review v5.2 amendments + R7 design + QA gate process + hard-reset 8-item checklist before execution. Could be hours/days depending on Adam's review depth.

### Path 3 — Manual Adam-only items
- Lawyer call (DPA cap + Israeli PPL — combine into one)
- Insurance broker (E&O)
- SOC 2 auditor vetting (Drata + Prescient Assurance recommended)
- Status page vendor pick (Better Stack at $24/mo recommended)
- Comet sessions for GitHub OAuth + Twilio

### Path 4 — More planning passes
- Mobile-first audit on rest of spec
- Pricing page + marketing copy on Framer
- 18 Resend templates designed (per T146)
- Complete the F4-F18 (already restored 2026-05-05)
- More red-team audits

---

## Risks visible at this state

1. **Hard reset window** — If Adam confirms tomorrow, ~24-48 hour "site under construction" period. Mitigation: Cloudflare Worker maintenance page (already specced).
2. **Israeli PPL compliance gap** — Launch-blocker for primary market. Adam owes lawyer call.
3. **SOC 2 timing** — If auditor not engaged ~2 weeks before MVP launch, Type I report ships at MVP+120 not MVP+90. Adam owes auditor selection.
4. **R5 Inngest tier** — Conservative ~5 customer trigger; risk is hitting wall before upgrade if step usage exceeds estimate. Mitigation: monitor steps/month counter weekly.
5. **Design drift across QA waves** — 16 wave-end QA passes catch some issues, miss others. Mitigation: design review gate (R4 Design QA) is opus-tier; should catch craft drift.

---

## Success criteria for MVP launch

- [ ] All Tier 0-3 tickets shipped + QA-passed
- [ ] All 4 Adam-confirmed personas can complete /start flow + activate
- [ ] Hebrew RTL works end-to-end for Dani
- [ ] Marcus + Aria can sign off via /security review
- [ ] Yossi can navigate multi-client cockpit (MVP partial)
- [ ] Public scan permalink generates OG share card correctly
- [ ] Paddle inline modal converts on /home Activate moment
- [ ] All money-back tiers refund correctly via Paddle webhook
- [ ] All 18 Resend templates render correctly
- [ ] WCAG 2.1 AA compliance passes audit
- [ ] Speed CI gate passes for /home + /start + /scans

---

## Honest state-of-Beamix assessment

**What's strong:**
- Frame 5 v2 strategic positioning held under direct pressure-test from Round 3 alternative-vision (Arc + Notion)
- Q6 validated by 12-persona simulator (92% vs 58%) — Adam's instinct correct
- Production infrastructure live + secured (post-incident rotation)
- Voice canon Model B held across 56 features
- 4 personas + Aria establish strong B2B procurement coverage
- Editorial artifacts (Brief, Monthly Update, State of) form a real moat

**What's risky:**
- 56 features at MVP is ambitious for solo-founder + agents (red-team flagged "20+ too many"; Adam disagrees — believes agent army can deliver)
- Israeli PPL compliance still unsoftcoded
- SOC 2 timing depends on auditor engagement urgency
- Workflow Builder at Build tier is unproven (red-team wanted to defer to MVP-1.5; Adam moved to Build+Scale instead — bold but defensible)

**What's beautiful:**
- The Brief grounding inline citation everywhere (F30) — uncopyable architectural commitment
- The deterministic seed-per-agent fingerprint function — MoMA-grade brand canon
- The cartogram (550 cells — Tufte's John Snow move) — category-defining viz
- The cream paper editorial register — Stripe Press feel applied to SaaS
- Aria as 4th persona — recognizes B2B procurement reality

---

*This handoff is the single source of truth for Beamix as of 2026-05-05. If you're picking this project up cold, read this doc first, then the canonical doc set above. The canonical-docs-index gives you a 5-minute map of the entire corpus.*

*Adam built this with agents. Quality bar: billion-dollar feel. Voice canon: single-character externally. Domain: beamixai.com. Brand: "Beamix" (never "BeamixAI").*

*— Beamix*

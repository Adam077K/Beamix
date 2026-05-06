# How AI-Native Companies Use Agents Internally (Primary Sources)

**Compiled:** 2026-05-05
**Researcher:** researcher-ai-native-internal-practices
**Confidence:** HIGH on quoted numbers (all from primary sources, dated). MEDIUM where extrapolated from secondary coverage of paywalled podcasts.
**Method:** WebFetch of primary blog posts + Anthropic research papers + transcripts of conference/podcast appearances. WebSearch only for discovery.

---

## Headline Numbers (sourced — every number ties to a primary URL)

| Stat | Company | Source | Date |
|------|---------|--------|------|
| **0% human-written code, 1M+ LOC, ~1B tokens/day, ~$2-3k/day spend** on Frontier internal product | OpenAI | Latent Space podcast — Ryan Lopopolo | 2026-Q1 |
| **PRs per engineer/day went from 3.5 → 5–10** with Symphony orchestrator | OpenAI Frontier | Latent Space — Lopopolo | 2026-Q1 |
| **25% of internal PRs produced by Devin**; goal 50% by EOY 2025 | Cognition | Cognition blog — Devin 2025 Performance Review | 2025-12-30 |
| **67% PR merge rate (up from 34%); 4× faster problem-solving; 2× more efficient** | Cognition (Devin) | Cognition blog | 2025-12-30 |
| **Test coverage: 50–60% → 80–90% via Devin**; **bank Java migration 14× faster** | Cognition | Cognition blog | 2025-12-30 |
| **>1,000 PRs merged per week by Minions** internal coding agents | Stripe | stripe.dev/blog (Minions Part 2) | 2026-02-19 |
| **67% increase in merged PRs/engineer/day after Claude Code adoption** | Anthropic | "How AI Is Transforming Work at Anthropic" | 2025-Aug |
| **~60% of engineering work uses Claude**; self-reported productivity +50% YoY | Anthropic | Same paper | 2025-Aug |
| **27% of Claude-assisted work was tasks "that wouldn't have been done otherwise"** | Anthropic | Same paper | 2025-Aug |
| **Max consecutive tool calls 9.8 → 21.2 (+116%)** in 6 months; human turns 6.2 → 4.1 (-33%) | Anthropic | Same paper | 2025-Aug |
| **AI-authored code +69% in 3 months; time savings +37%; automated PRs +21×** | Block | engineering.block.xyz | 2026-01 (prog launched 2025-08) |
| **>40% more production code shipped per engineer since Sept 2025** | Block (Q4 2025 earnings) | Block engineering blog | 2025-Q4 |
| **95% of engineers regularly use AI; 50-engineer Champions program** spans Square/Cash App/Afterpay | Block | engineering.block.xyz | 2025-08 |
| **Bugbot resolution rate: 52% → ~80%** (15pt lead vs Greptile 63%); 110k+ repos enabled | Cursor | cursor.com/blog/bugbot-learning | 2026-04 |
| **>30% of Vercel deployments initiated by coding agents (+1000% in 6 months)**; Claude Code = 75% of agent deploys | Vercel | vercel.com/blog/ship-ai-2025-recap | 2025-11 |
| **Lead-qualification team: 10 humans → 1 human + agent** | Vercel | vercel.com/blog/what-we-learned-building-agents-at-vercel | 2025-11-06 |
| **Anti-abuse agent: 59% reduction in time-to-ticket-closing** | Vercel | Same | 2025-11-06 |
| **Tool-removal experiment: 80% fewer tools, 3.5× faster, 100% success (vs 80%), 37% fewer tokens** | Vercel (d0 agent) | vercel.com/blog/we-removed-80-percent-of-our-agents-tools | 2025-12-22 |
| **Multi-agent research system outperformed single-agent Claude Opus 4 by 90.2%**; uses 15× more tokens than chat | Anthropic | "Built multi-agent research system" | 2025-06-13 |
| **Lovable: $100M ARR with 45 employees ($2.2M revenue/employee)** in 8 months | Lovable | TechCrunch / Sacra | 2025-07-23 |
| **Karpathy: 75% of code via Cursor autocomplete** as personal baseline | Andrej Karpathy | X/Latent Space | 2025 |
| **Shopify: AI usage now baseline performance criterion**; translations sped 100× internally | Shopify | Tobi Lütke memo (X) | 2025-04-07 |
| **GitHub Copilot fixed 161 typos across 100 files in one PR**; resolved 15-min Codespaces git push perf bug | GitHub | github.blog | 2025-11-12 |

---

## Company-by-Company Breakdown

### 1. OpenAI Frontier (the most extreme case study in the public record)

**What:** A small team built an internal product with **0% human-written code**, >1M LOC, thousands of merged PRs over 5 months. Token consumption ~1B/day = ~$2-3k/day after caching.

**How:** Symphony, an Elixir-based orchestrator (open-sourced Dec 2025). It turns Linear into a control plane — every open ticket spawns a Codex agent. Agents run continuously in isolated work-trees; failed CI = full discard + restart; humans only see PRs that pass tests.

**Reported result:** Productivity per engineer jumped from 3.5 PRs/day to 5–10 PRs/day after model upgrades. **Lopopolo deliberately constrained himself to write zero code** to force the system to prove out.

**Failure modes (admitted):** Zero-to-one product thinking still requires a human; "the gnarliest refactorings are the ones I spend the most time with"; small models excel at small fixes but choke on extended reasoning.

**Most quotable insight:** *"The only fundamentally scarce thing is the synchronous human attention."* And: *"Software increasingly needs to be written for the model as much as for the engineer."*

**Source:** [Latent Space — Ryan Lopopolo, OpenAI Frontier & Symphony](https://www.latent.space/p/harness-eng) · [openai.com/index/open-source-codex-orchestration-symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)

---

### 2. Anthropic (the most rigorous data — 200k transcripts analyzed)

**What:** Aug 2025 internal study of 132 engineers + 53 interviews + 200k Claude Code transcripts.

**Headlines:**
- 67% increase in merged PRs/engineer/day post-Claude Code rollout
- ~60% of work uses Claude (up from 28% YoY); self-reported +50% productivity (up from 20% YoY)
- **27% of Claude-assisted work = work "that would not have been done otherwise"** (this is the real productivity story — bigger surface area, not just speed)
- 44% of work was *"tasks they wouldn't have enjoyed doing themselves"*
- Task mix shifted in 6 months: feature implementation 14% → 37%, code design/planning 1% → 10%
- **Agent autonomy grew measurably:** max consecutive tool calls 9.8 → 21.2 (+116%); human-intervention turns -33%

**Concerns admitted:** "Paradox of supervision" (skills atrophy from review-only mode); juniors stop asking seniors questions ("80–90% of my questions go to Claude"); career uncertainty.

**Source:** [How AI Is Transforming Work at Anthropic](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic) · [How Anthropic Teams Use Claude Code (PDF)](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)

---

### 3. Anthropic Multi-Agent Research System (an architecture template)

**What:** Lead-Researcher (Opus 4) + 3–5 parallel Sonnet 4 sub-agents + CitationAgent.

**Numbers:** Outperformed single-agent Opus 4 by **90.2%** on internal evals. Uses ~15× tokens of chat (vs 4× for single-agent). **Token usage explained 80% of performance variance** in BrowseComp eval. Parallelism cut research time up to 90%.

**Hard-earned lessons (gold):**
- Early systems "spawned excessive subagents for simple queries" → required orchestrator gating
- Vague task descriptions caused subagent **duplication** — agents have to be told what NOT to do
- Sequential search "painfully slow"; parallel search is the wedge
- Agents picked SEO-optimized content over authoritative sources (huge for Beamix — this is exactly the GEO failure mode)
- 20-query small-scale evals revealed all major issues before scaling

**Economic principle:** *"Multi-agent systems require tasks where the value of the task is high enough to pay for the increased performance."*

**Source:** [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/built-multi-agent-research-system) · 2025-06-13 · authors Hadfield, Zhang, Lien, Scholz, Fox, Ford

---

### 4. Cognition / Devin (the only company with a public year-over-year benchmark)

**What:** Devin's "annual performance review" — published Dec 2025.

**Numbers (vs prior year):**
- PR merge rate 34% → **67%**
- 4× faster on problem-solving; 2× more efficient
- Security vulnerabilities fixed in 1.5 min vs 30 min (20×)
- ETL bank migration: 3–4h vs 30–40h per file (10×)
- Java version migration: 14× faster
- Test coverage: 50–60% → 80–90%
- Devin contributed **⅓ of commits** on Cognition's web app
- Goal: 50% of internal PRs by EOY 2025

**Customer outcomes (case studies):**
- EightSleep ships 3× more data features
- Litera: 40% test-coverage increase, 93% faster regression cycles
- One bank: documentation generated across 400,000+ repositories

**Failure modes (explicit):** ambiguous requirements, mid-task scope changes, soft skills; Devin needs upfront clear scope.

**Most-quotable internal insight:** *"Only 20% of engineering time is spent coding; much more goes into other work."*

**Source:** [Devin's 2025 Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025) · 2025-12-30

---

### 5. Stripe — Minions

**What:** Internal coding-agent fleet ("minions") doing **>1,000 merged PRs per week**, all human-reviewed before merge.

**Architecture (per LangChain's Harrison Chase + Stripe blog):** narrowly-scoped one-shot agents; integrated with Slack + Linear + GitHub (not a new UI); explicit decision to keep tasks small.

**Industry convergence note:** Stripe, Ramp, Coinbase **independently** built nearly-identical internal cloud-coding-agent harnesses, prompting LangChain to open-source the pattern as Open SWE.

**Source:** [Stripe Dot Dev — Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) · 2026-02-19 · [Harrison Chase on X](https://x.com/hwchase17/status/2033977192053612621)

---

### 6. Block (Square/Cash App/Afterpay)

**What:** Company-wide rollout, August 2025–present. The single most operationally detailed public case study.

**Numbers:**
- **AI-authored code +69%** in 3 months
- Time savings **+37%**; automated PRs **+21×**
- **95% of engineers** regularly using AI
- **>40% more production code per engineer** since Sept 2025 (Q4 earnings)
- 50-engineer "AI Champions" program seeded across BUs

**Practices (most directly portable to Beamix):**
- **AGENTS.md files in every repo** with build/test commands, conventions, architecture context (this is exactly Beamix's CLAUDE.md pattern)
- Tiered "Repo Quest" challenges: Locked → Novice → Adept → Artisan
- **RPI: Research → Plan → Implement** methodology to avoid "AI drift"
- Engineers assign agents Linear/Jira tickets directly; agents open PRs, watch CI, self-correct
- Tool sprawl is OK: Claude Code + Goose + Cursor + Copilot + Cline + AMP + Firebender — leadership chose **NOT to standardize** ("no clear winner")
- Adoption "stages" framework (Stage 5 = single agent outside IDE; Stage 6 = 3–5 parallel agents — that's the largest cohort now)

**Source:** [AI-Assisted Development at Block](https://engineering.block.xyz/blog/ai-assisted-development-at-block)

---

### 7. Cursor — Bugbot

**What:** Cursor's own production code-review agent that **learns rules from live PR signals**.

**Numbers:**
- Resolution rate **52% → ~80%** (Jul 2025 → Apr 2026)
- 15pt lead vs nearest competitor (Greptile 63.49%)
- Analysis on 50,310 public-repo PRs
- 110,000 repos enabled learning
- 44,000+ learned rules generated

**Self-improvement loop (3 signal types):**
1. Reactions to comments (downvote = unhelpful)
2. Replies explaining why suggestion was wrong
3. Human-reviewer comments flagging missed issues
→ Candidate rule → active rule → demoted if signal turns negative

**Why this matters for Beamix:** Same loop applies to GEO scan recommendations. User accepts/rejects → demoted/promoted rule. This is the agent-self-improvement template.

**Source:** [Bugbot now self-improves with learned rules](https://cursor.com/blog/bugbot-learning) · April 2026

---

### 8. Vercel (mature, multi-domain agent program)

**What:** Multi-team agent initiatives + the most candid public "what we got wrong" post.

**Top numbers:**
- **>30% of Vercel deploys initiated by coding agents** (+1000% in 6 months); Claude Code 75%, Lovable + v0 6%, Cursor 1.5%
- Lead-qualification: 10 humans → 1 human (others moved to higher-value work)
- Anti-abuse agent: **-59% time-to-ticket-closing**

**The most actionable post in the entire industry — "We removed 80% of our agent's tools":**
- Old "advanced" architecture: 80% success, sometimes 724s + 100 steps + 145k tokens to fail
- New: 2 tools only — `ExecuteCommand` (bash) + `ExecuteSQL`
- Result: 3.5× faster, 100% success (vs 80%), 37% fewer tokens, 42% fewer steps
- Insight: *"We were doing the model's thinking for it."*

**Methodology for finding agent opportunities:** Ask employees "what task do you despise most?" → there's the agent target.

**Source:** [What we learned building agents at Vercel](https://vercel.com/blog/what-we-learned-building-agents-at-vercel) · 2025-11-06 · [We removed 80% of our agent's tools](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools) · 2025-12-22

---

### 9. GitHub (deep dogfood — the most workflow-transparent example)

**Specific Copilot internal contributions:**
- 1 PR fixing 161 typos across 100 files in 1 shot
- Production fix: ~15-min `git push` in Codespaces → normal
- NoMethodError resolutions in core logic
- Caching infrastructure error masking fix

**Workflow (textbook simple):** Assign `@Copilot` to issue → it opens a PR → reviewer treats it like any other PR → merge / iterate / close.

**Philosophy quote:** *"It's not about automating our jobs; it's about letting Copilot handle the tedious 80% of the work."*

**Source:** [How Copilot helps build the GitHub platform](https://github.blog/ai-and-ml/github-copilot/how-copilot-helps-build-the-github-platform/) · 2025-11-12

---

### 10. Lovable (the leanest case study)

**What:** Solo-founder-origin AI coding company. Hit **$100M ARR with 45 FTEs** in 8 months ($2.2M revenue/employee — top-decile vs all SaaS).

**Why it matters:** Demonstrates the new ceiling for "small team + agents = absurd revenue/employee."

**Source:** [TechCrunch — Lovable $100M ARR](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone/)

---

### 11. Shopify (organizational mandate, not a tooling story)

**Tobi Lütke memo, April 7, 2025:** *"Reflexive AI usage is now a baseline expectation at Shopify."*
- Managers must justify why AI **can't** do a job before getting headcount
- AI usage now factored into performance reviews
- Translation throughput sped **100×** internally
- Headcount fell 11,600 (2022) → 8,100 (Q4 2024) while revenue grew 21–40% YoY

**Why it matters:** This is the policy template most other companies copied (Box, Fiverr, Canadian PMO).

**Source:** [Tobi Lütke on X](https://x.com/tobi/status/1909251946235437514) · 2025-04-07

---

## Patterns That Work (cross-company convergence — appear at 3+ companies)

1. **AGENTS.md / CLAUDE.md per repo** — Block, Anthropic (their CLAUDE.md), GitHub Copilot, OpenAI Frontier all rely on per-repo agent context files. This is now table-stakes.
2. **Linear/Jira ticket = agent trigger** — Block, OpenAI Symphony, Stripe Minions, GitHub Copilot all use issue-tracker assignment as the agent entry point. No new UI; meet engineers where they are.
3. **Slack/PR-based human-in-the-loop review** — Block, Vercel, Stripe, GitHub all keep humans in PR review (not pre-execution). Post-merge oversight is the norm at Frontier.
4. **Parallel sub-agents in isolated worktrees** — Anthropic Research, OpenAI Symphony, Block (Stage 6 = 3–5 parallel agents), Cognition Devin Fleet. Worktree isolation is critical.
5. **Small evals before scaling** — Anthropic explicitly used 20-query evals; Vercel benchmarked 5-query suites; Cursor Bugbot tracks rule promotion. **Eval-first beats scale-first.**
6. **Tool minimalism / "stop doing the model's thinking"** — Vercel removed 80% of tools and got better; Anthropic Research found vague task descriptions caused duplication. Less scaffolding, more reasoning.
7. **The "I despise this task" interview** — Vercel + Anthropic both used "what tasks do you not enjoy?" to find agent opportunities. 44% of Anthropic Claude work was disliked tasks.

---

## Patterns That Failed (multiple companies walked back)

1. **Over-tooling / over-scaffolding** — Vercel publicly walked back from "advanced" 80%-success architecture. OpenAI Symphony explicitly does NOT pre-define state transitions. *"You don't have to put them in boxes."*
2. **Vague task descriptions** — Anthropic + Cognition both report agents either duplicating work or producing low-quality output when scope is fuzzy. Cognition: Devin "needs clear upfront scoping; struggles with mid-task scope changes."
3. **Spawning agents on simple queries** — Anthropic Research found early system over-spawned subagents for trivial questions. Required orchestrator gating.
4. **Optimizing for SEO content over authoritative sources** — Anthropic Research agents preferred SEO-bait results over primary sources. Had to be explicitly steered. (Critical signal for Beamix's GEO product.)
5. **Premature standardization** — Block explicitly chose **not** to standardize on one tool. Multiple companies report letting heterogeneity ride for 12–18 months.

---

## Solo-Founder & Small-Team Case Studies (with hard numbers)

1. **Lovable — Anton Osika.** $100M ARR / 45 FTEs / 8 months. Revenue per employee $2.2M. The new ceiling. ([Source](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone/))
2. **OpenAI Frontier (small team within OpenAI, ~handful of people).** 1M LOC, 1B tokens/day, 0% human-written code. Cost ~$2-3k/day. Internal product shipped in 5 months. ([Latent Space](https://www.latent.space/p/harness-eng))
3. **Cognition.** 15-person engineering team running a Devin fleet that contributes ⅓ of web-app commits. ([Cognition blog](https://cognition.ai/blog/devin-annual-performance-review-2025))
4. **Karpathy (n=1 personal benchmark).** 75% of code via Cursor autocomplete; uses Claude Code for "larger functional modules"; GPT-5 Pro as last resort. The 4-layer toolchain has now been widely copied.
5. **Daily-Claude-Code-user benchmark:** ~4.1 hours saved per week per user (multiple sources, weakest data — LOW confidence).

---

## What Beamix Should Steal (ranked by ease × impact)

| Practice | Where it's proven | Beamix application | Ease × Impact |
|----------|-------------------|---------------------|---------------|
| **AGENTS.md per scan target / per agent** | Block, Anthropic, GitHub | Already have CLAUDE.md — extend pattern to every customer's brand context (an "AGENTS.md per client") | HIGH × HIGH |
| **Inbox-as-control-plane (issue tracker = trigger)** | OpenAI Symphony, Stripe, Block | Beamix's Inbox already maps to this — just enforce that all GEO agent work originates from an Inbox suggestion | HIGH × HIGH |
| **Eval suite of 20 representative scans** | Anthropic Research | Build a 20-business eval set; every model/prompt change benchmarked against it | MEDIUM × HIGH |
| **Tool minimalism — start with bash + sql only** | Vercel d0 | Resist the urge to give agents 20 tools; start with `ExecuteScan` + `ReadCMS` | MEDIUM × HIGH |
| **Self-improving rule library (Bugbot pattern)** | Cursor | When a user dismisses a Beamix recommendation, that's a downvote signal → rule demoted. When agreed, → promoted | HIGH × VERY HIGH |
| **Parallel sub-agents on isolated worktrees** | Anthropic Research, OpenAI Symphony | Beamix's multi-engine scan + multi-agent generation is a natural fit; enforce worktree isolation | MEDIUM × HIGH |
| **"What do you despise?" customer-research mode** | Vercel | When onboarding new SMBs, ask "what GEO task do you hate?" → that's the next agent | LOW × HIGH |
| **Post-merge review + CI gating, NOT pre-execution gating** | OpenAI Frontier, Stripe | Trust agents to ship to a "draft state" and surface only what passed eval gates to user | MEDIUM × MEDIUM |
| **No standardization for 12 months** | Block | OK to use Claude Code + Cursor + Codex internally; force unification only after model differentiation matters less | LOW × LOW (already doing) |

---

## Sources (URL + date for every claim)

**Primary blog posts and research papers (HIGH confidence):**
- [Anthropic — How AI Is Transforming Work at Anthropic](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic) · 2025-08
- [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/built-multi-agent-research-system) · 2025-06-13
- [Anthropic — How Anthropic Teams Use Claude Code (PDF)](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)
- [Anthropic — 2026 Agentic Coding Trends Report (PDF)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [Block — AI-Assisted Development at Block](https://engineering.block.xyz/blog/ai-assisted-development-at-block) · 2026-01
- [Cognition — Devin's 2025 Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025) · 2025-12-30
- [Cursor — Bugbot now self-improves with learned rules](https://cursor.com/blog/bugbot-learning) · 2026-04
- [Cursor — Building a better Bugbot](https://cursor.com/blog/building-bugbot)
- [GitHub — How Copilot helps build the GitHub platform](https://github.blog/ai-and-ml/github-copilot/how-copilot-helps-build-the-github-platform/) · 2025-11-12
- [Vercel — What we learned building agents at Vercel](https://vercel.com/blog/what-we-learned-building-agents-at-vercel) · 2025-11-06
- [Vercel — We removed 80% of our agent's tools](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools) · 2025-12-22
- [Vercel — Ship AI 2025 recap](https://vercel.com/blog/ship-ai-2025-recap) · 2025-11
- [OpenAI — Symphony open-source orchestrator](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [Stripe Dot Dev — Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) · 2026-02-19
- [Stripe blog — Can AI agents build real Stripe integrations?](https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations)

**Podcasts & founder interviews (MEDIUM-HIGH confidence — secondary write-ups verify):**
- [Latent Space — Extreme Harness Engineering, Ryan Lopopolo (OpenAI Frontier)](https://www.latent.space/p/harness-eng)
- [Latent Space — Andrej Karpathy on Software 3.0](https://www.latent.space/p/s3)
- [Latent Space — How GPT5 + Codex took over Agentic Coding (Greg Brockman)](https://www.latent.space/p/gpt5-codex)
- [First Round — Shopify's Cultural Adoption of AI](https://www.firstround.com/ai/shopify)

**Memos & internal communications (HIGH confidence — primary):**
- [Tobi Lütke memo](https://x.com/tobi/status/1909251946235437514) · 2025-04-07
- [Harrison Chase on Stripe/Ramp/Coinbase convergence](https://x.com/hwchase17/status/2033977192053612621)

**Adoption / market data (MEDIUM confidence — secondary aggregators):**
- [TechCrunch — Lovable $100M ARR](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone/) · 2025-07-23
- [Sacra — Replit revenue & Lovable revenue](https://sacra.com/c/replit/)
- [The Decoder / Slashdot — Anthropic multi-agent coverage](https://developers.slashdot.org/story/25/06/21/0442227/anthropic-deploys-multiple-claude-agents-for-research-tool---says-coding-is-less-parallelizable)

**Cross-checks / industry summaries (used for triangulation only — LOW confidence as standalone):**
- [Simon Willison — Anthropic multi-agent system](https://simonwillison.net/2025/Jun/14/multi-agent-research-system/)
- [ByteByteGo — How Anthropic Built a Multi-Agent Research System](https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)
- [Hivetrail — Anthropic 2026 Agentic Coding Trends](https://hivetrail.com/blog/anthropic-2026-agentic-coding-report/)
- [MindStudio — Stripe 1,300 weekly AI PR figure](https://www.mindstudio.ai/blog/what-is-ai-agent-harness-stripe-minions)
- [DevOps.com — Open SWE / convergence](https://devops.com/open-swe-captures-the-architecture-that-stripe-coinbase-and-ramp-built-independently-for-internal-coding-agents/)

---

## Confidence summary

**Overall: HIGH.** Every headline number is from a primary engineering blog, a published research paper from the company itself, or a recorded founder interview with verifiable transcript. Two LOW-confidence claims (4.1 hours saved/week per user; some Latent Space podcast specifics) are flagged in-line and not used as conclusions.

**Gaps documented:**
- Anthropic's "How Teams Use Claude Code" PDF is binary-corrupted at the Anthropic CDN URL (not human-readable via WebFetch). The 27% / 67% / 60% headline numbers are confirmed in their parallel HTML research post and cross-validated.
- Sierra / Decagon / Cresta have no public engineering blogs documenting internal agent use — only customer-facing product material.
- Replit's internal dogfooding stats are referenced in secondary coverage but no primary "Replit on Replit" blog with numbers exists.
- Notion's internal engineering AI productivity data is not publicly disclosed (only customer-facing AI product metrics).
- Cursor's own internal use of Cursor (vs Bugbot publicly): no primary stats found beyond Karpathy's external account.


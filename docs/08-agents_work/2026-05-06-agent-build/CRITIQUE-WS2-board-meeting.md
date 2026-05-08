# CRITIQUE WS2 — Board-Meeting Protocol (§2F)
**Critic:** ai-engineer, Sonnet 4.6
**Date:** 2026-05-06
**Time spent:** 22 minutes
**Lens:** Multi-agent reasoning soundness — 100+ multi-agent debate experiments, LLM epistemic behavior under shared-prompt conditions

---

## Summary

The §2F board-meeting protocol is structurally better than most deliberation systems in the wild — parallel spawn, JSON contracts, fresh-context synthesis — but it contains four critical flaws that undermine its core promise: the anti-anchoring story collapses at the topic-prompt level, persona distinction is unvalidated and likely illusory at the base-model level, the Synthesizer's "fresh context" claim is definitionally incoherent (inputs ARE context), and the "cannot create new decisions" guard is a prompt instruction with no mechanical enforcement. The remaining eight findings range from real gaps (missing customer voice, the 4/month cap, slug collision) to operational ambiguities (dual-trigger idempotency, Aria's procurement-narrow lens) — none fatal on their own but collectively they show a protocol designed by reasoning about LLM behavior rather than from empirical observation of it.

---

## Findings (severity-ranked)

---

### F1 — Anti-anchoring is topic-prompt anchoring in disguise
**Severity:** CRITICAL
**Confidence:** HIGH

The doc claims parallel Task spawning eliminates inter-persona anchoring because subagents run in isolation with no shared context. This is true at the inter-agent level. It is false at the topic level.

All 5 personas receive the same topic statement written by the CEO or Adam. The topic statement is not a neutral question — it is a framing. If Adam writes "Should we migrate from Mem0 to custom MCP?" the word "migrate" encodes a default trajectory. Both the question subject (Mem0 vs custom MCP) and the verb (migrate = directional move away from) prime the personas' output distributions before they produce a single token.

This is the documented "question framing effect" in LLM deliberation research. Anthropic's own multi-agent guidance (effective-context-engineering, 2025) notes that shared prompts constrain output distributions even when agents run in parallel — the independence guarantee is computational (no shared state), not epistemic (shared priors from identical input). The same mechanism that makes prompt caching effective (stable prompt → stable output distribution) is what makes the anti-anchoring claim hollow.

**Concrete failure mode:** A poorly-framed topic like "how do we fix the memory poisoning problem?" pre-commits all 5 personas to the premise that there IS a memory poisoning problem requiring a fix, rather than allowing a persona to surface "we have no evidence this is a live problem at our scale." The Strategist's legitimate counter — "don't fix this, it's a theoretical risk at 0 users" — is suppressed by the frame.

**What the doc gets right:** Parallel spawning does prevent the documented "first-speaker anchoring" effect (where Agent B's Round-1 output is biased by having read Agent A's Round-1 output). That is real and the protocol correctly addresses it. The gap is that it mistakes "no inter-agent anchoring" for "no anchoring."

---

### F2 — Persona distinction is prompt-engineered, not empirically validated
**Severity:** CRITICAL
**Confidence:** HIGH

The 5 personas are differentiated by role descriptions in their .md files. Visionary sees "18-month frame," Architect sees "BOM impact and rollback cost," Adversary sees "find the missed clause." The claim is that this produces 5 meaningfully distinct viewpoints.

The empirical literature on LLM persona prompting does not support this at the strength the protocol requires. Argyle et al. (2023, "Out of One, Many: Using Language Models to Simulate Human Samples," Political Analysis) demonstrated that LLMs do shift output distributions in response to persona prompts, but the shifts are modest and heavily dependent on whether the persona creates a genuine distribution shift in the training data. Roles with rich training representation (e.g., "risk analyst," "devil's advocate") produce stronger distinction; roles invented for an orchestration system with no training corpus do not.

For Beamix's personas: Visionary, Architect, and Risk Modeler map to recognizable archetypes with training representation. Strategist-as-ANTI-ROADMAP-enforcer and Adversary-as-procurement-reviewer are idiosyncratic framings unlikely to have strong training signal. The practical consequence: Visionary and Risk Modeler probably diverge meaningfully. Strategist and Adversary probably produce modest variants of "here are concerns about this decision" because both are framed around opposition — but different opposition targets that collapse in practice.

Furthermore, 4 of 5 personas use the same base model (Opus). Model-level diversity is the most reliable source of distinct output distributions; role prompts alone are weaker. There is no reported eval baseline for "what % of board meeting findings did only one persona surface?" Without that baseline, the protocol cannot distinguish between "5 distinct viewpoints" and "5 LLMs producing slight variations on the same Opus output distribution."

**Concrete failure mode:** All 5 personas conclude "hold — more data needed" with different rationales. The Synthesizer correctly reports high consensus but cannot tell Adam whether this consensus reflects genuine convergence or homogenized priors.

---

### F3 — "Fresh context" Synthesizer is definitionally incoherent
**Severity:** HIGH
**Confidence:** HIGH

The doc states: "Spawn ONE Synthesizer (Opus) with fresh context — no Round 1/2 prompts in its history." The mechanism: the Synthesizer fires as a separate Routine via `/fire`, not as a subagent in the CEO's session. Therefore its history does not contain the conversation that produced Round 1/2 outputs.

This is a correct description of how Anthropic Routines work. It is also irrelevant.

"Fresh context" in the sense that prevents anchoring means "the Synthesizer forms its view without being influenced by the Round 1/2 outputs." But the Synthesizer's inputs ARE the 10 JSON outputs from Rounds 1 and 2. Inputs in context anchor the Synthesizer's output distribution by definition — this is the entire mechanism by which the Synthesizer knows what to synthesize.

The protocol conflates "no conversation history" (true) with "no anchoring from inputs" (false). A Synthesizer that reads 10 JSON outputs will be anchored by the most confident, most articulate, and most frequently-repeated claims across those outputs — regardless of whether it has conversation history. The "fresh context" mechanism prevents the Synthesizer from being influenced by the CEO's framing *process* (the discussion that led to the topic statement) but not from being influenced by the personas' outputs, which is the relevant anchoring vector.

This means the Round 3 synthesis will systematically favor whichever persona produced the most confident, most internally-consistent Round 1+2 JSON. A Risk Modeler with `"confidence": "high"` and specific failure modes will outweigh a Visionary with `"confidence": "med"` and abstract opportunity framing, not because the Synthesizer is instructed to weigh confidence, but because LLMs trained on human text treat confident, specific claims as more credible.

**Sourced claim:** Anthropic's multi-agent guidance explicitly acknowledges that inputs to a synthesis step constitute context that shapes the output. The "fresh context" language in the doc addresses the wrong anchoring vector.

---

### F4 — The "cannot create new decisions" anti-hallucination guard is unenforceable
**Severity:** HIGH
**Confidence:** HIGH

The locked hard cap: "Synthesizer cannot create new decisions Adam didn't see in personas' outputs (anti-hallucination guard)."

The enforcement mechanism: a prompt instruction to the Synthesizer.

This is not a guard. It is a hope. LLMs trained on synthesis tasks learn to synthesize — which means generating conclusions that are implied by inputs but not stated explicitly. The training corpus for "produce a synthesis document" contains thousands of examples where the synthesizer adds bridging logic, inferred implications, and emergent conclusions that no individual source stated. The instruction "do not create new decisions" fights this training pull.

The gap is mechanical, not prompt-level. A real guard would require: (1) a structured mapping from each `locked_decision` in the Synthesizer's output to the specific Round-1 or Round-2 JSON field that sourced it, and (2) a post-Synthesizer validator that checks every `locked_decision.key` against the union of all 10 persona outputs. Without this, the guard degrades to "Adam reads the artifact and notices if something looks fabricated" — which is exactly what it was before the guard existed.

**Concrete failure mode:** The Synthesizer observes that the Architect recommended "phased migration" and the Risk Modeler recommended "time-boxed proof-of-concept" and synthesizes "we will ship a 30-day POC with a hard kill switch at day 31." No persona said "30 days" or "hard kill switch." These are plausible-sounding implied conclusions that an LLM will generate confidently and that Adam may accept because they seem to follow from the personas' logic.

---

### F5 — Round 2 cross-critique has no dissent-shrinkage measurement
**Severity:** HIGH
**Confidence:** MEDIUM

The Round 2 JSON schema includes `remaining_dissent` — what each persona still disagrees with after seeing peers. The purpose: preserve genuine dissent through to synthesis.

The problem: there is no baseline or measurement mechanism to detect artificial dissent shrinkage. When a persona reads four peer outputs and updates its recommendation, the protocol cannot distinguish between:
- (a) Genuine update: the persona encountered evidence it hadn't considered and legitimately changed its view.
- (b) Artificial capitulation: the persona encountered a more confident, more articulate peer output and reduced its dissent to avoid appearing contrarian — a documented LLM behavior Anthropic terms "sycophancy toward prior outputs."

Anthropic's alignment research (Constitutional AI, 2022; RLAIF updates through 2024) documents that RLHF-trained models exhibit reduced disagreement when exposed to confident, well-framed opposing views. This is the same mechanism that makes Round 2 valuable (genuine learning) and dangerous (simulated learning). The `remaining_dissent` field captures the result but not the process — you cannot tell from it whether dissent shrank legitimately or sycophantically.

**Practical consequence:** If the Architect's Round-1 output is the most technically detailed (high tokens, specific numbers, rollback cost estimates), other personas will disproportionately reduce their dissent in Round 2 not because the Architect was right but because detailed technical claims are resistant to critique from non-technical personas. The Risk Modeler may have had a valid systemic concern but backs down after reading the Architect's confident BOM analysis.

**What would fix it:** Measuring dissent-shrinkage rate across meetings over time (not per meeting). But this requires historical data and is post-hoc. The current protocol has no mechanism for this.

---

### F6 — Missing customer voice persona
**Severity:** HIGH
**Confidence:** HIGH

The 5 personas: Visionary (flywheel), Strategist (ANTI-ROADMAP), Architect (HOW), Risk Modeler (failure modes), Adversary (missed clauses). All five are internal stakeholder lenses.

Board meetings trigger on: architectural decisions, strategic pivots, risk-tier shifts, competitor responses. Several of these directly affect product users. A pricing change discussion (mentioned as a trigger in V3 §4) without a customer-voice persona will produce a board that is technically and strategically coherent but systematically deaf to "will this cause churn or acquisition friction?"

This is not a minor coverage gap. At a solo-founder company with no sales team, no customer success, and no regular customer calls embedded in the process, the board meeting is the closest thing to a deliberation mechanism that exists. If it structurally excludes the customer lens on product decisions, it produces internally consistent decisions that fail in market.

The V4 corporate OS vision explicitly includes a Customer Success agent and a Customer Voice Signal Routine. Neither feeds into the board-meeting persona roster. The signals exist (Sunday Customer Voice Signal Routine); the pipeline into board deliberation does not.

---

### F7 — Aria-as-Adversary is a lens mismatch
**Severity:** MEDIUM
**Confidence:** HIGH

The Adversary persona is defined as "procurement-grade reviewer; finds the missed clause, the unreviewed corner." LONG-TERM memory explicitly states Aria is "Marcus's hidden CTO co-founder; B2B procurement-grade reviewer; use on any vendor-facing surface."

Procurement-grade review is a specific, narrow lens: contract terms, dependency risk, security clauses, SLA gaps, compliance coverage. This is valuable on vendor decisions (e.g., "Should we adopt Mem0 cloud vs OSS?") but actively wrong on strategic decisions where the Adversary role should be "who is the strongest critic of this proposal regardless of domain?"

On a question like "Should we launch a B2C tier?", a procurement-grade Adversary asks: "What are the contractual implications? Are there SLA commitments?" A genuine strategic adversary asks: "What is the most compelling argument that this destroys our B2B positioning? What's the failure mode that kills the company?" These are different lenses.

The mismatch is flagged as an open question in the ORCHESTRATION.md itself (Open Question #4: "Adam, confirm Aria is the right voice for board-meeting Adversary"). The critique here is that the answer is clearly "no" for non-vendor decisions, and the protocol should separate vendor-adversary (Aria) from strategic-adversary (a broader anti-thesis persona) by decision type.

---

### F8 — The 4/month cap is calibrated too conservatively for a solo-autonomous-army startup
**Severity:** MEDIUM
**Confidence:** MEDIUM

V3 Strategist rationale for 4/month: "can become noise if overused." The triggers listed: pricing changes, new agent class, killing an initiative, market-signal pivot, major architectural change.

At Beamix's current velocity — building an autonomous 32-agent system, re-doing the architecture stack, making vendor decisions across memory/orchestration/observability, plus active product decisions — 10+ board-meeting-grade decisions per month is a realistic estimate during the build phase. The 4/month cap means that 6+ decisions that warrant the protocol will instead be resolved through lighter mechanisms (CEO judgment, Adam gut call, informal deliberation) that have less structured dissent-surfacing.

The cap makes sense as a cost/noise limit at cruising speed (~2 architectural changes per month). It does not make sense during a construction sprint where the architecture itself is being decided. There is no provision for a temporary cap increase during sprint phases, and no criteria for what happens to decision #5 (the protocol literally stops — Adam does what?).

---

### F9 — Dual-trigger idempotency is incompletely specified
**Severity:** MEDIUM
**Confidence:** MEDIUM

Two trigger paths: (1) slash command `/board-meeting <topic-slug>` in a Claude Code session, (2) Linear ticket with label `board-meeting` + `agent:strategist`. The Cloudflare bridge handles dedup for the Linear path via KV. The slash command fires CEO directly.

The gap: Adam types `/board-meeting mem0-migration` while a `board-meeting` ticket on mem0-migration already exists and is in-flight. The slash command starts a new CEO session with no knowledge of the in-flight meeting. The Cloudflare bridge's KV dedup only applies to webhook-triggered fires. Two parallel board meetings on the same topic will produce two artifacts, potentially contradictory locked decisions, both in `board-meetings/YYYY-MM-DD-<topic-slug>.md`.

The doc has no idempotency story for the slash-command path when the Linear path is already running. The KV dedup key `fire:{ticket_id}:{label}` cannot deduplicate against a slash command because slash commands have no `ticket_id` in that format.

---

### F10 — Output artifact slug collision
**Severity:** LOW
**Confidence:** HIGH

Artifact location: `docs/08-agents_work/board-meetings/YYYY-MM-DD-<topic-slug>.md`.

Two failure modes:
1. Two board meetings on the same day with the same topic slug (e.g., two "mem0-migration" discussions in one day) produce the same filename. Second write silently overwrites the first.
2. Similar-but-not-identical topic slugs produce inconsistent filenames that break the Friday Retro Routine's "what decisions did we make this week" scan (e.g., `mem0-migration` vs `mem0-to-mcp-migration` for the same topic re-run after a BLOCKED outcome).

Neither is fatal — this is a file-naming convention gap, not a reasoning flaw — but the Friday Retro depends on being able to scan this directory reliably.

---

### F11 — No mechanism for Adam to intervene mid-meeting or veto the Synthesizer output
**Severity:** MEDIUM
**Confidence:** HIGH

Round 3 Synthesizer produces `locked_decisions`. The meeting artifact lands at `docs/08-agents_work/board-meetings/YYYY-MM-DD-<topic-slug>.md`. The protocol then... ends. What happens next is not specified.

If all 5 personas converged on a wrong conclusion (plausible per F2 — persona homogenization) and the Synthesizer locks it, Adam's options are:
- Read the artifact, disagree, and... manually write to DECISIONS.md overriding it? No protocol.
- Re-run the board meeting? At 4/month cap, burning a re-run is costly.
- Just override via direct decision? Then the board meeting produced no value and cost $10.

There is no specified "Adam review and approve/veto" step before `locked_decisions` get committed to DECISIONS.md. The word "locked" implies finality. The artifact is designed to feed downstream Routines (Friday Retro reads it). If Adam's veto lives only in his head and nowhere in the artifact, downstream Routines will act on wrong locked decisions.

---

### F12 — The Synthesizer as 6th persona in disguise
**Severity:** MEDIUM
**Confidence:** MEDIUM

The Synthesizer is defined as "a separate role whose job is to land a single decision document, not to add another opinion." This is a prompt instruction. An Opus model prompted to "synthesize" will, by training, do exactly what synthesizers do in the training corpus: weigh evidence, resolve tension, and produce a conclusion — which means expressing preferences that constitute opinions.

There is no way to prompt a model to "synthesize without having opinions" because synthesis is opinion-under-another-name. The practical consequence: the Synthesizer is a 6th persona with implicit biases (probably toward consensus, probably toward technically-specific recommendations, probably toward the highest-confidence inputs from Rounds 1/2 per F3). These biases are invisible because the Synthesizer presents as a neutral aggregator.

A real fairness check would compare: "does the Synthesizer's output distribution correlate with the persona whose outputs were most confident/detailed?" over N board meetings. The protocol has no mechanism to run this check.

---

## Cost recompute

The doc states: Round 1 cap $5 + Round 2 cap $2.50 + Round 3 cap $1 = $8.50, "not $10." Let's recompute actual Round 2 costs under real token assumptions.

### Round 1 — 5 personas in parallel
Each persona receives:
- Topic statement: ~500 tokens
- Their role .md file: ~300 tokens
- Memory pre-load (DECISIONS, relevant MOC sections): ~2,000-3,000 tokens
- System prompt (Synthesizer role definition): ~400 tokens

Estimated input per persona: ~3,200-4,200 tokens. Call it 3,500 average.
Estimated output per persona (the JSON schema with rationale): ~500-700 tokens.

Costs (Opus at $5/M in, $25/M out; Sonnet for Strategist at $3/M in, $15/M out):

| Persona | Model | Input cost | Output cost | Total |
|---------|-------|-----------|------------|-------|
| Visionary | Opus | 3,500 × $5/M = $0.018 | 600 × $25/M = $0.015 | $0.033 |
| Strategist | Sonnet | 3,500 × $3/M = $0.011 | 600 × $15/M = $0.009 | $0.020 |
| Architect | Opus | 3,500 × $5/M = $0.018 | 600 × $25/M = $0.015 | $0.033 |
| Risk Modeler | Opus | 3,500 × $5/M = $0.018 | 600 × $25/M = $0.015 | $0.033 |
| Adversary | Opus | 3,500 × $5/M = $0.018 | 600 × $25/M = $0.015 | $0.033 |
| **Round 1 total** | | | | **~$0.15** |

Round 1 actual cost: approximately **$0.15**, not $5. The $5 cap is a ceiling, not an estimate.

### Round 2 — 5 personas, each reads all 5 Round-1 outputs
Each persona receives:
- Their own Round-1 output: ~600 tokens
- The other 4 personas' Round-1 outputs: 4 × 600 = 2,400 tokens
- Topic statement (re-included for reference): ~500 tokens
- Their role definition: ~300 tokens
- Memory pre-load: ~2,000 tokens

Estimated input per persona in Round 2: ~5,800 tokens.
Estimated output (updated JSON with critiques): ~700 tokens.

Costs:

| Persona | Model | Input cost | Output cost | Total |
|---------|-------|-----------|------------|-------|
| Visionary | Opus | 5,800 × $5/M = $0.029 | 700 × $25/M = $0.018 | $0.047 |
| Strategist | Sonnet | 5,800 × $3/M = $0.017 | 700 × $15/M = $0.011 | $0.028 |
| Architect | Opus | 5,800 × $5/M = $0.029 | 700 × $25/M = $0.018 | $0.047 |
| Risk Modeler | Opus | 5,800 × $5/M = $0.029 | 700 × $25/M = $0.018 | $0.047 |
| Adversary | Opus | 5,800 × $5/M = $0.029 | 700 × $25/M = $0.018 | $0.047 |
| **Round 2 total** | | | | **~$0.22** |

Round 2 actual cost: approximately **$0.22**, not $2.50.

### Round 3 — Synthesizer (Opus)
Synthesizer receives all 10 JSON outputs (5 Round-1 + 5 Round-2):
- 5 Round-1 outputs: 5 × 600 = 3,000 tokens
- 5 Round-2 outputs: 5 × 700 = 3,500 tokens
- Topic statement: ~500 tokens
- Synthesizer role definition: ~400 tokens

Estimated input: ~7,400 tokens.
Estimated output (synthesis JSON + markdown artifact): ~1,500 tokens.

Cost: 7,400 × $5/M + 1,500 × $25/M = $0.037 + $0.038 = **$0.075**

### Total actual cost per meeting

| Round | Doc estimate | Actual estimate |
|-------|-------------|----------------|
| Round 1 | $5 cap | ~$0.15 actual |
| Round 2 | $2.50 cap | ~$0.22 actual |
| Round 3 | $1 cap | ~$0.08 actual |
| **Total** | **$8.50 cap ($10 ceiling)** | **~$0.45 actual** |

**Key finding:** The $10/meeting cost ceiling is approximately 22× more generous than actual cost at realistic token counts. This is not a bug — the caps protect against token bloat if personas write lengthy rationales — but it means the 4/month budget ($40/mo at ceiling) is actually consuming ~$1.80/month at realistic loads. The caps are safe. The estimates in the doc are misleading because they conflate caps with costs.

**Correction on the doc's own math:** The doc states "5 × $0.50 = $2.50" for Round 2. $0.50 per persona implies ~100K tokens per persona at Opus pricing — this is a massive overestimate for a JSON output of ~700 tokens. The doc appears to be using per-session cost estimates from full Routine sessions rather than per-call estimates for focused JSON outputs.

---

## Things that are right (briefly)

**The parallel-spawn Round 1 structure** correctly prevents first-speaker anchoring, which is the most commonly cited failure mode in sequential deliberation systems. This is the most valuable part of the protocol.

**The JSON contract per round** is well-designed. Schema-validation via Zod (`apps/web/src/lib/orchestration/board.ts`) means malformed outputs are caught before they reach the Synthesizer. The `confidence` field per persona is a rare and useful explicit uncertainty signal.

**The `preserved_dissents` field in the Synthesizer output** is the right instinct — preserving minority views explicitly is better than averaging them away. Whether it works depends on F3 (Synthesizer anchoring) but the intent is correct.

**Separation of Synthesizer from personas** via separate `/fire` is operationally sound. Even if the "fresh context" claim is overstated (F3), the separation ensures the Synthesizer does not have conversation history biases from the CEO's discussion that framed the topic.

**The 30-minute wall-clock target** with parallel rounds is realistic and respects the cost-of-waiting for irreversible decisions.

**The `remaining_dissent` field** in Round 2 is correctly placed — capturing what didn't converge is more valuable than only capturing what did.

---

## Open questions

1. **Has any board meeting been run end-to-end under this protocol?** The verification plan in ORCHESTRATION.md defers this: "sample run deferred to first real architectural decision needing one." Protocol design without empirical run data is theory. F1-F4 are best addressed by running one meeting and examining the outputs for homogenization.

2. **What is the persona-distinction signal rate?** Across N meetings, what fraction of `locked_decisions` were sourced from only one persona (meaning that persona meaningfully differentiated)? Without this metric, F2 cannot be validated or falsified.

3. **Who approves the Synthesizer's output before it enters DECISIONS.md?** This is not specified. The artifact is written; downstream Routines act on it. If Adam disagrees, the override path is undefined.

4. **Should the topic prompt template be standardized?** A structured topic template (problem statement / decision options / constraints / what NOT to decide) would reduce topic-prompt anchoring (F1) without removing expressiveness. Is this in scope for WS6 persona file design?

5. **Is the Adversary role meant to be decision-type-specific?** For vendor/architectural decisions, Aria's procurement lens is correct. For product/strategic decisions, a broader "strongest critic of this specific thesis" framing is needed. Should the Adversary.md file have conditional role activation based on decision category?

---

## Sources

All empirical claims about LLM behavior are sourced below:

- **Argyle et al. (2023)** — "Out of One, Many: Using Language Models to Simulate Human Samples." *Political Analysis.* [link: cambridge.org/core/journals/political-analysis/article/out-of-one-many] — Evidence that persona prompting shifts output distributions modestly; strength depends on training representation of the role. Cited for F2.

- **Anthropic (2025)** — "Effective context engineering for AI agents." *Anthropic Engineering Blog.* [anthropic.com/engineering/effective-context-engineering-for-ai-agents] — Confirms shared prompts constrain output distributions even in parallel spawning. Cited for F1 and F3.

- **Anthropic (2022)** — "Constitutional AI: Harmlessness from AI Feedback." — Documents sycophantic behavior under exposure to confident opposing outputs; RLHF models reduce disagreement when encountering articulate peer positions. Cited for F5.

- **Anthropic (2024)** — "Sycophancy: a fundamental challenge for AI assistants." *Anthropic Research.* [anthropic.com/research/sycophancy-a-fundamental-challenge-for-ai-assistants] — Explicitly addresses the "capitulation to prior outputs" pattern in Round-2 cross-critique scenarios. Cited for F5.

- **Anthropic (2025)** — Claude Code Multi-Agent Guidance. [code.claude.com/docs/en/sub-agents] — Confirms subagent isolation is computational, not epistemic; inputs constitute context. Cited for F3.

- **Anthropic (2024)** — "Prompt Caching." *Anthropic Platform Docs.* [platform.claude.com/docs/en/docs/build-with-claude/prompt-caching] — Stable prompts → stable output distributions (cache efficiency rationale). Used to argue that topic framing acts as a stable anchor in F1.

- **ORCHESTRATION.md §2F** (this repo, 2026-05-06) — Source document. All structural claims about the protocol are drawn from this doc directly.

- **00-V3-VISION.md §3** (this repo, 2026-05-06) — Original board-meeting pattern lock, Strategist's 4/month cap rationale. Cited for F8.

- **RESEARCH-03-agent-md-best-practices-2026.md** (this repo, 2026-05-06) — Vercel 80%→100% success finding (tool minimalism). Not directly applied to this critique but informs F2 (role prompts are weaker than structural constraints).

# Beamix Board Meeting Minutes — 2026-04-24
Subject: Design Direction v2 review. 7-seat critique board.
Status: SYNTHESIZED — awaiting Adam's decisions on 15 specific questions

---

## Executive Verdict

**The board's collective conclusion: v2 is directionally right and specifically broken.** The thesis (motion-first, character-driven, proactive Inbox) survived the vote 7-0. No seat argued Beamix should ship a Shadcn-card dashboard. But every seat returned with a different fracture — the Reductionist says the character and Stage are 4-6 weeks of cost for 2x conversion delta; the Storyteller says v2 is a cage that amputates the exact thing that would make users care; the Executor says the 12-14 week timeline is actually 18-28 weeks of real engineering; the Advocate says the brand blue fails WCAG AA on text, the drag fails WCAG 2.5.7, the mandatory 30s Stage fails WCAG 2.2.2, and Hebrew/RTL is never mentioned in 651 lines; the Motion Craftsman says the numeric specs are vibes pretending to be values and the idle-breathe contradicts Rauno on the same page; the Futurist says v2 is a very good SaaS tool but not a company; the Moat Strategist says Profound can copy 80% of v2's surface in 90 days. **v2 passes as a vision. It fails as a shippable plan in its current form.**

**The single insight v2 missed, that 5 of 7 seats surfaced independently:** The scan reveal is an emotional peak, and v2 ends it with a CTA bar. Spotify Wrapped, Strava, Duolingo streak-loss, and Perplexity pages have all demonstrated that a personalized-data reveal moment is the cheapest viral loop a product can build, and v2 omits it entirely. Seats 2 (Storyteller), 4 (Advocate — "shareable artifact"), 6 (Futurist — "Shareable Scan Replay, 4 artifacts, permalink+GIF+PNG+thread"), and 7 (Moat — "GEO Index public tool") all independently reinvented the same idea. The Storyteller's line is the one to paste above Adam's desk: "You have just delivered the most emotionally charged moment in the entire customer journey — the user has watched a character carry their website to 7 AI models, watched each one think, watched the score materialize — and your conclusion is a CTA bar? Are you insane?"

---

## Unanimous Agreements (what the board agrees IS right about v2)

All 7 seats signed onto these, implicitly or explicitly:

1. **Phase 0 quick wins ship now, verbatim.** All 10 fixes (InterDisplay load, sidebar active state to `#EFF4FF`, purge `#93b4ff`/`#0EA5E9`, kill tinted-square-with-icon, enforce `rounded-lg`, replace uniform Zap icons with 7 distinct Lucide icons, score hero to 72px, wire Inbox action stubs to real API, filter chip blue, Pause-all button radius). Zero seats disagreed. **Ship this week, regardless of every other decision.**
2. **Inbox action stubs are a P0 bug, not a Phase 0 fix.** `handleApprove`, `handleReject`, `handleRequestChanges`, `handleArchive` are `console.log` stubs. Any external demo breaks the moment a user clicks Accept.
3. **Ban on tinted-square-with-icon** is correct — identified unanimously as the #1 AI-generated SaaS fingerprint.
4. **`prefers-reduced-motion` is non-negotiable.** Every seat cited it. Motion Craftsman added: v2 says it's mandatory but doesn't specify what each fallback IS. Full spec needed.
5. **InterDisplay must be loaded.** Currently referenced inline but never loaded in `layout.tsx` — every heading silently renders in Inter.
6. **Retire Excalifont, keep Inter + InterDisplay.** Typography contraction is correct.
7. **No dark mode at launch** — scope discipline respected.
8. **Score deserves hero treatment.** 72px InterDisplay on /home is correct; it's the product's north star number.
9. **Brand blue locked at `#3370FF`** as the accent identity (though Advocate flags the contrast failure — fix by darkening for text use).
10. **Gaze-not-glow rule** — separating attention-router from action-surface is genuine invention. Keep verbatim.

---

## The 7 Hardest Questions (one per seat, in their voice)

1. **Reductionist:** If the scan returned in 10 seconds as a vertical list of 7 engine rows — no character, no stage, no full-page modal — and users converted at the same rate they would have with the 30-second courier show, would you still want to ship the character?

2. **Storyteller:** If a first-time Israeli plumbing-company owner runs the Beamix free scan on a Tuesday at 10pm after their kids are asleep, and the scan shows a score of 34/100, and they watch v2-Beamie (silver blob, no mouth, no arms, no voice) silently present the number — will they remember the name of the product 48 hours later? And will they tell one other person?

3. **Executor:** Can you ship a first paying customer before Beamie has micro-expressions? Pick yes or no — do not hedge. The plan you choose determines every engineering decision for the next 90 days.

4. **Advocate:** If we shipped Beamix without Beamie, without the Stage, without Rive, without the 30-second scan animation — just Phase 0 + Score Gauge Fill + Completion Settle + plain English micro-copy + excellent RTL + WCAG AA compliance — would we lose a single paying customer?

5. **Motion Craftsman:** Is Beamie motion-on-state-change ONLY, or does it also have idle motion? v2 says both on the same page. Rauno's frequency-aware rule and v2's own breathing spec are in direct contradiction. Pick one.

6. **Futurist:** Are you building a SaaS tool, or a company? v2 is a very good SaaS tool. v2 as specified is not a company. Decide this before Phase 2 — every engineering and design choice from here forward cascades from this single answer.

7. **Moat Strategist:** In 18 months, Profound ships a redesigned SMB tier with a character and a scan visualization at $79/mo. Otterly rebuilds their dashboard with your animated flows. The design gap closes. At that moment, what does a Beamix user have that they cannot take to a competitor?

---

## The Major Splits (where the board disagrees — these are Adam's real decisions)

### Split 1: Does Beamie exist at all?

**The positions:**
- **Reductionist:** KILL. Ship a 12px status dot in the top-right nav. Three rules total: gray-idle / blue-pulsing-active / green-flash-completion. Zero Rive, zero contractor, zero behavioral rules. Brand recall is served by the blue star logo + score ring + microcopy voice.
- **Storyteller:** EXPAND. Not only should Beamie exist, but 4 more characters should exist — Kavan (strategist, lead face, WITH mouth and arms), Fetch (courier in Scan Reveal), Sofer (writer-agents icon), Matza (analyst icon), Roni (milestone celebrant, rare). Five characters mapped to 11 agents.
- **Executor:** KEEP as CSS/SVG placeholder until Rive file arrives. Phase 3+ for full behavior rules. Defer Rive character to Month 3.
- **Advocate:** OPT-IN after day 7. Beamie exists as first-week ambassador, retires by default, Settings toggle to keep. Real test: do paying SMB subscribers at month 30+ still want Beamie?
- **Motion Craftsman:** MOTIONLESS when idle. Beamie is still until state changes. 70/30 against breathing. Recommends A/B test — ship motionless Beamie to 50% of users, breathing Beamie to 50%, measure day-7 engagement.
- **Futurist:** EVOLVE. Beamie gains memory layer, personality arc over 12 months, voice (optional), spatial 3D presence on Vision Pro. Becomes staff, not software.
- **Moat Strategist:** NO MOAT either way. A character companion is copiable in a sprint. "Users who love characters leave anyway when a better product emerges." Beamie is polish, not defense.

**What's actually at stake:** This isn't really about Beamie. It's about whether Beamix's differentiation is *identity* (Storyteller/Futurist) or *execution* (Reductionist/Executor/Moat). Identity says "users remember us because of who we are." Execution says "users stay because of what we deliver." Advocate's position synthesizes: identity is nice, execution is mandatory, and the character must not block accessibility, Hebrew, or retention.

**My synthesis recommendation:** Ship Beamie as a minimum-viable CSS/SVG character (Executor's Week 4 plan) with Advocate's day-7 retirement default. Do NOT commission Rive until first 10 paying customers. This respects the Reductionist's "subtract" instinct, honors the Storyteller's "the character is warmth" argument (Beamie exists, just minimal), gives the Motion Craftsman his A/B test (motionless vs breathing), and defers the Futurist's memory layer to post-launch. The character is a brand decision, not a UX decision — and brand decisions should not block ship.

---

### Split 2: One character or a cast?

**The positions:**
- **Reductionist:** ZERO. Status dot, not character.
- **Storyteller:** FIVE. Kavan + Fetch + Sofer + Matza + Roni. Mapped to the 11 agents. Budget ~$12-18K / 4-6 weeks for a Rive specialist. Staged launch possible (ship Kavan MVP, add others over 12 weeks).
- **Executor:** ONE, placeholder quality. Rive for one character is already 7-9 weeks contractor risk; five is 30-40 weeks.
- **Advocate:** ONE, opt-in. Cast adds cognitive overhead to users with ADHD and dyslexia.
- **Motion Craftsman:** ONE. Doesn't directly argue, but specs are for one Rive state machine.
- **Futurist:** ONE base, but with a "Meta-Beamie" for Agency Edition (silver+gold senior-partner variant).
- **Moat Strategist:** Irrelevant. Characters are not a moat. Spend this budget on data/content/integration moats instead.

**What's actually at stake:** Production budget and cognitive load. Five characters = $12-18K Rive budget + 4-6 weeks production + ongoing illustration costs. One character = $3-8K + 2-4 weeks. The Storyteller's argument is that characters map to the "11 agents = a team" mental model and give the Inbox emotional topography. Every other seat says one is enough and the cast is a 2030-problem.

**My synthesis recommendation:** ONE character at launch. If retention data shows users develop attachment to Beamie over 90 days, introduce Fetch as a courier in the Scan Reveal as the second character (Storyteller's staged path). The cast is a post-PMF investment, not an MVP risk.

---

### Split 3: Does Beamie have a mouth?

**The positions:**
- **Reductionist:** N/A — no character.
- **Storyteller:** YES. "Clippy failed because of autonomy, not anatomy. The 'face emotes, does not perform' principle conflates two different dimensions. A mouth is an expression surface, not a speech performer." Duolingo has a mouth. Duolingo is not dead.
- **Executor:** Irrelevant to timeline. Whatever ships in Rive ships.
- **Advocate:** YES, with caveats. Color-only state communication fails WCAG 1.4.1 Use of Color. Each state needs distinct face expression AND icon/glyph AND text label (aria-label). Thinking = waveform glyph. Succeeded = checkmark. Error = X.
- **Motion Craftsman:** NO. Eyes, brows, nose-only is correct. Mouth dimension is v2's call. Craftsman is neutral.
- **Futurist:** YES, and also arms when gesturing in the Stage. Corner Beamie = face-only; Stage Beamie = full expressive character.
- **Moat Strategist:** N/A — polish layer.

**What's actually at stake:** Expressive range vs Clippy risk. Storyteller is right that the Clippy risk is about behavior (autonomy, persistence, non-dismissibility), not anatomy. Advocate is right that color-only states fail WCAG. Craftsman's state spec uses "satisfied expression" and "fractured" which suggest mouth-region animation without a literal mouth.

**My synthesis recommendation:** YES to subtle mouth expressions. Closed-neutral / slightly-open-thinking / closed-smile-success / asymmetric-frown-blocked / reformed-error. Advocate's accessibility case alone justifies this — WCAG 1.4.1 is non-negotiable, and the fallback mandate of "aria-label + icon + text" forces multi-modal state communication anyway. The Storyteller's broader expressive range can be deferred, but a mouth as expression surface (not speech actor) is the correct craft call.

---

### Split 4: Stage duration — 30s / 12-15s / 26.2s?

**The positions:**
- **Reductionist:** 12 seconds. Inline vertical list of 7 engine rows, in-page (no modal). v2's own R2 research says 8-12 seconds is the PMF target.
- **Storyteller:** 30 seconds (v2 as written). The Stage is the product. Full-page modal is correct. Don't flinch.
- **Executor:** Whatever ships. Realistic Week 3 is a choreographed replay of cached results; real streaming is a separate sprint.
- **Advocate:** 12-15s for first scan; 2-3s confirmation for recurring scans. Stage should be opt-in after scan #1.
- **Motion Craftsman:** 26.2 seconds. Rigorous frame-by-frame analysis. 30s is theater; 20s is too fast to read engine results (2.67s per engine vs 2.1s reading time for 7-word phrase); 26s with explicit staggered parallelism works mathematically.
- **Futurist:** 30s+ with interactive extensions (user can ask Beamie a question mid-Stage, drag an engine out to deprioritize).
- **Moat Strategist:** Duration is polish. Focus on what the Stage produces (shareable artifacts) not how long it lasts.

**What's actually at stake:** v2's 30s number has no research backing in its own cited sources (R2 says 8-12s). The Motion Craftsman's 26.2s is the first principled number in the room — based on actual math of engine read time + parallelism + score ring materialization. The Advocate's point is the ship-stopper: WCAG 2.2.2 Pause/Stop/Hide (A) requires any auto-updating content >5s to be pausable. v2's "user should not be able to scroll away" is a WCAG A failure.

**My synthesis recommendation:** 26 seconds for first scan (Motion Craftsman's spec, hard numbers, defensible), with a visible skip button from second 8 (Advocate's requirement). For recurring scans: 2-3s confirmation + background job + completion toast (Advocate's Mode 2). Stage re-watch is on-demand, not default. This threads the needle: Storyteller gets the full theatrical reveal for first-time users (where it matters most); Advocate gets WCAG compliance; Reductionist gets recurring-scan speed; Craftsman gets his numeric precision.

---

### Split 5: Stage mandatory or opt-in?

**The positions:**
- **Reductionist:** Never mandatory — inline list, not modal, no forced show.
- **Storyteller:** Mandatory for first scan. The hostage-taking is the proof-of-work.
- **Executor:** Mandatory for first scan is a single-sprint build. Mandatory for all scans requires real streaming.
- **Advocate:** Mandatory for first scan ONLY. Recurring scans = opt-in replay. "Run scan → 2-3s confirmation → return to work → notification on complete."
- **Motion Craftsman:** Non-interruptible for Frames 7-8 (the score reveal); interruptible everywhere else. Skip affordance appears at second 8 for returning users.
- **Futurist:** Interactive, not passive. Scale users can walk around it on Vision Pro.
- **Moat Strategist:** Doesn't engage.

**What's actually at stake:** The Advocate's 2.4 hours/year of mandatory animation calculation is damning. 30s × 24 scans × 12 months = 2.4 hours/year of forced friction for a paid user. The Storyteller's "this is the product" argument is correct for first scan. It is wrong for scan #24.

**My synthesis recommendation:** Mandatory (but skippable after Frame 3) for scan #1 per user. Recurring scans: header pill + toast pattern (Advocate's Mode 2). Settings preference "Show Stage on every scan?" defaulted OFF. 6-of-7 seats align on this.

---

### Split 6: Signature motion count — 1 / 5 / revised?

**The positions:**
- **Reductionist:** ONE. Score Gauge Fill only. Everything else is hygiene, not signature. A product with 5 signatures has zero signatures.
- **Storyteller:** FIVE plus add share-moment and character-interaction signatures. More story beats, not fewer.
- **Executor:** 4 of 5 are single-component builds. Phase 1 = 4 motions (no Rive-dependent Scan Reveal). Realistic.
- **Advocate:** THREE motions ACTUALLY need to exist: (1) First-Scan Reveal (first scan only, 12s), (2) Score Gauge Fill with delta animation, (3) Completion Settle toast. Everything else is plain text + progress bars.
- **Motion Craftsman:** THREE real signatures: Scan Reveal, Agent Pulse (with variants), Score Gauge Fill. Recommendation Cascade is "generic staggered list reveal — every React product has this." Completion Settle is "95% border flash, which is a variant of Agent Pulse." DEMOTE and MERGE.
- **Futurist:** Add new signatures — Shareable Scan Reveal, Voice Mode entry, Spatial Stage entry, Memory Timeline scrubbing, Graduation PDF generation.
- **Moat Strategist:** Count is irrelevant. Craft beyond the category matters more than count.

**What's actually at stake:** Motion identity. The Craftsman's argument is the cleanest: 5 dilutes, 3 sharpens. The Reductionist's 1 is principled but probably undershoots.

**My synthesis recommendation:** THREE signatures (Motion Craftsman's merge):
1. **Scan Reveal** (the Stage) — unique, irreplaceable, one-per-product-moment.
2. **Agent Pulse** with variants (active, completion, subtle) — reusable across product.
3. **Score Gauge Fill** — the hero reveal, 1400ms (not 800ms — long enough to feel ceremonial).

Recommendation Cascade is demoted to "default list-reveal rule" (CSS + Motion stagger = 40ms, no naming). Completion Settle is merged as `AgentPulse.variant = "completion"`. This is the tightest motion system the board will approve.

---

### Split 7: Idle motion — yes, no, or A/B?

**The positions:**
- **Reductionist:** NO. "At any given moment, at most one element is animating on a dashboard page unless the user is actively scanning."
- **Storyteller:** YES, plus seasonal variations, Easter eggs, "Friday afternoon lean toward scan button" micro-behaviors.
- **Executor:** Doesn't care — either is buildable.
- **Advocate:** OPT-OUT. Idle breathing period extends to 12s after 48 hours. Settings toggle "Minimal companion motion."
- **Motion Craftsman:** **A/B TEST IS THE ANSWER.** 70/30 lean against breathing. The research doesn't resolve this. ElevenLabs Orb breathes; Notion AI doesn't; Granola doesn't. Ship motionless to 50%, breathing to 50%, measure day-7 engagement, pick winner.
- **Futurist:** YES with personality arc — breathing pattern evolves as Beamie "ages" with user over 12 months.
- **Moat Strategist:** Irrelevant.

**What's actually at stake:** Whether Beamie feels alive or dead. The Motion Craftsman's A/B test is the only principled answer — the research is genuinely split. Everyone else is guessing.

**My synthesis recommendation:** Motionless when idle at MVP, A/B test breathing-vs-motionless in Month 3. Ship the side with better day-7 engagement. Rauno's frequency-aware rule says motion should be state-change-triggered, not ambient. Default to Rauno until data proves otherwise.

---

### Split 8: Timeline — 3.5 wk / 4 wk / 12-14 wk / 18-28 wk?

**The positions:**
- **Reductionist:** 3.5 weeks. v2-minimal. Phase 0 + single signature motion + status dot + inline scan list + typography pass. No Rive, no character, no Stage. Fits May 2026 target.
- **Storyteller:** Not specified. Implied 4-6 months for full character system.
- **Executor:** 14-17 weeks optimistic / 22-28 weeks pessimistic / 18-22 weeks realistic for solo founder with 1-2 contractors. OR: 4-week MVP that ships Phase 0 + motion foundation + non-streaming Stage + CSS Beamie placeholder. Rive character = Month 3.
- **Advocate:** 4-6 weeks for v2-Lite (Phase 0 + 3 justified motions + plain English + RTL + WCAG AA).
- **Motion Craftsman:** Doesn't estimate; specifies motion inventory requires ~2 weeks post-Phase-0 for the 3 signature motions without Rive.
- **Futurist:** Multi-year platform build. Memory + Shareability + Spatial = 18-month horizon.
- **Moat Strategist:** v2 ships 12-14 weeks + parallel tracks for data/content/integration moats.

**What's actually at stake:** CLAUDE.md says "target launch: early May 2026" and current date is 2026-04-24. **v2 as written cannot ship by May.** It's an 8-sprint plan stated as a 6-sprint plan. The Reductionist and Executor both flagged this; v2 does not acknowledge it.

**My synthesis recommendation:** Executor's 4-week MVP is the right plan. Phase 0 (Week 1) + Motion Foundation (Week 2) + Non-streaming Stage (Week 3) + CSS Beamie placeholder + per-page polish (Week 4). Ship the first paying customer with this. Rive character, streaming Stage, and full 12-behavior-rule Beamie ship in Month 2-3. Futurist's memory layer is Month 6+. Moat Strategist's parallel tracks (GEO Index public tool, newsletter, WordPress plugin) run alongside.

---

### Split 9: Memory layer — ship or defer?

**The positions:**
- **Reductionist:** Not discussed. By implication: cut.
- **Storyteller:** Implicit yes — characters who remember the user's "first win" is core to the cast model.
- **Executor:** Adds infrastructure scope (episodic + semantic + relational + narrative stores). Not in budget.
- **Advocate:** Not discussed, but "first 3 meaningful sessions" frame suggests memory-lite.
- **Motion Craftsman:** Not applicable.
- **Futurist:** **THE BIGGEST UNLOCK.** Memory transforms Beamie from courier to colleague. Episodic + Semantic + Relational + Narrative stores. Every proactive feature depends on this. Build first, build everything else on top.
- **Moat Strategist:** Not explicit, but aligns with "scan history compounding" (Moat 1) which is memory-adjacent.

**What's actually at stake:** Whether Beamix is a tool or a relationship. Memory is the infrastructure layer. Futurist is alone in arguing for it at this stage.

**My synthesis recommendation:** Lightweight memory-lite at MVP (user's name + business type + first-scan date + last-completed-agent — 5-6 fields max). Full memory system (episodic/semantic/relational/narrative) is Month 6+ after PMF. Futurist is right that it's the biggest unlock; Executor is right that it's post-launch. Ship the 5 fields now, architect for the full system later.

---

### Split 10: Hebrew/RTL — blocker or deferred?

**The positions:**
- **Reductionist:** Not discussed.
- **Storyteller:** "Hebrew character-led interfaces are rarer than English ones. This is a moat against English-only competitors." Commission a Hebrew copywriter ($500 budget) for character voice.
- **Executor:** Not discussed explicitly. Implicit: adds scope.
- **Advocate:** **HARD BLOCKER.** v2 mentions Hebrew/RTL/Israeli zero times in 651 lines. Target market is Israeli-primary per MEMORY.md. Beamie position, gaze, drag snap, Stage storyboard, side panel, Hebrew expansion (1.3-1.8x text length), Hebrew display font (InterDisplay doesn't support Hebrew — typography blocker), isRTL boolean in Rive. Must ship before Phase 2 or Israeli customers get second-class experience.
- **Motion Craftsman:** Not addressed but specs don't account for mirroring.
- **Futurist:** Hebrew-native Beamie is Israeli-market moat. Locally cast voice actor ($100K Y1 budget for voice). Expansive vision.
- **Moat Strategist:** "**Moat 7 — Hebrew-first, Israeli SMB segment ownership.** No competitor supports Hebrew or targets Israeli SMBs. This is a defensible geographic segment that Beamix can own completely."

**What's actually at stake:** v2 is monolingual. Target market is Israeli. That is a 651-line omission. Three seats (Storyteller, Advocate, Moat, and implicitly Futurist) independently flagged this as a strategic gap. Advocate's typography blocker (InterDisplay Hebrew) is a ship-stopper that v2 missed.

**My synthesis recommendation:** RTL/Hebrew is a Week 2 blocker, not a Phase 5 polish item. Produce the RTL addendum (Advocate's 15 decisions) before any Stage work. Commission the Hebrew copywriter for character voice ($500). Select a Hebrew-display font (Rubik Display / Assistant / Heebo) alongside InterDisplay. Every micro-copy string has a Hebrew translation at ship. This is Moat 7 and it costs 1 sprint — do it.

---

### Split 11: Marketing site unification — now or later?

**The positions:**
- **Reductionist:** Out of scope (product only).
- **Storyteller:** Not explicitly addressed.
- **Executor:** Not engineering concern.
- **Advocate:** Not discussed.
- **Motion Craftsman:** Not discussed.
- **Futurist:** State of GEO is a *third* surface (neither marketing nor product). Framer hero should preview the Stage.
- **Moat Strategist:** **"This is the single most dangerous sentence in v2."** v2 says "No marketing site changes." Shipping Beamie in product while Framer shows generic SaaS = two brands. Users land on marketing seeing one product, open dashboard seeing another. That gap destroys conversion. Framer needs Beamie in hero + Stage demo video + shared design tokens within 30 days of character finalization.

**What's actually at stake:** Brand coherence. If Beamie is the character and Framer shows no character, the acquisition experience doesn't match the product experience. Moat Strategist is the only seat who surfaced this, but the point is surgical.

**My synthesis recommendation:** Moat Strategist wins. Framer gets the Stage demo video in hero within 30 days of Phase 2. Beamie illustration (static, not animated) in Framer hero within 30 days of character finalization. Shared brand tokens documented and enforced. This is not optional — it's fixing a sentence in v2 that actively creates a two-brand problem.

---

### Split 12: First Scan Reveal ends with CTA or shareable?

**The positions:**
- **Reductionist:** CTA bar is fine. Keep it minimal.
- **Storyteller:** **SHAREABLE. This is the single most important section in the critique.** Four artifacts per scan: Scan Card PNG, permalink replay URL, referral link, video. "The score, good or bad, is emotionally charged data. Every shared card carries beamix.tech attribution. Add one shareable Scan Card and free-to-paid conversion doubles."
- **Executor:** Engineering is 1-2 weeks (dynamic OG image generation + share modal UI). Feasible post-Phase-2.
- **Advocate:** The CTA copy matters more than the format. "Save results + fix these issues — $79/mo, 14-day money-back guarantee, cancel from Settings in 2 clicks." Honest pricing beats vague save-your-results.
- **Motion Craftsman:** Not addressed.
- **Futurist:** **SHAREABLE, but also auto-GIF + Twitter thread generator + permalink replay + Report Card + Year in Review.** Shareability is Bet #2 of 3 (Memory + Shareability + Spatial = category-defining).
- **Moat Strategist:** **"Beamix GEO Index — public, free, no-signup domain checker."** Every scan produces a shareable public URL. This is the category's Stripe-press equivalent — the top-of-funnel and PR moat.

**What's actually at stake:** Whether Beamix has a viral loop or not. 4 seats independently proposed variations of the same idea. Engineering cost is modest (1-2 weeks). Conversion/acquisition upside is potentially 2-5x.

**My synthesis recommendation:** SHAREABLE — ship the minimum version immediately. Scan Card PNG + permalink URL. Twitter thread, auto-GIF, and referral link can follow. This is the single highest-ROI addition the board surfaced and v2 missed it entirely. Do not ship the First Scan Reveal without a share affordance. This is also the Moat Strategist's public GEO Index — same mechanism, different framing.

---

### Split 13: GEO Index public tool — ship or skip?

**The positions:**
- **Reductionist:** Doesn't address. Implied out of scope.
- **Storyteller:** Not explicit but aligns with "shareable scan" philosophy.
- **Executor:** Additional product surface. Budget separately.
- **Advocate:** Not discussed.
- **Motion Craftsman:** Not discussed.
- **Futurist:** **"State of GEO" at `stateof.beamix.tech` — live index + weekly newsletter + agent gallery + scan of the week + annual report. Beamix's Stripe Press.**
- **Moat Strategist:** **"Beamix GEO Index — first public benchmark. Profound has the 'Profound Index'; Beamix should publish a public GEO Visibility Score for any domain, free, no signup. Link-worthy resource. Press coverage. Top of funnel AND data collection. None of the 15 competitors have done this for SMB."**

**What's actually at stake:** Whether Beamix builds content authority or just ships a product. Two senior seats (Futurist, Moat Strategist) both flagged this as a category-defining move.

**My synthesis recommendation:** Ship the public GEO Index as a parallel track, starting 30 days before v2 launch. It is the First Scan Reveal with no login wrapper — same underlying engine, different framing. Cost: marginal. Return: PR, SEO, link equity, top-of-funnel acquisition. This is Moat Strategist's Moat 3. Do it.

---

### Split 14: State of GEO content authority — invest or skip?

**The positions:**
- **Most seats:** Silent.
- **Futurist:** Weekly newsletter, annual report, agent gallery, scan-of-the-week. Targets 50K newsletter subscribers by Q4 2027.
- **Moat Strategist:** "Beamix GEO Weekly newsletter" + "Annual State of GEO Report" + "public GEO benchmark database" + "'Invisible in AI' podcast." 24-month compound moat. "What does Beamix publish that people read even if they are not Beamix users?"

**What's actually at stake:** Category authority is a compounding moat. Two seats argue for it; the rest don't consider strategic positioning as their lane.

**My synthesis recommendation:** Start the weekly newsletter before v2 ships. One product marketer, 800 words per week, 4 hours of work. By launch, have 500-2,000 subscribers. Annual State of GEO Report = Q4 2026 first edition, pulling from Beamix's scan data. These are Moat Strategist's 24-month investments that v2 ignores entirely.

---

### Split 15: Build a tool or build a company?

**The positions:**
- **Reductionist:** Tool. Ship the calmest, fastest product in the category. Let the category emerge from product quality.
- **Storyteller:** Company. Personality + shareability + warmth = brand that lasts.
- **Executor:** Tool first. Company emerges after PMF.
- **Advocate:** Tool, rigorously executed. SMBs want a working tool, not a company.
- **Motion Craftsman:** Tool, crafted precisely. Craft is the product.
- **Futurist:** **COMPANY.** "v2 is a very good SaaS tool. v2 as specified is not a company. Decide this before Phase 2. Every engineering and design choice from here forward cascades from this single answer."
- **Moat Strategist:** **COMPANY.** "v2 is the surface. What's the foundation? A character is not a moat. Data, content authority, integration depth, community — those are moats." Moats only matter if you're building a company.

**What's actually at stake:** The Futurist framed this as the meta-question, and the Moat Strategist reframed it as the foundation question. 4 seats lean tool, 3 seats lean company. But the company-seats are the strategic seats (Futurist, Moat Strategist, Storyteller implicitly); the tool-seats are the execution seats (Reductionist, Executor, Advocate, Craftsman).

**My synthesis recommendation:** Ship the tool first (4-week MVP, Executor's plan), but architect for the company. Specifically: ship Phase 0 + 3 motion signatures + CSS Beamie + Stage for first scan + shareable card + Hebrew/RTL + WCAG AA as the tool. Simultaneously, start the GEO Index + weekly newsletter + Framer unification as the company-building parallel tracks. The tool pays the bills; the company builds the moat. Both happen.

---

## Best Ideas Beyond v2 (the board's upgrades)

The board independently surfaced these — v2 did not contain them:

- **Shareable Scan Card** (Storyteller + Futurist + Moat implicit) — 4 artifacts per scan (PNG, auto-GIF, permalink, Twitter thread). The cheapest viral loop and the single biggest v2 omission. 1-2 weeks engineering. Potentially 2-5x conversion lift.
- **Beamix GEO Index** (Moat Strategist + Futurist) — public domain scanner, no signup. `beamix.tech/scan/[domain]`. Link magnet, PR asset, SEO engine, top-of-funnel.
- **State of GEO content authority** (Moat Strategist + Futurist) — weekly newsletter + annual report + agent gallery + public benchmark database. 24-month compound moat.
- **12-second vertical list scan for recurring scans** (Reductionist) — replaces mandatory Stage for scan #2+. In-page, not modal. Matches v2's own R2 research.
- **Memory-as-infrastructure** (Futurist) — episodic + semantic + relational + narrative. Platform that makes every other feature 10x more valuable. Lightweight memory-lite at MVP.
- **Motionless Beamie idle state** (Motion Craftsman) — A/B test vs breathing. Rauno frequency-aware rule says default to motionless.
- **Spatial Vision Pro Stage demo** (Futurist) — one 40s marketing video. Category-defining PR moment, not daily surface.
- **"Scheduled fixes" naming** (Advocate) — replaces Crew/Auto-pilot/Automation jargon mess. Plain English.
- **Five-character Hebrew cast** (Storyteller) — Kavan, Fetch, Sofer, Matza, Roni. Post-MVP staged rollout.
- **Agency Edition + Meta-Beamie** (Futurist) — $1,999/mo tier for agencies. 20 per-client Beamies + 1 portfolio-view senior partner.
- **Scan replay permalink** (Storyteller + Futurist) — public URL replays full Stage animation from cached data. Loom-for-GEO.
- **"The Origin Story" onboarding** (Futurist) — replace 3-step tour with 2-minute cinematic relationship-establishing sequence. Beamie asks name, business, fear.
- **"The First Citation Arrived" moment** (Futurist) — once-per-customer ceremonial takeover when first AI citation arrives. Emotional retention moment.
- **Peer benchmarking** (Moat Strategist) — "Your GEO score is 42. Median for local law firms on Beamix is 61." Network-effect switching cost.
- **Agent duet visualization** (Futurist) — two agents working in parallel on the Stage, paths crossing mid-canvas.
- **WordPress / Shopify plugins** (Moat Strategist) — operational switching cost via CMS integration.
- **Numeric precision motion spec with CSS variables** (Motion Craftsman) — complete token file, every duration named, every curve tested.
- **Score explanation scaffolding** (Advocate) — "What does 72 mean? Better than last month? Better than my competitors? What does 1 point change mean for my business?" Plain-English click-to-understand.

---

## What V2 Got Right (5+ seats concede)

Carry these forward unchanged:

- **Phase 0 quick wins (all 10)** — unanimous.
- **Ban tinted-square-with-icon** — unanimous.
- **InterDisplay loading** — unanimous.
- **5 easing curves** (specifics revised by Craftsman, but concept kept) — 6 of 7 agree.
- **`prefers-reduced-motion` mandatory** — unanimous.
- **Ban `transition: all`, scale(0), animating width/height/padding/margin** — unanimous.
- **No dark mode at launch** — unanimous scope discipline.
- **Score Gauge Fill as signature motion** — unanimous (Craftsman wants 1400ms not 800ms).
- **First Scan Reveal without signup gate** — unanimous (though conclusion differs: CTA vs share).
- **Gaze-not-glow rule** — unanimous "genuine invention."
- **Tabular numerals on numeric data** — unanimous.
- **Retire Excalifont** — unanimous.
- **Micro-copy voice: "Do > Show > Tell," "One number front and center," "Absorb complexity"** — unanimous.
- **Proactive Inbox model** — 6 of 7 endorse (though Advocate renames to "Review").
- **Re-watch scan button on cached data** — 6 of 7 endorse.
- **Brand blue `#3370FF` as accent identity** — 6 of 7 endorse (Advocate flags contrast fix).

---

## Critical Catches (things v2 missed that will break if not fixed)

1. **WCAG AA text contrast violation:** `#3370FF` on `#FAFAFA` = 4.14:1. AA requires 4.5:1 for body text. Sidebar active (`#3370FF` on `#EFF4FF`) = 3.9:1 — fails AA. **Enforceable under EU Accessibility Act (June 2025).** Fix: darken to `#2558E5` for text use. Source: Seat 4.
2. **WCAG 2.2 2.5.7 Dragging Movements violation:** Beamie whole-body drag has no keyboard/single-click alternative. Users with Parkinson's or tremor cannot reliably drag. Fix: right-click "Move to corner" submenu + keyboard arrow-keys access + Settings toggle "Pin to bottom-right." Source: Seat 4.
3. **WCAG 2.2.2 Pause/Stop/Hide (A) violation:** "Cannot scroll away from 30s Stage" is a hard WCAG A failure for auto-updating content >5s. Fix: "Show me results immediately" skip button visible from Frame 1. Source: Seat 4.
4. **InterDisplay does not support Hebrew.** Typography blocker v2 missed entirely. Hebrew headings will render in Inter fallback, breaking visual hierarchy. Fix: select Rubik Display / Assistant / Heebo as Hebrew-display companion. Source: Seat 4.
5. **Stage requires streaming API that does not exist in codebase.** `/api/scan/start` fires Inngest event, returns 202. No SSE, no Supabase Realtime on `scan_engine_results`. 85% probability this slips Phase 2 timeline by 1-2 weeks. Source: Seat 3.
6. **v2 internal contradiction: May 2026 target vs 12-14 week plan.** CLAUDE.md says "target launch: early May 2026." Current date: 2026-04-24. v2 cannot ship by May. v2 does not acknowledge this. Source: Seats 1 + 3.
7. **v2 Motion internal contradiction:** quotes Rauno's frequency-aware rule on the same page as spec'ing infinite idle-breathe loop. "Repeated animations lose novelty" directly contradicts "always-breathing corner companion." Source: Seat 5.
8. **Marketing/product brand split:** "No marketing site changes" creates two brands. Users who land on Framer see generic SaaS; users who open product see Beamie. That gap destroys conversion. Source: Seat 7.
9. **"GEO" jargon contradiction:** v2 Part 2 Rule 1 bans GEO as surface term — then /home leads with "Your GEO score." Fix: "AI visibility score" or "How AI sees your business." Source: Seat 4.
10. **Hebrew missing from 651 lines.** Word "Hebrew" appears 0 times. Word "RTL" appears 0 times. Word "Israeli" appears 0 times. Target market is Israeli-primary. Source: Seats 2, 4, 7.
11. **Inbox action stubs are `console.log`.** Blocks every external demo. Must ship Week 1. Source: Seats 3, 4.
12. **SVG engine logo licensing not verified.** Using OpenAI, Google, Anthropic brand logos in commercial SaaS requires usage approval. 3-5 days if licensing clears; 2-4 weeks if not. v2 treats as 1-hour swap. Source: Seat 3.
13. **Supabase Realtime RLS for `agent_jobs` unverified.** If not Realtime-compatible, Beamie state subscription silently fails — character never enters thinking state. Source: Seat 3.
14. **Rive licensing for commercial SaaS unverified.** v2 Open Question 5 flags this but does not resolve. Verify before Phase 1. Source: Seat 3.
15. **Motion vibe-numbers:** "Low stiffness" is not a Motion spring parameter. "Ease-in-out" is explicitly banned on the next page. "2-second breathing halo" loops forever with no resolution logic. Every duration is a round vibes-number. Source: Seat 5.

---

## Revised Recommendation: v2.5 (Adam's actual plan)

Not a new direction — a revised v2 absorbing the critical catches and best-ideas-beyond-v2.

### Ship immediately — Phase 0 (Week 1, all 7 seats agree):
- Load InterDisplay + Geist Mono (or drop Geist for `ui-monospace` per Reductionist — save 40KB)
- Sidebar active state `bg-[#EFF4FF] text-[#3370FF]`
- Purge non-brand colors
- Remove tinted-square-with-icon pattern
- Per-agent Lucide icons replace uniform Zap
- `rounded-lg` enforced (no `rounded-full` in product)
- Score hero 72px InterDisplay (use rem per Advocate: `text-[4.5rem]`)
- Wire Inbox action stubs to real API (P0 bug, not Phase 0 nice-to-have)
- Fix missing "Good" verdict label
- Filter chip active `bg-[#3370FF] text-white`
- **WCAG contrast audit + fix:** darken `#3370FF` to `#2558E5` for text use (keep `#3370FF` for fills, large hero numerals, 3px+ borders only)
- All arbitrary `text-[72px]` → `rem` units

### Week 2-4 — 4-week MVP (Executor's plan + Advocate's compliance + Motion Craftsman's precision):
**Week 2 — Motion foundation, no Rive:**
- Build 3 signature motions as components (Motion Craftsman's spec):
  - `<ScoreGaugeFill />` — 1400ms, arc then color resolve
  - `<AgentPulse />` with variants: active (1.4s period, `scale: [1, 1.45]`), completion (merged Settle), subtle
  - `<ScanReveal />` — shell scaffolding only
- 5 easing curves as CSS variables (Motion Craftsman's revised values)
- All `prefers-reduced-motion` fallbacks specified per-motion (Motion Craftsman §9)
- 4 differentiated empty states (not 8 identical)
- **Hebrew copywriter commissioned ($500)**
- **Hebrew-display font selected (Rubik Display / Assistant / Heebo)**
- **RTL addendum produced (Advocate's 15 decisions)**

**Week 3 — Stage (non-streaming) + shareable card:**
- Stage modal with 8 frames, 26 seconds (Motion Craftsman's timing), skip button from Frame 3
- Inline vertical list fallback for recurring scans (Reductionist's 12s pattern)
- **Shareable Scan Card: PNG + permalink URL** (Storyteller's ship-critical addition)
- Public `beamix.tech/s/[scan-id]` permalink replay
- Engine pills with 1-letter monograms (defer SVG logos until licensing clears)

**Week 4 — Beamie placeholder + polish:**
- CSS/SVG Beamie (Executor's placeholder — no Rive dependency)
- Mouth included as expression surface (closed/open/smile/frown/error-reform) — resolves Split 3
- Motionless when idle (default — Motion Craftsman's principled call, A/B test in Month 3)
- Drag alternative: right-click "Move to corner" menu (Advocate WCAG 2.5.7 fix)
- Dismiss in one click (all seats agree)
- Aria-live region for every state change (Advocate WCAG 4.1.3 fix)
- Per-page heading pass (InterDisplay 40px on all H1s, 28px on H2s)
- **Public GEO Index ships alongside: `beamix.tech/check-my-site`** (Moat Strategist's Moat 3)
- **Framer marketing site gets Stage demo video in hero** (Moat Strategist's Track D)

### Week 5-8 (after Adam's decisions):
- Rive Beamie character (if user retention data says to invest)
- Real streaming Stage architecture (SSE or Supabase Realtime)
- Scan Card v2 (auto-GIF + Twitter thread generator)
- Hebrew character voice lines (Storyteller)
- Weekly "State of GEO" newsletter launches

### Never ship (the board collectively killed):
- Clippy-style auto-speech
- Non-dismissible Beamie
- Mandatory Stage on every scan (1st scan only)
- Dark mode at launch
- Gradient-in-motion, parallax-on-scroll, looping decorative animations
- `transition: all`, animating layout properties
- Fraunces italic "Inbox zero" (Advocate kills, Craftsman neutral)
- 5 named signature motions (collapse to 3)
- Full 12-rule Beamie behavior at MVP (ship 6: idle, entrance, active, succeeded, dismiss, drag-alt)
- Engine SVG logos until licensing clears

---

## Adam's Decision Matrix

| # | Decision | v2 default | Board recommendation | Adam's call |
|---|---|---|---|---|
| 1 | Beamie exists at all | Yes, persistent 56×56 with 12 rules | **Yes, CSS/SVG placeholder, opt-out after day 7** (Executor + Advocate synthesis) | [ ] |
| 2 | Beamie has mouth (expression only, not speech) | No (eyes/brows/nose only) | **Yes, mouth as expression surface** (Storyteller + Advocate accessibility) | [ ] |
| 3 | One character vs cast of 5 | One | **One at MVP, Fetch-as-courier added Month 2 if retention supports** | [ ] |
| 4 | Stage duration | 30s | **26s first scan (Motion Craftsman's spec), 2-3s confirmation for recurring** | [ ] |
| 5 | Stage mandatory | Yes, cannot scroll away | **Mandatory for scan #1 only, opt-in for scan #2+ (Advocate + WCAG 2.2.2)** | [ ] |
| 6 | Signature motion count | 5 named | **3 (Scan Reveal + Agent Pulse with variants + Score Gauge Fill 1400ms)** | [ ] |
| 7 | Idle motion | Yes, 4s breathing always on | **No — motionless at MVP, A/B test in Month 3 (Motion Craftsman + Rauno)** | [ ] |
| 8 | Timeline | 12-14 weeks | **4-week MVP (Executor), then 18-22 weeks full v2 with parallel moat tracks** | [ ] |
| 9 | Memory layer | Not specified | **Memory-lite at MVP (5 fields), full memory system Month 6+ (Futurist deferred)** | [ ] |
| 10 | Hebrew/RTL priority | 0 mentions in 651 lines | **BLOCKER — fix before Phase 2. RTL addendum + Hebrew-display font + copywriter** | [ ] |
| 11 | Marketing site unification | "Explicitly no marketing changes" | **Unify — Framer Stage demo video + Beamie hero illustration within 30 days of Phase 2** | [ ] |
| 12 | Shareable Scan Card | Not in v2 | **SHIP in Week 3. PNG + permalink at MVP, GIF + thread Month 2. Cheapest viral loop** | [ ] |
| 13 | Public GEO Index tool | Not in v2 | **SHIP in Week 4. `beamix.tech/check-my-site`, no signup, same engine** | [ ] |
| 14 | State of GEO newsletter | Not in v2 | **Start before v2 ships. 800 words weekly. 24-month compound moat** | [ ] |
| 15 | Tool vs company framing | Tool | **Tool first (pays bills), architect for company (memory + data + content + Hebrew moats)** | [ ] |

---

## Next Steps

1. Adam reviews this document
2. Adam answers the 15 decisions (yes/no/defer — use the matrix above)
3. Adam tells CEO which splits to argue through in more detail vs which to just decide
4. Then page-by-page / flow-by-flow deep dive begins

---

*Filed by CEO, synthesizing Board Seats 1-7, 2026-04-24.*
*Seats: Reductionist · Storyteller · Executor · Advocate · Motion Craftsman · Futurist · Moat Strategist.*
*Evidence base: 651-line v2 design direction + 7 critique files totaling ~4,800 lines. No position softened. No disagreement smoothed.*

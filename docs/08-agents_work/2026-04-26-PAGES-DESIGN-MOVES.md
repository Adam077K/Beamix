# Beamix Per-Page Design Moves — Integrated
Date: 2026-04-26
Status: PROPOSAL — Adam reviews page-by-page, accepts or overrides.
Tension: Designer 1 (distinctive) vs Designer 2 (discipline). Final move per page integrates both.

---

## EXECUTIVE READ

Both designers were right on different pages. The trap is treating their positions as symmetric. They aren't. Designer 1 is right about the *surfaces that users convert on, remember, and share* — these earn their distinctive moves because the payoff is real. Designer 2 is right about the *surfaces that users operate daily under time pressure* — these earn their quality through disciplined craft, not novelty. The integrated approach: **Beamix earns its billion-dollar quality through one well-placed distinctive move per page, sometimes bold (Designer 1 wins), sometimes restraint-as-the-move (Designer 2 wins), and sometimes a calibrated blend that takes the most viable piece of each position.** The critical discipline: /home's signature language (hand-drawn metrics, Fraunces diagnosis line, score count-up, sparkline path-draw) cannot repeat on other pages. Every other page must earn its distinctiveness *differently* — or not at all, which is also correct.

---

## THE 10 INTEGRATED MOVES (compact table)

| # | Page | Designer 1 proposed | Designer 2 proposed | Final Integrated Move |
|---|---|---|---|---|
| 1 | `/inbox` | Reasoning Receipt — typed rationale card in agent first-person | Linear 3-pane verbatim, no receipt, clinical diff only | **Reasoning Receipt ships, scoped:** receipt IS the right pane content, typing-in on first selection per session only, 40% right pane width. 3-pane chrome borrows Linear verbatim. The Receipt is the single distinctive move; everything else is discipline. |
| 2 | `/workspace` | Courier flow dissolves the card — no bounded panel, page IS the journey | Single-purpose viewer, instant render, no completion ceremony | **Dissolve the card, hold the ceremony:** Designer 1 wins the card-dissolve. Designer 2 wins the completion moment — no confetti, no stamp flourish. The courier line draws on the page canvas itself. Completion is one quiet status line. |
| 3 | `/scans` | Receipt-tape ribbon — continuous paper-tape, serrated perforations, ledger monospace | Stripe-style table, no hero, table grammar repeated across all tabs | **Tape on the All Scans tab, table on Per-Engine/Completed:** the tape is the distinctive move on the primary tab where history is browsed. The other two tabs are table grammar. This gives Designer 1 the acquisition surface and Designer 2 the operational surface. |
| 4 | `/competitors` | Rivalry Strip — horizontal racing-stripe rows, dual sparklines, shaded gap | Clinical horizontal bar chart, no radar, no per-competitor color | **Rivalry Strip ships:** Designer 1 wins outright. The strip IS a chart; it IS disciplined; it IS borrowed grammar (Mercury filter-responds-to-view). It is not decoration — it's a richer visualization for trajectory-not-snapshot data. The verdict pill + Reasoning Receipt cross-page mechanic ships with it. |
| 5 | `/crew` | Card backs — Y-axis flip reveals hand-written field-notes in agent first-person | 11 plain rows, no mascots, single brand blue, first-visit skeleton-draw only | **Grid with first-visit skeleton-draw + card backs, no mascots:** the first-visit skeleton-draw (locked) is the meet-the-team moment. Card backs ship but with critical constraints: flip-on-click (not hover), no per-agent mascot, no per-agent color. Designer 2 wins the mascot argument; Designer 1 wins the card-back personality. |
| 6 | `/schedules` | Sentence Builder — English sentences with tap-to-edit chips, no form | Stripe webhooks table, borrows verbatim, no sentence parser | **Sentence Builder ships with table fallback:** Designer 1 wins the concept because the Sentence Builder is the cross-page chip mechanic that pays off in /crew, /settings, and /reports. Scaling concern (>12 schedules) solved by a compact "Table view" toggle. Primary view is the sentence; table view is there for power users. |
| 7 | `/settings` | The Letter — Profile tab as typed prose letter, form fields as inline chips | Stripe settings replica — stacked label-input rows, no decoration | **Letter on Profile tab only, rest stays clinical:** Designer 1 wins Profile tab (this is the one self-presentation tab; the letter register is correct here). Designer 2 wins the other 4 tabs (Billing = tabular rows, Language = dropdown, Domains = receipt-tape list for Yossi, Notifications = single-column toggles with brief labels). |
| 8 | `/scan` (public) | Self-correcting handwriting — strikethrough-and-rewrite on detected name correction | Locked 4-motion-type budget, no 5th motion, no personality reveal | **Strikethrough-and-rewrite ships as Frame 3 mechanic:** Designer 1 wins. The mechanic reuses existing vocabulary (Rough.js + Excalifont already in the storyboard). It costs one scribble animation and earns the referral-share moment. Designer 2 wins the overall budget argument — no 5th motion type added; the correction IS Frame 3, not a new frame. |
| 9 | `/onboarding` | Wrap-Around horizon — sticky horizon line at top, stations as navigation, path-draw on advance | 4 fast screens, instant transitions, one spring on chosen-agent in step 3 | **Horizon ships as progress visualization, not as navigation:** the horizon line draws path between steps (Designer 1 concept), but clicking previous station markers to navigate back is cut (non-discoverable, Designer 2 correct). Standard back button stays. The visual is the distinctive move; the navigation is boring-and-correct. |
| 10 | `/reports` | Cover Page Press — Stripe-Press cover, flip animation, "Press" button label | Clinical generator form + history table, workmanlike tool | **Cover ships, flip animates, "Press" label ships. Generator form stays workmanlike:** Designer 1 wins the artifact (the PDF cover page IS the Scale-tier brand promise). Designer 2 wins the generator interface (left pane is a calm form; no editorial framing on the tool side). The flip animation stays — same motion grammar as /crew card flip (cross-page coherence). |

---

## PER-PAGE INTEGRATED SPEC

---

### /inbox

**Page job:** Action surface — Yossi and Sarah review and approve agent-generated changes.
**Frequency:** Yossi 2-3x/day (10-15 min sessions). Sarah weekly (60-90s).

**The fight:**
- Designer 1 wants: the Reasoning Receipt — every selected item in the right pane renders as an off-white index card with the agent's first-person rationale typed-in at ~30 chars/sec. The preview pane widens to 40% of viewport. The Receipt is the trust-building artifact no competitor ships. `Shift+A` saves the receipt as a "saved learning" in a sidecar.
- Designer 2 wants: Linear 3-pane verbatim — filter left, list center, diff right. Multi-select, J/K nav, instant approve. The 1.5s typing animation at 47 items-per-session is throughput tax. No new triage pattern. The Receipt is luxury Yossi can't afford at 60 items/day.

**Final integrated move:**
The Reasoning Receipt ships. Designer 2's throughput concern is absorbed into a frequency-aware rule: typing-in only on the *first selection per session*; every subsequent selection renders the Receipt instantly (100ms fade). This means Yossi's 47th item of the day has zero animation cost. But his first selection — the one that sets the trust frame for the session — types in and reminds him what the agent was thinking. The Receipt is the page's *only* distinctive move; the 3-pane chrome is Linear borrowed verbatim.

**Specific treatment:**
- Chrome: Linear 3-pane. Filter rail 240px left. Item list 440px center. Preview pane 40% viewport right. Tabs: Pending / Drafts / Live.
- Receipt surface: #F5F3EE cream, 1px Rough.js outline roughness 0.6, 16px padding. Body text Excalifont 13px. Below the Receipt: collapsed technical diff (click to expand). Hebrew receipts: Heebo 13px, same card register.
- Score chip (top-right of preview pane): 12px caps weight 500 muted, passive reference. NOT a sticker, NOT tilted. Designer 1's 3-degree sticker is decoration; Designer 2's "forget it's there" is the correct register. One quiet line, muted #6B7280.
- `Shift+A` saved-learning sidecar: ships as a deferred feature. v1 has only `A` approve. The Receipt itself is the v1 investment; the sidecar compound is Phase 2.
- Hand-drawn surface: Receipt card outline only. 3-pane chrome stays geometric-crisp.
- Typing animation: 30 chars/sec, first selection per session only. Reset on page navigation. `prefers-reduced-motion: reduce` → instant render always.
- Empty state (zero Pending): locked hand-drawn illustration slot 2 (desk-drawer sketch, 96×96px, static). Only appears on absolute zero-pending. Not on filtered-to-zero.

**Adam-decision points:**
1. Receipt width (40% right pane vs Linear's ~360px): Designer 1 says 40% makes the agent's reasoning the protagonist. Designer 2 says 40% compresses the list too much at 1280px. Synthesis: 40% at 1440px+, 360px fixed below. **Adam: does 40% right pane feel generous or crowded?**
2. `Shift+A` sidecar: Designer 1 sees this as the product's long-term compound value (accumulated learning). Designer 2 says ship v1 without it. Synthesis: defer to Phase 2. **Adam: agree to defer?**
3. Receipt in Hebrew — Heebo body vs Excalifont (no Hebrew glyphs): locked to Heebo. Designer 1 accepts. **Adam: confirm Heebo at 13px for HE receipts.**
4. Tabs (Pending / Drafts / Live): Designer 2 says ship Pending only, defer Drafts and Live. Designer 1 ships all 3. Synthesis recommendation: ship Pending at launch, tab structure visible but Drafts/Live show "coming soon" chip. **Adam: confirm tabbed structure at launch?**
5. Verdict pill on selected item row: no pill in the list; Agent name + timestamp is the only row metadata. Pill-style moves to filter chips only. **Adam: agree?**

**State behavior:**
- Empty (zero pending): hand-drawn illustration + "Nothing to review." + link to /home.
- Loading (initial fetch): instant render (no skeleton) — if data takes >200ms, show spinner inside the list area only, not page-wide.
- Error: toast "Couldn't load your inbox. Refresh?" — no full-page error state.

**Microcopy register:**
- Voice: agent first-person inside Receipt; terse clinical everywhere else.
- EN examples: "Pending · 3" / "Nothing here." / "I added 4 FAQ entries phrased the way Perplexity asks the question, not the way you'd write them on the website."
- HE examples: "ממתין לאישור · 3" / "אין כלום כאן." / "הוספתי 4 ערכי FAQ בניסוח שמשקף את האופן שבו Perplexity שואלת את השאלות."

**Connections:**
- IN: /home Section 3 (Inbox pointer line), topbar notifications, keyboard shortcut.
- OUT: approval → item moves to Live; /workspace (via "View run" from Draft).

---

### /workspace

**Page job:** Real-time agent execution viewer — watch the agent work while it runs.
**Frequency:** Transient (only when an agent is mid-run). Yossi visits during active sessions. Sarah rarely.

**The fight:**
- Designer 1 wants: dissolve the card surface entirely. The courier line starts at the top of the content area, runs down the full vertical axis — no surrounding panel. The page IS the journey. Steps are stations on the line. Output streams to the right of each completed station. A completion stamp sketches itself (Rough.js, 600ms, 3 strokes, circular monogram with agent name + timestamp) at the end of the run.
- Designer 2 wants: single-purpose viewer, calm on completion. The courier flow IS the animation. No confetti, no stamp, no mascot, no persona avatar. When done: one quiet status line "Done. 2m 14s. View output →". Dissolving the card is a usability risk (users expect bounded UI) and the auto-scroll causes vertigo on long runs.

**Final integrated move:**
Dissolve the card. Designer 1 wins this. The user is watching the product's core value delivery in real time — containing that in a panel would be like watching a film through a window. The page IS the journey. The completion stamp, however, is cut. Designer 2 wins that argument. One quiet line "Done in 47s. 6 steps." with a "View output →" link. The stamp is beautiful in a screenshot; it's a 600ms tax on Yossi every time he watches a run complete. The auto-scroll concern is mitigated by the block:center behavior and step-only firing.

**Specific treatment:**
- Layout: courier line anchors at ~28% from left edge LTR (mirrors to right edge in RTL). Step circles Rough.js 32px, roughness 1.2, fixed seed per agent-run. Connecting line is perfect-freehand (thinning 0.5, 3-7% jitter). Color: past steps #6B7280 muted, active step #3370FF, future steps #6B7280 at 30% dashed.
- Active step breathing: 1400ms CSS keyframe modulating stroke-opacity 0.5 ↔ 1.0. Same cycle as /onboarding station breathing — cross-page coherence.
- Output text: streams to the right of completed stations in Inter Regular 14px on #FFFFFF. Output is crisp; journey is hand-drawn. Discipline rule.
- No top-bar status pill. The topbar asterisk handles global state. /workspace doesn't repeat it.
- Auto-scroll: `scrollIntoView({ behavior: 'smooth', block: 'center' })` fires on step-transition only. `prefers-reduced-motion: reduce` → instant snap.
- Completion: step row collapses to "Done. 47s." One line. No stamp. No ceremony. Topbar asterisk returns to idle.
- Micro-text rotation under active step: "Asking…" → "Waiting for ChatGPT…" → "Reading the answer…" → "Got it." ~1.5s cycle. This copy IS the animation companion; no additional visual element needed.
- Hand-drawn surface: entire courier flow (step circles, line, checkmarks). Output text stays Inter crisp.
- Idle state: "No agent running. Start one from /home or /inbox." — single text line, links both nouns. No illustration, no chrome.

**Adam-decision points:**
1. Dissolution vs bounded panel: this is the page's biggest call. The dissolution is the move that makes /workspace unlike any competitor. If Adam wants the Linear-panel feel for legibility confidence, the courier flow can be contained inside a max-width 760px column with subtle left-border — which approximates dissolution while adding a frame. Synthesis recommendation: try dissolution first. **Adam: card-dissolved vs column-with-left-border?**
2. Completion ceremony: stamp (Designer 1) vs quiet line (Designer 2). Synthesis: quiet line + auto-collapse to summary card after 10 seconds. **Adam: confirm quiet completion?**
3. Persistent output: once the run completes, should the full step-by-step remain visible (scroll up to review) or collapse to a summary? Synthesis: remains visible, scroll-to-review. Collapse is a deferred option behind a toggle. **Adam: agree?**
4. Page title/breadcrumb: none (Designer 1, page-is-the-journey) vs "Agent Run #4729" (minimal breadcrumb). Synthesis: no breadcrumb during the run; "Run by [Agent Name]" appears in the topbar tab title only. **Adam: agree with no in-page breadcrumb?**
5. RTL courier line mirror: line anchors from right ~28%, path-draw right-to-left. Confirm as design intent. **Adam: yes?**

**State behavior:**
- Idle (no agent running): single calm sentence with links. No illustration.
- Active run: courier flow drawing. Topbar asterisk breathing.
- Completed run: quiet status line. Summary persists above fold. Topbar asterisk idle.
- Error mid-run: active step circle turns #EF4444 (critical red). Error message appears at that station. Run stops. "Retry this step →" chip below error output.

**Microcopy register:**
- Voice: gerund-continuous, present-tense, warm-clinical.
- EN: "Reading your homepage…" / "Asking Perplexity 4 sample questions…" / "Done in 47s. 6 steps."
- HE: "קורא את דף הבית שלך…" / "שואל את Perplexity 4 שאלות…" / "הסתיים תוך 47 שניות. 6 שלבים."

**Connections:**
- IN: /home "Run all" CTA, /inbox Draft tab "View run", /crew agent card "Run now" action.
- OUT: /inbox (review the output), /scans (scan result after completion).

---

### /scans

**Page job:** Status surface — scan history browser and per-scan deep-dive for Yossi's daily review.
**Frequency:** Yossi daily. Sarah rarely.

**The fight:**
- Designer 1 wants: receipt-tape ribbon on the All Scans tab — continuous vertical paper-tape, serrated Rough.js perforations between segments, ledger-monospace Geist Mono serial numbers (SCN-2026-04-26-0017), ledger-ink timestamps, inline expand on segment click. Tape unfurls on first paint (800ms, sessionStorage flag). Export is visual-format-native: the tape is the deliverable.
- Designer 2 wants: full Stripe-table across all three tabs. 44px rows, tabular numerals, hover lightens background, click-to-detail. No hero at the top. The tape is center-narrow and wastes screen real estate. Yossi's daily scan of 20 domains is better served by table density.

**Final integrated move:**
Receipt-tape on the All Scans tab only. Table grammar on the Per-Engine and Completed Items tabs. Designer 1's insight is that the primary tab — where Yossi browses history and scans for anomalies — benefits from the artifact register because this is where he forms the "client story" in his head. The tape format makes each scan feel like a bookkeeperly record, not a database row. Tabs Per-Engine and Completed Items are operational (Yossi is filtering, sorting, comparing) — table grammar is correct there, and using the same grammar as Linear/Stripe feels professional and fast.

**Specific treatment:**
- All Scans tab: tape ribbon max-width 560px, centered. Canvas background #F5F3EE. Each segment shows: serial number (Geist Mono 11px muted, top-left), score in Inter tabular 28px (prominent), per-engine pills inline at 12px, single-line diagnosis below (Inter 14px muted). Rough.js zigzag perforation between segments roughness 0.8, ~1px stroke #6B7280, fixed seed per scan.
- Unfurl animation: first page load (sessionStorage flag), `clip-path: inset(0 0 100% 0)` → `inset(0 0 0% 0)` over 800ms ease-out. NOT a page-skeleton-draw — this is content-level motion at data level, same exception as /home sparklines. Subsequent visits: instant render.
- Inline expand: segment click → height 0 → auto at 200ms ease-out. Other segments dim to 30% opacity (dimming over 200ms). Full per-engine breakdown renders in expanded segment. Click again to collapse.
- Serial numbers: click copies permalink. Right-click copies permalink. Format: `SCN-YYYY-MM-DD-NNNN` zero-padded.
- "Completed Items" tab (DONE stamp): inkstamp "DONE" in #2558E5 at 50% opacity, tilted 8 degrees, Rough.js block letters, ~24×16px, top-right of completed segment. Table grammar for the list itself (44px rows per Designer 2).
- "Per-Engine" tab: pure table. Engine name + current score + delta + mention count + click-to-filter. No tape. No cream canvas. Standard #FFFFFF background.
- Designer 2's serial-number concern ("SCN format is databasey"): overruled. The bookkeeperly format is intentional. It signals "we keep records like an accountant" — trust signal.
- Hand-drawn surface: perforation zigzag and DONE stamp only. Text stays crisp.
- First-ever visit empty state: locked hand-drawn illustration slot 3 (stack-of-pages sketch, static, 96×96px) + "Run your first scan →" CTA.

**Adam-decision points:**
1. Tape width (560px centered vs full-width table): this is the layout's most debated call. 560px centered leaves ~40% canvas on each side at 1440px. Designer 1 says the whitespace is the "expensive" register. Designer 2 says Yossi wants density. Synthesis recommendation: 560px with a density toggle (compact ↔ spacious) that Yossi can set and persist. **Adam: is the white canvas right, or does Yossi need it wider?**
2. Unfurl animation on all visits vs first-only: current spec uses sessionStorage (per-session first-load). Yossi visits 3x/day; the unfurl fires each visit (session resets). This may be too frequent. Recommendation: sessionStorage is fine for now — the 800ms unfurl is fast enough that daily repetition isn't punishing. **Adam: agree, or should unfurl be once-per-day only?**
3. Inline expand vs navigate-to-detail: Designer 1 specced inline expand. Designer 2 specced click-to-navigate (Linear pattern). Synthesis: inline expand on tape tab (segment IS the deliverable), navigate-to-detail on table tabs (rows are list items, not artifacts). **Adam: agree with this split?**
4. "Completed Items" tab format: tape with DONE stamp vs clean table. Synthesis above chose table. If Adam wants tape throughout, we can do tape with stamp on Completed Items too. **Adam: tape everywhere or table for Completed?**
5. PDF export: the tape as the PDF format is Designer 1's claim that "the page's UI is the deliverable." /reports (Scale tier) handles formal PDFs. For Discover/Build users without /reports, should /scans have a basic "Export scan as PDF" that renders the tape? **Adam: ship basic export from /scans for non-Scale, or keep export Scale-only via /reports?**

**State behavior:**
- First ever (no scans): locked illustration + "Run your first scan" CTA (Score Gauge Fill runs on the counter-up when scan completes — this is the same vocabulary).
- Loading: no skeleton. If data takes >200ms, page renders tabs + filter row + a 2-line placeholder in Inter muted ("Fetching scans…"). Not shimmer.
- Error: "Couldn't load your scans. Try refreshing." — inline in tape area, no full-page error.

**Microcopy register:**
- Voice: ledger-clinical. No exclamation. No "uh oh."
- EN: "Scan complete. 73 → 78. ChatGPT now cites you on 4 queries." / "No change in score. Net zero." / "247 scans"
- HE: "הסריקה הסתיימה. 73 ← 78. ChatGPT מצטט אותך כעת ב-4 שאילתות."

**Connections:**
- IN: /home Section 7 (recent activity), topbar, /workspace post-completion.
- OUT: per-scan detail (inline expand or navigate), /reports (PDF export).

---

### /competitors

**Page job:** Intelligence surface — competitor parity tracker for Yossi's daily competitive monitoring.
**Frequency:** Yossi daily. Sarah monthly.

**The fight:**
- Designer 1 wants: the Rivalry Strip — full-width horizontal rows (~96px), dual parallel sparklines (yours vs theirs) with a semantically-colored shaded gap. Path-draw race on load (yours at 0ms, theirs at 80ms stagger). Engine-tab switch reprojects all strips simultaneously. Verdict pill at right edge: "You lead by 12 ↑" or "Behind by 4 ↓" → click opens Reasoning Receipt panel. Competitor names in InterDisplay-Medium 18px.
- Designer 2 wants: clinical horizontal bar charts, bar-per-competitor, labeled rows, date-range filter. No racing animation. No verdict-pill-to-receipt mechanic. No bar-fill animation (too frequent for Yossi's daily view). The Rival Strip "doesn't scale to 20 competitors" and "side-by-side sparklines are hard to read precisely."

**Final integrated move:**
Designer 1 wins outright. The argument is not close. A bar chart answers "what is the current state?" — a commodity question that Otterly, Profound, and every other tool answers with a bar chart. The Rivalry Strip answers "what is the trajectory?" — which IS the story Yossi tells his clients ("we've been gaining on this competitor for 8 weeks"). The trajectory visualization is the differentiation. Designer 2's scalability concern (20 competitors) is solved with a strip-height compressor at >7 competitors: strips go from 96px to 64px. The "hard to read precisely" concern misses that Yossi isn't reading precise values off a sparkline — he's reading *direction*, and direction is exactly what dual sparklines communicate. The verdict pill + Reasoning Receipt is the cross-page coherence move that ties /competitors to /inbox. Ship it.

**Specific treatment:**
- Layout: stacked full-width strips, one per competitor. 96px tall at ≤7 competitors, 64px at 8-20. Left edge: competitor name (InterDisplay-Medium 18px, 14×14 favicon to left), right edge: verdict pill. Center: dual sparklines with shaded gap.
- Sparkline paths: perfect-freehand stroke, thinning 0.3, 2% jitter. Your path color #3370FF. Competitor path color #0A0A0A at 40% opacity. Gap shading: semantic green #10B981 at 12% opacity when you lead, semantic red #EF4444 at 12% when behind.
- Path-draw race animation: first load AND engine-tab switch. Your path starts at 0ms, theirs at 80ms. Both draw left-to-right 1200ms ease-out. Gap shading fills as lines diverge. RTL: both draw right-to-left. Subsequent visits without engine-tab change: instant render. This is a data-level animation, not page-skeleton — same exception as /home sparklines and /scans tape unfurl.
- Engine tabs: above the strip stack, full page width. "All / ChatGPT / Gemini / Perplexity / Claude / etc." Tab-switch reprints ALL strips simultaneously (old paths fade 200ms, new paths draw 1000ms). Mercury's chart-responds-to-filter pattern.
- Verdict pill: 12px caps weight 500, semantic background at 8% opacity. Clicks → Reasoning Receipt slides in from right edge as a 320px panel (NOT popover). Same Receipt component as /inbox. Exact same typography, same cream surface, same agent first-person voice.
- No hand-drawn elements. This page is clinical-competitive. Anthropic Console discipline: data tables stay crisp.
- Empty state (no competitors): single calm sentence "Add a competitor to start tracking. Try `chatgpt.com` or your top organic search rival." No illustration (this is /competitors empty state — the locked hand-drawn slot 5 is for this page's empty state per ANIMATION-STRATEGY-LOCKED). Wait — contradiction: the locked animation strategy spec shows slot 5 is /competitors empty as a "two-figure side-by-side line-art." Designer 2's doc proposed cutting the illustration here. **Resolution: keep the locked illustration slot 5 for /competitors empty** — Adam locked it, Designer 2 doesn't overrule Adam's lock. The example URL line ships alongside it as additional warmth.

**Adam-decision points:**
1. Strip height at 20 competitors (Scale tier): 64px strips means 20 strips = 1280px of content before fold. This is a very long scroll. Recommendation: show top 5 by default with "Show all 20" expander. **Adam: agree to default-top-5 or show-all?**
2. Competitor names in InterDisplay-Medium 18px (Designer 1) vs 14px label treatment (Designer 2): synthesis sides with Designer 1 — competitors are characters, not labels. 18px signals "this matters." **Adam: 18px names or 14px?**
3. Path-draw on every engine-tab switch: this fires 5-7 times per Yossi session (he checks each engine). Each reproject is 1200ms. Is 1200ms per switch too slow for daily power use? Recommendation: 800ms on engine-tab switch (faster than first-load 1200ms). **Adam: approve 1200ms first-load, 800ms on tab-switch?**
4. Reasoning Receipt panel width (320px slide-in from right): with the strips at full viewport width, a 320px panel covers the verdict pills of the last strip. This may feel cramped at 1280px. Option: Receipt opens in a modal instead. Synthesis: 360px panel at 1440px+, modal below 1440px. **Adam: slide-in panel or modal for Receipt?**
5. Competitor logos: 14×14px monochrome favicons from Clearbit, single-letter monogram chip when unavailable. Confirm no colored logo treatment. **Adam: confirm monochrome?**

**State behavior:**
- Empty (no competitors added): locked illustration slot 5 + "Add a competitor →" CTA + example URL warm line.
- Loading (engine-tab switch): instant path-fade then path-draw. No interim skeleton.
- Error (competitor data unavailable): "Couldn't fetch competitor data." inline in the strip area, faded strip background, retry link.

**Microcopy register:**
- Voice: sportscaster-clinical on verdict pills, agent first-person in Reasoning Receipt.
- EN: "You lead by 12 ↑" / "Behind by 4 ↓" / "Tied" / "They publish weekly Q&A posts. Perplexity prefers fresh content on time-sensitive queries; that's the gap."
- HE: "+12 לטובתך ↑" / "-4 לרעתך ↓" / "שוויון" / "הם מפרסמים פוסטי Q&A שבועיים. Perplexity מעדיפה תוכן עדכני."

**Connections:**
- IN: /home KPI card (competitor delta), /home Section 7 (activity feed competitor event).
- OUT: Reasoning Receipt → /inbox (if agent recommendation follows), competitor detail (future: /competitors/[id]).

---

### /crew

**Page job:** Roster surface — 11-agent roster + per-agent settings access.
**Frequency:** Yossi weekly. Sarah 1-2x/month (curiosity).

**The fight:**
- Designer 1 wants: 3-column card grid. Each card flips on click (Y-axis 600ms rotation) to reveal a hand-written field-notes back in Excalifont on cream paper — agent philosophy, quirks, first-person voice. Front: custom hand-drawn monogram icon (quill, magnifier, wrench — NOT Lucide). Card front stays crisp. On hover: monogram redraws its strokes (Rough.js 400ms). "Suggest a new agent" dashed-outline placeholder card at grid bottom-right.
- Designer 2 wants: 11 plain rows, no mascots, no per-agent colors, no card flips (2010 skeuomorphism). First-visit skeleton-draw (locked) is the ONLY meet-the-team moment. After that: instant render, plain list. The row format is Linear team list, calm, professional.

**Final integrated move:**
Card grid with card backs, but Designer 2 wins the mascot argument completely and the scale of the hand-drawn idiom is constrained. Card backs ship because they solve a real problem: "what does this agent actually do and how does it think?" is a trust-building question that a card back answers better than any settings page. The card flip is a discovery mechanic for Sarah's curiosity visits and Yossi's onboarding period. But: no per-agent mascot, no per-agent color, the monogram icons are from a restrained custom set (not cartoon characters), and hover-monogram-redraw is cut (too frequent, animation budget violation).

**Specific treatment:**
- Layout: 3-column grid at 1280px, 4-column at 1600px+. 32px horizontal gap, 40px vertical. 11 cards means bottom-right has the "Suggest agent" placeholder card. Asymmetry preserved (no forced centering).
- Card front: agent monogram 48×48px (custom SVG marks, restrained — Rough.js outlines, NOT Lucide, NOT mascots: think geometric abstracted shapes, not illustrated characters). Agent name InterDisplay-Medium 18px. Role description Inter 14px muted. Last run timestamp tabular 12px muted. Status chip: single-word ("Idle" / "Running" / "Paused") #3370FF background at 10% opacity, text at 100%.
- Single brand blue #3370FF on ALL status chips. No per-agent color. Designer 2 wins this completely.
- Card back: Excalifont 14px on #F5F3EE cream, generous line-height 1.7. ~80 words agent philosophy + quirks. Small "Adjust how I work →" link bottom-right. Hebrew agents: Heebo 14px, same cream surface.
- Card flip: Y-axis rotateY(180deg), 600ms cubic-bezier(0.4, 0, 0.2, 1). Shadow rises at 90deg, returns at 180deg. Click to flip front → back. Click again to return. Multiple cards can be flipped simultaneously. This IS the page's distinctive move.
- First-visit skeleton-draw (locked): Rough.js outline of 11 monograms draws in, 80ms stagger, ~1200ms total. Content fades in per card 200ms staggered. localStorage flag `beamix.crew.firstVisitShown=true`. After first visit: instant render.
- Hover-monogram-redraw: CUT. This fires once per card per session and is an unnecessary animation tax on a weekly-use page. Hover state = card background lightens (bg #F7F7F7 → #FFFFFF transition 150ms) + subtle box-shadow appears. That's it.
- "Suggest a new agent" card: Rough.js dashed outline, roughness 1.5, #6B7280, "+" in center. Interaction: click → lightweight modal "What problem would you like an agent to solve?" — plain text input, submit sends feedback.
- Empty state (new account, no agents activated yet): locked illustration slot 4 (three-figure silhouette line-art, static 96×96px).

**Adam-decision points:**
1. Card flip vs click-to-expand-panel: the flip is Designer 1's bet that the ritual gesture earns the trust-building moment. Designer 2 says it's 2010 skeuomorphism. The question for Adam: does the flip feel *premium ritual* or *dated jQuery*? The answer depends partly on execution — a cubic-bezier(0.4, 0, 0.2, 1) at 600ms with proper shadow physics feels modern. A linear 500ms feels old. **Adam: card flip or click-to-expand panel?**
2. Custom monogram icons vs Lucide: Designer 1 specced custom Rough.js SVG marks. This requires ~11 custom assets (or one illustrator commission). Lucide icons inside a styled container are the faster path. Synthesis recommendation: use Lucide for launch, commission custom marks in Phase 2 once the budget and visual language are settled. **Adam: Lucide at launch or custom marks from day one?**
3. Per-agent personality voices (11 distinct voices): this is ~900 words of brand writing. Do we commit to writing all 11 card backs at launch, or ship with 3-4 completed and the rest as "Coming soon" flips? Synthesis: ship all 11, even if some card backs are shorter (~30-40 words for the less-personality-heavy agents). **Adam: all 11 at launch or 3-4 complete?**
4. "Adjust how I work" letter (chip-in-prose config): the per-agent settings page is locked to the letter/chip mechanic (cross-page coherence). This requires the letter mechanic to be built before /crew ships. If /schedules and /settings ship the chip mechanic first, /crew inherits it. **Adam: confirm this dependency?**
5. Mobile layout: 1-column on mobile (per Designer 1), 2-column at 768px. Card flip on mobile = tap front → back. Back has a "Close" tappable area. **Adam: agree?**

**State behavior:**
- Empty (new account): locked illustration slot 4 + "Your crew is warming up. We'll let you know when they're ready to run."
- Loading: instant render (no skeleton after first visit). On first visit: locked skeleton-draw.
- Running agent: status chip says "Running" in that card. Topbar asterisk breathes. No per-card animation.

**Microcopy register:**
- Voice: agent first-person on card back, clinical minimal on card front.
- EN: "Crew · 11" / "Running" / "Schema Doctor: JSON-LD only. No microdata. I won't add Organization schema unless your homepage has the data to back it up; I refuse to lie to Google."
- HE: "צוות · 11" / "פועל" / card backs transcreated (Heebo, same first-person register).

**Connections:**
- IN: /home "crew" link in activity feed, mobile bottom nav.
- OUT: per-agent settings page (from card back "Adjust how I work →"), /workspace (from "Run now" action).

---

### /schedules

**Page job:** Admin surface — recurring scan configs and auto-fix trigger configs.
**Frequency:** Yossi weekly. Sarah NEVER.

**The fight:**
- Designer 1 wants: the Sentence Builder — each schedule rendered as one English/Hebrew sentence with tap-to-edit chips. "Run [the FAQ Agent] every [Monday] at [9am] unless [I'm on vacation], and notify me [by email] when it's done." Chip-edit reflow animation (250ms, chip blooms into editor, editor collapses on commit). Active schedules in #0A0A0A, paused in #6B7280 with dotted strikethrough. No save button (optimistic save). "Add a new sentence" as a hand-drawn dashed-outline bar at bottom.
- Designer 2 wants: Stripe webhooks list table. Calm rows, status pill, click-to-edit. Nothing distinctive. Admin is not warm. Admin is correct.

**Final integrated move:**
Sentence Builder ships as the primary view, with a compact table view available as a toggle. Designer 1 wins the concept because it IS the cross-page chip mechanic — and by the time Yossi reaches /schedules, he has already encountered the chip pattern in /crew's per-agent settings and /settings Profile tab. The pattern is learned; the vocabulary is consistent. The Sentence Builder on /schedules is *pattern number 3*, not *pattern number 1*, so its learning cost is near-zero. Designer 2's concern about 12+ schedules at Scale is addressed by the table-view toggle (which Yossi can switch to and persist). The "Add a new sentence" hand-drawn dashed bar ships because it's the invitation register — same vocabulary as /crew's placeholder card, spending no new hand-drawn budget.

**Specific treatment:**
- Primary view: single-column, 720px max-width, sentences at 32px vertical gap. Inter 15px body. Chip style: brand-blue #3370FF text, #3370FF at 8% background, 4px border-radius, 0 4px padding. Tap chip → bloom animation (250ms ease-out, chip transforms into inline editor).
- Active vs paused typography: active in #0A0A0A primary. Paused in #6B7280 muted with `text-decoration: line-through; text-decoration-style: dotted; text-decoration-color: #6B7280`. Hover paused → "Resume" chip appears inline. No status pill, no icon.
- No save button. Optimistic save on chip-blur. Error toast if save fails ("Couldn't save that change. Try again?").
- "Next run" hint: 12px muted Inter italic, one line below each sentence. "Next run: Monday Apr 28, 09:00 Israel time (in 4 days)." Live-computed from chip values.
- "Add a new sentence" bar: Rough.js dashed outline, roughness 1.0, full 720px width, 56px tall, centered "+ Add a schedule" in Excalifont 15px. This is the ONLY hand-drawn element on the page.
- Table view toggle: small "Table view" link in top-right, 12px caps weight 500 muted. Click → switches to compact table (domain + agent + frequency + next run + on/off toggle). State persists in localStorage.
- Hand-drawn surface: dashed-outline "Add" bar only. Page chrome is crisp.
- Sentence reflow: CSS Grid with `transition: all 200ms ease-out` when chip values change. Words physically move. `prefers-reduced-motion: reduce` → instant snap.

**Adam-decision points:**
1. Sentence Builder vs table as primary: Designer 2 argues table is always the right answer for admin. Designer 1 argues the Sentence Builder is the cross-page coherence payoff. The integration above makes Sentence Builder primary with table as fallback. **Adam: sentence primary or table primary?**
2. Hebrew sentence grammar: the sentence structure in Hebrew requires gendered addressing ("הריצי" — 2nd person feminine to address the agent). This works because the agent is a named persona. But the sentence structure may be harder to reflow naturally in Hebrew word-order. Synthesis: the Hebrew chip mechanic is the same; the sentence template differs in word order (tested with native speaker before ship). **Adam: commit to HE sentence builder or EN-only with HE table view?**
3. Conditional schedules ("every time my Schema score drops below 80"): this requires a different chip type (event-trigger vs cadence). Sentence Builder supports it (per Designer 1's spec). Table view also supports it. Ship both chip types at launch? Synthesis: ship cadence schedules at launch, conditional schedules in Phase 2. **Adam: agree to defer conditional triggers?**
4. The "Add a sentence" hand-drawn bar: Designer 2 explicitly called for no hand-drawn on /schedules. The bar is a minor concession (invitation register, not personality register). **Adam: keep the hand-drawn dashed bar or use a plain text "+ Add schedule" link?**
5. No save button (optimistic save): this is the Linear / Vercel discipline (instant commit). Risk: Yossi accidentally changes a chip and the schedule fires unexpectedly. Mitigation: undo toast ("Changed Monday to Tuesday. Undo?") that persists for 5 seconds with a revert action. **Adam: agree to optimistic save + undo toast?**

**State behavior:**
- Empty (no schedules): "No schedules yet." + "Add a schedule" (the hand-drawn bar). No illustration (no locked slot for /schedules).
- Loading: instant render.
- Save error: undo toast + "Couldn't save" inline under the failing sentence.

**Microcopy register:**
- Voice: conversational-structural. Sentences are fixed template, variables fill in.
- EN: "Run [the Citation Fixer] every [Wednesday] at [2pm], and notify me [in Slack] when it's done." / "Next run: Wednesday Apr 30, 14:00 (in 6 days)."
- HE: "הריצי [את ה-Citation Fixer] בכל [יום רביעי] ב-[14:00], ותעדכני אותי [ב-Slack] כשתסיימי."

**Connections:**
- IN: /home Section 8 (What's coming up — next scheduled scan), chrome header settings.
- OUT: /workspace (when a scheduled run triggers), /crew (per-agent settings for run configuration).

---

### /settings

**Page job:** Admin surface — account configuration, billing, language, domains, notifications.
**Frequency:** Sarah 2x/year. Yossi monthly.

**The fight:**
- Designer 1 wants: The Letter — Profile tab opens as a typed letter on cream paper (#F5F3EE), Excalifont 16px body, line-height 1.7, max-width 560px. Form fields appear inline in prose as tap-to-edit chips. Tabs in left rail (not top). Right rail shows live preview of how Profile changes affect agents. Signature at bottom in Fraunces 14px italic. Other tabs: Billing as clinical rows, Language as dropdown, Domains as receipt-tape list, Notifications as a shorter letter.
- Designer 2 wants: 5 tabs at the top, each tab a vertical form with stacked label-input-help triplets. Stripe Dashboard Settings is the reference. Zero decoration. Zero illustration. Zero Excalifont. One save button per section (not at bottom of page). /settings looks like settings.

**Final integrated move:**
The Letter ships on the Profile tab. Only the Profile tab. Designer 2 wins the other 4 tabs entirely: Billing = tabular clinical rows, Language = dropdown, Domains = receipt-tape list (Yossi-only), Notifications = compact single-column toggles with brief labels. The reasoning: Profile is the one self-presentation tab where the letter register earns its keep (the user is telling the product who they are — that is writing, not form-filling). Billing, Language, and Notifications are state configuration (operations, not identity). Different gravity. Designer 1 is correct about Profile; Designer 2 is correct about everything else. Notifications as a letter (Designer 1's sub-proposal) is a bridge too far — preferences are operational configuration, not self-expression. Standard toggle list.

**Specific treatment:**
- Tab structure: left rail tabs at 200px wide (NOT top tabs — this is Designer 1's layout contribution and it IS better for scanability on 5+ tabs). Tab label re-appears as H1 in the content area, first word of the letter on Profile tab.
- Profile tab: Excalifont 16px, line-height 1.7, max-width 560px, background #F5F3EE, 1px grain noise filter at 2% opacity. Chip style same as /schedules (matching mechanic — same visual token). No inline right-rail preview at launch (too complex for v1; it's a compelling feature but requires real-time agent prompt rendering). Signature at bottom: Fraunces 14px italic "— configured by [Adam K], last updated [Apr 26]." Click → shows last 5 change log entries (simple list, no animation). Hebrew Profile letter: Heebo 16px instead of Excalifont (no Hebrew Excalifont glyphs).
- Billing tab: tabular rows only. "Build · Active · Renews May 23 · $151/mo." No plan card. No animated upgrade CTA. Per Designer 2's Stripe-billing-calm discipline. If user is on Discover tier, a single line "Upgrade to Build →" in muted 14px at top of tab. One line. Not a card.
- Language tab: one radio group (English / Hebrew). "Save" button. Done. 3 elements.
- Domains tab (Yossi only): receipt-tape format (Rough.js perforations, same as /scans tape but condensed — 44px height per domain segment, serial number style). This is coherence with Yossi's data-artifact visual language. This tab is invisible to Sarah (single domain, no tab rendered).
- Notifications tab: single-column toggle list. Shadcn Switch component, 200ms toggle. Section labels in 12px caps muted. No animation beyond the switch. Grouped into: "Agent activity / Billing / Weekly digest / Scan alerts."
- No save buttons at bottom. Per-section save appears inline as "Save changes" button next to the section that was modified. Optimistic for toggles (Notifications). Explicit save for Profile chips (to avoid accidental saves on prose edit).
- Right rail at 280px: removed for v1. Spec'd by Designer 1 but requires too much LLM integration complexity. Flag for Phase 2.
- Hand-drawn surface: Profile tab cream background + Excalifont font only. No Rough.js shapes on /settings.

**Adam-decision points:**
1. Left-rail tabs vs top tabs: Designer 1's left-rail is genuinely better at 5 tabs (more scannable, standard on settings pages like Linear/Stripe). Designer 2 didn't explicitly argue for top tabs. Synthesis defaults to left-rail. **Adam: left-rail tabs?**
2. The Letter mechanic (inline chip-in-prose on Profile): this is the page's headline distinctive move. If Adam feels /settings "should be boring" (Designer 2 position), the Profile tab can fall back to a standard stacked form. The Sentence Builder elsewhere in the product still teaches the chip mechanic. **Adam: The Letter on Profile tab, yes or no?**
3. Domains tab receipt-tape (Yossi only): this requires the tape component from /scans to be reused in /settings. Same component, narrower. **Adam: tape on Domains tab or standard list?**
4. Signature at bottom of Profile letter: a personal touch (Fraunces italic "— configured by [user], last updated [date]"). Designer 2 didn't address this explicitly but would likely call it precious. **Adam: keep the signature?**
5. Right-rail agent-preview: defer to Phase 2. **Adam: agree?**

**State behavior:**
- All tabs: instant render on tab switch. No animation. Content swaps.
- Save confirmation: "Saved." toast at 200ms fade-in, 1.5s duration, fade-out. No green-fill. No check animation.
- Unsaved changes warning: if user tries to navigate away with unsaved chip edits in Profile, show browser-standard confirm dialog.

**Microcopy register:**
- Voice: editorial-conversational on Profile, clinical-operational on Billing/Notifications.
- EN Profile: "Your business is called [Acme Bakery], based in [Tel Aviv]. You sell [artisan sourdough] to [local cafés]."
- EN Billing: "Build · Active · Renews May 23 · $151/mo"
- HE Profile: "העסק שלך נקרא [אקמי בייקרי], מבוסס ב-[תל אביב]."

**Connections:**
- IN: sidebar nav (gear icon), header avatar dropdown.
- OUT: Billing → Paddle billing portal. Language → triggers locale reload. Domains → /scans (domain-filtered).

---

### /scan (public)

**Page job:** Acquisition surface — the one page 99% of leads see before deciding to pay.
**Frequency:** Once-ever (pre-signup). Potentially revisited to re-scan.

**The fight:**
- Designer 1 wants: self-correcting handwriting as a Frame 3 mechanic. When the auto-detected company name is wrong, the user clicks the handwritten name → Rough.js strikethrough scribbles across it (~400ms) → corrected name rewrites letter-by-letter in Excalifont at ~25 chars/sec. Same mechanic applies to detected industry and language corrections. The referral-share moment — users screenshot and post on X/LinkedIn.
- Designer 2 wants: the locked 4-motion-type budget stays at 4. No 5th motion type. The correction is a pencil-icon with a form input. The strikethrough is overkill. The chromeless page (no header/footer during Frames 1-7) is correct. No personality reveal at the end. Shorten from 15-17s to 12-14s if possible.

**Final integrated move:**
Strikethrough-and-rewrite ships. Designer 1 wins. Here is the key arbitration: the strikethrough mechanic does NOT add a 5th motion type. It reuses Excalifont (already in the vocabulary from /home, /inbox Receipt, /crew card back, /scan storyboard Frame 3). It adds a Rough.js scribble (already in the vocabulary). No new motion primitive. Designer 2's "4-motion-type budget" is about page-level animation systems, not about reusing existing vocabulary on existing surfaces. The strikethrough is Frame 3 content, not a new motion category. Ship it.

Designer 2 wins the timing argument: if any cuts are needed, cut from the engine-pill stagger (800ms → 600ms), not from Frame 7 (score count-up) or the final CTA spring. The referral-share moment is the score number, not the engine pills.

**Specific treatment:**
- Locked storyboard honored in full (REFS-03, 10 frames, 15-17s total). This document adds only the Frame 3 correction mechanic.
- Frame 3 correction mechanic: company name written in Excalifont ~14px in handwritten-ink #0A0A0A. Click → cursor changes to pointer, subtle underline hint (dotted #6B7280). User clicks → scribble-strikethrough animation ~400ms (Rough.js 2 strokes across the name, roughness 1.5, color #0A0A0A). After strikethrough completes → text cursor appears at start, name rewrites character-by-character at ~25 chars/sec (Excalifont, same style). If user types the correction, each character appears as typed. Enter commits. The metaphor: hand-scrawled, hand-corrected.
- Same mechanic applies to industry and detected language corrections (same Frame 3). Only 3 correctable fields. Not applied to engine results (Frame 8 onwards — those are data, not detected metadata).
- Chromeless during Frames 1-7: NO header, no footer, no marketing nav. Background #F5F3EE. Cursor auto-focuses the URL input on page load.
- URL input: centered, 560px max-width, large 18px placeholder "Type a website URL. We'll check how AI sees it." Cursor is already active on load (Arc browser implicit-focus pattern).
- Score reveal proof-receipt: "Scanned at 14:32:07, Apr 26, 2026, in 14 seconds" — Geist Mono 11px muted, bottom-left. Persists. Click → copies permalink. This is Designer 1's Polaroid-timestamp detail — it ships.
- Hand-drawn surface: entire Frames 1-7 storyboard (URL pencil-stroke, scribbled engine circles, score arc outline). Frame 8 onwards: crisp data typography.
- Fraunces diagnosis line: "73 out of 100. Stronger on ChatGPT, weakest on Perplexity. Top fix is FAQ schema." — Fraunces italic, same register as /home Section 1. Cross-page coherence.

**Adam-decision points:**
1. Strikethrough-and-rewrite vs pencil-icon edit: if the referral-share moment (user screenshots the correction mechanic) isn't a priority, the pencil-icon edit is faster to build and more universally legible. The decision is about how much we're betting on /scan being the viral share moment. Synthesis sides with Designer 1 because /scan is the acquisition wedge. **Adam: confirm strikethrough-and-rewrite?**
2. Chromeless duration: chromeless for Frames 1-7 (~11s). Frame 8 the sticky bottom bar with "Save these results" fades in. Some users may feel disoriented by a page without any chrome for 11 seconds. Option: add a minimal Beamix logo (top-left, 24px height) that's visible throughout but very quiet. **Adam: fully chromeless or minimal logo present throughout?**
3. Timing shortcut: Designer 2 argues for 12-14s instead of 15-17s. Engine-pill stagger is the cut candidate (800ms → 600ms saves ~200ms total). Adam locked the storyboard so re-litigating timing is outside scope — but noting it as a candidate for A/B test post-launch. **Adam: acknowledge as post-launch A/B?**
4. Industry/language correction mechanic: ship at launch or defer? The company-name correction is the primary referral-share mechanic. Industry and language corrections are lower-value. Synthesis: company-name correction at launch, industry/language corrections in Phase 2. **Adam: agree to stage the correction mechanic?**
5. Email-self the results: "/scan/[scanId]" second public route (noted as open question in PAGE-LIST-LOCKED). Does the proof-receipt permalink map to a shareable URL? Synthesis: ship the permalink-copy behavior pointing to the scan route; the route itself is a downstream decision. **Adam: confirm permalink copy ships with the receipt?**

**State behavior:**
- Pre-scan: URL input centered, cursor active, placeholder visible.
- Scanning (Frames 1-7): storyboard runs. No loading state separate from the reveal.
- Complete (Frame 8+): score rendered, engine grid rendered, diagnosis line, sticky bottom CTA. Score proof-receipt in bottom-left.
- Error (scan fails): "We couldn't scan that URL. Try checking it's a real website." — replaces the score arc with an error message in Inter 16px. No hand-drawn error state.

**Microcopy register:**
- Voice: casual-direct, second-person, present tense. Zero marketing speak.
- EN: "Type a website URL. We'll check how AI sees it." / "Reading your homepage…" / "73 out of 100. Stronger on ChatGPT, weakest on Perplexity. Top fix is FAQ schema."
- HE: "הקלידי כתובת אתר. נבדוק איך הבינה המלאכותית רואה אותו." / "קורא את דף הבית שלך…"

**Connections:**
- IN: marketing site CTAs, email campaigns, direct link share.
- OUT: signup flow (Paddle) → /onboarding with `?scan_id=` param.

---

### /onboarding

**Page job:** One-time setup flow — business profile, language, first agent, credits/first scan trigger.
**Frequency:** Once (post-Paddle, post-payment). Never again unless a step was skipped.

**The fight:**
- Designer 1 wants: the Wrap-Around horizon — a sticky 120px hand-drawn horizon line at the top of the viewport spanning the full width. 4 station markers. Completed stations: filled blue with hand-drawn checkmark. Active station: breathes (1400ms cycle, same as /workspace). Future stations: 30% opacity dashed outline. Path-draw on advance (600ms, dashed → solid when step completes). Clicking a previous station navigates back. Skip-but-stay: skipped stations show a deferred-dashed circle (not checkmark, not absent). The horizon IS the navigation.
- Designer 2 wants: 4 fast screens, instant transitions, one spring-overshoot on the chosen-agent card in step 3. Step indicator is "2 of 4" text. No decorated stepper. Onboarding is friction we choose to introduce; minimize it. Each step is one decision, instant transition.

**Final integrated move:**
The horizon ships as the progress visualization. The navigation-via-horizon is cut. This is the key split: the horizon communicates progress beautifully (path-draw is earned vocabulary, it's already in the product, it costs one SVG line and 4 station markers). But using it as *navigation* requires hover-state discovery, tooltip engineering, and introduces a non-standard back-navigation pattern that can fail for non-technical users (Sarah). The standard "Back" button (or clicking the previous step label) handles navigation; the horizon is the *picture* of where you are, not the *button* to go back. Designer 1's visual insight preserved; Designer 2's discoverability concern resolved.

Designer 2's spring-overshoot on step 3's chosen-agent card: ships. It's the right gesture at the right moment — the user's first product decision (which agent to run). 400ms spring, 4-6% overshoot. No confetti after. No celebration between steps.

**Specific treatment:**
- Horizon bar: sticky, 120px tall, full viewport width. The hand-drawn line is a perfect-freehand stroke, thinning 0.5, 2-4% jitter. Past sections: #3370FF solid at 60% opacity. Present: #3370FF solid at 100%. Future: #6B7280 dashed at 30% opacity. Station markers: Rough.js circles 28×28px, roughness 1.0, fixed seed per station. Active station breathes (1400ms CSS cycle modulating stroke-opacity). Completed stations: hand-drawn checkmark inside (Rough.js, slight rotation variation, fixed seed).
- Path-draw on advance: dashed → solid section draws over 600ms ease-out when step completes. RTL: draws right-to-left. `prefers-reduced-motion: reduce` → instant solid.
- Horizon navigation: NOT interactive (no pointer cursor on stations, no click-to-navigate). Standard back button in content area below horizon bar.
- Skip-but-stay: deferred to Phase 2. v1 has no skip option on required steps; optional steps (language preference) get a plain "Use default" link that advances normally and marks step complete. The deferred-dashed-circle state is a Phase 2 complexity.
- Step content: single-column, 720px max-width, centered below the horizon bar. Each step is a chapter, not a card — no card outline, content breathes on the page.
- Step 3 (chosen-agent card): 2-column grid of agent cards (same card format as /crew, without flip). Click card → spring-overshoot (400ms, cubic-bezier with ~5% overshoot). Chosen card gains a 2px brand-blue border + subtle background #3370FF at 4%. Un-chosen cards dim to 60% opacity.
- Step 4 (credits + first scan): one summary of chosen agent + a single large CTA "Run my first scan →" (pill, brand blue, spring-overshoot on click per locked vocabulary). Transition to /scan reveal immediately.
- Inter throughout. Excalifont only on the station markers (station number or checkmark glyph). No Excalifont on the form content.
- No progress-bar animation separate from the horizon. No "Step 2 complete!" toast between steps. Step completion is signaled by the horizon path-draw — the visual IS the toast.

**Adam-decision points:**
1. Horizon as navigation vs visual-only: the integration above makes it visual-only. If Adam wants the horizon to be navigable (clicking station 1 from station 3 goes back), it's achievable but adds ~2 weeks of engineering for hover-states, tooltips, and edge-case handling. **Adam: horizon navigation or visual-only?**
2. Skip-but-stay deferred to Phase 2: Designer 1's most thoughtful behavioral innovation. It signals honesty ("we know you'll come back"). If Adam wants it at launch, it requires one extra station visual state (deferred-dashed circle) and the re-engagement glowing logic on /home. Achievable in v1 sprint but adds complexity. **Adam: launch with skip-but-stay or defer?**
3. Horizon height (120px): this is aggressive — 120px sticky means 120px of viewport lost on each step. At 768px viewport, that's 15% lost to the progress bar. Option: 80px horizon (smaller station circles 20px, thinner line). **Adam: 120px or 80px horizon?**
4. "Use default" vs required fields on language step: if language is required (affects agent behavior), no skip. If it's optional-with-sane-default (Hebrew if locale detects Israel, English otherwise), "Use default" advances without user action. Synthesis: auto-detect locale, show detected language pre-selected, user can change it. "Continue" button always present. **Adam: agree with auto-detect default?**
5. Step 4 credit allocation UI: "how many credits you want a month" is the step per the locked spec (PAGE-LIST-LOCKED §/onboarding). This implies a credits-per-month slider or picker. On a plan-based model (Discover/Build/Scale credits are fixed), this step may not make sense. **Adam: what exactly is the step 4 decision? Confirm first scan? Set credit allocation? Something else?**

**State behavior:**
- In-progress: horizon advances per step. Form fields clear to defaults on load.
- Completed step: horizon draws solid path to next station. Active station advances.
- Final step complete: CTA "Run my first scan →" → immediate navigate to /scan with scan_id param.
- Error (profile save fails): inline form error under the failing field. Horizon does not advance. Toast: "Couldn't save that. Try again?"

**Microcopy register:**
- Voice: direct-conversational, second-person, no "welcome", no exclamation.
- EN step H1s: "Tell us about your business." / "Pick the language your customers use." / "Try your first agent — pick one we'll run while you finish." / "You're set. Start your first scan."
- HE step H1s: "ספרי לנו על העסק שלך." / "בחרי את השפה שהלקוחות שלך משתמשים בה." / "נסי את הסוכן הראשון שלך." / "סיימנו. הריצי את הסריקה הראשונה."

**Connections:**
- IN: post-Paddle payment confirmation (with `?scan_id=` if came via /scan public).
- OUT: /scan public reveal (with existing scan_id linked) → /home on scan complete.

---

### /reports

**Page job:** Export surface — white-label PDF/CSV generation for Yossi's client deliverables (Scale-tier gated, $499/mo).
**Frequency:** Yossi uses when delivering to clients (~weekly). Sarah: never.

**The fight:**
- Designer 1 wants: Cover Page Press. /reports is a 2-pane layout (60% live preview pane left, 40% config pane right). The preview shows the A4 cover page in real time. Config edits reflow the cover. Export button labeled "Press" (printing press reference). A Y-axis card-flip animation (~600ms, same as /crew flip) fires before PDF downloads. First-ever visit: Excalifont-to-InterDisplay morph on the cover preview (hand-drawn → crisp, same emotional beat as /scan Frame 8). White-label override config uses the chip-in-prose letter mechanic.
- Designer 2 wants: clinical generator form (domain selector + date range + format toggle + Generate button) + recent reports table below. Stripe Reports is the reference. No cover preview. No flip animation. "Export" not "Press." The tool surface stays workmanlike; the artifact handles the editorial register.

**Final integrated move:**
Cover ships. Flip ships. "Press" ships. The 2-pane preview ships. The generator stays workmanlike on the right (config pane). Designer 1 wins because the argument is sound: Yossi pays $499/mo and one of the primary reasons is the client-deliverable quality. If /reports looks like Stripe Sigma (a utility tool), Yossi feels like he's using software. If /reports looks like a press — where he configures and then *presses* a piece — he feels like he's running an agency. The distinction is the product's value proposition. Designer 2 is right that the tool surface (the config right pane) should stay calm. Both are correct simultaneously — the distinction between artifact surface (left) and tool surface (right) IS the page's visual argument.

Designer 2 wins the history table placement: recent reports history at the bottom of the right pane, NOT at `/reports/history`. Yossi wants one page, not two. Designer 1's separation of "create" from "manage" into separate routes is too pure — in practice, Yossi wants to see his last 3 reports while configuring the next one.

**Specific treatment:**
- Layout: 2-pane. Left pane 58% width: live cover preview in A4 aspect ratio, scaled to fit viewport height minus top bar. Right pane 42%: config form + recent reports history below.
- Left pane cover preview: real-time rendering of cover variables (client name, date range, subtitle). NOT a real PDF render — a live HTML/CSS approximation of the cover layout. InterDisplay 64-72px for domain name, Fraunces 18px italic editorial subtitle, Geist Mono 13px date, Beamix monogram bottom-left (or white-label override). Background: #F5F3EE cream. Single rough-notation underline on one keyword in subtitle.
- Right pane config: domain selector (dropdown, tabular nums), date range (From/To date pickers), format toggle (PDF / CSV). White-label branding override section (chip-in-prose letter, same mechanic as /settings Profile). "Press" button at the bottom of config pane — pill-shaped, brand blue, 48px height, 32px horizontal padding.
- "Press" button: on click → card-flip animation (Y-axis rotateY(180deg), 600ms cubic-bezier(0.4, 0, 0.2, 1)). Same motion token as /crew card flip. Behind the flip: brief stack-of-pages visual forms (3 pages in 3D space, 200ms stagger). Then PDF download fires. After download: flip reverses to front face ("Press" button back, cover preview visible). No confetti. No celebration toast beyond "Report saved." quiet notification.
- Recent reports: below the config form in the right pane. Max 5 rows visible. Domain + date range + format + download link + delete icon. "View all →" link if more than 5 exist.
- First-ever visit: Excalifont-to-InterDisplay morph on left pane (locked, localStorage-flagged, once per account). The cover preview first renders in Excalifont sketch style, then morphs over 300ms to InterDisplay crisp. This fires ONCE for Yossi's account across all 20 domains.
- "Press" label: semantic design decision, not a legibility risk. Yossi is a Scale-tier power user who understands the artifact metaphor after /scan Frame 8 and /crew card back. He knows Beamix operates in paper/press register.
- Hand-drawn surface on the PDF artifact: ONE rough-notation underline on subtitle keyword (per Designer 1's spec). The artifact is editorially precise.
- PDF content (inside the PDF, not the UI): Stripe-Press quality. Cover page + data charts with InterDisplay headings + Geist Mono data + Fraunces italics for pull quotes. Full editorial treatment. This is the Scale-tier brand promise.

**Adam-decision points:**
1. 2-pane vs form-only: the 2-pane with live preview is the biggest layout decision on this page. If the engineering cost of a real-time HTML cover preview is too high at launch, the fallback is a static cover-page image (Figma-exported) in the left pane that updates after form changes (300ms debounced re-render). **Adam: live-updating cover preview or static placeholder updated on change?**
2. "Press" button label: Designer 2 called it gimmicky. If Yossi doesn't feel the metaphor, the button becomes "Export PDF" with the same flip animation retained. Recommendation: "Press" ships. **Adam: "Press" or "Export PDF"?**
3. Flip animation (Y-axis, 600ms): same motion grammar as /crew card flip. Cross-page coherence is the argument for it. Designer 2 objected to this as "gimmicky theater on a transaction surface." The counter: the flip IS the artifact-making metaphor (you press, the PDF forms). It's bounded to one click per report generation. **Adam: flip animation or instant download?**
4. White-label config as chip-in-prose letter: this is the 4th surface where the chip mechanic appears (after /crew, /settings, /schedules). By /reports (Scale tier), Yossi has seen it 3 times. The pattern is fully learned. **Adam: chip-in-prose for white-label config or standard form?**
5. Recent reports in right pane vs separate `/reports/history` page: integration spec puts history in the right pane (max 5 rows + "View all →"). Designer 1 argued for a separate route to keep the creation surface pure. **Adam: history in right pane or separate route?**

**State behavior:**
- Default: right pane pre-filled with most recent domain + current month date range + PDF format. Cover preview shows pre-filled state.
- Press (generating): cover preview plays the flip animation. Right pane shows "Preparing…" one-line muted text. "Press" button disabled during generation.
- Complete: PDF download fires. Toast: "Report saved." Cover preview resets. Recent reports row prepends.
- Error: "Couldn't generate that report." inline in the right pane under the "Press" button. No flip animation.

**Microcopy register:**
- Voice: editorial-clinical. Tool UI is personal ("Press a copy of this report for Acme Bakery, dated today."). Cover artifact is third-person editorial ("AI visibility report — quarterly review. Prepared April 2026.").
- EN: "Press" / "Report saved." / "Press a copy of this report for [Acme Bakery], dated today."
- HE: "הדפסה" (for the button — the Hebrew printing-press register, not a transliteration of "Press") / "הדוח נשמר." / "הדפיסי עותק של הדוח הזה עבור [אקמי בייקרי], מהיום."

**Connections:**
- IN: sidebar nav (Scale-tier only). /home "What's coming up" (if recurring report is scheduled). /schedules (recurring report config links here).
- OUT: PDF download. Recent reports history in right pane. `/schedules` (for recurring report frequency config).

---

## CROSS-PAGE COHERENCE CHECK

### 1. The 5 hand-drawn empty-state slots (allocation audit)

Per ANIMATION-STRATEGY-LOCKED, exactly 5 Rough.js illustration slots exist across the product:

| Slot | Page | Illustration | Status in this doc |
|------|------|--------------|-------------------|
| 1 | `/home` empty | Magnifying glass over square, 96×96px, static | Honored — not touched by this doc (/home spec is locked) |
| 2 | `/inbox` zero-pending | Empty desk drawer or completed-task sketch, 96×96px | Honored — ships on absolute zero-pending only, not on filtered-zero |
| 3 | `/scans` first-ever | Stack-of-pages or scanner-icon sketch | Honored — on All Scans tab first-ever state |
| 4 | `/crew` empty | Three-figure silhouette line-art | Honored — appears for new accounts with no agents activated |
| 5 | `/competitors` empty | Two-figure side-by-side line-art | Honored — ships despite Designer 2 arguing for text-only empty state; Adam's lock holds |

No page in this document adds a 6th illustration slot. /schedules, /settings, /workspace, /reports, /onboarding, and /scan all use text-only empty states. Budget intact.

The /schedules "Add a new sentence" hand-drawn dashed bar and the /crew "Suggest agent" placeholder card are NOT illustrations — they are Rough.js UI elements (invitation-register affordances), not empty-state sketches. They do not count against the 5-slot budget.

### 2. Cross-page motion vocabulary compliance (7 entries from ANIMATION-STRATEGY-LOCKED)

| Motion primitive | Pages using it in this doc | Notes |
|---|---|---|
| 1. Score Gauge Fill (count-up) | /scan (Frame 7), /scans per-scan detail, /reports cover preview | Not on /scans list tape itself — score shows as static tabular number |
| 2. Path-Draw | /competitors Rivalry Strip, /scans tape unfurl, /onboarding horizon advance, /reports first-visit cover preview | All comply with `pathLength` 0→1 vocabulary |
| 3. Card Hover Lift | /crew card grid, /reports right pane | 150ms translateY(-1-2px) + shadow |
| 4. Pill button spring-overshoot | /scan CTA, /onboarding step 4 "Run" CTA, /reports "Press" button | 400ms spring, 4-6% overshoot |
| 5. Hand-drawn empty-state sketches | /inbox, /scans, /crew, /competitors (existing 5 slots) | Static, not drawn-in |
| 6. Optimistic UI on Approve | /inbox approve action | 200ms collapse + strikethrough + toast |
| 7. Topbar asterisk | All pages (/workspace, /schedules running agent, /reports generating PDF) | 1200ms breath, every page |

No page introduces a new motion vocabulary item. /workspace's courier flow (already locked), /crew's card flip (already approved as a cross-page motion token shared with /reports), and /scan's strikethrough-and-rewrite (reuses existing Rough.js + Excalifont vocabulary) are all within bounds.

### 3. Audit for /home signature replication

The following /home signature moves MUST NOT appear on other pages:
- Hero score block (64-72px score number as page-opening anchor) → NOT replicated on /scans list tab (score is 28px in tape segment). Replicated at appropriate scale only in per-scan detail and /scan public reveal.
- Fraunces-italic diagnosis line → replicated on /scan public (explicitly designed for cross-page coherence — both are acquisition/state-reveal surfaces). NOT on any other page.
- Sparkline path-draw as page identity → used on /competitors as part of the Rivalry Strip, but differentiated (dual-sparkline with shaded gap vs /home's single sparkline per engine). Different enough.
- Score count-up → appears on /scan and /reports (same vocabulary, appropriate). Does NOT appear on /scans list or /competitors (those show static numbers).

No egregious /home signature replication detected. The Fraunces diagnosis line appears in exactly 2 places (/home, /scan) — both legitimate.

---

## OPEN QUESTIONS FOR ADAM (prioritized)

1. **Card flip vs expand panel on /crew (high stakes):** The card flip is the page's design bet — either it feels like a premium ritual or it feels like 2010. The execution quality matters enormously. If Adam has doubts, the expand-panel variant is significantly less risky and ships faster. This is the decision with the most implementation divergence. **Pick one: card flip or expand panel?**

2. **Receipt-tape width (560px centered) on /scans All Scans tab:** The whitespace is intentional (luxury register). But Yossi is a power user who wants data density. If the cream canvas feels wasteful, the tape can widen to 760px-900px and lose some of the "expensive whitespace" feel but gain data density. Deciding this determines whether /scans reads as "editorial artifact" or "efficient data browser." **Adam's call on width?**

3. **The Letter on /settings Profile tab:** If Adam agrees with Designer 2 that settings should be uniformly boring-and-trustworthy, the Profile Letter is cut and replaced with a standard stacked form. Everything else in the /settings spec stays. This is a contained decision — the chip mechanic is established by /schedules and /crew; /settings Profile doesn't need to be the Letter to teach it. **Letter or standard form?**

4. **"Press" button label and flip animation on /reports:** Both are bets on Yossi understanding the printing-press metaphor and feeling clever about it (not confused). If the product team feels this is too clever, "Export PDF" + instant download is the safe fallback. The flip animation and "Press" label can be split — keeping the flip but changing the label to "Export" loses half the brand value; keeping the label but cutting the flip makes the label slightly orphaned. They're designed together. **Both or neither?**

5. **Horizon navigation on /onboarding (whether station-clicks navigate):** This is Designer 1's most elegant insight (the horizon IS the navigation) and Designer 2's most valid concern (it's non-discoverable). The synthesis made it visual-only with standard back button. If Adam wants the horizon to navigate (no back button, clicking stations goes back), it's more distinctive but requires engineering for discoverability. **Visual-only or navigable?**

6. **Sentence Builder primary vs table primary on /schedules:** The integration makes Sentence Builder primary (with table-view toggle). Designer 2 argued this is a premium-feeling sugar on top of cron config. The question is whether Adam agrees that /schedules earns a distinctive move by being "the third surface of the chip mechanic" or whether it should just be a table. The chip mechanic's cross-page payoff depends on all 4 surfaces shipping (crew, settings, schedules, reports). If one drops, the cross-page story weakens. **Sentence primary or table primary?**

7. **Step 4 of /onboarding — what is the actual decision?** The locked spec says "credits you want a month." But on a plan-based model (Discover/Build/Scale have fixed credit allocations), there may be no credit decision to make. The step might be: "Confirm your first scan" (simple) or "Here's what's included in your plan" (review) or something else entirely. This needs product clarification before the step can be designed. **What is step 4 actually asking the user to do?**

---

## THE FOUR CROSS-PAGE DESIGN BETS — What the synthesis commits to

The 10 integrated moves make four cross-cutting bets that either all pay off together or all fail together. Adam should evaluate these bets independently of any single page.

### Bet 1: The chip-in-prose mechanic as a cross-product grammar
The synthesis ships the chip-in-prose mechanic on 4 surfaces (/schedules, /settings Profile, /crew per-agent, /reports white-label). The bet: if the user encounters this mechanic 4 times across 4 different pages, it becomes instinctive. Configuration feels like writing, not form-filling. Each encounter reinforces the previous. The risk: if any one of the 4 surfaces ships late or ships with a different visual treatment, the pattern breaks. Four surfaces must look identical at the chip level. The payoff is that this is a Beamix-only interaction primitive that no competitor ships — it becomes the product's configuring register and its identity signal wherever settings appear.

### Bet 2: The Reasoning Receipt as a cross-page explanation primitive
The Receipt component appears on /inbox (primary), /competitors (verdict explanation), and potentially /home Section 7 (activity-feed click explanation). The bet: if the user learns that "clicking for an explanation gives me the agent's first-person rationale in a cream card," the product's trust-building is portable — it doesn't live only in /inbox but everywhere the user wants to understand *why*. The risk: if the Receipt's voice isn't consistent (e.g., the /competitors Receipt reads differently from the /inbox Receipt), the cross-page mental model breaks. One writing system, one receipt component, one voice per agent, everywhere.

### Bet 3: The cream-paper (#F5F3EE) as a semantic signal for artifacts
The cream background appears on 6 surfaces: Receipt card, tape canvas, crew card back, settings Profile tab, reports cover preview, and scan storyboard Frames 1-7. The bet: users learn (without being told) that cream means "this is an artifact — something made, recorded, or authored." White means "this is a tool surface." The contrast between the two is the product's implicit UX language. The risk: if cream appears anywhere that isn't an artifact (e.g., a card that's just styling, not a document), the semantic signal breaks. The cream budget must be treated like the illustration budget: fixed, intentional, defended.

### Bet 4: Agent first-person voice as a persistent product character
The synthesis ships agent-first-person voice across: /inbox Receipts, /competitors verdict explanations, /workspace micro-text rotation, /crew card backs, and /home Section 7 activity feed copy. 11 agents, each with a distinct voice, consistent across 5 surfaces. The bet: by week 3 of using Beamix, Yossi has a working relationship with specific agents. He knows the Schema Doctor won't add schema it can't back up. He knows the Citation Fixer is competitive. These parasocial relationships with named agents are the stickiness mechanism — not dashboard features, not integrations, but *character*. The risk: if even one agent's voice is inconsistent between /inbox and /competitors, the illusion breaks. One writer, one voice guide, one review process for all agent-generated copy.

---

## DESIGNER SCORECARD — Who won each page and why

This section is the honest accounting. The synthesis isn't neutral — it picks a winner per page. The reasoning below explains the decision logic so Adam can challenge any call he disagrees with.

### Pages where Designer 1 wins outright (3 pages)

**1. /competitors — Rivalry Strip**
Designer 2's case for horizontal bar charts was technically correct but missed the product's narrative claim. Beamix is positioned as "the tool that tells you what changed and why" — not "the tool that shows you current state." A bar chart is a snapshot tool. The Rivalry Strip is a trajectory tool. The entire product voice (agent first-person rationale, courier flow as journey, tape as ongoing record) is oriented toward "what happened and why." /competitors is the one page where visualization must match that narrative. The Rivalry Strip is the only chart type that can say "we've been gaining on this competitor for 8 weeks" without a tooltip. Designer 2 was optimizing for discoverability (bar charts are universally legible). Designer 1 was optimizing for product coherence (the chart type must match the product claim). Product coherence wins when the product claim is the differentiation.

**2. /scan — strikethrough-and-rewrite correction**
The key arbitration: Designer 2 argued this adds a 5th motion type. It doesn't — it reuses Rough.js (already in the storyboard for the score arc outline) and Excalifont (already the handwritten-type vocabulary). The arbitration hinged on that classification. Beyond the vocabulary argument: /scan is the one surface where 99% of leads make their first impression. The correction mechanic is not just UX — it's the referral-share moment that makes Beamix spreadable. Pencil-icon edits don't get shared on X. A handwriting scribble that strikes through and rewrites gets shared. The conversion cost difference between "nobody shares this" and "people share this" at the top of the funnel is the primary cost-justification for the feature. Designer 1 wins on ROI grounds.

**3. /reports — Cover Page Press + flip animation + "Press" label**
Designer 2 was right about the tool surface (the config right pane stays workmanlike). Designer 2 was wrong about the artifact surface (the PDF cover is NOT the tool — it's the client deliverable). The critical product distinction: Yossi pays $499/mo partly because the artifact he sends to clients looks premium. If the artifact looks like Stripe Sigma output (a utility PDF), Yossi is overpaying. If the artifact looks like Stripe Press output (an editorial piece), Yossi is getting what he paid for. Designer 2 conflated tool and artifact. The split-pane design makes the distinction explicit: left pane (artifact surface) is editorial; right pane (tool surface) is workmanlike. Both designers were right about one half of the page.

### Pages where Designer 2 wins outright (3 pages)

**1. /schedules — discipline wins on mascot risk, Sentence Builder survives on coherence grounds**
This is the most nuanced "Designer 2 wins" classification. Designer 2 wanted a pure Stripe-webhooks table with zero distinctiveness. That doesn't ship. But Designer 2 is correct on every specific objection: no calendar Gantt, no natural-language parser, no countdown timers, no hand-drawn cron sketches. The Sentence Builder ships not because Designer 1 argued well for it in isolation but because the cross-page chip mechanic requires it — /schedules is chip surface #3 (after /crew and /settings), and the pattern only pays off through repetition. Designer 2's restraint wins on every proposed embellishment; Designer 1's concept survives only on coherence grounds, not on its own standalone merit.

**2. /settings — Designer 2 wins 4 of 5 tabs**
The Letter on the Profile tab is one tab, not five. Designer 2 holds the line on Billing (calm rows, no plan card animations, no "gorgeous upgrade CTA"), Language (one dropdown), and Notifications (plain toggles). The Domains tab (receipt-tape, Yossi-only) is borrowed from /scans vocabulary — coherence, not decoration. Designer 2's core thesis — "don't prettify admin" — governs all but one surface. The Profile tab Letter is the exception that proves the rule: Profile IS self-presentation (not admin); the letter register is correct for that one tab; every other tab is operational. Designer 2 wins the argument; Designer 1 wins one room in the building.

**3. /workspace completion moment**
The stamp was beautiful. The Rough.js monogram drawing itself at the end of every agent run, ~600ms, would be a genuine craft moment in screenshots. It's wrong in practice because Yossi watches runs multiple times per day and each stamp is a 600ms tax. Designer 2's "Done. 2m 14s. View output →" is the billion-dollar move here — the discipline of ending quietly is exactly what Linear and Anthropic Console do. The courier flow IS the ceremony; the completion is the beat where it stops. Competing with the courier flow's elegance by adding an outro stamp would be like adding a fanfare at the end of a Hemingway sentence. Designer 2 wins the completion moment. Designer 1 wins the dissolution (the card is gone; the page IS the journey — that is the bigger, correct call).

### Pages where the blend was required (4 pages)

**1. /inbox — blend**
Designer 1's Reasoning Receipt is the page's soul. Designer 2's Linear 3-pane is the page's skeleton. Neither works without the other. A receipt on a poorly-designed triage surface is decoration. A Linear-triage with a clinical diff is Otterly. The blend: borrow Linear's skeleton exactly, insert the Receipt exactly once per session (first selection, then instant). The typing-animation frequency rule is the synthesis's unique contribution — neither designer proposed it. This is the integration doing work that neither position could do alone.

**2. /scans — blend**
The tape is correct on the primary history-browsing tab (All Scans) where the artifact register earns its keep. The table is correct on the operational tabs (Per-Engine, Completed Items) where density and comparison are the job. Neither designer's proposal covers both use cases correctly — Designer 1 would have put the tape on all three tabs (incorrect for operational queries) and Designer 2 would have put the table on all three (correct for operations but missing the artifact register on the primary tab). The blend is the right answer and neither designer found it alone.

**3. /crew — blend**
Designer 1's card backs survive; Designer 2's mascot-rejection survives. These are not contradictory — card backs with agent philosophy ARE personality without mascots. The distinction: mascots are visual characters with illustrated faces and emotional expressions; card backs are *written* personality in agent first-person voice. Beamix can have 11 agents with distinct written voices and no illustrated faces. That's the blend: personality lives in text, not illustration. The first-visit skeleton-draw (Designer 2's meet-the-team moment, already locked) provides the visual ceremony; the card backs provide the written relationship. Both designers' core contributions preserved.

**4. /onboarding — blend**
Designer 1's horizon is the progress visualization (genuine product craft). Designer 2's standard back button is the navigation (genuine discoverability discipline). The horizon as navigation is the part that fails (non-discoverable, engineering cost, failure mode if user misses it). The horizon as visual progress is the part that succeeds (it communicates "you're traveling somewhere" better than dots). The blend: keep the visual, restore the standard navigation. The spring-overshoot on step 3's chosen-agent card (Designer 2's concession, already locked) ships alongside it.

---

## THE CHIP-IN-PROSE MECHANIC — Cross-page canonical spec

This mechanic appears on 4 pages and must be implemented once to be reused consistently. Frontend developers need this spec before building any of the 4 surfaces.

### What it is
A prose sentence rendered in Inter 15px (or Excalifont 16px for letter register) with bracketed tokens replaced by interactive chips. Chips hold a value, look editable, and on tap/click bloom into an inline editor (dropdown, date picker, time input, or free text depending on the token type). On commit, the chip collapses back with the new value and the prose reflows.

### Where it appears
| Surface | Register | Chip types present |
|---|---|---|
| `/crew` per-agent settings | Letter (Excalifont on cream) | Dropdown (cadence), time picker, toggle, multi-select |
| `/settings` Profile tab | Letter (Excalifont on cream) | Free text (name, location, tone), multi-select (languages) |
| `/schedules` primary view | Sentence (Inter on white) | Dropdown (agent, cadence, day), time picker, notification channel multi-select |
| `/reports` white-label config | Letter (Inter on white) | Image upload (logo), color picker (brand colors), free text (signatory name) |

### Visual token spec
- Chip at rest: text color #3370FF (brand blue), background #3370FF at 8% opacity, border-radius 4px, padding 0 6px, cursor pointer. No border.
- Chip hover: background at 14% opacity, 150ms transition.
- Chip active (blooming): background at 18% opacity, 150ms.
- Chip bloom animation: chip's width animates 0→auto, height animates 0→auto (or chip-height → editor-height), 250ms ease-out. The editor surfaces the appropriate input control (Shadcn Select, DatePicker, TimePicker, or plain input) inside the bloomed bounds. The prose around the chip shifts via CSS flex `transition: all 200ms ease-out` to accommodate the wider editor.
- Chip collapse: editor collapses to new-value chip, 200ms ease-in. Prose reflows.
- `prefers-reduced-motion: reduce`: all chip animations instant-snap.

### Save behavior
- /schedules: optimistic save on chip-blur. Undo toast for 5 seconds ("Changed Monday to Tuesday. Undo?").
- /settings Profile: explicit "Save changes" button appears next to the section when any chip is modified. Button disappears after save. Prevents accidental overwrites.
- /crew per-agent: optimistic save on chip-blur. Undo toast.
- /reports white-label: saves as draft until "Press" is clicked. No auto-save during configuration.

### Hebrew sentence grammar
- Chip mechanic is identical in Hebrew; sentence template changes word order to match Hebrew grammar.
- /schedules example: `הריצי [את ה-FAQ Agent] בכל [יום שני] ב-[9:00]` (verb first, then bracketed agent, then cadence)
- Font substitution on letter-register surfaces: Heebo 16px replaces Excalifont (no Hebrew glyphs in Excalifont).
- Chip visual token is identical; only text rendering changes.

### What this mechanic IS NOT
- NOT a natural-language parser (user doesn't type free prose that gets parsed into chips — the chips are fixed-position tokens in a fixed template).
- NOT an AI-generated sentence (the sentence template is hardcoded per context; the agent fills the tokens).
- NOT a form with labels removed (the prose IS the context; removing it would leave orphaned inputs with no meaning).

---

## THE VISUAL REGISTER MAP — 10 pages, 4 registers

A key output of the synthesis is that 10 pages resolve into 4 distinct visual registers. These are not stylistic choices — they are semantic signals. The register tells the user what kind of surface they're on.

| Register | Pages | Background | Body type | Hand-drawn elements | Motion profile |
|---|---|---|---|---|---|
| **Editorial artifact** | /scan (Frames 1-7), /scans (All Scans tape), /reports (left pane cover) | #F5F3EE cream | Excalifont (where applicable), Inter tabular for data | Rough.js (perforations, cover elements, courier flow) | Path-draw, count-up, score fill |
| **Journey canvas** | /workspace, /onboarding (horizon zone) | #FFFFFF white | Inter regular for output; Excalifont for journey markers | Rough.js circles + perfect-freehand line (courier flow, horizon) | Path-draw animating in real time; breath on active element |
| **Data intelligence** | /home, /competitors, /scans (Per-Engine tab) | #FFFFFF white | Inter tabular for data; InterDisplay for headings | None (data is the personality) | Path-draw (chart animation), hover lifts, score fill |
| **Admin utility** | /inbox (chrome only), /crew (chrome only), /schedules (sentences), /settings (4 non-Profile tabs), /reports (right pane) | #FFFFFF white | Inter 14-15px, clean | None (or invitation-register dashed bar on /schedules) | Sub-200ms responses, hover lightens, spring on primary CTA |

The cream background (#F5F3EE) is the primary visual signal for "you are looking at an artifact." It appears on:
- /inbox Reasoning Receipt card surface
- /scans All Scans tape background (the canvas around the ribbon)
- /crew card back surface
- /settings Profile tab content area
- /reports left pane cover preview
- /scan Frames 1-7 background

The #FFFFFF white surface is "you are operating the product." The contrast between the two backgrounds is not decorative — it's a semantic distinction that the user learns over time: cream means paper, white means tool.

This register map resolves a question that neither designer addressed explicitly: should /onboarding feel like an artifact or a tool? The answer from this synthesis: the horizon zone (sticky header) is Journey Canvas (cream journey-line on white); the step content below (forms, inputs, card selection) is Admin Utility (white, crisp). The step content is tool-work; the horizon is the emotional container for the journey. Two registers on one page, properly separated by spatial zone.

---

## BUILD DEPENDENCY ORDER — what must ship before what

Several design decisions in this document create build dependencies. This map ensures the frontend build sequence is correct.

### Tier 1 — Must ship first (other pages depend on these)
1. **Chip-in-prose mechanic** (React component, shared) — required by /schedules, /settings Profile, /crew per-agent, /reports white-label. Without this component, all 4 pages are blocked.
2. **Rough.js + perfect-freehand integration** (utility lib) — required by /inbox Receipt outline, /scans tape perforations, /crew monogram cards, /workspace courier flow, /onboarding horizon, /scan storyboard. Must be initialized with fixed-seed capability and RTL path-draw support before any hand-drawn surface is built.
3. **Reasoning Receipt component** (shared React component) — required by /inbox (primary), /competitors (verdict expansion), /home Section 7 (activity-feed click). One component, three pages. Must be built once and imported.
4. **Topbar asterisk** (chrome, all pages) — already locked in animation strategy; must ship before any page that has agent runs.

### Tier 2 — Can ship in parallel once Tier 1 is done
- /inbox (depends on: chip-in-prose for future agent config, Reasoning Receipt, Rough.js)
- /workspace (depends on: Rough.js, perfect-freehand, topbar asterisk)
- /scans (depends on: Rough.js for tape perforations, Score Gauge Fill for per-scan detail)
- /competitors (depends on: Reasoning Receipt, path-draw for Rivalry Strip)
- /crew (depends on: Rough.js for monogram cards, chip-in-prose for per-agent settings page linked from card back)

### Tier 3 — Can ship once Tier 2 is established
- /schedules (depends on: chip-in-prose)
- /settings (depends on: chip-in-prose for Profile tab, receipt-tape for Domains tab which depends on /scans tape component)
- /onboarding (depends on: Rough.js for horizon, spring-overshoot pill for step 4 CTA, /crew card component for step 3 agent selection)

### Tier 4 — Scale-tier gated, can ship last
- /reports (depends on: chip-in-prose, /crew card-flip motion token, Rough.js for cover rough-notation underline)

### Shared components that must be designed once (not per-page)
| Component | Used on | Priority |
|---|---|---|
| Reasoning Receipt card | /inbox, /competitors, /home | Tier 1 |
| Chip-in-prose sentence | /schedules, /settings, /crew, /reports | Tier 1 |
| Receipt-tape segment | /scans, /settings Domains | Tier 2 |
| Card flip (Y-axis) | /crew, /reports | Tier 2 |
| Rough.js station marker | /onboarding, /workspace | Tier 2 |
| Score Gauge Fill (count-up) | /home, /scan, /scans detail, /reports | Tier 1 (from /home spec) |
| Pill spring-overshoot button | All primary CTAs | Tier 1 (from /home spec) |

---

## ANTI-PATTERN WATCHLIST — what must not appear

Pulled from Designer 2's Appendix C and augmented with integration-specific risks. For design review and code review.

| Anti-pattern | Affects | Reject with |
|---|---|---|
| Skeleton-draw on Tier-3 daily pages after first visit | /inbox, /scans, /competitors, /schedules, /settings (all), /crew post-first-visit | Animation strategy lock. Instant render only. |
| Per-agent color theming (not #3370FF) | /crew, /workspace, anywhere agents appear | Single brand blue. No agent-specific color tokens. |
| Completion ceremony on /workspace (confetti, stamp, celebration) | /workspace | "Done. 47s." one line. Period. |
| Hero score block replicated as page-opening anchor (not /home or /scan) | /scans list tab, /competitors, /inbox header | /home's hero is /home's. Other pages open on their primary content. |
| More than 5 hand-drawn empty-state illustrations | Any new page | Budget locked at 5. Text-only empty state on every other page. |
| /schedules calendar-Gantt or countdown-timer | /schedules | Sentence list or table. No visual time-axis. |
| Billing tab animation (plan card glow, shimmer, animated upgrade CTA) | /settings Billing | Static tabular rows. Mercury/Stripe discipline. |
| Radar/spider chart on /competitors | /competitors | Single-axis horizontal bar valid. Multi-axis implies data we don't have. |
| Agent persona avatar on /workspace | /workspace | Name + 14×14px monochrome icon. No avatar. Beamie deferred. |
| Tab-switch animation on /settings | /settings | Content swaps instantly. No slide transition. |
| Row-by-row staggered fade-in on any list | /inbox list, /scans table, /crew rows, /competitors | Lists appear. No row stagger. |
| Competitor logos in color (not monochrome 16×16px) | /competitors | Monochrome only. Logos are identifiers, not branding. |
| "Magic" / "Discover" / "Unlock" / "Powerful" in microcopy | All pages | Banned. Direct verbs. See MASTERLIST rule 3. |

---

## NEXT STEPS

After Adam reads this document, the intended flow is page-by-page conversation to lock each page in turn — same as the /home walkthrough. Adam accepts, overrides, or partially modifies each integrated move. Once all 10 pages are locked, the next phase is:

1. Visual design system consolidation — consolidating the color token set, type scale, and component primitives across all 10 pages into a single design system document
2. Chip-in-prose mechanic specification — since this mechanic appears on 4 pages (/crew per-agent, /settings Profile, /schedules, /reports white-label), it needs a single canonical spec that frontend developers implement once and reuse (the canonical spec is in this document above)
3. Rough.js/perfect-freehand specification — the 5 illustration slots + the courier flow + the tape perforations + the horizon line all use hand-drawn vocabulary; one spec governs all
4. RTL (Hebrew) implementation spec — mirroring rules, direction-aware animations, font substitutions (Heebo for Excalifont, Frank Ruhl Libre for Fraunces)
5. Visual register confirmation — the 4-register map above (editorial artifact / journey canvas / data intelligence / admin utility) must be confirmed by Adam before frontend begins, since it determines background colors and type choices at the component level

The visual design system cannot begin until the page-by-page locks are complete, because the distinct visual registers per page (cream paper, clinical table, tape ribbon, dissolution canvas) need to be settled first.

---

## MOBILE BEHAVIOR SUMMARY — Bottom nav 4 pages

Only /home, /inbox, /scans, and /crew appear in the bottom nav (locked). The remaining pages are in overflow. This affects how each page's distinctive move must degrade on mobile (375px–767px).

| Page | Mobile treatment of distinctive move |
|---|---|
| `/inbox` | 3-pane collapses to single column. Item list is full-screen. Tap item → push to full-screen Receipt view. Reasoning Receipt renders at full width (no pane split). J/K nav becomes swipe-left/right. |
| `/workspace` | Courier line shifts to left edge (16px margin), output text stacks below each completed station (not to the right). Single-column reading. Auto-scroll to center of active step is unchanged. |
| `/scans` | Tape ribbon goes full-width at 375px (no side canvas). 560px tape constraint is a wide-screen choice. Mobile tape is edge-to-edge with 16px horizontal padding inside segments. |
| `/competitors` | Rivalry Strips stack at full width. Strip height increases to 112px at mobile to preserve sparkline legibility. Verdict pill moves below the sparkline pair (not right-edge). Engine tabs become a horizontal scrolling tab row. |
| `/crew` | 2-column grid at 375px (18px gap). Card flip: tap front → full-screen back (slide-up panel, not Y-axis flip at mobile). Tap anywhere outside → dismiss back. |
| `/schedules` | Sentence builder at full width 375px. Chip bloom expands downward (not sideways). Prose wraps at narrower column. Table view toggle persists as a more natural mobile fallback. |
| `/settings` | Left-rail tabs become a horizontal top tab row (overflow scroll at mobile). Profile letter at full width 375px, chips stack on new lines when bloomed. |
| `/scan` | Already chromeless and single-column. URL input is full width. Engine pills wrap to 3-column grid at mobile. Score arc scales to 200px diameter. |
| `/onboarding` | Horizon bar at 80px height on mobile (not 120px). Station markers at 20px. Step content single-column full width. |
| `/reports` | 2-pane collapses to single-column stacked: cover preview at top (A4 aspect ratio, scaled to 375px width), config form below. "Press" button is full-width at bottom. |

---

## LOCKED DECISIONS HONORED (audit)

This section confirms that the synthesis does not contradict any prior locked decisions. Agents reading this document should treat the locks below as non-negotiable constraints; only Adam can override them.

| Decision | Source | Honored in this doc? | Notes |
|---|---|---|---|
| /scan public reveal: 15-17s, 10-frame storyboard | ANIMATION-STRATEGY-LOCKED / REFS-03 | Yes | Strikethrough-and-rewrite is Frame 3 content, not a new frame or new motion type |
| 5 hand-drawn empty-state illustration slots only | ANIMATION-STRATEGY-LOCKED §Follow-up A3 | Yes | All 5 slots allocated. No 6th proposed. |
| /crew first-visit skeleton-draw: localStorage-flagged, once-ever per device | ANIMATION-STRATEGY-LOCKED §Follow-up A1 | Yes | Still ships. Card backs are the recurring distinctive move; skeleton-draw is the one-time ceremony. |
| /reports first-visit: once per account (not per domain) | ANIMATION-STRATEGY-LOCKED §Follow-up A2 | Yes | Honored. Yossi's 20 domains share one unlock moment. |
| Topbar asterisk: every page, 1200ms breath | ANIMATION-STRATEGY-LOCKED §Follow-up A4 | Yes | Referenced on /workspace, /schedules, /reports generation |
| Hebrew/RTL path-draw: flip direction globally | ANIMATION-STRATEGY-LOCKED §Follow-up A5 | Yes | Referenced on /competitors, /onboarding, /scans |
| No skeleton-draw on /inbox, /scans, /competitors, /schedules, /settings | ANIMATION-STRATEGY-LOCKED | Yes | /scans tape unfurl is a content-level animation (same exception as /home sparklines), not skeleton-draw |
| /scans absorbs /archive as "Completed Items" tab | PAGE-LIST-LOCKED | Yes | Completed Items tab specified in /scans spec |
| /schedules renamed from /automation | PAGE-LIST-LOCKED | Yes | Used /schedules throughout |
| /home default landing, vertical scroll, no tabs | PAGE-LIST-LOCKED | Yes | Not touched — /home spec is already locked |
| Mobile bottom nav: /home, /inbox, /scans, /crew | PAGE-LIST-LOCKED | Yes | Not contradicted; /workspace, /competitors, /schedules, /settings in overflow |
| Primary accent: #3370FF (not orange, navy, cyan) | BRAND_GUIDELINES.md | Yes | #3370FF used for all chip colors, status chips, CTAs, path-draw active-state |
| Fonts: Inter, InterDisplay, Fraunces, Geist Mono, Heebo (HE), Frank Ruhl Libre (HE serif) | BRAND_GUIDELINES.md | Yes | Excalifont for hand-drawn register (locked in /home spec and /scan storyboard) |
| Pricing: Discover $79 / Build $189 / Scale $499 | DECISIONS.md / memory | Yes | /reports gated at Scale ($499) as specified in PAGE-LIST-LOCKED |
| scan_id (not scan_token) in URLs and DB | project memory | Yes | Referenced as `?scan_id=` param in /onboarding connections section |
| No n8n — direct LLM integration | project memory | Yes | Agent execution in /workspace is direct API, not orchestration layer |
| No Stripe — Paddle only | project memory | Yes | /settings Billing refers to "Paddle billing portal" |

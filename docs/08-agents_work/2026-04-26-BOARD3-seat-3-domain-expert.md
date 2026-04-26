# Board 3 — Seat 3: GEO Domain Expert

**Date:** 2026-04-26
**Seat:** Domain Expert (deep GEO / AI-search specialist)
**Context:** CEO removed engineering constraints. Build the dominating product. Surface the features only an expert would think to ship.

---

## Opening frame: what Frame 5 gets right and the layer it's missing

Frame 5 absorbed the structural critique brilliantly — single-character externally, lead attribution loop, Truth File, default-private. Those are *right*. But Frame 5 is a structural document, not a domain document. It tells you HOW Beamix should be packaged. It does not tell you WHAT Beamix should DO at the AI-engine layer that nobody else can.

The competitor audit (R1) makes the gap visible:
- Profound's moat is the **Prompt Volume dataset** — they know what queries actually run on AI engines.
- AthenaHQ's moat is the **ACE Citation Engine** — citation probability before publish.
- Peec's moat is the **agency workspace + 6 model picker** — operator workflow.
- Otterly's moat is **price + breadth** — cheap monitoring across 4 engines.
- Beamix's *intended* moat is **agents that execute**. That's correct but insufficient — competitors will copy execution agents within 6-9 months of seeing it work.

The dominating product needs a **second moat** that compounds. The execution-agent moat creates the wedge. The compounding moat is **proprietary AI-engine response intelligence** — and the agents have to be optimized for the specific retrieval, citation, and ranking dynamics of each engine. That's what this document specs.

---

## Section 1 — The AI Engine Coverage Strategy

Everyone in the category lists "engines." Nobody is honest about how *different* they are. The dominating product treats each engine as a distinct retrieval system with its own physics. Generic "engine count" is a marketing claim; engine-specific optimization is a moat.

### The 13 surfaces Beamix must cover at full vision

I'm splitting this from the typical "engines list" into **surfaces** — because the same LLM exposed through a different product (ChatGPT app vs ChatGPT API vs ChatGPT Search) behaves differently and cites differently.

| # | Surface | Retrieval model | Why it matters | Scan method |
|---|---|---|---|---|
| 1 | **ChatGPT (chat.openai.com, GPT-5 default)** | SearchGPT browse + memory + RAG over OpenAI's own crawl | The category-defining surface. ~900M WAU. | API + browser sim (anonymous + logged-in) |
| 2 | **ChatGPT Search** (the SearchGPT product surface) | Real-time Bing-augmented retrieval | Different citation patterns from chat — heavier on freshness | Browser sim |
| 3 | **ChatGPT Shopping** | Product knowledge graph + merchant feed | Critical for ecom SMBs, ignored by all competitors except Profound Enterprise | Browser sim + product feed verification |
| 4 | **Perplexity (default Sonar)** | Real-time web search + LLM ranker | Source-citation-heavy. Competitors think Perplexity = ChatGPT but the citation grammar is opposite. | API |
| 5 | **Perplexity Pro / Spaces** | Same retrieval, customer-customized indexes | B2B customers build private Spaces; appearing inside customer Spaces is a separate optimization | Manual + browser sim |
| 6 | **Google AI Overviews** | Google's MUM/Gemini layer over Google Search index | Largest reach (1.5B users). Citation grammar is closest to traditional SERP. | Browser sim with real Google profiles + geographic IPs |
| 7 | **Google AI Mode** (the new ChatGPT-competitor surface) | Conversational layer on Google Search | Behaves more like ChatGPT than AI Overviews | Browser sim |
| 8 | **Gemini app (gemini.google.com)** | Google AI + Workspace context | Diverges from AI Overviews — same model, different retrieval | API + browser sim |
| 9 | **Claude (claude.ai)** | Web search + Projects + Files | Lower volume but high-trust audience (developers, knowledge workers). Different citation pattern — Claude favors *authoritative* over *recent*. | API |
| 10 | **Microsoft Copilot (copilot.microsoft.com)** | Bing index + GPT | The "boring" engine; underrated reach via Windows + Edge defaults | Browser sim |
| 11 | **Grok (X)** | X corpus + web | Real-time / news-skewed. Critical for SMBs near current events (event venues, restaurants near festivals). | API |
| 12 | **Meta AI** (Instagram, WhatsApp, Facebook) | Meta's index + LLM | The mobile-only surface. Local SMBs whose customers live in WhatsApp/Instagram see queries here. | Browser sim |
| 13 | **You.com / Phind / Brave Leo / DeepSeek / Mistral Le Chat** | Various | Long tail. Coverage matters for "we monitor everything" claim. | API where available |

### The voice + agent surfaces (nobody is monitoring these — Beamix wins by being first)

| # | Surface | Status | Why this is the next moat |
|---|---|---|---|
| 14 | **Alexa+ (Amazon's LLM-powered assistant, GA 2026)** | Live | Local commerce queries flow through Alexa+ on Echo Show. Nobody monitors. |
| 15 | **Siri (Apple Intelligence + ChatGPT fallback)** | Live | Asks "find a plumber near me" route through Siri → on-device → ChatGPT/Google fallback. Three-stage retrieval. |
| 16 | **Google Assistant (Gemini-backed)** | Live | Voice queries on Android/Nest. |
| 17 | **ChatGPT Atlas / Operator (agent-mediated browsing)** | Beta | When AI agents shop FOR users, the optimization is different — they consume schema and structured data, not prose. |
| 18 | **Anthropic Computer Use / Claude in browsers** | Beta | Same agent-mediated model. |
| 19 | **Visual / multimodal AI search** (Google Lens AI, GPT-5 vision, Gemini Live) | Live | Image-anchored queries — "what restaurant is in this photo?" — return totally different results. |

**Why this matters:** Profound covers 10+ engines but **zero voice or agent surfaces**. AthenaHQ covers 8 chat engines but **none of the voice/multimodal layer**. The dominating product covers 19 surfaces. The marketing line writes itself: *"Beamix is the only platform that monitors how AI sees you across chat, voice, vision, and agent-mediated browsing."*

### Scan method per engine — the technical reality nobody talks about

The naive approach is "use APIs." That fails because:

1. **Most consumer surfaces have no API** that returns the citation list a real user sees. ChatGPT API ≠ chatgpt.com behavior. Gemini API ≠ AI Overviews. You must scrape the consumer surface.
2. **Geography matters.** AI Overviews returns different content for queries from Brooklyn vs Tel Aviv vs Berlin. A US-based scraper won't see what a customer's prospects see.
3. **Personalization drift.** ChatGPT memory + Custom Instructions changes citations. Need cold-context (logged-out incognito) AND warm-context (persistent profile) scans.
4. **Rate limiting + IP rotation.** Scraping ChatGPT at scale requires residential IP pools, browser fingerprinting, and CAPTCHA-solving infrastructure. This is real engineering — Otterly fakes it; Profound enterprise has it.
5. **Multi-turn behavior.** A query like *"what's the best plumber in Brooklyn"* often surfaces the brand on turn 3 (after follow-up *"that's expensive, who else?"*). Single-turn scans miss this entirely.

### The data shape per engine (what Beamix stores per scan)

Most competitors store a flat record: `{engine, query, rank, mentioned}`. The dominating product stores a **citation envelope**:

```
ScanRecord {
  surface: "chatgpt-search" | "perplexity" | ...
  geography: ISO city + country
  profile: "cold" | "warm-customer-persona-1"
  query: full text
  query_intent: classified (informational/commercial/local/...)
  query_frame: classified (comparison/recommendation/troubleshoot/...)
  turn: 1 | 2 | 3 (multi-turn position)
  full_response: the entire LLM answer
  citations: [{url, anchor_text, position, sentence_context, sentiment}]
  brand_mentions: [{position, sentiment, context, modifier_phrases}]
  competitor_mentions: [{brand, position, sentiment, context}]
  ranking_position: where in the list of mentions
  citation_pattern: "exact-quote" | "paraphrase" | "url-only" | "list-item"
  freshness_signal: dates referenced in the response
  retrieval_signature: hash of the retrieval pattern (which sources clustered)
  raw_html: the rendered surface (for replay)
  scan_cost: API/browser-second cost
}
```

That envelope is what makes everything downstream possible — citation prediction, pattern divergence, multi-turn optimization, retrieval-cluster analysis. **No competitor stores at this fidelity.** Building this dataset *is* the moat.

### Freshness requirements per engine

- **Real-time engines** (Perplexity, Grok, Google AI Mode, ChatGPT Search): scan **daily**. They cache for hours, not weeks.
- **Crawl-based engines** (ChatGPT default, Claude default, Gemini app): scan **weekly**. Their training/cache cycles are slower.
- **AI Overviews**: scan **2-3x weekly** — Google rolls AI Overviews in/out of queries unpredictably.
- **Voice surfaces**: scan **monthly** — they're stable and expensive to scan.
- **Agent-mediated browsing**: scan **on schema change** — agents only re-read when schema/structured data changes.

This per-engine freshness logic is invisible engineering work that customers will never see, but it's what makes the data trustworthy. Sarah doesn't know why her dashboard updates Tuesday morning — she just knows it's correct.

---

## Section 2 — The 11 Agents at full vision

The current agent list reads like a lightly-rebranded SEO toolkit. The dominating product expands each agent into a **specialist with deep domain depth**. Below: current scope (Frame 5 implied) → full-vision scope → 2-3 distinctive capabilities no competitor will have.

### Agent 1 — Schema Doctor

**Current scope:** Add basic JSON-LD (LocalBusiness, FAQ, Organization).

**Full-vision scope:** Multi-vocabulary structured-data orchestrator covering Schema.org, Open Graph, OpenAI's emerging `llms.txt`, Anthropic's recommended manifests, Perplexity's source schema requirements, and vertical-specific schemas (MedicalCondition for healthcare, MenuItem for restaurants, Service+Area for trades).

**Distinctive capabilities:**
1. **Schema collision detection.** When two CMS plugins both emit Organization schema with different fields, AI engines silently de-rank. Beamix detects, merges, and writes a single canonical version. *No competitor does this — it requires DOM traversal of the rendered page, not just source analysis.*
2. **Schema A/B testing against AI engines.** Beamix can deploy schema variant A on 50% of pages and variant B on the other 50%, then measure which variant gets cited more by Perplexity/ChatGPT over 14 days. **The first GEO product with experimental rigor at the schema layer.**
3. **`llms.txt` and AI-crawler manifest generation.** As OpenAI/Anthropic publish crawler conventions (`llms.txt`, `gptbot.txt` policies, etc.), Schema Doctor maintains them automatically with the customer's preferences.
4. **Speakable schema** for voice surfaces — generates the 30-second-readable summary fields Alexa+/Siri pull from.

### Agent 2 — Citation Fixer

**Current scope:** Rewrite content to be more "AI-friendly."

**Full-vision scope:** Per-engine content variant generator. Different LLMs cite different *patterns*. ChatGPT favors lists with bolded keyphrases. Perplexity favors single-sentence factual claims with named-entity density. Claude favors authoritative sources with explicit dates and numerical specificity. Gemini favors structured comparisons.

**Distinctive capabilities:**
1. **Quotable-passage engineering.** Beamix identifies the 3-5 sentences on each page most likely to be quoted by an AI engine, and rewrites them to be self-contained, named-entity-dense, and rank-stable. This is a craft skill — the rules are: subject-first construction, no pronoun ambiguity, embedded entity, qualifying number, recent date. *Athena does a basic version; the dominating version has per-engine variants.*
2. **Per-engine variants on the same page.** Using `<meta>` directives and crawler-specific delivery, Beamix can serve a slightly different schema/microcontent variant to GPTBot vs PerplexityBot vs ClaudeBot. **Borderline gray-hat; needs to be a customer-controlled toggle with full disclosure.**
3. **Question-anchored content blocks.** Every "Citation Fixer" change includes an `<H2>` formed as the question that AI engines actually ask, sourced from the Prompt Volume dataset (see Section 4).

### Agent 3 — FAQ Agent

**Current scope:** Generate FAQ content for the homepage and service pages.

**Full-vision scope:** Long-tail question discovery + multi-turn anticipation engine. The FAQ Agent doesn't write generic FAQs — it writes the *follow-up* questions a real user asks an AI engine after the initial one.

**Distinctive capabilities:**
1. **Multi-turn FAQ ladders.** Customer types "find a plumber in Brooklyn." AI engines respond. User types "how much do they charge for emergency calls?" Beamix's FAQ Agent generates the answer to *that* follow-up, knowing it's the highest-leverage question for citation on turn 2. This is **multi-turn GEO** — invisible to single-query competitors.
2. **Voice-search question patterns.** Voice queries are longer and more conversational ("hey siri, who fixes burst pipes near me at night"). FAQ Agent generates a separate FAQ block tuned for voice phrasing — placed in speakable schema.
3. **Negative FAQ entries.** Sometimes the right move is *not* answering a question (because answering it surfaces a competitor or commits to a policy). FAQ Agent flags these and proposes a redirect — "this FAQ would harm you; here's a better question to answer instead."
4. **Hebrew + Arabic FAQ generation** with native question-form patterns (Hebrew interrogatives are syntactically different — *מה / איך / כמה* — and Beamix uses the right one for the engine's training distribution).

### Agent 4 — Competitor Watch

**Current scope:** Tell the customer when a competitor is cited more.

**Full-vision scope:** Competitor intelligence layer at the AI-engine, content, schema, and backlink levels — operating across the full citation envelope.

**Distinctive capabilities:**
1. **Citation-pattern divergence reports.** "Joe's Plumbing is being cited 3x more than you on emergency queries because their FAQ uses the phrase 'available 24/7' which matches the engine's retrieval cluster on this query. You use 'around-the-clock service' which doesn't cluster." This is **retrieval-cluster analysis** — directly explaining WHY a competitor wins, not just THAT they win. *No competitor explains the mechanism.*
2. **Content publication monitoring.** Beamix watches competitors' sitemap changes and pings the customer when a competitor publishes something likely to take share. (The customer can preempt by publishing a counter-asset before the engine re-crawls.)
3. **Backlink + PR shift detection.** When a competitor gets cited by a high-authority source (industry publication, Wikipedia, Reddit), AI engines re-weight. Beamix tracks the inbound citation graph weekly.
4. **SERP-feature tracking + AI-engine-feature tracking unified.** When a competitor wins the Featured Snippet AND the AI Overview, that's a compounding signal Beamix surfaces.

### Agent 5 — Content Refresher

**Current scope:** Keep existing content updated.

**Full-vision scope:** Decay-aware content lifecycle manager. AI engines weight freshness differently — Perplexity heavily, Claude almost not at all. Content Refresher manages a content portfolio across decay curves.

**Distinctive capabilities:**
1. **Per-engine decay curves.** Beamix learns the freshness-decay coefficient per engine per query type and refreshes accordingly. A page about pricing? Decays fast on Perplexity, slow on Claude. A page about how-it-works? Decays slowly everywhere.
2. **Date-stamping that LLMs trust.** AI engines have learned to mistrust unsupported "Updated 2026" claims. Content Refresher adds *evidence-bound* date stamps — "Updated April 2026 with new pricing reflecting January 2026 supply-chain changes" — which the engines parse as authoritative.
3. **Cannibalization-aware refresh.** When the customer has 3 pages on overlapping topics (the SEO classic), refreshing one improves it but cannibalizes the others. Content Refresher chooses which to refresh, which to consolidate, and which to deprecate (with proper redirects).

### Agent 6 — Trend Spotter

**Current scope:** Surface trending topics in the customer's industry.

**Full-vision scope:** Forward-looking query-demand intelligence — *"here's what people will be asking your AI engines next month, here's why, here's the content to publish before the wave."*

**Distinctive capabilities:**
1. **Cross-platform query demand fusion.** Beamix fuses signals from Reddit (early adopters), Google Trends (mainstream), Quora/Stack Exchange (long-tail), TikTok search (Gen-Z lead indicator), and the platform's own AI-engine query dataset. This produces a 30-day-forward query demand forecast per vertical. *Profound's Prompt Volume is retrospective; Beamix's is predictive.*
2. **Seasonal + event-correlated trend detection.** A locksmith in NYC should publish "frozen lock car" content in November, not December. Trend Spotter knows the lead time per query.
3. **Emerging-engine awareness.** When a new AI surface launches (e.g., a new Anthropic product or Apple Intelligence feature), Trend Spotter is the agent that fires the alert: *"Apple shipped Apple Intelligence in iOS 26 last week. Your top 3 queries are now answered by Siri+ChatGPT. We need to optimize for that surface — here's the plan."*

### Agent 7 — Brand Voice Guard

**Current scope:** Make sure agent-generated content sounds like the brand.

**Full-vision scope:** Brand-voice fingerprinting + cross-agent enforcement + drift detection.

**Distinctive capabilities:**
1. **Statistical voice fingerprint.** Beamix builds a numerical fingerprint from the customer's existing content: sentence-length distribution, formality score, hedging frequency, use of contractions, signature phrases, prohibited phrases, punctuation tics. Every agent's output is checked against the fingerprint before publication. **Pre-publication validation #2 from Frame 5.**
2. **Cross-language voice preservation.** When generating Hebrew variants, Brand Voice Guard maps the English fingerprint to the Hebrew equivalent — formality scales differently in Hebrew (תה/את vs את ה-, formal/informal address) and Beamix gets it right.
3. **Voice-drift alerts.** If the customer's own newly-published content drifts from the established fingerprint (intern wrote a blog post, marketing agency rewrote the homepage), Beamix flags it: *"This new page sounds 18% more corporate than your usual voice. Confirm or revert?"*

### Agent 8 — Citation Predictor (Scale only)

**Current scope:** Predict citation probability for new content.

**Full-vision scope:** This is the highest-leverage agent and deserves expansion to the *citation simulator*.

**Distinctive capabilities:**
1. **Per-engine pre-publish citation probability.** For every piece of content the customer (or another agent) is about to publish, Citation Predictor returns: *"68% probability of being cited by ChatGPT for query cluster X, 41% by Perplexity, 12% by Claude. Top reasons for the gap: missing entity density (Claude), missing date specificity (Perplexity)."* AthenaHQ has a basic version; the dominating version is **per-engine, per-query-cluster, with explanation.**
2. **Counterfactual editor.** Customer types a sentence; Beamix shows the citation probability live. Customer revises; probability updates. **Like Grammarly for AI citation.** The first such tool to ship will own a category line.
3. **Publish-or-rewrite gate.** Below a threshold (say 30% probability), the agent refuses to publish and forces revision. This is what makes Beamix's "agents that execute" actually safe — every publish has a quality gate.

### Agent 9 — Local SEO Specialist

**Current scope:** Optimize Google My Business + local citations.

**Full-vision scope:** Multi-platform local presence orchestrator across GBP, Apple Maps, Bing Places, Yelp, Foursquare, Waze, plus AI-engine local layers (ChatGPT's local cards, Perplexity's local results, AI Overviews local pack).

**Distinctive capabilities:**
1. **NAP consistency at AI-engine layer.** Most local SEO tools check NAP across directories. Beamix checks it across **AI-engine retrieval signatures** — i.e., when ChatGPT cites the business, does it cite the right phone number? If not, why? Where's the bad data living?
2. **Service-area-graph optimization.** A plumber serves 12 neighborhoods. Beamix generates the right neighborhood-level FAQ + schema for each, optimized so that "plumber in Park Slope" returns the customer in ChatGPT. This is **programmatic local GEO**.
3. **Review-mining for Truth-File generation.** Local Specialist reads the customer's own Google reviews to extract the questions real customers asked, the words they used, and the services they mentioned — feeding the Truth File and FAQ Agent.

### Agent 10 — Trust File Auditor

**Current scope:** Validate the customer's Truth File.

**Full-vision scope:** Living Truth File with continuous validation against the world. Truth Files go stale — hours change, services expand, prices update. This agent keeps it real.

**Distinctive capabilities:**
1. **Real-world consistency check.** Beamix scrapes the customer's own website, GBP, Yelp, social, and AI-engine citations for facts about the business. When facts disagree, it surfaces: *"Your website says 24/7. Your Yelp says 8am-6pm. ChatGPT thinks you close at 5pm. Which is right?"* The agent gets the truth and propagates the fix.
2. **Hallucination harvest.** When AI engines hallucinate facts about the business ("Joe's Plumbing was founded in 1987" — actually 1992), Trust File Auditor catches it and pursues correction (publish corrective content, update Wikipedia if applicable, file feedback to engines that accept it).
3. **Compliance flagging for regulated verticals.** Healthcare → HIPAA-aware fact set. Legal → bar-association-aware claims. Financial → SEC-aware promises. Different verticals have different *prohibited* claims; Auditor blocks them at the source.

### Agent 11 — Reporter

**Current scope:** Generate the Monthly Update.

**Full-vision scope:** Multi-audience narrative engine. Reporter generates: Sarah's monthly update (lead-attribution headline), her CEO's quarterly board slide, Yossi's white-label client update, and a per-stakeholder narrative version.

**Distinctive capabilities:**
1. **Counterfactual narrative.** "If we hadn't published the FAQ on emergency calls, we estimate 14 fewer calls this month." Reporter doesn't just report; it estimates the lift the customer wouldn't have seen otherwise. *No competitor does counterfactual lift calculation for SMBs.*
2. **Per-audience rewrites.** The CEO version has dollar lift estimates. The Sarah version has "what we did + what's next." The Yossi-to-his-client version has white-label + retainer-justification framing.
3. **Time-of-month narrative selection.** Reporter knows which month-on-month pattern to highlight: a strong month leads with growth; a weak month leads with the leading indicators that predict next month's recovery.

---

## Section 3 — NEW agents the dominating product needs

The 11 named agents cover content, schema, FAQ, competitor, trend, voice, prediction, local, trust, reporting. They miss surfaces and modalities that the dominating product *must* serve.

I'd ship these 7 new agents at full vision. Each is justified by a real GEO pattern competitors haven't named.

### NEW Agent 12 — Voice AI Optimizer

Voice queries are routed through Alexa+, Siri (with ChatGPT fallback), and Google Assistant (Gemini-backed). The optimization is fundamentally different from text:
- Speakable schema is mandatory (and most sites don't have it)
- The 30-second-readable summary matters (LLMs literally read it aloud)
- Voice queries are longer, more conversational, more local
- Voice citations don't show URLs — only the brand name is heard, so brand-name density matters

**Justification:** When mom asks Alexa "find a plumber" and the answer says "Joe's Plumbing," Joe wins the call without a click. Sarah needs to win that audio surface — and nobody is optimizing for it.

### NEW Agent 13 — Visual / Multimodal Optimizer

Google Lens AI, GPT-5 vision, Gemini Live, Pinterest Lens — image and video search through AI engines is exploding. Customer takes a photo of a leaky pipe; AI suggests a plumber. Customer points camera at a restaurant facade; AI says "this is X, here's the menu."

**Optimization layer:**
- Image alt-text optimized for vision-LLM caption matching
- Video transcript optimization (multimodal LLMs read transcripts heavily)
- Schema image properties (ImageObject with author, license, captions)
- "Identifiable surface" optimization — does the customer's storefront look distinctive enough to be matched by Google Lens?

**Justification:** This is a 5-year inevitability and a 2-year wedge. Beamix is first.

### NEW Agent 14 — Agent-Mediated Browsing Specialist

ChatGPT Atlas, Anthropic Computer Use, OpenAI Operator, Claude in browsers — AI agents now *visit websites for users*. They consume different signals than humans:
- They prioritize structured data over visual design
- They follow `llms.txt` and similar manifests
- They *read* the page rather than skim it (so dense, factual content wins)
- They handle forms — a "Schedule call" form needs to be machine-completable

**Optimization layer:**
- Machine-readable booking endpoints
- llms.txt manifest with concise business overview
- Structured contact information that an agent can fill into a form
- Anti-friction patterns (no CAPTCHAs that block legitimate AI agents; clear bot-allow policies)

**Justification:** When users start delegating shopping and research to AI agents, the optimization shifts from "convince the human" to "convince the agent." Beamix prepares customers for the next interaction model.

### NEW Agent 15 — Long-form Authority Builder

The single highest-impact GEO move is **publishing pillar content under the customer's domain** that AI engines treat as authoritative. Most SMBs can't write this content. Beamix does it.

**What it does:**
- Generates 2,000-4,000-word pillar pieces (vertical-specific)
- Includes embedded citations to industry sources, original data, and the customer's own Truth File facts
- Publishes under the customer's brand with full disclosure controls
- Tracks pillar-piece citation lift for 6+ months post-publish

**Justification:** This is what $5,000/mo SEO retainers actually do. Beamix at $189/mo doing this autonomously is a 25x value compression. The Build-tier value proposition is incomplete without it.

### NEW Agent 16 — Reputation Defender

Negative AI citations are the existential threat nobody talks about. ChatGPT can hallucinate that a customer's business is closed, has bad reviews, or charges too much — even if it isn't true. The customer can't see this happening unless they ask.

**What it does:**
- Continuous scan for negative-sentiment citations across all 19 surfaces
- Categorizes severity (factual error vs reputation hit vs legal-exposure)
- Auto-drafts response strategies: corrective content publication, Wikipedia edit (if relevant), direct feedback submission to engines that accept it, response to underlying review/source
- Escalation to human review for legal-grade cases

**Justification:** Trust & Safety identified "AI engine misrepresenting customer" as a death-class risk. Reputation Defender is the agent that catches it. Pairs with Trust File Auditor.

### NEW Agent 17 — Industry Knowledge Graph Curator

This is the platform-level moat agent. It maintains the **vertical-specific knowledge graph** that all other agents draw from (see Section 5 for full description). It runs at the platform layer, not per-customer.

**What it does:**
- Maintains a graph of vertical entities (services, products, regulations, common questions, top-cited sources)
- Updates daily as engines re-crawl and publication patterns shift
- Provides retrieval context to every customer's per-vertical agent
- Surfaces "industry trends" to all customers in that vertical

**Justification:** This is how Beamix avoids the competitor-clones-us-in-9-months trap. The graph compounds with customer count and is genuinely defensible.

### NEW Agent 18 — Prompt Engineering Coach (customer-facing)

Many SMB owners are using AI tools themselves now. They're typing prompts into ChatGPT/Claude for marketing tasks. The Coach helps them write *prompts that surface their own brand* in their own AI use AND in the AI use of customers/partners.

**What it does:**
- Generates "prompt templates" the customer uses on their own
- Teaches the customer how to structure questions to AI engines about their industry
- Provides the customer with shareable prompts they can give to their own customers/partners ("ask ChatGPT this question — you'll find us at the top")

**Justification:** This is the highest-engagement feature you'll build. SMB owners are dying to use AI better. Beamix becomes their AI literacy coach as a side effect of GEO.

---

## Section 4 — The Predictive Layer

Reporting is rear-mirror. Optimization is steering. **Prediction is the road ahead** — and it's where the dominating product creates compounding leverage.

### 1. Citation Probability Pre-Publish (per engine, per query cluster)

The Athena ACE feature is a basic N-gram match against retrieved patterns. The next-generation version is fundamentally different:

- **Embedding-similarity scoring** between draft content and the engine's retrieved pattern for the target query cluster (Beamix has the actual responses, having scanned them)
- **Counterfactual scoring**: "if you change this sentence to X, probability rises from 41% to 68%"
- **Per-engine forecast**: same content, different probability per engine — explained
- **Confidence interval**: "61% ± 8% — based on 14 prior similar publications in this vertical"

This becomes *Citation Predictor on every publish*, not a separate Scale-tier feature. The model trains on Beamix's proprietary scan dataset.

### 2. Score Trajectory Forecasting

Customer asks: "where will my AI visibility score be in 3 months?" The dominating product answers with a trend curve, confidence interval, and the 3 levers most likely to improve or worsen it.

**The model uses:**
- Historical score for the customer (n=12+ weeks)
- Industry baseline trend (vertical-level)
- Competitor moves (if they publish, scores shift)
- Engine-update signals (if ChatGPT 5.5 releases, retraining shifts patterns)
- Beamix's own action queue (planned publications + their predicted lift)

This is the customer-facing renewal tool: *"You're trending to a score of 72 by end of Q2. If we execute the recommended FAQ pillar, that becomes 81."*

### 3. Competitor-Move Forecasting

If Joe's Plumbing has been publishing 2 pieces of pillar content per month, and 90% of those have been about emergency plumbing, the next one is likely on emergency plumbing too. Beamix predicts and recommends a **counter-publication** before Joe's piece gets indexed.

**Inputs:** competitor publication cadence, topic clustering, social-signal early-indicators, hire-signals (LinkedIn — if they hired a content marketer last month, expect 3x cadence), backlink-pattern shifts.

### 4. AI-Engine Update Impact Forecasting

When OpenAI ships GPT-5.5 (or Anthropic ships Claude 5, or Google rolls out a new AI Mode), retrieval patterns shift overnight. Beamix's scan dataset (since it's proprietary and continuous) detects the shift within hours.

**The agent action:** "Yesterday's GPT-5.5 release shifted retrieval toward longer-form content with explicit headings. 14% of customers in the home-services vertical lost share. Recommended action: 3 customers in your portfolio should add the H2 patterns we've identified. Beamix can do this for you."

This is **the news-style alert that converts free-tier signups**. Beamix becomes the must-read GEO authority — in the product itself.

### 5. Query-Trend Forecasting (vertical-specific)

Per Section 3 / Agent 6 — fused query-demand forecasting that says "queries about heat-pump installation are trending up 240% in NJ for May; here's the content to publish in March."

**The data sources:** Reddit, Google Trends, the platform's own AI-engine query corpus, news cycles, weather forecasts (yes — locksmiths spike on cold weeks), seasonal patterns, demographic shifts.

### Why this layer matters

Predictive features convert customer behavior from *reactive* (looking at last week) to *proactive* (acting on next month). That shift is what justifies $189/mo over a $29 monitoring tool. The predictive layer is the upmarket lever.

---

## Section 5 — The Vertical Intelligence Layer

The biggest underbuilt feature in GEO is **vertical intelligence**. Plumbers are not boutique B2B SaaS. Healthcare clinics are not restaurants. Each vertical has:
- Different query patterns (commercial intent shapes vary)
- Different authoritative sources AI engines weight (medicine: PubMed/CDC; trades: Angi/Yelp; SaaS: G2/Capterra)
- Different schema requirements
- Different compliance constraints
- Different competitor sets
- Different content idioms

Generic GEO tools treat all of these the same. The dominating product treats them as separate practices.

### The Industry Knowledge Graph (the crown jewel)

A platform-level dataset Beamix maintains per vertical, containing:
- **Top 5,000 queries** in the vertical (sourced from real AI-engine scans across all customers + open data)
- **Retrieval-cluster map** per query cluster (which sources cluster together in AI-engine retrieval)
- **Authority sources** ranked by engine-citation-frequency (medicine has PubMed, trades have Angie's List, restaurants have Eater)
- **Vocabulary fingerprint** (the words AI engines associate with the vertical — "flow" vs "pour" vs "throughput" matters)
- **Compliance constraint set** (per-vertical legal/regulatory boundaries)
- **Common Truth File schema** (what facts a healthcare clinic always needs vs a plumber)
- **Competitor universe** (top 100 brands operating in that vertical)
- **Schema requirements** specific to the vertical (MedicalCondition, Service, MenuItem, Course, Event, etc.)

Beamix maintains a separate Knowledge Graph for at least these verticals at full vision:
- Local home services (plumbers, electricians, HVAC, locksmiths)
- Local healthcare (dentists, dermatology, physical therapy, primary care)
- Local food + beverage (restaurants, cafes, bakeries)
- Local professional services (lawyers, accountants, financial advisors, real estate)
- Local fitness + wellness (gyms, yoga, spa)
- Local automotive (auto repair, dealerships, body shops)
- E-commerce SMB (DTC product sellers)
- Boutique B2B SaaS
- Hospitality (hotels, B&Bs, vacation rentals)
- Education (tutors, language schools, music teachers)
- Creative services (photographers, designers, writers)
- Trades + construction (general contractors, painters, landscapers)

Each graph is built by **scanning at launch with 50+ test customers**, then maintained continuously.

### Vertical-specific Brief templates

The Brief is a generic 1-paragraph today. The dominating version has 12+ vertical templates. Plumber Brief includes "emergency response time." Dentist Brief includes "insurance accepted." SaaS Brief includes "integrations supported." This isn't cosmetic — it's a different *strategy* per vertical.

### Vertical-specific agent specializations

Each agent has a vertical mode:
- **Healthcare-Schema-Doctor**: emits MedicalCondition schema with HIPAA-aware data minimization
- **Legal-FAQ-Agent**: generates FAQ entries that are compliant with bar-association advertising rules per state
- **Restaurant-Schema-Doctor**: emits MenuItem schema with allergen/dietary attributes the new AI search surfaces care about
- **SaaS-Citation-Fixer**: optimizes for G2/Capterra citation patterns rather than Yelp
- **Trades-Local-Specialist**: optimizes for Angie's/Thumbtack rather than Yelp; optimizes for service-area schemas

This is invisible to the customer — they just turn on Beamix and get the right specialist. It's enormous engineering effort hidden behind a Brief approval click.

### Vertical-specific Truth File requirements

A plumber's Truth File is short: hours, service area, services list, license number, emergency availability.

A dentist's Truth File is long: hours, services, insurances accepted, languages spoken, specialty board certifications, ADA compliance, accepted payment methods, sedation options, emergency policy.

A restaurant's Truth File is different again: cuisine, hours by day, reservations policy, dress code, menu URL, allergen handling, alcohol service, accessibility, parking.

The dominating product knows what to ask per vertical and adapts the onboarding form. **A SaaS Truth File should never ask about "service area."**

### Vertical-specific competitor sets

Beamix arrives at signup with the top 20 competitors **already populated for this customer's vertical and zip code**. Sarah doesn't have to type names. The first scan runs against a meaningful peer set, not an empty list.

### The "Beamix for X" sub-brand path

This is the GTM unlock. Once vertical knowledge graphs exist, Beamix can spin up vertical-specific marketing surfaces:
- **beamix.tech/plumbers** — landing page with plumber-specific copy, plumber-specific case studies, plumber-specific Brief
- **beamix.tech/dentists** — same for dental
- **beamix.tech/saas** — same for SaaS

This is **programmatic SEO + vertical specialization** as a single GTM motion. Each landing page ranks for "GEO for [vertical]" queries. The vertical wedge feeds itself.

The Operator's "first-100-customers vertical wedge" choice (Frame 5 Open Question 2) is just *which knowledge graph to build first*. The architecture supports all of them — the wedge is which one to invest in first.

---

## Section 6 — The Year-3 Deeply-Engaged Customer

Sarah at year 3 is not Sarah at month 1. She has 3 years of scan data, 36 monthly updates, 144 approved fixes, hundreds of citation events, and a CEO who now expects the renewal as routine. The dominating product builds for her, not just for the trial.

### House Memory as a queryable archive

Today: scans pile up in `/scans`. At year 3, that's 156 weekly scans + 36 monthly updates + thousands of citations. Sarah needs to be able to ask:
- *"When did our citation rate on emergency queries first start improving?"*
- *"Which fix had the biggest impact on Perplexity?"*
- *"What did Beamix say about Joe's Plumbing in February?"*

**House Memory becomes a natural-language interface over the customer's own history.** Powered by an embedding index over every action, scan, and Brief change. This is a **proprietary RAG over Sarah's own life with Beamix**.

### Year-over-year trend visualization

The visualization most missing in competitor products: 24+ months of citation share, broken out by engine + query cluster + vertical-baseline. Showing year-over-year deltas at a glance.

### Custom KPI dashboards

Year-3 Sarah has specific metrics she cares about — maybe it's "calls from Brooklyn" or "emergency-query share on Perplexity" or "competitor X overtake count." The dominating product lets her build a **custom dashboard** of her own.

### Workflow customization

Year-3 Sarah trusts Beamix on schema (she always approves). She doesn't trust Beamix on FAQ wording (she always edits). The dominating product learns this pattern and offers per-agent autonomy customization: *"You always approve Schema Doctor changes. Want me to auto-apply going forward, no review?"* Yes → review-debt counter relaxes for that agent.

### Slack/Teams integration

For year-3 Sarah, Beamix lives in Slack. Beamix posts the Monday Digest there. Beamix DMs urgent items to the channel. Beamix accepts approval-by-emoji-reaction. This is a **distribution + retention multiplier** that nobody in GEO has shipped.

### API for custom integrations

By year 3, Sarah's marketing stack has matured. She wants Beamix data in HubSpot, in Google Data Studio (Looker), in her CRM. Beamix offers a clean REST + webhooks API, plus prebuilt connectors. This is table-stakes by year 3 — but Beamix should ship it at year 1 for customers who want it.

### White-label for client work (Yossi's path — but also Sarah's secondary income)

Year-3 Sarah is sometimes asked by friends ("can you help my brother's pizza shop?"). The dominating product lets Sarah upgrade to Agency tier, white-label, and offer GEO services to her network — without Beamix taking the relationship. **Sarah becomes a Beamix advocate AND a Beamix reseller.** The line between Sarah and Yossi blurs at year 3.

### Predictive maintenance — proactive flags

Year-3 Sarah trusts Beamix to *just handle it*. The product surfaces:
- *"Your citation rate is trending down 8% over the last 3 weeks on Perplexity. Beamix has 4 candidate causes. Beamix is testing #1 right now. Will report back Wednesday."*

This is the **product as an autonomous operator** — the agent doesn't wait for Sarah to notice; it notices first and acts.

### Account-level features Sarah expects at year 3

- **Multi-user seats** (Sarah's marketing manager joined; needs view-only access)
- **Audit log** (what changed, when, by whom — including which Beamix agent)
- **Compliance export** (when Sarah's lawyer asks "did Beamix touch our HIPAA-relevant pages last year," Beamix produces a clean report)
- **Backup + version history** (every change Beamix made has a one-click revert, even years later)
- **Enterprise SSO option** (if her business gets acquired or she joins a network)

These features are not glamorous; they are **what year-3 Sarah quietly relies on**, and what makes her renewal feel like a non-decision.

### The 5-year customer

Beyond year 3, Sarah's relationship with Beamix is no longer transactional. She doesn't compare to alternatives. Beamix is **infrastructure**. The dominating product builds for that — boring reliability, predictable value, audit-grade memory. The product disappears into the background. That's the highest form of product-market fit.

---

## Section 7 — Three questions for the other 3 board seats

### Q1 to Seat 1 (CEO/strategic synthesizer)

The 19-surface coverage spec in Section 1 (chat + voice + visual + agent-mediated) is a 2-3x engineering investment over the 11 engines Frame 5 implies. **Are we actually building voice/visual/agent-surface coverage in MVP-1, or is that MVP-2?** Because if voice is MVP-2, we should still *architect for it now* (the scan envelope and engine adapter pattern need to support it from day one), and the marketing claim shifts from "we monitor everything" to "we monitor what matters today + we're building toward the next surface." The category positioning hinges on this answer.

### Q2 to Seat 2 (the customer/operator voice)

The vertical intelligence layer (Section 5) is **the single biggest engineering investment** I'm proposing — 12 knowledge graphs, vertical-specific agent specializations, vertical Truth File templates. But it's also **the only thing that produces a category-defining product** at the SMB level (because generic GEO is becoming commoditized fast). **At what point in the customer's journey does she actually feel the vertical intelligence?** Is it onboarding (pre-populated competitors)? First Brief (vertical-specific phrasing)? Month 3 (after enough data accumulates)? I want to make sure we're not building a moat that's invisible in the trial — because if the moat is invisible at month 1, we never get to month 3.

### Q3 to Seat 4 (the futurist / second-order thinker)

The predictive layer (Section 4) — citation probability, score trajectory, competitor-move forecasting, engine-update impact — depends entirely on Beamix accumulating a **proprietary AI-engine response dataset** before competitors do. Profound has a 2-year head start at the enterprise tier; AthenaHQ has a basic version. **What's the data-velocity strategy that lets Beamix close the gap and compound past them?** Specifically: should we run "shadow scans" on free-tier signups (running additional engines/queries beyond what the customer paid for, to fill out the platform corpus)? Should we launch a free public tool — `beamix.tech/check-my-site` — that runs scans against everyone, even non-customers, just to enrich the dataset? And what does it cost in raw scan-spend (residential proxies, API calls) to reach data parity with Profound at year 2?

---

## Closing

The dominating product is not "11 agents that do SEO things for AI search." That's a feature list. **The dominating product is a vertical-specialized, multi-surface (chat + voice + visual + agent), predictive AI-search platform that compounds a proprietary response dataset and operates with a per-engine, per-vertical specialist roster.**

Frame 5 has the right structural skeleton (single-character externally, lead-attribution loop, Truth File, default-private). This document specs the **specialist depth that goes inside the skeleton** — what each agent must actually be, what surfaces must actually be covered, what data must actually be collected, what predictions must actually be made, and what the year-3 customer actually needs.

The execution-agent moat is the wedge. The data + vertical + predictive layer is the compounding moat. Build both. The first survives 6-9 months of competitor copying. The second compounds for 5+ years.

That's the dominating product.

— Domain Expert (Seat 3, Board 3)

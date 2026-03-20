# Beamix System Design: AI & Intelligence Layer

> **Author:** Sage (AI Engineer)
> **Date:** March 2026
> **Scope:** Every LLM interaction, every AI pipeline, every intelligent feature in the Beamix platform
> **Philosophy:** Direct LLM API integration via Next.js API routes + Inngest. No n8n. No traditional ML models. Pure LLM orchestration at scale.

---

## 1. Intelligence System Overview

### 1.1 How AI Powers Every Layer of Beamix

Beamix is an AI-native platform. There is no feature in the product that does not, at some point, pass through an LLM. The intelligence layer is not a bolt-on; it is the product.

Every user-facing capability traces back to one of four intelligence operations:

| Operation | What it does | Frequency | LLM Involvement |
|-----------|-------------|-----------|-----------------|
| **Scan** | Query AI engines, parse their responses, score visibility | Continuous (crons + manual) | LLMs are both the subject (being queried) and the tool (parsing responses) |
| **Analyze** | Extract meaning from scan data, content, competitors, citations | Post-scan, on-demand | LLM performs reasoning over structured data to produce insights |
| **Generate** | Create content, schemas, outreach, strategies | User-triggered, event-triggered | LLM is the primary producer, quality-gated by a second LLM |
| **Converse** | Answer user questions about their data | Real-time, interactive | LLM operates as a data-grounded analyst with full business context |

The intelligence layer manages 50+ distinct LLM call types across these four operations. Every call is logged with model, tokens consumed, latency, estimated cost, and a trace ID linking it to the user action that triggered it.

### 1.2 LLM Selection Strategy

Model selection is not one-size-fits-all. Each task is matched to a model based on four criteria: reasoning depth required, output length, latency tolerance, and cost sensitivity.

| Model | Provider | Role in Beamix | Why This Model | Cost Profile |
|-------|----------|---------------|----------------|-------------|
| **Claude Haiku 4.5** | Anthropic | Response parsing, classification, mention detection, sentiment scoring, quick extraction | Fastest Anthropic model. Parsing a 500-word AI response for business mentions is a pattern-matching task, not a reasoning task. Haiku handles it in under 1 second at sub-cent cost. | ~$0.001/call |
| **Claude Sonnet 4.6** | Anthropic | Content generation, outlining, analysis, report writing, cross-agent reasoning | The workhorse. Sonnet balances intelligence with cost. Content generation requires coherent multi-paragraph output with industry knowledge, prompt-aware structuring, and brand voice adherence. Sonnet delivers this consistently without Opus-level pricing. | ~$0.02-0.08/call |
| **GPT-4o** | OpenAI | Quality assurance gate, fact checking, alternative perspective generation | Using a different vendor's model as the QA gate prevents systematic blind spots. If Claude Sonnet generates content, GPT-4o evaluates it. This cross-model QA catches hallucinations and tonal issues that same-model QA would miss. | ~$0.02-0.05/call |
| **Gemini 2.0 Flash** | Google | Bulk scan queries (cheapest per-token), high-volume classification, Haiku overflow for cost diversification | When scanning 10 engines across 75 tracked queries, Gemini Flash handles the "was this business mentioned?" question at 1/5th the cost of other models. Also serves as a cost-diversification option: some Haiku parsing calls (mention detection, basic classification) can be routed to Flash when Anthropic rate limits are hit or for A/B cost comparison. Ideal for high-fan-out, low-reasoning tasks. | ~$0.0005/call |
| **Perplexity Sonar Pro** | Perplexity | Real-time web research for agents, citation discovery, competitive intelligence | Sonar Pro returns grounded, cited answers from live web data. Every content agent begins with a Perplexity research step to ensure outputs contain current facts, not training-data fossils. | ~$0.01-0.03/call |
| **Claude Opus 4.6** | Anthropic | Brand narrative analysis, content voice profile extraction, complex multi-step reasoning | Reserved for tasks where reasoning quality directly impacts product value. Extracting a business's writing voice from 5 web pages, or analyzing why an AI engine frames a brand negatively, requires the kind of nuanced judgment only a frontier model delivers. Used sparingly. | ~$0.10-0.30/call |

**Selection Rules:**

1. Default to Sonnet for generation, Haiku for extraction, GPT-4o for QA.
2. Never use Opus where Sonnet suffices. Opus is authorized only for voice training, narrative analysis, and edge-case debugging.
3. All scan-engine queries use the respective engine's native API (OpenAI for ChatGPT responses, Anthropic for Claude responses, etc.). The LLM is both the data source and, separately, the parser.
4. Cross-model QA is mandatory: the model that generates content never grades its own work.

### 1.3 Cost Optimization Approach

LLM costs are the single largest variable expense in Beamix. The system is designed around three cost-control principles:

**Principle 1: Right-size the model.** Every prompt in the system has a designated model tier. Parsing a 300-word AI response for a business name does not need Sonnet. Generating a 2,000-word blog post does not work with Haiku. The model registry enforces this mapping.

**Principle 2: Cache aggressively.** Scan prompts are templated per industry and location. The same prompt ("Best insurance company in Tel Aviv") generates structurally identical LLM calls across multiple users. Prompt templates are stable (enabling Anthropic's automatic prompt caching at 90% cost reduction for repeated system prompts). Agent system prompts and context-assembly formats are kept stable across invocations to maximize cache hits.

**Principle 3: Budget gates at every level.** Each engine adapter has a daily USD budget cap. Each agent execution tracks cumulative token spend and aborts if cost exceeds 2x the expected budget for that agent type. The system-level daily budget alerts at 80% and hard-stops at 100%.

> **Note:** All cost estimates in this section are projections based on per-call pricing extrapolated to 1K businesses. Actual costs at pre-launch volume (<1K users) will be significantly lower. Re-validate these estimates at 100, 500, and 1K paying customer milestones.

**Cost Estimates per Operation:**

| Operation | Estimated Cost | Breakdown |
|-----------|---------------|-----------|
| Free scan (4 engines, 3 prompts) | $0.10-0.15 | Engine queries: ~$0.036, Parsing (5 Haiku stages × 12 responses = 60 Haiku calls): ~$0.060, Scoring + readiness: ~$0.01, Quick wins (Sonnet): ~$0.02. Note: parsing requires 5 separate Haiku calls per response (mention detection, position extraction, sentiment, citations, competitor extraction). Stage 6 (context window extraction) is algorithmic. |
| Scheduled scan (8 engines, 25 queries) | $1.50-3.00 | Engine queries: ~$0.80, Parsing (5 Haiku calls × 200 responses): ~$1.00, Scoring: ~$0.05, Recommendations (Sonnet): ~$0.15. Note: /month, not /week — scheduled scans run on monthly cadence per tier. |
| Agent execution (typical) | $0.15-0.40 | Research (Perplexity): ~$0.03, Outline (Sonnet): ~$0.03, Write (Sonnet): ~$0.08, QA (GPT-4o): ~$0.03 |
| A8 Competitor Intelligence (per run) | $3.00-6.00 | 3 competitors × 25 queries × 8 engines = 600 engine calls (~$2.40) + parsing (5 stages × 600 responses = 3,000 Haiku calls: ~$3.00) + comparative analysis (Sonnet x2): ~$0.50 |
| Ask Beamix chat turn | $0.02-0.05 | Context assembly + Sonnet response |

### 1.4 Quality Assurance Philosophy

Quality in an LLM-powered product cannot be guaranteed by the model alone. Beamix enforces quality through a three-layer system:

**Layer 1: Structural validation.** Every LLM output is parsed into a typed structure (JSON schema, content sections, score ranges). If the output does not conform to the expected structure, it is rejected before any human sees it. This catches malformed JSON, missing sections, out-of-range scores, and truncated outputs.

**Layer 2: Cross-model QA scoring.** For content-producing agents, a second LLM from a different provider scores the output on five dimensions: factual accuracy (0-100), relevance to the business (0-100), GEO optimization quality (0-100), readability (0-100), and brand voice adherence (0-100). The composite score must exceed 70/100 to pass. Below 60/100, the agent retries once with adjusted parameters. Below 60/100 on retry, the execution fails and credits are released.

**Layer 3: Human feedback loop.** When users edit agent-generated content before publishing, those edits are captured as training signals. The delta between the generated version and the user's edited version feeds back into future prompt construction for that business, progressively improving personalization.

**QA Fallback Chain:** When the primary QA model (GPT-4o) is unavailable, the system follows this chain:
1. **Primary:** GPT-4o (cross-vendor QA for Claude-generated content)
2. **Fallback:** Gemini 1.5 Pro (maintains cross-vendor principle — different vendor from generator)
3. **Last resort:** Deliver output with "unreviewed" flag visible in content library. **Never use Sonnet to QA Sonnet-generated content** — same-model QA has systematic blind spots.

### 1.5 Scan Methodology Limitations

Beamix scans AI engines via their APIs, not via the consumer-facing chat interfaces. This creates a structural difference between what Beamix measures and what an end user experiences:

**Key Differences:**
- **API responses ≠ consumer responses:** API responses may differ from web/app chat in ranking, formatting, and citation behavior. Consumer interfaces apply additional UI-level filtering, personalization, and formatting.
- **No personalization signal:** API queries have no user history, location cookies, or session context. Consumer AI responses may be personalized based on the user's prior interactions.
- **Rate-limited sampling:** Beamix queries a representative set of prompts per scan, not exhaustive coverage. Visibility scores are statistical estimates, not census data.

**Marketing Language Guidance:**
- Use "AI visibility signal" or "AI visibility indicator" rather than "AI ranking" — Beamix measures a signal that correlates with consumer visibility, not an exact ranking.
- Use "mentioned in X of Y engines" rather than "ranked #N" — mention detection is reliable; exact position numbering is approximate.
- Clearly state in scan results: "Results are based on API queries and may differ from what a user sees in [Engine]'s chat interface."

**Mitigation Strategies:**
- Periodic calibration: Monthly spot-check comparing API responses vs. consumer responses for 50 random prompts across engines.
- Confidence scoring: Lower confidence scores for engines with known API/consumer divergence.
- Transparency: Dashboard shows "API-based" label on all scan metrics.

### 1.6 Prompt Injection Defense

Every LLM interaction in Beamix is a potential prompt injection surface. Defenses are applied at three boundaries:

**Input Sanitization (user-facing inputs → LLM prompts):**
- All user-provided text (business name, services, tracked queries, agent parameters) is stripped of instruction-like patterns before inclusion in prompts.
- Known injection patterns (e.g., "ignore previous instructions," "system prompt:", "you are now") are detected and rejected with a user-facing error.

**Structural Separation (prompt architecture):**
- System prompts and user inputs are structurally separated using XML-tagged boundaries (e.g., `<business_context>`, `<user_input>`).
- LLM instructions never appear in the same section as user-provided data.

**Engine Response Validation (AI engine outputs → parsing pipeline):**
- Engine responses are treated as untrusted data. The parsing pipeline uses Haiku with strict extraction instructions, never executing or interpreting instructions found within engine responses.
- Output parsing validates against expected schemas; unexpected structures are logged and flagged.

---

## 2. Scan Engine Intelligence

The scan engine is the foundation of Beamix. Everything downstream --- recommendations, agents, analytics, alerts --- depends on accurate, reliable data from AI engine queries.

### 2.1 Engine Adapter System

Each AI engine is queried through an isolated adapter module. Adapters normalize the wildly different response formats into a single internal structure. The adapter pattern allows adding new engines without modifying any downstream logic.

#### ChatGPT (OpenAI API)

- **Access method:** OpenAI Chat Completions API using `gpt-4o`. The prompt is sent as a user message. System message instructs the model to answer naturally, as if a real user asked.
- **Response format:** Unstructured natural language. ChatGPT produces flowing prose with embedded recommendations. Mentions are woven into sentences, not listed. Citations are rare unless explicitly prompted.
- **Parsing challenges:** ChatGPT often hedges ("One option you might consider is...") making definitive mention detection harder than engines that use lists. Business names may appear in possessive form ("Beamix's approach") or partial form. The parser must handle fuzzy string matching across these variations.
- **Reliability:** Highly reliable API with consistent response times (2-5 seconds). Rate limits are generous for Tier 1+ accounts (500 RPM). Occasionally returns safety-filtered responses for certain business categories (medical, legal), requiring retry with rephrased prompt.

#### Gemini (Google AI API)

- **Access method:** Google Generative AI API using `gemini-2.0-flash`. Cheapest engine per query, making it ideal for high-volume scanning.
- **Response format:** Structured prose, often with markdown formatting (bold headings, bullet lists). Gemini tends to organize recommendations into numbered or bulleted lists, which simplifies position extraction.
- **Parsing challenges:** Gemini sometimes returns responses with Google-specific formatting artifacts. It also tends to include more caveats and disclaimers than other engines, which can bury the actual mentions. Hebrew responses from Gemini are inconsistent in quality compared to English.
- **Reliability:** Very reliable with high throughput limits. Occasionally returns empty responses for niche Israeli businesses, interpreted as "not mentioned." Flash model provides sub-2-second responses.

#### Perplexity (Perplexity API)

- **Access method:** Perplexity API using `sonar-pro`. The most valuable engine for citation data because Perplexity natively returns source URLs.
- **Response format:** Structured prose with inline numbered citations (e.g., "[1][2]"). Each citation links to a real URL. This is the only engine that reliably provides source-level data without additional parsing.
- **Parsing challenges:** Citation numbers must be mapped to the URLs in the response metadata. Perplexity sometimes cites aggregator sites rather than primary sources, requiring the parser to follow redirect chains for accurate source-level tracking. Mention positions are less clear because Perplexity blends multiple sources into a synthesized answer.
- **Reliability:** Rate limits are tighter than other engines (40 RPM for sonar-pro). Requires careful request queuing. Responses take 3-8 seconds due to real-time web search. Occasional 429 errors during peak hours require exponential backoff.

#### Claude (Anthropic API)

- **Access method:** Anthropic Messages API using `claude-sonnet-4-6` for scan queries. Claude's structured output mode is leveraged for consistent response formatting.
- **Response format:** Thoughtful, nuanced prose. Claude tends to provide more balanced assessments with explicit pros and cons. It often explicitly names why it recommends a business, making sentiment extraction more reliable.
- **Parsing challenges:** Claude's thoroughness means responses are longer, requiring more tokens for parsing. Claude sometimes declines to make definitive rankings ("I can't recommend a specific provider without more context"), which must be classified as "not mentioned, inconclusive" rather than "not mentioned, absent."
- **Reliability:** Rate limits of 200 RPM are adequate. Consistent 2-4 second response times. Claude very rarely returns safety-filtered responses for business queries.

#### Grok (xAI API)

- **Access method:** xAI API using the latest Grok model. API is newer and less stable than established providers.
- **Response format:** Casual, conversational tone. Grok tends to be opinionated and direct in its recommendations, which makes mention detection easier but sentiment interpretation more volatile (a flippant comment may be positive or negative depending on context).
- **Parsing challenges:** Grok's informal style means business names may appear in slang or abbreviated forms. Position extraction is complicated by Grok's tendency to editorialize rather than list. Response format is less predictable than other engines.
- **Reliability:** Medium reliability. API availability has occasional gaps. Rate limits are moderate (50 RPM). Response times vary widely (2-10 seconds). Budget allocation is lower to account for instability.

#### DeepSeek (DeepSeek API)

- **Access method:** DeepSeek API using the latest model. Cheapest API-accessible engine alongside Gemini Flash.
- **Response format:** Technical, structured responses. DeepSeek tends toward factual, citation-heavy answers. Good for industries where technical accuracy matters. Less opinionated than Grok or ChatGPT.
- **Parsing challenges:** DeepSeek's training data has known gaps for non-English markets. Hebrew responses are significantly weaker than English. Israeli businesses may not appear in DeepSeek's knowledge base at all, requiring careful interpretation of "not mentioned" (is the business unknown to DeepSeek, or genuinely not relevant?).
- **Reliability:** Moderate. API has experienced multi-hour outages. Rate limits are adequate (50 RPM). Used as a supplementary engine, not a primary one.
- **Pricing disclaimer:** DeepSeek pricing is subject to change. Verify current API pricing at deepseek.com before finalizing cost model. Last verified: March 2026.

#### Copilot (Microsoft) --- Browser Simulation, Deferred

- **Access method:** No public API. Requires Playwright browser simulation to access Bing Chat / Copilot interface.
- **Response format:** Rich formatted responses with inline citations, similar to Perplexity but rendered in Microsoft's UI. Includes visual elements (cards, images) that must be stripped during parsing.
- **Parsing challenges:** Browser automation introduces flakiness. CAPTCHA detection, session management, and UI changes require ongoing maintenance. Response extraction depends on DOM selectors that Microsoft can change without notice.
- **Reliability:** Low for automated access. Browser simulation introduces 10-15 second latency per query. Anti-bot detection may block headless browsers. Deferred to Phase 2 with a dedicated Playwright infrastructure spec.

#### Google AI Overviews --- Browser Simulation, Deferred

- **Access method:** No API. AI Overviews appear within Google Search results and require browser simulation to capture. The AI Overview panel must be identified within the search results DOM.
- **Response format:** Concise summary paragraphs with links to source pages. AI Overviews are shorter than full chat responses, typically 2-4 sentences.
- **Parsing challenges:** AI Overviews are not always triggered. Certain queries produce no AI Overview at all. Geographic targeting significantly affects whether an overview appears and what it contains. Parsing must handle the case where no overview exists.
- **Reliability:** Depends entirely on browser simulation infrastructure. AI Overviews are evolving rapidly, and Google changes the format frequently. Deferred to Phase 2.

#### You.com (You.com API)

- **Access method:** You.com API. Included in Pro tier (8 engines).
- **Response format:** Structured responses with web citations. Similar to Perplexity in providing source URLs alongside answers.
- **Parsing challenges:** You.com's responses tend to be more aggregation-focused, pulling from multiple sources. Business mentions may be indirect (citing an article that mentions the business rather than recommending directly).
- **Reliability:** API is stable but less battle-tested than major providers. Rate limits and pricing are competitive.

#### Meta AI --- Future Phase

- **Access method:** No public API currently. Would require browser simulation of meta.ai chat interface.
- **Response format:** Conversational, similar to ChatGPT but with access to real-time information through Meta's partnerships.
- **Parsing challenges:** Deferred until Meta provides API access or browser simulation infrastructure is built for Copilot/AI Overviews.
- **Reliability:** Deferred.

### 2.2 Prompt Generation System

Scan quality depends entirely on prompt quality. A poorly crafted prompt produces responses that are irrelevant, too generic, or impossible to parse for business mentions.

**Prompt Categories:**

| Category | Intent | Template Pattern | Example (EN) | Example (HE) |
|----------|--------|-----------------|--------------|--------------|
| **Direct Brand** | Does AI know this business? | "What do you know about {businessName} in {location}?" | "What do you know about Beamix in Tel Aviv?" | "?מה אתה יודע על Beamix בתל אביב" |
| **Product/Service** | Is the business recommended for its core offering? | "What is the best {service} in {location}?" | "What is the best GEO platform for small businesses?" | "?מהי פלטפורמת ה-GEO הטובה ביותר לעסקים קטנים" |
| **Industry Generic** | Where does the business stand in its industry? | "Who are the leading {industry} companies in {location}?" | "Who are the leading cybersecurity companies in Israel?" | "?מי חברות הסייבר המובילות בישראל" |
| **Comparison** | Is the business recommended over competitors? | "Compare the top {service} providers in {location}" | "Compare the top moving companies in Ramat Gan" | "השווה בין חברות ההובלה המובילות ברמת גן" |
| **Local** | Does AI recommend this business for location-specific needs? | "I need {specific_service} near {location}. Who do you recommend?" | "I need a family dentist near Herzliya. Who do you recommend?" | "?אני צריך רופא שיניים לילדים ליד הרצליה. מי אתה ממליץ" |

**Prompt Count by Context:**

| Context | Prompts Generated | Categories Used |
|---------|-------------------|----------------|
| Free scan | 3 | 1 direct brand, 1 product/service, 1 comparison |
| Scheduled scan (per tracked query) | 5 | All categories |
| Manual scan | Same as scheduled | All categories |

**Language Handling:**

Hebrew and English are first-class languages in prompt generation. This is not simple translation; Hebrew prompts use colloquial Israeli phrasing, not literary Hebrew.

- English prompts use standard question forms ("What is the best X in Y?")
- Hebrew prompts use natural Israeli speech patterns ("?מי הכי טוב ב-X באזור Y"). Location names use local format (Tel Aviv-Yafo, not Tel Aviv-Jaffa). Industry terms use the Hebrew equivalent where one exists, or the English term transliterated when the Hebrew term is uncommon.
- Language detection is based on the business's configured language in settings. Dual-language businesses generate prompts in both languages, effectively doubling scan coverage.
- Future languages extend this system by adding new prompt template sets per language. The architecture supports any language without structural changes.
- **Hebrew transliteration dependency:** Business names that originate in Hebrew must be transliterated consistently for English-language prompts (e.g., "בימיקס" → "Beamix"). Use a Hebrew transliteration library (e.g., `hebrew-transliteration` npm package or custom mapping table in `src/constants/transliteration.ts`) to ensure consistent Romanization across prompts, parsing, and display. Inconsistent transliteration causes false "not mentioned" results when the AI engine uses a different Romanization than the parser expects.

**Prompt Auto-Suggestion Based on Website Content Analysis (GAP CLOSURE — Growth Phase):**

> **Priority:** Growth Phase (not Launch Critical). Only 3/15 competitors have this feature. Research Synthesis rates it "Should-Have." Valuable but not table-stakes.

Competitors like Peec and Gauge offer smart prompt suggestions. Beamix closes this gap with an LLM-powered prompt suggestion system that analyzes the business's own website to recommend what to track.

The pipeline operates as follows:

1. **Website crawl:** During onboarding (or on-demand from settings), cheerio fetches the business's homepage plus up to 10 internal pages (BFS, depth 1).
2. **Content extraction:** Strip navigation, footers, scripts. Extract: page titles, H1/H2 headings, meta descriptions, service/product mentions, location references, FAQ questions.
3. **LLM analysis (Haiku):** Feed extracted content to Haiku with the instruction: "Given this website content for a {industry} business in {location}, generate 15-20 natural language questions that a potential customer might ask an AI assistant. Categorize each as: direct brand, product/service, industry generic, comparison, or local."
4. **Deduplication and ranking:** Remove near-duplicates (Levenshtein distance < 0.3). Rank by estimated relevance (LLM assigns 1-5 relevance score per prompt).
5. **User presentation:** Display top 10-15 suggestions during tracked query setup. User selects which to track. Unselected suggestions are stored for future recommendation.

This system produces prompts that are specific to the business's actual offerings, not generic industry templates. A dentist who specializes in pediatric dentistry gets "best children's dentist in Haifa" rather than generic "best dentist in Haifa."

### 2.3 Response Parsing Pipeline

Raw AI engine responses are unstructured text. The parsing pipeline transforms them into structured, queryable data.

**Pipeline Stages:**

```
RawEngineResponse (plain text from any engine)
    |
    v
[Stage 1: Mention Detection]
    Fuzzy business name matching across 4 strategies:
    - Exact case-insensitive match
    - Domain URL match (extracted from business website_url)
    - Normalized match (strip Ltd/Inc/LLC, ignore punctuation)
    - Hebrew transliteration match (for IL businesses)
    LLM-assisted (Haiku): For ambiguous cases, Haiku determines if a partial
    match constitutes a genuine mention or a coincidence.
    Output: boolean isMentioned + mention spans in text
    |
    v
[Stage 2: Position Extraction]
    When mentioned, determine ordinal rank within the response.
    For list-style responses: parse numbered/bulleted items.
    For prose responses: LLM-assisted (Haiku) extracts implied position.
    "One of the top providers" = position 1-3.
    "Also worth considering" = position 4-6.
    "Another option" = position 7+.
    Output: integer mentionPosition (1-based, null if not mentioned)
    |
    v
[Stage 3: Sentiment Scoring (0-100 numeric scale)]  *** GAP CLOSURE ***
    LLM-assisted (Haiku) scores the sentiment of how the business is
    described on a continuous 0-100 scale:
    - 0-20: Strongly negative ("avoid," "poor reviews," "multiple complaints")
    - 21-40: Mildly negative ("some concerns," "mixed reviews")
    - 41-60: Neutral ("is an option," factual description without opinion)
    - 61-80: Positive ("well-regarded," "recommended," "good reputation")
    - 81-100: Strongly positive ("industry leader," "top-rated," "best in class")
    The Haiku prompt includes calibration examples for consistent scoring.
    Output: integer sentimentScore (0-100)
    |
    v
[Stage 4: Citation Extraction]
    For engines that provide citations (Perplexity, You.com): extract URLs directly
    from response metadata.
    For engines without native citations: LLM-assisted (Haiku) identifies any URLs
    or source references mentioned in the text body.
    Each citation is stored with: url, domain, title (if extractable), position
    in response.
    Output: array of citation objects { url, domain, title, position }
    |
    v
[Stage 5: Competitor Extraction]
    LLM-assisted (Haiku): "Given this AI response about {industry} in {location},
    list every business name mentioned. For each, indicate its position and sentiment."
    Cross-reference against known competitors in the user's competitor list.
    Flag new competitors not yet tracked.
    Output: array of { name, position, sentiment, isTracked }
    |
    v
[Stage 6: Context Window Extraction]
    Extract 2-3 sentences surrounding the business mention for display in the
    dashboard. If not mentioned, extract the most relevant passage about the
    industry/topic.
    Output: string mentionContext (200-500 chars)
    |
    v
ParsedEngineResult (structured, typed, storable)
```

**LLM-Assisted Parsing Rationale:** Business name matching in natural language is too nuanced for regex. "Dr. Cohen's Dental" might appear as "the dental practice run by Dr. Yossi Cohen" or "Cohen Dental Clinic." Haiku handles these fuzzy matches at $0.001 per parse call, making it economically viable even at high scan volumes.

**Parsing Cost at Scale:**

> **Note:** S1.3 per-operation estimates are correct. The table below was previously understated by 5x because it counted per-response rather than per-stage. Each response passes through 5 Haiku-assisted stages (mention detection, position extraction, sentiment scoring, citation extraction, competitor extraction). Stage 6 (Context Window Extraction) is algorithmic (substring extraction around mention spans) and does not use Haiku.

| Scan Type | Responses | Haiku Calls (responses x 5 stages) | Cost |
|-----------|-----------|-------------------------------------|------|
| Free scan (4 engines x 3 prompts) | 12 responses | 60 Haiku calls | ~$0.060 |
| Scheduled scan (8 engines x 25 queries) | 200 responses | 1,000 Haiku calls | ~$1.00 |
| All daily scans (1K businesses) | ~200K responses | ~1M Haiku calls | ~$1,000/day |

### 2.4 Scoring Algorithm

**Per-Engine Visibility Score (0-100):**

Each engine produces an independent score for each prompt based on three components:

| Component | Weight | Score Range | Logic |
|-----------|--------|-------------|-------|
| Mention presence | 40 points | 0 or 40 | Binary: mentioned or not |
| Position bonus | 30 points | 5-30 | 1st=30, 2nd=25, 3rd=20, 4th=15, 5th=10, 6+=5 |
| Sentiment bonus | 30 points | 0-30 | Linear mapping: sentimentScore(0-100) mapped to 0-30 points |

Maximum per engine per prompt: 100 (mentioned + first position + perfect sentiment).

**Aggregate Visibility Score (0-100):**

The user-facing visibility score is computed across all engines and all tracked queries:

1. For each tracked query, compute per-engine scores.
2. Average across engines for a per-query score.
3. Average across all tracked queries for the aggregate score.
4. Weight recent scans more heavily: most recent scan = 1.0x, previous = 0.8x, two scans ago = 0.6x. This smooths volatility while tracking trends.

**Historical Trend Calculation:**

Trends are computed by comparing the current aggregate score against the same score from 7, 30, and 90 days ago. Delta values (current minus historical) power the trend arrows and percentage changes shown in the dashboard.

When fewer than 3 scan data points exist, the trend is shown as "Collecting data" rather than displaying potentially misleading deltas from insufficient data.

---

## 3. Agent System Intelligence

The agent system is the core differentiator of Beamix. Competitors show dashboards; Beamix does the work. Each agent is a multi-stage LLM pipeline that takes business context in and produces actionable output.

All agents share a unified execution framework via Inngest step functions. The framework provides: retry logic, credit hold/confirm/release, concurrency control (max 3 concurrent per user, 20 system-wide), execution logging, and quality gating.

### A1: Content Writer Agent

**Intelligence Purpose:** Generate GEO-optimized website pages (landing, service, about, FAQ) that maximize the probability of being cited by AI engines.

**Input Data Assembly:**
- Page type selection (landing, service, about, FAQ)
- Topic (from recommendation or user-specified)
- Target queries from tracked queries list
- Tone preference (professional, friendly, authoritative, conversational)
- Word count range (500-3000, default 1200)
- Language (EN/HE)
- Business context: name, industry, location, services, website analysis
- Recent scan data: which engines mention the business, which don't, what competitors are cited
- Content voice profile (if trained, see A13)
- Content patterns data (if available, see A14)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | What It Produces | Temp | Max Tokens |
|-------|-------|---------|-----------------|------|------------|
| 1. Research | Perplexity sonar-pro | Gather current facts, competitor content, industry trends for the topic | Structured research brief with 5-10 key facts, competitor approaches, relevant statistics, cited sources | 0.5 | 1,500 |
| 2. Outline | Claude Sonnet 4.6 | Create GEO-optimized content structure following citation-winning patterns | Section-by-section outline with H2/H3 hierarchy, key points per section, FAQ questions to address, schema types to include | 0.7 | 2,000 |
| 3. Write | Claude Sonnet 4.6 | Generate full content following outline, incorporating research data | Complete page content in markdown: title, meta description, body sections, inline statistics, FAQ section, natural keyword integration | 0.7 | 4,000 |
| 4. QA Gate | GPT-4o | Score quality across 5 dimensions, flag factual issues | Quality scorecard: factual accuracy, GEO optimization, readability, relevance, voice adherence. Composite score 0-100. Pass threshold: 70. | 0.3 | 1,000 |

**Quality Assurance Gates:**
- Between Stage 1 and 2: Validate that research returned at least 3 substantive data points. If Perplexity returns thin results, retry with broadened query terms.
- Between Stage 3 and 4: Structural validation --- verify output contains required sections (title, meta description, body, FAQ). Verify word count is within 80-120% of target.
- After Stage 4: QA score >= 70 to pass. Score 60-69: retry Stage 3 at the SAME temperature (0.7) with QA feedback injected into the prompt as explicit correction instructions. Increasing temperature on retry reduces coherence; injecting feedback is more effective. Score < 60 on retry: fail execution, release credits.

**Output Format:**
- Title (string)
- Meta description (string, 150-160 chars)
- Content body (markdown)
- FAQ section (array of Q&A pairs)
- JSON-LD schema (generated inline)
- Impact estimate (string: expected improvement based on scan data gap analysis)

**Cross-Agent Connections:**
- Receives topic suggestions from A4 (Recommendations)
- Receives competitive gaps from A8 (Competitor Intelligence)
- Receives voice profile from A13 (Content Voice Training)
- Receives structural patterns from A14 (Content Pattern Analyzer)
- Output feeds Content Library and Content Performance Tracking

---

### A2: Blog Writer Agent

**Intelligence Purpose:** Create long-form blog posts targeting topics where AI engines currently do not cite the business, using structures and formats that maximize citation probability.

**Input Data Assembly:**
- Title (from recommendation, trending topic, or user-specified)
- Target queries that the blog should help rank for
- Length preference (short 600-800, standard 1000-1500, long 1500-2500)
- Tone (educational, opinion, how-to, listicle, case study)
- Language (EN/HE)
- Business context + recent scan data
- Competitor content analysis for the topic
- Content voice profile (if available)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Research | Perplexity sonar-pro | Latest data, trends, competing articles on the topic | Research brief with stats, trends, competitor article structures, gaps in existing coverage | 0.5 | 1,500 |
| 2. Outline | Claude Sonnet 4.6 | Blog structure with engaging hook, section flow, key arguments | Detailed outline: hook, thesis, sections with bullet points, conclusion approach, CTA | 0.7 | 2,000 |
| 3. Write | Claude Sonnet 4.6 | Full blog post following outline, weaving in research data | Complete blog in markdown with inline citations, statistics, examples | 0.7 | 4,000 |
| 4. GEO Optimize | Claude Sonnet 4.6 | Add FAQ section, schema hints, internal linking suggestions, citation anchors | Augmented content with FAQ, schema, link suggestions, optimized headers | 0.5 | 2,000 |
| 5. Title Generation | GPT-4o | Generate 3 title variants optimized for AI discoverability and click-through | 3 titles ranked by GEO-optimization score with rationale | 0.8 | 500 |
| 6. Content QA | GPT-4o | Cross-model quality gate: check factual accuracy, GEO optimization quality, citation validity, heading structure | QA score (0-100) + specific feedback per dimension. If score < 80: one revision loop (Sonnet revision with QA feedback → GPT-4o re-check → publish regardless of second score) | 0.5 | 1,500 |

**Quality Gates:**
- Post-research: Minimum 3 unique data points or facts gathered.
- Post-write: Word count within target range, all outline sections addressed.
- Structural validation: H2/H3 hierarchy present, FAQ section contains 3+ Q&A pairs, at least 2 internal statistics or data points cited.
- **Post-QA (Stage 6):** GPT-4o scores on factual accuracy, GEO optimization, citation validity, and heading structure. Score < 80 triggers one Sonnet revision with QA feedback injected, followed by GPT-4o re-check. Content publishes after at most one revision loop regardless of second score. This ensures A2 follows the system's cross-model QA mandate: "the model that generates content never grades its own work."

**Output Format:**
- 3 title options with selection rationale
- Meta description
- Full content (markdown)
- Excerpt (first 2-3 sentences, auto-generated)
- Estimated read time
- Source URLs (from research phase)
- Suggested tags/categories
- FAQ section with Q&A pairs
- BlogPosting JSON-LD schema

---

### A3: Schema Optimizer Agent

**Intelligence Purpose:** Generate JSON-LD structured data that helps AI engines understand and cite the business. Schema markup is the single highest-impact technical GEO factor.

**Input Data Assembly:**
- Target page URL(s)
- Business profile (name, industry, location, services)
- Existing schema detection from page crawl

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Page Fetch | cheerio (no LLM) | Fetch and parse target page HTML | Raw HTML, extracted text, existing JSON-LD/microdata | -- | -- |
| 2. Existing Schema Detection | Parser (no LLM) | Identify current structured data on the page | List of existing schema types, completeness assessment | -- | -- |
| 3. Gap Analysis | Claude Haiku 4.5 | Determine which schema types are missing or incomplete | Prioritized list of missing schemas with impact rating | 0.3 | 1,500 |
| 4. Generate | Claude Sonnet 4.6 | Create complete, valid JSON-LD for all identified gaps | JSON-LD blocks for each schema type, populated with business data | 0.3 | 3,000 |
| 5. Validate | schema-validator lib (no LLM) | Test generated JSON-LD against Schema.org specifications | Validation results: errors, warnings, info | -- | -- |

**Quality Gates:**
- Post-generation: Every JSON-LD block must pass schema-validator without errors.
- Business data accuracy: Generated schema must use actual business data (name, address, phone) not placeholder text. Cross-referenced against the `businesses` table.

**Output Format:**
- Existing schema audit report (what the page already has)
- Generated JSON-LD blocks (ready to paste into page)
- Implementation guide (where to place each block, priority order)
- Validation results with any warnings
- Schema types covered: Organization, LocalBusiness, FAQPage, BreadcrumbList, Article, Product, Service, HowTo (as applicable)

---

### A4: Recommendations Agent (System Agent --- 0 Credits)

**Intelligence Purpose:** Auto-generate prioritized, actionable recommendations after every scan. This is the intelligence engine that connects scan data to agent actions.

**Input Data Assembly:**
- Latest scan results (all engines, all queries)
- Previous scan results (for trend comparison)
- Business profile and industry context
- Existing recommendations (to avoid duplicates)
- Previously executed agent jobs (to avoid re-suggesting completed actions)
- Competitor comparison data

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Analysis | Claude Sonnet 4.6 | Analyze scan results holistically --- gaps, opportunities, threats | Structured analysis: top gaps, declining engines, competitor advantages, content opportunities | 0.5 | 3,000 |

This is a single-pass analysis, not a multi-stage pipeline. The Sonnet model receives the full business context and scan comparison, then produces 5-8 prioritized recommendations.

**Quality Gates:**
- Each recommendation must include: title, description, impact level (high/medium/low), suggested agent type to execute it, and evidence from scan data.
- Recommendations are de-duplicated against existing active recommendations (title similarity > 0.8 = skip).
- Maximum 8 recommendations per scan to avoid overwhelming the user.

**Trigger:** Runs automatically after every scheduled and manual scan via Inngest event chain. Zero credit cost --- this is a system function, not a user-triggered agent.

**Cross-Agent Connections:** Feeds into every content-producing agent as topic/action suggestions. The dashboard presents recommendations with "Fix with Agent" buttons that pre-populate the relevant agent with the recommendation's context.

---

### A5: FAQ Agent

**Intelligence Purpose:** Generate FAQ content that directly mirrors the questions users ask AI engines, maximizing the chance of being cited in AI-generated answers.

**Input Data Assembly:**
- Tracked queries and the questions they represent
- Scan results showing which questions the business is not mentioned for
- Industry-specific common questions (from prompt auto-suggestion data)
- Existing FAQ content on the business's website (if crawled)
- Competitor FAQ analysis

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Question Discovery | Scan data + Haiku | Identify top questions from AI responses where business is absent or weakly positioned | 15-20 candidate questions ranked by visibility gap | 0.3 | 1,000 |
| 2. Answer Generation | Claude Sonnet 4.6 | Write authoritative, conversational answers that AI engines would want to cite | 10-15 FAQ pairs with natural language answers, factual claims, and business positioning | 0.7 | 3,000 |
| 3. Schema Generation | Claude Haiku 4.5 | Generate FAQPage JSON-LD schema for the FAQ content | Valid FAQPage JSON-LD | 0.3 | 1,000 |

**Quality Gates:**
- Answers must be between 50-200 words each (too short = unhelpful for AI citation, too long = loses focus).
- No factual claims that cannot be attributed to the business's own data or the research phase.
- FAQPage schema must validate against Schema.org.

**Output Format:**
- 10-15 FAQ pairs in natural conversational language
- FAQPage JSON-LD schema (ready to embed)
- Implementation guide (add to existing page vs. create dedicated FAQ page)
- Priority ranking of questions by estimated AI visibility impact

---

### A6: Review Analyzer Agent

**Intelligence Purpose:** Analyze online reviews and reputation signals to understand how AI engines perceive the business, and recommend strategies to improve sentiment.

**Input Data Assembly:**
- Business name, location, industry
- Current sentiment scores from scan data
- Known review platforms for the industry

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Review Collection | Perplexity sonar-pro | Gather recent reviews from the last 6 months across major platforms | Structured review summary: platform, rating, key quotes, themes | 0.3 | 2,000 |
| 2. Sentiment Analysis | Claude Sonnet 4.6 | Deep sentiment analysis: theme extraction, trend identification, comparison to competitors | Sentiment report with themes (service quality, pricing, communication, etc.), each scored 0-100 | 0.5 | 3,000 |
| 3. Strategy Recommendation | Claude Sonnet 4.6 | Generate response templates and improvement plan based on review themes | Response templates for common review scenarios + improvement roadmap | 0.7 | 2,000 |

**Quality Gates:**
- Review data must cover at least 2 platforms or 10 reviews.
- Sentiment themes must be grounded in actual review quotes, not fabricated.

**Output Format:**
- Sentiment overview (aggregate score, trend)
- Theme breakdown (3-7 themes, each with score, sample quotes, trend)
- Response templates (3-5 templates for common review scenarios)
- Improvement recommendations (prioritized by impact on AI perception)

**Cross-Agent Connections:** Sentiment analysis feeds into the Brand Narrative Analyst (A16) for deeper narrative understanding. Review themes feed into Content Writer (A1) and Blog Writer (A2) to address common concerns in published content.

---

### A7: Social Strategy Agent

**Intelligence Purpose:** Create a social media content strategy that amplifies the business's AI visibility by generating shareable, linkable content that AI engines can discover and cite.

**Input Data Assembly:**
- Business profile, industry, target audience
- Top-performing queries from scan data
- Competitor social presence (from research)
- Content voice profile (if available)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Research | Perplexity sonar-pro | Competitor social presence, trending topics in the industry, platform-specific trends | Research brief: competitor posting frequency, successful content formats, trending hashtags, platform recommendations | 0.5 | 1,500 |
| 2. Strategy + Calendar | Claude Sonnet 4.6 | 30-day content calendar with post ideas, optimal posting times, platform strategy | 30-day calendar + 12-15 detailed post ideas with captions, hashtags, platform-specific formats (LinkedIn, Instagram, X, Facebook) | 0.7 | 4,000 |
| 3. QA Gate | GPT-4o | Score social strategy quality: relevance, platform appropriateness, GEO alignment, brand voice | Quality scorecard (0-100). Pass threshold: 70. Below 60: retry Stage 2 with QA feedback. | 0.3 | 1,000 |

**Quality Gates:**
- Calendar must span exactly 30 days with at least 3 posts per week.
- Each post idea must include: platform, caption, hashtags, visual direction, and connection to a GEO-relevant topic.
- Post-QA: Same threshold as other content agents (70+ pass, 60-69 retry with feedback, <60 fail).

**Output Format:**
- Platform strategy overview (which platforms, why, posting frequency)
- 30-day content calendar (date, platform, content type, topic)
- 12-15 ready-to-post captions with hashtags
- Visual direction notes for each post
- Connection to GEO: how each post contributes to AI visibility

---

### A8: Competitor Intelligence Agent

**Intelligence Purpose:** Deep analysis of competitors' AI visibility strategies --- what they do, where they appear, why AI engines prefer them, and how to overtake them.

**Input Data Assembly:**
- User's tracked competitors (name, domain)
- User's scan results (for comparison baseline)
- Competitor scan results (generated by scanning the same queries for competitor names)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Multi-Engine Scan | All active engines | Query the same tracked prompts with competitor names to gather their visibility data | Raw competitor scan results across all engines | -- | -- |
| 2. Comparative Analysis | Claude Sonnet 4.6 | Deep comparison: where competitors outperform, why AI prefers them, structural/content advantages | Structured comparison matrix: per-engine, per-query visibility, citation sources competitors earn, content formats they use | 0.5 | 3,000 |
| 3. Strategic Report | Claude Sonnet 4.6 | Generate actionable intelligence: gaps to close, strategies to steal, unique angles to exploit | Intelligence report with prioritized action items, each linked to a specific agent that can execute the fix | 0.7 | 4,000 |

**Cost Note:** A8 is the most expensive agent per execution. For a Pro-tier user with 3 tracked competitors: 3 competitors × 25 queries × 8 engines = 600 engine calls. Estimated cost: $3-6 per run. Budget accordingly — A8 runs should be limited to post-scan triggers and manual requests, not scheduled daily.

**Perplexity Rate Limit Budget:** A8 claims a dedicated Perplexity token bucket of 40% of total RPM budget (16 RPM of 40 RPM total). At 3 competitors × 25 queries = 75 Perplexity calls per run, a single A8 execution takes ~5 minutes of dedicated Perplexity bandwidth.

- **Fallback model:** If Perplexity rate limit is hit, fall back to DeepSeek for the research stage using the same research prompt. DeepSeek provides adequate research quality for competitor analysis at lower cost, though without Perplexity's real-time web grounding.
- **Queue management:** A8 runs are queued. If queue depth > 5, user sees "Expected wait: ~X min" estimated from current queue × average execution time.
- **Caching:** Competitor research results are cached 24 hours per competitor domain. If a competitor was analyzed within 24h (by any user in the same industry), the cached result is used instead of re-querying.

**Quality Gates:**
- Comparison must cover all tracked queries and all active engines.
- Each action item must be specific and executable (not "improve content" but "create a comparison article covering X vs Y targeting the query 'best X in location'").

**Output Format:**
- Competitive landscape overview (visual-ready data for share-of-voice charts)
- Per-competitor profiles (visibility score, top queries, cited sources, content strategy)
- Gap analysis (queries where competitor ranks and user does not)
- Strategic action items (prioritized, linked to agents)
- Competitive intelligence report (narrative summary)

---

### A9: Citation Builder Agent

**Intelligence Purpose:** Identify the specific sources that AI engines cite when discussing the business's industry, then generate personalized outreach to earn citations from those sources.

**Input Data Assembly:**
- Citation data from scan results (URLs that AI engines cite)
- Industry context and business positioning
- Existing citations (to avoid outreach to sources that already cite the business)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Citation Analysis | Scan data + Haiku | Extract and rank top-cited sources by citation frequency and authority | Ranked list of citation sources: URL, domain, citation count, authority estimate | 0.3 | 1,000 |
| 2. Source Research | Perplexity sonar-pro | Find article authors, publication contacts, content focus | Contact profiles: author name, email/social, publication, article topics, relevance to business | 0.3 | 2,000 |
| 3. Outreach Templates | Claude Sonnet 4.6 | Generate personalized outreach emails for each high-priority source | 5-10 personalized email templates: subject line, body, value proposition, specific article reference | 0.7 | 3,000 |

**Quality Gates:**
- Outreach templates must be genuinely personalized (reference specific articles, not generic pitches).
- No spam-like language. Each email must provide clear value to the recipient.
- Contact information is presented as "research leads" not guaranteed data. User verifies before sending.

**Output Format:**
- Citation source ranking (domain, frequency, authority, relevance)
- Contact research findings (author, platform, content focus)
- 5-10 personalized outreach email templates
- Outreach priority recommendations (start with highest-frequency, highest-authority sources)

---

### A10: LLMS.txt Generator Agent

**Intelligence Purpose:** Create and maintain the llms.txt file that helps AI crawlers understand the business's website structure, key offerings, and authoritative content.

**Input Data Assembly:**
- Business profile (name, description, services, location)
- Website structure from crawl (pages, hierarchy, content types)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Website Crawl | cheerio (no LLM) | Analyze site structure: pages, hierarchy, content categories | Site map with page types, hierarchy levels, content summaries | -- | -- |
| 2. Generate llms.txt | Claude Sonnet 4.6 | Create structured llms.txt following the emerging specification | Complete llms.txt file with business description, key pages, content categories, contact info | 0.3 | 2,000 |

**Quality Gates:**
- Output must conform to the llms.txt specification format.
- All URLs referenced must be real pages found during the crawl.
- Business information must match the `businesses` table data.

**Output Format:**
- Complete llms.txt file content (ready to deploy at site root)
- Deployment instructions (where to place, how to verify)
- Recommended update frequency

---

### A11: AI Readiness Auditor Agent

**Intelligence Purpose:** Comprehensive website audit assessing how well the site is optimized for AI engine consumption, producing a detailed improvement roadmap.

**Input Data Assembly:**
- Business website URL
- Current AI readiness score from last scan (if available)
- Industry benchmarks

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Deep Crawl | cheerio (no LLM) | Crawl up to 50 pages (BFS, depth 2). Extract: HTML structure, schema, meta tags, content, links, performance signals | Site analysis dataset: per-page metrics across 25+ factors | -- | -- |
| 2. Algorithmic Scoring | Scoring algorithm (no LLM) | Compute scores across 5 categories using weighted factors | Numeric scores per category and per factor | -- | -- |
| 3. Report Generation | Claude Sonnet 4.6 | Transform scores into actionable improvement plan with prioritized recommendations | Detailed report: per-category analysis, specific improvements, implementation difficulty, expected impact | 0.7 | 4,000 |

**Scoring Categories (canonical weights from Product Layer):**
- Content Quality (30%): content depth, FAQ presence, freshness, readability
- Technical Structure (25%): schema markup, meta tags, heading hierarchy, page speed, sitemap
- Authority Signals (20%): domain indicators, backlink signals, brand mentions
- Semantic Alignment (15%): topic coverage vs. tracked queries, conversational format
- AI Accessibility (10%): robots.txt allows AI bots, llms.txt present, JS rendering friendliness

**Output Format:**
- Overall AI Readiness Score (0-100%)
- Per-category breakdown with per-factor scores
- Prioritized improvement roadmap (ordered by impact / effort)
- Comparison to industry average (when sufficient data exists)
- Specific technical fixes (with implementation instructions)

---

### A12: Ask Beamix (Conversational Analyst)

**Intelligence Purpose:** Natural language interface for users to ask questions about their own data, receiving data-grounded, contextual answers in conversational format.

**Input Data Assembly (per turn):**
- Full business context (profile, industry, location, services)
- Latest 3 scan results with per-engine breakdowns
- Recent agent job history (last 10)
- Active recommendations
- Competitor comparison data
- Conversation history (current session)

**LLM Pipeline:**

Single-model conversational pipeline using Claude Sonnet 4.6 with SSE streaming. The system prompt injects the complete business context, instructing the model to act as a GEO analyst who answers only from the provided data, never invents statistics, and always cites which scan or data source its answer comes from.

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Context + Query | Claude Sonnet 4.6 (streaming) | Answer user question grounded in their business data | Streamed natural language response with data citations | 0.7 | 2,000 |

**Quality Gates:**
- The system prompt explicitly prohibits fabricating data. If the user asks about something not in their data, the model responds with "I don't have data on that yet. Run a scan to generate this data."
- Responses are streamed via SSE for real-time UX.

**Credit Cost:** Zero. Included in Pro+ tier. No agent credit deduction.

**Vercel Timeout:** Vercel Pro plan required for 60s function timeout. Default 10s is insufficient for multi-turn conversations. Add `export const maxDuration = 60` to the `/api/agents/chat` API route. Long responses should use chunked streaming to keep the connection alive.

**Output Format:** Real-time streamed natural language response. Not stored permanently --- conversation exists only during the active session.

---

### A13: Content Voice Training Agent (NEW --- GAP CLOSURE)

**Intelligence Purpose:** Learn the business's unique writing voice from their existing web content, creating a reusable voice profile that all content-producing agents inject into their generation prompts.

This closes the gap identified against Goodie AI's "Author Stamp" feature. Without voice training, all agent-generated content sounds like generic AI. With it, content matches the business's tone, vocabulary, and style.

**Input Data Assembly:**
- Business website URL
- 3-5 existing pages or blog posts selected by the user (or auto-selected during onboarding)
- Any previous content edits the user made to agent-generated content (edit deltas)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Content Collection | cheerio (no LLM) | Crawl and extract clean text from 3-5 user-selected pages | Clean text corpus: 3,000-15,000 words of business's own writing | -- | -- |
| 2. Voice Profile Extraction | Claude Opus 4.6 | Deep analysis of writing patterns: tone, vocabulary complexity, sentence structure, rhetorical devices, formality level, personality markers | Structured voice profile document describing the business's writing style across 8 dimensions | 0.5 | 3,000 |
| 3. Voice Verification | Claude Sonnet 4.6 | Generate a short sample paragraph in the extracted voice, presented to user for approval | 150-word sample paragraph for user validation | 0.7 | 500 |

**Why Opus for Stage 2:** Voice extraction requires detecting subtle stylistic patterns --- the difference between "We believe in excellence" (corporate) and "We're obsessed with getting this right" (startup). This level of linguistic nuance benefits measurably from Opus-class reasoning. This is one of the few justified Opus use cases in the system.

**Voice Profile Dimensions:**
1. Formality level (1-10 scale: 1=casual slang, 10=academic formal)
2. Sentence complexity (simple/compound/complex preference)
3. Vocabulary sophistication (basic/intermediate/advanced)
4. Tone markers (warm/professional/authoritative/playful/urgent)
5. Rhetorical patterns (questions, calls-to-action, storytelling, data-driven)
6. Industry jargon usage (heavy/moderate/minimal)
7. First-person style (we/I/company name/passive)
8. Cultural markers (Israeli informality, English formality, bilingual patterns)

**Minimum Content Threshold:**
- < 300 words total extracted: Skip voice training. Set `voice_profile_status = 'insufficient_content'`. Show user message: "Not enough content to train voice profile — generate content first or add more pages."
- 300-1,000 words: Basic profile only (tone + style dimensions 1-4, no pattern analysis on dimensions 5-8). Confidence flagged as "low."
- > 1,000 words: Full profile across all 8 dimensions.

**Storage:** Voice profile stored as a structured JSON document in the `content_voice_profiles` table. All content-producing agents inject this profile into their system prompts. Quality-critical path — voice affects all content output.

**Quality Gates:**
- User must approve the verification sample before the profile is activated.
- Profile auto-updates when user edits agent content (edit deltas are analyzed monthly to refine the profile).

**Output Format:**
- Voice profile document (structured JSON, 8 dimensions)
- Example paragraph in the extracted voice (for user approval)
- Confidence assessment per dimension

---

### A14: Content Pattern Analyzer Agent (NEW --- GAP CLOSURE)

**Intelligence Purpose:** Analyze the structural and stylistic patterns of content that AI engines actually cite, then feed those patterns into content-producing agents to increase citation probability.

This closes the gap identified against Spotlight's content pattern analysis. Instead of generating content based on general best practices, Beamix generates content based on what actually works in the user's specific niche.

**Input Data Assembly:**
- Citation URLs from scan results (the actual pages AI engines cite)
- Business industry and topic focus
- Current content from the business's website (for comparison)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Citation Crawl | cheerio (no LLM) | Fetch and extract content from top 10 most-cited URLs in the business's industry | Clean text + structural metadata: word count, heading structure, list usage, FAQ presence, schema types, media references | -- | -- |
| 2. Pattern Extraction | Claude Sonnet 4.6 | Analyze structural and stylistic patterns across cited content: what do successful pages have in common? | Pattern report: common structures, typical word counts, heading patterns, FAQ formats, schema usage, citation density, content organization approaches | 0.5 | 3,000 |
| 3. Template Generation | Claude Sonnet 4.6 | Translate patterns into actionable content templates that agents can follow | 3-5 content templates: one per common content type in the industry, each specifying structure, length, sections, and style notes | 0.5 | 2,000 |

**Quality Gates:**
- Analysis must cover at least 5 cited pages (if fewer than 5 citations exist, supplement with Perplexity research for top-ranking content in the industry).
- Patterns must be specific and actionable ("include an FAQ section with 5-7 questions, each answered in 80-120 words") not generic ("write good content").

**Output Format:**
- Pattern analysis report (what makes cited content successful in this niche)
- Common structural patterns (heading hierarchy, section order, content blocks)
- Length and format benchmarks (word counts, list vs. prose ratio, media usage)
- 3-5 content templates for content-producing agents to follow
- Gap analysis: how the business's current content compares to citation-winning patterns

**Cross-Agent Connections:** Pattern templates are stored and injected into A1 (Content Writer) and A2 (Blog Writer) system prompts. Templates are refreshed every 30 days via a scheduled Inngest job.

---

### A15: Content Refresh Agent (NEW --- GAP CLOSURE)

**Intelligence Purpose:** Audit existing published content for staleness, outdated facts, and optimization opportunities, then produce updated versions. This transforms agents from one-shot content creators into continuous content maintainers.

This closes the gap against Profound Workflows' recurring content audits. Competitors' agents create content once; Beamix agents keep content alive.

**Input Data Assembly:**
- All content items with status "published" and published_at older than 30 days
- Current scan results for the queries the content was targeting
- Latest industry data (via research phase)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Staleness Audit | Claude Haiku 4.5 | Compare each published content item against current scan data and industry trends. Flag: outdated statistics, stale references, missed new competitors, changed market conditions | Staleness report per content item: freshness score (0-100), specific issues found, update urgency (high/medium/low) | 0.3 | 2,000 |
| 2. Research Update | Perplexity sonar-pro | For high-urgency items, gather latest data on the topic | Updated facts, new statistics, recent developments | 0.5 | 1,500 |
| 3. Content Revision | Claude Sonnet 4.6 | Generate updated version of the content, preserving voice and structure while incorporating new data | Revised content with tracked changes (diff against original) | 0.6 | 4,000 |

**Trigger:** Scheduled Inngest cron (monthly for Starter, bi-weekly for Pro, weekly for Business). Also triggered manually by user.

**Quality Gates:**
- Only content with freshness score below 60 is flagged for update.
- Revisions must preserve the original voice profile and structure (no wholesale rewrites; targeted updates only).
- User approves updates before they replace the original (presented as a diff view in the content library).

**Output Format:**
- Content freshness audit report (all published items scored)
- Flagged items with specific issues and update urgency
- Revised content drafts (for high-urgency items)
- Diff view showing what changed and why

---

### A16: Brand Narrative Analyst Agent (NEW --- GAP CLOSURE)

**Intelligence Purpose:** Understand WHY AI engines say what they say about a business --- not just whether it is mentioned, but what narrative AI has constructed about the brand and what sources drive that narrative.

This closes the gap against AthenaHQ's Athena Citation Engine (ACE). Visibility scores tell you IF you appear; narrative analysis tells you WHAT story AI tells about you and HOW to change it.

**Input Data Assembly:**
- All scan results for the business (current + historical)
- Mention context windows from all engines
- Citation sources data
- Competitor mention contexts (for comparison)

**LLM Pipeline Stages:**

| Stage | Model | Purpose | Output | Temp | Max Tokens |
|-------|-------|---------|--------|------|------------|
| 1. Narrative Extraction | Claude Opus 4.6 | Across all AI engine responses, identify the recurring themes, framings, and positioning AI uses when discussing this business | Narrative map: 3-5 core narratives AI tells about the brand, each with supporting quotes from engine responses, sentiment, and consistency across engines | 0.5 | 4,000 |
| 2. Source Attribution | Claude Sonnet 4.6 | Identify which web sources likely drive each narrative element (correlate cited URLs with narrative themes) | Source-narrative linkage: which articles/pages cause AI to say specific things about the brand | 0.5 | 2,000 |
| 3. Narrative Strategy | Claude Sonnet 4.6 | Recommend how to reinforce positive narratives and counter negative ones through content strategy | Action plan: content to create, sources to target, messaging to emphasize, narratives to counter | 0.7 | 3,000 |

**Why Opus for Stage 1:** Narrative extraction requires synthesizing across dozens of AI responses from different engines, identifying consistent themes versus outlier framings, and understanding the difference between what AI says explicitly versus what it implies. This is a high-reasoning task where Opus delivers measurably better outputs than Sonnet.

**Context Overflow Handling:** If combined scan data + mention contexts exceed 100K characters:
1. Chunk input into 10K-character segments grouped by engine.
2. Summarize each chunk with Haiku (extract key narratives, themes, and sentiment per chunk).
3. Synthesize all chunk summaries with Opus in Stage 1.
4. Add `max_input_tokens` guard: if content exceeds 200K characters after chunking, warn user that analysis will be based on a representative sample (most recent 3 scans per engine) rather than full history.

**Quality Gates:**
- Each narrative must be supported by at least 3 engine responses (not a one-off from a single engine).
- Source attribution must be grounded in actual citation data, not speculated.

**Output Format:**
- Brand narrative map (3-5 core narratives with evidence)
- Narrative sentiment analysis (which narratives are positive, negative, neutral)
- Source attribution (which web content drives each narrative)
- Cross-engine consistency analysis (do all engines tell the same story?)
- Strategic action plan (how to shift the narrative through content and citations)

---

## 4. Cross-Agent Intelligence

### 4.1 Business Context Assembly

Every agent receives a standardized business context object assembled before execution begins. This is the "shared brain" that gives every agent full awareness of the business's situation.

**Context Assembly Pipeline:**

The context assembler runs as the first Inngest step in every agent execution. It performs 5 parallel Supabase queries:

1. **Business profile:** name, industry, location, services, website_url, description, language preference
2. **Recent scan results:** Last 3 scans with per-engine breakdowns, scores, mention contexts, citations
3. **Recent content:** Last 10 content items (title, type, agent_type, created_at, status) to prevent duplicate generation
4. **Competitors:** All tracked competitors with names and domains
5. **Active recommendations:** Non-dismissed recommendations with title, type, status

Additionally, if available:
6. **Voice profile:** The business's content voice training data (from A13)
7. **Content patterns:** Citation-winning patterns for the business's industry (from A14)
8. **Pending agent jobs:** Any currently running agents to prevent conflicting parallel execution

The assembled context is serialized as a structured JSON object and injected into the system prompt of every agent's LLM calls. This ensures every agent "knows" what every other agent has done, what the scans show, and what the business needs.

### 4.2 Cross-Agent Data Sharing

Agents do not operate in isolation. Each agent's output feeds into other agents:

| Producing Agent | Output Data | Consuming Agents | How It's Used |
|----------------|------------|-------------------|---------------|
| A4 (Recommendations) | Prioritized action items with suggested agent types | A1, A2, A3, A5, A7, A8, A9, A10 | Topic suggestions, priority-ordered work items |
| A8 (Competitor Intelligence) | Competitor gaps, winning strategies, content formats | A1, A2 (Content/Blog Writer) | Topics to write about, competitive angles to cover |
| A6 (Review Analyzer) | Sentiment themes, reputation concerns | A1 (Content Writer), A16 (Brand Narrative) | Address reputation concerns in content, understand narrative drivers |
| A13 (Voice Training) | Voice profile (8 dimensions) | A1, A2, A5, A7 (all content producers) | Inject voice into generation prompts |
| A14 (Pattern Analyzer) | Citation-winning content templates | A1, A2 (Content/Blog Writer) | Follow proven structural patterns |
| A16 (Brand Narrative) | Narrative map and strategy | A1, A2 (Content/Blog Writer), A9 (Citation Builder) | Content messaging to reinforce/counter specific narratives |
| A11 (AI Readiness) | Technical gaps and priorities | A3 (Schema Optimizer), A10 (LLMS.txt) | Prioritize which technical fixes to address first |

### 4.3 Agent Workflow Chains (GAP CLOSURE)

Competitors like Profound have "Workflows" --- event-triggered automation chains that execute multi-agent sequences without human intervention. Beamix closes this gap with Inngest-native event chains.

**Event-Triggered Workflow Architecture:**

Workflows are defined as Inngest event chains. When a triggering event fires, subsequent agents execute in sequence, with each step's output feeding the next.

**Defined Workflows:**

**Workflow 1: Visibility Drop Response**
```
Trigger: scan.completed where visibility_score dropped > 15%
  --> A4 (Recommendations) auto-runs with "urgent" flag
  --> A8 (Competitor Intelligence) runs for queries where visibility dropped
  --> A1 (Content Writer) auto-drafts content for top gap
  --> Notification: "Visibility dropped 18%. We've drafted a recovery plan."
```

**Workflow 2: New Business Onboarding**
```
Trigger: onboarding.completed (first scan + profile setup)
  --> PARALLEL: [A13 (Voice Training), A14 (Pattern Analyzer), A11 (AI Readiness)]
      A13 runs on user's website (voice extraction)
      A14 runs for user's industry (pattern analysis)
      A11 runs full audit (readiness scoring)
  --> SEQUENTIAL (after all parallel complete):
      A4 (Recommendations) generates initial action items (uses outputs from A13, A14, A11)
  --> Notification: "Your AI profile is ready. Here are your top 3 priorities."
```
Note: A13, A14, and A11 are independent and run in parallel via `Promise.all()` in the Inngest step function. A4 depends on their outputs and runs only after all three complete.

**Workflow 3: Content Lifecycle**
```
Trigger: content_item.published (user marks content as published)
  --> Schedule: 30 days later, A15 (Content Refresh) audits the item
  --> If freshness score < 60: auto-draft refresh, notify user
  --> Schedule: correlate next 3 scan results with this content's target queries
  --> If visibility improved: notify "This content improved your ChatGPT ranking by 2 positions"
```

**Workflow 4: Competitor Alert Response**
```
Trigger: alert.competitor_overtook (competitor surpassed user on a query)
  --> A8 (Competitor Intelligence) runs focused analysis on the overtaking competitor
  --> A4 (Recommendations) generates competitive response recommendations
  --> Notification: "Competitor X overtook you for 'best Y in Z'. Here's our recommended response."
```

Each workflow is an Inngest function that listens for the trigger event and orchestrates subsequent agent executions via `inngest.send()` calls within step functions. The orchestration respects credit limits (workflow steps that would exceed remaining credits are queued until the next billing cycle, with user notification).

### 4.4 Learning from User Edits

When users edit agent-generated content before publishing, those edits represent the highest-quality feedback signal available. The system captures and uses this feedback:

**Edit Capture Pipeline:**
1. When a user modifies a content item, the system stores the diff (original vs. edited version) in a `content_edits` column on the `content_items` table.
2. Monthly Inngest cron job (`cron.voice-refinement`): For each business with 3+ content edits, analyze the pattern of edits using Haiku.
3. Common edit patterns (e.g., "user always removes the introductory paragraph," "user always adds a personal anecdote," "user consistently shortens sentences") are extracted and appended to the voice profile.
4. Refined voice profiles produce progressively more personalized content, reducing edit frequency over time.

This creates a flywheel: more usage leads to better personalization leads to less editing leads to higher satisfaction leads to more usage.

---

## 5. Content Intelligence

### 5.1 Content Voice Training Pipeline (GAP CLOSURE)

Fully specified in Agent A13 above. Key architectural decisions:

- **Data collection:** Cheerio-based website crawl, not user-uploaded documents. Users select 3-5 pages from their site during onboarding or settings. This is friction-free --- no file uploads, no copy-paste.
- **Voice profile extraction:** Opus 4.6 for the one-time extraction (justified by quality requirement). Stored as structured JSON in the database.
- **Voice injection:** All content-producing agents (A1, A2, A5, A7) include the voice profile in their system prompts. The injection format is a structured description ("Write in a tone that is [formality 7/10], using [compound sentences], with [moderate industry jargon], in [first-person plural 'we'], with a [warm but professional] feel").
- **Progressive refinement:** Edit deltas from user modifications feed back into the voice profile monthly. No retraining; profile is updated via Haiku analysis of edit patterns.

### 5.2 Content Pattern Analysis (GAP CLOSURE)

Fully specified in Agent A14 above. Key design decisions:

- **Data source:** Actual citation URLs from scan results. This grounds pattern analysis in reality (what AI engines actually cite) rather than general SEO best practices.
- **Pattern granularity:** Patterns are specific and actionable (e.g., "top-cited articles in legal industry average 1,400 words, use 5-7 H2 headings, include an FAQ with 6 questions, and cite 3+ external statistics"). Generic advice ("write quality content") is explicitly excluded.
- **Template output:** Patterns translate into concrete content templates that agents A1 and A2 use as structural guides during their outline phases.
- **Refresh cadence:** Patterns are re-analyzed monthly via Inngest cron. Citation patterns shift as AI engines update their training data and ranking algorithms.

### 5.3 Content Performance Tracking Intelligence (GAP CLOSURE)

Content performance tracking correlates published content with subsequent visibility changes. This is how Beamix proves ROI: "You published this article, and your Perplexity ranking improved from absent to position 2."

**Pipeline:**

1. When a user marks a content item as "published," the system records:
   - Content ID and target queries
   - Current visibility scores for those queries (baseline)
   - Publication date

2. Subsequent scan results for those queries are tagged with the content publication event.

3. After 7, 14, and 30 days, the system computes the visibility delta for the target queries:
   - Per-engine: "ChatGPT: no change. Perplexity: position 5 to position 2. Gemini: not mentioned to position 4."
   - Aggregate: "Overall visibility for target queries improved 23 points."

4. The correlation analysis acknowledges confounding factors (other changes the user made, AI engine updates) through a disclaimer: "Visibility changes may reflect multiple factors. This correlation is directional, not causal."

5. Performance data feeds into the Content Library UI as a "Performance" tab on each published content item, and into the dashboard as a "Content Impact" widget.

### 5.4 Typed Content Templates (GAP CLOSURE)

Different content types serve different GEO purposes and require fundamentally different LLM approaches. Beamix supports 6 distinct content types, each with specialized prompt templates:

| Content Type | GEO Purpose | Structural Requirements | LLM Approach |
|-------------|------------|------------------------|-------------|
| **Comparison Article** | Wins "X vs Y" and "best X" queries | Head-to-head structure, pros/cons tables, verdict section, comparison schema | Research both entities, generate balanced comparison, include data points, avoid bias toward the user's business (AI engines detect and penalize self-serving comparisons) |
| **Location Page** | Wins "X in [city]" queries | Location-specific content, local references, LocalBusiness schema, directions, local testimonials | Research local market, incorporate local landmarks/references, generate location-specific FAQ, add LocalBusiness JSON-LD |
| **Case Study** | Establishes authority and expertise | Problem/solution/result structure, specific metrics, client quotes, timeline | Research the business's notable projects/outcomes, structure as narrative with data, include measurable results |
| **Ranked List** | Wins "top X" and "best X" queries | Numbered rankings, brief descriptions, comparison criteria, clear methodology | Research top entities in the category, create fair ranking with methodology disclosure, position user's business authentically |
| **FAQ Page** | Directly matches conversational AI queries | Question/answer pairs, FAQPage schema, natural language answers | Analyze scan data for actual AI queries, generate answers that mirror conversational AI style |
| **Product Deep-Dive** | Wins product-specific AI queries | Feature breakdowns, use cases, pricing context, Product schema | Research the product category, create comprehensive feature analysis, include comparison context |

Each content type uses the same 4-stage pipeline (research, outline, write, QA) but with type-specific system prompts that enforce the structural requirements.

---

## 6. Data Intelligence

### 6.1 Prompt Volume Estimation (GAP CLOSURE)

Prompt volume data is the "keyword volume" equivalent for AI search. Profound has 130M conversations; Writesonic has 120M; Ahrefs has 190M prompts. Beamix cannot build a comparable dataset from scratch, but it can build a useful proxy from its own user base.

**Data Aggregation Architecture:**

1. **Collection:** Every scan query executed across all Beamix users is stored with anonymized metadata: industry, location, language, timestamp. No business-specific data is included --- only the prompt text and structural metadata.

2. **Volume proxy calculation:** For each unique prompt (or semantically similar prompts, clustered by Haiku), count how many distinct businesses have scanned using that prompt or a close variant. This count serves as a popularity proxy: "847 Beamix businesses track this prompt" implies it is a high-interest query in that industry.

3. **Relative scoring:** Prompts are scored relative to their industry. Within "insurance in Israel," the prompt "best car insurance in Tel Aviv" might score 95/100 (most tracked) while "commercial fleet insurance rates" scores 12/100 (rarely tracked).

4. **Trending detection:** Compare prompt volume week-over-week. Prompts with >30% growth in tracking count are flagged as "trending." This surfaces emerging topics before they become saturated.

**Accuracy and Limitations:**

- At 100 businesses: volume data is directionally useful within narrow industries.
- At 1,000 businesses: volume data becomes reliable for cross-industry comparisons.
- At 10,000 businesses: volume data approaches the utility of purpose-built datasets.
- Beamix is transparent about this: "Based on Beamix community data (N=X businesses)" rather than implying absolute volume numbers.

**User-Facing Value:**

- During tracked query setup: "This query is tracked by 340 businesses in your industry --- high relevance" or "Only 3 businesses track this --- niche opportunity."
- Trending topics widget on dashboard: "Emerging queries in your industry this week."
- Agent recommendations: "This trending topic has no content from your business --- create a blog post?"

### 6.2 Brand Narrative Analysis (GAP CLOSURE)

Fully specified in Agent A16 above. The data intelligence dimension focuses on the ongoing aggregation of narrative data:

**Source Analysis Pipeline:**

When scan results include citations, those citations are stored with the narrative context in which they appear. Over time, this builds a "citation graph" per business:

- Which sources are cited when AI engines discuss this business?
- Which sources are cited when AI discusses competitors?
- Which sources drive positive narratives vs. negative ones?

**Narrative Extraction:**

Across all scan results for a business, Opus 4.6 identifies recurring narrative patterns: "AI consistently describes this business as 'affordable but limited,' while competitor X is described as 'premium but comprehensive.'" This narrative map is the foundation for strategic content decisions.

**Sentiment Driver Identification:**

For each narrative theme, the system traces which cited sources are most likely driving that framing. If three AI engines describe the business as "budget-friendly," and all three cite the same review site where the most-upvoted review mentions "great value for money," that review is identified as a sentiment driver. Addressing sentiment drivers (requesting review updates, creating counter-narrative content) is more effective than generic content creation.

### 6.3 Citation Source Intelligence (GAP CLOSURE)

Citation source tracking moves beyond "was the business mentioned?" to "which URLs did AI engines cite, and why do those URLs outrank the business's own content?"

**Citation Database:**

Every scan parse (Stage 4 of the parsing pipeline) extracts citation URLs. These accumulate in a `citation_sources` structure linked to scan results:

- URL (full), domain, extracted title
- Citation frequency (how many engines cite this source, across how many queries)
- Citation context (what the engine says when citing this source)
- Authority estimate (based on frequency, domain reputation heuristic)

**Citation Analytics:**

- **Most-cited sources in your industry:** Ranked list of domains that AI engines cite most for queries relevant to the user's business. "For 'best insurance in Tel Aviv,' AI engines cite: 1) allaboutinsurance.co.il (cited 12 times across 3 engines), 2) wisebuy.co.il (cited 8 times), 3) your website (cited 2 times)."
- **Citation gap analysis:** Sources that cite competitors but not the user's business.
- **Citation trend:** How citation patterns change over time (are new sources emerging? is the user gaining or losing citations?).

This data directly feeds A9 (Citation Builder) for outreach prioritization.

### 6.4 Customer Journey Mapping (GAP CLOSURE)

Map each tracked query to a customer journey stage to understand where the business is visible (and invisible) in the buying process.

**Journey Stage Classification:**

An Inngest post-processing step after each scan classifies each tracked query into a journey stage using Haiku:

| Stage | Intent Signal | Example Queries |
|-------|-------------|----------------|
| **Awareness** | Informational, exploratory | "What is GEO?" "How do AI search engines work?" |
| **Consideration** | Comparative, evaluative | "Best GEO tools 2026" "Beamix vs Profound" |
| **Decision** | Transactional, specific | "Beamix pricing" "How to sign up for Beamix" |
| **Retention** | Usage, how-to, support | "How to use Beamix agents" "Beamix dashboard tutorial" |

**Example Query-to-Stage Mappings (for few-shot classification):**

| Query | Stage | Reasoning |
|-------|-------|-----------|
| "what is dental implant" | Awareness | Generic informational, no brand or comparison intent |
| "best dental clinic tools for patient management" | Consideration | Comparative ("best"), evaluating options |
| "DentaPro vs SmileTech pricing" | Decision | Direct brand comparison with pricing intent |
| "how to use DentaPro appointment system" | Retention | Existing customer seeking usage guidance |
| "DentaPro pricing plans" | Decision | Specific brand + pricing = purchase intent |

**Dashboard Insight:**

Visibility is broken down by journey stage: "You're visible in 70% of consideration queries but only 20% of awareness queries." This tells the user exactly where to invest content effort.

### 6.5 Persona-Based Analysis (GAP CLOSURE)

Different buyer personas ask different questions to AI engines. A CMO asking "best marketing analytics platform" gets different results than a developer asking "most accurate API for brand monitoring."

**Persona Definition:**

During onboarding or settings, users define 1-3 buyer personas with:
- Role / title
- Primary concerns (cost, features, ease of use, enterprise compliance)
- Typical query style

**Persona-Specific Scanning:**

Each persona generates persona-adjusted prompts. The CMO persona generates "best platform for marketing teams" while the developer persona generates "most reliable API for brand monitoring." Scan results are segmented by persona.

**Dashboard Insight:**

"Your CMO persona sees you at position 3 on ChatGPT, but your developer persona doesn't see you at all." This guides content strategy toward underserved personas.

**Implementation Note:** Persona-based analysis is a Tier 3 feature (6-month roadmap). The data model supports it from day one (persona_id field on tracked_queries), but the UI and prompt generation extensions are deferred.

---

## 7. AI Crawler Detection Intelligence

### 7.1 Identifying AI Crawler Traffic

AI crawler detection answers: "Which AI engines are visiting my website, how often, and which pages do they access?" This data complements scan results (which measure what AI says) with behavioral data (what AI reads).

**Detection Architecture (3 progressive phases):**

**Phase 1: JavaScript Snippet**

User adds a lightweight JS snippet to their website. The snippet fires a beacon to Beamix's tracking endpoint when any page loads. On the server side, the User-Agent string is matched against the known AI bot database.

Limitations: Most AI crawlers do not execute JavaScript. This phase catches only ChatGPT-User (which renders JS when browsing) and some evaluation crawlers. Its primary value is proving the concept and building the dashboard UI.

**Phase 2: Server Log Analysis**

User provides access to server logs (via file upload or log streaming integration). Beamix parses logs for AI bot User-Agent strings. This catches all crawlers that identify themselves via User-Agent.

**Phase 3: Vercel/Cloudflare Integration**

Direct integration with hosting platform analytics APIs. Vercel and Cloudflare both provide bot detection data. This is the most reliable method, requiring no user-side code changes.

### 7.2 Bot Signature Database

Maintained as a version-controlled configuration file, updated monthly:

| Bot Name | User-Agent Pattern | Company | Behavior |
|----------|-------------------|---------|----------|
| GPTBot | `GPTBot/1.0` | OpenAI | Training data crawler. Respects robots.txt |
| ChatGPT-User | `ChatGPT-User` | OpenAI | Live browsing agent. Executes JS |
| ClaudeBot | `ClaudeBot` | Anthropic | Training data crawler |
| Google-Extended | `Google-Extended` | Google | AI training (Gemini). Separate from Googlebot |
| PerplexityBot | `PerplexityBot` | Perplexity | Real-time search crawler. Very active |
| Bytespider | `Bytespider` | ByteDance | TikTok/Doubao training |
| Applebot-Extended | `Applebot-Extended` | Apple | Apple Intelligence training |
| cohere-ai | `cohere-ai` | Cohere | Model training |
| CCBot | `CCBot` | Common Crawl | Open training data |
| Amazonbot | `Amazonbot` | Amazon | Alexa/Rufus training |

### 7.3 Behavioral Analysis for Unknown Bots

Not all AI crawlers identify themselves. Some use generic or spoofed User-Agent strings. Behavioral analysis identifies likely AI crawlers through access patterns:

**Signals:**
- Unusually high page-per-session count (50+ pages in minutes)
- No JavaScript execution (JS snippet does not fire but pages are accessed)
- Sequential crawl patterns (alphabetical URL traversal, sitemap-following)
- Consistent request intervals (exactly 2 seconds between requests)
- No CSS/image/font requests (text-only fetching)
- Known AI company IP ranges (where published)

When behavioral analysis identifies a likely AI crawler, it is flagged as "Unidentified AI Bot" in the dashboard until manually classified or matched against a future signature update.

### 7.4 Dashboard Intelligence from Crawler Data

| Insight | What It Tells the User | Action |
|---------|----------------------|--------|
| "GPTBot visited 340 pages this month" | OpenAI is actively reading your content | Your content is being indexed; keep it fresh |
| "PerplexityBot only visits /blog/ pages" | Perplexity ignores your service pages | Add internal links from blog to service pages |
| "No AI bots have visited in 30 days" | AI engines may not know your site exists | Check robots.txt, submit sitemap, create llms.txt |
| "ClaudeBot blocked by robots.txt" | You're preventing Anthropic from reading your site | Update robots.txt to allow AI crawlers |
| "Pages NOT crawled: /services/, /about/" | Important pages are being missed by AI | Improve internal linking, add these pages to sitemap |

---

## 8. Quality & Cost Management

### 8.1 LLM Cost per Operation Type

| Operation | Model Mix | Estimated Cost | Monthly Volume (1K businesses) | Monthly Cost |
|-----------|-----------|---------------|-------------------------------|-------------|
| Free scan (one-time) | 4 engines + Haiku (5 stages × 12 responses = 60 calls) + Sonnet (readiness) | $0.10-0.15 | ~3,000 scans | $300-450 |
| Scheduled scan (recurring) | 4-10 engines + Haiku (5 stages × 200 responses = 1,000 calls) + Sonnet (recommendations) | $1.50-3.00 | ~4,000 scans/month | $6,000-12,000 |
| Agent execution (avg) | Perplexity + Sonnet (x2) + GPT-4o | $0.15-0.40 | ~5,000 executions | $750-2,000 |
| A8 Competitor Intelligence | All engines (3 competitors × 25 queries) + parsing (5 stages × 600 responses) + Sonnet (x2) | $3.00-6.00 | ~500 runs | $1,500-3,000 |
| Ask Beamix (chat turn) | Sonnet | $0.02-0.05 | ~10,000 turns | $200-500 |
| Voice training (one-time) | Opus + Sonnet | $0.14-0.18 | ~200 trainings | $28-36 |
| Content refresh (monthly) | Haiku + Perplexity + Sonnet | $0.20-0.40 | ~2,000 audits | $400-800 |
| **Total estimated monthly LLM cost at 1K businesses** | | | | **$15,000-25,000** |

> **Pricing implication:** At $15K-25K/month LLM cost for 1K businesses, Beamix must achieve $15-25 ARPU minimum across paid tiers to maintain healthy margins. Free tier scans ($0.10-0.15 each) are loss leaders budgeted at <5% of total LLM spend. These estimates are speculative at pre-launch volume (<1K users) and should be re-validated at 100, 500, and 1K paying customers. The previous estimate of $20K-40K was based on per-response parsing counts; corrected per-stage counts reduce the range.

### 8.2 Quality Scoring for Agent Outputs

Every content-producing agent output receives a quality score from the QA gate:

**Scoring Dimensions (each 0-100, weighted):**

| Dimension | Weight | What It Measures | Scoring Model |
|-----------|--------|-----------------|--------------|
| Factual Accuracy | 25% | Are claims verifiable? No hallucinated statistics or companies? | GPT-4o cross-checks against research phase output |
| GEO Optimization | 25% | Does content follow citation-winning patterns? FAQ present? Schema suggested? Natural keyword usage? | GPT-4o evaluates against GEO best practices checklist |
| Readability | 20% | Is the content clear, well-structured, appropriate length? | GPT-4o evaluates structure, flow, and clarity |
| Business Relevance | 15% | Does the content address the specific business's needs and industry? | GPT-4o evaluates against business context |
| Voice Adherence | 15% | Does the content match the business's voice profile (if trained)? | GPT-4o compares against voice profile dimensions |

**Composite Score Thresholds:**
- 80-100: Excellent. Output delivered to user as-is.
- 70-79: Good. Output delivered with minor advisory notes.
- 60-69: Acceptable. Retry generation once with QA feedback injected into the prompt.
- Below 60: Failed. Retry once. If still below 60, fail execution and release credits.

### 8.3 Fallback Chains

Every LLM call has a fallback strategy. No user action should fail silently because an API is down.

| Primary Call | Fallback 1 | Fallback 2 | Final Fallback |
|-------------|-----------|-----------|---------------|
| Claude Sonnet (content generation) | Retry with increased timeout (30s) | GPT-4o as alternative generator | Queue for retry in 15 minutes, notify user |
| GPT-4o (QA gate) | Gemini 1.5 Pro as cross-model QA (maintains cross-vendor principle) | Skip QA, deliver with "unreviewed" flag visible to user | Deliver without QA score, mark "unreviewed" in content library |
| Perplexity sonar-pro (research) | Retry once | Skip research, use business context only | Generate with disclaimer "based on existing data only" |
| Claude Haiku (parsing) | Gemini Flash as alternative parser | Regex-based basic mention detection | Mark as "parse failed," store raw response for manual review |
| Engine query (any) | Retry with exponential backoff (1s, 2s, 4s) | Skip engine, mark as "unavailable" in results | Score computed from available engines only |

**Circuit Breaker Pattern:** If any engine or model fails 5 times within 10 minutes, the circuit breaker opens and that provider is marked "degraded" for 30 minutes. Scans continue with remaining engines. Dashboard shows engine status.

### 8.4 Rate Limiting and Queuing Strategy

**Per-Engine Rate Limits:**

| Engine | Max RPM | Max Concurrent | Cooldown on Error | Daily Budget |
|--------|---------|---------------|-------------------|-------------|
| ChatGPT (OpenAI) | 500 | 50 | 5s | $50 |
| Claude (Anthropic) | 200 | 20 | 5s | $50 |
| Gemini (Google) | 500 | 50 | 3s | $20 |
| Perplexity | 40 | 5 | 10s | $30 |
| Grok (xAI) | 50 | 10 | 5s | $20 |
| DeepSeek | 50 | 10 | 5s | $10 |

**Perplexity Scaling Strategy:**

Perplexity's 40 RPM limit is the tightest bottleneck in the scan pipeline. At 1K businesses, peak scan batches can generate 200+ Perplexity calls in minutes. Mitigation strategies, in order of preference:

1. **Prompt-level caching (24h TTL):** Identical scan prompts across users in the same industry/location produce structurally similar Perplexity responses. Cache Perplexity responses by prompt hash with 24h TTL. At 1K businesses with overlapping industries, this can reduce actual Perplexity calls by 40-60%.
2. **Tier upgrade:** Perplexity offers higher RPM tiers for enterprise accounts. Budget $200-500/month for a Perplexity Pro/Enterprise tier when volume exceeds 30 RPM sustained average.
3. **Off-peak batching:** Schedule scan batches in 15-minute windows, staggered by timezone. Israeli businesses scan at 2-4 AM local time; international businesses at their respective off-peak windows. This spreads Perplexity load across hours instead of concentrating it.
4. **Research-only fallback:** If all above are insufficient, restrict Perplexity to research-phase calls only (agent Stage 1) and replace Perplexity scan queries with Gemini Flash + web search augmentation. This is a quality trade-off and should be a last resort.

**Queuing:** Inngest provides built-in concurrency control. Scan and agent functions declare their concurrency limits in their function configuration. Inngest queues excess invocations and processes them as capacity becomes available. No separate Redis queue is needed until 10K+ users.

**User-Level Limits:**
- Max 3 concurrent agent executions per user
- Scan rate limits enforced per tier (Starter: 1/week manual, Pro: 1/day, Business: 1/hour)
- Ask Beamix: rate limited to 30 turns per hour to prevent abuse

### 8.5 Model Selection Decision Framework

When adding a new LLM-powered feature, the decision follows this framework:

| Question | If Yes | If No |
|----------|--------|-------|
| Does the task require reasoning over 10+ data points? | Sonnet or higher | Haiku |
| Does the task produce user-facing content? | Sonnet (with QA gate) | Haiku for extraction, Flash for classification |
| Does the task require linguistic nuance (voice, narrative, tone)? | Opus (justified) | Sonnet |
| Is the task high-volume (>100 calls/day per user)? | Haiku or Gemini Flash | Sonnet |
| Does quality failure have financial impact (wasted credits)? | Cross-model QA mandatory | Structural validation sufficient |
| Is this a one-time setup task? | Opus acceptable | Use cheapest adequate model |

Every new LLM integration must be logged in the model registry with: task name, chosen model, rationale, estimated cost per call, and expected daily volume.

---

> **This document defines every intelligent operation in Beamix.** Every LLM call type, every pipeline stage, every quality gate, every cost control mechanism. The intelligence layer is not bolted on --- it is the product. Build it with the same rigor you would apply to a database schema or API contract, because in an AI-native product, the prompts ARE the product.

---

## Phase 2 & 3 Intelligence Expansions (March 2026)

> **Source:** Feature planning sprint March 8, 2026. Full engineering specs in `docs/04-features/specs/new-features-batch-[1-3]-spec.md`. Cost analysis in `docs/08-agents_work/AUDITS/PRICING-IMPACT-ANALYSIS.md`. 10 of 11 features approved (F8 Social Monitoring rejected).

---

### F9: 30-Minute Scan Refresh — Engine Rotation Strategy (Business Tier)

**Current state:** `cron.scheduled-scans` runs every 60 minutes. Each full sweep queries all active engines in parallel with 5 Haiku calls per engine response for parsing.

**New state (Strategy D — Priority Rotation):**
- Business tier only: cron interval reduced to 30 minutes
- Each 30-min cycle scans a **priority queue** of 2-3 engines (not all engines)
- Priority order rotates: ChatGPT → Gemini → Perplexity → Claude → Grok → (repeat)
- Full 7-engine sweep completes every ~3.5 hours
- **Model change:** Haiku replaces Sonnet for all priority-cycle parsing; Sonnet reserved for full-sweep cycles
- **Cost impact:** Net flat vs. current hourly (rotation + Haiku tier offset the 2x frequency)
- Starter/Pro remain on hourly cadence

**Inngest changes:**
- `cron.scheduled-scans` gets a `tier` discriminator: Business → 30-min cron, others → 60-min
- New function: `scan.engine-rotation-cycle` — reads priority queue, pops next 2-3 engines, runs scan, updates queue tail
- Existing `scan.full-sweep` retained for daily full sweeps across all tiers

---

### F1: AI Crawler Feed Pipeline (Pro+)

**What it does:** Detects which AI bots (GPTBot, ClaudeBot, PerplexityBot, GoogleBot-Extended) crawl the user's website, which pages, and at what frequency.

**Data ingestion — user must connect one source:**
- **Cloudflare** (OAuth): Reads server-side logs via Cloudflare Logs API — no user code installation
- **Vercel** (OAuth): Reads Edge Function logs with same bot taxonomy
- **Script snippet**: User installs `<script>` tag; beacon fires to `/api/crawler-ping` on each load; UA string parsed server-side

**Processing pipeline:**
1. Log ingestion (Inngest daily cron): Pull raw log entries from connected source
2. Bot classification (algorithmic — no LLM): Match UA strings against `ai_bot_ua_patterns` table
3. Aggregation: Normalize to `crawler_events` table (`bot_name, page_url, crawl_count, last_seen_at, business_id`)
4. Weekly summary (optional Haiku): 3-sentence natural-language crawl summary — "GPTBot crawled 4 pages this week but skipped your Services page"
5. Alert trigger: Key page with 0 crawls in 14 days → `crawler.stale-page-alert` event

**New tables:** `crawler_events`, `ai_bot_ua_patterns`
**LLM cost:** ~$0.02/business/month (Haiku weekly summary only; core is algorithmic)
**Tier:** Pro and Business

---

### F3: Topic/Query Clustering Pipeline (Pro+)

**What it does:** Groups tracked queries into semantic clusters (e.g., "pricing queries," "location queries") to aid navigation above 30+ tracked queries.

**On new query insert:**
1. `query.added` Inngest event fires
2. Haiku classifies query into existing cluster label for the business, or creates new cluster
3. `tracked_queries.cluster_id` updated

**Monthly batch re-cluster:**
1. Inngest monthly cron: `query.recluster-batch`
2. For each business with 20+ queries: generate embeddings (OpenAI `text-embedding-3-small`)
3. k-means clustering in-process (no external ML service needed at this scale)
4. Update `query_clusters` table; regenerate labels via Haiku if cluster membership changed >20%

**New tables:** `query_clusters` (`id, business_id, label, query_ids[], created_at`)
**Column:** `tracked_queries.cluster_id` FK → `query_clusters`
**LLM cost:** ~$0.001/new query (Haiku) + ~$0.05/business/month for monthly batch
**Tier:** Pro and Business

---

### F4: Conversation Explorer Pipeline (Pro+)

**Two modes by tier:**

**Pro — LLM-generated query landscape:**
- User selects industry/niche → Haiku generates 20-30 example queries people in that niche ask AI engines
- Cached 7 days per `(industry, location)` pair
- User can click any query to add to tracked queries
- Cost: ~$0.003-0.012/session (Haiku, aggressive caching)

**Business — Live Perplexity exploration:**
- User enters topic → Perplexity Sonar Pro fetches real "related questions" from live AI conversation landscape
- Real-time; results shown with streaming SSE
- Cost: ~$0.05-0.20/session (Perplexity Sonar Pro)

**Privacy:** Data is never cross-user. Sessions use only the requesting user's business profile. No query aggregation across users to feed another user's explorer.

---

### F6: Browser Simulation Pipeline (Pro+ — 3 No-API Engines)

**Engines covered (no public API exists):**
- Bing Copilot, Google AI Overviews (SGE), Google AI Mode

**Infrastructure:** Browserbase (managed Playwright cloud) at ~$6/Pro user/month for ~60 sessions/month

**Pipeline:**
1. Scheduled scan includes these 3 engines for Pro/Business users
2. Inngest `scan.browser-simulation` sends session request to Browserbase API
3. Playwright script: navigate → type query → wait for AI response → extract text
4. Haiku parses screenshot/HTML: mention status, rank position, sentiment
5. Results → `scan_engine_results` (same schema; `engine` = `'copilot'` | `'ai_overviews'` | `'google_ai_mode'`)

**LLM cost:** $0.30/month (Haiku parsing) + $6/month (Browserbase) = ~$6.30/Pro user/month
**Tier:** Pro and Business

---

### F7: Web Mention Tracking Pipeline (All paid tiers)

**What it does:** Tracks brand mentions on the traditional web (news, blogs, forums) — linked and unlinked citations.

**Implementation via Perplexity leverage:**
- Perplexity brand-search query: `"[business_name]" site:news OR site:blog OR site:reddit`
- Haiku extracts: mention URL, source type, linked vs. unlinked, sentiment
- Stored in `web_mentions` (`id, business_id, mention_url, source_type, is_linked, sentiment, excerpt, found_at, scan_cycle_id`)

**Cadence:** Starter: weekly | Pro: daily | Business: daily + on-demand trigger

**Alert integration:** Negative sentiment mention → `mention.negative-alert` event → row in `alerts` table

**LLM cost:** ~$0.03-0.25/business/month depending on tier cadence
**Tier:** All paid tiers

---

### F10: City-Level / Multi-Region Scanning (Starter: 1, Pro: 5, Business: unlimited)

**What it does:** Appends location modifiers to tracked queries; stores results per-location; enables visibility comparison across cities.

**Schema changes:**
- New table: `scan_regions` (`id, business_id, region_label, location_modifier, is_primary`)
  - Example: `{region_label: "Tel Aviv", location_modifier: " בתל אביב"}` (Hebrew) or `" in Tel Aviv"` (English)
- `scan_engine_results` gains `region_id` column (FK → `scan_regions`, nullable)

**Execution:** For each active query × each active region → generates location-specific query variant → scanned in parallel (same Inngest concurrency model)

**Non-primary region cadence:** Non-primary regions scanned every 6 hours (not 30-min), mitigating linear cost growth

**Hebrew context:** Location modifiers added in the query's language — Hebrew queries get Hebrew modifiers, English get English.

**Tier limits:** Starter: 1 region (auto-set from business city in profile) | Pro: up to 5 | Business: unlimited (cap 20 recommended for cost control)
**Cost:** ~$2.30/city/month per Pro user (mitigated cadence)

---

### F11: Prompt Volume Data — GSC Integration (Pro+)

**What it does:** Shows estimated monthly query volume for tracked queries using Google Search Console as the primary source.

**GSC path (approved, primary):**
1. User connects GSC in Settings → Integrations (OAuth)
2. Beamix fetches query performance data via Google Search Console API
3. Query volume for matching queries stored as `prompt_volume_estimate` in `tracked_queries`
4. Displayed as "Prompt Volume" column in Rankings page

**Internal panel (all tiers — secondary source):**
- Anonymized aggregation of how often each query template is tracked across all Beamix users in same industry
- Shown as Low/Medium/High/Very High category (not exact numbers)

**Rejected path:** Paid keyword APIs (Semrush, Ahrefs, Keyword Planner) — $0.01-0.05/query at scale. Do not implement.

**LLM cost:** $0 (fully algorithmic)
**Tier:** GSC-sourced exact volume: Pro+; Internal panel categories: all tiers

---

### Updated LLM Cost Model (Post March 2026)

| Tier | Baseline | F1 | F3 | F4 | F6 Browser | F7 Mentions | F9 Savings | F10/city | **Net Delta** |
|------|---------|----|----|----|-----------|-----------|-----------|---------|--------------|
| Starter | $5-8 | $0 | $0 | $0 | $0 | $0.03 | $0 | $0 (1 region) | **+$0.03** |
| Pro | $15-20 | $0.02 | $0.05 | $0.10 | $6.30 | $0.15 | $0 | $2.30 × n | **+$6-9 + cities** |
| Business | $20-25 | $0.02 | $0.05 | $0.20 | $6.30 | $0.25 | **−$15.30** | $2.30 × n (capped) | **−$8 net** |

**Key insight:** Business tier saves money after F9 rotation. Pro adds $6-9/month — well within Pro margin. Starter adds ~$0. Business price increase to $449 (from $349) is under evaluation for the F6+F9+F10 value unlock.

---

### F8: Social Platform Monitoring — Evaluated and Rejected (March 2026)

YouTube/TikTok/Reddit social monitoring was analyzed and **rejected as out of scope** for Beamix's GEO positioning:
- Social mentions ≠ AI engine visibility — different product category entirely
- YouTube API costs unpredictable at scale ($50-200/month per business)
- Ahrefs Brand Radar already owns this space; Beamix has no defensible differentiation
- Adds scope without strengthening the "AI search visibility" narrative

**Decision: Do not build.** Re-evaluate only as a separate product or third-party partnership (Ahrefs/Brand24 integration).

# Content Writer Agent - Detailed Specifications

**Agent Name:** Content Writer Agent
**Purpose:** Generate LLM-optimized articles, blog posts, FAQs, and service pages for users
**Cost:** 3 credits per execution
**Priority:** P0 (Must-Have for MVP)
**Estimated Development Time:** 1-2 days

---

## Overview

The Content Writer Agent is the **highest-value agent** in the platform. It allows users to generate professional, LLM-optimized content with one click, solving the primary pain point: "I don't know how to write content that ranks well in ChatGPT/Claude."

**User Flow:**
1. User sees recommendation: "Write an article about [topic]"
2. User clicks "Generate Article" button
3. Modal opens with pre-filled topic (or user enters custom topic)
4. User clicks "Generate" → agent executes → loading state
5. After 2-5 minutes, article is delivered in modal (Markdown format)
6. User can download, copy, or regenerate

---

## Agent Responsibilities

### Input Requirements

The agent receives:

```json
{
  "topic": "Best relocation services in Tel Aviv",
  "business_context": {
    "business_name": "MoveMaster Relocation",
    "location": "Tel Aviv, Israel",
    "industry_vertical": "relocation_services",
    "services": ["international moving", "packing", "storage"],
    "website": "https://example.com"
  },
  "user_id": "uuid-here",
  "business_id": "uuid-here"
}
```

**Required Fields:**
- `topic` (string): What to write about (e.g., "Best relocation services in Tel Aviv")
- `business_context` (object): Business name, location, services

**Optional Fields:**
- `target_word_count` (number): Default 1,200 words (range: 800-1,500)
- `tone` (string): Default "professional" (options: "professional", "friendly", "expert")
- `include_faq` (boolean): Default true (add FAQ section)

---

### Output Specification

The agent returns:

```json
{
  "content": "# Best Relocation Services in Tel Aviv\n\n...",
  "format": "markdown",
  "word_count": 1247,
  "estimated_reading_time": "6 min",
  "seo_score": 85,
  "llm_optimization_score": 92,
  "sections": [
    { "heading": "Introduction", "word_count": 150 },
    { "heading": "Why Choose Professional Relocation Services?", "word_count": 300 },
    { "heading": "Top Features of MoveMaster Relocation", "word_count": 400 },
    { "heading": "Pricing Guide", "word_count": 200 },
    { "heading": "FAQ", "word_count": 197 }
  ],
  "metadata": {
    "entity_mentions": 5,
    "schema_ready": true,
    "citations_included": true
  }
}
```

**Content Requirements:**

1. **Structure:**
   - H1 title (topic-focused, keyword-rich)
   - Introduction (100-150 words, direct answer to query)
   - 3-5 H2 sections (substantive content)
   - FAQ section (5-7 questions)
   - Optional: Conclusion (50-100 words)

2. **LLM Optimization Features:**
   - **Direct Answer First:** First 100 words must directly answer the query (LLMs prioritize content that answers quickly)
   - **Entity Mentions:** Business name mentioned 3-5 times naturally (not spammy)
   - **Structured Data Ready:** Use H2/H3 headings consistently (schema-friendly)
   - **Specificity:** Include numbers, data, specific examples (e.g., "15 years of experience", "500+ successful moves")
   - **Authoritative Tone:** Use active voice, simple language, factual statements

3. **Quality Standards:**
   - **No Marketing Fluff:** Avoid vague claims like "the best in the business" without supporting evidence
   - **Helpful, Not Salesy:** Focus on educating the user, not hard-selling
   - **Readable:** Short paragraphs (2-4 sentences), bullet points where appropriate
   - **Accurate:** No false claims (if data is unavailable, omit or use "varies by project")

4. **FAQ Section Format:**
```markdown
## Frequently Asked Questions

### How much does relocation cost in Tel Aviv?
Relocation costs in Tel Aviv typically range from $1,500 to $5,000 depending on the size of your home, distance, and additional services like packing and storage. MoveMaster Relocation offers free estimates.

### How long does a relocation take?
A standard relocation within Tel Aviv takes 1-2 days. International relocations can take 7-14 days depending on customs and shipping routes.
```

---

## Technical Implementation

### n8n Workflow Structure

**Workflow Name:** `content_writer_agent`

**Trigger:** Webhook (POST from backend)

**Steps:**

```yaml
1. Webhook Trigger
   - Receives: { topic, business_context, user_id, business_id }
   - Validates: topic is not empty, business_context has required fields

2. Credit Check (HTTP Request to Backend)
   - Endpoint: POST /api/credits/validate
   - Body: { user_id, credits_required: 3 }
   - If insufficient credits → return error → frontend shows "Not enough credits"

3. GPT-4o API Call (OpenAI Node)
   - Model: gpt-4o
   - Max Tokens: 2000 (for 1,200-1,500 word output)
   - Temperature: 0.7 (balance between creativity and consistency)
   - Prompt Template: (see below)

4. Parse Response
   - Extract: article content (markdown)
   - Calculate: word count, reading time
   - Validate: content meets minimum quality (>800 words, has H1/H2 structure)

5. Store in Database (Supabase Insert)
   - Table: generated_content
   - Fields: business_id, agent_type: 'content_writer', input_params, output_content, credits_cost: 3, timestamp

6. Deduct Credits (HTTP Request to Backend)
   - Endpoint: POST /api/credits/deduct
   - Body: { user_id, credits_to_deduct: 3, agent_type: 'content_writer', content_id: [generated_id] }

7. Return Response
   - Success: { content, metadata, content_id }
   - Error: { error: "message" }
```

---

### GPT-4o Prompt Template

**System Prompt:**
```
You are a professional GEO (Generative Engine Optimization) content writer. Your articles are optimized to rank well in LLM search results (ChatGPT, Claude, Perplexity, Gemini) by providing clear, direct answers with structured information.

Write content that is:
- Factual and helpful (not marketing fluff)
- Well-structured with clear headings
- Optimized for LLM citation (direct answers, entity mentions, specificity)
- Professional but readable
```

**User Prompt:**
```
Write a 1,200-word article about: {topic}

Business Context:
- Business Name: {business_name}
- Location: {location}
- Industry: {industry_vertical}
- Services: {services}
- Website: {website}

Requirements:
1. Answer the query directly in the first 100 words
2. Use H2/H3 headings with clear, keyword-rich titles
3. Mention {business_name} naturally 3-5 times (not spammy)
4. Include specific details: numbers, data, examples
5. Add a FAQ section with 5-7 questions relevant to {topic}
6. Use active voice, simple language, short paragraphs
7. No vague marketing claims - be factual

Tone: Professional and authoritative

Output Format: Markdown with H1 title, H2 sections, H3 subsections as needed

Example FAQ Question:
### How much does {service} cost in {location}?
[Direct answer with specifics]

Now write the article:
```

**Example Output:**
```markdown
# Best Relocation Services in Tel Aviv: A Complete Guide

When searching for relocation services in Tel Aviv, you need a company that combines professionalism, efficiency, and local expertise. MoveMaster Relocation has been serving Tel Aviv residents and international clients for over 15 years, specializing in seamless residential and commercial moves across Israel and worldwide.

## Why Professional Relocation Services Matter

Relocating to or from Tel Aviv presents unique challenges...

[Content continues...]

## Frequently Asked Questions

### How much does relocation cost in Tel Aviv?
...
```

---

## Error Handling

**Possible Errors:**

1. **Insufficient Credits**
   - Detection: Step 2 (Credit Check) returns `credits_available < 3`
   - Response: `{ error: "Insufficient credits. You have 2 credits remaining. Upgrade your plan or wait for next billing cycle." }`
   - Frontend Action: Display error modal with link to upgrade subscription

2. **GPT-4o API Failure**
   - Detection: OpenAI API returns error (rate limit, timeout, invalid request)
   - Response: `{ error: "Content generation failed. Please try again in a few minutes." }`
   - Retry Logic: Retry up to 2 times with exponential backoff (5s, 10s)
   - Frontend Action: Display error message, allow user to retry

3. **Content Quality Validation Failed**
   - Detection: Generated content <800 words OR missing H1/H2 structure
   - Response: `{ error: "Generated content did not meet quality standards. Retrying..." }`
   - Action: Automatically retry generation with slightly different prompt

4. **Database Write Failure**
   - Detection: Supabase insert fails
   - Response: `{ error: "Failed to save content. Please contact support." }`
   - Action: Log error to Sentry, notify admin

---

## User Experience Specifications

### Frontend UI Flow

**1. Trigger Point (From Recommendation):**

User sees recommendation card:
```
┌────────────────────────────────────────────┐
│ ⚡ HIGH IMPACT RECOMMENDATION               │
│                                            │
│ Write an article about:                    │
│ "Best relocation services in Tel Aviv"     │
│                                            │
│ Why: You rank #6 for this query.          │
│      Competitor ranks #1 with article.     │
│                                            │
│ Estimated Time: 3-5 min                    │
│ Cost: 3 credits                            │
│                                            │
│ [Generate Article] [Dismiss]              │
└────────────────────────────────────────────┘
```

User clicks "Generate Article" → Modal opens

---

**2. Generation Modal:**

```
┌───────────────────────────────────────────────────┐
│  Generate Article with Content Writer Agent      │
│                                                   │
│  Topic                                            │
│  ┌─────────────────────────────────────────────┐ │
│  │ Best relocation services in Tel Aviv        │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Word Count (Optional)                            │
│  ┌─────────────────────────────────────────────┐ │
│  │ 1,200 words                     ▼           │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Tone (Optional)                                  │
│  ● Professional  ○ Friendly  ○ Expert            │
│                                                   │
│  ☑ Include FAQ section (5-7 questions)           │
│                                                   │
│  Credits Required: 3                              │
│  Your Balance: 27 credits                         │
│                                                   │
│  [Cancel]              [Generate Article]         │
└───────────────────────────────────────────────────┘
```

User clicks "Generate Article" → Loading state

---

**3. Loading State:**

```
┌───────────────────────────────────────────────────┐
│  Generating Your Article...                      │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  ⏳ Analyzing topic...                       │ │
│  │  ⏳ Researching industry trends...           │ │
│  │  ⏳ Writing content (1,200 words)...  65%   │ │
│  │  ○ Adding FAQ section...                    │ │
│  │  ○ Optimizing for LLMs...                   │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Estimated Time Remaining: 2 minutes              │
│                                                   │
│  [Cancel Generation]                              │
└───────────────────────────────────────────────────┘
```

**Progress Steps:**
1. Analyzing topic... (5s)
2. Researching industry trends... (10s)
3. Writing content... (60-90s, progress bar 0% → 100%)
4. Adding FAQ section... (20s)
5. Optimizing for LLMs... (10s)

**Implementation Note:** These are simulated progress steps (not real-time GPT-4o feedback). Use setTimeout intervals to show progress.

---

**4. Success State:**

```
┌───────────────────────────────────────────────────┐
│  ✓ Article Generated Successfully!               │
│                                                   │
│  Title: Best Relocation Services in Tel Aviv:    │
│         A Complete Guide                          │
│                                                   │
│  Word Count: 1,247 words                          │
│  Reading Time: ~6 minutes                         │
│  LLM Optimization Score: 92/100                   │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ # Best Relocation Services in Tel Aviv:     │ │
│  │ A Complete Guide                             │ │
│  │                                              │ │
│  │ When searching for relocation services...   │ │
│  │ [Scrollable preview, 10 lines visible]      │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Download Markdown] [Copy to Clipboard] [Close] │
│  [Regenerate (3 credits)]                         │
└───────────────────────────────────────────────────┘
```

**Actions:**
- **Download Markdown:** Downloads `article-[timestamp].md` file
- **Copy to Clipboard:** Copies markdown content to clipboard, shows toast "Copied!"
- **Regenerate:** Runs agent again (deducts 3 more credits), useful if user doesn't like first output
- **Close:** Closes modal, content is saved in `generated_content` table and accessible in "My Content" section

---

## Quality Assurance Checklist

**Before Deploying Content Writer Agent:**

- [ ] Generated articles are 800-1,500 words (validate in code)
- [ ] First 100 words directly answer the query (manual review of 5 test articles)
- [ ] Business name appears 3-5 times naturally (not spammy - manual review)
- [ ] FAQ section has 5-7 questions with direct answers (validate in code)
- [ ] No marketing fluff or vague claims (manual review)
- [ ] Markdown structure is correct (H1, H2, H3 hierarchy - validate in code)
- [ ] Credits are deducted correctly (test with low-credit account)
- [ ] Error handling works (test: insufficient credits, API failure, timeout)
- [ ] Loading states are smooth (test on slow connection)

---

## Performance Metrics

**Agent Performance Targets:**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Execution Time** | 2-5 minutes (p95 <6 min) | n8n workflow logs |
| **Success Rate** | >95% (API failures <5%) | Error logs, Sentry |
| **User Satisfaction** | >80% of users download/use generated content | Track download/copy button clicks |
| **Quality Score** | >85/100 LLM optimization score | Internal scoring algorithm (checks: direct answer, entity mentions, structure) |
| **Word Count Accuracy** | 90% of articles within 1,000-1,500 words | Database analytics |

---

## API Cost Analysis

**Per Execution:**

**GPT-4o Pricing (Feb 2026):**
- Input: $0.015 / 1K tokens
- Output: $0.060 / 1K tokens

**Typical Usage:**
- Input (prompt): ~300 tokens = $0.0045
- Output (article): ~1,500 tokens = $0.090
- **Total: ~$0.095 per execution**

**Credit Economics:**
- User pays: 3 credits = $0.15 (if 1 credit = $0.05)
- Our cost: $0.095
- **Margin: $0.055 per execution**

**At Scale (100 executions/month):**
- Revenue: 100 × $0.15 = $15
- Cost: 100 × $0.095 = $9.50
- **Profit: $5.50/month**

---

## Future Enhancements (Post-MVP)

**Phase 2 Features:**

1. **Multi-Format Output:**
   - Currently: Markdown only
   - Future: HTML (with inline styles), Google Docs (via API), WordPress (direct publish)

2. **Tone Customization:**
   - Currently: 3 tone options (Professional, Friendly, Expert)
   - Future: Custom tone based on user's writing samples ("Sound like my brand")

3. **Multi-Language Support:**
   - Currently: English only
   - Future: Hebrew, Spanish, French (user selects language)

4. **Iterative Editing:**
   - Currently: Regenerate entire article
   - Future: "Edit Section" (regenerate only H2 section), "Expand FAQ" (add more questions)

5. **Content Scoring:**
   - Currently: LLM Optimization Score (simple algorithm)
   - Future: Detailed scoring breakdown (readability, keyword density, citation likelihood)

---

## Developer Notes

**For Claude Code:**

**Implementation Steps:**

1. **Create n8n workflow `content_writer_agent`:**
   - Use n8n Cloud (not self-hosted)
   - Add nodes: Webhook Trigger, HTTP Request (credit check), OpenAI (GPT-4o), Code (parse/validate), Supabase Insert, HTTP Request (deduct credits)
   - Test with sample input: `{ "topic": "Best relocation services in Tel Aviv", "business_context": {...} }`

2. **Create backend API endpoint `/api/agents/content-writer`:**
   - Validate user has >=3 credits before triggering n8n
   - Return job ID immediately (don't wait for n8n to complete)
   - Set up webhook callback from n8n to notify frontend when complete

3. **Create frontend UI:**
   - Recommendation card component (display recommendation with "Generate Article" button)
   - Generation modal component (input form, loading state, success state)
   - Integrate with React Query for data fetching
   - Add to Dashboard: "My Generated Content" section (list of past articles)

4. **Test end-to-end:**
   - User with 10 credits clicks "Generate Article"
   - Article generates successfully
   - Credits deduct to 7
   - Article appears in "My Generated Content"
   - User clicks "Download Markdown" → file downloads

**Code Structure Recommendations:**

```
src/
├── components/
│   ├── agents/
│   │   ├── ContentWriterModal.tsx (main modal component)
│   │   ├── ContentWriterForm.tsx (input form)
│   │   ├── ContentWriterLoadingState.tsx (progress animation)
│   │   ├── ContentWriterSuccessState.tsx (preview + download)
│   ├── recommendations/
│   │   └── RecommendationCard.tsx (displays recommendation + trigger button)
├── hooks/
│   ├── useContentWriterAgent.ts (React Query hook for API calls)
│   └── useUserCredits.ts (fetch + update credits)
├── api/
│   └── agents/
│       └── content-writer.ts (Next.js API route)
```

**Key Considerations:**

- **Async Execution:** Don't block frontend while n8n runs (2-5 min). Use polling or webhooks to notify when complete.
- **Error Recovery:** If GPT-4o fails, retry automatically (max 2 retries). If still fails, refund credits.
- **Content Storage:** Store generated content in `generated_content` table with TTL (delete after 90 days to save storage costs).

---

**END OF CONTENT WRITER AGENT SPECS**

**Next Document:** Read `AGENT_02_CompetitorResearch.md` for Competitor Research Agent specifications.
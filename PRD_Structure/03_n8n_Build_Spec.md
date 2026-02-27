# n8n Cloud Build Specification

## Overview
Complete n8n Cloud workflow specifications for all AI agents and automation tasks. n8n orchestrates the entire AI pipeline: ranking checks, content generation, competitive analysis, and recommendation generation. All workflows use n8n Cloud (not self-hosted) and integrate with Supabase, OpenAI, Anthropic, Perplexity, and Gemini APIs.

---

## n8n Cloud Configuration

### Account Setup
- **Plan:** Pro or Business (supports credential encryption, webhook URLs, execution history)
- **Region:** US or EU (closest to Supabase instance)
- **Execution Mode:** Queue mode for parallel processing
- **Timezone:** UTC for all timestamps

### Global Settings
- **Execution Timeout:** 5 minutes per workflow (default), 10 minutes for content generation
- **Retry Strategy:** 3 retries with exponential backoff (2s, 4s, 8s)
- **Error Workflow:** Global error handler that logs to Supabase and sends alerts
- **Execution Data:** Keep execution data for 7 days for debugging

---

## Credentials & Environment Variables

### Supabase Credentials
- **Name:** `Supabase_Production`
- **Type:** HTTP Request with headers
- **URL:** SUPABASE_URL
- **API Key:** SUPABASE_SERVICE_ROLE_KEY (service role for bypassing RLS)

### OpenAI Credentials
- **Name:** `OpenAI_API`
- **Type:** OpenAI API
- **API Key:** OPENAI_API_KEY
- **Organization ID:** (optional)

### Anthropic Credentials
- **Name:** `Anthropic_API`
- **Type:** HTTP Request with headers
- **URL:** https://api.anthropic.com
- **API Key:** ANTHROPIC_API_KEY (x-api-key header)

### Perplexity Credentials
- **Name:** `Perplexity_API`
- **Type:** HTTP Request with headers
- **URL:** https://api.perplexity.ai
- **API Key:** PERPLEXITY_API_KEY

### Gemini Credentials
- **Name:** `Gemini_API`
- **Type:** HTTP Request with query param
- **URL:** https://generativelanguage.googleapis.com
- **API Key:** GEMINI_API_KEY (as query parameter)

---

## Workflow 1: Initial Analysis

### Purpose
When user completes onboarding and adds their first tracked queries, perform initial competitive landscape analysis and generate first set of recommendations.

### Trigger
- **Type:** Webhook
- **Method:** POST
- **Endpoint:** `/webhook/initial-analysis`
- **Authentication:** API key header (n8n webhook token)

### Input Schema
```json
{
  "user_id": "uuid",
  "business_name": "string",
  "website_url": "string",
  "industry": "string",
  "queries": [
    {
      "query_id": "uuid",
      "query_text": "string",
      "target_url": "string"
    }
  ]
}
```

### Workflow Steps

#### 1. Validate Input (Function Node)
- Check required fields present
- Validate UUID format
- Validate queries array not empty

#### 2. Create Agent Execution Record (HTTP Request)
- **Method:** POST
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/agent_executions`
- **Headers:** Authorization (service role), Prefer: return=representation
- **Body:**
```json
{
  "user_id": "{{$json.user_id}}",
  "agent_type": "initial_analysis",
  "execution_status": "running",
  "input_data": "{{$json}}",
  "started_at": "{{$now}}"
}
```
- **Save execution_id** for later updates

#### 3. Initial Ranking Check for All LLMs (Loop Node)
For each query in input, check all 5 LLM providers in parallel:

**3a. ChatGPT Ranking Check (HTTP Request to OpenAI)**
- **Model:** gpt-4o
- **Prompt Template:**
```
You are analyzing search query results for business visibility tracking.

Query: "{{$json.query_text}}"
Business Name: "{{$json.business_name}}"
Target URL: "{{$json.target_url}}"

Provide a comprehensive answer to this query as you would to a user asking for information. Be detailed and mention relevant businesses, solutions, or resources.

After your response, analyze:
1. Is {{$json.business_name}} or {{$json.target_url}} mentioned in your response?
2. If yes, at what position (1st mention, 2nd mention, etc.)?
3. What is the context of the mention (e.g., recommended, compared to others, briefly mentioned)?
4. What other brands/businesses did you mention?
5. What is the overall sentiment toward this business (positive, neutral, negative)?

Format your analysis as JSON:
{
  "response": "full response text",
  "is_mentioned": true/false,
  "mention_position": number or null,
  "mention_context": "text snippet",
  "competitors_mentioned": ["brand1", "brand2"],
  "sentiment": "positive/neutral/negative"
}
```
- **Temperature:** 0.7
- **Max Tokens:** 2000
- **Parse response** and extract JSON

**3b. Claude Ranking Check (HTTP Request to Anthropic)**
- **Model:** claude-opus-4-5-20251101
- **Prompt:** Similar structure to ChatGPT
- **Headers:** x-api-key, anthropic-version: 2023-06-01
- **Body format:** Anthropic Messages API format

**3c. Perplexity Ranking Check (HTTP Request)**
- **Model:** sonar-pro
- **Prompt:** Similar structure
- **Note:** Perplexity provides citations - extract and analyze those

**3d. Gemini Ranking Check (HTTP Request)**
- **Model:** gemini-2.0-flash-exp
- **Endpoint:** /v1beta/models/gemini-2.0-flash-exp:generateContent
- **Prompt:** Similar structure

**3e. Google AI Overviews Check (Web Scraping Node - Phase 2)**
- **Method:** Simulate search and parse AI Overview section
- **Note:** Requires more complex setup with browser automation

#### 4. Store Initial Rankings (Loop + HTTP Request)
For each LLM response, insert into llm_rankings table:
- **Method:** POST
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/llm_rankings`
- **Body:**
```json
{
  "query_id": "{{$json.query_id}}",
  "user_id": "{{$json.user_id}}",
  "llm_provider": "{{$json.provider}}",
  "is_mentioned": "{{$json.is_mentioned}}",
  "mention_position": "{{$json.mention_position}}",
  "mention_context": "{{$json.mention_context}}",
  "sentiment": "{{$json.sentiment}}",
  "competitors_mentioned": "{{$json.competitors_mentioned}}",
  "full_response_summary": "{{$json.response.substring(0, 500)}}",
  "raw_response_hash": "{{$hash($json.response)}}",
  "checked_at": "{{$now}}"
}
```

#### 5. Generate Initial Recommendations (HTTP Request to Claude)
**Model:** claude-opus-4-5-20251101
**Prompt Template:**
```
You are a GEO (Generative Engine Optimization) consultant analyzing LLM visibility for a business.

Business Details:
- Name: {{$json.business_name}}
- Industry: {{$json.industry}}
- Website: {{$json.website_url}}

Tracked Queries: {{$json.queries}}

LLM Ranking Results: {{$json.ranking_results}}

Based on this data, generate 3-5 high-priority recommendations to improve visibility in LLM search results. For each recommendation:

1. Identify specific gaps or opportunities
2. Provide actionable steps
3. Estimate potential impact
4. Specify which queries/LLMs this targets

Format as JSON array:
[
  {
    "recommendation_type": "content_gap/keyword_optimization/competitor_insight/technical_seo",
    "priority": "critical/high/medium/low",
    "title": "Short headline",
    "description": "Detailed explanation",
    "action_items": ["step 1", "step 2", "step 3"],
    "expected_impact": "high/medium/low",
    "supporting_data": {
      "affected_queries": ["query1", "query2"],
      "current_mention_rate": "2/5 LLMs",
      "competitor_advantage": "details"
    }
  }
]
```
- **Temperature:** 0.7
- **Max Tokens:** 4000

#### 6. Store Recommendations (Loop + HTTP Request)
For each recommendation, insert into recommendations table:
- **Method:** POST
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/recommendations`

#### 7. Update Agent Execution (HTTP Request)
- **Method:** PATCH
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/agent_executions?id=eq.{{$node["Create Agent Execution Record"].json.id}}`
- **Body:**
```json
{
  "execution_status": "completed",
  "output_data": {
    "rankings_checked": "{{$json.rankings_count}}",
    "recommendations_generated": "{{$json.recommendations_count}}"
  },
  "completed_at": "{{$now}}",
  "execution_duration_ms": "{{$now - $node["Create Agent Execution Record"].json.started_at}}"
}
```

#### 8. Error Handler (Sub-workflow)
If any step fails:
1. Log error to agent_executions table
2. Send notification to user
3. Alert development team (webhook to monitoring tool)

### Cost Tracking
- Total credits: ~0 (part of onboarding, not charged)
- Actual API costs: ~$0.50-1.00 per user (5 queries × 5 LLMs × $0.02 average)

---

## Workflow 2: Content Writer Agent

### Purpose
Generate optimized content based on user inputs to improve LLM visibility.

### Trigger
- **Type:** Webhook
- **Method:** POST
- **Endpoint:** `/webhook/content-writer`
- **Authentication:** Bearer token (user's session token validated against Supabase)

### Input Schema
```json
{
  "user_id": "uuid",
  "content_type": "blog_post|faq|product_description|landing_page",
  "topic": "string",
  "target_queries": ["query1", "query2"],
  "tone": "professional|casual|technical|friendly",
  "length": "short|medium|long",
  "key_points": ["point1", "point2"],
  "competitor_urls": ["url1", "url2"] // optional
}
```

### Workflow Steps

#### 1. Check User Credits (HTTP Request)
- **Method:** GET
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/credits?user_id=eq.{{$json.user_id}}`
- **Check:** If total_credits < 3, return error "Insufficient credits"

#### 2. Create Agent Execution Record
Same as Initial Analysis workflow

#### 3. Analyze Competitor Content (If URLs provided)
**Loop through competitor_urls:**
- **Web Scraper Node:** Extract main content from URL
- **HTTP Request to Claude:**
  - Model: claude-sonnet-4-5-20250929 (faster, cheaper for analysis)
  - Prompt: "Analyze this content and identify: key themes, structure, tone, unique value propositions, SEO keywords"
  - Max tokens: 1500

#### 4. Research Target Queries (HTTP Request to Perplexity)
**For each target query:**
- **Model:** sonar-pro
- **Prompt:**
```
Research this query comprehensively: "{{$json.query}}"

Provide:
1. Current top answers/perspectives from web sources
2. Common questions people ask about this topic
3. Key facts and statistics
4. Expert opinions or authoritative sources
5. Gaps in current information

Focus on information that would help someone create comprehensive, authoritative content.
```
- **Use citations** from Perplexity response

#### 5. Generate Content Outline (HTTP Request to Claude)
- **Model:** claude-opus-4-5-20251101
- **Prompt Template:**
```
You are an expert content strategist specializing in GEO (Generative Engine Optimization).

Task: Create a detailed content outline for {{$json.content_type}}

Topic: {{$json.topic}}
Target Queries: {{$json.target_queries}}
Tone: {{$json.tone}}
Length: {{$json.length}}
Key Points to Cover: {{$json.key_points}}

Research Data: {{$node["Research Target Queries"].json}}
Competitor Analysis: {{$node["Analyze Competitor Content"].json}}

Create an outline that:
1. Directly answers the target queries comprehensively
2. Includes facts, statistics, and authoritative information
3. Uses the specified tone and style
4. Differentiates from competitor content
5. Is optimized for LLM understanding and citation

Format as detailed hierarchical outline with section summaries.
```
- **Temperature:** 0.8
- **Max Tokens:** 2000

#### 6. Generate Full Content (HTTP Request to Claude)
- **Model:** claude-opus-4-5-20251101
- **Prompt Template:**
```
You are an expert content writer specializing in GEO-optimized content.

Using this outline: {{$node["Generate Content Outline"].json.outline}}

Write complete {{$json.content_type}} content that:

Requirements:
- Length: {{$json.length}} (short=500-800 words, medium=800-1500 words, long=1500-2500 words)
- Tone: {{$json.tone}}
- Target Queries: {{$json.target_queries}}
- Key Points: {{$json.key_points}}

Optimization Guidelines:
1. Start with a clear, direct answer to the main query
2. Use structured format (headings, bullet points, numbered lists)
3. Include specific facts, data, and examples
4. Write in clear, authoritative language
5. Make it easy for LLMs to extract and cite key information
6. Include semantic variations of target keywords naturally
7. Provide unique insights or perspectives
8. Use credible sources and data

Output the full content ready for publishing.
```
- **Temperature:** 0.7
- **Max Tokens:** 4000

#### 7. Quality Assessment (HTTP Request to GPT-4o)
- **Model:** gpt-4o
- **Prompt:**
```
Evaluate this content for quality and GEO optimization:

Content: {{$node["Generate Full Content"].json}}
Target Queries: {{$json.target_queries}}

Rate on scale 0-1:
1. Relevance to target queries
2. Factual accuracy and authority
3. Clarity and readability
4. Structure and formatting
5. Uniqueness and insights
6. LLM-friendliness (easy to parse and cite)

Overall Quality Score: (0-1)
Issues Found: [list any problems]
Suggestions: [improvement recommendations]

Format as JSON.
```
- **If quality_score < 0.7:** Regenerate with feedback

#### 8. Calculate Word Count & Costs
- **Function Node:**
  - Count words in generated content
  - Calculate API costs:
    - Claude Opus: $15/1M input tokens, $75/1M output tokens
    - Perplexity Sonar Pro: $5/1M tokens
    - GPT-4o: $2.50/1M input, $10/1M output
  - Estimate: ~$0.08-0.12 per content generation
  - Credits to deduct: 3

#### 9. Deduct Credits (HTTP Request)
- **Method:** POST
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/rpc/deduct_credits`
- **Body:**
```json
{
  "user_id": "{{$json.user_id}}",
  "amount": 3,
  "entity_type": "content_generation",
  "entity_id": "{{$json.execution_id}}",
  "description": "Content Writer Agent - {{$json.content_type}}"
}
```
- **If fails:** Rollback, return error

#### 10. Store Content Generation (HTTP Request)
- **Method:** POST
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/content_generations`
- **Body:**
```json
{
  "user_id": "{{$json.user_id}}",
  "agent_type": "content_writer",
  "input_parameters": "{{$json.input}}",
  "generated_content": "{{$node["Generate Full Content"].json}}",
  "content_format": "{{$json.content_type}}",
  "word_count": "{{$json.word_count}}",
  "credits_used": 3,
  "execution_time_ms": "{{$json.duration}}",
  "llm_models_used": {
    "claude_opus": {"cost": 0.08, "tokens": 3200},
    "perplexity": {"cost": 0.02, "tokens": 800},
    "gpt4o": {"cost": 0.02, "tokens": 500}
  },
  "quality_score": "{{$json.quality_score}}"
}
```

#### 11. Update Agent Execution Record
Mark as completed with full output data

#### 12. Return Response to Frontend (Respond to Webhook)
- **Status:** 200
- **Body:**
```json
{
  "success": true,
  "content_id": "{{$json.content_id}}",
  "generated_content": "{{$json.content}}",
  "word_count": "{{$json.word_count}}",
  "quality_score": "{{$json.quality_score}}",
  "credits_used": 3,
  "credits_remaining": "{{$json.new_balance}}"
}
```

### Error Handling
- **Insufficient Credits:** Return 402 Payment Required
- **API Failures:** Retry 3 times, then return 503 Service Unavailable
- **Quality Check Failure:** Attempt regeneration once, then return with warning flag
- **Timeout:** If exceeds 10 minutes, cancel and refund credits

---

## Workflow 3: Competitor Research Agent

### Purpose
Analyze competitor visibility across LLMs and provide competitive intelligence.

### Trigger
- **Type:** Webhook
- **Method:** POST
- **Endpoint:** `/webhook/competitor-research`

### Input Schema
```json
{
  "user_id": "uuid",
  "business_name": "string",
  "competitor_names": ["competitor1", "competitor2"],
  "queries": ["query1", "query2"],
  "analysis_depth": "quick|comprehensive"
}
```

### Workflow Steps

#### 1. Check Credits (5 credits for quick, 10 for comprehensive)

#### 2. Query All LLMs for Each Competitor-Query Pair
For each combination of competitor + query:
- Ask all 5 LLMs: "Tell me about [competitor] for [query topic]"
- Track: mention position, context, sentiment, unique selling points mentioned

#### 3. Aggregate Competitive Data (Function Node)
- Calculate mention rates per competitor
- Compare against user's business
- Identify patterns in competitor positioning

#### 4. Generate Competitive Analysis Report (Claude Opus)
**Prompt Template:**
```
You are a competitive intelligence analyst for LLM visibility.

User's Business: {{$json.business_name}}
Competitors: {{$json.competitors}}
Queries Analyzed: {{$json.queries}}

LLM Response Data: {{$json.llm_responses}}

Provide competitive analysis:

1. Competitive Landscape Overview
   - Who dominates LLM visibility in this space?
   - Mention rates by competitor and LLM

2. Competitor Strengths
   - What makes competitors visible?
   - Key positioning themes
   - Content strategies they're using

3. Gaps & Opportunities
   - Where is user underrepforming?
   - Which queries have low competition?
   - Which LLMs favor certain competitors?

4. Strategic Recommendations
   - How to outrank competitors
   - Content gaps to fill
   - Positioning strategies

Format as structured report with data visualizations (charts as JSON).
```

#### 5. Store Results & Update Records

#### 6. Return Competitive Intelligence Report

### Credits
- Quick: 5 credits (~$0.20 cost)
- Comprehensive: 10 credits (~$0.40 cost)

---

## Workflow 4: Query Researcher Agent

### Purpose
Suggest new relevant queries user should track based on their business and existing queries.

### Trigger
- **Type:** Webhook
- **Method:** POST
- **Endpoint:** `/webhook/query-researcher`

### Input Schema
```json
{
  "user_id": "uuid",
  "business_name": "string",
  "industry": "string",
  "current_queries": ["query1", "query2"],
  "suggestion_count": 10
}
```

### Workflow Steps

#### 1. Check Credits (2 credits)

#### 2. Analyze Current Query Patterns (Claude Sonnet)
Identify themes, intent, and target audience from existing queries

#### 3. Research Query Suggestions (Perplexity)
**Prompt:**
```
Research search queries related to: {{$json.business_name}} in {{$json.industry}}

Current tracked queries: {{$json.current_queries}}

Find {{$json.suggestion_count}} NEW search queries that:
1. Relate to this business domain
2. Have different intent or angles than existing queries
3. Are commonly asked by real users
4. Would help improve visibility in LLM search results

Include both direct (asking about specific solutions) and indirect (problem-based) queries.

For each suggestion provide:
- Query text
- Search intent (informational, navigational, transactional)
- Estimated search volume category (high/medium/low)
- Why it's relevant
```

#### 4. Validate & Rank Suggestions (GPT-4o)
Check each suggestion against user's business for relevance score

#### 5. Check Sample Rankings (For top 5 suggestions)
Test each suggested query against 2-3 LLMs to see baseline visibility

#### 6. Return Ranked Suggestions
Include preview ranking data for each suggestion

### Credits
- 2 credits (~$0.08 cost)

---

## Workflow 5: Scheduled Ranking Update

### Purpose
Daily automated job to check rankings for all active tracked queries.

### Trigger
- **Type:** Schedule (Cron)
- **Schedule:** Daily at 2:00 AM UTC
- **Alternative:** Triggered by external scheduler (Vercel Cron)

### Workflow Steps

#### 1. Fetch All Active Queries (HTTP Request)
- **Method:** GET
- **URL:** `{{$env.SUPABASE_URL}}/rest/v1/tracked_queries?is_active=eq.true`
- **Paginate** if needed

#### 2. Batch Process Queries
**For each user (grouped):**

#### 3. Check Rankings for Each Query × LLM
- Same logic as Initial Analysis ranking check
- Compare to previous rankings (fetch last record)
- Detect changes (new mention, lost mention, position change)

#### 4. Store New Rankings
Insert into llm_rankings table

#### 5. Detect Significant Changes (Function Node)
- **Significant Change:** Mention status changed OR position changed by 2+
- Flag for notification

#### 6. Update Query Metadata
Store last_checked timestamp

#### 7. Trigger Notifications (If changes detected)
- Call notification workflow or send directly

### Execution Limits
- Process max 1000 queries per run
- Batch in groups of 50 for parallel processing
- Rate limit LLM API calls to avoid throttling

### Cost Model
- This is NOT charged credits (platform operational cost)
- Estimated cost: $0.01 per query per day
- For 100 users with 10 queries each: $10/day operational cost

---

## Workflow 6: Recommendation Generator

### Purpose
Analyze accumulated ranking data and generate new recommendations weekly.

### Trigger
- **Type:** Schedule (Cron)
- **Schedule:** Weekly on Monday at 3:00 AM UTC

### Workflow Steps

#### 1. Fetch Users with Active Subscriptions

#### 2. For Each User, Analyze Trends (Last 7 days)
- Query llm_rankings for trend data
- Calculate metrics:
  - Mention rate changes
  - Position improvements/declines
  - New competitor appearances
  - Sentiment shifts

#### 3. Identify Recommendation Opportunities (Claude Opus)
**Prompt:**
```
Analyze this week's LLM ranking data for: {{$json.business_name}}

Ranking Trends: {{$json.trends}}
Query Performance: {{$json.query_data}}
Competitor Activity: {{$json.competitor_data}}

Generate 1-3 new recommendations based on:
1. Declining visibility that needs attention
2. Opportunities where competitors are weak
3. Queries that improved (reinforcement strategies)
4. New content gaps identified

Only generate recommendations if there's actionable insight.
Format as JSON array.
```

#### 4. Store New Recommendations
Insert into recommendations table

#### 5. Trigger Notification
Send "New recommendations available" email/in-app notification

---

## Workflow 7: Global Error Handler

### Purpose
Centralized error handling and logging for all workflows.

### Trigger
- **Type:** Error Workflow (n8n feature)
- **Executes:** When any workflow throws an error

### Steps

#### 1. Parse Error Details (Function Node)
- Extract: workflow name, node name, error message, input data, timestamp

#### 2. Log to Supabase (HTTP Request)
- Store in agent_executions or separate error_logs table
- Include full stack trace

#### 3. Determine Severity (Function Node)
- **Critical:** Payment processing, credit deduction failures
- **High:** Content generation failures, API auth errors
- **Medium:** Single LLM provider failures
- **Low:** Temporary network issues

#### 4. Send Alerts Based on Severity
- **Critical:** Immediate Slack/email to dev team + user notification
- **High:** Email to dev team
- **Medium:** Log only, check daily
- **Low:** Log only

#### 5. Attempt Recovery (If possible)
- Retry with exponential backoff
- Refund credits if applicable
- Update user-facing status

---

## Webhook Security

### Authentication Methods

#### 1. User-Triggered Webhooks
- **Header:** Authorization: Bearer {supabase_access_token}
- **Validation:** Verify JWT against Supabase before processing
- **Node:** HTTP Request to Supabase auth.users endpoint

#### 2. System-Triggered Webhooks
- **Header:** X-API-Key: {n8n_webhook_secret}
- **Validation:** Compare against environment variable
- **Rotate key:** Monthly

#### 3. Rate Limiting
- Max 10 requests per minute per user
- Implement in Function Node before processing

---

## Testing Strategy

### Development Workflows
- Create duplicate workflows with "_test" suffix
- Use test credentials pointing to staging Supabase
- Test webhook URLs: `/webhook/content-writer-test`

### Test Cases per Workflow
1. **Happy path:** Valid inputs, successful execution
2. **Invalid inputs:** Missing fields, malformed data
3. **Insufficient credits:** Should fail gracefully
4. **API failures:** Mock LLM API failures, test retries
5. **Timeout:** Long-running operations
6. **Concurrent requests:** Multiple users triggering same workflow

### Monitoring
- Set up n8n execution alerts for failures
- Track average execution time per workflow
- Monitor API cost vs credit charges (margin analysis)

---

## Cost Optimization

### Strategies
1. **Use cheaper models where possible:**
   - Claude Sonnet for analysis (vs Opus)
   - GPT-4o mini for simple tasks

2. **Cache LLM responses:**
   - If same query checked within 1 hour, return cached result

3. **Batch processing:**
   - Group multiple queries in single LLM call when possible

4. **Lazy evaluation:**
   - Only check all 5 LLMs if user explicitly requests (default to 3 main ones)

5. **Smart scheduling:**
   - Don't check rankings daily for inactive users
   - Reduce frequency for stable rankings

---

## Deployment Checklist

- [ ] All credentials configured in n8n Cloud
- [ ] Webhook URLs documented and shared with frontend team
- [ ] Error handler workflow activated
- [ ] Schedule triggers configured with correct timezone
- [ ] Test workflows validated and deleted/disabled
- [ ] Rate limiting implemented
- [ ] Execution history retention set to 7 days
- [ ] Monitoring alerts configured
- [ ] API keys rotated and secured
- [ ] Backup workflows exported and stored in git

---

## Notes for Claude Code

**Workflow Design Philosophy:**
- Each workflow should be self-contained and idempotent
- Always create execution records for audit trail
- Deduct credits AFTER successful completion (to avoid charging for failures)
- Use service role key for Supabase (bypasses RLS)
- Implement comprehensive error handling at every step

**Prompt Engineering:**
- Use structured output formats (JSON) for parsing
- Include examples in prompts for consistency
- Set appropriate temperature (0.7-0.8 for creative, 0.3 for analytical)
- Always specify max tokens to control costs

**Performance:**
- Use parallel processing where possible (Split In Batches node)
- Set reasonable timeouts
- Implement caching for repeated operations
- Monitor execution times and optimize bottlenecks

**This specification provides the complete workflow logic. Claude Code should implement the actual n8n workflows by dragging nodes and connecting them, configure credentials, set up webhooks, and test each workflow thoroughly following the steps described above.**

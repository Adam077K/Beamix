# Supabase Build Specification

## Overview
Complete database schema, authentication configuration, Row-Level Security (RLS) policies, and database functions for the GEO Platform. Supabase serves as the primary backend providing PostgreSQL database, authentication, real-time subscriptions, and storage.

---

## Authentication Configuration

### Auth Providers
1. **Email/Password** (Primary)
   - Email verification required
   - Password reset flow
   - Minimum password requirements: 8 characters, 1 uppercase, 1 number

2. **Google OAuth** (Phase 1)
   - One-click signup/login
   - Auto-create user profile on first login

3. **Magic Link** (Phase 2 - Hebrew version)
   - Passwordless authentication via email

### Auth Settings
- **Email Templates**: Customize confirmation, password reset, and magic link emails with brand styling
- **JWT Expiry**: Access token expires after 1 hour, refresh token after 30 days
- **Redirect URLs**: Configure allowed redirect URLs for production and development
- **Session Management**: Store sessions in database for tracking and analytics

---

## Database Schema

### 1. users (extends auth.users)
Public profile table linked to Supabase auth.users via foreign key.

**Columns:**
- `id` (UUID, Primary Key) - References auth.users(id)
- `email` (Text, Unique, Not Null)
- `full_name` (Text)
- `company_name` (Text)
- `industry` (Text)
- `website_url` (Text)
- `language_preference` (Text, Default: 'en') - 'en' or 'he'
- `onboarding_completed` (Boolean, Default: false)
- `avatar_url` (Text) - Stored in Supabase Storage
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- No public read access

**Indexes:**
- `idx_users_email` on email
- `idx_users_created_at` on created_at

---

### 2. subscriptions
Stores subscription tier and billing information (synced with Stripe).

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `stripe_customer_id` (Text, Unique)
- `stripe_subscription_id` (Text, Unique)
- `plan_tier` (Text, Not Null) - 'starter', 'professional', 'enterprise'
- `status` (Text, Not Null) - 'active', 'canceled', 'past_due', 'trialing'
- `current_period_start` (Timestamp with timezone)
- `current_period_end` (Timestamp with timezone)
- `cancel_at_period_end` (Boolean, Default: false)
- `trial_end` (Timestamp with timezone)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own subscription
- Only service role can write (Stripe webhooks)

**Indexes:**
- `idx_subscriptions_user_id` on user_id
- `idx_subscriptions_stripe_customer_id` on stripe_customer_id
- `idx_subscriptions_status` on status

---

### 3. credits
Tracks credit balance and monthly allocations.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Unique, Not Null)
- `total_credits` (Integer, Default: 0) - Current balance
- `monthly_allocation` (Integer, Not Null) - Based on plan tier
- `rollover_credits` (Integer, Default: 0) - Unused credits from previous month
- `bonus_credits` (Integer, Default: 0) - One-time promotional credits
- `last_reset_date` (Timestamp with timezone) - When monthly credits were last allocated
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own credits
- Only service role can write

**Indexes:**
- `idx_credits_user_id` on user_id

**Business Logic:**
- Starter: 100 credits/month
- Professional: 500 credits/month
- Enterprise: 2000 credits/month
- Credits reset on the same day each month (subscription start date anniversary)
- Allow 20% rollover of unused credits (capped)

---

### 4. credit_transactions
Audit log for all credit usage and allocations.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `transaction_type` (Text, Not Null) - 'debit', 'credit', 'monthly_allocation', 'bonus', 'rollover'
- `amount` (Integer, Not Null) - Positive for credits added, negative for usage
- `balance_after` (Integer, Not Null) - Credit balance after transaction
- `related_entity_type` (Text) - 'content_generation', 'ranking_update', 'recommendation', etc.
- `related_entity_id` (UUID) - Foreign key to related table
- `description` (Text) - Human-readable description
- `metadata` (JSONB) - Additional transaction details
- `created_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own transactions
- Only service role can write

**Indexes:**
- `idx_credit_transactions_user_id` on user_id
- `idx_credit_transactions_created_at` on created_at
- `idx_credit_transactions_type` on transaction_type

---

### 5. tracked_queries
User's tracked search queries for monitoring LLM rankings.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `query_text` (Text, Not Null) - The search query being tracked
- `query_category` (Text) - User-defined category
- `target_url` (Text) - Specific page/URL user wants to rank
- `is_active` (Boolean, Default: true)
- `priority` (Text) - 'high', 'medium', 'low'
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own queries
- Users can create their own queries
- Users can update their own queries
- Users can delete their own queries

**Indexes:**
- `idx_tracked_queries_user_id` on user_id
- `idx_tracked_queries_is_active` on is_active

---

### 6. llm_rankings
Historical ranking data for tracked queries across different LLMs.

**Columns:**
- `id` (UUID, Primary Key)
- `query_id` (UUID, Foreign Key → tracked_queries.id, Not Null)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `llm_provider` (Text, Not Null) - 'chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews'
- `is_mentioned` (Boolean, Not Null) - Whether user's brand appears in response
- `mention_position` (Integer) - Position in response (1-based), null if not mentioned
- `mention_context` (Text) - Surrounding text snippet where brand was mentioned
- `sentiment` (Text) - 'positive', 'neutral', 'negative', null if not mentioned
- `competitors_mentioned` (JSONB) - Array of competitor brands mentioned
- `full_response_summary` (Text) - Brief summary of LLM response
- `raw_response_hash` (Text) - Hash of full response for change detection
- `checked_at` (Timestamp with timezone, Not Null)
- `created_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own rankings
- Only service role can write

**Indexes:**
- `idx_llm_rankings_query_id` on query_id
- `idx_llm_rankings_user_id` on user_id
- `idx_llm_rankings_checked_at` on checked_at
- `idx_llm_rankings_llm_provider` on llm_provider
- Composite index on (query_id, llm_provider, checked_at) for trend queries

---

### 7. recommendations
AI-generated optimization recommendations for users.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `query_id` (UUID, Foreign Key → tracked_queries.id, Nullable)
- `recommendation_type` (Text, Not Null) - 'content_gap', 'keyword_optimization', 'competitor_insight', 'technical_seo'
- `priority` (Text, Not Null) - 'critical', 'high', 'medium', 'low'
- `title` (Text, Not Null) - Short headline
- `description` (Text, Not Null) - Detailed explanation
- `action_items` (JSONB) - Array of specific steps to take
- `expected_impact` (Text) - 'high', 'medium', 'low'
- `supporting_data` (JSONB) - Charts, metrics, competitive analysis
- `status` (Text, Default: 'new') - 'new', 'in_progress', 'completed', 'dismissed'
- `dismissed_at` (Timestamp with timezone)
- `completed_at` (Timestamp with timezone)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own recommendations
- Users can update status of their own recommendations
- Only service role can create recommendations

**Indexes:**
- `idx_recommendations_user_id` on user_id
- `idx_recommendations_status` on status
- `idx_recommendations_priority` on priority
- `idx_recommendations_created_at` on created_at

---

### 8. content_generations
History of AI-generated content (Content Writer Agent outputs).

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `query_id` (UUID, Foreign Key → tracked_queries.id, Nullable)
- `agent_type` (Text, Not Null) - 'content_writer', 'competitor_research', 'query_researcher'
- `input_parameters` (JSONB, Not Null) - User inputs (topic, tone, length, etc.)
- `generated_content` (Text, Not Null) - Full generated content
- `content_format` (Text) - 'blog_post', 'faq', 'product_description', 'landing_page'
- `word_count` (Integer)
- `credits_used` (Integer, Not Null)
- `execution_time_ms` (Integer) - How long generation took
- `llm_models_used` (JSONB) - Which models were called and their costs
- `quality_score` (Numeric) - Internal quality assessment (0-1)
- `is_favorited` (Boolean, Default: false)
- `user_rating` (Integer) - 1-5 stars, nullable
- `user_feedback` (Text)
- `created_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own content generations
- Users can update their own ratings and favorites
- Only service role can create generations

**Indexes:**
- `idx_content_generations_user_id` on user_id
- `idx_content_generations_agent_type` on agent_type
- `idx_content_generations_created_at` on created_at
- `idx_content_generations_is_favorited` on is_favorited

---

### 9. competitor_tracking
Competitor brands being monitored for each user.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `competitor_name` (Text, Not Null)
- `competitor_domain` (Text)
- `competitor_description` (Text)
- `is_active` (Boolean, Default: true)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own competitors
- Users can create their own competitors
- Users can update their own competitors
- Users can delete their own competitors

**Indexes:**
- `idx_competitor_tracking_user_id` on user_id
- `idx_competitor_tracking_is_active` on is_active

---

### 10. competitor_mentions
Tracks when competitors are mentioned in LLM responses.

**Columns:**
- `id` (UUID, Primary Key)
- `query_id` (UUID, Foreign Key → tracked_queries.id, Not Null)
- `competitor_id` (UUID, Foreign Key → competitor_tracking.id, Not Null)
- `llm_provider` (Text, Not Null)
- `mention_position` (Integer, Not Null)
- `mention_context` (Text)
- `sentiment` (Text) - 'positive', 'neutral', 'negative'
- `checked_at` (Timestamp with timezone, Not Null)
- `created_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read mentions for their own queries
- Only service role can write

**Indexes:**
- `idx_competitor_mentions_query_id` on query_id
- `idx_competitor_mentions_competitor_id` on competitor_id
- `idx_competitor_mentions_checked_at` on checked_at

---

### 11. agent_executions
Logs of all agent runs for debugging and cost tracking.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `agent_type` (Text, Not Null) - 'initial_analysis', 'content_writer', 'competitor_research', 'query_researcher', 'recommendation_generator'
- `execution_status` (Text, Not Null) - 'pending', 'running', 'completed', 'failed'
- `input_data` (JSONB, Not Null)
- `output_data` (JSONB)
- `error_message` (Text)
- `credits_charged` (Integer)
- `total_cost_usd` (Numeric) - Actual API cost
- `llm_calls` (JSONB) - Array of individual LLM API calls with costs
- `started_at` (Timestamp with timezone)
- `completed_at` (Timestamp with timezone)
- `execution_duration_ms` (Integer)
- `created_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own executions
- Only service role can write

**Indexes:**
- `idx_agent_executions_user_id` on user_id
- `idx_agent_executions_agent_type` on agent_type
- `idx_agent_executions_status` on execution_status
- `idx_agent_executions_created_at` on created_at

---

### 12. notification_preferences
User preferences for email and in-app notifications.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Unique, Not Null)
- `ranking_changes` (Boolean, Default: true) - Notify on significant ranking changes
- `new_recommendations` (Boolean, Default: true) - Notify when new recommendations available
- `weekly_summary` (Boolean, Default: true) - Weekly performance email
- `credit_low_threshold` (Integer, Default: 10) - Alert when credits below this
- `credit_alerts` (Boolean, Default: true)
- `product_updates` (Boolean, Default: true)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

**RLS Policies:**
- Users can read their own preferences
- Users can update their own preferences

**Indexes:**
- `idx_notification_preferences_user_id` on user_id

---

## Database Functions

### 1. handle_new_user()
**Trigger:** After insert on auth.users
**Purpose:** Automatically create profile, credits, and notification preferences for new users

**Logic:**
1. Insert into users table with basic info from auth.users
2. Insert into credits table with 0 initial balance (will be set by subscription)
3. Insert into notification_preferences with default settings
4. Return new user row

---

### 2. deduct_credits()
**Parameters:**
- user_id (UUID)
- amount (Integer)
- entity_type (Text)
- entity_id (UUID)
- description (Text)

**Purpose:** Safely deduct credits with transaction logging

**Logic:**
1. Lock the user's credits row (FOR UPDATE)
2. Check if sufficient balance exists
3. If insufficient, return error/false
4. Deduct amount from total_credits
5. Insert transaction record with negative amount
6. Update credits.updated_at
7. Return true on success

**Returns:** Boolean (success/failure)

---

### 3. allocate_monthly_credits()
**Parameters:** user_id (UUID)
**Purpose:** Called by scheduled job to reset monthly credits

**Logic:**
1. Get user's subscription tier
2. Determine monthly_allocation based on tier
3. Calculate rollover (20% of unused, capped at 50% of allocation)
4. Reset total_credits = monthly_allocation + rollover_credits + bonus_credits
5. Update last_reset_date
6. Log transaction as 'monthly_allocation'

---

### 4. calculate_ranking_trend()
**Parameters:**
- query_id (UUID)
- llm_provider (Text)
- days (Integer, default 7)

**Purpose:** Calculate ranking trend for dashboard charts

**Logic:**
1. Query llm_rankings for specified query and provider
2. Filter by last N days
3. Return array of {date, is_mentioned, position} sorted by date
4. Calculate trend direction (improving/declining/stable)

**Returns:** JSONB with trend data

---

### 5. get_user_usage_summary()
**Parameters:** user_id (UUID), period (Text) - 'day', 'week', 'month'

**Purpose:** Get aggregated usage statistics for billing/analytics

**Logic:**
1. Sum credits_used from credit_transactions for period
2. Count agent_executions by type
3. Calculate cost breakdown by LLM provider
4. Return summary JSONB

**Returns:** JSONB with usage statistics

---

## Database Triggers

### 1. on_auth_user_created
- **Trigger:** AFTER INSERT ON auth.users
- **Execute:** handle_new_user()
- **Purpose:** Auto-create related records for new users

### 2. update_updated_at_timestamp
- **Trigger:** BEFORE UPDATE ON all tables with updated_at column
- **Execute:** Set updated_at = NOW()
- **Purpose:** Automatically maintain updated_at timestamps

### 3. validate_credit_balance
- **Trigger:** BEFORE UPDATE ON credits
- **Execute:** Ensure total_credits never goes below 0
- **Purpose:** Prevent negative credit balances

---

## Row-Level Security (RLS) Summary

### General Pattern:
1. **All tables have RLS enabled**
2. **User tables:** Users can only access their own data
3. **Audit tables:** Users can read their own, only service role can write
4. **Billing tables:** Users can read their own, only Stripe webhooks can write

### Service Role Exceptions:
The following operations require service role (bypass RLS):
- Creating subscriptions (Stripe webhooks)
- Allocating credits (scheduled jobs)
- Creating recommendations (n8n workflows)
- Creating agent execution logs (n8n workflows)
- Creating ranking data (n8n workflows)

### Example RLS Policy (template):
```sql
-- Users can read their own records
CREATE POLICY "Users can view their own {table}"
ON {table} FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can create their own {table}"
ON {table} FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "Users can update their own {table}"
ON {table} FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Indexes Strategy

### Primary Indexes (automatically created):
- Primary keys on all tables
- Foreign keys on all relationship columns

### Performance Indexes:
1. **User lookups:** user_id on all user-related tables
2. **Time-series queries:** created_at, checked_at on historical data
3. **Status filters:** status, is_active on filterable columns
4. **Composite indexes:** For common query patterns (query_id + llm_provider + date)

### Full-Text Search (Phase 2):
- content_generations.generated_content (GIN index)
- recommendations.description (GIN index)

---

## Real-Time Subscriptions

### Tables with Real-Time Enabled:
1. **credits** - Subscribe to balance changes for live updates
2. **llm_rankings** - Subscribe to new ranking data
3. **recommendations** - Subscribe to new recommendations
4. **agent_executions** - Subscribe to job status changes

### Subscription Filters:
All real-time subscriptions filtered by user_id for security

---

## Storage Buckets

### 1. avatars
- **Purpose:** User profile pictures
- **Security:** Public read, authenticated write (own files only)
- **Max file size:** 5MB
- **Allowed types:** image/jpeg, image/png, image/webp

### 2. exports (Phase 2)
- **Purpose:** Exported reports (PDF, CSV)
- **Security:** Private (users can only access their own)
- **Max file size:** 50MB
- **Allowed types:** application/pdf, text/csv

---

## Database Migrations Strategy

### Initial Migration:
1. Create all tables in correct dependency order
2. Set up foreign key constraints
3. Create indexes
4. Enable RLS on all tables
5. Create RLS policies
6. Create database functions
7. Create triggers
8. Create storage buckets

### Seed Data (Development):
- Sample user accounts
- Sample tracked queries
- Historical ranking data for testing charts
- Sample recommendations

---

## Performance Considerations

### Query Optimization:
- Use prepared statements for repeated queries
- Implement connection pooling (Supabase handles this)
- Use pagination for large result sets (limit + offset)
- Cache frequently accessed data in frontend state

### Data Retention:
- llm_rankings: Keep 90 days of data, archive older records
- agent_executions: Keep 30 days of logs
- credit_transactions: Keep indefinitely (audit trail)

### Monitoring:
- Track slow queries (>1s)
- Monitor database size growth
- Set up alerts for connection pool exhaustion
- Track RLS policy performance

---

## Backup & Recovery

### Automated Backups:
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Test restore procedures monthly

### Data Export:
- Provide users ability to export their data (GDPR compliance)
- Scheduled weekly backups to external storage (Phase 2)

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key (server-side only!)
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://... (for direct connections if needed)
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies tested for data leakage
- [ ] Service role key never exposed to frontend
- [ ] JWT secret properly configured
- [ ] Email verification enabled
- [ ] Rate limiting configured for auth endpoints
- [ ] Storage bucket policies tested
- [ ] Database backups verified
- [ ] Audit logging enabled for sensitive operations
- [ ] Foreign key constraints prevent orphaned records

---

## Notes for Claude Code

**Schema Design Philosophy:**
- Normalize data to avoid redundancy
- Use JSONB for flexible/evolving data structures
- Always include created_at, updated_at timestamps
- Use UUIDs for primary keys
- Foreign keys enforce referential integrity

**RLS Implementation:**
- Start restrictive, loosen as needed
- Test policies with different user contexts
- Document any service role bypass requirements

**Indexing:**
- Add indexes based on actual query patterns
- Monitor query performance and adjust
- Balance read performance vs write overhead

**Migration Approach:**
- Use Supabase CLI for version-controlled migrations
- Test migrations on staging before production
- Include rollback scripts for each migration

**This specification provides the complete data model. Claude Code should implement the actual SQL migrations, decide on specific index configurations based on query patterns, and set up the RLS policies following the patterns described above.**

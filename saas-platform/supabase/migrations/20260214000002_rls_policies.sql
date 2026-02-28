-- ================================================
-- GEO Platform Row-Level Security Policies
-- Created: February 14, 2026
-- Purpose: Secure data access with PostgreSQL RLS
-- ================================================

-- ================================================
-- SECTION 1: Enable RLS on All Tables
-- ================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ================================================
-- SECTION 2: Users Table Policies
-- ================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Service role can do anything (for system operations)
CREATE POLICY "Service role has full access to users"
    ON public.users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 3: Subscriptions Table Policies
-- ================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 4: Credits Table Policies
-- ================================================

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
    ON public.credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can modify credits
CREATE POLICY "Service role can manage credits"
    ON public.credits
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 5: Credit Transactions Table Policies
-- ================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert transactions
CREATE POLICY "Service role can insert credit transactions"
    ON public.credit_transactions
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 6: Tracked Queries Table Policies
-- ================================================

-- Users can view their own queries
CREATE POLICY "Users can view own queries"
    ON public.tracked_queries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own queries
CREATE POLICY "Users can insert own queries"
    ON public.tracked_queries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own queries
CREATE POLICY "Users can update own queries"
    ON public.tracked_queries
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own queries
CREATE POLICY "Users can delete own queries"
    ON public.tracked_queries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can manage all queries (for n8n workflows)
CREATE POLICY "Service role can manage queries"
    ON public.tracked_queries
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 7: LLM Rankings Table Policies
-- ================================================

-- Users can view their own rankings
CREATE POLICY "Users can view own rankings"
    ON public.llm_rankings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert rankings (n8n workflows)
CREATE POLICY "Service role can insert rankings"
    ON public.llm_rankings
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 8: Recommendations Table Policies
-- ================================================

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
    ON public.recommendations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own recommendations (mark as done/dismissed)
CREATE POLICY "Users can update own recommendations"
    ON public.recommendations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can insert recommendations (n8n workflows)
CREATE POLICY "Service role can insert recommendations"
    ON public.recommendations
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 9: Content Generations Table Policies
-- ================================================

-- Users can view their own content
CREATE POLICY "Users can view own content"
    ON public.content_generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own content (favorite, rating)
CREATE POLICY "Users can update own content"
    ON public.content_generations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
    ON public.content_generations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can insert content (n8n workflows)
CREATE POLICY "Service role can insert content"
    ON public.content_generations
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 10: Competitor Tracking Table Policies
-- ================================================

-- Users can view their own competitors
CREATE POLICY "Users can view own competitors"
    ON public.competitor_tracking
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own competitors
CREATE POLICY "Users can insert own competitors"
    ON public.competitor_tracking
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own competitors
CREATE POLICY "Users can update own competitors"
    ON public.competitor_tracking
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own competitors
CREATE POLICY "Users can delete own competitors"
    ON public.competitor_tracking
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can manage competitors
CREATE POLICY "Service role can manage competitors"
    ON public.competitor_tracking
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 11: Competitor Mentions Table Policies
-- ================================================

-- Users can view competitor mentions for their competitors
CREATE POLICY "Users can view own competitor mentions"
    ON public.competitor_mentions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.competitor_tracking ct
            WHERE ct.id = competitor_mentions.competitor_id
            AND ct.user_id = auth.uid()
        )
    );

-- Service role can insert competitor mentions
CREATE POLICY "Service role can insert competitor mentions"
    ON public.competitor_mentions
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 12: Agent Executions Table Policies
-- ================================================

-- Users can view their own agent executions
CREATE POLICY "Users can view own agent executions"
    ON public.agent_executions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert agent executions (trigger from frontend)
CREATE POLICY "Users can insert own agent executions"
    ON public.agent_executions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can update agent executions (status, results)
CREATE POLICY "Service role can update agent executions"
    ON public.agent_executions
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- SECTION 13: Notification Preferences Table Policies
-- ================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
    ON public.notification_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
    ON public.notification_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can manage preferences
CREATE POLICY "Service role can manage notification preferences"
    ON public.notification_preferences
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- Migration complete
-- ================================================

-- Note: Service role key should NEVER be exposed to the client
-- Only use service role in:
-- 1. Server-side API routes
-- 2. n8n workflows
-- 3. Stripe webhook handlers
-- 4. Scheduled jobs (cron)

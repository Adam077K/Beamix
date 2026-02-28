-- ================================================
-- GEO Platform Complete Database Schema
-- Created: February 14, 2026
-- Purpose: Complete schema for AI Visibility Optimization Platform
-- ================================================

-- ================================================
-- SECTION 1: Core Tables
-- ================================================

-- 1. users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    industry TEXT,
    website_url TEXT,
    language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'he')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 2. subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'professional', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 3. credits
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_credits INTEGER DEFAULT 0 CHECK (total_credits >= 0),
    monthly_allocation INTEGER NOT NULL DEFAULT 0,
    rollover_credits INTEGER DEFAULT 0 CHECK (rollover_credits >= 0),
    bonus_credits INTEGER DEFAULT 0 CHECK (bonus_credits >= 0),
    last_reset_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);

-- 4. credit_transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'monthly_allocation', 'bonus', 'rollover')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- ================================================
-- SECTION 2: Query Tracking Tables
-- ================================================

-- 5. tracked_queries
CREATE TABLE IF NOT EXISTS public.tracked_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('auto-generated', 'user-added')) DEFAULT 'user-added',
    category TEXT,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
    is_active BOOLEAN DEFAULT TRUE,
    avg_ranking NUMERIC(4,2),
    last_checked_at TIMESTAMPTZ,
    check_frequency TEXT DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracked_queries_user_id ON public.tracked_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_queries_is_active ON public.tracked_queries(is_active);
CREATE INDEX IF NOT EXISTS idx_tracked_queries_last_checked ON public.tracked_queries(last_checked_at);

-- 6. llm_rankings
CREATE TABLE IF NOT EXISTS public.llm_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES public.tracked_queries(id) ON DELETE CASCADE,
    llm_engine TEXT NOT NULL CHECK (llm_engine IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews', 'grok')),
    ranking_position INTEGER CHECK (ranking_position BETWEEN 1 AND 10),
    is_mentioned BOOLEAN DEFAULT FALSE,
    is_cited BOOLEAN DEFAULT FALSE,
    citation_url TEXT,
    response_snippet TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    metadata JSONB,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_llm_rankings_user_id ON public.llm_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_rankings_query_id ON public.llm_rankings(query_id);
CREATE INDEX IF NOT EXISTS idx_llm_rankings_checked_at ON public.llm_rankings(checked_at);
CREATE INDEX IF NOT EXISTS idx_llm_rankings_llm_engine ON public.llm_rankings(llm_engine);

-- ================================================
-- SECTION 3: AI Agent Tables
-- ================================================

-- 7. recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    action_type TEXT CHECK (action_type IN ('content_creation', 'competitor_research', 'query_discovery', 'technical_optimization')),
    impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
    effort TEXT NOT NULL CHECK (effort IN ('high', 'medium', 'low')),
    reasoning TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    agent_type TEXT,
    agent_input_params JSONB,
    related_query_id UUID REFERENCES public.tracked_queries(id) ON DELETE SET NULL,
    priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON public.recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);

-- 8. content_generations
CREATE TABLE IF NOT EXISTS public.content_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('content_writer', 'competitor_research', 'query_researcher', 'review_analysis')),
    content_type TEXT CHECK (content_type IN ('article', 'faq', 'service_page', 'analysis_report', 'query_list')),
    topic TEXT,
    input_params JSONB NOT NULL,
    output_content TEXT,
    output_metadata JSONB,
    word_count INTEGER,
    credits_cost INTEGER NOT NULL,
    quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
    is_favorite BOOLEAN DEFAULT FALSE,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON public.content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_agent_type ON public.content_generations(agent_type);
CREATE INDEX IF NOT EXISTS idx_content_generations_created_at ON public.content_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_generations_is_favorite ON public.content_generations(is_favorite);

-- ================================================
-- SECTION 4: Competitor Tracking Tables
-- ================================================

-- 9. competitor_tracking
CREATE TABLE IF NOT EXISTS public.competitor_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_website TEXT,
    industry TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_tracking_user_id ON public.competitor_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_tracking_is_active ON public.competitor_tracking(is_active);

-- 10. competitor_mentions
CREATE TABLE IF NOT EXISTS public.competitor_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES public.competitor_tracking(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES public.tracked_queries(id) ON DELETE CASCADE,
    llm_engine TEXT NOT NULL CHECK (llm_engine IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google_ai_overviews', 'grok')),
    ranking_position INTEGER CHECK (ranking_position BETWEEN 1 AND 10),
    is_mentioned BOOLEAN DEFAULT FALSE,
    is_cited BOOLEAN DEFAULT FALSE,
    citation_url TEXT,
    response_snippet TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_mentions_competitor_id ON public.competitor_mentions(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_mentions_query_id ON public.competitor_mentions(query_id);
CREATE INDEX IF NOT EXISTS idx_competitor_mentions_checked_at ON public.competitor_mentions(checked_at);

-- ================================================
-- SECTION 5: System Tables
-- ================================================

-- 11. agent_executions
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    input_params JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    credits_charged INTEGER,
    execution_time_ms INTEGER,
    n8n_execution_id TEXT,
    result_entity_type TEXT,
    result_entity_id UUID,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_executions_user_id ON public.agent_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_started_at ON public.agent_executions(started_at DESC);

-- 12. notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_ranking_changes BOOLEAN DEFAULT TRUE,
    email_low_credits BOOLEAN DEFAULT TRUE,
    email_weekly_report BOOLEAN DEFAULT TRUE,
    email_new_recommendations BOOLEAN DEFAULT TRUE,
    email_agent_completion BOOLEAN DEFAULT TRUE,
    email_subscription_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ================================================
-- SECTION 6: Triggers for updated_at
-- ================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracked_queries_updated_at BEFORE UPDATE ON public.tracked_queries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitor_tracking_updated_at BEFORE UPDATE ON public.competitor_tracking
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- SECTION 7: Trigger for new user creation
-- ================================================

-- Replace existing handle_new_user function with GEO Platform version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.users (id, email, full_name, company_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'company_name', '')
    );
    
    -- Create credits record with starter allocation
    INSERT INTO public.credits (user_id, total_credits, monthly_allocation, last_reset_date)
    VALUES (NEW.id, 100, 100, NOW());
    
    -- Create notification preferences with defaults
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$;

-- Recreate trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Migration complete
-- ================================================

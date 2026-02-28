-- ================================================
-- GEO Platform Database Functions
-- Created: February 14, 2026
-- Purpose: Business logic functions for credit management and analytics
-- ================================================

-- ================================================
-- FUNCTION 1: Deduct Credits (Atomic Operation)
-- ================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Credit usage',
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER,
    error_message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT total_credits INTO v_current_balance
    FROM public.credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Check if user exists
    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'User not found';
        RETURN;
    END IF;
    
    -- Check if sufficient credits
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient credits';
        RETURN;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;
    
    -- Update credits
    UPDATE public.credits
    SET total_credits = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        related_entity_type,
        related_entity_id
    ) VALUES (
        p_user_id,
        'debit',
        -p_amount,
        v_new_balance,
        p_description,
        p_related_entity_type,
        p_related_entity_id
    );
    
    RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- ================================================
-- FUNCTION 2: Allocate Monthly Credits
-- ================================================

CREATE OR REPLACE FUNCTION public.allocate_monthly_credits(
    p_user_id UUID,
    p_tier TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER,
    credits_allocated INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_monthly_allocation INTEGER;
    v_current_balance INTEGER;
    v_rollover_amount INTEGER;
    v_max_rollover INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Determine credits based on tier
    CASE p_tier
        WHEN 'starter' THEN v_monthly_allocation := 100;
        WHEN 'professional' THEN v_monthly_allocation := 500;
        WHEN 'enterprise' THEN v_monthly_allocation := 2000;
        ELSE
            RETURN QUERY SELECT FALSE, 0, 0;
            RETURN;
    END CASE;
    
    -- Calculate max rollover (20% of monthly allocation)
    v_max_rollover := FLOOR(v_monthly_allocation * 0.2);
    
    -- Get current balance
    SELECT total_credits INTO v_current_balance
    FROM public.credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Calculate rollover (unused credits, capped at 20%)
    IF v_current_balance > 0 THEN
        v_rollover_amount := LEAST(v_current_balance, v_max_rollover);
    ELSE
        v_rollover_amount := 0;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_monthly_allocation + v_rollover_amount;
    
    -- Update credits
    UPDATE public.credits
    SET total_credits = v_new_balance,
        monthly_allocation = v_monthly_allocation,
        rollover_credits = v_rollover_amount,
        last_reset_date = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log allocation transaction
    INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description
    ) VALUES (
        p_user_id,
        'monthly_allocation',
        v_monthly_allocation,
        v_new_balance,
        'Monthly credit allocation for ' || p_tier || ' plan'
    );
    
    -- Log rollover if applicable
    IF v_rollover_amount > 0 THEN
        INSERT INTO public.credit_transactions (
            user_id,
            transaction_type,
            amount,
            balance_after,
            description
        ) VALUES (
            p_user_id,
            'rollover',
            v_rollover_amount,
            v_new_balance,
            'Rollover credits from previous month (capped at 20%)'
        );
    END IF;
    
    RETURN QUERY SELECT TRUE, v_new_balance, v_monthly_allocation;
END;
$$;

-- ================================================
-- FUNCTION 3: Calculate Ranking Trend
-- ================================================

CREATE OR REPLACE FUNCTION public.calculate_ranking_trend(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    llm_engine TEXT,
    avg_ranking NUMERIC,
    mention_count BIGINT,
    citation_count BIGINT,
    trend TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            lr.llm_engine,
            AVG(lr.ranking_position) as avg_rank,
            COUNT(*) FILTER (WHERE lr.is_mentioned = TRUE) as mentions,
            COUNT(*) FILTER (WHERE lr.is_cited = TRUE) as citations
        FROM public.llm_rankings lr
        WHERE lr.user_id = p_user_id
          AND lr.checked_at >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY lr.llm_engine
    ),
    previous_period AS (
        SELECT 
            lr.llm_engine,
            AVG(lr.ranking_position) as avg_rank
        FROM public.llm_rankings lr
        WHERE lr.user_id = p_user_id
          AND lr.checked_at >= NOW() - INTERVAL '1 day' * (p_days * 2)
          AND lr.checked_at < NOW() - INTERVAL '1 day' * p_days
        GROUP BY lr.llm_engine
    )
    SELECT 
        cp.llm_engine,
        ROUND(cp.avg_rank, 2) as avg_ranking,
        cp.mentions as mention_count,
        cp.citations as citation_count,
        CASE 
            WHEN pp.avg_rank IS NULL THEN 'stable'
            WHEN cp.avg_rank < pp.avg_rank THEN 'up'
            WHEN cp.avg_rank > pp.avg_rank THEN 'down'
            ELSE 'stable'
        END as trend
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.llm_engine = pp.llm_engine
    ORDER BY cp.avg_rank ASC NULLS LAST;
END;
$$;

-- ================================================
-- FUNCTION 4: Get User Usage Summary
-- ================================================

CREATE OR REPLACE FUNCTION public.get_user_usage_summary(
    p_user_id UUID,
    p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_queries_tracked INTEGER,
    active_queries INTEGER,
    total_rankings_checked BIGINT,
    avg_ranking_position NUMERIC,
    total_content_generated INTEGER,
    total_credits_used INTEGER,
    credits_remaining INTEGER,
    agent_executions_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.tracked_queries WHERE user_id = p_user_id),
        (SELECT COUNT(*)::INTEGER FROM public.tracked_queries WHERE user_id = p_user_id AND is_active = TRUE),
        (SELECT COUNT(*) FROM public.llm_rankings WHERE user_id = p_user_id AND checked_at >= NOW() - INTERVAL '1 day' * p_period_days),
        (SELECT ROUND(AVG(ranking_position), 2) FROM public.llm_rankings WHERE user_id = p_user_id AND checked_at >= NOW() - INTERVAL '1 day' * p_period_days AND ranking_position IS NOT NULL),
        (SELECT COUNT(*)::INTEGER FROM public.content_generations WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '1 day' * p_period_days),
        (SELECT ABS(SUM(amount))::INTEGER FROM public.credit_transactions WHERE user_id = p_user_id AND transaction_type = 'debit' AND created_at >= NOW() - INTERVAL '1 day' * p_period_days),
        (SELECT total_credits FROM public.credits WHERE user_id = p_user_id),
        (SELECT COUNT(*) FROM public.agent_executions WHERE user_id = p_user_id AND started_at >= NOW() - INTERVAL '1 day' * p_period_days);
END;
$$;

-- ================================================
-- FUNCTION 5: Add Bonus Credits
-- ================================================

CREATE OR REPLACE FUNCTION public.add_bonus_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Bonus credits'
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update credits
    UPDATE public.credits
    SET total_credits = total_credits + p_amount,
        bonus_credits = bonus_credits + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_credits INTO v_new_balance;
    
    -- Check if user exists
    IF v_new_balance IS NULL THEN
        RETURN QUERY SELECT FALSE, 0;
        RETURN;
    END IF;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description
    ) VALUES (
        p_user_id,
        'bonus',
        p_amount,
        v_new_balance,
        p_description
    );
    
    RETURN QUERY SELECT TRUE, v_new_balance;
END;
$$;

-- ================================================
-- FUNCTION 6: Validate Credit Balance (Trigger Function)
-- ================================================

CREATE OR REPLACE FUNCTION public.validate_credit_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure credits never go negative
    IF NEW.total_credits < 0 THEN
        RAISE EXCEPTION 'Credit balance cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for credit validation
DROP TRIGGER IF EXISTS validate_credits_trigger ON public.credits;
CREATE TRIGGER validate_credits_trigger
    BEFORE UPDATE ON public.credits
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_credit_balance();

-- ================================================
-- Migration complete
-- ================================================

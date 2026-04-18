-- ============================================================
-- Migration 008: Seed Plans Data + Updated Handle New User Trigger
-- ============================================================

-- Clear existing plans and re-insert
DELETE FROM public.plans;

INSERT INTO public.plans (name, tier, monthly_agent_uses, max_tracked_queries, max_competitors, max_businesses, scan_frequency_days, engines, features) VALUES
(
  'Starter',
  'starter',
  5,
  10,
  3,
  1,
  7,
  ARRAY['chatgpt', 'gemini', 'perplexity'],
  '{"ask_beamix": false, "api_access": false, "workflows": false, "voice_profiles": false, "manual_scan_frequency": "weekly"}'::jsonb
),
(
  'Pro',
  'pro',
  15,
  25,
  5,
  3,
  3,
  ARRAY['chatgpt', 'gemini', 'perplexity', 'claude', 'google_ai_overviews', 'grok', 'you_com'],
  '{"ask_beamix": true, "api_access": false, "workflows": true, "voice_profiles": true, "manual_scan_frequency": "daily"}'::jsonb
),
(
  'Business',
  'business',
  50,
  75,
  10,
  10,
  1,
  ARRAY['chatgpt', 'gemini', 'perplexity', 'claude', 'google_ai_overviews', 'grok', 'you_com'],
  '{"ask_beamix": true, "api_access": true, "workflows": true, "voice_profiles": true, "manual_scan_frequency": "unlimited"}'::jsonb
);

-- ============================================================
-- Updated handle_new_user trigger
-- Creates user_profiles + subscriptions + notification_preferences on signup
-- Uses plan_id = NULL for free tier (NOT plan_tier = 'free')
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- 1. Create user profile
    INSERT INTO public.user_profiles (
        user_id,
        full_name,
        locale,
        timezone,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
        COALESCE(NEW.raw_user_meta_data->>'locale', 'en'),
        'UTC',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. Create subscription (plan_id = NULL = free tier)
    INSERT INTO public.subscriptions (
        user_id,
        plan_id,
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NULL,
        'trialing',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Create notification preferences with defaults
    INSERT INTO public.notification_preferences (
        user_id
    )
    VALUES (
        NEW.id
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

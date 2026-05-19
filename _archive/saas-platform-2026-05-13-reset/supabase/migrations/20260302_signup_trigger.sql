-- ============================================================
-- Signup trigger: create user_profiles + subscriptions rows
-- when a new user signs up via Supabase Auth.
--
-- Without this, onboarding cannot complete because:
--   1. /api/onboarding/complete does UPDATE user_profiles → 0 rows matched
--   2. Dashboard layout checks onboarding_completed_at → null → redirects back
--   3. Infinite loop: onboarding ↔ dashboard
-- ============================================================

-- Function: handle_new_user
-- Fires on every auth.users INSERT. Creates the minimum required rows
-- so the onboarding flow can mark completion and the dashboard can load.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- 1. Create user profile row
    --    onboarding_completed_at starts NULL — set by /api/onboarding/complete
    INSERT INTO public.user_profiles (
        id,
        full_name,
        email,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
        NEW.email,
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create subscription row in trialing status
    --    trial_ends_at is set when onboarding completes (14 days from then)
    INSERT INTO public.subscriptions (
        user_id,
        status,
        plan_tier,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        'trialing',
        'free',
        now(),
        now()
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
    -- Never let this trigger block signup
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
-- Drop first in case it already exists with a different definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

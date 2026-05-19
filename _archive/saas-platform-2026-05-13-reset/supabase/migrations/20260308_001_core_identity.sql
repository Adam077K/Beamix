-- ============================================================
-- Migration 001: Core Identity Tables
-- Tables: user_profiles, businesses, plans, subscriptions
-- ============================================================

-- Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  locale text DEFAULT 'en' CHECK (locale IN ('en', 'he')),
  timezone text DEFAULT 'UTC',
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS locale text DEFAULT 'en';
  ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
  ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop old columns that shouldn't exist
DO $$ BEGIN
  ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS email;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
CREATE POLICY "Service role can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- businesses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website_url text NOT NULL,
  industry text NOT NULL,
  location text,
  services text[] DEFAULT '{}',
  description text,
  logo_url text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'he')),
  last_scanned_at timestamptz,
  next_scan_at timestamptz,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo_url text;
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS last_scanned_at timestamptz;
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS next_scan_at timestamptz;
  ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_next_scan ON public.businesses(next_scan_at) WHERE next_scan_at IS NOT NULL;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own businesses" ON public.businesses;
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;
CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own businesses" ON public.businesses;
CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- plans (reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'business')),
  paddle_product_id text UNIQUE,
  monthly_agent_uses integer NOT NULL,
  max_tracked_queries integer NOT NULL,
  max_competitors integer NOT NULL,
  max_businesses integer NOT NULL DEFAULT 1,
  scan_frequency_days integer NOT NULL,
  engines text[] NOT NULL,
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS paddle_product_id text;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS monthly_agent_uses integer DEFAULT 5;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_tracked_queries integer DEFAULT 10;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_competitors integer DEFAULT 3;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_businesses integer DEFAULT 1;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS scan_frequency_days integer DEFAULT 7;
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS engines text[] DEFAULT '{}';
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}';
  ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (true);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  paddle_subscription_id text UNIQUE,
  paddle_customer_id text,
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id uuid;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id text;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id text;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_starts_at timestamptz;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start timestamptz;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
  ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop old columns that shouldn't exist
DO $$ BEGIN
  ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS plan_tier;
  ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
  ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_customer_id;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status) WHERE status IN ('active', 'trialing');

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

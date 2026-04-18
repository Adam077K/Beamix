-- ============================================================
-- Migration 007: Platform Tables
-- Tables: integrations, api_keys, blog_posts, ga4_metrics, gsc_data
-- ============================================================

-- ============================================================
-- integrations (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('wordpress', 'ga4', 'gsc', 'slack', 'cloudflare')),
  credentials jsonb NOT NULL,
  config jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON public.integrations(user_id, provider);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own integrations" ON public.integrations;
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER set_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- api_keys (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL DEFAULT 'Default',
  scopes text[] DEFAULT '{read}',
  rate_limit integer DEFAULT 100,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- blog_posts (update existing if needed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image_url text,
  author text NOT NULL DEFAULT 'Beamix Team',
  category text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts(is_published, published_at DESC) WHERE is_published = true;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Service role manages blog posts" ON public.blog_posts;
CREATE POLICY "Service role manages blog posts" ON public.blog_posts
  FOR ALL USING (true);

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ga4_metrics (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ga4_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  organic_sessions integer NOT NULL DEFAULT 0,
  ai_referral_sessions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ga4_metrics_biz_date ON public.ga4_metrics(business_id, date DESC);

ALTER TABLE public.ga4_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own GA4 metrics" ON public.ga4_metrics;
CREATE POLICY "Users can view own GA4 metrics" ON public.ga4_metrics
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages GA4 metrics" ON public.ga4_metrics;
CREATE POLICY "Service role manages GA4 metrics" ON public.ga4_metrics
  FOR ALL USING (true);

-- ============================================================
-- gsc_data (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gsc_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  query text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  position numeric(5,1),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, date, query)
);

CREATE INDEX IF NOT EXISTS idx_gsc_data_biz_date ON public.gsc_data(business_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_data_biz_query ON public.gsc_data(business_id, query);

ALTER TABLE public.gsc_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own GSC data" ON public.gsc_data;
CREATE POLICY "Users can view own GSC data" ON public.gsc_data
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role manages GSC data" ON public.gsc_data;
CREATE POLICY "Service role manages GSC data" ON public.gsc_data
  FOR ALL USING (true);

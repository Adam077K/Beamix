-- Migration: 20260520_03_core_tables.sql
-- Purpose: Auth/identity tables — user_profiles, businesses, plans, subscriptions, paddle_webhook_events
-- Rollback: DROP TABLE paddle_webhook_events, subscriptions, businesses, user_profiles, plans CASCADE;

-- Plans (seed table — service_role write, anon read)
CREATE TABLE plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  tier              plan_tier NOT NULL UNIQUE,
  monthly_credits   int NOT NULL DEFAULT 0,
  paddle_price_id_monthly  text,
  paddle_price_id_annual   text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX plans_tier_idx ON plans (tier);

-- User profiles (extends Supabase Auth users)
-- timezone: IANA timezone identifier. Default 'UTC'. Set 'Asia/Jerusalem' if signup referrer ends .il
--           or business.language = 'he'. Wave 1 BE-3 uses for tz-aware daily-cap reset.
-- kill_switch_until: per-user kill switch timestamp (H3). NULL = active.
-- disclosure_acknowledged_at: compliance acknowledgement timestamp.
-- deleted_at: soft-delete for GDPR erasure requests.
-- day1_state: tracks Day-1 onboarding flow state (JSON blob).
CREATE TABLE user_profiles (
  id                          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       text NOT NULL,
  full_name                   text,
  avatar_url                  text,
  onboarding_completed_at     timestamptz,
  day1_state                  jsonb,
  day1_completed_at           timestamptz,
  timezone                    text NOT NULL DEFAULT 'UTC',
  kill_switch_until           timestamptz,
  disclosure_acknowledged_at  timestamptz,
  deleted_at                  timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_profiles_email_idx ON user_profiles (email);
CREATE INDEX user_profiles_deleted_at_idx ON user_profiles (deleted_at) WHERE deleted_at IS NOT NULL;

-- Businesses (one per user for MVP; schema supports multiple in future)
CREATE TABLE businesses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  website_url     text NOT NULL,
  industry        text,
  location        text,
  language        text NOT NULL DEFAULT 'en',
  services        text[] NOT NULL DEFAULT '{}',
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX businesses_user_id_idx ON businesses (user_id);
CREATE INDEX businesses_website_url_idx ON businesses (website_url);

-- Subscriptions
CREATE TABLE subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id               uuid REFERENCES plans(id),
  status                subscription_status NOT NULL DEFAULT 'trialing',
  paddle_subscription_id text UNIQUE,
  paddle_customer_id    text,
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  trial_start           timestamptz,
  trial_end             timestamptz,
  cancelled_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions (user_id);
CREATE INDEX subscriptions_paddle_subscription_id_idx ON subscriptions (paddle_subscription_id) WHERE paddle_subscription_id IS NOT NULL;
CREATE INDEX subscriptions_status_idx ON subscriptions (status);

-- Paddle webhook idempotency table (B1)
-- event_id is the Paddle event ID — PRIMARY KEY ensures idempotency
CREATE TABLE paddle_webhook_events (
  event_id    text PRIMARY KEY,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX paddle_webhook_events_received_at_idx ON paddle_webhook_events (received_at);
CREATE INDEX paddle_webhook_events_event_type_idx ON paddle_webhook_events (event_type);

-- Migration: 20260520_04_credits.sql
-- Purpose: Credits system — credit_pools, credit_transactions, credit_holds, daily_cap_usage
-- Rollback: DROP TABLE daily_cap_usage, credit_holds, credit_transactions, credit_pools CASCADE;

-- Credit pools (monthly allocation per user per plan)
-- Unique constraint on (user_id, plan_id, billing_period_start) enables idempotent allocation
CREATE TABLE credit_pools (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 uuid REFERENCES plans(id),
  billing_period_start    timestamptz NOT NULL,
  base_allocation         int NOT NULL DEFAULT 0,
  rollover_amount         int NOT NULL DEFAULT 0,
  topup_amount            int NOT NULL DEFAULT 0,
  used_amount             int NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_pools_non_negative CHECK (
    base_allocation >= 0 AND rollover_amount >= 0 AND topup_amount >= 0 AND used_amount >= 0
  ),
  UNIQUE (user_id, plan_id, billing_period_start)
);

CREATE INDEX credit_pools_user_id_idx ON credit_pools (user_id);
CREATE INDEX credit_pools_user_period_idx ON credit_pools (user_id, billing_period_start DESC);

-- Credit transactions (audit trail)
CREATE TABLE credit_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id          uuid REFERENCES credit_pools(id),
  pool_type        text NOT NULL DEFAULT 'monthly',
  transaction_type text NOT NULL, -- 'deduct', 'topup', 'rollover', 'refund'
  amount           int NOT NULL,
  description      text,
  agent_job_id     uuid,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX credit_transactions_user_id_idx ON credit_transactions (user_id);
CREATE INDEX credit_transactions_pool_id_idx ON credit_transactions (pool_id);
CREATE INDEX credit_transactions_created_at_idx ON credit_transactions (created_at DESC);

-- Credit holds (TOCTOU-safe; expires_at enables sweep of stuck holds)
-- Wave 1 BE-1 retention-sweep.ts releases holds older than 30 min
CREATE TABLE credit_holds (
  job_id      uuid PRIMARY KEY,  -- same as agent_jobs.id — one hold per job
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      int NOT NULL,
  agent_type  agent_type NOT NULL,
  held_at     timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  confirmed   boolean NOT NULL DEFAULT false,
  released    boolean NOT NULL DEFAULT false
);

CREATE INDEX credit_holds_user_id_idx ON credit_holds (user_id);
CREATE INDEX credit_holds_expires_at_idx ON credit_holds (expires_at) WHERE NOT confirmed AND NOT released;

-- Daily cap usage (tracks per-user, per-agent, per-day agent runs)
-- usage_date + user_id + agent_type is the unique key for cap tracking
CREATE TABLE daily_cap_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type   agent_type NOT NULL,
  usage_date   date NOT NULL DEFAULT current_date,
  used_today   int NOT NULL DEFAULT 0,
  daily_cap    int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_type, usage_date)
);

CREATE INDEX daily_cap_usage_user_id_idx ON daily_cap_usage (user_id);
CREATE INDEX daily_cap_usage_lookup_idx ON daily_cap_usage (user_id, agent_type, usage_date);

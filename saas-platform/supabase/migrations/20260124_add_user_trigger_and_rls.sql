-- Migration: Create customer on signup via database trigger
-- This ensures customer records are always created server-side with proper validation

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.customers (id, email, company_name, plan_id, subscription_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
        'free',
        'active'
    );
    RETURN NEW;
END;
$$;

-- Create a trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
CREATE POLICY "Users can view own customer record"
    ON customers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own customer record"
    ON customers FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for analysis_results table
CREATE POLICY "Users can view own analysis results"
    ON analysis_results FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own analysis results"
    ON analysis_results FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- RLS Policies for ranking_history table
CREATE POLICY "Users can view own ranking history"
    ON ranking_history FOR SELECT
    USING (auth.uid() = site_id::uuid);

-- RLS Policies for automation_logs table
CREATE POLICY "Users can view own automation logs"
    ON automation_logs FOR SELECT
    USING (auth.uid() = client_id::uuid);

CREATE POLICY "Users can insert own automation logs"
    ON automation_logs FOR INSERT
    WITH CHECK (auth.uid() = client_id::uuid);

-- RLS Policies for prospect_leads table
CREATE POLICY "Users can view own prospect leads"
    ON prospect_leads FOR SELECT
    USING (auth.uid() = client_id::uuid);

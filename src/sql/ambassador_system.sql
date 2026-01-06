-- SQL for Ambassador Recommendations System

-- 1. Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  school_faculty TEXT,
  department TEXT,
  level TEXT,
  recommendation_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  balance_cents BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS) Policies
-- Note: For a simpler initial setup, we enable RLS but allow anonymous insertions
-- and read access to specific tables. In production, policies should be more restrictive.

-- Enable RLS
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anonymous Insert Policies (Public forms)
CREATE POLICY "Allow public insert to ambassadors" ON ambassadors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to volunteers" ON volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to contact" ON contact_messages FOR INSERT WITH CHECK (true);

-- Anonymous Read Policies (For login/status checks)
-- Note: Authenticated users (admins) can be given broader access via Supabase dashboard
CREATE POLICY "Allow public read own ambassador" ON ambassadors FOR SELECT USING (true); -- Filtered by email in app logic
CREATE POLICY "Allow public read withdrawals" ON withdrawals FOR SELECT USING (true);

-- Admin/Authenticated access (Simplified for development)
-- These broad policies allow the frontend to manage the dashboard.
-- In production, you should restrict these to authenticated users.

-- 1. DROP existing restrictive policies
DROP POLICY IF EXISTS "Allow public select all newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow public select all registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public select all payments" ON payments;
DROP POLICY IF EXISTS "Allow public update to ambassadors" ON ambassadors;
DROP POLICY IF EXISTS "Allow public update to withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow public update to registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public read own ambassador" ON ambassadors;
DROP POLICY IF EXISTS "Allow public read withdrawals" ON withdrawals;

-- 2. CREATE permissive policies for Dashboard Management
CREATE POLICY "Enable all for ambassadors" ON ambassadors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for withdrawals" ON withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for registrations" ON registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for newsletter" ON newsletter_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER trg_ambassadors_updated_at
BEFORE UPDATE ON ambassadors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_withdrawals_updated_at
BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

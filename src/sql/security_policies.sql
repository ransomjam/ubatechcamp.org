-- ROW LEVEL SECURITY POLICIES FOR UBATECH CAMP
-- Enables protection against unauthorised data access/modification

-- 0. Enable RLS on all tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_stipends ENABLE ROW LEVEL SECURITY;

-- 1. Helper Function to check if user is admin/super
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR 
    auth.jwt() -> 'user_metadata' ->> 'role' = 'super'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role' = 'super');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Public Tables (Allow public INSERT, Admin SELECT/ALL)
-- Registrations
CREATE POLICY "Anyone can register" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage registrations" ON registrations FOR ALL USING (is_admin());

-- Volunteer Applications
CREATE POLICY "Anyone can apply" ON volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage volunteers" ON volunteer_applications FOR ALL USING (is_admin());

-- Contact Messages
CREATE POLICY "Anyone can send message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read messages" ON contact_messages FOR SELECT USING (is_admin());

-- Newsletter
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage newsletter" ON newsletter_subscriptions FOR ALL USING (is_admin());

-- Onboarding
CREATE POLICY "Anyone can submit onboarding" ON onboarding_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage onboarding" ON onboarding_forms FOR ALL USING (is_admin());

-- Donations
CREATE POLICY "Anyone can donate" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage donations" ON donations FOR ALL USING (is_admin());

-- 3. Payments & Financials
-- Payments
CREATE POLICY "Anyone can record payment start" ON payments FOR INSERT WITH CHECK (true); -- Required for Fapshi webhook
CREATE POLICY "Admins can view payments" ON payments FOR SELECT USING (is_admin());
CREATE POLICY "Super Admins can update/delete payments" ON payments FOR ALL USING (is_super_admin());

-- Withdrawals
CREATE POLICY "Admins can view withdrawals" ON withdrawals FOR SELECT USING (is_admin());
CREATE POLICY "Super Admins can manage withdrawals" ON withdrawals FOR ALL USING (is_super_admin());

-- Stipends
CREATE POLICY "Admins can view stipends" ON tutor_stipends FOR SELECT USING (is_admin());
CREATE POLICY "Super Admins can manage stipends" ON tutor_stipends FOR ALL USING (is_super_admin());

-- 4. Staff & Ambassadors
-- Ambassadors
CREATE POLICY "Admins can manage ambassadors" ON ambassadors FOR ALL USING (is_admin());
-- Allow ambassadors to see their own data? (Currently handled by email-lookup in frontend)
-- For tighter security, staff should login via Supabase Auth.
CREATE POLICY "Staff can lookup themselves by email" ON ambassadors FOR SELECT USING (true); -- Placeholder

-- Tutors (Staff/Executives)
CREATE POLICY "Admins can manage tutors" ON tutors FOR ALL USING (is_admin());
CREATE POLICY "Staff can lookup themselves" ON tutors FOR SELECT USING (true); -- Placeholder

-- 5. Programs
CREATE POLICY "Public can view programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Admins can edit programs" ON programs FOR ALL USING (is_admin());

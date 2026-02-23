-- =============================================
-- EXPENDITURES TABLE FOR UBATECHCAMP ACCOUNTING
-- Run this script in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS expenditures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Miscellaneous',
  amount INTEGER NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenditures_created_at ON expenditures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenditures_category ON expenditures(category);

-- Enable RLS
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow read expenditures" ON expenditures
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow insert expenditures" ON expenditures
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow delete expenditures" ON expenditures
  FOR DELETE TO anon, authenticated
  USING (true);

-- =============================================
-- DONE! Run this in Supabase SQL Editor.
-- =============================================

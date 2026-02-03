-- =============================================
-- RECEIPTS SYSTEM FOR UBATECHCAMP
-- Run this script in Supabase SQL Editor
-- =============================================

-- 1. Create receipts table to store all issued receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  institution TEXT,
  program TEXT NOT NULL,
  amount INTEGER NOT NULL,
  trans_id TEXT NOT NULL UNIQUE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_by TEXT DEFAULT 'admin', -- 'admin' for manual, 'self' for student-claimed
  link_token TEXT, -- Reference to the one-time link if used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create receipt_links table for one-time link generation
CREATE TABLE IF NOT EXISTS receipt_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  program TEXT, -- Optional: pre-fill program
  amount INTEGER, -- Optional: pre-fill amount
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  used_by_name TEXT, -- Name of student who claimed
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_receipts_trans_id ON receipts(trans_id);
CREATE INDEX IF NOT EXISTS idx_receipts_full_name ON receipts(full_name);
CREATE INDEX IF NOT EXISTS idx_receipts_program ON receipts(program);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipt_links_token ON receipt_links(token);
CREATE INDEX IF NOT EXISTS idx_receipt_links_is_used ON receipt_links(is_used);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_links ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for receipts table
-- Allow anyone to insert (for self-service receipt claims)
CREATE POLICY "Allow insert receipts" ON receipts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read receipts (you may want to restrict this)
CREATE POLICY "Allow read receipts" ON receipts
  FOR SELECT TO anon, authenticated
  USING (true);

-- 6. Create policies for receipt_links table
-- Allow anyone to read links (needed for claim page)
CREATE POLICY "Allow read receipt_links" ON receipt_links
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow anyone to insert links (admin generates them)
CREATE POLICY "Allow insert receipt_links" ON receipt_links
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update links (to mark as used)
CREATE POLICY "Allow update receipt_links" ON receipt_links
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Create a function to claim a receipt link (atomic operation)
CREATE OR REPLACE FUNCTION claim_receipt_link(
  p_token TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_institution TEXT,
  p_program TEXT,
  p_amount INTEGER,
  p_trans_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link receipt_links%ROWTYPE;
  v_receipt receipts%ROWTYPE;
BEGIN
  -- Lock and fetch the link
  SELECT * INTO v_link
  FROM receipt_links
  WHERE token = p_token
  FOR UPDATE;

  -- Check if link exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Link not found');
  END IF;

  -- Check if already used
  IF v_link.is_used THEN
    RETURN json_build_object('success', false, 'error', 'This link has already been used');
  END IF;

  -- Check if expired
  IF v_link.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'This link has expired');
  END IF;

  -- Mark link as used
  UPDATE receipt_links
  SET is_used = TRUE,
      used_at = NOW(),
      used_by_name = p_full_name
  WHERE token = p_token;

  -- Insert the receipt
  INSERT INTO receipts (full_name, email, institution, program, amount, trans_id, issued_by, link_token)
  VALUES (p_full_name, p_email, p_institution, 
          COALESCE(p_program, v_link.program), 
          COALESCE(p_amount, v_link.amount),
          p_trans_id, 'self', p_token)
  RETURNING * INTO v_receipt;

  RETURN json_build_object(
    'success', true, 
    'receipt', row_to_json(v_receipt)
  );
END;
$$;

-- 8. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION claim_receipt_link TO anon, authenticated;

-- =============================================
-- DONE! Your receipts system is ready.
-- =============================================

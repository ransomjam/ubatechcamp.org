-- SQL for Tutor System

-- 1. Ensure Table and Columns exist (Safe for re-running)
CREATE TABLE IF NOT EXISTS tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  course_teaching TEXT NOT NULL,
  recommendation_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  balance_cents BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='department') THEN
        ALTER TABLE tutors ADD COLUMN department TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='experience') THEN
        ALTER TABLE tutors ADD COLUMN experience TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='skills') THEN
        ALTER TABLE tutors ADD COLUMN skills TEXT;
    END IF;
END $$;

-- 2. Tutor Stipends (Admin to Tutor payments)
CREATE TABLE IF NOT EXISTS tutor_stipends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  payment_method TEXT,
  reference TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_stipends ENABLE ROW LEVEL SECURITY;

-- Anonymous access for application and login
DROP POLICY IF EXISTS "Enable all for tutors" ON tutors;
CREATE POLICY "Enable all for tutors" ON tutors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for tutor_stipends" ON tutor_stipends;
CREATE POLICY "Enable all for tutor_stipends" ON tutor_stipends FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_tutors_updated_at ON tutors;
CREATE TRIGGER trg_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tutor_stipends_updated_at ON tutor_stipends;
CREATE TRIGGER trg_tutor_stipends_updated_at BEFORE UPDATE ON tutor_stipends FOR EACH ROW EXECUTE FUNCTION set_updated_at();
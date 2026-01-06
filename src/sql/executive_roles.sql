-- Migration for Multi-Role Executive Support
-- Roles: volunteer (default), pro (Public Relations), media (Media & Communications), community (Community Manager)

-- 1. Add role and recommendation_code columns to tutors table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='role') THEN
        ALTER TABLE tutors ADD COLUMN role TEXT DEFAULT 'volunteer';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='recommendation_code') THEN
        ALTER TABLE tutors ADD COLUMN recommendation_code TEXT;
    END IF;

    -- Also Ensure recommendation_code is UNIQUE if it's not already
    -- (Only if we just added it, or want to be sure)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='recommendation_code') THEN
        BEGIN
            CREATE UNIQUE INDEX IF NOT EXISTS idx_tutors_recommendation_code ON tutors(recommendation_code);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
END $$;

-- 2. Add onboarded_by_code to ambassadors table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ambassadors' AND column_name='onboarded_by_code') THEN
        ALTER TABLE ambassadors ADD COLUMN onboarded_by_code TEXT;
    END IF;
END $$;

-- 3. Update existing tutors to have 'volunteer' role if they don't have one
UPDATE tutors SET role = 'volunteer' WHERE role IS NULL;

-- 4. Create an index for faster lookup of onboarded ambassadors
CREATE INDEX IF NOT EXISTS idx_ambassadors_onboarded_by ON ambassadors(onboarded_by_code);

-- Supabase/Postgres schema for UBaTech app
-- Created: 2026-01-01

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_type') THEN
        CREATE TYPE student_type AS ENUM ('alumni','current');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male','female','prefer_not_to_say');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donor_type') THEN
        CREATE TYPE donor_type AS ENUM ('individual','organisation');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider') THEN
        CREATE TYPE payment_provider AS ENUM ('mtn','orange','fapshi');
    ELSE
        ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'fapshi';
    END IF;
END$$;

-- Common function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Registrations (waitlist / registrations)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  school_faculty TEXT,
  field_of_study TEXT,
  mode_of_attendance TEXT,
  program TEXT,
  recommendation_code TEXT,
  age INTEGER,
  education_level TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(lower(email));
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- Onboarding forms
CREATE TABLE IF NOT EXISTS onboarding_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  student_id TEXT,
  department TEXT,
  device_available TEXT,
  student_type student_type NOT NULL,
  program_batch TEXT,
  courses_taken TEXT,
  whatsapp_number TEXT,
  current_program TEXT,
  training_start_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_onboarding_email ON onboarding_forms(lower(email));

-- Volunteer applications
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role_interest TEXT,
  experience TEXT,
  gender gender_type,
  date_of_birth DATE,
  education_level TEXT,
  faculty_department TEXT,
  position TEXT,
  is_uba_student BOOLEAN,
  familiarity TEXT,
  familiarity_details TEXT,
  motivation TEXT,
  skills_experience TEXT,
  available_training BOOLEAN,
  available_duties BOOLEAN,
  cv_file_name TEXT,
  cv_file_url TEXT,
  photo_file_name TEXT,
  photo_file_url TEXT,
  submission_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteer_applications(lower(email));
CREATE INDEX IF NOT EXISTS idx_volunteers_submitted_at ON volunteer_applications(created_at);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contact_messages(lower(email));

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(lower(email));

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  donor_type donor_type DEFAULT 'individual',
  organisation_name TEXT,
  amount_cents BIGINT,
  currency TEXT DEFAULT 'XAF',
  reason TEXT,
  other_reason TEXT,
  payment_method TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(lower(email));

-- Payments (mobile payments and others)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  provider payment_provider,
  phone TEXT,
  amount_cents BIGINT,
  currency TEXT DEFAULT 'XAF',
  plan_id TEXT,
  status TEXT,
  provider_reference TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);

-- Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  balance_cents BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add recommendation_code column if it doesn't exist
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS recommendation_code TEXT;
-- Add unique constraint safely
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ambassadors_recommendation_code_key') THEN
    ALTER TABLE ambassadors ADD CONSTRAINT ambassadors_recommendation_code_key UNIQUE (recommendation_code);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_ambassadors_email ON ambassadors(lower(email));
CREATE INDEX IF NOT EXISTS idx_ambassadors_recommendation_code ON ambassadors(recommendation_code);

-- Tutors table
CREATE TABLE IF NOT EXISTS tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  balance_cents BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add recommendation_code column if it doesn't exist
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS recommendation_code TEXT;
-- Add unique constraint safely
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tutors_recommendation_code_key') THEN
    ALTER TABLE tutors ADD CONSTRAINT tutors_recommendation_code_key UNIQUE (recommendation_code);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_tutors_email ON tutors(lower(email));
CREATE INDEX IF NOT EXISTS idx_tutors_recommendation_code ON tutors(recommendation_code);

-- Programs lookup table (seeded from frontend `Our Programs` list)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  duration TEXT,
  short_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_programs_name ON programs(lower(name));

-- Seed program rows (safe to run multiple times)
INSERT INTO programs (name, duration, short_description)
VALUES
  ('Data Analysis and Research', '4 weeks', 'Data collection, cleaning, statistical analysis and visualisation'),
  ('Computer & MS Office Basics', '4 weeks', 'Fundamentals of computers and Microsoft Office suite'),
  ('Software Engineering', '4 weeks', 'Programming fundamentals, version control and software design'),
  ('Web Development', '4 weeks', 'HTML, CSS and JavaScript for building websites'),
  ('Data Analytics', '4 weeks', 'Excel, SQL, Python and Power BI for analytics and dashboards'),
  ('Networking', '4 weeks', 'Computer networks, routers and networking fundamentals'),
  ('Linux Administration', '4 weeks', 'Introduction to Linux and Command Line')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE TRIGGER trg_ambassadors_updated_at
BEFORE UPDATE ON ambassadors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_tutors_updated_at
BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Triggers to update updated_at
CREATE OR REPLACE TRIGGER trg_registrations_updated_at
BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_onboarding_updated_at
BEFORE UPDATE ON onboarding_forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_volunteers_updated_at
BEFORE UPDATE ON volunteer_applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_donations_updated_at
BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Helpful views (optional)
-- View: recent registrations
-- Ensure registration columns exist before creating views (safe for existing DBs)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS school_faculty TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS field_of_study TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mode_of_attendance TEXT;

-- Recreate the view safely by dropping any existing view first to avoid
-- column rename/compatibility errors when running against existing DBs.
DROP VIEW IF EXISTS recent_registrations;
CREATE VIEW recent_registrations AS
SELECT id, full_name, email, school_faculty, field_of_study, mode_of_attendance, program, status, created_at FROM registrations ORDER BY created_at DESC LIMIT 5000;

-- End of schema

-- Migration: Add missing fields to onboarding_forms table
-- This migration adds institution, school_faculty, and field_of_study columns
-- to the onboarding_forms table to match the registrations table structure
-- and ensure student data (Institution, School/Faculty, Department) is properly captured
-- Created: 2026-01-14

-- Add missing columns to onboarding_forms if they don't exist
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS school_faculty TEXT;
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS field_of_study TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_institution ON onboarding_forms(institution);
CREATE INDEX IF NOT EXISTS idx_onboarding_school_faculty ON onboarding_forms(school_faculty);

-- Verify the columns were added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'onboarding_forms' 
-- ORDER BY ordinal_position;

-- Cleanup initial/test entries for UBaTech schema
-- Run this in Supabase SQL editor or psql. This will DELETE all rows
-- from user-facing tables while preserving schema and constraints.

BEGIN;

-- Delete dependent child records first
DELETE FROM payments;
DELETE FROM donations;

-- Delete other top-level records
DELETE FROM newsletter_subscriptions;
DELETE FROM contact_messages;
DELETE FROM volunteer_applications;
DELETE FROM onboarding_forms;
DELETE FROM registrations;

-- Programs table (seed rows)
DELETE FROM programs;

COMMIT;

-- Optional: reclaim space and update planner statistics
-- NOTE: VACUUM cannot run inside a transaction block. The Supabase SQL
-- editor may wrap statements in a transaction; run the following separately
-- in the SQL editor (outside any explicit transaction) or via psql:
--
-- VACUUM ANALYZE;

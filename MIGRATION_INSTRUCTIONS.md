# Database Migration Instructions

## Quick Start

To apply the missing columns to your Supabase database:

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Copy and paste the following SQL:

```sql
-- Add missing columns to onboarding_forms table
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS school_faculty TEXT;
ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS field_of_study TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_institution ON onboarding_forms(institution);
CREATE INDEX IF NOT EXISTS idx_onboarding_school_faculty ON onboarding_forms(school_faculty);
```

3. Click **Run** and wait for the migration to complete

### Option 2: Using psql CLI

If you have psql installed:

```bash
psql postgresql://[user]:[password]@[host]/[database] -f src/sql/migration_add_onboarding_fields.sql
```

### Option 3: Manual Verification

After running the migration, verify the columns were added:

```sql
-- Check if columns exist
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'onboarding_forms' 
ORDER BY ordinal_position;
```

You should see:
- `institution` (TEXT)
- `school_faculty` (TEXT)  
- `field_of_study` (TEXT)

---

## What This Migration Does

✅ Adds 3 new TEXT columns to `onboarding_forms` table:
- `institution` - Store student's institution
- `school_faculty` - Store school or faculty
- `field_of_study` - Store department or field of study

✅ Adds 2 indexes for performance optimization

✅ Safe for existing data - new columns default to NULL

✅ Non-destructive - existing registrations are not affected

---

## Timeline

- Migration should complete in < 1 second
- New registrations can start using these fields immediately
- Admin dashboard can display these fields right away

---

## Rollback (if needed)

If you need to remove these columns:

```sql
ALTER TABLE onboarding_forms DROP COLUMN IF EXISTS institution;
ALTER TABLE onboarding_forms DROP COLUMN IF EXISTS school_faculty;
ALTER TABLE onboarding_forms DROP COLUMN IF EXISTS field_of_study;
```

---

For more details, see `REGISTRATION_FIELDS_FIX.md`

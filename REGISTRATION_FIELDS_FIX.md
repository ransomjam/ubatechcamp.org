# Fix Summary: Missing Registration Fields (Institution, School/Faculty, Department)

**Issue:** During registration, fields like Institution, School/Faculty, and Department were appearing as null and not visible on the admin dashboard.

**Root Cause:** The onboarding_forms table in the database was missing the `institution`, `school_faculty`, and `field_of_study` columns that existed in the registrations table. Additionally, the registration form (Onboarding.tsx) didn't have input fields to capture this data.

## Changes Made

### 1. Database Schema Updates

**File:** `src/sql/supabase_schema.sql`
- Added `institution TEXT` column to onboarding_forms table
- Added `school_faculty TEXT` column to onboarding_forms table  
- Added `field_of_study TEXT` column to onboarding_forms table

**New Migration File:** `src/sql/migration_add_onboarding_fields.sql`
- Created migration script to safely add the three missing columns
- Added indexes for better query performance on institution and school_faculty fields
- Safe for existing databases (uses IF NOT EXISTS)

### 2. Frontend Form Updates

**File:** `src/pages/Onboarding.tsx`
- Updated FormData interface to include: `institution`, `schoolFaculty`, `fieldOfStudy`
- Initialized these fields in component state
- Added three new input fields to the registration form:
  - Institution
  - School / Faculty
  - Department / Field of Study
- Updated form submission to include these new fields
- Updated form reset function to clear the new fields

### 3. Data Submission Pipeline

**File:** `src/lib/googleSheets.ts`
- Updated ONBOARDING_CURRENT and ONBOARDING_ALUMNI form submission handlers
- Now captures and saves: institution, school_faculty, field_of_study, department
- Handles both camelCase and snake_case field naming for flexibility

**File:** `src/lib/db.ts`
- Updated submitOnboardingForm function signature to accept the new fields
- Added the new fields to the Firebase/DB submission payload

### 4. Admin Dashboard

The RegistrationsTable component already displays these fields:
- Institution 
- Field of Study (or Department)

These will now be visible in the admin dashboard once the migration is applied.

## Data Preservation

✅ **No existing data will be lost**
- The migration uses `ALTER TABLE...ADD COLUMN IF NOT EXISTS` which is safe for existing databases
- Columns default to NULL for existing records
- New registrations will populate these fields going forward

## Next Steps to Deploy

1. **Apply the migration to Supabase:**
   ```sql
   -- Run the contents of src/sql/migration_add_onboarding_fields.sql
   -- Or execute the ALTER statements from supabase_schema.sql
   ```

2. **Deploy the frontend changes:**
   - These TypeScript changes will automatically compile and deploy with your build process

3. **Test the registration form:**
   - New registrations should now capture Institution, School/Faculty, and Department
   - Admin dashboard should display these fields for new registrations

## Files Modified

1. `src/sql/supabase_schema.sql` - Added columns to onboarding_forms table
2. `src/sql/migration_add_onboarding_fields.sql` - NEW migration file
3. `src/pages/Onboarding.tsx` - Added form fields
4. `src/lib/googleSheets.ts` - Updated submission handler
5. `src/lib/db.ts` - Updated Firebase/DB submission function

---

**Status:** Complete ✅ All changes ensure backward compatibility and preserve existing data.

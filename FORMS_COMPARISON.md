# Registration vs Onboarding Forms - Comparison

## ✅ VERIFIED: These Are Two DIFFERENT Forms

### 1. **Registration Form** (`RegistrationSection.tsx`)
**Purpose:** New user registration with payment

**Location:** `src/components/sections/RegistrationSection.tsx`

**Database Table:** `registrations` (waitlist)

**Form Type (for submission):** `"WAITLIST"`

**Key Fields:**
- Full Name ✓
- Email ✓
- Phone ✓
- Institution ✓ (Already has this)
- School/Faculty ✓ (Already has this)
- Field of Study ✓ (Already has this)
- Program ✓
- Attendance Mode ✓
- Education Level ✓
- Recommendation Code ✓

**Flow:**
1. User fills form
2. Backend creates registration
3. **Payment is required** (FAPSHI checkout)
4. Data saved to `registrations` table
5. Data also synced to Google Sheets as "WAITLIST"

**Status:** ✅ Already has Institution, School/Faculty, Field of Study fields

---

### 2. **Onboarding Form** (`Onboarding.tsx`)
**Purpose:** Current students self-registration for training

**Location:** `src/pages/Onboarding.tsx`

**Database Table:** `onboarding_forms`

**Form Type (for submission):** `"ONBOARDING_CURRENT"` or `"ONBOARDING_ALUMNI"`

**Key Fields:**
- Full Name ✓
- Email ✓
- Phone Number ✓
- **Institution** ✓ (I just added this)
- **School/Faculty** ✓ (I just added this)
- **Field of Study** ✓ (I just added this)
- WhatsApp Number
- Current Program
- Training Start Date
- Recommendation Code

**Flow:**
1. User fills form
2. **NO payment required**
3. Data saved to `onboarding_forms` table
4. Data synced to Google Sheets as "ONBOARDING_CURRENT" or "ONBOARDING_ALUMNI"

**Status:** ✅ I just added Institution, School/Faculty, Field of Study fields

---

## Summary of Changes

| Component | Table | Previous | Fixed | Status |
|-----------|-------|----------|-------|--------|
| RegistrationSection | `registrations` | ✓ Has fields | N/A | ✅ Already complete |
| Onboarding | `onboarding_forms` | ✗ Missing fields | ✓ Added | ✅ Fixed |

---

## Key Differences

| Aspect | Registration | Onboarding |
|--------|--------------|-----------|
| **User Type** | New applicants | Current students |
| **Payment** | Required (FAPSHI) | Not required |
| **Institution Fields** | Already captured | Now captured (fixed) |
| **Form Submission Type** | WAITLIST | ONBOARDING_CURRENT/ALUMNI |
| **Database** | registrations | onboarding_forms |
| **Use Case** | Recruitment/enrollment | Internal training activation |

---

## Admin Dashboard Impact

Both forms' data appears in the admin dashboard:
- **Registrations Tab** → Shows data from `registrations` table (Registration Form)
- Future: **Onboarding Tab** → Would show data from `onboarding_forms` table (Onboarding Form)

Currently the RegistrationsTable component displays:
- Institution ✓
- Field of Study / Department ✓

These fields now exist in both tables.

---

## Conclusion

✅ **Verification Complete**
- Registration form: Already had all fields
- Onboarding form: Missing fields (NOW FIXED)
- Both forms now capture Institution, School/Faculty, and Field of Study
- All data will be stored and displayed in the admin dashboard

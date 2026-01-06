# UBa Tech Camp Website - Changelog

## December 3, 2025

### Registration Paused (Temporary)
- **Status**: Registration applications are temporarily paused
- **Reason**: Payment system not yet available while site is online
- **Message displayed**: A friendly notice informs visitors that registrations for the 3rd Edition will begin on **January 1st, 2026**
- **File modified**: `src/components/sections/RegistrationSection.tsx`
- **Action to restore**: Replace the current "coming soon" component with the full registration form (backup available in git history)

### Donation Section Hidden (Temporary)
- **Status**: Donation section is temporarily hidden from the homepage
- **File modified**: `src/pages/Index.tsx`
- **How it was hidden**: The `<DonationSection />` component is commented out
- **Action to restore**: Uncomment the following lines in `src/pages/Index.tsx`:
  ```jsx
  // Line 9: import { DonationSection } from "@/components/sections/DonationSection";
  // Line 26: <DonationSection />
  ```

---

## Notes
- Monetbil payment integration is configured and ready (service key: configured in `src/lib/monetbil.ts`)
- Once payments are operational, both features can be re-enabled

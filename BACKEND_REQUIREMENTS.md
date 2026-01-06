# Backend Requirements for Learn Online Paid Access System

## Overview
This document outlines the backend requirements needed to complete the Learn Online paid access system. The frontend UI has been implemented with mock data and navigation flows.

---

## 1. Authentication System

### Requirements:
- **User Registration & Login**: Implement user authentication using Lovable Cloud (Supabase Auth)
- **Email/Password Authentication**: Primary authentication method
- **Session Management**: Maintain user sessions across page refreshes
- **Password Reset**: Implement password reset functionality

### Database Schema:
```sql
-- Users table is managed by Supabase Auth (auth.users)

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  primary key (id)
);

alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

### Frontend Integration Points:
- `src/pages/LearnOnlineAuth.tsx` - Lines 27-32: Replace mock handleSubmit with actual auth calls
  - Use `supabase.auth.signUp()` for registration
  - Use `supabase.auth.signInWithPassword()` for login
  - Handle errors and show user-friendly messages

- `src/pages/Courses.tsx` - Lines 13-15: Replace mock auth state with actual session check
  - Use `supabase.auth.getSession()` to check authentication status
  - Use `supabase.auth.onAuthStateChange()` to listen for auth changes

---

## 2. Payment System

### Requirements:
- **Payment Flag**: Track users who have paid for Learn Online access
- **Payment Records**: Store payment transaction details
- **Mobile Money Integration**: Process MTN Money and Orange Money payments
- **Payment Status**: Track pending, completed, and failed payments

### Database Schema:
```sql
-- Create payment access table
create table public.learn_online_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  has_paid_access boolean default false,
  payment_date timestamp with time zone,
  access_granted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id)
);

alter table public.learn_online_access enable row level security;

-- RLS Policies
create policy "Users can view their own access status"
  on public.learn_online_access for select
  using (auth.uid() = user_id);

-- Create payments table for transaction records
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  amount decimal(10,2) not null,
  currency text default 'XAF',
  payment_method text not null, -- 'mtn' or 'orange'
  phone_number text not null,
  transaction_id text,
  status text not null default 'pending', -- 'pending', 'completed', 'failed'
  payment_type text default 'learn_online_access',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.payments enable row level security;

-- RLS Policies for payments
create policy "Users can view their own payments"
  on public.payments for select
  using (auth.uid() = user_id);
```

### Frontend Integration Points:
- `src/pages/LearnOnlinePayment.tsx` - Lines 19-29: Replace mock handlePayment with actual payment processing
  - Create payment record in database
  - Integrate with mobile money API (MTN/Orange)
  - Update `learn_online_access` table on successful payment
  - Handle payment callbacks/webhooks

- `src/pages/Courses.tsx` - Line 15: Replace mock hasPaidAccess with database check
  - Query `learn_online_access` table for current user
  - Check `has_paid_access` flag

### Edge Function for Payment Processing:
Create an edge function at `supabase/functions/process-payment/index.ts`:
```typescript
// This function should:
// 1. Validate payment request
// 2. Initiate mobile money payment with provider API
// 3. Create payment record in database
// 4. Handle payment webhooks/callbacks
// 5. Update user's access status on successful payment
// 6. Send confirmation email to user
```

---

## 3. Access Control & Redirect Logic

### Requirements:
- **Route Guards**: Protect Learn Online routes based on auth and payment status
- **Conditional Redirects**: Automatically redirect users based on their status:
  - Not authenticated → `/learn-online/auth`
  - Authenticated but not paid → `/learn-online/payment`
  - Authenticated and paid → `/learn-online/success` (Odoo platform)

### Implementation:
Create a custom hook at `src/hooks/useLearnOnlineAccess.ts`:
```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; // You'll need to create this

export const useLearnOnlineAccess = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check payment status
      const { data: accessData } = await supabase
        .from('learn_online_access')
        .select('has_paid_access')
        .eq('user_id', session.user.id)
        .single();

      setHasPaidAccess(accessData?.has_paid_access || false);
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isAuthenticated, hasPaidAccess };
};
```

### Frontend Integration Points:
- Update `src/pages/Courses.tsx` to use the `useLearnOnlineAccess` hook instead of mock values

---

## 4. Odoo Integration & Manual Approval

### Requirements:
- **Email Matching**: Ensure user's email in UBa Tech account matches Odoo registration
- **Manual Approval Workflow**: Admin must manually approve users in Odoo
- **Private Courses**: Configure Odoo courses to be private and require approval
- **Access Activation**: Notify users when their Odoo access is activated

### Admin Dashboard Integration:
Add a section to admin dashboard for managing Learn Online access:
- View list of users who have paid
- View their email addresses for Odoo account matching
- Track activation status
- Send activation confirmation emails

### Database Schema Addition:
```sql
-- Add activation tracking to learn_online_access table
alter table public.learn_online_access
add column odoo_approved boolean default false,
add column odoo_approved_at timestamp with time zone,
add column odoo_approved_by uuid references auth.users(id);
```

---

## 5. Email Notifications

### Requirements:
- **Payment Confirmation**: Send email after successful payment
- **Access Activation**: Notify user when admin activates their Odoo access
- **Payment Receipt**: Include payment details and transaction ID

### Implementation:
Create edge function at `supabase/functions/send-email/index.ts` using a service like:
- Resend
- SendGrid
- Amazon SES

---

## 6. Security Considerations

### Important Security Rules:
1. **Never check payment status on client side only** - Always validate on backend
2. **Use RLS policies** to prevent users from modifying their own access status
3. **Validate payment webhooks** with proper signatures/tokens from payment providers
4. **Store sensitive payment credentials** in Supabase secrets, not in code
5. **Implement rate limiting** on payment endpoints to prevent abuse
6. **Log all payment transactions** for audit trail
7. **Use HTTPS only** for all payment-related endpoints

---

## 7. Testing Checklist

### Before going live, test:
- [ ] User registration and login flows
- [ ] Password reset functionality
- [ ] Payment processing with both MTN and Orange Money
- [ ] Payment failure scenarios
- [ ] Access granted after successful payment
- [ ] Redirect logic for authenticated/unauthenticated users
- [ ] Redirect logic for paid/unpaid users
- [ ] RLS policies prevent unauthorized access
- [ ] Email notifications are sent correctly
- [ ] Admin approval workflow in dashboard
- [ ] Mobile responsiveness of all payment pages

---

## 8. Environment Variables / Secrets

Add these secrets in Lovable Cloud:
```
MTN_MONEY_API_KEY=your_mtn_api_key
MTN_MONEY_API_SECRET=your_mtn_secret
ORANGE_MONEY_API_KEY=your_orange_api_key
ORANGE_MONEY_API_SECRET=your_orange_secret
EMAIL_SERVICE_API_KEY=your_email_service_key
```

---

## Next Steps

1. **Enable Lovable Cloud** to get Supabase backend
2. **Create database tables** using the schemas above
3. **Implement authentication** in LearnOnlineAuth.tsx
4. **Create payment edge function** for mobile money processing
5. **Integrate payment webhooks** to update access status
6. **Update frontend** to use real auth/payment state instead of mocks
7. **Add admin dashboard** section for Learn Online access management
8. **Configure Odoo** for private courses and manual approval
9. **Test end-to-end flow** before launching
10. **Set up monitoring** for payment failures and errors

---

## Cost Estimate

Based on Lovable Cloud usage-based pricing:
- **Authentication**: Free (included in Lovable Cloud)
- **Database storage**: Minimal cost (~$0.01/GB/month)
- **Edge functions**: First 500K requests free, then ~$0.20 per million
- **Mobile money fees**: Depends on provider (typically 1-3% of transaction)

---

## Support & Documentation

- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Mobile Money Integration Guides](https://developer.mtn.com/) (MTN)

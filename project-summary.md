# UBA Tech Camp - Project Context

## Project Overview
This is a comprehensive web application for UBA Tech Camp, a technology education bootcamp in Uganda. The project includes student registration, payment processing, newsletter management, blog functionality, and an admin dashboard.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Hooks, TanStack Query
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Project Structure

### Pages
- `/` - Home page with hero, programs, testimonials, team sections
- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog post page
- `/admin/login` - Admin authentication page
- `/admin/dashboard` - Admin dashboard with registrations, payments, newsletter management

### Key Components

#### Layout Components
- `Header` - Navigation with logo, menu items, mobile responsive
- `Footer` - Footer with links, contact info, newsletter signup

#### Section Components
- `HeroSection` - Landing page hero with CTA
- `ProgramsSection` - Program offerings display
- `TestimonialsSection` - Student testimonials
- `TeamSection` - Team member profiles
- `ProjectsSection` - Student project showcase
- `RegistrationSection` - Registration form with payment
- `NewsletterSection` - Newsletter subscription
- `AboutSection` - About the organization
- `ContactSection` - Contact information and form
- `FAQSection` - Frequently asked questions
- `GallerySection` - Photo gallery with categories

#### Admin Components
- `RegistrationsTable` - Manage student registrations
- `PaymentsTable` - View and export payment transactions
- `NewsletterTable` - Manage newsletter subscribers

#### Dialog Components
- `ChatDialog` - Live chat interface
- `PaymentDialog` - Payment processing modal
- `ReferralCodeDialog` - Referral code validation

### Database Schema (Planned)

#### Tables
1. **student_registrations**
   - id, full_name, email, phone, age, education_level
   - program, referral_code, payment_status
   - created_at, updated_at

2. **newsletter_subscribers**
   - id, email, subscribed_at, is_active

3. **contact_messages**
   - id, name, email, subject, message, created_at

4. **blog_posts**
   - id, title, slug, content, excerpt, author
   - featured_image, published_at, created_at, updated_at

5. **referral_codes**
   - id, code, discount_percentage, max_uses, current_uses
   - expires_at, is_active, created_at

### API Integration Points

#### Planned Edge Functions
1. `send-registration-email` - Send confirmation emails
2. `process-payment` - Handle Stripe payments
3. `validate-referral-code` - Validate and apply referral codes
4. `send-contact-email` - Send contact form emails
5. `subscribe-newsletter` - Handle newsletter subscriptions
6. `stripe-webhook` - Handle Stripe webhook events

### Payment Integration
- **Provider**: Stripe
- **Plans**:
  - Registration Fee: 500,000 UGX
  - Complete Program: 1,500,000 UGX
- Payment methods: Mobile Money, Bank Transfer, Card

### Features

#### Public Features
- Course program browsing
- Student registration with payment
- Blog posts and articles
- Newsletter subscription
- Contact form
- Photo gallery
- FAQ section
- Team profiles
- Student testimonials

#### Admin Features
- View all registrations with filters
- Search by name, email, phone
- Track payment status (completed, pending, failed)
- Export payment data
- View revenue statistics
- Manage newsletter subscribers
- Bulk newsletter actions

### Design System

#### Color Tokens (HSL)
- Primary colors for branding
- Semantic colors for status (success, warning, error)
- Background and foreground variants
- Border and accent colors

#### Component Variants
- Buttons: default, destructive, outline, secondary, ghost, link
- Badges: default, secondary, destructive, outline
- Cards: elevated, outlined, interactive

### Form Validation

#### Registration Form
- Full name: required, min 2 characters
- Email: required, valid email format
- Phone: required, Uganda format (+256...)
- Age: required, 13-25 years
- Education level: required
- Program: required selection

#### Newsletter Form
- Email: required, valid format, unique

#### Contact Form
- Name: required, min 2 characters
- Email: required, valid format
- Subject: required
- Message: required, min 10 characters

### Security Requirements
- Public access for all forms (no authentication required)
- Row Level Security (RLS) policies on all tables
- Input sanitization and validation
- HTTPS only
- Secure payment processing via Stripe
- Email verification for newsletters

### Environment Variables Needed
- `RESEND_API_KEY` - For email notifications
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For webhook verification
- `ADMIN_EMAIL` - For admin notifications

### Development Notes
- No user authentication system (public access only)
- Admin access via direct Supabase dashboard
- Mock data currently used in admin tables
- Backend integration pending with Lovable Cloud/Supabase
- Responsive design for mobile, tablet, desktop
- SEO optimized with proper meta tags and semantic HTML

### Implementation Priority
1. Database schema and RLS policies
2. Student registration flow
3. Stripe payment integration
4. Email notifications (Resend.com)
5. Newsletter subscription
6. Contact form
7. Admin dashboard with real data
8. Blog functionality
9. Gallery management

### Testing Requirements
- Form validation testing
- Payment flow testing
- Email delivery testing
- RLS policy testing
- Responsive design testing
- Performance testing

---
Generated: 2025-10-06

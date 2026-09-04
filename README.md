# Mrs Sarah Early Years Tutoring Platform — Operating Platform & PWA

A full-stack Progressive Web App (PWA) and operating platform built for **Mrs Sarah**, a Montessori-trained early years educator specialising in ages 3–8 (Nursery, Preschool, Primary 1 & 2). 

The platform features:
1. **Public Website**: High-conversion educator landing page, credentials, subject offerings, session pricing, testimonials, and enquiry intake form.
2. **Parent Family Portal**: Schedule view, child profiles, Montessori developmental milestones, home learning resource library, fee statements/receipts, and direct tutor messaging.
3. **Owner Administration Hub**: Sarah's private operational console for student tracking, milestone updates, slot scheduling, resource management, and enquiry triage.
4. **PWA Offline Capabilities**: Installable on iOS/Android/Desktop with service worker caching and offline fallback.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **Design Language**: Mrs Sarah brand rules:
  - Primary Blue: #1E4E8C
  - Accent Gold: #D4A017
  - Navy Text: #14263F
  - Blue Tint: #E8F0FA
  - Typography: Fraunces (Headings), Karla (Body)
- **Deployment**: Vercel (Frontend) + Supabase Cloud (Backend)

---

## 🔐 Authentication & Role Security Architecture

1. **Unified Sign-In (/login)**:
   - A single shared login entry point for both Parents and Mrs Sarah.
   - Supports secure Email + Password and passwordless Email Magic Links.
   - Automatically inspects the authenticated user's role in public.profiles (owner vs parent) and loads the appropriate navigation and dashboard capabilities.

2. **Strict Parent Registration (/signup)**:
   - Public registration strictly and immutably assigns `role: 'parent'`.
   - **No public UI path or API parameter can mint `owner` or `tutor` accounts.**

3. **Production Mode Guard**:
   - The quick role preview switcher is strictly restricted to local development (process.env.NODE_ENV === 'development' on localhost).
   - On deployed production previews (e.g., Vercel), the role preview switcher is completely hidden and disabled. All users must authenticate through real Supabase Auth.

---

## 👑 How to Provision Mrs Sarah's Owner Account in Supabase

Because public signups can never create an owner account, Mrs Sarah's administrative account must be provisioned directly via Supabase.

### Recommended Method (Supabase Dashboard + SQL):

1. **Create Mrs Sarah's User in Supabase Auth**:
   - Go to your [Supabase Project Dashboard](https://app.supabase.com).
   - Navigate to **Authentication** -> **Users**.
   - Click **Add user** -> **Create user**.
   - Enter Mrs Sarah's email: sarahoakhena@gmail.com (or your preferred administrative email).
   - Set a strong password.
   - Ensure **Auto Confirm User?** is checked (**Yes**), then click **Create user**.

2. **Promote to Owner and Link Tutor Profile**:
   - Open the **SQL Editor** in your Supabase Dashboard.
   - Run the script in [supabase/seed_owner.sql](./supabase/seed_owner.sql):
     `sql
     DO 
     DECLARE
         target_email TEXT := 'sarahoakhena@gmail.com';
         user_id UUID;
     BEGIN
         SELECT id INTO user_id FROM auth.users WHERE email = target_email LIMIT 1;
         IF user_id IS NULL THEN
             RAISE NOTICE 'No user found with email %', target_email;
         ELSE
             INSERT INTO public.profiles (id, role, full_name, email, phone, updated_at)
             VALUES (user_id, 'owner', 'Mrs Sarah Oakhena', target_email, '09133651659', now())
             ON CONFLICT (id) DO UPDATE SET role = 'owner', full_name = 'Mrs Sarah Oakhena';

             INSERT INTO public.tutors (profile_id, headline, bio, credentials)
             VALUES (
                 user_id,
                 'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
                 'Montessori-trained early years tutor specialising in ages 3–8.',
                 'Montessori Early Childhood Diploma | Certified SEN Specialist'
             )
             ON CONFLICT (profile_id) DO NOTHING;
         END IF;
     END ;
     `

3. **Verify Sign-In**:
   - Navigate to your deployed app or http://localhost:3000/login.
   - Log in with sarahoakhena@gmail.com and the password you set.
   - You will be redirected to Sarah's Owner Administration Hub (/app) with full access to the Student Directory, Milestone Tracking, Resource Library, Enquiry Inbox, Invoices, and Messages.

---

## 🗂️ Platform Routes (Zero 404s Guaranteed)

| Route | Parent Portal View | Owner Hub (Mrs Sarah) View |
|---|---|---|
| / | Public Educator Website | Public Educator Website |
| /login | Unified Sign In | Unified Sign In |
| /signup | Parent Account Registration | N/A (Parents only) |
| /app | Family Dashboard Overview | Tutor Operational Overview |
| /app/children | My Children (Add/Edit child) | Student Directory (All children) |
| /app/schedule | Book Session & Upcoming Slots | Schedule, Slots & Calendar |
| /app/milestones | Child Milestones (Montessori areas) | Milestone Assessment & Tracking |
| /app/resources | Learning Resources & Downloads | Resource Library & Content Upload |
| /app/invoices | Invoices, Receipts & Bank Details | Invoices & Manual Payment Records |
| /app/messages | Message Mrs Sarah directly | Parent Communications Thread |
| /app/enquiries | N/A | Public Enquiries Inbox & Triage |

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   `ash
   git clone <repo-url>
   cd EYT-academy/nextjs
   `

2. **Install dependencies**:
   `ash
   npm install
   `

3. **Set environment variables**:
   Create 
extjs/.env.local:
   `env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   `

4. **Run migrations**:
   In your Supabase SQL Editor, run:
   - supabase/migrations/20260904000000_eyt_schema.sql (Creates tables, enums, RLS policies, and Montessori milestone seeds)
   - supabase/migrations/20260904000001_eyt_storage.sql (Configures resource storage buckets and policies)
   - supabase/seed_owner.sql (Provisions owner profile)

5. **Start development server**:
   `ash
   npm run dev
   `
   Open [http://localhost:3000](http://localhost:3000).

---

## 📱 PWA Features & Offline Support

- **Web App Manifest**: Configured in /nextjs/public/manifest.json with Montessori brand themes, stand-alone display mode, and custom icons.
- **Service Worker**: Cache-first strategy for static assets and offline fallback in /nextjs/public/sw.js and /nextjs/public/offline.html.
- **Install Prompts**: Automatic iOS installation guide and native eforeinstallprompt support across mobile and desktop browsers.

---

## 📄 License
Private and confidential. Built for Mrs Sarah Early Years Tutoring Platform.
